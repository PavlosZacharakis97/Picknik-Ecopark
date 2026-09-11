function cabinetLayout(activeSection, contentHtml, { extraClass = '', extraStyle = '' } = {}) {
  return `
        <div class="cabinet-page">
            <div class="container">
                <div class="cabinet-grid">
                    ${cabinetSidebar(activeSection)}
                    <div class="cabinet-content${extraClass}"${extraStyle ? ` style="${extraStyle}"` : ''}>${contentHtml}</div>
                </div>
            </div>
        </div>
    `;
}

async function renderCabinet(section) {
  try {
    let content;
    switch (section) {
      case "bookings":
        content = await renderCabinetBookings();
        break;
      case "balance":
        content = await renderCabinetBalance();
        break;
      case "referrals":
        content = await renderCabinetReferrals();
        break;
      case "transactions":
        content = await renderCabinetTransactions();
        break;
      case "tasks":
        content = await renderCabinetTasks();
        break;
      default:
        content = await renderCabinetProfile();
    }

    return cabinetLayout(section, content, { extraClass: section === 'balance' ? ' cabinet-content--balance' : '' });
  } catch (err) {
    return renderError(err.message);
  }
}

async function renderCabinetProfile() {
  const [profile, tips] = await Promise.all([authProfile(), getTips().catch(() => [])]);

  return `
        <h2 style="margin-bottom:24px;">${t('profile_title')}</h2>
        <form onsubmit="handleProfileUpdateSubmit(event)" novalidate>
            <div class="form-group">
                <label>${t('first_name_label')}</label>
                <input type="text" name="first_name" value="${profile.first_name || ""}">
            </div>
            <div class="form-group">
                <label>${t('last_name_label')}</label>
                <input type="text" name="last_name" value="${profile.last_name || ""}">
            </div>
            <div class="form-group">
                <label>${t('phone_label')}</label>
                <input type="tel" name="phone_number" value="${profile.phone_number || ""}">
            </div>
            <button type="submit" class="btn" style="margin-top:12px;">${t('save_btn')}</button>
        </form>

        <button type="button" class="btn btn-outline" style="margin-top:24px;" onclick="openPasswordModal()">${t('change_password_btn')}</button>

        <div style="margin-top:32px;">
            ${tipsCarousel(tips)}
        </div>

        <div class="modal-overlay hidden" id="password-modal-overlay" onclick="if(event.target===this) closePasswordModal();">
            <div class="modal">
                <button type="button" class="modal-close" onclick="closePasswordModal()" aria-label="${t('close')}">&times;</button>
                <h2>${t('password_change_title')}</h2>
                <form onsubmit="handlePasswordChangeSubmit(event)" autocomplete="off" novalidate>
                    <div class="form-group">
                        <label>${t('current_password_label')}</label>
                        <input type="password" name="old_password" required autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label>${t('new_password_label')}</label>
                        <input type="password" name="new_password" id="new_password_field" required minlength="6" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label>${t('confirm_new_password_label')}</label>
                        <input type="password" name="new_password_confirm" required minlength="6" autocomplete="new-password" data-pristine-equals="#new_password_field">
                    </div>
                    <button type="submit" class="btn btn-block" style="margin-top:12px;">${t('change_password_btn')}</button>
                </form>
            </div>
        </div>
    `;
}

function openPasswordModal() {
  const overlay = document.getElementById("password-modal-overlay");
  if (overlay) overlay.classList.remove("hidden");
}

function closePasswordModal() {
  const overlay = document.getElementById("password-modal-overlay");
  if (overlay) overlay.classList.add("hidden");
}

async function handleProfileUpdateSubmit(e) {
  e.preventDefault();
  if (!validateForm(e.target)) return;
  const data = Object.fromEntries(new FormData(e.target));
  try {
    const result = await updateProfile(data);
    const user = getStorage("user") || {};
    setStorage("user", { ...user, ...result });
    toastSuccess(t('profile_updated'));
  } catch (err) {
    toastError(err.message);
  }
}

