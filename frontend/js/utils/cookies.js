// основные кукис

function setCookie(name, value, days = 30) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

// lockalstorage

function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function removeStorage(key) {
    localStorage.removeItem(key);
}

// язык

function getLanguage() {
    return getCookie('django_language') || getStorage('language') || 'ru';
}

function setLanguage(lang) {
    setCookie('django_language', lang, 365);
    setStorage('language', lang);
    document.documentElement.lang = lang;
    window.location.reload();
}

// сохранение бронирования в черновике

function saveBookingDraft(draft) {
    // draft = { cottageId, checkIn, checkOut, guests, promoCode }
    setStorage('booking_draft', draft);
}

function getBookingDraft() {
    return getStorage('booking_draft');
}

function clearBookingDraft() {
    removeStorage('booking_draft');
}

// фильтр поиска

function saveSearchFilters(filters) {
    // filters = { type, guests, dateFrom, dateTo, maxPrice }
    setStorage('search_filters', filters);
}

function getSearchFilters() {
    return getStorage('search_filters', {});
}

function clearSearchFilters() {
    removeStorage('search_filters');
}

// недавно просмотренние

function addRecentCottage(cottageId) {
    let recent = getStorage('recent_cottages', []);
    // Убираем дубликаты и добавляем в начало
    recent = recent.filter(id => id !== cottageId);
    recent.unshift(cottageId);
    // Храним максимум 5
    if (recent.length > 5) recent = recent.slice(0, 5);
    setStorage('recent_cottages', recent);
}

function getRecentCottages() {
    return getStorage('recent_cottages', []);
}

// promo-baner

function hidePromo(promoId) {
    setCookie(`hide_promo_${promoId}`, '1', 1); // на 1 день
}

function isPromoHidden(promoId) {
    return getCookie(`hide_promo_${promoId}`) === '1';
}

// uvedomlenia

function markNotificationRead(notificationId) {
    let read = getStorage('notifications_read', []);
    if (!read.includes(notificationId)) {
        read.push(notificationId);
        setStorage('notifications_read', read);
    }
}

function isNotificationRead(notificationId) {
    const read = getStorage('notifications_read', []);
    return read.includes(notificationId);
}

// wishlist

function toggleFavorite(cottageId) {
    let favorites = getStorage('favorite_cottages', []);
    if (favorites.includes(cottageId)) {
        favorites = favorites.filter(id => id !== cottageId);
    } else {
        favorites.push(cottageId);
    }
    setStorage('favorite_cottages', favorites);
    return favorites.includes(cottageId); // true = добавлено
}

function getFavorites() {
    return getStorage('favorite_cottages', []);
}

function isFavorite(cottageId) {
    return getStorage('favorite_cottages', []).includes(cottageId);
}