function bookingForm(cottageId, pricePerNight, isGuest = false, userBalance = 0) {
  const draft = getBookingDraft() || {};

  return `
        <form class="booking-form-grid" onsubmit="handleBookingSubmit(event, ${cottageId}, ${pricePerNight})">
            <div class="form-group">
                <label>Заезд</label>
                <input type="date" name="check_in" required
                       value="${draft.checkIn || ""}"
                       min="${new Date().toISOString().split("T")[0]}"
                       onchange="calcPrice(${cottageId}, ${pricePerNight})">
            </div>
            <div class="form-group">
                <label>Выезд</label>
                <input type="date" name="check_out" required
                       value="${draft.checkOut || ""}"
                       onchange="calcPrice(${cottageId}, ${pricePerNight})">
            </div>
            <div class="form-group">
                <label>Гостей-Lohov</label>
                <select name="guests" onchange="calcPrice(${cottageId}, ${pricePerNight})">
                    ${[1, 2, 3, 4, 5, 6, 7, 8]
                      .map(
                        (n) =>
                          `<option value="${n}" ${draft.guests == n ? "selected" : ""}>${n} чел.</option>`,
                      )
                      .join("")}
                </select>
            </div>
            <div class="form-group">
                <label>Промокод</label>
                <input type="text" name="promo_code" placeholder="PIKNIK10"
                       value="${draft.promoCode || ""}"
                       onchange="calcPrice(${cottageId}, ${pricePerNight})">
            </div>
            ${isGuest ? `
            <div class="form-group full phone-step" id="phone-step">
                <label>Номер телефона</label>
                <div class="phone-row">
                    <input type="tel" id="phone-input" placeholder="+7 999 123-45-67">
                    <button type="button" class="btn btn-sm" onclick="handleSendSmsCode(event)">Отправить SMS-код</button>
                </div>
            </div>
            ` : ''}
            ${!isGuest && userBalance > 0 ? `
            <div class="form-group full balance-usage">
                <div>
                    <label>Списать с баланса</label>
                    <div style="font-size:12px;color:var(--text-light);">Доступно: ${userBalance.toLocaleString()} руб</div>
                </div>
                <input type="number" name="balance_amount_used" min="0" max="${userBalance}" value="0"
                       onchange="calcPrice(${cottageId}, ${pricePerNight})">
            </div>
            ` : ''}
            <div class="form-group full">
                <label>Примечания</label>
                <textarea name="notes" rows="2" placeholder="Особые пожелания...">${draft.notes || ""}</textarea>
            </div>
            <div class="form-group full">
                <div class="price-display" id="price-box">
                    <div class="price" id="price-total">0 Kč</div>
                    <div class="price-period">Выберите даты для расчёта</div>
                </div>
                ${isGuest ? `
                <div class="payment-icons">
                    <span>Оплата:</span>
                    <span class="icon-badge">VISA</span>
                    <span class="icon-badge">Mastercard</span>
                    <span class="icon-badge">QIWI</span>
                </div>
                ` : ''}
            </div>
            <div class="form-group full">
                <button type="submit" class="btn btn-block">Забронировать</button>
            </div>
        </form>
    `;
}

async function calcPrice(cottageId, pricePerNight) {
  const form = document.querySelector(".booking-form-grid");
  if (!form) return;

  const checkIn = form.check_in.value;
  const checkOut = form.check_out.value;
  const guests = parseInt(form.guests.value) || 1;
  const promo = form.promo_code.value;

  if (!checkIn || !checkOut) return;

  const priceBox = document.getElementById("price-box");
  const priceTotal = document.getElementById("price-total");

  try {
    const result = await calculatePrice({
      cottage_id: cottageId,
      check_in: checkIn,
      check_out: checkOut,
      guests: guests,
      promo_code: promo,
    });
    priceTotal.textContent = result.total_price.toLocaleString() + " Kč";

    let periodText = `${result.nights} ночей · ${result.guests} гостей` +
      (result.discount > 0
        ? ` · Скидка ${result.discount.toLocaleString()} Kč`
        : "");

    if (form.balance_amount_used) {
      const used = Math.min(parseFloat(form.balance_amount_used.value) || 0, result.total_price);
      if (used > 0) {
        periodText += ` · С баланса: ${used.toLocaleString()} Kč · Картой: ${(result.total_price - used).toLocaleString()} Kč`;
      }
    }

    priceBox.querySelector(".price-period").textContent = periodText;
  } catch (err) {
    priceTotal.textContent = "—";
    priceBox.querySelector(".price-period").textContent = err.message;
  }
}