async function handlePasswordChangeSubmit(e) {
  e.preventDefault();
  const form = e.target;
  if (!validateForm(form)) return;
  const data = Object.fromEntries(new FormData(form));
  try {
    await changePassword({ old_password: data.old_password, new_password: data.new_password });
    toastSuccess(t('password_changed_success'));
    form.reset();
    closePasswordModal();
  } catch (err) {
    toastError(err.message);
  }
}

async function renderCabinetBookings() {
  const bookings = await getBookings();

  if (bookings.length === 0) {
    return `<h2 style="margin-bottom:16px;">${t('my_bookings_title')}</h2><p style="color:var(--text-light);">${t('no_bookings')}</p>`;
  }

  return `
        <h2 style="margin-bottom:24px;">${t('my_bookings_title')}</h2>
        ${bookings
          .map(
            (b) => `
            <div class="booking-item" style="cursor:pointer;" onclick="navigate('/cabinet/bookings/${b.id}')">
                <div class="booking-info">
                    <h4>${t('cottage_number_label', { number: b.cottage_number, name: getBookingCottageName(b) })}</h4>
                    <p>${t('booking_summary', { checkIn: b.check_in, checkOut: b.check_out, guests: b.guests, price: parseFloat(b.total_price).toLocaleString() })}</p>
                </div>
                <div style="display:flex;align-items:center;gap:12px;">
                    <span class="booking-status status-${b.status}">${bookingStatusLabel(b.status)}</span>
                    ${["pending", "confirmed"].includes(b.status) ? `<button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); handleCancelBooking(${b.id})">${t('cancel_booking_btn')}</button>` : ""}
                </div>
            </div>
        `,
          )
          .join("")}
    `;
}

function bookingStatusLabel(status) {
  const labels = {
    pending: t('status_pending'),
    confirmed: t('status_confirmed'),
    paid: t('status_paid'),
    cancelled: t('status_cancelled'),
    completed: t('status_completed'),
  };
  return labels[status] || status;
}

async function renderBookingReceipt(id) {
  try {
    const bookings = await getBookings();
    const b = bookings.find((x) => String(x.id) === String(id));

    if (!b) {
      return cabinetLayout('bookings', `<p style="color:var(--text-light);">${t('booking_not_found')}</p>`);
    }

    const nights = Math.round((new Date(b.check_out) - new Date(b.check_in)) / 86400000);

    return cabinetLayout('bookings', `
                    <a href="#/cabinet/bookings" class="btn btn-sm btn-outline" style="margin-bottom:20px;display:inline-block;">${t('back_to_bookings')}</a>
                    <h2 style="margin-bottom:24px;">${t('receipt_title')}</h2>

                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
                        <h3>${t('cottage_number_label', { number: b.cottage_number, name: getBookingCottageName(b) })}</h3>
                        <span class="booking-status status-${b.status}">${bookingStatusLabel(b.status)}</span>
                    </div>

                    <div style="border:2px solid var(--border);border-radius:var(--radius-sm);padding:20px;margin-bottom:20px;">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div>
                                <p style="color:var(--text-light);font-size:13px;margin-bottom:4px;">${t('booking_dates_label')}</p>
                                <p style="font-weight:600;">${formatDate(b.check_in)} — ${formatDate(b.check_out)}</p>
                            </div>
                            <div>
                                <p style="color:var(--text-light);font-size:13px;margin-bottom:4px;">${t('guests_label')}</p>
                                <p style="font-weight:600;">${b.guests} ${t('guests_unit')}</p>
                            </div>
                            <div>
                                <p style="color:var(--text-light);font-size:13px;margin-bottom:4px;">${t('price_nights', { n: nights })}</p>
                            </div>
                            ${b.promo_code ? `
                            <div>
                                <p style="color:var(--text-light);font-size:13px;margin-bottom:4px;">${t('promo_label')}</p>
                                <p style="font-weight:600;">${b.promo_code}</p>
                            </div>
                            ` : ''}
                        </div>
                        ${b.notes ? `
                        <div style="margin-top:16px;">
                            <p style="color:var(--text-light);font-size:13px;margin-bottom:4px;">${t('notes_label')}</p>
                            <p>${b.notes}</p>
                        </div>
                        ` : ''}
                        <div style="display:flex;justify-content:flex-end;margin-top:16px;">
                            <a href="#/cottages/${b.cottage}" class="btn btn-sm btn-outline">${t('view_cottage_btn')}</a>
                        </div>
                    </div>

                    <div class="price-display price-display--clickable" onclick="navigate('/cabinet/bookings/${b.id}/pay')">
                        <div>
                            <div style="color:var(--text-light);font-size:14px;margin-bottom:6px;">${t('receipt_total_label')}</div>
                            <div class="price">${parseFloat(b.total_price).toLocaleString()} Kč</div>
                        </div>
                        <span class="btn btn-sm">${t('pay_for_booking_btn')}</span>
                    </div>

                    <p style="color:var(--text-light);font-size:13px;margin-top:16px;">${t('receipt_created_label')}: ${formatDateTime(b.created_at)}</p>
    `);
  } catch (err) {
    return renderError(err.message);
  }
}

