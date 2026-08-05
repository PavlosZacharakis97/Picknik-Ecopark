function cottageCard(cottage) {
  const isFav = isFavorite(cottage.id);
  return `
        <div class="cottage-card" data-type="${cottage.cottage_type}">
            <div class="cottage-image">
                🏡
                <button class="fav-btn ${isFav ? "active" : ""}" onclick="toggleFav(event, ${cottage.id})">
                    ${isFav ? "❤️" : "🤍"}
                </button>
            </div>
            <div class="cottage-info">
                <span class="cottage-type">${getCottageTypeName(cottage.cottage_type)}</span>
                <h3 class="cottage-name">${cottage.name}</h3>
                <div class="cottage-features">
                    <span>👥 ${cottage.max_guests}</span>
                    <span>🛏️ ${cottage.bedrooms}</span>
                    ${cottage.has_bbq ? "<span>🔥 BBQ 🔥</span>" : ""}
                </div>
                <div class="cottage-price">
                    ${cottage.price_per_night.toLocaleString()} Kč
                    <span>/ ночь</span>
                </div>
                <a href="#/cottages/${cottage.id}" class="btn btn-outline" style="margin-top:12px;">Подробнее</a>
            </div>
        </div>
    `;
}

function getCottageTypeName(type) {
  const types = { standard: "Стандарт", comfort: "Комфорт", luxury: "Люкс" };
  return types[type] || type;
}

function toggleFav(event, id) {
  event.preventDefault();
  event.stopPropagation();

  toggleFavorite(id);

  const btn = event.currentTarget;
  const isFav = isFavorite(id);
  btn.classList.toggle('active', isFav);
  btn.textContent = isFav ? '❤️' : '🤍';

  btn.classList.remove('pop');
  void btn.offsetWidth;
  btn.classList.add('pop');
}
