async function renderCottageDetail(id) {
    try {
        const cottage = await getCottage(id);
        addRecentCottage(cottage.id);
        
        return `
            <div class="container">
                <div style="margin-bottom:20px;">
                    <a href="#/" class="btn btn-sm btn-outline">← Назад к каталогу</a>
                </div>
                
                <div class="hero" style="text-align:left;">
                    <h1>${cottage.name}</h1>
                    <span class="cottage-type">${getCottageTypeName(cottage.cottage_type)}</span>
                </div>
                
                <div class="booking-layout">
                    <div>
                        <div class="booking-image" style="height:400px;">🏡</div>
                        <div style="margin-top:24px;">
                            <h3>О домике</h3>
                            <p style="color:var(--text-light);line-height:1.8;">${cottage.description}</p>
                            
                            <h4 style="margin-top:24px;margin-bottom:12px;">Удобства</h4>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                <div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);">👥 До ${cottage.max_guests} гостей</div>
                                <div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);">🛏️ ${cottage.bedrooms} спальни</div>
                                <div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);">🚿 ${cottage.bathrooms} ванные</div>
                                ${cottage.has_wifi ? '<div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);">📶 Wi-Fi</div>' : ''}
                                ${cottage.has_kitchen ? '<div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);">🍳 Кухня</div>' : ''}
                                ${cottage.has_bbq ? '<div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);">🔥 Мангал</div>' : ''}
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="form-container" style="position:sticky;top:100px;">
                            <div class="cottage-price" style="font-size:36px;margin-bottom:8px;">
                                ${cottage.price_per_night.toLocaleString()} Kč
                            </div>
                            <p style="color:var(--text-light);margin-bottom:24px;">за ночь</p>
                            <a href="#/booking/${cottage.id}" class="btn btn-block btn-lg">Забронировать</a>
                            <button onclick="toggleFavoriteButton(event, ${cottage.id})" class="btn btn-outline btn-block" style="margin-top:12px;">
                                ${isFavorite(cottage.id) ? '❤️ В избранном' : '🤍 Добавить в избранное'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        return renderError(err.message);
    }
}

function toggleFavoriteButton(event, id) {
    event.preventDefault();
    toggleFavorite(id);
    const btn = event.currentTarget;
    btn.textContent = isFavorite(id) ? '❤️ В избранном' : '🤍 Добавить в избранное';
}