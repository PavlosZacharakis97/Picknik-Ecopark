let cachedCottages = [];

async function renderHome() {
    try {
        const [cottages, weather] = await Promise.all([
            getCottages(),
            getWeather(41.622706, 42.308329).catch(() => null),
            ensureFavoritesLoaded()
        ]);
        cachedCottages = cottages;

        return `
            <section class="hero">
                <div class="container">
                    <div class="hero-card">
                        <span class="hero-kicker">Пикник Эко-парк</span>
                        <h1>${t('home_hero_title')}</h1>
                        <p class="hero-lead">${t('home_hero_lead')}</p>
                        <div class="hero-actions">
                            <a href="#/" onclick="event.preventDefault(); document.getElementById('available-cottages').scrollIntoView({behavior:'smooth'});" class="btn btn-lg">${t('home_hero_cta')}</a>
                        </div>
                        <div class="hero-badges">
                            <span>${icon('tree', 18)}${t('home_badge_forest')}</span>
                            <span><img src="/static/assets/images/bonfire.png" class="feature-icon" alt="">${t('home_badge_bbq')}</span>
                            <span><img src="/static/assets/images/wifi.png" class="feature-icon" alt="">${t('home_badge_wifi')}</span>
                        </div>
                        ${weather ? `<div style="margin-top:32px;">${weatherWidget(weather)}</div>` : ''}
                    </div>
                </div>
            </section>

            <div class="map-container reveal-up" id="cottage-map">
                <div class="map-area" id="map">
                    ${cottages.map(c => cottageMarker(c)).join('')}
                    <div id="map-popup" class="map-popup" style="display:none;"></div>
                </div>
            </div>

            <div class="container">
                <div class="filter-bar reveal-up">
                    <button class="filter-btn active" onclick="filterCottages('all')">${t('filter_all')}</button>
                    <button class="filter-btn" onclick="filterCottages('standard')">${t('cottage_type_standard')}</button>
                    <button class="filter-btn" onclick="filterCottages('comfort')">${t('cottage_type_comfort')}</button>
                    <button class="filter-btn" onclick="filterCottages('luxury')">${t('cottage_type_luxury')}</button>
                </div>

                <h2 class="section-title reveal-up" id="available-cottages">${t('home_available_title')}</h2>
                <div class="cottages-grid" id="cottages-grid">
                    ${cottages.map(c => cottageCard(c)).join('')}
                </div>

                <section class="location-section reveal-up">
                    <div class="location-text">
                        <h2 class="section-title">${t('home_location_title')}</h2>
                        <p>${t('home_location_text')}</p>
                        <a href="https://www.google.com/maps?q=41.622706,42.308329" target="_blank" rel="noopener" class="btn btn-outline">${t('home_location_cta')}</a>
                    </div>
                    <div class="location-map">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11236.260098744568!2d42.30832853618791!3d41.622706124879564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x405d4f1db99b6809%3A0x5772bb1ce79a3b51!2sGlamping%20Tago!5e1!3m2!1sru!2scz!4v1785933642022!5m2!1sru!2scz"
                            width="100%" height="360" style="border:0;" allowfullscreen loading="lazy"
                            referrerpolicy="strict-origin-when-cross-origin" title="${t('location_map_title')}"></iframe>
                    </div>
                </section>
            </div>

            <section class="forest-footer">
                <div class="container">
                    <section class="contact-section reveal-up">
                        <div class="contact-intro">
                            <h2 class="section-title">${t('contact_title')}</h2>
                            <p>${t('contact_subtitle')}</p>
                        </div>
                        <form class="contact-form" id="contact-form" onsubmit="handleContactSubmit(event)" novalidate>
                            <div class="contact-field form-group">
                                <span class="contact-field-icon">${icon('profile', 17)}</span>
                                <input type="text" name="name" required placeholder="${t('contact_name_placeholder')}">
                            </div>
                            <div class="contact-field form-group">
                                <span class="contact-field-icon">${icon('mail', 17)}</span>
                                <input type="email" name="email" required placeholder="you@example.com">
                            </div>
                            <div class="contact-field contact-field--textarea form-group">
                                <span class="contact-field-icon">${icon('message', 17)}</span>
                                <textarea name="message" rows="4" required placeholder="${t('contact_message_placeholder')}"></textarea>
                            </div>
                            <div id="contact-feedback"></div>
                            <button type="submit" class="btn btn-block" id="contact-submit-btn">${t('contact_submit')}</button>
                        </form>
                    </section>
                </div>
            </section>
        `;
    } catch (err) {
        return renderError(err.message);
    }
}

function weatherWidget(w) {
    const icons = { 0: 'weather-sun', 1: 'weather-cloud-sun', 2: 'weather-cloud-sun', 3: 'weather-cloud', 45: 'weather-cloud', 51: 'weather-rain', 61: 'weather-rain', 71: 'weather-snow', 95: 'weather-storm' };
    return `
        <div class="weather-widget">
            <div class="weather-icon">${icon(icons[w.weathercode] || 'weather-cloud-sun', 32)}</div>
            <div class="weather-info">
                <h3>${t('weather_title')}</h3>
                <p>${t('weather_wind', { speed: w.windspeed })}</p>
            </div>
            <div class="weather-temp">${w.temperature}°C</div>
        </div>
    `;
}

function cottageMarker(c) {
    const positions = [
        { left: '26%', top: '24%' },
        { left: '37.3%', top: '35.3%' },
        { left: '50.8%', top: '56.1%' },
        { left: '60.5%', top: '64.7%' },
        { left: '71.1%', top: '38.2%' },
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
        ? t('map_popup_occupied', { date: formatOccupiedDate(cottage.occupied_until) })
        : t('map_popup_free');

    popup.innerHTML = `
        <button class="popup-close" onclick="closeCottagePopup()">&times;</button>
        <h4>${t('map_popup_number', { number: cottage.number })}</h4>
        <p>${occupiedText}</p>
        <button class="btn" onclick="navigate('/booking/${cottage.id}')">${t('map_popup_book')}</button>
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
    return formatDate(dateStr);
}

function filterCottages(type) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    const cards = document.querySelectorAll('.cottage-card');
    cards.forEach(card => {
        card.style.display = (type === 'all' || card.dataset.type === type) ? 'block' : 'none';
    });
}

async function handleContactSubmit(event) {
    event.preventDefault();
    const form = event.target;
    if (!validateForm(form)) return;
    const btn = document.getElementById('contact-submit-btn');
    const feedback = document.getElementById('contact-feedback');
    const data = Object.fromEntries(new FormData(form));

    btn.disabled = true;
    try {
        await sendContactMessage(data);
        feedback.innerHTML = `<div class="alert alert-success">${t('contact_success')}</div>`;
        form.reset();
    } catch (err) {
        feedback.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    } finally {
        btn.disabled = false;
    }
}