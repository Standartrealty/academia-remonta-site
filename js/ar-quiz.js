(() => {
  const quiz = document.getElementById('ar-quiz');
  const form = document.getElementById('ar-quiz-form');
  if (!quiz || !form) return;
  const steps = [...form.querySelectorAll('.ar-quiz__step')];
  const next = form.querySelector('.ar-quiz__next');
  const back = form.querySelector('.ar-quiz__back');
  const error = form.querySelector('.ar-quiz__error');
  const progress = quiz.querySelector('.ar-quiz__progress span');
  let current = 0;
  let previousFocus;
  function showStep(index) {
    current = index;
    steps.forEach((step, i) => { step.hidden = i !== index; });
    progress.style.width = `${(index + 1) / steps.length * 100}%`;
    back.hidden = index === 0;
    next.textContent = index === steps.length - 1 ? 'Получить расчёт →' : 'Продолжить →';
    error.hidden = true;
    steps[index].querySelector('legend').focus?.();
  }
  function close() {
    quiz.hidden = true;
    document.body.style.overflow = '';
    previousFocus?.focus();
  }
  document.querySelectorAll('[data-open-quiz]').forEach(button => button.addEventListener('click', () => {
    previousFocus = document.activeElement;
    form.reset();
    showStep(0);
    quiz.hidden = false;
    document.body.style.overflow = 'hidden';
    quiz.querySelector('.ar-quiz__close').focus();
  }));
  quiz.querySelectorAll('[data-close-quiz]').forEach(button => button.addEventListener('click', close));
  document.addEventListener('keydown', event => { if (!quiz.hidden && event.key === 'Escape') close(); });
  back.addEventListener('click', () => showStep(current - 1));
  next.addEventListener('click', () => {
    if (!steps[current].querySelector('input:checked')) { error.hidden = false; return; }
    if (current < steps.length - 1) { showStep(current + 1); return; }
    const answers = new FormData(form);
    const message = `Здравствуйте! Хочу расчёт ремонта. Объект: ${answers.get('type')}. Площадь: ${answers.get('area')}. Работы: ${answers.get('work')}.`;
    window.open(`https://wa.me/79896661088?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });
})();
