/* Премиум-слой: прелоадер, вход hero (GSAP + SplitText), курсор-прицел, кнопки, подсказки, прогресс, снег.
   Схема аэродрома (DrawSVG, MotionPath, огни) живёт в app.js. Без GSAP или при reduced motion страница остаётся рабочей. */
addEventListener('DOMContentLoaded', function () {
  var d = document, root = d.documentElement, G = window.gsap, ST = window.ScrollTrigger, FX = window.FX = window.FX || {};
  var $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
  function off() { root.classList.remove('pre', 'cov'); }
  if (!G || RM) { off(); }
  if (G && G.registerPlugin) G.registerPlugin.apply(G, [window.ScrollTrigger, window.SplitText, window.DrawSVGPlugin, window.MotionPathPlugin].filter(Boolean));

  /* ---------- кнопки: текст перекатывается, заливка из точки входа, стрелка ---------- */
  $$('.btn, .doc a').forEach(function (b) {
    if (b.matches('.btn') && !b.querySelector('.rt')) {
      var t = b.textContent.trim(), rt = d.createElement('span'), a = d.createElement('span'), c = d.createElement('span');
      rt.className = 'rt'; a.textContent = t; c.textContent = t; c.setAttribute('aria-hidden', 'true'); rt.append(a, c); b.textContent = ''; b.appendChild(rt);
    }
    b.addEventListener('pointerenter', function (e) { var r = b.getBoundingClientRect(); b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    b.addEventListener('pointerleave', function (e) { var r = b.getBoundingClientRect(); b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
  ['#act1', '#next', '.form button[type=submit]'].forEach(function (s) { var e = $(s); if (e) e.setAttribute('data-arrow', ''); });

  /* ---------- подсказки ---------- */
  var tip = d.createElement('div'); tip.className = 'tip'; tip.setAttribute('role', 'tooltip'); tip.id = 'tip'; d.body.appendChild(tip);
  function showTip(el) {
    tip.textContent = el.getAttribute('data-tip'); tip.classList.add('on'); el.setAttribute('aria-describedby', 'tip');
    var r = el.getBoundingClientRect(), w = tip.offsetWidth; tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
    tip.style.top = (r.top - tip.offsetHeight - 10 < 8 ? r.bottom + 10 : r.top - tip.offsetHeight - 10) + 'px';
  }
  function hideTip(el) { tip.classList.remove('on'); if (el) el.removeAttribute('aria-describedby'); }
  $$('[data-tip]').forEach(function (e) {
    e.tabIndex = 0; e.addEventListener('pointerenter', function () { showTip(e); }); e.addEventListener('pointerleave', function () { hideTip(e); });
    e.addEventListener('focus', function () { showTip(e); }); e.addEventListener('blur', function () { hideTip(e); });
    e.addEventListener('keydown', function (k) { if (k.key === 'Escape') hideTip(e); });
  });

  /* ---------- свет за курсором на карточках, наклон врезки ---------- */
  var spots = '.rule,.doc,.whos .who,.years li,.stats li';
  $$(spots).forEach(function (e) { e.classList.add('spot'); });
  d.addEventListener('pointermove', function (e) {
    var s = e.target.closest && e.target.closest('.spot'); if (!s) return; var r = s.getBoundingClientRect(); s.style.setProperty('--x', (e.clientX - r.left) + 'px'); s.style.setProperty('--y', (e.clientY - r.top) + 'px');
  }, { passive: true });
  if (G && FINE && !RM) $$('.form, .mini').forEach(function (el) {
    G.set(el, { transformPerspective: 900 }); var rx = G.quickTo(el, 'rotationX', { duration: .6, ease: 'power3' }), ry = G.quickTo(el, 'rotationY', { duration: .6, ease: 'power3' });
    el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 3); rx(-((e.clientY - r.top) / r.height - .5) * 3); });
    el.addEventListener('pointerleave', function () { rx(0); ry(0); });
  });

  /* ---------- демо-форма: состояния кнопки ---------- */
  d.addEventListener('submit', function (e) {
    var f = e.target; if (!f.matches('[data-demo-form]') || f.dataset.go) { if (f.dataset) delete f.dataset.go; return; }
    e.preventDefault(); e.stopPropagation(); var b = $('button[type=submit]', f); b.classList.add('busy'); b.querySelector('.rt>span:first-child').textContent = 'Формируем…'; b.querySelector('.rt>span:last-child').textContent = 'Формируем…';
    setTimeout(function () {
      b.classList.remove('busy'); f.dataset.go = 1; f.requestSubmit();
      var done = $('.done', f); if (G && !RM) G.fromTo(done, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, ease: 'power3.out' });
    }, RM ? 0 : 900);
  }, true);

  /* ---------- снег: редкий, на canvas ---------- */
  if (window.KIT) {
    var cv = d.createElement('canvas'); cv.className = 'snow'; cv.setAttribute('aria-hidden', 'true'); d.body.appendChild(cv);
    var g = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(2, devicePixelRatio || 1), N = innerWidth < 700 ? 20 : 36, P = [], i;
    var rnd = function () { return Math.random(); };
    for (i = 0; i < N; i++) P.push({ x: rnd(), y: rnd(), r: 2.2 + rnd() * 4, v: .3 + rnd() * .5, ph: rnd() * 6.3, a: .25 + rnd() * .3 });
    var size = function () { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); }; size(); addEventListener('resize', size);
    KIT.raf(cv, function (t, dt) {
      g.clearRect(0, 0, W, H); g.lineWidth = 1; g.lineCap = 'round';
      for (var k = 0; k < P.length; k++) {
        var p = P[k]; p.y += p.v * dt / 16 / H * 3.2; if (p.y > 1.03) { p.y = -.03; p.x = rnd(); }
        var x = p.x * W + Math.sin(t / 1700 + p.ph) * 18, y = p.y * H; g.strokeStyle = 'rgba(0,102,153,' + p.a + ')'; g.beginPath();
        for (var a = 0; a < 3; a++) { var an = a * Math.PI / 3 + t / 9000 * (k % 2 ? 1 : -1); g.moveTo(x - Math.cos(an) * p.r, y - Math.sin(an) * p.r); g.lineTo(x + Math.cos(an) * p.r, y + Math.sin(an) * p.r); }
        g.stroke();
      }
    }, 30);
  }

  if (!G || RM) { finishLight(); return; }

  /* ---------- прогресс чтения, шапка, разделы ---------- */
  var bar = $('.prog i'), hdr = $('[data-header]');
  ST.create({ start: 0, end: 'max', onUpdate: function (s) { G.set(bar, { scaleX: s.progress }); } });
  ST.create({ trigger: '.atlas', start: 'top top', end: 'bottom bottom', onToggle: function (s) { hdr.classList.toggle('keep', s.isActive); } });
  [['#compare', '#airlines'], ['#airlines', '#pax'], ['#pax', '#about'], ['#about', '#contacts']].forEach(function (p) {
    var prev = $(p[0] + ' .wrap'); if (!prev) return;
    G.fromTo(prev, { scale: 1, opacity: 1, transformOrigin: '50% 100%' }, { scale: .95, opacity: .45, ease: 'none', scrollTrigger: { trigger: p[1], start: 'top bottom', end: 'top 25%', scrub: true } });
  });
  var mq = $('.marq-in'), mt = G.to(mq, { xPercent: -50, duration: 36, ease: 'none', repeat: -1 });
  ST.create({ trigger: '.marq', start: 'top bottom', end: 'bottom top', onToggle: function (s) { if (s.isActive) mt.play(); else mt.pause(); } });
  mt.pause();

  /* бегунок меню */
  var run = $('.runner'), nav = $('#nav');
  function place() {
    var a = $('a[aria-current]', nav); if (!a || innerWidth <= 1240) { G.to(run, { opacity: 0, duration: .3 }); return; }
    G.to(run, { x: a.offsetLeft, width: a.offsetWidth, opacity: 1, duration: .55, ease: 'power3.out', overwrite: true });
  }
  new MutationObserver(place).observe(nav, { subtree: true, attributes: true, attributeFilter: ['aria-current'] }); addEventListener('resize', place); place();

  /* ---------- курсор-прицел ---------- */
  if (FINE) {
    var cur = d.createElement('div'); cur.className = 'cur'; cur.setAttribute('aria-hidden', 'true');
    var hx = []; for (i = 0; i < 6; i++) { var an = Math.PI / 3 * i - Math.PI / 2; hx.push((26 * Math.cos(an)).toFixed(1) + ',' + (26 * Math.sin(an)).toFixed(1)); }
    cur.innerHTML = '<div class="cur-ring"><div class="cur-in"><svg viewBox="-30 -30 60 60"><polygon points="' + hx.join(' ') + '"/><path class="tk" d="M0 -30V-14M0 14V30M-30 0H-14M14 0H30"/></svg></div></div><div class="cur-dot"></div><div class="cur-lab"></div>';
    d.body.appendChild(cur); root.classList.add('has-cur');
    var ring = $('.cur-ring', cur), dot = $('.cur-dot', cur), lab = $('.cur-lab', cur), lx = G.quickTo(lab, 'x', { duration: .3, ease: 'power3' }), ly = G.quickTo(lab, 'y', { duration: .3, ease: 'power3' });
    var qx = G.quickTo(ring, 'x', { duration: .4, ease: 'power3' }), qy = G.quickTo(ring, 'y', { duration: .4, ease: 'power3' }), dx = G.quickSetter(dot, 'x', 'px'), dy = G.quickSetter(dot, 'y', 'px');
    var CODE = { all: 'ОБЗОР', rwy: 'ВПП', radio: 'РТО', light: 'ОГНИ', term: 'СПЗ', heli: 'ВЕРТ', ground: 'ПОЖ' }, hl = null, seen = false;
    function setZone(node) { if (hl && hl !== node) hl.classList.remove('hl'); hl = node || null; if (hl) hl.classList.add('hl'); }
    function kind(t) {
      if (!t || !t.closest) return {};
      if (t.closest('input:not([type=radio]):not([type=checkbox]),textarea,select')) return { hide: 1 };
      var zi = t.closest('.pinb, .chip'), zg = t.closest('#svg .z');
      if (zi || zg) {
        var Z = FX.zones ? FX.zones() : [], id = zg ? zg.getAttribute('class').split('z-')[1].split(' ')[0] : (Z[+zi.dataset.i] || {}).id;
        if (id && id !== 'base') return { zone: 1, text: (FX.state && FX.state.ap === 'u' ? 'USDM' : 'USDA') + ' · ' + (CODE[id] || id), node: zg };
      }
      if (t.closest('#svg, .mini')) return { zone: 1, text: 'Условная схема' };
      var a = t.closest('a,button,summary,label,[data-tip]'); if (!a) return {};
      var h = a.getAttribute('href') || '', tx = 'Открыть';
      if (/^tel:/.test(h)) tx = 'Позвонить'; else if (/^mailto:/.test(h)) tx = 'Написать'; else if (/^#/.test(h)) tx = 'К разделу';
      else if (a.closest('#steps')) tx = 'Шаг →'; else if (a.matches('#next,#prev')) tx = 'Шаг'; else if (a.matches('summary')) tx = 'Раскрыть';
      else if (a.matches('label')) tx = 'Выбрать'; else if (a.matches('[data-burger]')) tx = 'Меню'; else if (a.matches('button[type=submit]')) tx = 'Отправить'; else if (a.hasAttribute('data-tip')) tx = '';
      return { link: 1, text: tx };
    }
    addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      if (!seen) { seen = true; G.set(ring, { x: e.clientX, y: e.clientY }); cur.classList.add('on'); }
      qx(e.clientX); qy(e.clientY); dx(e.clientX); dy(e.clientY); lx(e.clientX + 24); ly(e.clientY + 20);
    }, { passive: true });
    d.addEventListener('pointerover', function (e) {
      var k = kind(e.target); cur.classList.toggle('is-link', !!k.link); cur.classList.toggle('is-zone', !!k.zone); cur.classList.toggle('is-hide', !!k.hide);
      lab.textContent = k.text || ''; cur.classList.toggle('has-lab', !!k.text); setZone(k.zone ? k.node : null);
    });
    d.addEventListener('pointerdown', function () { cur.classList.add('down'); }); d.addEventListener('pointerup', function () { cur.classList.remove('down'); });
    d.documentElement.addEventListener('pointerleave', function () { cur.classList.remove('on'); seen = false; });
    /* клик по зоне на самой схеме */
    var sv = $('#svg'); sv.addEventListener('click', function (e) {
      var zg = e.target.closest('.z'); if (!zg || !FX.zones) return; var id = zg.getAttribute('class').split('z-')[1].split(' ')[0], k = FX.zones().findIndex(function (z) { return z.id === id; }); if (k >= 0) FX.go(k);
    });
    /* параллаксом схема дышит на 8 px вслед за мышью */
    var board = $('.draw'), px = G.quickTo(board, 'x', { duration: 1.2, ease: 'power3' }), py = G.quickTo(board, 'y', { duration: 1.2, ease: 'power3' });
    $('.board').addEventListener('pointermove', function (e) { var r = e.currentTarget.getBoundingClientRect(); px(((e.clientX - r.left) / r.width - .5) * -16); py(((e.clientY - r.top) / r.height - .5) * -12); });
    $('.board').addEventListener('pointerleave', function () { px(0); py(0); });
  }

  /* ---------- шторка (только при первой загрузке за сессию) и вход hero ---------- */
  var heroEls = ['[data-header]', '.pick-in > *', '.plan-top', '.board', '.zones', '.chips'];
  function enter() {
    var h1 = $('.pick h1'), split = null, rest = $$('.pick-in > *').filter(function (e) { return e !== h1; });
    var all = $$(heroEls.join(','));
    G.set(all, { autoAlpha: 0 }); off();
    try { split = SplitText.create(h1, { type: 'lines', mask: 'lines', linesClass: 'sl' }); } catch (e) { split = null; }
    G.set(h1, { autoAlpha: 1 });
    var pins = $$('.pinb'), t = G.timeline({ defaults: { ease: 'power3.out' }, onComplete: function () { G.set(all, { clearProps: 'all' }); if (split) split.revert(); } });
    t.fromTo('[data-header]', { yPercent: -100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .7 }, 0);
    if (split) t.from(split.lines, { yPercent: 115, duration: 1, stagger: .12 }, .15); else t.fromTo(h1, { y: 24 }, { y: 0, duration: .9 }, .15);
    t.fromTo(rest, { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, stagger: .1 }, .55);
    t.fromTo('.plan-top', { y: -16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8 }, .3);
    t.fromTo('.board', { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 }, .2);
    if (FX.playIntro) t.add(FX.playIntro, .35);
    t.fromTo(pins, { autoAlpha: 0 }, { autoAlpha: 1, duration: .5, stagger: .09 }, 1.5);
    t.fromTo('.zones, .chips', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, stagger: .1 }, 1.7);
  }
  function start() {
    if (!root.classList.contains('cov')) { enter(); return; }
    var c = d.createElement('div'); c.className = 'curtain';
    c.innerHTML = '<svg viewBox="-80 -90 160 180" aria-hidden="true"><polygon points="0,-82 71,-41 71,41 0,82 -71,41 -71,-41"/></svg><img src="img/sabetta.png" alt="Аэропорт Сабетта" width="260" height="84">';
    d.body.appendChild(c); root.classList.remove('cov');
    try { sessionStorage.setItem('sabPre', '1'); } catch (e) { }
    var poly = $('polygon', c), img = $('img', c);
    G.timeline({ onComplete: function () { c.remove(); } }).fromTo(img, { autoAlpha: 0, scale: .94 }, { autoAlpha: 1, scale: 1, duration: .45, ease: 'power2.out' }, 0)
      .fromTo(poly, { drawSVG: '0%' }, { drawSVG: '100%', duration: .7, ease: 'power2.inOut' }, 0)
      .add(enter, .75).to(c, { clipPath: 'inset(0 0 100% 0)', duration: .5, ease: 'power3.inOut' }, .75);
  }
  (d.fonts && d.fonts.ready ? Promise.race([d.fonts.ready, new Promise(function (r) { setTimeout(r, 1200); })]) : Promise.resolve()).then(start);
  function finishLight() { }
});
