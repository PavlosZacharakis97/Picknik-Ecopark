let calState = null;

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function fetchOccupiedDates(cottageId) {
  try {
    const res = await getCottageCalendar(cottageId);
    return res.occupied_dates || [];
  } catch (err) {
    return [];
  }
}

async function loadBookingCalendar(cottageId, pricePerNight, draft = {}) {
  const today = new Date();
  const occupiedDates = await fetchOccupiedDates(cottageId);

  calState = {
    cottageId,
    pricePerNight,
    occupied: new Set(occupiedDates),
    todayISO: toISODate(today),
    baseYear: today.getFullYear(),
    baseMonth: today.getMonth(),
    viewYear: today.getFullYear(),
    viewMonth: today.getMonth(),
    checkIn: draft.checkIn || null,
    checkOut: draft.checkOut || null,
    readOnly: false,
    containerId: 'booking-calendar',
  };
}

function renderBookingCalendar() {
  if (!calState) return '';
  return `
        <div class="form-group full">
            <label>${t('booking_dates_label')}</label>
            <div class="booking-calendar" id="booking-calendar">
                ${renderCalendarMonthHtml()}
            </div>
            <input type="hidden" name="check_in" value="${calState.checkIn || ''}">
            <input type="hidden" name="check_out" value="${calState.checkOut || ''}">
        </div>
    `;
}

async function loadAvailabilityCalendar(cottageId) {
  const today = new Date();
  const occupiedDates = await fetchOccupiedDates(cottageId);

  calState = {
    cottageId,
    pricePerNight: null,
    occupied: new Set(occupiedDates),
    todayISO: toISODate(today),
    baseYear: today.getFullYear(),
    baseMonth: today.getMonth(),
    viewYear: today.getFullYear(),
    viewMonth: today.getMonth(),
    checkIn: null,
    checkOut: null,
    readOnly: true,
    containerId: 'availability-calendar',
  };
}

function renderAvailabilityCalendar() {
  if (!calState) return '';
  return `
        <div class="booking-calendar" id="availability-calendar">
            ${renderCalendarMonthHtml()}
        </div>
    `;
}

function calendarSelectionText() {
  if (calState.checkIn && calState.checkOut) return t('cal_checkin_checkout', { date1: calState.checkIn, date2: calState.checkOut });
  if (calState.checkIn) return t('cal_checkin_only', { date: calState.checkIn });
  return t('cal_select_prompt');
}

function renderCalendarMonthHtml() {
  const { viewYear, viewMonth, todayISO } = calState;
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startOffset = (firstOfMonth.getDay() + 6) % 7;

  let cells = '';
  for (let i = 0; i < startOffset; i++) {
    cells += '<span class="cal-day cal-day--empty"></span>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toISODate(new Date(viewYear, viewMonth, day));
    const unavailable = iso < todayISO || calState.occupied.has(iso);
    const disabled = unavailable || calState.readOnly;

    let stateClass = unavailable ? ' cal-day--disabled' : '';
    if (!calState.readOnly) {
      if (calState.checkIn && iso === calState.checkIn) stateClass += ' cal-day--start';
      if (calState.checkOut && iso === calState.checkOut) stateClass += ' cal-day--end';
      if (calState.checkIn && calState.checkOut && iso > calState.checkIn && iso < calState.checkOut) stateClass += ' cal-day--in-range';
    }

    cells += `<button type="button" class="cal-day${stateClass}"
        ${disabled ? 'disabled' : `onclick="handleCalDayClick('${iso}')"`}>${day}</button>`;
  }

  const canGoPrev = !(viewYear === calState.baseYear && viewMonth === calState.baseMonth);
  const legend = `<div class="cal-legend"><span class="cal-swatch"></span> ${t('cal_legend')}</div>`;
  const footer = calState.readOnly
    ? legend
    : `${legend}<div class="cal-selection">${calendarSelectionText()}</div>`;

  return `
        <div class="cal-header">
            <button type="button" class="cal-nav" onclick="handleCalNav(-1)" ${canGoPrev ? '' : 'disabled'}>‹</button>
            <span class="cal-month-label">${tMonths()[viewMonth]} ${viewYear}</span>
            <button type="button" class="cal-nav" onclick="handleCalNav(1)">›</button>
        </div>
        <div class="cal-weekdays">${tWeekdays().map((w) => `<span>${w}</span>`).join('')}</div>
        <div class="cal-grid">${cells}</div>
        ${footer}
    `;
}

function handleCalNav(delta) {
  let month = calState.viewMonth + delta;
  let year = calState.viewYear;
  if (month < 0) { month = 11; year -= 1; }
  if (month > 11) { month = 0; year += 1; }
  calState.viewMonth = month;
  calState.viewYear = year;

  const container = document.getElementById(calState.containerId);
  if (container) container.innerHTML = renderCalendarMonthHtml();
}

function handleCalDayClick(iso) {
  if (!calState || calState.readOnly) return;

  if (!calState.checkIn || calState.checkOut || iso <= calState.checkIn) {
    calState.checkIn = iso;
    calState.checkOut = null;
  } else {
    let day = new Date(calState.checkIn);
    day.setDate(day.getDate() + 1);
    const end = new Date(iso);
    let hasOccupiedBetween = false;
    while (day < end) {
      if (calState.occupied.has(toISODate(day))) { hasOccupiedBetween = true; break; }
      day.setDate(day.getDate() + 1);
    }
    if (hasOccupiedBetween) {
      calState.checkIn = iso;
      calState.checkOut = null;
    } else {
      calState.checkOut = iso;
    }
  }

  const checkInInput = document.querySelector('input[name="check_in"]');
  const checkOutInput = document.querySelector('input[name="check_out"]');
  if (checkInInput) checkInInput.value = calState.checkIn || '';
  if (checkOutInput) checkOutInput.value = calState.checkOut || '';

  const container = document.getElementById(calState.containerId);
  if (container) container.innerHTML = renderCalendarMonthHtml();

  if (calState.checkIn && calState.checkOut) {
    calcPrice(calState.cottageId, calState.pricePerNight);
  }
}
