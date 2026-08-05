function cottageCard(cottage) {
  const isFav = isFavorite(cottage.id);
  return `
        <div class="cottage-card" data-type="${cottage.cottage_type}">
            <div class="cottage-image">
                🏡
                <button class="fav-btn ${isFav ? "active" : ""}" 
                        onclick="toggleFav(${cottage.id}); event.stopPropagation();"
                        style="position:absolute;top:12px;right:12px;background:white;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
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

function toggleFav(id) {
  toggleFavorite(id);
  render();
}
