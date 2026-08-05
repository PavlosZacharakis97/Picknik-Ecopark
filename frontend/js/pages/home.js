let cachedCottages = [];

async function renderHome() {
    try {
        const [cottages, weather] = await Promise.all([
            getCottages(),
            getWeather().catch(() => null)
        ]);
        cachedCottages = cottages;

        return `
            <section class="hero">
                <div class="container">
                    <div class="hero-card">
                        <span class="hero-kicker">Пикник Эко-парк</span>
                        <h1>Отдых <span class="text-accent">среди леса</span>,<br>в двух шагах от города</h1>
                        <p class="hero-lead">Уютные коттеджи среди природы — идеальное место для отдыха с семьёй или друзьями.</p>
                        <div class="hero-actions">
                            <a href="#cottage-map" class="btn btn-lg">Смотреть домики</a>
                        </div>
                        <div class="hero-badges">
                            <span>🌲 Домики среди леса</span>
                            <span>🔥 Мангал и терраса</span>
                            <span>📶 Wi-Fi в каждом домике</span>
                        </div>
                        ${weather ? `<div style="margin-top:32px;">${weatherWidget(weather)}</div>` : ''}
                    </div>
                </div>
                <div class="hero-wave">
                    <svg viewBox="0 0 1440 60" preserveAspectRatio="none"><path d="M0,20 C360,70 1080,-20 1440,24 L1440,60 L0,60 Z"></path></svg>
                </div>
            </section>

            <div class="container">
                <div class="map-container reveal-up" id="cottage-map">
                    <div class="map-area" id="map">
                        ${cottages.map(c => cottageMarker(c)).join('')}
                        <div id="map-popup" class="map-popup" style="display:none;"></div>
                    </div>
                </div>

                <div class="filter-bar reveal-up">
                    <button class="filter-btn active" onclick="filterCottages('all')">Все</button>
                    <button class="filter-btn" onclick="filterCottages('standard')">Стандарт</button>
                    <button class="filter-btn" onclick="filterCottages('comfort')">Комфорт</button>
                    <button class="filter-btn" onclick="filterCottages('luxury')">Люкс</button>
                </div>

                <h2 class="section-title reveal-up">Доступные домики</h2>
                <div class="cottages-grid" id="cottages-grid">
                    ${cottages.map(c => cottageCard(c)).join('')}
                </div>

                <section class="location-section reveal-up">
                    <div class="location-text">
                        <h2 class="section-title">Как нас найти</h2>
                        <p>Экопарк расположен в живописном месте среди леса — удобно добраться на машине или общественным транспортом.</p>
                        <a href="https://www.google.com/maps?q=41.622706,42.308329" target="_blank" rel="noopener" class="btn btn-outline">Проложить маршрут</a>
                    </div>
                    <div class="location-map">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11236.260098744568!2d42.30832853618791!3d41.622706124879564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x405d4f1db99b6809%3A0x5772bb1ce79a3b51!2sGlamping%20Tago!5e1!3m2!1sru!2scz!4v1785933642022!5m2!1sru!2scz"
                            width="100%" height="360" style="border:0;" allowfullscreen loading="lazy"
                            referrerpolicy="strict-origin-when-cross-origin" title="Карта проезда к экопарку"></iframe>
                    </div>
                </section>
            </div>
        `;
    } catch (err) {
        return renderError(err.message);
    }
}

function weatherWidget(w) {
    const icons = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 51: '🌧️', 61: '🌧️', 71: '❄️', 95: '⛈️' };
    return `
        <div class="weather-widget">
            <div class="weather-icon">${icons[w.weathercode] || '🌤️'}</div>
            <div class="weather-info">
                <h3>Погода в парке</h3>
                <p>Ветер ${w.windspeed} м/с</p>
            </div>
            <div class="weather-temp">${w.temperature}°C</div>
        </div>
    `;
}

function cottageMarker(c) {
    const positions = [
        { left: '26%', top: '27%' },
        { left: '39%', top: '40%' },
        { left: '51%', top: '58%' },
        { left: '60%', top: '65%' },
        { left: '71%', top: '40%' },
    ];
    const pos = positions[(c.number - 1) % positions.length];

    return `
        <div class="cottage-hotspot"
             style="left:${pos.left};top:${pos.top};"
             onclick="showCottagePopup(event, ${c.id})">
            <div class="cottage-marker">
                <span class="number">${c.number}</span>
            </div>
        </div>
    `;
}

function showCottagePopup(event, cottageId) {
    const cottage = cachedCottages.find(c => c.id === cottageId);
    const popup = document.getElementById('map-popup');
    if (!cottage || !popup) return;

    const occupiedText = cottage.occupied_until
        ? `аренда до ${formatOccupiedDate(cottage.occupied_until)}`
        : 'свободен';

    popup.innerHTML = `
        <button class="popup-close" onclick="closeCottagePopup()">&times;</button>
        <h4>Домик № ${cottage.number}</h4>
        <p>${occupiedText}</p>
        <button class="btn" onclick="navigate('/booking/${cottage.id}')">Бронировать домик</button>
    `;

    const marker = event.currentTarget;
    const mapArea = marker.closest('.map-area');
    const markerRect = marker.getBoundingClientRect();
    const mapRect = mapArea.getBoundingClientRect();

    popup.style.display = 'block';
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;

    let left = markerRect.left - mapRect.left + marker.offsetWidth + 12;
    if (left + popupWidth > mapRect.width) {
        left = markerRect.left - mapRect.left - popupWidth - 12;
    }
    left = Math.max(8, Math.min(left, mapRect.width - popupWidth - 8));

    let top = markerRect.top - mapRect.top;
    top = Math.max(8, Math.min(top, mapRect.height - popupHeight - 8));

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
}

function closeCottagePopup() {
    const popup = document.getElementById('map-popup');
    if (popup) popup.style.display = 'none';
}

function formatOccupiedDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU');
}

function filterCottages(type) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    const cards = document.querySelectorAll('.cottage-card');
    cards.forEach(card => {
        card.style.display = (type === 'all' || card.dataset.type === type) ? 'block' : 'none';
    });
}