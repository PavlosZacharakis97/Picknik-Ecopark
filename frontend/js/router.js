// руты

const routes = {
    '/': () => renderHome(),
    '/login': () => renderAuth('login'),
    '/register': () => renderAuth('register'),
    '/cabinet': () => renderCabinet('profile'),
    '/cabinet/bookings': () => renderCabinet('bookings'),
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

function render() {
    const path = getRoute();
    const matched = matchRoute(path);

    updateActiveNav(path);

    const app = document.getElementById('app');
    
    if (!matched) {
        app.innerHTML = renderNotFound();
        return;
    }

    if (path.startsWith('/cabinet')) {
        const user = getStorage('user');
        if (!user) {
            navigate('/login');
            return;
        }
    }

    app.innerHTML = '<div class="loading"><div class="spinner"></div>Загрузка...</div>';
    
    try {
        const content = matched.handler(matched.params);
        if (content instanceof Promise) {
            content.then(html => {
                app.innerHTML = html;
                initScrollReveal();
            }).catch(err => {
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
        const linkRoot = href.split('/')[0];
        if (cleanPath === linkRoot || (cleanPath === '' && href === '/')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    const user = getStorage('user');
    const authLink = document.getElementById('auth-link');
    const mobileAuthLink = document.getElementById('mobile-auth-link');
    
    if (authLink) {
        if (user) {
            authLink.textContent = 'Выйти';
            authLink.href = '#/logout';
            authLink.onclick = (e) => { e.preventDefault(); handleLogout(); };
        } else {
            authLink.textContent = 'Вход';
            authLink.href = '#/login';
            authLink.onclick = null;
        }
    }
    
    if (mobileAuthLink) {
        if (user) {
            mobileAuthLink.textContent = 'Выйти';
            mobileAuthLink.href = '#/logout';
            mobileAuthLink.onclick = (e) => { e.preventDefault(); handleLogout(); };
        } else {
            mobileAuthLink.textContent = 'Вход';
            mobileAuthLink.href = '#/login';
            mobileAuthLink.onclick = null;
        }
    }
}

function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('open');
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
                <div class="notfound-arrow left">🏡 На тропу к домикам</div>
                <div class="notfound-arrow right">❓ Сюда вы и попали</div>
            </div>

            <div class="notfound-code">
                4<div class="notfound-compass"></div>4
            </div>

            <h2 class="notfound-title">Кажется, вы сошли с тропы</h2>
            <p class="notfound-text">Такой страницы в экопарке нет. Но домики, лес и уютный кабинет никуда не делись.</p>
            <a href="#/" class="btn btn-lg">Вернуться на тропу</a>
        </div>
    `;
}

function renderError(message) {
    return `
        <div class="container" style="text-align:center;padding:80px 20px;">
            <div class="alert alert-error" style="max-width:500px;margin:0 auto;">
                <strong>Ошибка загрузки</strong><br>${message}
            </div>
            <button onclick="window.location.reload()" class="btn" style="margin-top:20px;">Перезагрузить</button>
        </div>
    `;
}

// инит
window.addEventListener('hashchange', render);
window.addEventListener('load', () => {
    if (getStorage('user')) updateActiveNav(getRoute());
    render();
});