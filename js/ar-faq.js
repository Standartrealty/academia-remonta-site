(() => {
  const dialog = document.getElementById('ar-faq-dialog');
  const trigger = document.querySelector('[data-faq-open]');
  if (!dialog || !trigger) return;
  let previousOverflow = '';
  trigger.addEventListener('click', () => {
    previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    dialog.querySelector('input[type="tel"]').focus();
  });
  dialog.querySelector('.ar-faq-dialog__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    trigger.focus();
  });
  document.querySelectorAll('.ar-faq details').forEach(card => card.addEventListener('toggle', () => {
    if (card.open) document.querySelectorAll('.ar-faq details[open]').forEach(other => { if (other !== card) other.open = false; });
  }));
})();
