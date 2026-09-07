// точка вчщда в апликацию
// router.js автоматически инициализируется при загрузке страницы
// Все скрипты в index.html

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 10);
});

// клик по лого — на главной просто скроллит наверх, с других страниц ещё и переходит на главную
function handleLogoClick(event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (getRoute() !== '/') navigate('/');
}

// бургер-меню в навбаре
function toggleNavMenu() {
    const dropdown = document.getElementById('nav-dropdown');
    const burger = document.getElementById('burger-btn');
    if (!dropdown || !burger) return;
    const isOpen = dropdown.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

function closeNavMenu() {
    const dropdown = document.getElementById('nav-dropdown');
    const burger = document.getElementById('burger-btn');
    if (dropdown) dropdown.classList.remove('open');
    if (burger) {
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
    }
}

document.addEventListener('click', (e) => {
    const menu = document.querySelector('.nav-menu');
    if (menu && !menu.contains(e.target)) closeNavMenu();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeNavMenu();
        if (typeof closePasswordModal === 'function') closePasswordModal();
    }
});

// переключатель языка
function applyStaticTranslations() {
    const lang = getLanguage();
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        el.textContent = t(el.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });

    document.querySelectorAll('.nav-lang-btn').forEach((btn) => {
        const btnLang = btn.textContent.trim().toLowerCase() === 'cz' ? 'cs' : btn.textContent.trim().toLowerCase();
        btn.classList.toggle('active', btnLang === lang);
    });
}

applyStaticTranslations();