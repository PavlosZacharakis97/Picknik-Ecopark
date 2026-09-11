// Всплывающие уведомления вместо нативных alert()

const TOAST_DURATION = 4500;

function getToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = 'info', duration = TOAST_DURATION) {
  const container = getToastContainer();

  const toastEl = document.createElement('div');
  toastEl.className = `toast toast--${type}`;
  toastEl.setAttribute('role', 'status');
  toastEl.innerHTML = `
        <span class="toast-icon">${icon(`toast-${type}`, 22)}</span>
        <span class="toast-message">${message}</span>
        <button type="button" class="toast-close" aria-label="${typeof t === 'function' ? t('close') : 'Закрыть'}">${icon('toast-close', 14)}</button>
        <span class="toast-progress" style="animation-duration:${duration}ms;"></span>
    `;

  const remove = () => {
    if (!toastEl.isConnected) return;
    toastEl.classList.add('toast--leaving');
    setTimeout(() => toastEl.remove(), 200);
  };

  toastEl.querySelector('.toast-close').addEventListener('click', remove);
  setTimeout(remove, duration);

  container.appendChild(toastEl);
  return toastEl;
}

function toastSuccess(message, duration) {
  return showToast(message, 'success', duration);
}

function toastError(message, duration) {
  return showToast(message, 'error', duration);
}
