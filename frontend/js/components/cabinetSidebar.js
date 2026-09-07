function cabinetSidebar(active) {
  const user = getStorage("user") || {};
  const initial = (user.first_name || t('guest_fallback')).charAt(0).toUpperCase();

  const items = [
    { key: "profile", path: "/cabinet", icon: "profile", label: t('profile_title') },
    { key: "bookings", path: "/cabinet/bookings", icon: "bookings", label: t('my_bookings_title') },
    { key: "referrals", path: "/cabinet/referrals", icon: "referral", label: t('sidebar_referrals') },
    { key: "tasks", path: "/cabinet/tasks", icon: "earnings", label: t('earnings_title') },
    { key: "balance", path: "/cabinet/balance", icon: "balance", label: t('balance_title') },
    { key: "transactions", path: "/cabinet/transactions", icon: "transactions", label: t('transactions_title') },
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
                        <span class="sidebar-item-icon">${icon(item.icon)}</span> ${item.label}
                    </a>
                `,
                  )
                  .join("")}
                <a href="#/" class="sidebar-item" onclick="event.preventDefault(); handleLogout();">
                    <span class="sidebar-item-icon">${icon('logout')}</span> ${t('sidebar_logout')}
                </a>
            </div>
        </div>
    `;
}
