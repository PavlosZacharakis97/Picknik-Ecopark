async function renderBooking(id) {
    try {
        const cottage = await getCottage(id);
        addRecentCottage(cottage.id);
        
        return `
            <div class="container">
                <div class="booking-section">
                    <h1>Бронирование: ${cottage.name}</h1>
                    <div class="booking-layout" style="margin-top:32px;">
                        <div>
                            <div class="booking-image">🏡</div>
                            <div style="margin-top:20px;">
                                <h3>${cottage.name}</h3>
                                <p style="color:var(--text-light);">${cottage.description}</p>
                                <div class="cottage-features" style="margin:16px 0;">
                                    <span>👥 до ${cottage.max_guests}</span>
                                    <span>🛏️ ${cottage.bedrooms} спальни</span>
                                    <span>🚿 ${cottage.bathrooms} ванные</span>
                                </div>
                                ${cottage.has_wifi ? '<p>✅ Бесплатный Wi-Fi</p>' : ''}
                                ${cottage.has_kitchen ? '<p>✅ Полностью оборудованная кухня</p>' : ''}
                                ${cottage.has_bbq ? '<p>✅ Мангал и зона барбекю</p>' : ''}
                            </div>
                        </div>
                        <div class="form-container">
                            <h3 style="margin-bottom:20px;">Оформить бронь</h3>
                            <div class="cottage-price" style="font-size:24px;margin-bottom:16px;">
                                ${cottage.price_per_night.toLocaleString()} Kč<span style="font-size:14px;color:var(--text-light);"> / ночь</span>
                            </div>
                            ${bookingForm(cottage.id, cottage.price_per_night)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        return renderError(err.message);
    }
}