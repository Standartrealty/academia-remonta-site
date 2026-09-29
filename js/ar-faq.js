(() => {
  const dialog = document.getElementById('ar-faq-dialog');
  const triggers = document.querySelectorAll('[data-faq-open]');
  let previousFocus;
  if (!dialog || !triggers.length) return;
  let previousOverflow = '';
  const title = dialog.querySelector('#ar-faq-dialog-title');
  const description = dialog.querySelector('#ar-faq-dialog-desc');
  const submitText = dialog.querySelector('.t-btnflex__text');
  triggers.forEach(trigger => trigger.addEventListener('click', () => {
    previousFocus = trigger;
    if (trigger.closest('.ar-objects')) {
      title.innerHTML = 'Получить консультацию <span>по вашему объекту</span>';
      description.textContent = 'Расскажем, как подойти к ремонту, ответим на вопросы и сориентируем по бюджету. Вы сами решите, что делать дальше.';
      submitText.textContent = 'Получить консультацию';
    } else {
      title.innerHTML = 'Рассчитать стоимость <span>моего ремонта</span>';
      description.textContent = 'Уточним задачу → сориентируем по бюджету → вы решите, двигаться ли дальше.';
      submitText.textContent = 'Рассчитать стоимость';
    }
    previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    dialog.querySelector('input[type="tel"]').focus();
  }));
  dialog.querySelector('.ar-faq-dialog__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    previousFocus?.focus();
  });
  document.querySelectorAll('.ar-faq details').forEach(card => card.addEventListener('toggle', () => {
    if (card.open) document.querySelectorAll('.ar-faq details[open]').forEach(other => { if (other !== card) other.open = false; });
  }));
})();
