// Диалог подтверждения вместо нативного confirm()

function confirmDialog(message, { confirmText, cancelText } = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
            <div class="modal confirm-dialog">
                <p class="confirm-dialog-message">${message}</p>
                <div class="confirm-dialog-actions">
                    <button type="button" class="btn btn-outline" data-action="cancel">${cancelText || t('cancel_btn')}</button>
                    <button type="button" class="btn" data-action="confirm">${confirmText || t('confirm_btn')}</button>
                </div>
            </div>
        `;

    const finish = (result) => {
      overlay.remove();
      resolve(result);
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) finish(false);
    });
    overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => finish(false));
    overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => finish(true));

    document.body.appendChild(overlay);
  });
}
