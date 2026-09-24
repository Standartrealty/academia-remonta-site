(() => {
  const root = document.querySelector('.ar-offer');
  if (!root) return;

  const cities = {
    mahachkala: 'Махачкале',
    kaspiysk: 'Каспийске',
    izberbash: 'Избербаше'
  };
  const services = {
    apartment: 'Ремонт квартир под ключ',
    house: 'Ремонт домов под ключ',
    commercial: 'Ремонт коммерческих помещений'
  };
  const title = root.querySelector('[data-offer-title]');
  const subtitle = root.querySelector('[data-offer-subtitle]');
  const trigger = root.querySelector('.ar-offer__city-trigger');
  const options = root.querySelector('.ar-offer__city-options');
  const validCity = value => Object.hasOwn(cities, value) ? value : null;
  const validService = value => Object.hasOwn(services, value) ? value : null;
  let manualCity = null;
  let ipCity = null;
  let changedByUser = false;

  try { manualCity = validCity(localStorage.getItem('ar-selected-city')); } catch (_) {}

  function render() {
    const params = new URLSearchParams(location.search);
    const city = validCity(params.get('city')) || manualCity || ipCity;
    const service = validService(params.get('service'));
    const heading = `${service ? services[service] : 'Ремонт под ключ'} в ${cities[city] || 'Дагестане'}`;
    title.textContent = heading;
    root.setAttribute('aria-label', heading);
    subtitle.textContent = service
      ? 'От проекта до сдачи объекта — каждый этап под контролем.'
      : 'Квартиры • Дома • Коммерческие помещения';
  }

  function closeMenu() {
    options.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', () => {
    options.hidden = !options.hidden;
    trigger.setAttribute('aria-expanded', String(!options.hidden));
  });
  options.addEventListener('click', event => {
    const city = validCity(event.target.closest('[data-city]')?.dataset.city);
    if (!city) return;
    changedByUser = true;
    manualCity = city;
    try { localStorage.setItem('ar-selected-city', city); } catch (_) {}
    const url = new URL(location.href);
    url.searchParams.set('city', city);
    history.replaceState(history.state, '', url);
    render();
    closeMenu();
    trigger.focus();
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.ar-offer__city-switcher')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !options.hidden) { closeMenu(); trigger.focus(); }
  });
  window.addEventListener('popstate', render);
  render();

  const params = new URLSearchParams(location.search);
  if (!validCity(params.get('city')) && !manualCity) {
    fetch('/api/geo', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (changedByUser) return;
        ipCity = validCity(data?.city);
        render();
      })
      .catch(() => {});
  }
})();
