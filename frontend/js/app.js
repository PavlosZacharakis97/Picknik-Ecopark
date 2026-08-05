// точка вчщда в апликацию
// router.js автоматически инициализируется при загрузке страницы
// Все скрипты в index.html

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 10);
});