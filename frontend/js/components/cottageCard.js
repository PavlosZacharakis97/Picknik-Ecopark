function getCottageImages(cottage) {
  if (cottage.images && cottage.images.length > 0) {
    return cottage.images.map((img) => img.image);
  }
  return cottage.image ? [cottage.image] : [];
}

function getCottageImage(cottage) {
  return getCottageImages(cottage)[0] || "";
}

function cottageCard(cottage) {
  const isFav = isFavorite(cottage.id);
  const image = getCottageImage(cottage);
  const name = getCottageName(cottage);
  return `
        <div class="cottage-card" data-type="${cottage.cottage_type}" onclick="handleCottageCardClick(event, ${cottage.id})">
            <div class="cottage-image">
                ${image ? `<img src="${image}" alt="${name}">` : icon('cottage', 40)}
                <button class="fav-btn ${isFav ? "active" : ""}" onclick="toggleFav(event, ${cottage.id})">
                    ${iconHeart(isFav)}
                </button>
            </div>
            <div class="cottage-info">
                <span class="cottage-type">${getCottageTypeName(cottage.cottage_type)}</span>
                <h3 class="cottage-name">${name}</h3>
                <div class="cottage-features">
                    <span><img src="/static/assets/images/people.png" class="feature-icon" alt="">${cottage.max_guests}</span>
                    <span><img src="/static/assets/images/bed.png" class="feature-icon" alt="">${cottage.bedrooms}</span>
                    ${cottage.has_bbq ? '<span><img src="/static/assets/images/barbecue.png" class="feature-icon" alt="">BBQ</span>' : ""}
                </div>
                <div class="cottage-price">
                    ${cottage.price_per_night.toLocaleString()} Kč
                    <span>${t('cottage_per_night')}</span>
                </div>
                <a href="#/cottages/${cottage.id}" class="btn btn-outline" style="margin-top:12px;" onclick="event.stopPropagation()">${t('cottage_details_btn')}</a>
            </div>
        </div>
    `;
}

function handleCottageCardClick(event, id) {
  navigate(getStorage('user') ? '/booking/' + id : '/cottages/' + id);
}

function getCottageTypeName(type) {
  const types = { standard: t('cottage_type_standard'), comfort: t('cottage_type_comfort'), luxury: t('cottage_type_luxury') };
  return types[type] || type;
}

function toggleFav(event, id) {
  event.preventDefault();
  event.stopPropagation();

  toggleFavorite(id);

  const btn = event.currentTarget;
  const isFav = isFavorite(id);
  btn.classList.toggle('active', isFav);
  btn.innerHTML = iconHeart(isFav);

  btn.classList.remove('pop');
  void btn.offsetWidth;
  btn.classList.add('pop');
}
