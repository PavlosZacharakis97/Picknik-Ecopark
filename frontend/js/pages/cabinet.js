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

    return `
            <div class="container">
                <div style="display:grid;grid-template-columns:280px 1fr;gap:24px;align-items:start;">
                    ${cabinetSidebar(section)}
                    <div class="cabinet-content">${content}</div>
                </div>
            </div>
        `;
  } catch (err) {
    return renderError(err.message);
  }
}

async function renderCabinetProfile() {
  const [profile, tips] = await Promise.all([authProfile(), getTips().catch(() => [])]);

  return `
        <h2 style="margin-bottom:24px;">Профиль</h2>
        <form onsubmit="handleProfileUpdateSubmit(event)">
            <div class="form-group">
                <label>Имя</label>
                <input type="text" name="first_name" value="${profile.first_name || ""}">
            </div>
            <div class="form-group">
                <label>Фамилия</label>
                <input type="text" name="last_name" value="${profile.last_name || ""}">
            </div>
            <div class="form-group">
                <label>Телефон</label>
                <input type="tel" name="phone_number" value="${profile.phone_number || ""}">
            </div>
            <button type="submit" class="btn" style="margin-top:12px;">Сохранить</button>
        </form>
        <div style="margin-top:32px;">
            ${tipsCarousel(tips)}
        </div>
    `;
}

async function handleProfileUpdateSubmit(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    const result = await updateProfile(data);
    const user = getStorage("user") || {};
    setStorage("user", { ...user, ...result });
    alert("✅ Профиль обновлён");
  } catch (err) {
    alert("❌ " + err.message);
  }
}

async function renderCabinetBookings() {
  const bookings = await getBookings();

  if (bookings.length === 0) {
    return `<h2 style="margin-bottom:16px;">Мои брони</h2><p style="color:var(--text-light);">У вас пока нет бронирований.</p>`;
  }

  return `
        <h2 style="margin-bottom:24px;">Мои брони</h2>
        ${bookings
          .map(
            (b) => `
            <div class="booking-item">
                <div class="booking-info">
                    <h4>Домик №${b.cottage_number} — ${b.cottage_name}</h4>
                    <p>${b.check_in} — ${b.check_out} · ${b.guests} гостей · ${parseFloat(b.total_price).toLocaleString()} Kč</p>
                </div>
                <div style="display:flex;align-items:center;gap:12px;">
                    <span class="booking-status status-${b.status}">${bookingStatusLabel(b.status)}</span>
                    ${["pending", "confirmed"].includes(b.status) ? `<button class="btn btn-outline btn-sm" onclick="handleCancelBooking(${b.id})">Отменить</button>` : ""}
                </div>
            </div>
        `,
          )
          .join("")}
    `;
}

function bookingStatusLabel(status) {
  const labels = {
    pending: "Ожидает подтверждения",
    confirmed: "Подтверждено",
    paid: "Оплачено",
    cancelled: "Отменено",
    completed: "Завершено",
  };
  return labels[status] || status;
}

async function handleCancelBooking(id) {
  if (!confirm("Отменить бронирование?")) return;
  try {
    await cancelBooking(id);
    render();
  } catch (err) {
    alert("❌ " + err.message);
  }
}

async function renderCabinetBalance() {
  const profile = await authProfile();
  const balance = parseFloat(profile.balance) || 0;

  return `
        <div style="display:grid;grid-template-columns:1fr 220px;gap:32px;">
            <div>
                <h2 style="margin-bottom:8px;">Баланс</h2>
                <div style="font-size:36px;font-weight:700;color:var(--primary);margin-bottom:24px;">${balance.toLocaleString()} руб</div>
                <p style="color:var(--text-light);margin-bottom:24px;">
                    Обработка заявки на вывод занимает до двух рабочих дней. Минимальная сумма при выводе — 500 руб. Комиссия при выводе — 10%.
                </p>
                <div class="form-group">
                    <label>Платёжные данные</label>
                    <div>💳 **** **** **** ${profile.payout_card_last4 || "----"}</div>
                </div>
                <form onsubmit="handleWithdrawalSubmit(event)">
                    <div class="form-group">
                        <label>Способ вывода</label>
                        <select name="method">
                            <option value="visa" ${profile.payout_method === "visa" ? "selected" : ""}>Visa</option>
                            <option value="mastercard" ${profile.payout_method === "mastercard" ? "selected" : ""}>Mastercard</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Последние 4 цифры карты</label>
                        <input type="text" name="card_last4" maxlength="4" value="${profile.payout_card_last4 || ""}">
                    </div>
                    <div class="form-group">
                        <label>Сумма к выводу</label>
                        <input type="number" name="amount" min="500" max="${balance}" placeholder="0.00">
                    </div>
                    <button type="submit" class="btn">Подтвердить вывод</button>
                </form>
            </div>
            <div>
                <img src="/static/assets/images/illustration-balance.png" alt="" style="width:100%;">
                <p style="color:var(--text-light);font-size:13px;margin-top:8px;">Вы можете использовать средства с баланса частично или полностью для бронирования домиков</p>
            </div>
        </div>
    `;
}

