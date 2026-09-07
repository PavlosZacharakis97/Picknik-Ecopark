async function renderBooking(id) {
    try {
        const cottage = await getCottage(id);
        addRecentCottage(cottage.id);
        const name = getCottageName(cottage);

        const storedUser = getStorage('user');
        const isGuest = !storedUser;
        const userBalance = storedUser ? await authProfile().then(p => parseFloat(p.balance) || 0).catch(() => 0) : 0;

        return `
            <div class="booking-page">
                <div class="container">
                    <div class="booking-section">
                        <h1>${t('booking_title', { name })}</h1>
                        <div class="booking-layout" style="margin-top:32px;">
                            <div class="booking-info-card">
                                ${cottageGallery(getCottageImages(cottage), name, '300px')}
                                <div style="margin-top:20px;">
                                    <h3>${name}</h3>
                                    <p style="color:var(--text-light);">${getCottageDescription(cottage)}</p>
                                    <div class="cottage-features" style="margin:16px 0;">
                                        <span><img src="/static/assets/images/people.png" class="feature-icon" alt="">${t('booking_guests_up_to', { n: cottage.max_guests })}</span>
                                        <span><img src="/static/assets/images/bed.png" class="feature-icon" alt="">${t('amenity_bedrooms', { n: cottage.bedrooms })}</span>
                                        <span><img src="/static/assets/images/bathroom.png" class="feature-icon" alt="">${t('amenity_bathrooms', { n: cottage.bathrooms })}</span>
                                    </div>
                                    ${cottage.has_wifi ? `<p><img src="/static/assets/images/wifi.png" class="icon-inline" alt="">${t('wifi_free')}</p>` : ''}
                                    ${cottage.has_kitchen ? `<p><img src="/static/assets/images/kitchen.png" class="icon-inline" alt="">${t('kitchen_full')}</p>` : ''}
                                    ${cottage.has_bbq ? `<p><img src="/static/assets/images/barbecue.png" class="icon-inline" alt="">${t('bbq_zone')}</p>` : ''}
                                </div>
                            </div>
                            <div class="form-container">
                                <h3 style="margin-bottom:20px;">${t('book_form_title')}</h3>
                                <div class="cottage-price" style="font-size:24px;margin-bottom:16px;">
                                    ${cottage.price_per_night.toLocaleString()} Kč<span style="font-size:14px;color:var(--text-light);"> ${t('cottage_per_night')}</span>
                                </div>
                                ${await bookingForm(cottage.id, cottage.price_per_night, isGuest, userBalance, cottage.max_guests)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        return renderError(err.message);
    }
}