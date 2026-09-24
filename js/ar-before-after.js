(() => {
  const compare = document.querySelector('.ar-offer__compare');
  if (!compare) return;
  const range = compare.querySelector('.ar-offer__range');
  let activePointer = null;

  function update(value) {
    const split = Math.max(0, Math.min(100, Number(value)));
    range.value = String(split);
    compare.style.setProperty('--split', `${split}%`);
  }

  function moveTo(clientX) {
    const bounds = compare.getBoundingClientRect();
    if (!bounds.width) return;
    update(Math.round((clientX - bounds.left) / bounds.width * 100));
  }

  range.addEventListener('pointerdown', event => {
    activePointer = event.pointerId;
    range.setPointerCapture(event.pointerId);
    moveTo(event.clientX);
  });
  range.addEventListener('pointermove', event => {
    if (event.pointerId === activePointer) moveTo(event.clientX);
  });
  function endDrag(event) {
    if (event.pointerId === activePointer) activePointer = null;
  }
  range.addEventListener('pointerup', endDrag);
  range.addEventListener('pointercancel', endDrag);
  range.addEventListener('input', () => update(range.value));
  update(range.value);
})();
