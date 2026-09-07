async function bookingForm(cottageId, pricePerNight, isGuest = false, userBalance = 0, maxGuests = 8) {
  const draft = getBookingDraft() || {};
  await loadBookingCalendar(cottageId, pricePerNight, { checkIn: draft.checkIn, checkOut: draft.checkOut });

  const initialGuests = Math.min(Math.max(parseInt(draft.guests, 10) || 1, 1), maxGuests);

  return `
        <form class="booking-form-grid" onsubmit="handleBookingSubmit(event, ${cottageId}, ${pricePerNight})">
            ${renderBookingCalendar()}
            <div class="form-group">
                <label>${t('guests_label')}</label>
                ${renderGuestsPicker(cottageId, pricePerNight, maxGuests, initialGuests)}
            </div>
            <div class="form-group">
                <label>${t('promo_label')}</label>
                <input type="text" name="promo_code" placeholder="PIKNIK10"
                       value="${draft.promoCode || ""}"
                       onchange="calcPrice(${cottageId}, ${pricePerNight})">
            </div>
            ${isGuest ? `
            <div class="form-group full phone-step" id="phone-step">
                <label>${t('phone_label')}</label>
                <div class="phone-row">
                    <input type="tel" id="phone-input" placeholder="+123 456 789">
                    <button type="button" class="btn btn-sm" onclick="handleSendSmsCode(event)">${t('send_sms_btn')}</button>
                </div>
            </div>
            ` : ''}
            ${!isGuest && userBalance > 0 ? `
            <div class="form-group full balance-usage">
                <div>
                    <label>${t('balance_use_label')}</label>
                    <div style="font-size:12px;color:var(--text-light);">${t('balance_available', { amount: userBalance.toLocaleString() })}</div>
                </div>
                <input type="number" name="balance_amount_used" min="0" max="${userBalance}" value="0"
                       onchange="calcPrice(${cottageId}, ${pricePerNight})">
            </div>
            ` : ''}
            <div class="form-group full">
                <label>${t('notes_label')}</label>
                <textarea name="notes" rows="2" placeholder="${t('notes_placeholder')}">${draft.notes || ""}</textarea>
            </div>
            <div class="form-group full">
                <div class="price-display" id="price-box">
                    <div class="price" id="price-total">0 Kč</div>
                    <div class="price-period">${t('select_dates_prompt')}</div>
                </div>
                ${isGuest ? `
                <div class="payment-icons">
                    <span>${t('payment_label')}</span>
                    <span class="icon-badge">VISA</span>
                    <span class="icon-badge">Mastercard</span>
                    <span class="icon-badge">QIWI</span>
                </div>
                ` : ''}
            </div>
            <div class="form-group full">
                <button type="submit" class="btn btn-block">${t('book_button')}</button>
            </div>
        </form>
    `;
}

let guestsPickerState = null;

function renderGuestsPicker(cottageId, pricePerNight, maxGuests, selected) {
  guestsPickerState = { cottageId, pricePerNight, maxGuests, selected, open: false };
  return `<div class="guests-picker" id="guests-picker">${guestsPickerInnerHtml()}</div>`;
}

function guestsPickerInnerHtml() {
  const { maxGuests, selected, open } = guestsPickerState;
  const options = Array.from({ length: maxGuests }, (_, i) => i + 1);

  return `
        <button type="button" class="guests-picker-trigger" onclick="toggleGuestsPicker(event)" aria-expanded="${open}">
            <span class="guests-picker-icon">${icon('people', 18)}</span>
            <span>${selected} ${t('guests_unit')}</span>
            <span class="guests-picker-chevron${open ? ' open' : ''}">${icon('chevron-down', 16)}</span>
        </button>
        <input type="hidden" name="guests" value="${selected}">
        <div class="guests-picker-menu${open ? ' open' : ''}" role="listbox">
            ${options
              .map(
                (n) => `
                <button type="button" class="guests-picker-option${n === selected ? ' active' : ''}" role="option" onclick="selectGuestsOption(${n})">
                    ${n} ${t('guests_unit')}
                </button>
            `,
              )
              .join('')}
        </div>
    `;
}

