let cachedTips = [];
let currentTipIndex = 0;

function tipsCarousel(tips) {
  cachedTips = tips || [];
  currentTipIndex = 0;
  if (cachedTips.length === 0) return "";

  return `
        <div class="tips-carousel">
            <div id="tips-carousel-track">${tipCardContent(cachedTips[0])}</div>
        </div>
    `;
}

function tipCardContent(tip) {
  const tags = (tip.tags || "").split(",").map((t) => t.trim()).filter(Boolean);

  return `
        <div class="tips-carousel-layout">
            <div class="tip-image"><img src="${tip.image || "/static/assets/images/illustration-tip-waiter.png"}" alt=""></div>
            <div>
                <div class="tip-tags">
                    ${tags.map((t) => `<span class="tip-tag">#${t}</span>`).join("")}
                </div>
                <h3 class="tip-title">${tip.title}</h3>
                <p class="tip-body">${tip.body}</p>
            </div>
        </div>
        <div class="tips-footer">
            <button class="tips-nav-btn" onclick="tipsCarouselNav(-1)">&#8592;</button>
            <div class="tips-dots">
                ${cachedTips.map((_, i) => `<span class="tips-dot ${i === currentTipIndex ? "active" : ""}" onclick="tipsCarouselGoto(${i})"></span>`).join("")}
            </div>
            <button class="tips-nav-btn" onclick="tipsCarouselNav(1)">&#8594;</button>
        </div>
    `;
}

function tipsCarouselNav(direction) {
  if (cachedTips.length === 0) return;
  currentTipIndex = (currentTipIndex + direction + cachedTips.length) % cachedTips.length;
  updateTipsCarouselTrack();
}

function tipsCarouselGoto(index) {
  currentTipIndex = index;
  updateTipsCarouselTrack();
}

function updateTipsCarouselTrack() {
  const track = document.getElementById("tips-carousel-track");
  if (track) track.innerHTML = tipCardContent(cachedTips[currentTipIndex]);
}
