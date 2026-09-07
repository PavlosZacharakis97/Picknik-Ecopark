// апи клента
const API_BASE = 'http://127.0.0.1:8000/api';

async function apiRequest(url, options = {}) {
    const csrfToken = getCookie('csrftoken');

    const defaults = {
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
        },
        credentials: 'include',
    };

    const response = await fetch(`${API_BASE}${url}`, { ...defaults, ...options });

    if (!response.ok) {
        if ((response.status === 401 || response.status === 403) && getStorage('user')) {
            removeStorage('user');
            removeStorage('booking_draft');
            navigate('/login');
        }
        const error = await response.json().catch(() => ({ error: t('api_server_error') }));
        throw new Error(error.error || error.detail || t('api_request_error'));
    }
    
    return response.json();
}


// аутенфицация апи
function authRegister(data) {
    return apiRequest('/auth/register/', { method: 'POST', body: JSON.stringify(data) });
}

function authLogin(data) {
    return apiRequest('/auth/login/', { method: 'POST', body: JSON.stringify(data) });
}

function authLogout() {
    return apiRequest('/auth/logout/', { method: 'POST' });
}

function authProfile() {
    return apiRequest('/auth/profile/');
}

function updateProfile(data) {
    return apiRequest('/auth/profile/', { method: 'PATCH', body: JSON.stringify(data) });
}

function changePassword(data) {
    return apiRequest('/auth/change-password/', { method: 'POST', body: JSON.stringify(data) });
}

function sendPhoneCode(data) {
    return apiRequest('/auth/phone/send-code/', { method: 'POST', body: JSON.stringify(data) });
}

function verifyPhoneCode(data) {
    return apiRequest('/auth/phone/verify-code/', { method: 'POST', body: JSON.stringify(data) });
}

// апи домиков
function getCottages() {
    return apiRequest('/cottages/');
}

function getCottage(id) {
    return apiRequest(`/cottages/${id}/`);
}

function getCottageCalendar(id) {
    return apiRequest(`/cottages/${id}/calendar/`);
}

function getCottageReviews(id) {
    return apiRequest(`/cottages/${id}/reviews/`);
}

function createReview(data) {
    return apiRequest('/reviews/create/', { method: 'POST', body: JSON.stringify(data) });
}

// апи брони
function calculatePrice(data) {
    return apiRequest('/bookings/calculate-price/', { method: 'POST', body: JSON.stringify(data) });
}

function createBooking(data) {
    return apiRequest('/bookings/create/', { method: 'POST', body: JSON.stringify(data) });
}

function getBookings() {
    return apiRequest('/bookings/');
}

function cancelBooking(id) {
    return apiRequest(`/bookings/${id}/cancel/`, { method: 'PATCH' });
}

// апи погоды
function getWeather(lat = 55.7558, lon = 37.6173) {
    return apiRequest(`/weather/?lat=${lat}&lon=${lon}`);
}

// апи кошелька
function getReferralInfo() {
    return apiRequest('/wallet/referral/');
}

function getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/wallet/transactions/${query ? '?' + query : ''}`);
}

function transactionsExportUrl(params = {}) {
    const query = new URLSearchParams(params).toString();
    return `${API_BASE}/wallet/transactions/export/${query ? '?' + query : ''}`;
}

function createWithdrawal(data) {
    return apiRequest('/wallet/withdrawals/create/', { method: 'POST', body: JSON.stringify(data) });
}

function getWithdrawals() {
    return apiRequest('/wallet/withdrawals/');
}

// апи заданий
function getTasks() {
    return apiRequest('/tasks/');
}

function createTaskSubmission(data) {
    return apiRequest('/tasks/submissions/create/', { method: 'POST', body: JSON.stringify(data) });
}

function getTaskSubmissions() {
    return apiRequest('/tasks/submissions/');
}

// апи советов
function getTips() {
    return apiRequest('/content/tips/');
}

function sendContactMessage(data) {
    return apiRequest('/content/contact/', { method: 'POST', body: JSON.stringify(data) });
}