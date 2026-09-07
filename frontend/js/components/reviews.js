let reviewFormRating = 5;

async function loadCottageReviews(cottageId) {
  try {
    return await getCottageReviews(cottageId);
  } catch (err) {
    return [];
  }
}

function renderReviewsSection(cottageId, reviews) {
  reviewFormRating = 5;
  const user = getStorage('user');

  return `
        <div class="reviews-section" id="cottage-reviews">
            ${renderReviewsInner(cottageId, reviews, user)}
        </div>
    `;
}

function renderReviewsInner(cottageId, reviews, user) {
  const count = reviews.length;
  const avg = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  const userReview = user && reviews.find((r) => r.user === user.id);

  let formArea;
  if (!user) {
    formArea = `<p class="reviews-login-prompt">${t('reviews_login_prompt')} <a href="#/login">${t('login_short')}</a></p>`;
  } else if (userReview) {
    formArea = `<p class="reviews-already-submitted">${t('reviews_already_submitted')}</p>`;
  } else {
    formArea = renderReviewForm(cottageId);
  }

  return `
        <div class="reviews-header">
            <h3>${t('reviews_title')}</h3>
            ${count > 0 ? `
                <div class="reviews-summary">
                    <span class="reviews-avg">${avg.toFixed(1)}</span>
                    <div>
                        <div class="review-stars">${starsMarkup(avg)}</div>
                        <div class="reviews-count">${t('reviews_count', { n: count })}</div>
                    </div>
                </div>
            ` : ''}
        </div>

        ${count === 0
          ? `<p class="reviews-empty">${t('reviews_empty')}</p>`
          : `<div class="reviews-list">${reviews.map(renderReviewItem).join('')}</div>`}

        ${formArea}
    `;
}

function renderReviewItem(review) {
  const initial = (review.user_name || '?').charAt(0).toUpperCase();
  return `
        <div class="review-item">
            <div class="review-avatar">${initial}</div>
            <div class="review-body">
                <div class="review-item-header">
                    <span class="review-author">${review.user_name || t('guest_fallback')}</span>
                    <span class="review-date">${formatDate(review.created_at)}</span>
                </div>
                <div class="review-stars">${starsMarkup(review.rating)}</div>
                ${review.comment ? `<p class="review-comment">${review.comment}</p>` : ''}
            </div>
        </div>
    `;
}

function starsMarkup(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star${i <= Math.round(rating) ? ' star--filled' : ''}">★</span>`;
  }
  return html;
}

function renderReviewForm(cottageId) {
  return `
        <form class="review-form" onsubmit="handleReviewSubmit(event, ${cottageId})">
            <label>${t('reviews_your_rating')}</label>
            <div class="star-input" id="star-input">
                ${starInputMarkup()}
            </div>
            <input type="hidden" name="rating" value="${reviewFormRating}">
            <div class="form-group" style="margin-top:12px;">
                <textarea name="comment" rows="3" placeholder="${t('reviews_comment_placeholder')}"></textarea>
            </div>
            <button type="submit" class="btn btn-sm">${t('reviews_submit')}</button>
        </form>
    `;
}

function starInputMarkup() {
  let html = '';
  for (let i = 5; i >= 1; i--) {
    html += `<button type="button" class="star-input-btn${i <= reviewFormRating ? ' star--filled' : ''}" onclick="setReviewRating(${i})" aria-label="${i}">★</button>`;
  }
  return html;
}

function setReviewRating(value) {
  reviewFormRating = value;
  const container = document.getElementById('star-input');
  if (container) container.innerHTML = starInputMarkup();
  const hidden = document.querySelector('.review-form input[name="rating"]');
  if (hidden) hidden.value = value;
}

async function handleReviewSubmit(event, cottageId) {
  event.preventDefault();
  const form = event.target;
  const data = {
    cottage: cottageId,
    rating: parseInt(form.rating.value, 10),
    comment: form.comment.value,
  };

  Array.from(form.elements).forEach((el) => { el.disabled = true; });

  try {
    await createReview(data);
    const reviews = await loadCottageReviews(cottageId);
    const container = document.getElementById('cottage-reviews');
    if (container) container.innerHTML = renderReviewsInner(cottageId, reviews, getStorage('user'));
  } catch (err) {
    toastError(err.message);
    Array.from(form.elements).forEach((el) => { el.disabled = false; });
  }
}