async function renderBookingPayment(id) {
  try {
    const bookings = await getBookings();
    const b = bookings.find((x) => String(x.id) === String(id));

    if (!b) {
      return cabinetLayout('bookings', `<p style="color:var(--text-light);">${t('booking_not_found')}</p>`);
    }

    const amount = parseFloat(b.total_price).toLocaleString();

    return cabinetLayout('bookings', `
                    <a href="#/cabinet/bookings/${b.id}" class="btn btn-sm btn-outline" style="margin-bottom:20px;display:inline-block;">${t('back_to_receipt')}</a>
                    <h2 style="margin-bottom:8px;">${t('payment_page_title')}</h2>
                    <p style="color:var(--text-light);margin-bottom:24px;">${t('payment_page_subtitle')}</p>

                    <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg);border-radius:var(--radius-sm);padding:16px 20px;margin-bottom:24px;">
                        <div>
                            <p style="font-weight:600;">${t('cottage_number_label', { number: b.cottage_number, name: getBookingCottageName(b) })}</p>
                            <p style="color:var(--text-light);font-size:14px;">${formatDate(b.check_in)} — ${formatDate(b.check_out)}</p>
                        </div>
                        <div class="cottage-price">${amount} Kč</div>
                    </div>

                    <form onsubmit="event.preventDefault();" autocomplete="off">
                        <div class="form-row">
                            <div class="form-group">
                                <label>${t('first_name_label')}</label>
                                <input type="text" placeholder="${t('placeholder_first_name')}" autocomplete="off">
                            </div>
                            <div class="form-group">
                                <label>${t('last_name_label')}</label>
                                <input type="text" placeholder="${t('placeholder_last_name')}" autocomplete="off">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>${t('card_number_label')}</label>
                            <input type="text" inputmode="numeric" placeholder="1234 5678 9012 3456" maxlength="19" autocomplete="off">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>${t('card_expiry_label')}</label>
                                <input type="text" placeholder="MM/RR" maxlength="5" autocomplete="off">
                            </div>
                            <div class="form-group">
                                <label>${t('card_cvv_label')}</label>
                                <input type="text" inputmode="numeric" placeholder="123" maxlength="3" autocomplete="off">
                            </div>
                        </div>
                        <button type="button" class="btn btn-block btn-lg" style="margin-top:8px;">${t('pay_now_btn', { amount })}</button>
                    </form>
    `, { extraStyle: 'max-width:480px;' });
  } catch (err) {
    return renderError(err.message);
  }
}

async function handleCancelBooking(id) {
  const confirmed = await confirmDialog(t('confirm_cancel_booking'));
  if (!confirmed) return;
  try {
    await cancelBooking(id);
    render();
  } catch (err) {
    toastError(err.message);
  }
}

