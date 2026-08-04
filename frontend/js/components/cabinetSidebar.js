function cabinetSidebar(active) {
  const user = getStorage("user") || {};
  const initial = (user.first_name || "Г").charAt(0).toUpperCase();

  const items = [
    { key: "profile", path: "/cabinet", icon: "👤", label: "Профиль" },
    { key: "bookings", path: "/cabinet/bookings", icon: "🏡", label: "Мои брони" },
    { key: "referrals", path: "/cabinet/referrals", icon: "🔗", label: "Реферальная программа" },
    { key: "tasks", path: "/cabinet/tasks", icon: "💰", label: "Заработок" },
    { key: "balance", path: "/cabinet/balance", icon: "💳", label: "Баланс" },
    { key: "transactions", path: "/cabinet/transactions", icon: "📊", label: "История операций" },
  ];

  return `
        <div class="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-avatar">${initial}</div>
                <div>
                    <div style="font-weight:600;">${user.first_name || ""} ${user.last_name || ""}</div>
                    <div style="font-size:13px;color:var(--text-light);">${user.email || ""}</div>
                </div>
            </div>
            <div class="sidebar-menu">
                ${items
                  .map(
                    (item) => `
                    <a href="#${item.path}" class="sidebar-item ${active === item.key ? "active" : ""}">
                        <span>${item.icon}</span> ${item.label}
                    </a>
                `,
                  )
                  .join("")}
                <a href="#/" class="sidebar-item" onclick="event.preventDefault(); handleLogout();">
                    <span>🚪</span> Выход
                </a>
            </div>
        </div>
    `;
}