async function handleSendSmsCode(event) {
  event.preventDefault();
  const phoneInput = document.getElementById("phone-input");
  const phone = phoneInput.value.trim();
  if (!phone) {
    alert("Укажите номер телефона");
    return;
  }

  try {
    await sendPhoneCode({ phone_number: phone });
    renderCodeStep(phone);
  } catch (err) {
    alert("❌ " + err.message);
  }
}

function renderCodeStep(phone) {
  const step = document.getElementById("phone-step");
  step.innerHTML = `
        <label>Код из SMS</label>
        <div style="font-size:13px;color:var(--text-light);margin-bottom:8px;">Отправлен на ${phone}</div>
        <div class="code-inputs">
            ${[0, 1, 2, 3].map((i) => `<input type="text" maxlength="1" class="code-digit" data-index="${i}">`).join("")}
        </div>
        <div style="display:flex;gap:8px;">
            <button type="button" class="btn btn-outline btn-sm" onclick="handleCancelPhoneStep()">Отмена</button>
            <button type="button" class="btn btn-sm" onclick="handleVerifyCode(event, '${phone}')">Подтвердить</button>
        </div>
    `;

  const digitInputs = step.querySelectorAll(".code-digit");
  digitInputs.forEach((input, i) => {
    input.addEventListener("input", () => {
      if (input.value && digitInputs[i + 1]) digitInputs[i + 1].focus();
    });
  });
  if (digitInputs[0]) digitInputs[0].focus();
}

async function handleVerifyCode(event, phone) {
  event.preventDefault();
  const digits = Array.from(document.querySelectorAll(".code-digit")).map((i) => i.value).join("");
  if (digits.length < 4) {
    alert("Введите код целиком");
    return;
  }

  try {
    await verifyPhoneCode({ phone_number: phone, code: digits });
    const step = document.getElementById("phone-step");
    step.innerHTML = `
            <div class="alert alert-success" style="margin:0;">✅ Телефон подтверждён: ${phone}</div>
            <input type="hidden" name="phone_number" value="${phone}">
            <input type="hidden" name="verification_code" value="${digits}">
        `;
  } catch (err) {
    alert("❌ " + err.message);
  }
}

function handleCancelPhoneStep() {
  const step = document.getElementById("phone-step");
  step.innerHTML = `
        <label>Номер телефона</label>
        <div class="phone-row">
            <input type="tel" id="phone-input" placeholder="+7 999 123-45-67">
            <button type="button" class="btn btn-sm" onclick="handleSendSmsCode(event)">Отправить SMS-код</button>
        </div>
    `;
}

async function handleBookingSubmit(e, cottageId, pricePerNight) {
  e.preventDefault();
  const form = e.target;
  const data = {
    cottage: cottageId,
    check_in: form.check_in.value,
    check_out: form.check_out.value,
    guests: parseInt(form.guests.value),
    promo_code: form.promo_code.value,
    notes: form.notes.value,
  };

  if (form.phone_number) data.phone_number = form.phone_number.value;
  if (form.verification_code) data.verification_code = form.verification_code.value;
  if (form.balance_amount_used) data.balance_amount_used = parseFloat(form.balance_amount_used.value) || 0;

  saveBookingDraft({
    cottageId,
    checkIn: data.check_in,
    checkOut: data.check_out,
    guests: data.guests,
    promoCode: data.promo_code,
    notes: data.notes,
  });

  try {
    const result = await createBooking(data);
    clearBookingDraft();
    if (result.user) setStorage("user", result.user);
    alert("✅ " + result.message);
    navigate("/cabinet/bookings");
  } catch (err) {
    alert("❌ " + err.message);
  }
}