async function renderCabinetBalance() {
  const profile = await authProfile();
  const balance = parseFloat(profile.balance) || 0;

  return `
        <div style="position:relative;z-index:1;">
            <h2 style="margin-bottom:8px;">${t('balance_title')}</h2>
            <div style="font-family:var(--font-heading);font-size:48px;font-weight:700;color:var(--primary);margin-bottom:16px;">${balance.toLocaleString()} Kč</div>
            <p style="color:var(--text-light);max-width:420px;margin-bottom:8px;">${t('balance_note')}</p>
            <p style="color:var(--text-light);max-width:420px;margin-bottom:24px;font-size:13px;">${t('balance_notice')}</p>

            <form onsubmit="handleWithdrawalSubmit(event)" novalidate style="max-width:360px;">
                <div class="form-group">
                    <label>${t('withdrawal_method_label')}</label>
                    <select name="method">
                        <option value="visa" ${profile.payout_method === 'visa' ? 'selected' : ''}>Visa</option>
                        <option value="mastercard" ${profile.payout_method === 'mastercard' ? 'selected' : ''}>Mastercard</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>${t('card_last4_label')}</label>
                    <input type="text" name="card_last4" required minlength="4" maxlength="4" pattern="/^\\d{4}$/" inputmode="numeric" value="${profile.payout_card_last4 || ''}">
                </div>
                <div class="form-group">
                    <label>${t('withdrawal_amount_label')}</label>
                    <input type="number" name="amount" min="500" max="${balance}" step="0.01" required placeholder="0.00">
                </div>
                <button type="submit" class="btn">${t('confirm_withdrawal_btn')}</button>
            </form>
        </div>
    `;
}

async function handleWithdrawalSubmit(e) {
  e.preventDefault();
  if (!validateForm(e.target)) return;
  const data = Object.fromEntries(new FormData(e.target));
  try {
    await createWithdrawal(data);
    toastSuccess(t('withdrawal_created'));
    render();
  } catch (err) {
    toastError(err.message);
  }
}

async function renderCabinetReferrals() {
  const info = await getReferralInfo();
  const link = `${window.location.origin}${window.location.pathname}#/register?ref=${info.referral_code}`;

  return `
        <div style="display:grid;grid-template-columns:1fr 220px;gap:32px;">
            <div>
                <h2 style="margin-bottom:8px;">${t('referral_link_title')}</h2>
                <p style="color:var(--text-light);margin-bottom:16px;">${t('referral_text')}</p>
                <div style="display:flex;gap:12px;margin-bottom:32px;">
                    <input type="text" readonly value="${link}" style="flex:1;">
                    <button class="btn btn-outline" onclick="handleCopyReferralLink('${link}')">${t('copy_btn')}</button>
                </div>
                <h2 style="margin-bottom:8px;">${t('promo_for_referral_title')}</h2>
                <p style="color:var(--text-light);margin-bottom:16px;">${t('promo_for_referral_text')}</p>
                <div style="display:flex;gap:12px;margin-bottom:32px;">
                    <input type="text" readonly value="${info.referral_code}" style="flex:1;">
                    <button class="btn btn-outline" onclick="handleCopyReferralLink('${info.referral_code}')">${t('copy_btn')}</button>
                </div>
                <div style="display:flex;gap:32px;">
                    <div>
                        <div style="font-family:var(--font-heading);font-size:24px;font-weight:700;">${info.referrals_count}</div>
                        <div style="color:var(--text-light);font-size:13px;">${t('referrals_count_label')}</div>
                    </div>
                    <div>
                        <div style="font-family:var(--font-heading);font-size:24px;font-weight:700;">${parseFloat(info.total_earned).toLocaleString()} Kč</div>
                        <div style="color:var(--text-light);font-size:13px;">${t('earned_label')}</div>
                    </div>
                </div>
            </div>
            <div>
                <img src="/static/assets/images/illustration-referral.png" alt="" style="width:100%;">
            </div>
        </div>
    `;
}

