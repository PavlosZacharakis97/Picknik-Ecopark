function bookingForm(cottageId, pricePerNight) {
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
            <div class="form-group full">
                <label>Примечания</label>
                <textarea name="notes" rows="2" placeholder="Особые пожелания...">${draft.notes || ""}</textarea>
            </div>
            <div class="form-group full">
                <div class="price-display" id="price-box">
                    <div class="price" id="price-total">0 Kč</div>
                    <div class="price-period">Выберите даты для расчёта</div>
                </div>
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
    priceBox.querySelector(".price-period").textContent =
      `${result.nights} ночей · ${result.guests} гостей` +
      (result.discount > 0
        ? ` · Скидка ${result.discount.toLocaleString()} Kč`
        : "");
  } catch (err) {
    priceTotal.textContent = "—";
    priceBox.querySelector(".price-period").textContent = err.message;
  }
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
    alert("✅ " + result.message);
    navigate("/cabinet/bookings");
  } catch (err) {
    alert("❌ " + err.message);
  }
}
