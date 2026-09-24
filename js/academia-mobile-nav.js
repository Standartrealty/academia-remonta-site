(function () {
  function icon(name) {
    var icons = {
      home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-6h6v6"/></svg>',
      projects: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M4 9h16M10 3v18"/></svg>',
      reviews: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H8l-4 4z"/><path d="M8 9h8M8 12h5"/></svg>',
      menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
      wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.7a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.7Z"/><path d="M9 8.1c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.8 1.8c.1.2.1.4 0 .6l-.5.7c-.1.2-.1.3 0 .5.5.9 1.2 1.6 2.1 2.1.2.1.4.1.5 0l.7-.6c.2-.1.4-.2.6-.1l1.8.8c.3.1.4.3.4.5v.5c0 .3-.1.5-.5.7-.4.2-1.2.4-2 .2-1.2-.3-2.5-1.1-3.6-2.2-1.1-1.1-1.8-2.3-2.1-3.5-.2-.8 0-1.6.2-2Z"/></svg>'
    };
    return icons[name];
  }
  function init() {
    if (document.querySelector('.ar-mobile-nav')) return;
    var nav = document.createElement('nav');
    nav.className = 'ar-mobile-nav';
    nav.setAttribute('aria-label', 'Мобильная навигация');
    nav.innerHTML =
      '<a class="ar-mobile-nav__item" href="page113433316.html">' + icon('home') + '<span>Главная</span></a>' +
      '<a class="ar-mobile-nav__item" href="page119449126.html">' + icon('projects') + '<span>Проекты</span></a>' +
      '<a class="ar-mobile-nav__item ar-mobile-nav__whatsapp" href="https://wa.me/79896661088" target="_blank" rel="noopener" aria-label="Написать в WhatsApp"><span class="ar-mobile-nav__bubble">' + icon('wa') + '</span><span>Связаться</span></a>' +
      '<a class="ar-mobile-nav__item" href="page113433316.html#rec1833915421">' + icon('reviews') + '<span>Отзывы</span></a>' +
      '<button class="ar-mobile-nav__item" type="button" aria-expanded="false">' + icon('menu') + '<span>Меню</span></button>';
    var panel = document.createElement('div');
    panel.className = 'ar-mobile-panel';
    panel.innerHTML = '<div class="ar-mobile-panel__sheet"><a href="page113433316.html">Главная</a><a href="page119449126.html">Все проекты</a><a href="tel:+79896661088">Позвонить: 8 989 666-10-88</a><a href="https://wa.me/79896661088" target="_blank" rel="noopener">WhatsApp</a></div>';
    document.body.appendChild(panel); document.body.appendChild(nav);
    var button = nav.querySelector('button');
    button.addEventListener('click', function () { var open = panel.classList.toggle('is-open'); button.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    panel.addEventListener('click', function (event) { if (event.target === panel) { panel.classList.remove('is-open'); button.setAttribute('aria-expanded', 'false'); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());
