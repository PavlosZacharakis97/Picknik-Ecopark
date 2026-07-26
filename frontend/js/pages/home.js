async function renderHome() {
    try {
        const [cottages, weather] = await Promise.all([
            getCottages(),
            getWeather().catch(() => null)
        ]);

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
        { left: '20%', top: '30%' },
        { left: '55%', top: '25%' },
        { left: '75%', top: '50%' },
        { left: '35%', top: '65%' },
        { left: '60%', top: '70%' },
    ];
    const pos = positions[(c.number - 1) % positions.length];
    
    return `
        <div class="cottage-marker" 
             style="left:${pos.left};top:${pos.top};"
             onclick="navigate('/cottages/${c.id}')">
            <span class="number">${c.number}</span>
            <div class="tooltip">${c.name}<br>${c.price_per_night.toLocaleString()} Kč/ночь</div>
        </div>
    `;
}

function filterCottages(type) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    const cards = document.querySelectorAll('.cottage-card');
    cards.forEach(card => {
        const cardType = card.querySelector('.cottage-type').textContent.toLowerCase();
        card.style.display = (type === 'all' || cardType.includes(type)) ? 'block' : 'none';
    });
}