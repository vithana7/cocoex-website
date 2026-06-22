const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusable(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE))
    .filter((el) => el.offsetParent !== null || el === document.activeElement);
}

export function createFocusTrap(container) {
  const handler = (e) => {
    if (e.key !== 'Tab') return;
    const f = getFocusable(container);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  return {
    activate() { document.addEventListener('keydown', handler); },
    deactivate() { document.removeEventListener('keydown', handler); },
  };
}

export function wireModalDismiss({ overlay, closeBtn, onClose, isOpenFn }) {
  if (overlay) overlay.addEventListener('click', onClose);
  if (closeBtn) closeBtn.addEventListener('click', onClose);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpenFn()) onClose();
  });
}
