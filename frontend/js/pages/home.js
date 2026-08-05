let cachedCottages = [];

async function renderHome() {
    try {
        const [cottages, weather] = await Promise.all([
            getCottages(),
            getWeather().catch(() => null)
        ]);
        cachedCottages = cottages;

        return `
            <div class="container">
                ${weather ? weatherWidget(weather) : ''}

                <div class="hero">
                    <h1>Аренда домиков в экопарке</h1>
                    <p>Уютные коттеджи среди природы. Идеальное место для отдыха с семьёй или друзьями.</p>
                </div>

                <div class="map-container">
                    <div class="map-area" id="map">
                        ${cottages.map(c => cottageMarker(c)).join('')}
                        <div id="map-popup" class="map-popup" style="display:none;"></div>
                    </div>
                </div>

                <div class="filter-bar">
                    <button class="filter-btn active" onclick="filterCottages('all')">Все</button>
                    <button class="filter-btn" onclick="filterCottages('standard')">Стандарт</button>
                    <button class="filter-btn" onclick="filterCottages('comfort')">Комфорт</button>
                    <button class="filter-btn" onclick="filterCottages('luxury')">Люкс</button>
                </div>

                <h2 class="section-title">Доступные домики</h2>
                <div class="cottages-grid" id="cottages-grid">
                    ${cottages.map(c => cottageCard(c)).join('')}
                </div>
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