async function handleWithdrawalSubmit(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    await createWithdrawal(data);
    alert("✅ Заявка на вывод создана");
    render();
  } catch (err) {
    alert("❌ " + err.message);
  }
}

async function renderCabinetReferrals() {
  const info = await getReferralInfo();
  const link = `${window.location.origin}${window.location.pathname}#/register?ref=${info.referral_code}`;

  return `
        <div style="display:grid;grid-template-columns:1fr 220px;gap:32px;">
            <div>
                <h2 style="margin-bottom:8px;">Реферальная ссылка</h2>
                <p style="color:var(--text-light);margin-bottom:16px;">Получайте 15% от каждой оплаты бронирования клиентов, которые пришли по вашей реферальной ссылке. 25% от каждого выполненного задания клиентом.</p>
                <div style="display:flex;gap:12px;margin-bottom:32px;">
                    <input type="text" readonly value="${link}" style="flex:1;">
                    <button class="btn btn-outline" onclick="handleCopyReferralLink('${link}')">Копировать</button>
                </div>
                <h2 style="margin-bottom:8px;">Промокод для привлечения</h2>
                <p style="color:var(--text-light);margin-bottom:16px;">Промокод даёт одноразовую скидку 10% на услуги бронирования домиков.</p>
                <div style="display:flex;gap:12px;margin-bottom:32px;">
                    <input type="text" readonly value="${info.referral_code}" style="flex:1;">
                    <button class="btn btn-outline" onclick="handleCopyReferralLink('${info.referral_code}')">Копировать</button>
                </div>
                <div style="display:flex;gap:32px;">
                    <div>
                        <div style="font-size:24px;font-weight:700;">${info.referrals_count}</div>
                        <div style="color:var(--text-light);font-size:13px;">Привлечено клиентов</div>
                    </div>
                    <div>
                        <div style="font-size:24px;font-weight:700;">${parseFloat(info.total_earned).toLocaleString()} руб</div>
                        <div style="color:var(--text-light);font-size:13px;">Заработано</div>
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
    .then(() => alert("✅ Скопировано"))
    .catch(() => alert("❌ Не удалось скопировать"));
}

async function renderCabinetTransactions() {
  const page = await getTransactions({ ordering: "-created_at" });
  const transactions = page.results || page;

  return `
        <h2 style="margin-bottom:24px;">История операций</h2>
        <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
            <a class="btn btn-outline btn-sm" href="${transactionsExportUrl()}" target="_blank">Экспорт в Excel</a>
        </div>
        ${
          transactions.length === 0
            ? '<p style="color:var(--text-light);">Операций пока нет.</p>'
            : transactions
                .map(
                  (t) => `
            <div class="booking-item">
                <div class="booking-info">
                    <h4>${t.type_display}</h4>
                    <p>${new Date(t.created_at).toLocaleString("ru-RU")}</p>
                </div>
                <div style="display:flex;align-items:center;gap:12px;">
                    <span style="font-weight:700;">${t.amount >= 0 ? "+" : ""}${parseFloat(t.amount).toLocaleString()} руб</span>
                    <span class="booking-status status-${t.status === "rejected" ? "cancelled" : t.status}">${t.status_display}</span>
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
        <h2 style="margin-bottom:24px;">Заработок</h2>
        ${
          tasks.length === 0
            ? '<p style="color:var(--text-light);">Заданий пока нет.</p>'
            : tasks
                .map(
                  (t) => `
            <div class="booking-item">
                <div class="booking-info">
                    <h4>${t.title}</h4>
                    <p>${t.platform_display} · от ${parseFloat(t.reward_min).toLocaleString()} до ${parseFloat(t.reward_max).toLocaleString()} руб</p>
                </div>
                <button class="btn btn-sm" onclick="handleOpenTaskSubmitForm(${t.id})">Выполнить</button>
            </div>
            <div id="task-submit-form-${t.id}"></div>
        `,
                )
                .join("")
        }

        <h3 style="margin:32px 0 16px;">Мои заявки</h3>
        ${
          submissions.length === 0
            ? '<p style="color:var(--text-light);">Заявок пока нет.</p>'
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
                <label>Платформа</label>
                <select name="platform">
                    <option value="vk">VK</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                </select>
            </div>
            <div class="form-group">
                <label>Ссылка на публикацию</label>
                <input type="url" name="submitted_link" required placeholder="https://...">
            </div>
            <button type="submit" class="btn btn-sm">Отправить на модерацию</button>
        </form>
    `;
}

async function handleTaskSubmissionSubmit(e, taskId) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  data.task = taskId;
  try {
    await createTaskSubmission(data);
    alert("✅ Заявка отправлена на модерацию");
    render();
  } catch (err) {
    alert("❌ " + err.message);
  }
}
