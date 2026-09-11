// руты

const routes = {
    '/': () => renderHome(),
    '/favorites': () => renderFavorites(),
    '/login': () => renderAuth('login'),
    '/register': () => renderAuth('register'),
    '/cabinet': () => renderCabinet('profile'),
    '/cabinet/bookings': () => renderCabinet('bookings'),
    '/cabinet/bookings/:id': (params) => renderBookingReceipt(params.id),
    '/cabinet/bookings/:id/pay': (params) => renderBookingPayment(params.id),
    '/cabinet/balance': () => renderCabinet('balance'),
    '/cabinet/referrals': () => renderCabinet('referrals'),
    '/cabinet/transactions': () => renderCabinet('transactions'),
    '/cabinet/tasks': () => renderCabinet('tasks'),
    '/booking/:id': (params) => renderBooking(params.id),
    '/cottages/:id': (params) => renderCottageDetail(params.id),
};

function navigate(path) {
    window.location.hash = path;
}

function getRoute() {
    const hash = window.location.hash.slice(1) || '/';
    return hash.split('?')[0];
}

function getQueryParams() {
    const hash = window.location.hash.slice(1) || '/';
    const queryString = hash.split('?')[1] || '';
    return Object.fromEntries(new URLSearchParams(queryString));
}

function matchRoute(path) {
    if (routes[path]) {
        return { handler: routes[path], params: {} };
    }

    for (const [route, handler] of Object.entries(routes)) {
        if (route.includes(':')) {
            const pattern = route.replace(/:\w+/g, '([^/]+)');
            const regex = new RegExp(`^${pattern}$`);
            const match = path.match(regex);
            if (match) {
                const paramNames = route.match(/:(\w+)/g).map(p => p.slice(1));
                const params = {};
                paramNames.forEach((name, i) => {
                    params[name] = match[i + 1];
                });
                return { handler, params };
            }
        }
    }
    return null;
}

let renderToken = 0;

function render() {
    const path = getRoute();
    const matched = matchRoute(path);
    const myToken = ++renderToken;

    updateActiveNav(path);

    const app = document.getElementById('app');

    if (!matched) {
        app.innerHTML = renderNotFound();
        return;
    }

    if (path.startsWith('/cabinet') || path.startsWith('/booking')) {
        const user = getStorage('user');
        if (!user) {
            navigate('/login');
            return;
        }
    }

    app.innerHTML = `<div class="loading"><div class="spinner"></div>${t('loading')}</div>`;

    try {
        const content = matched.handler(matched.params);
        if (content instanceof Promise) {
            content.then(html => {
                if (myToken !== renderToken) return;
                app.innerHTML = html;
                initScrollReveal();
            }).catch(err => {
                if (myToken !== renderToken) return;
                app.innerHTML = renderError(err.message);
            });
        } else {
            app.innerHTML = content;
            initScrollReveal();
        }
    } catch (error) {
        console.error('Render error:', error);
        app.innerHTML = renderError(error.message);
    }
}

function updateActiveNav(path) {
    const cleanPath = path.split('/')[1] || '';
    
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href').slice(1);
        const linkRoot = href.split('/')[1] || '';
        if (cleanPath === linkRoot || (cleanPath === '' && href === '/')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    const user = getStorage('user');
    const authLink = document.getElementById('auth-link');
    const profileLink = document.getElementById('profile-link');
    const greeting = document.getElementById('nav-dropdown-greeting');

    if (authLink) {
        const authLinkIcon = document.getElementById('auth-link-icon');
        const authLinkText = document.getElementById('auth-link-text');
        if (user) {
            if (authLinkIcon) authLinkIcon.innerHTML = icon('logout', 18);
            if (authLinkText) authLinkText.textContent = t('nav_logout');
            authLink.href = '#/logout';
            authLink.onclick = (e) => { e.preventDefault(); handleLogout(); };
        } else {
            if (authLinkIcon) authLinkIcon.innerHTML = icon('login', 18);
            if (authLinkText) authLinkText.textContent = t('nav_login');
            authLink.href = '#/login';
            authLink.onclick = null;
        }
    }

    if (profileLink) {
        profileLink.style.display = user ? 'flex' : 'none';
    }

    if (greeting) {
        if (user) {
            greeting.textContent = t('nav_greeting', { name: user.first_name || t('guest_fallback') });
            greeting.style.display = 'block';
        } else {
            greeting.style.display = 'none';
        }
    }

    closeNavMenu();
}

async function handleLogout() {
    try { await authLogout(); } catch (e) { console.log(e); }
    removeStorage('user');
    removeStorage('booking_draft');
    navigate('/');
    window.location.reload();
}

function renderNotFound() {
    return `
        <div class="notfound-section">
            <span class="notfound-bush b1"></span>
            <span class="notfound-bush b2"></span>
            <span class="notfound-bush b3"></span>
            <span class="notfound-bush b4"></span>

            <div class="notfound-signpost">
                <div class="notfound-arrow left">${t('notfound_left_arrow')}</div>
                <div class="notfound-arrow right">${t('notfound_right_arrow')}</div>
            </div>

            <div class="notfound-code">
                4<div class="notfound-compass"></div>4
            </div>

            <h2 class="notfound-title">${t('notfound_title')}</h2>
            <p class="notfound-text">${t('notfound_text')}</p>
            <a href="#/" class="btn btn-lg">${t('notfound_cta')}</a>
        </div>
    `;
}

function renderError(message) {
    return `
        <div class="container" style="text-align:center;padding:80px 20px;">
            <div class="alert alert-error" style="max-width:500px;margin:0 auto;">
                <strong>${t('error_title')}</strong><br>${message}
            </div>
            <button onclick="window.location.reload()" class="btn" style="margin-top:20px;">${t('error_reload_btn')}</button>
        </div>
    `;
}

// инит
window.addEventListener('hashchange', render);
window.addEventListener('load', () => {
    if (getStorage('user')) updateActiveNav(getRoute());
    render();
});