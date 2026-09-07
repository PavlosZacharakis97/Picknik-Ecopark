// Набор лёгких inline-SVG иконок (взамен эмодзи) — единый стиль, currentColor

const ICONS = {
  profile: '<path d="M12 8a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="M4.5 20c1.4-4 4.4-6 7.5-6s6.1 2 7.5 6"/>',
  bookings: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9"/><path d="M10 20v-5h4v5"/>',
  referral: '<path d="M9.5 14.5 14.5 9.5"/><path d="M11 6.5 12.5 5a3.5 3.5 0 0 1 5 5L16 11.5"/><path d="M13 17.5 11.5 19a3.5 3.5 0 0 1-5-5L8 12.5"/>',
  earnings: '<rect x="3.5" y="6.5" width="17" height="12" rx="2"/><path d="M3.5 10.5h17"/><circle cx="16.5" cy="14.5" r="1.1" fill="currentColor" stroke="none"/>',
  balance: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10.5h18"/><path d="M7 15h4"/>',
  transactions: '<path d="M5 19V10"/><path d="M12 19V5"/><path d="M19 19v-6"/><path d="M3.5 19.5h17"/>',
  logout: '<path d="M13 4H7a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h6"/><path d="M16 12h5m0 0-2.5-2.5M21 12l-2.5 2.5"/>',
  login: '<path d="M11 4h6a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-6"/><path d="M15 12H4m0 0 3.5-3.5M4 12l3.5 3.5"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
  message: '<path d="M4 5.5h16v10H9l-4 3.5v-3.5H4Z" stroke-linejoin="round"/>',
  cottage: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9"/><path d="M10 20v-5h4v5"/>',
  tree: '<path d="M12 4 6 13h2.7L5 19.5h14L15.3 13H18L12 4Z" stroke-linejoin="round"/><path d="M12 19.5v2"/>',
  'weather-sun': '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9 19 19M5 19l2.1-2.1M16.9 7.1 19 5"/>',
  'weather-cloud': '<path d="M7.5 18h9.2a3.8 3.8 0 0 0 .4-7.58A5 5 0 0 0 7.6 9.2 3.7 3.7 0 0 0 7.5 18Z"/>',
  'weather-cloud-sun': '<circle cx="7.5" cy="7.5" r="2.6"/><path d="M7.5 3v1.4M7.5 10.6V12M3 7.5h1.4M10.6 7.5H12M4.6 4.6l1 1M9.4 4.6l-1 1M4.6 10.4l1-1"/><path d="M9.5 19h7.2a3.3 3.3 0 0 0 .3-6.58A4.4 4.4 0 0 0 9 12.8a3.2 3.2 0 0 0 .5 6.2Z"/>',
  'weather-rain': '<path d="M7.5 12.5h9.2a3.8 3.8 0 0 0 .4-7.58A5 5 0 0 0 7.6 3.7 3.7 3.7 0 0 0 7.5 12.5Z"/><path d="M8.5 16l-1.3 3M12.5 16l-1.3 3M16.5 16l-1.3 3"/>',
  'weather-snow': '<path d="M7.5 12.5h9.2a3.8 3.8 0 0 0 .4-7.58A5 5 0 0 0 7.6 3.7 3.7 3.7 0 0 0 7.5 12.5Z"/><circle cx="8.5" cy="17.5" r="1" fill="currentColor" stroke="none"/><circle cx="12.5" cy="19.5" r="1" fill="currentColor" stroke="none"/><circle cx="16.5" cy="17.5" r="1" fill="currentColor" stroke="none"/>',
  'weather-storm': '<path d="M7.5 12.5h9.2a3.8 3.8 0 0 0 .4-7.58A5 5 0 0 0 7.6 3.7 3.7 3.7 0 0 0 7.5 12.5Z"/><path d="M13.5 15 10 20h3l-2 4" stroke-linejoin="round"/>',
  'toast-success': '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.3 2.3 2.3 4.7-5"/>',
  'toast-error': '<circle cx="12" cy="12" r="8.5"/><path d="m9.5 9.5 5 5m0-5-5 5"/>',
  'toast-info': '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><circle cx="12" cy="8" r="0.2" fill="currentColor" stroke="currentColor" stroke-width="1.6"/>',
  'toast-warning': '<path d="M12 4 3 19.5h18L12 4Z" stroke-linejoin="round"/><path d="M12 10.5v4"/><circle cx="12" cy="17" r="0.2" fill="currentColor" stroke="currentColor" stroke-width="1.6"/>',
  'toast-close': '<path d="m6 6 12 12M18 6 6 18"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.8-3.2 2.9-5 5.5-5s4.7 1.8 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.3 13.2c2.1.4 3.4 2 4 5.3"/>',
};

const ICONS_FILLED = {
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/>',
};

const ICONS_STROKE_ONLY = {
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/>',
};

function icon(name, size = 20) {
  const path = ICONS[name];
  if (!path) return '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icon icon-${name}">${path}</svg>`;
}

function iconHeart(filled, size = 20) {
  const source = filled ? ICONS_FILLED : ICONS_STROKE_ONLY;
  const fillAttrs = filled
    ? 'fill="currentColor" stroke="none"'
    : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${fillAttrs} class="icon icon-heart${filled ? ' icon-heart--filled' : ''}">${source.heart}</svg>`;
}