function toggleGuestsPicker(event) {
  event.stopPropagation();
  if (!guestsPickerState) return;
  guestsPickerState.open = !guestsPickerState.open;
  const el = document.getElementById('guests-picker');
  if (el) el.innerHTML = guestsPickerInnerHtml();
}

function selectGuestsOption(n) {
  if (!guestsPickerState) return;
  guestsPickerState.selected = n;
  guestsPickerState.open = false;
  const el = document.getElementById('guests-picker');
  if (el) el.innerHTML = guestsPickerInnerHtml();
  calcPrice(guestsPickerState.cottageId, guestsPickerState.pricePerNight);
}

document.addEventListener('click', (event) => {
  if (!guestsPickerState || !guestsPickerState.open) return;
  if (event.target.closest('#guests-picker')) return;
  guestsPickerState.open = false;
  const el = document.getElementById('guests-picker');
  if (el) el.innerHTML = guestsPickerInnerHtml();
});

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

    let periodText = `${t('price_nights', { n: result.nights })} · ${t('price_guests', { n: result.guests })}` +
      (result.discount > 0
        ? ` · ${t('price_discount', { amount: result.discount.toLocaleString() })}`
        : "");

    if (form.balance_amount_used) {
      const used = Math.min(parseFloat(form.balance_amount_used.value) || 0, result.total_price);
      if (used > 0) {
        periodText += ` · ${t('price_from_balance', { amount: used.toLocaleString() })} · ${t('price_by_card', { amount: (result.total_price - used).toLocaleString() })}`;
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
    toastError(t('enter_phone_alert'));
    return;
  }

  try {
    await sendPhoneCode({ phone_number: phone });
    renderCodeStep(phone);
  } catch (err) {
    toastError(err.message);
  }
}

function renderCodeStep(phone) {
  const step = document.getElementById("phone-step");
  step.innerHTML = `
        <label>${t('sms_code_label')}</label>
        <div style="font-size:13px;color:var(--text-light);margin-bottom:8px;">${t('sms_sent_to', { phone })}</div>
        <div class="code-inputs">
            ${[0, 1, 2, 3].map((i) => `<input type="text" maxlength="1" class="code-digit" data-index="${i}">`).join("")}
        </div>
        <div style="display:flex;gap:8px;">
            <button type="button" class="btn btn-outline btn-sm" onclick="handleCancelPhoneStep()">${t('cancel_btn')}</button>
            <button type="button" class="btn btn-sm" onclick="handleVerifyCode(event, '${phone}')">${t('confirm_btn')}</button>
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
    toastError(t('enter_full_code_alert'));
    return;
  }

  try {
    await verifyPhoneCode({ phone_number: phone, code: digits });
    const step = document.getElementById("phone-step");
    step.innerHTML = `
            <div class="alert alert-success" style="margin:0;">${t('phone_confirmed', { phone })}</div>
            <input type="hidden" name="phone_number" value="${phone}">
            <input type="hidden" name="verification_code" value="${digits}">
        `;
  } catch (err) {
    toastError(err.message);
  }
}

function handleCancelPhoneStep() {
  const step = document.getElementById("phone-step");
  step.innerHTML = `
        <label>${t('phone_label')}</label>
        <div class="phone-row">
            <input type="tel" id="phone-input" placeholder="+123 456 789">
            <button type="button" class="btn btn-sm" onclick="handleSendSmsCode(event)">${t('send_sms_btn')}</button>
        </div>
    `;
}

async function handleBookingSubmit(e, cottageId, pricePerNight) {
  e.preventDefault();
  const form = e.target;

  if (!form.check_in.value || !form.check_out.value) {
    toastError(t('select_dates_alert'));
    return;
  }

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
    toastSuccess(result.message);
    navigate("/cabinet/bookings");
  } catch (err) {
    toastError(err.message);
  }
}
