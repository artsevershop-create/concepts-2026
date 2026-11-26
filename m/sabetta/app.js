/* Схема аэродрома и «по шагам». Все цифры и контакты — со страниц sabetta.aero (разделы «Авиакомпаниям», «Пассажирам», «Контакты»). */
addEventListener('DOMContentLoaded', function () {
  var d = document, $ = function (s) { return d.querySelector(s) }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)) };
  var state = { role: 'air', ap: 's', zone: 0, step: 0 }, FX = window.FX = window.FX || {};
  var still = matchMedia('(max-width:900px), (max-height:560px), (prefers-reduced-motion: reduce)');
  var calm = matchMedia('(prefers-reduced-motion: reduce)');

  var AP = {
    s: { name: 'Сабетта', len: 880, size: '2 704 × 46 м', long: '2 704 м', wide: '46 м', logo: 'img/sabetta.png', w: 260, site: 'https://sabetta.aero/sabetta/' },
    u: { name: 'Утренний', len: 504, size: '1 550 × 36 м', long: '1 550 м', wide: '36 м', logo: 'img/utrenny.png', w: 366, site: 'https://sabetta.aero/utrenny/' }
  };

  /* ---------- контакты служб ---------- */
  function C(who, tels, ext, mail) { return { who: who, tels: tels, ext: ext, mail: mail }; }
  var MAIN = C('Общий контакт компании', ['+7 495 228-98-50'], 'доб. 13-810', 'sabetta.aero@yamalspg.ru');
  var PDS_S = C('Производственно-диспетчерская служба', [], '', 'usda@yamalspg.ru');
  var PDS_U = C('Производственно-диспетчерская служба', ['+7 495 995-05-77'], 'доб. 51-004', 'usdm@yamalspg.ru');
  var ANI = C('Отдел АНИ (брифинг)', ['+7 495 228-95-45'], 'доб. 38-229, 38-329', 'briefing@yamalspg.ru');
  var MET = C('Метео (ОСГ Сабетта)', ['+7 495 228-95-45'], 'доб. 38-230', 'og.sabetta@yandex.ru');
  var OVD = C('Отдел ОВД (ЦПИ Сабетта)', ['+7 495 231-27-17', '+7 495 228-95-45'], 'доб. 38-303', 'ovd@yamalspg.ru');
  var SAB = C('Служба авиационной безопасности', ['+7 495 228-98-50'], 'доб. 38-232');
  var BORDER = C('Пограничный контроль, телефон в Сабетте', ['+7 495 228-98-50'], 'доб. 38-337, 38-342, 38-343', 'cc@pufsbm.ru');
  var CUSTOMS = C('Таможенный контроль, телефон в Сабетте', ['+7 495 228-98-50'], 'доб. 38-335, 38-336', 'Ymt-postsal@utu.customs.ru');
  var MED_S = C('Здравпункт аэровокзала: заказ помощи', ['+7 495 228-98-45'], 'доб. 38-224');
  var MED_U = C('Здравпункт аэровокзала: заказ помощи', ['+7 495 995-05-77'], 'доб. 51-013');

  /* ---------- части схемы: id, подпись, положение метки в координатах viewBox ---------- */
  function zones(ap) {
    var s = ap === 's', x0 = 500 - AP[ap].len / 2;
    var z = [
      { id: 'all', chip: 'Обзор', h: s ? 'Аэропортовый комплекс Сабетта' : 'Аэропортовый комплекс Утренний',
        text: s ? 'Аэродром I категории ICAO, ВПП, аэровокзал, ангар для авиатехники, служебные здания. Аэропорт может принимать практически все типы самолётов.' : 'Аэропорт местных воздушных линий на полуострове Гыдан для вахтовых перевозок: аэродром I категории ICAO, ВПП, аэровокзал, служебные здания.',
        data: [['Класс аэродрома', s ? 'Б, I кат. ICAO' : 'Г, I кат. ICAO'], ['Код', s ? 'SBT / USDA' : 'USDM']] },
      { id: 'rwy', chip: 'ВПП', h: 'Взлётно-посадочная полоса', pin: [500, 228],
        text: s ? 'Самолёты: Ил-76ТД, Ту-204/214, Ту-134, Як-40, Ан-12/24/26/30/32/72(74)/140/148, RRJ-95, ATR-72, CRJ-200, B-737, A319/320/321, Bombardier Global 5000, другие ВС 3 и 4 класса. Вертолёты: Ми-26, Ми-8 и другие.' : 'Ан-24, Ан-26 (с ограничениями по массе), ATR-42/72, Dash-6-400, Dash-8 (Q-200, Q-300), L-410, Ми-8, Ми-26 и модификации, а также ВС классом ниже.',
        data: [['Длина', AP[ap].long], ['Ширина', AP[ap].wide]] },
      { id: 'radio', chip: 'Радио', h: 'Радиотехническое оборудование', pin: [215, 98],
        text: s ? 'Радиомаячная система захода на посадку 1 категории ИКАО, ЛККС, дальномерный и азимутальный радиомаяки VOR/DME, ОПРС с МРМ.' : 'Радиомаячная система захода на посадку 1 категории ИКАО, дальномерный и азимутальный радиомаяки VOR/DME, ОПРС с МРМ.',
        data: s ? [['Инструментальный заход', 'МКпос 036°'], ['ОПРС с МРМ', '036° и 216°']] : [['Инструментальный заход', 'МКпос 012°'], ['ОПРС с МРМ', '012°']] },
      { id: 'light', chip: 'Огни', h: 'Светосигнальное оборудование', pin: [x0 + AP[ap].len * .7, 266],
        text: s ? 'Система огней высокой интенсивности ОВИ-1 с PAPI с обоих курсов посадки.' : 'ОВИ-1 с PAPI с одного курса посадки и ОМИ с PAPI с противоположного.',
        data: s ? [['ОВИ-1 + PAPI', '036° и 216°']] : [['ОВИ-1 + PAPI', '012°'], ['ОМИ + PAPI', '192°']] },
      { id: 'term', chip: 'Аэровокзал', h: 'Служебно-пассажирское здание', pin: [500, 505],
        text: s ? 'Принимает внутренние и международные рейсы: в здании есть международный сектор.' : 'Обслуживает пассажиров вахтовых перевозок.',
        data: s ? [['Площадь', '5 500 м²'], ['Пропускная способность', '200 пасс./ч'], ['Международный сектор', '50 пасс./ч']] : [['Площадь', '6 484 м²'], ['Пропускная способность', '100 пасс./ч']] }
    ];
    if (s) z.push({ id: 'heli', chip: 'Вертолёты', h: 'Вертолётная площадка и ангар', pin: [815, 372],
      text: 'Посадочная площадка со светотехническим оборудованием. Ангар для стоянки и технического обслуживания вертолётов Ми-8.', data: [['Площадка', '42 × 40 м'], ['Ангар', 'для Ми-8']] });
    z.push({ id: 'ground', chip: 'На земле', h: 'Наземное обслуживание', pin: [225, 372],
      text: s ? 'Площадка ПОЖ для противообледенительной обработки и оборудование для удаления жидкости, оборудование для приёма авиаконтейнеров, площадка приёма грузов на подвеске.' : 'Площадка ПОЖ для противообледенительной обработки самолётов и оборудование для обработки и удаления противообледенительной жидкости.',
      data: s ? [['Противообледенение', 'площадка ПОЖ'], ['Грузы', 'контейнеры, подвеска']] : [['Противообледенение', 'площадка ПОЖ']] });
    return z;
  }

  /* ---------- чертёж ---------- */
  function hex(x, y, r) { var p = []; for (var i = 0; i < 6; i++) { var a = Math.PI / 3 * i - Math.PI / 2; p.push((x + r * Math.cos(a)).toFixed(1) + ',' + (y + r * Math.sin(a)).toFixed(1)); } return p.join(' '); }
  function L(x1, y1, x2, y2, c) { return '<path class="ln ' + (c || '') + '" d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '"/>'; }
  function P(dd, c) { return '<path class="ln ' + (c || '') + '" d="' + dd + '"/>'; }
  function R(x, y, w, h, c) { return P('M' + x + ' ' + y + 'h' + w + 'v' + h + 'h' + (-w) + 'z', c); }
  function T(x, y, t, c, a) { return '<text x="' + x + '" y="' + y + '" class="tx ' + (c || '') + '" text-anchor="' + (a || 'middle') + '">' + t + '</text>'; }
  function parts(ap) {
    var s = ap === 's', len = AP[ap].len, a = 500 - len / 2, b = a + len, y = 228, h = s ? 46 : 36, top = y - h / 2, bot = y + h / 2, g = {}, i, o;
    /* перрон и рулёжки — только условная подложка, без подписей и размеров */
    g.base = P('M430 ' + bot + 'V330H175V440H865V330H570V' + bot, 'apron');
    o = R(a, top, len, h, 'strip') + L(a + 56, y, b - 56, y, 'axis');
    for (i = 0; i < 4; i++) { var yy = top + 7 + i * (h - 14) / 3; o += L(a + 10, yy, a + 40, yy, 'mark') + L(b - 40, yy, b - 10, yy, 'mark'); }
    o += L(a, 160, a, top - 6, 'dim') + L(b, 160, b, top - 6, 'dim') + L(a, 170, b, 170, 'dim') + P('M' + (a + 14) + ' 164L' + a + ' 170l14 6M' + (b - 14) + ' 164L' + b + ' 170l-14 6', 'dim');
    o += T(500, 160, AP[ap].size, 'big');
    g.rwy = o;
    o = P('M8 ' + (y - 58) + 'L' + a + ' ' + y + 'L8 ' + (y + 58), 'beam') + L(8, y, a - 4, y, 'beam axis') + T(18, y + 82, 'МКпос ' + (s ? '036°' : '012°') + ' →', 'sm hot', 'start');
    if (s) o += T(982, y + 82, '← МКпос 216°', 'sm', 'end');
    o += '<circle class="ln beam" cx="880" cy="112" r="24"/><circle class="ln beam" cx="880" cy="112" r="9"/>' + T(844, 118, 'VOR/DME', 'sm', 'end');
    o += P('M' + (a + 30) + ' 112l12 -26l12 26M' + (a + 42) + ' 86v-14', 'beam') + T(a + 66, 106, 'ОПРС', 'sm', 'start');
    g.radio = o;
    o = '';
    var n = Math.round(len / 40);
    for (i = 0; i <= n; i++) { var lx = a + len * i / n; o += '<circle class="lamp" cx="' + lx + '" cy="' + (top - 9) + '" r="3.2"/><circle class="lamp" cx="' + lx + '" cy="' + (bot + 9) + '" r="3.2"/>'; }
    [a + 70, b - 92].forEach(function (px) { for (var k = 0; k < 4; k++) o += '<circle class="papi' + (k < 2 ? ' w2' : '') + '" cx="' + (px + k * 8) + '" cy="' + (bot + 24) + '" r="3.4"/>'; });
    o += T(b - 76, bot + 48, 'PAPI', 'sm') + T(a + 86, bot + 48, 'PAPI', 'sm');
    g.light = o;
    o = R(390, 470, 220, 70, 'body') + R(430, 440, 140, 30, 'body');
    for (i = 1; i < 8; i++) o += L(390 + i * 27.5, 470, 390 + i * 27.5, 540, 'thin');
    if (s) o += L(555, 470, 555, 540, 'hotln') + T(582, 562, 'межд.', 'sm hot');
    g.term = o + T(500, 586, s ? '5 500 м² · 200 пасс./ч' : '6 484 м² · 100 пасс./ч', 'mid');
    if (s) g.heli = R(770, 332, 90, 86, 'body') + '<circle class="ln hotln" cx="815" cy="375" r="30"/>' + P('M804 360v30M826 360v30M804 375h22', 'hotln') + T(815, 318, '42 × 40 м', 'mid') + P('M700 540V490Q755 450 810 490V540Z', 'body') + L(700, 505, 810, 505, 'thin') + T(755, 586, 'ангар Ми-8', 'sm');
    o = R(170, 335, 120, 80, 'body');
    for (i = 0; i < 7; i++) o += L(172 + i * 17, 413, Math.min(288, 172 + i * 17 + 40), Math.max(337, 413 - Math.min(40, 288 - 172 - i * 17) * 1.9), 'thin');
    o += T(230, 318, 'ПОЖ', 'mid');
    if (s) { for (i = 0; i < 3; i++) o += R(185 + i * 42, 478, 34, 22, 'body'); o += '<polygon class="ln body" points="' + hex(250, 535, 22) + '"/>' + T(210, 586, 'контейнеры · подвеска', 'sm'); }
    g.ground = o;
    return g;
  }
  function snow() { var o = '<g class="grid">'; for (var r = 0; r < 7; r++) for (var c = 0; c < 13; c++) o += '<polygon points="' + hex(c * 76 + 25 + (r % 2) * 38, 100 + r * 76, 3) + '"/>'; return o + '</g>'; }
  var GLYPH = '16,0 4,-3 -4,-13 -8,-13 -5,-3 -12,-2 -14,-6 -17,-6 -15,0 -17,6 -14,6 -12,2 -5,3 -8,13 -4,13 4,3';
  function plan(svg, ap, ghost) {
    var g = parts(ap), o = snow(), a = 500 - AP[ap].len / 2;
    o += '<g class="ghost">' + Object.keys(g).map(function (k) { return g[k].replace(/<text[\s\S]*?<\/text>/g, ''); }).join('') + '</g>';
    if (ghost) o += '<g id="marker"><polygon class="mk-h" points="' + hex(0, 0, 30) + '"/><polygon class="mk-p" transform="rotate(-90) scale(.95)" points="' + GLYPH + '"/></g>';
    else o += '<path id="fp" fill="none" stroke="none" d="M8 228L' + a + ' 228L470 228Q500 228 500 258L500 468"/><g id="plane"><g class="halo"><polygon class="mk-h" points="' + hex(0, 0, 27) + '"/></g><polygon class="mk-p" points="' + GLYPH + '"/></g>';
    svg.innerHTML = o + Object.keys(g).map(function (k) { return '<g class="z z-' + k + '">' + g[k] + '</g>'; }).join('');
    var top = svg.querySelector('#marker, #plane'); if (top) svg.appendChild(top);
  }

  /* ---------- сцена: прокрутка чертит схему ---------- */
  var sec = $('#plan'), pin = sec.querySelector('.pin'), svg = $('#svg'), Z = [], groups = {}, STEP = .85, drawn = {};
  function el(tag, cls, txt) { var e = d.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function buildPlan() {
    Z = zones(state.ap); plan(svg, state.ap); drawn = {}; groups = {};
    $$('.z', svg).forEach(function (g) { groups[g.getAttribute('class').split('z-')[1]] = g; });
    var pins = $('#pins'), chips = $('#chips'), list = $('#zones'); pins.textContent = chips.textContent = list.textContent = '';
    Z.forEach(function (z, i) {
      if (z.pin) {
        var p = el('button', 'pinb'); p.type = 'button'; p.style.left = z.pin[0] / 10 + '%'; p.style.top = (z.pin[1] - 60) / 5.6 + '%';
        p.setAttribute('aria-label', z.h); p.appendChild(el('span', null, z.chip)); p.onclick = function () { go(i); }; p.dataset.i = i; pins.appendChild(p);
      }
      var c = el('button', 'chip', z.chip); c.type = 'button'; c.dataset.i = i; c.onclick = function () { go(i); }; chips.appendChild(c);
      var a = el('article', 'zone'), dl = el('dl'); a.id = 'zone-' + z.id; a.dataset.i = i;
      a.appendChild(el('h3', null, z.h));
      z.data.forEach(function (r) { var w = el('div'); w.appendChild(el('dt', null, r[0])); w.appendChild(el('dd', 'mono', r[1])); dl.appendChild(w); });
      a.appendChild(dl); a.appendChild(el('p', null, z.text)); list.appendChild(a);
    });
    sec.style.setProperty('--n', Z.length);
    mode();
  }
  function mark(i) {
    state.zone = i;
    $$('.pinb,.chip,.zone', sec).forEach(function (e) { var on = +e.dataset.i === i; e.classList.toggle('on', on); if (e.tagName === 'BUTTON') e.setAttribute('aria-pressed', on); });
    sec.dataset.focus = Z[i].id;
    Object.keys(groups).forEach(function (k) { groups[k].classList.toggle('on', k === Z[i].id); });
  }
  /* ---------- сцена на ScrollTrigger: DrawSVG чертит, MotionPath ведёт борт, огни бегут волной ---------- */
  var tl, stt, wave, introTl, cur = -1;
  var inked = function (g) { return $$('.ln', g).filter(function (x) { return !x.classList.contains('axis'); }); };
  function killScene() {
    [tl, stt, wave, introTl].forEach(function (x) { if (x) x.kill(); }); tl = stt = wave = introTl = null;
    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(function (t) { if (t.vars.id === 'scene' || t.vars.id === 'wave') t.kill(); });
  }
  function buildScene() {
    killScene(); cur = -1;
    var G = window.gsap, ST_ = window.ScrollTrigger, s = still.matches || !G || !ST_;
    sec.classList.toggle('is-still', s);
    if (s) {
      Object.keys(groups).forEach(function (k) { groups[k].style.setProperty('--d', 1); });
      if (G) G.set($$('.ln', svg).filter(function (x) { return !x.classList.contains('axis') && !x.closest('.ghost'); }), { drawSVG: '100%' });
      sec.classList.remove('dimmed'); mark(Math.min(state.zone, Z.length - 1)); sec.dataset.focus = ''; return;
    }
    var D = Z.length - 1, hdr = parseFloat(getComputedStyle(pin).top) || 0, plane = $('#plane');
    tl = G.timeline({ paused: true, defaults: { ease: 'none' } });
    Z.forEach(function (z, k) {
      var g = groups[z.id]; if (!k || z.id === 'rwy' || !g) return;
      tl.fromTo(g, { '--d': 0 }, { '--d': 1, duration: .5 }, k - .75);
      tl.fromTo(inked(g), { drawSVG: '0%' }, { drawSVG: '100%', duration: .5, stagger: .015, ease: 'power1.inOut' }, k - .75);
    });
    G.set(plane, { opacity: 0 });
    tl.to(plane, { motionPath: { path: '#fp', align: '#fp', alignOrigin: [.5, .5], autoRotate: true }, duration: D }, 0);
    tl.fromTo('#plane .halo', { opacity: 0 }, { opacity: 1, duration: .3 }, .3);
    tl.totalProgress(.0001).totalProgress(0);
    stt = ST_.create({ id: 'scene', trigger: sec, start: 'top ' + hdr + 'px', end: 'bottom bottom', animation: tl, scrub: .6,
      onUpdate: function (self) { var t = self.progress * D, i = Math.round(t); if (i !== cur) { cur = i; mark(i); } sec.classList.toggle('dimmed', t > .4); } });
    /* вход: перрон и ВПП чертятся при загрузке; запускает hero-вход (fx.js) или сразу */
    Object.keys(groups).forEach(function (k) { if (k !== 'base' && k !== 'rwy') groups[k].style.setProperty('--d', 0); });
    introTl = G.timeline({ paused: true });
    [groups.base, groups.rwy].forEach(function (g, n) {
      introTl.fromTo(g, { '--d': 0 }, { '--d': 1, duration: 1.4, ease: 'power2.out' }, n * .25).fromTo(inked(g), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.5, stagger: .03, ease: 'power2.inOut' }, n * .25);
    });
    introTl.to(plane, { opacity: 1, duration: .6 }, 1.1);
    FX.playIntro = function () { if (introTl) introTl.play(); };
    if (!d.documentElement.classList.contains('pre')) FX.playIntro();
    /* огни ВПП бегут волной, пока схема на экране */
    var lamps = $$('.lamp', groups.light);
    wave = G.fromTo(lamps, { attr: { r: 2.4 }, fillOpacity: .3 }, { attr: { r: 4.6 }, fillOpacity: 1, duration: .55, ease: 'sine.inOut', stagger: { each: .045, repeat: -1, yoyo: true }, repeat: -1, yoyo: true, paused: true });
    ST_.create({ id: 'wave', trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: function (self) { if (wave) { if (self.isActive) wave.play(); else wave.pause(); } } });
    cur = Math.round(stt.progress * D); mark(cur); sec.classList.toggle('dimmed', stt.progress * D > .4);
  }
  function mode() { buildScene(); requestAnimationFrame(function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); }); }

  function go(i) {
    if (still.matches) { mark(i); var a = $('#zone-' + Z[i].id); if (!pin.contains(d.activeElement) || d.activeElement.classList.contains('pinb')) a.scrollIntoView({ block: 'nearest', behavior: calm.matches ? 'auto' : 'smooth' }); return; }
    var stick = parseFloat(getComputedStyle(pin).top) || 0;
    var y = scrollY + sec.getBoundingClientRect().top - stick + (sec.offsetHeight - pin.offsetHeight) * i / (Z.length - 1) + 2;
    if (window.KIT.lenis) KIT.lenis.scrollTo(y, { force: true, immediate: KIT.still }); else scrollTo({ top: y, behavior: calm.matches ? 'auto' : 'smooth' });
  }
  still.addEventListener('change', function () { mode(); buildRoute(); });

  /* ---------- по шагам ---------- */
  function S(short, zone, title, text, facts, contacts, src) { return { short: short, zone: zone, title: title, text: text, facts: facts, contacts: contacts, src: src }; }
  function steps() {
    var s = state.ap === 's', base = 'https://sabetta.aero/' + (s ? '' : 'utrenny/');
    var air = base + 'aviakompaniyam/', px = base + 'passazhiram/', tech = air + 'tekhnicheskie-kharakteristiki/';
    if (state.role === 'air') {
      var deal = S('Договор', 'term', 'Заключаете договор на обслуживание', 'Аэропорт обслуживает воздушное судно по договору на аэропортовое и наземное обслуживание. Для заключения пришлите сканы:',
        ['устав в последней редакции со всеми изменениями', 'документ о регистрации юрлица (ОГРН) и выписку из ЕГРЮЛ не старше 90 дней', 'решение о назначении руководителя и, если нужно, доверенность', 'свидетельство о налоговом учёте', 'бухгалтерский баланс или другое подтверждение имущества'], [MAIN], air + 'tipovye-dogovory/');
      var land = S('Заход', 'radio', 'Аэропорт ведёт борт на посадку', s ? 'Обслуживание воздушного движения, аэронавигационная и метеорологическая информация.' : 'Заход обеспечивают радиотехническое и светосигнальное оборудование аэродрома.',
        s ? ['радиомаячная система захода 1 категории ИКАО, МКпос 036°', 'ЛККС, VOR/DME, ОПРС с МРМ', 'ОВИ-1 с PAPI на 036° и 216°'] : ['радиомаячная система захода 1 категории ИКАО, МКпос 012°', 'VOR/DME, ОПРС с МРМ', 'ОВИ-1 с PAPI на 012°, ОМИ с PAPI на 192°'], s ? [OVD] : [PDS_U], tech);
      var rw = S('Полоса', 'rwy', 'Принимает на полосу ' + AP[state.ap].size, 'Проверьте, что ваш тип ВС есть в перечне принимаемых.',
        s ? ['Ил-76ТД, Ту-204/214, B-737, A319/320/321, RRJ-95, ATR-72, CRJ-200', 'семейство Ан, Як-40, Ту-134, другие ВС 3 и 4 класса', 'вертолёты Ми-26, Ми-8 и другие'] : ['Ан-24, Ан-26 (с ограничениями по массе)', 'ATR-42/72, Dash-6-400, Dash-8, L-410', 'Ми-8, Ми-26 и ВС классом ниже'], [s ? PDS_S : PDS_U], tech);
      var gr = S('На земле', 'ground', 'Обслуживает борт на земле', 'Что есть на аэродроме по странице технических характеристик:',
        s ? ['площадка ПОЖ и оборудование для противообледенительной обработки', 'приём авиаконтейнеров и грузов на подвеске', 'ангар для стоянки и ТО Ми-8, вертолётная площадка 42 × 40 м'] : ['площадка ПОЖ для противообледенительной обработки', 'оборудование для обработки и удаления противообледенительной жидкости'], [s ? PDS_S : PDS_U], tech);
      var pp = S('Пассажиры', 'term', 'Пропускает ваших пассажиров', s ? 'Аэровокзал с международным сектором и пунктами контроля.' : 'Служебно-пассажирское здание для вахтовых перевозок.',
        s ? ['200 пассажиров в час', 'из них международный сектор — 50 пассажиров в час'] : ['100 пассажиров в час', 'площадь 6 484 м²'], s ? [BORDER, CUSTOMS] : [PDS_U], tech);
      if (!s) return [deal, land, rw, gr, pp];
      var br = S('Брифинг', 'radio', 'Даёт брифинг и погоду', 'Аэронавигационную информацию даёт отдел АНИ, метеорологическую — ОСГ Сабетта. Регламент аэропорта: 04:00–14:00 UTC (местное время UTC+5).', [], [ANI, MET], air);
      return [deal, br, land, rw, gr, pp];
    }
    var help = S('Помощь', 'term', 'Если нужна помощь — предупредите заранее', 'Для маломобильных пассажиров услуги в аэропорту бесплатны: сопровождение, кресло-коляска, лестничный подъёмник, приоритетная посадка.',
      ['сообщите авиакомпании и получите подтверждение не позднее чем за 48 часов до вылета', 'приезжайте не позднее чем за 2 часа до вылета'].concat(s ? ['кнопка вызова — на КПП № 4 со стороны привокзальной площади'] : []), [s ? MED_S : MED_U], px + 'malomobilnym-passazhiram/');
    var door = S('Вход', 'term', 'Досматривает всех на входе', 'На входе в аэровокзал — пункт предварительного досмотра с техническими средствами.', ['ввоз алкоголя на территорию ' + (s ? 'Южно-Тамбейского участка' : 'Утреннего месторождения') + ' запрещён'], [SAB], px + 'predpoletnyy-kontrol/');
    var reg = S('Регистрация', 'term', 'Регистрирует вас и оформляет багаж', 'Время начала зависит от типа самолёта, направления и авиакомпании. Приезжайте заблаговременно.',
      (s ? ['обычно открывается за 2 часа на внутренних линиях, за 2–3 часа на международных'] : ['обычно открывается за 2 часа до отправления']).concat(['заканчивается обычно не позднее чем за 40 минут до отправления']), [MAIN], px + 'registratsiya-na-reys/');
    var scr = S('Досмотр', 'rwy', 'Проводит предполётный досмотр перед бортом', 'Предъявите посадочный талон и документ, удостоверяющий личность.' + (s ? ' На международных рейсах досмотр идёт после таможенного и пограничного контроля.' : ''),
      ['жидкости — в ёмкостях до 100 мл, один прозрачный пакет, всего до 1 литра', 'об оружии сообщите службе авиабезопасности до досмотра'], [SAB], px + 'predpoletnyy-kontrol/');
    var visit = S('Визит', 'all', 'Сначала согласуйте визит', s ? 'Аэропорт находится на Южно-Тамбейском лицензионном участке, где ведётся только производственная деятельность проекта «Ямал СПГ». Визит нужно обосновать и согласовать с должностными лицами ОАО «Ямал СПГ».' : 'Аэропорт находится на территории Утреннего нефтегазоконденсатного месторождения, где ведётся только производственная деятельность.',
      ['рейсов центрального расписания в аэропорту нет'].concat(s ? ['в расписании на сайте — только чартеры для нужд проекта «Ямал СПГ»'] : []), [MAIN], px);
    if (!s) return [visit, help, door, reg, scr];
    var intl = S('Граница', 'term', 'На международном рейсе — граница и таможня', 'Паспортный контроль ведут офицеры Пограничной службы ФСБ России, таможня работает по законодательству РФ.', ['только для международных рейсов'], [BORDER, CUSTOMS], px + 'pogranichnyy-kontrol/');
    return [visit, help, door, reg, intl, scr];
  }
  var ST = [], mini = $('#mini');
  var AT = { all: [500, 340], rwy: [500, 228], radio: [880, 112], term: [500, 505], ground: [230, 375] };
  function contactNode(c) {
    var w = el('div', 'who'); w.appendChild(el('b', null, c.who));
    c.tels.forEach(function (t) { var a = el('a', 'tline mono', t); a.href = 'tel:' + t.replace(/[^+\d]/g, ''); w.appendChild(a); });
    if (c.ext) w.appendChild(el('span', 'mono ext', c.ext));
    if (c.mail) { var m = el('a', 'link', c.mail); m.href = 'mailto:' + c.mail; w.appendChild(m); }
    return w;
  }
  function buildRoute() {
    ST = steps(); state.step = Math.min(state.step, ST.length - 1);
    var air = state.role === 'air';
    $('#route-sub').textContent = (air ? 'Рейс авиакомпании' : 'Путь пассажира') + ', аэропорт ' + AP[state.ap].name + '. Выберите шаг: схема покажет место, карточка — что делает аэропорт и к кому обратиться.';
    var ol = $('#steps'), box = $('#cards'); ol.textContent = box.textContent = '';
    ol.style.setProperty('--m', ST.length);
    $('#route').classList.toggle('all-open', calm.matches);
    ST.forEach(function (s, i) {
      var li = el('li'), b = el('button'); b.type = 'button'; b.appendChild(el('i', 'mono', i + 1)); b.appendChild(el('span', null, s.short));
      b.onclick = function () { pick(i); };
      b.onkeydown = function (e) { var k = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: ST.length - 1 }[e.key]; if (k === undefined) return; e.preventDefault(); k = (k + ST.length) % ST.length; pick(k); ol.children[k].firstChild.focus(); };
      li.appendChild(b); ol.appendChild(li);
      var a = el('article', 'card'); a.appendChild(el('h3', null, s.title)); a.appendChild(el('p', null, s.text));
      if (s.facts.length) { var u = el('ul'); s.facts.forEach(function (f) { u.appendChild(el('li', null, f)); }); a.appendChild(u); }
      var cs = el('div', 'whos'); s.contacts.forEach(function (c) { cs.appendChild(contactNode(c)); }); a.appendChild(cs);
      var src = el('a', 'link source', 'Источник: страница действующего сайта'); src.href = s.src; src.rel = 'noopener'; a.appendChild(src);
      box.appendChild(a);
    });
    plan(mini, state.ap, true); pick(state.step);
  }
  function pick(i) {
    state.step = i;
    $$('#steps button').forEach(function (b, k) { if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); b.parentNode.classList.toggle('done', k < i); });
    $$('#cards .card').forEach(function (c, k) { c.classList.toggle('on', k === i); });
    $('#steps').style.setProperty('--p', ST.length > 1 ? i / (ST.length - 1) : 0);
    var z = ST[i].zone, m = $('#marker'), at = AT[z];
    var to = { x: at[0], y: at[1] }, fr = m._p, G = window.gsap;
    m.style.opacity = z === 'all' ? 0 : 1; m._p = to;
    if (!G) m.style.transform = 'translate(' + to.x + 'px,' + to.y + 'px)';
    else if (!fr || calm.matches || z === 'all') G.set(m, to);
    else { G.killTweensOf(m); G.to(m, { motionPath: { path: [fr, { x: (fr.x + to.x) / 2 + (fr.y > to.y ? 60 : -60), y: (fr.y + to.y) / 2 - 70 }, to], curviness: 1.4 }, duration: 1.05, ease: 'power2.inOut' }); }
    $$('.z', mini).forEach(function (g) { var k = g.getAttribute('class').split(' ')[1].slice(2); g.classList.toggle('on', z === 'all' || k === z || (z === 'radio' && k === 'light')); });
    $('#count').textContent = 'Шаг ' + (i + 1) + ' из ' + ST.length;
    $('#prev').disabled = !i; $('#next').disabled = i === ST.length - 1;
    var cur2 = $('#steps').children[i], ol = $('#steps'); if (ol.scrollWidth > ol.clientWidth) ol.scrollTo({ left: cur2.offsetLeft - 20, behavior: calm.matches ? 'auto' : 'smooth' });
  }
  $('#prev').onclick = function () { pick(state.step - 1); };
  $('#next').onclick = function () { pick(state.step + 1); };

  /* ---------- выбор роли и аэропорта (колонка и копия в «по шагам» для телефона) ---------- */
  var swap = $('#swap');
  $$('.pick .seg').forEach(function (f) { var c = f.cloneNode(true); c.classList.remove('enter'); $$('input', c).forEach(function (i) { i.name += '2'; }); swap.appendChild(c); });
  function ui() {
    var air = state.role === 'air', ap = AP[state.ap], a1 = $('#act1'), a2 = $('#act2');
    a1.textContent = air ? 'Ваш рейс по шагам' : 'Ваш путь по шагам';
    a2.textContent = air ? 'Документы и тарифы' : 'Табло аэропорта'; a2.href = air ? '#airlines' : ap.site;
    var c = air ? (state.ap === 's' ? PDS_S : PDS_U) : (state.ap === 's' ? MED_S : MED_U), duty = $('#duty'); duty.textContent = '';
    var n = contactNode(c); if (!air) n.firstChild.textContent = 'Помощь маломобильным пассажирам'; duty.appendChild(n);
    var logo = $('#logo'); logo.src = ap.logo; logo.width = ap.w; logo.alt = 'Аэропорт ' + ap.name;
    $$('.apname').forEach(function (e) { e.textContent = ap.name; });
    $$('input[type=radio]').forEach(function (i) { i.checked = i.value === state[i.name.replace('2', '')]; });
    $('#f-role').selectedIndex = air ? 0 : 1; $('#f-ap').selectedIndex = state.ap === 's' ? 0 : 1;
  }
  d.addEventListener('change', function (e) {
    var t = e.target; if (t.type !== 'radio') return; var k = t.name.replace('2', ''); state[k] = t.value; state.step = 0; ui(); buildRoute();
    if (k === 'ap') { var was = cur; buildPlan(); if (was > 0) state.zone = Math.min(was, Z.length - 1); }
  });

  /* текущий раздел в меню */
  var links = $$('.hdr nav a'), ids = links.map(function (a) { return $(a.hash); }), lastId = '';
  function spy() { var id = ''; ids.forEach(function (s) { if (s.getBoundingClientRect().top < innerHeight * .4) id = s.id; }); if (id === lastId) return; lastId = id; links.forEach(function (a) { if (a.hash === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); }
  addEventListener('scroll', spy, { passive: true });

  FX.state = state; FX.go = go; FX.zones = function () { return Z; }; FX.AP = AP; FX.pick = pick;
  ui(); buildPlan(); buildRoute(); spy();
  d.dispatchEvent(new Event('sab:ready'));
});
