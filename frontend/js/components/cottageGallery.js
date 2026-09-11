let galleryImages = [];
let galleryIndex = 0;
let galleryAlt = '';

function cottageGallery(images, altText, height) {
  galleryImages = images || [];
  galleryIndex = 0;
  galleryAlt = altText || '';
  const h = height || '400px';

  if (galleryImages.length === 0) {
    return `<div class="booking-image" style="height:${h};color:var(--text-light);">${icon('cottage', 64)}</div>`;
  }

  return `
        <div class="cottage-gallery">
            <div class="booking-image" id="cottage-gallery-image" style="height:${h};padding:0;">
                ${galleryImageContent()}
            </div>
            ${galleryImages.length > 1 ? `
            <div class="tips-footer cottage-gallery-nav">
                <button type="button" class="tips-nav-btn" onclick="cottageGalleryNav(-1)">&#8592;</button>
                <div class="tips-dots" id="cottage-gallery-dots">${galleryDots()}</div>
                <button type="button" class="tips-nav-btn" onclick="cottageGalleryNav(1)">&#8594;</button>
            </div>
            ` : ''}
        </div>
    `;
}

function galleryImageContent() {
  return `<img src="${galleryImages[galleryIndex]}" alt="${galleryAlt}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius);">`;
}

function galleryDots() {
  return galleryImages.map((_, i) => `<span class="tips-dot ${i === galleryIndex ? 'active' : ''}" onclick="cottageGalleryGoto(${i})"></span>`).join('');
}

function cottageGalleryNav(direction) {
  if (galleryImages.length === 0) return;
  galleryIndex = (galleryIndex + direction + galleryImages.length) % galleryImages.length;
  updateCottageGallery();
}

function cottageGalleryGoto(index) {
  galleryIndex = index;
  updateCottageGallery();
}

function updateCottageGallery() {
  const img = document.getElementById('cottage-gallery-image');
  if (img) img.innerHTML = galleryImageContent();
  const dots = document.getElementById('cottage-gallery-dots');
  if (dots) dots.innerHTML = galleryDots();
}
