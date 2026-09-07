async function renderCottageDetail(id) {
    try {
        const cottage = await getCottage(id);
        addRecentCottage(cottage.id);
        await loadAvailabilityCalendar(cottage.id);
        const reviews = await loadCottageReviews(cottage.id);
        const name = getCottageName(cottage);

        return `
            <div class="hero hero--page" style="text-align:left;">
                <div class="container">
                    <div style="margin-bottom:20px;">
                        <a href="#/" class="btn btn-sm btn-outline">${t('back_to_catalog')}</a>
                    </div>
                    <h1>${name}</h1>
                    <span class="cottage-type">${getCottageTypeName(cottage.cottage_type)}</span>
                </div>
            </div>

            <div class="container">
                <div class="booking-layout">
                    <div>
                        ${cottageGallery(getCottageImages(cottage), name, '400px')}
                        <div style="margin-top:24px;">
                            <h3>${t('about_cottage')}</h3>
                            <p style="color:var(--text-light);line-height:1.8;">${getCottageDescription(cottage)}</p>

                            <h4 style="margin-top:24px;margin-bottom:12px;">${t('amenities')}</h4>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                <div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);"><img src="/static/assets/images/people.png" class="icon-inline" alt="">${t('amenity_guests', { n: cottage.max_guests })}</div>
                                <div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);"><img src="/static/assets/images/bed.png" class="icon-inline" alt="">${t('amenity_bedrooms', { n: cottage.bedrooms })}</div>
                                <div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);"><img src="/static/assets/images/bathroom.png" class="icon-inline" alt="">${t('amenity_bathrooms', { n: cottage.bathrooms })}</div>
                                ${cottage.has_wifi ? `<div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);"><img src="/static/assets/images/wifi.png" class="icon-inline" alt="">${t('amenity_wifi')}</div>` : ''}
                                ${cottage.has_kitchen ? `<div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);"><img src="/static/assets/images/kitchen.png" class="icon-inline" alt="">${t('amenity_kitchen')}</div>` : ''}
                                ${cottage.has_bbq ? `<div style="padding:12px;background:var(--bg);border-radius:var(--radius-sm);"><img src="/static/assets/images/barbecue.png" class="icon-inline" alt="">${t('amenity_bbq')}</div>` : ''}
                            </div>
                        </div>

                        ${renderReviewsSection(cottage.id, reviews)}
                    </div>
                    <div>
                        <div class="form-container">
                            <div class="cottage-price" style="font-size:36px;margin-bottom:8px;">
                                ${cottage.price_per_night.toLocaleString()} Kč
                            </div>
                            <p style="color:var(--text-light);margin-bottom:24px;">${t('per_night')}</p>
                            <a href="#/booking/${cottage.id}" class="btn btn-block btn-lg">${t('book_button')}</a>
                            <button onclick="toggleFavoriteButton(event, ${cottage.id})" class="btn btn-outline btn-block" style="margin-top:12px;">
                                ${iconHeart(isFavorite(cottage.id))} ${isFavorite(cottage.id) ? t('fav_added') : t('fav_add')}
                            </button>
                        </div>
                        <div class="form-container" style="margin-top:24px;">
                            <h3 style="margin-bottom:16px;">${t('availability_title')}</h3>
                            ${renderAvailabilityCalendar()}
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
    const fav = isFavorite(id);
    btn.innerHTML = `${iconHeart(fav)} ${fav ? t('fav_added') : t('fav_add')}`;
}