function handleCopyReferralLink(value) {
  navigator.clipboard
    .writeText(value)
    .then(() => toastSuccess(t('copied')))
    .catch(() => toastError(t('copy_failed')));
}

async function renderCabinetTransactions() {
  const page = await getTransactions({ ordering: "-created_at" });
  const transactions = page.results || page;

  return `
        <h2 style="margin-bottom:24px;">${t('transactions_title')}</h2>
        <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
            <a class="btn btn-outline btn-sm" href="${transactionsExportUrl()}" target="_blank">${t('export_excel')}</a>
        </div>
        ${
          transactions.length === 0
            ? `<p style="color:var(--text-light);">${t('no_transactions')}</p>`
            : transactions
                .map(
                  (tx) => `
            <div class="booking-item">
                <div class="booking-info">
                    <h4>${tx.type_display}</h4>
                    <p>${formatDateTime(tx.created_at)}</p>
                </div>
                <div style="display:flex;align-items:center;gap:12px;">
                    <span style="font-weight:700;">${tx.amount >= 0 ? "+" : ""}${parseFloat(tx.amount).toLocaleString()} Kč</span>
                    <span class="booking-status status-${tx.status === "rejected" ? "cancelled" : tx.status}">${tx.status_display}</span>
                </div>
            </div>
        `,
                )
                .join("")
        }
    `;
}

async function renderCabinetTasks() {
  const [tasks, submissions] = await Promise.all([getTasks(), getTaskSubmissions()]);

  return `
        <h2 style="margin-bottom:24px;">${t('earnings_title')}</h2>
        ${
          tasks.length === 0
            ? `<p style="color:var(--text-light);">${t('no_tasks')}</p>`
            : tasks
                .map(
                  (task) => `
            <div class="booking-item">
                <div class="booking-info">
                    <h4>${task.title}</h4>
                    <p>${task.platform_display} · ${t('reward_range', { min: parseFloat(task.reward_min).toLocaleString(), max: parseFloat(task.reward_max).toLocaleString() })}</p>
                </div>
                <button class="btn btn-sm" onclick="handleOpenTaskSubmitForm(${task.id})">${t('do_task_btn')}</button>
            </div>
            <div id="task-submit-form-${task.id}"></div>
        `,
                )
                .join("")
        }

        <h3 style="margin:32px 0 16px;">${t('my_submissions_title')}</h3>
        ${
          submissions.length === 0
            ? `<p style="color:var(--text-light);">${t('no_submissions')}</p>`
            : submissions
                .map(
                  (s) => `
            <div class="booking-item">
                <div class="booking-info">
                    <h4>${s.task_title}</h4>
                    <p>${s.submitted_link}</p>
                </div>
                <span class="booking-status status-${s.status === "approved" ? "confirmed" : s.status === "rejected" ? "cancelled" : "pending"}">${s.status_display}</span>
            </div>
        `,
                )
                .join("")
        }
    `;
}

function handleOpenTaskSubmitForm(taskId) {
  const container = document.getElementById(`task-submit-form-${taskId}`);
  if (!container) return;
  container.innerHTML = `
        <form onsubmit="handleTaskSubmissionSubmit(event, ${taskId})" style="margin:12px 0 24px;padding:16px;background:rgba(122,158,126,0.06);border-radius:var(--radius-sm);">
            <div class="form-group">
                <label>${t('platform_label')}</label>
                <select name="platform">
                    <option value="vk">VK</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                </select>
            </div>
            <div class="form-group">
                <label>${t('submission_link_label')}</label>
                <input type="url" name="submitted_link" required placeholder="https://...">
            </div>
            <button type="submit" class="btn btn-sm">${t('submit_for_review_btn')}</button>
        </form>
    `;
}

async function handleTaskSubmissionSubmit(e, taskId) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  data.task = taskId;
  try {
    await createTaskSubmission(data);
    toastSuccess(t('submission_sent'));
    render();
  } catch (err) {
    toastError(err.message);
  }
}
