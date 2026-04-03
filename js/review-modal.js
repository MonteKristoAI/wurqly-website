/* ============================================================
   WURQLY — Review Gating Modal
   Rating >= 4 → Google Reviews | Rating < 4 → Internal feedback
   ============================================================ */

// CONFIG
const GOOGLE_REVIEWS_URL = 'https://g.page/r/wurqly/review';
const REVIEW_WEBHOOK_URL = 'https://primary-production-5fdce.up.railway.app/webhook/wurqly-review';
const FEEDBACK_CATEGORIES = ['Communication', 'Response Time', 'Quality of Work', 'Pricing', 'Professionalism', 'Other'];

let currentRating = 0;
let selectedCategories = [];

function openReviewModal() {
  const overlay = document.getElementById('review-modal-overlay');
  if (!overlay) return;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  showStep('rating');
  renderStars();
}

function closeReviewModal() {
  const overlay = document.getElementById('review-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  currentRating = 0;
  selectedCategories = [];
}

function showStep(step) {
  document.querySelectorAll('.review-step').forEach(s => s.classList.remove('active-step'));
  const target = document.getElementById('review-step-' + step);
  if (target) target.classList.add('active-step');
}

function renderStars() {
  const container = document.getElementById('star-container');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.innerHTML = '&#9733;';
    btn.className = 'star-btn' + (i <= currentRating ? ' active' : '');
    btn.setAttribute('aria-label', i + ' star' + (i > 1 ? 's' : ''));
    btn.onclick = () => {
      currentRating = i;
      renderStars();
      document.getElementById('review-continue-btn').disabled = false;
    };
    btn.onmouseenter = () => {
      container.querySelectorAll('.star-btn').forEach((s, idx) => {
        s.classList.toggle('active', idx < i);
      });
    };
    container.appendChild(btn);
  }
  container.onmouseleave = () => renderStars();
}

function handleRatingContinue() {
  if (currentRating >= 4) {
    window.open(GOOGLE_REVIEWS_URL, '_blank');
    showStep('thanks');
    setTimeout(closeReviewModal, 2500);
  } else {
    showStep('feedback');
    renderCategoryPills();
  }
}

function renderCategoryPills() {
  const container = document.getElementById('category-pills');
  if (!container) return;
  container.innerHTML = '';
  FEEDBACK_CATEGORIES.forEach(cat => {
    const pill = document.createElement('button');
    pill.textContent = cat;
    pill.className = 'category-pill' + (selectedCategories.includes(cat) ? ' selected' : '');
    pill.onclick = () => {
      if (selectedCategories.includes(cat)) {
        selectedCategories = selectedCategories.filter(c => c !== cat);
      } else {
        selectedCategories.push(cat);
      }
      renderCategoryPills();
    };
    container.appendChild(pill);
  });
}

function submitReviewFeedback() {
  const improvement = document.getElementById('review-improvement');
  const message = document.getElementById('review-message');
  const improvementVal = improvement ? improvement.value.trim() : '';
  const messageVal = message ? message.value.trim() : '';

  if (selectedCategories.length === 0 && !improvementVal && !messageVal) {
    const feedbackStep = document.getElementById('review-step-feedback');
    let notice = feedbackStep ? feedbackStep.querySelector('.feedback-notice') : null;
    if (!notice && feedbackStep) {
      notice = document.createElement('p');
      notice.className = 'feedback-notice';
      notice.style.cssText = 'color: var(--accent-dark); font-size: 0.875rem; margin-top: 0.5rem; font-weight: 600;';
      notice.textContent = 'Please provide some feedback';
      feedbackStep.appendChild(notice);
    }
    return;
  }

  const payload = {
    type: 'review_feedback',
    rating: currentRating,
    categories: selectedCategories,
    improvement: improvement ? improvement.value : '',
    message: message ? message.value : '',
    timestamp: new Date().toISOString(),
    source: 'wurqly-website'
  };

  fetch(REVIEW_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {});

  showStep('thanks');
  setTimeout(closeReviewModal, 2500);
}

// Close on overlay click
document.addEventListener('click', (e) => {
  if (e.target.id === 'review-modal-overlay') closeReviewModal();
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeReviewModal();
});
