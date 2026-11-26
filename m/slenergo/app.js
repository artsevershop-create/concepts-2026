(function () {
  "use strict";
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;

  /* версия для слабовидящих */
  var eye = document.getElementById('eye');
  function eyeSync() {
    var on = root.classList.contains('a11y');
    eye.setAttribute('aria-pressed', on);
    eye.querySelector('span').textContent = on ? 'Обычная версия' : 'Для слабовидящих';
  }
  eye.addEventListener('click', function () {
    var on = root.classList.toggle('a11y');
    try { localStorage.setItem('slen-a11y', on ? '1' : '0'); } catch (e) {}
    eyeSync(); dispatchEvent(new Event('resize'));
  });
  eyeSync();

  /* дом в разрезе: вкладки и щелчки по чертежу */
  var tabs = $$('.tabs [role=tab]'), dw = document.getElementById('dw'), cur = '';
  // мягкое свечение под каждой сетью; pathLength=1 — чтобы линия прорисовывалась от ввода в дом
  $$('.sys', dw).forEach(function (g) {
    var ln = g.querySelector('.ln'), h = ln.cloneNode(); h.setAttribute('class', 'halo'); h.setAttribute('pathLength', 1);
    ln.setAttribute('pathLength', 1); g.insertBefore(h, ln);
  });
  function pick(s) {
    tabs.forEach(function (t) {
      var on = t.dataset.s === s, p = document.getElementById('p-' + t.dataset.s);
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; p.hidden = !on;
      if (on && cur && cur !== s) { p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter'); }
    });
    cur = s;
    dw.setAttribute('data-on', s);
    $$('.sys,.pill', dw).forEach(function (g) { g.classList.toggle('on', g.dataset.s === s); });
    // выбранную сеть рисуем поверх остальных
    var g = dw.querySelector('.sys[data-s=' + s + ']'); dw.insertBefore(g, dw.querySelector('.lead-ln'));
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(t.dataset.s); });
    t.addEventListener('keydown', function (e) {
      var n = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (n === undefined) return; e.preventDefault(); var x = tabs[(n + tabs.length) % tabs.length]; pick(x.dataset.s); x.focus();
    });
  });
  dw.addEventListener('click', function (e) { var g = e.target.closest('.sys,.pill'); if (g) pick(g.dataset.s); });
  pick('he');
  // первый показ сцены: перерисовать выбранную сеть, когда дом попал в кадр
  var seen = false;
  KIT.onView(dw, function (v) {
    if (!v || seen) return; seen = true;
    var g = dw.querySelector('.sys.on'); g.classList.remove('on'); void g.getBoundingClientRect(); g.classList.add('on');
  }, { threshold: .35 });

  /* первый экран: снег и медленный параллакс архивного фото */
  var cv = document.getElementById('snow'), sky = cv.parentNode, cx = cv.getContext('2d'), flakes = [], W = 0, H = 0;
  function size() {
    var r = cv.getBoundingClientRect(); if (!r.width || !r.height) return; // защита от 0×0
    W = cv.width = Math.round(r.width * .5); H = cv.height = Math.round(r.height * .5);
    flakes = []; for (var i = 0, n = Math.round(W / 9); i < n; i++) flakes.push({ x: Math.random() * W, y: Math.random() * H, r: .4 + Math.random() * 1.3, v: 4 + Math.random() * 9, p: Math.random() * 6.3 });
  }
  size(); addEventListener('resize', size);
  KIT.raf(cv, function (t, dt) {
    if (!W || root.classList.contains('a11y')) return;
    cx.clearRect(0, 0, W, H); cx.fillStyle = '#E9EEFF';
    flakes.forEach(function (f) {
      f.y += f.v * f.r * dt / 1000; if (f.y > H + 2) { f.y = -2; f.x = Math.random() * W; }
      cx.globalAlpha = .25 + f.r * .3; cx.beginPath(); cx.arc(f.x + Math.sin(t / 2600 + f.p) * 6 * f.r, f.y, f.r, 0, 6.283); cx.fill();
    });
  }, 24);
  if (!KIT.REDUCED) {
    var tick = false, inHero = true;
    KIT.onView(sky, function (v) { inHero = v; });
    addEventListener('scroll', function () {
      if (tick || !inHero) return; tick = true;
      requestAnimationFrame(function () { tick = false; sky.style.transform = 'translate3d(0,' + (scrollY * .22).toFixed(1) + 'px,0)'; });
    }, { passive: true });
  }

  /* на узком экране чертёж обрезается по дому, чтобы линии читались */
  var narrow = matchMedia('(max-width:640px)');
  function box() { dw.setAttribute('viewBox', narrow.matches ? '110 55 520 505' : '0 0 760 590'); }
  narrow.addEventListener('change', box); box();

  /* телефоны отделов */
  $$('td[data-p]').forEach(function (td) {
    td.dataset.p.split(' ').forEach(function (p) {
      var a = document.createElement('a'); a.className = 'tel'; a.href = 'tel:+734922' + p.replace(/-/g, ''); a.textContent = p; td.appendChild(a);
    });
  });

  /* даты по Салехарду (UTC+5) */
  var today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Yekaterinburg', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  var day = +today.slice(8), month = +today.slice(5, 7) - 1;
  var GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  $$('[data-win]').forEach(function (el) {
    var w = el.dataset.win.split('-').map(Number), open = day >= w[0] && day <= w[1];
    el.textContent = open ? 'сегодня приём открыт' : 'сейчас закрыт, откроется ' + w[0] + ' ' + GEN[day < w[0] ? month : (month + 1) % 12];
    el.classList.toggle('open', open); el.hidden = false;
  });
  $$('[data-day]').forEach(function (el) { if (el.dataset.day < today) el.textContent = 'дата прошла'; });

  /* тарифы показываются только пока действуют */
  if (today > '2026-12-31') {
    $$('[data-tariff]').forEach(function (el) { el.hidden = true; });
    document.getElementById('expired').hidden = false;
    $$('.pane [data-tariff]').forEach(function (el) {
      var p = document.createElement('p'); p.textContent = 'Срок опубликованных тарифов истёк, уточните актуальные цены.'; el.after(p);
    });
  }
})();
