(() => {
  const compare = document.querySelector('.ar-offer__compare');
  if (!compare) return;
  const range = compare.querySelector('.ar-offer__range');
  const update = () => compare.style.setProperty('--split', `${range.value}%`);
  range.addEventListener('input', update);
  update();
})();
