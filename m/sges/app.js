/* Отключения: поиск и дни. Сцена «Ночной Сургут»: условная схема на canvas (не карта). */
(function () {
  "use strict";
  var K = window.KIT, d = document, $ = function (s) { return d.querySelector(s); }, $$ = function (s) { return [].slice.call(d.querySelectorAll(s)); };

  /* ——— отключения ——— */
  var items = $$("#list li"), dayBtns = $$(".off__days button"), q = $("#q"), day = "";
  var norm = function (s) { return s.toLowerCase().replace(/ё/g, "е").replace(/[«»"]/g, "").replace(/\s+/g, " ").trim(); };
  // номера КТПН в объявлении идут списком «786, 787, 1040», поэтому «КТПН 787» ищем по числу
  items.forEach(function (li) { li.dataset.q = norm(li.textContent); });
  function filter() {
    var words = norm(q.value).replace(/ктпн-?\s*(?=\d)/g, "").split(" ").filter(Boolean), n = 0;
    items.forEach(function (li) {
      var ok = (!day || li.dataset.day === day) && words.every(function (w) { return li.dataset.q.indexOf(w) > -1; });
      li.hidden = !ok; if (ok) n++;
    });
    $("#empty").hidden = n > 0;
    $("#count").textContent = "Показано объявлений: " + n + " из " + items.length;
    if (K.lenis) K.lenis.resize();
  }
  dayBtns.forEach(function (b) { b.addEventListener("click", function () { day = b.dataset.day; dayBtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); filter(); }); });
  q.addEventListener("input", filter);
  var now = new Date(), today = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  items.forEach(function (li) { if (li.dataset.day < today) li.classList.add("past"); });
  if (items.every(function (li) { return li.dataset.day < today; })) $("#stale").hidden = false;
  filter();

  /* ——— город ——— */
  var seed = 29, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  var R = 11, i, j, a;
  var subs = [[4, 1], [1, 5], [-4, 3], [-5, -2], [-1, -5], [4, -4]];
  var man = function (ax, ay, bx, by) { return Math.abs(ax - bx) + Math.abs(ay - by); };
  var segs = [], maxD = 0;
  function seg(x1, y1, x2, y2, d0, trunk) { var l = man(x1, y1, x2, y2); if (l) segs.push([x1, y1, x2, y2, d0, l, trunk]); maxD = Math.max(maxD, d0 + l); return d0 + l; }
  subs.forEach(function (s) { seg(s[0], 0, s[0], s[1], seg(0, 0, s[0], 0, 0, 1), 1); s[2] = man(0, 0, s[0], s[1]); });
  function route(x, y, onX) { // от ближайшей ПС по улицам (целые координаты) до точки
    var s = subs.reduce(function (b, c) { return man(c[0], c[1], x, y) < man(b[0], b[1], x, y) ? c : b; });
    var cx = onX ? x : s[0], cy = onX ? s[1] : y;
    return seg(cx, cy, x, y, seg(s[0], s[1], cx, cy, s[2]));
  }
  var tps = [], used = {};
  while (tps.length < 802) {
    var line = Math.round(rnd() * 2 * R - R), along = Math.round((rnd() * 2 * R - R) * 4) / 4, onX = rnd() < .5;
    var tx = onX ? line : along, ty = onX ? along : line, key = tx + ":" + ty;
    if (used[key] || tx * tx + ty * ty > R * R) continue;
    used[key] = 1; tps.push({ x: tx, y: ty, d: route(tx, ty, onX) });
  }
  var houses = [];
  function house(x, y, w, h, z, dist) {
    var win = [], rows = Math.max(1, Math.floor(z / .17)), cols = Math.max(2, Math.round(w / .12)), r, c;
    for (r = 0; r < rows; r++) for (c = 0; c < cols; c++) { if (rnd() < .5) win.push([0, (c + .5) / cols, (r + .5) / rows, rnd()]); if (rnd() < .34) win.push([1, (c + .5) / cols, (r + .5) / rows, rnd()]); }
    houses.push({ x: x, y: y, w: w, h: h, z: z, d: dist, win: win });
  }
  for (i = -R; i < R; i++) for (j = -R; j < R; j++) {
    var mx = i + .5, my = j + .5, rr = Math.sqrt(mx * mx + my * my);
    if (rr > R - .3 || rr < 1.2 || rnd() < .14 || subs.some(function (s) { return man(s[0], s[1], mx, my) <= 1; })) continue;
    var tall = rnd() < .16 ? .75 + rnd() * .55 : .18 + rnd() * .32;
    if (rnd() < .5) { house(i + .14, j + .14, .72, .28, tall, man(0, 0, mx, my)); house(i + .14, j + .56, .5 + rnd() * .22, .28, tall * .7, man(0, 0, mx, my)); }
    else house(i + .18, j + .18, .3 + rnd() * .3, .3 + rnd() * .3, tall, man(0, 0, mx, my));
  }
  // 38 групп домиков на окраине — по числу дачных кооперативов; расположение условное
  var coops = [];
  for (i = 0; i < 38; i++) {
    a = (i + (rnd() - .5) * .35) / 38 * Math.PI * 2;
    var cr = R + 1.6 + (i % 2) * 1.5 + rnd() * .4, cx = Math.cos(a) * cr, cy = Math.sin(a) * cr, cd = man(0, 0, cx, cy);
    var near = subs.reduce(function (b, c) { return man(c[0], c[1], cx, cy) < man(b[0], b[1], cx, cy) ? c : b; });
    var end = near[2] + Math.hypot(cx - near[0], cy - near[1]);
    coops.push({ x: cx, y: cy, s: near, d0: near[2], d: end }); maxD = Math.max(maxD, end);
    for (j = 0; j < 5; j++) house(cx + (j % 3) * .34 - .45 + rnd() * .08, cy + Math.floor(j / 3) * .38 - .3 + rnd() * .08, .2, .2, .13, cd);
  }
  houses.sort(function (p, n) { return (p.x + p.y) - (n.x + n.y); });
  var maxH = houses.reduce(function (m, h) { return Math.max(m, h.d); }, 0);
  var lamps = [];
  for (i = -8; i <= 8; i += 2) for (a = -R; a <= R; a += .5) if (i * i + a * a <= (R - .4) * (R - .4)) { lamps.push([i, a, Math.abs(i) + Math.abs(a)]); if (i % 4 === 0) lamps.push([a, i, Math.abs(i) + Math.abs(a)]); }
  // тепло: западная часть (на схеме — слева, x < y), 35 объектов
  var heat = [], hs = [-5, 3];
  while (heat.length < 35) {
    var hx = Math.round(rnd() * 12 - 9), hy = Math.round(rnd() * 12 - 3);
    if (hy - hx < 4 || hx * hx + hy * hy > R * R || heat.some(function (h) { return h[0] === hx && h[1] === hy; })) continue;
    heat.push([hx, hy, man(hs[0], hs[1], hx, hy)]);
  }
  console.assert(tps.length === 802 && coops.length === 38 && heat.length === 35, "счётчики схемы разошлись с цифрами сайта");

  function sprite(rgb) { var c = d.createElement("canvas"); c.width = c.height = 64; var g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(" + rgb + ",.85)"); r.addColorStop(.25, "rgba(" + rgb + ",.28)"); r.addColorStop(1, "rgba(" + rgb + ",0)"); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return c; }
  var gBlue = sprite("80,190,255"), gWarm = sprite("255,190,110"), gHeat = sprite("232,123,68");
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  /* p: 0 центр · 1 линии · 2 ТП · 3 дома · 4 фонари · 5 тепло. cam = {x, y, s} — экранный центр и масштаб */
  // shortcut: кадр перерисовывается целиком (~15–40 мс на ПК); если на слабых телефонах рывки — кэшировать дома в отдельный слой
  function draw(g, W, H, p, cam) {
    var S = cam.s, X = function (x, y) { return cam.x + (x - y) * .866 * S; }, Y = function (x, y, z) { return cam.y + ((x + y) * .5 - (z || 0) * .8) * S; };
    var rL = clamp(p) * (maxD + 1), rT = clamp(p - 1) * (maxD + 1), rH = clamp(p - 2) * (maxH + 3), rF = clamp(p - 3) * 24, rQ = clamp(p - 4) * 16;
    var seen = function (x, y, m) { return x > -m && x < W + m && y > -m && y < H + m; };
    function ln(x1, y1, x2, y2, t) { g.moveTo(X(x1, y1), Y(x1, y1)); g.lineTo(X(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t), Y(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)); }
    function glow(img, x, y, s, al) { if (!seen(x, y, s)) return; g.globalAlpha = al; g.drawImage(img, x - s / 2, y - s / 2, s, s); }
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; g.fillStyle = "#091420"; g.fillRect(0, 0, W, H);
    // улицы
    g.beginPath(); for (var k = -R; k <= R; k++) { var e = Math.sqrt(R * R - k * k); ln(k, -e, k, e, 1); ln(-e, k, e, k, 1); }
    g.strokeStyle = "#13273C"; g.lineWidth = 1; g.stroke();
    // линии: тусклые всегда, горят по фронту волны
    [[0, "#1B3550"], [1, "#2A86BC"]].forEach(function (pass) {
      [0, 1].forEach(function (tr) {
        g.beginPath();
        segs.forEach(function (s) { if (!!s[6] !== !!tr) return; var t = pass[0] ? clamp((rL - s[4]) / s[5]) : 1; if (t > 0) ln(s[0], s[1], s[2], s[3], t); });
        g.strokeStyle = tr && pass[0] ? "#7FD0FF" : pass[1]; g.lineWidth = tr ? Math.max(1.6, S * .09) : Math.max(.6, S * .028); g.stroke();
      });
      g.beginPath(); coops.forEach(function (c) { var t = pass[0] ? clamp((rL - c.d0) / (c.d - c.d0)) : 1; if (t > 0) ln(c.s[0], c.s[1], c.x, c.y, t); });
      g.strokeStyle = pass[0] ? "rgba(70,160,215,.5)" : "rgba(60,100,140,.22)"; g.lineWidth = Math.max(.6, S * .025); g.setLineDash([S * .22, S * .16]); g.stroke(); g.setLineDash([]);
    });
    // дома
    houses.forEach(function (h) {
      var x0 = h.x, y0 = h.y, x1 = h.x + h.w, y1 = h.y + h.h, z = h.z;
      if (!seen(X(x1, y0), Y(x1, y1, 0), S * 3)) return;
      var lit = clamp((rH - h.d) / 2.5);
      function quad(pts, col) { g.beginPath(); pts.forEach(function (q, n) { g[n ? "lineTo" : "moveTo"](X(q[0], q[1]), Y(q[0], q[1], q[2])); }); g.closePath(); g.fillStyle = col; g.fill(); }
      quad([[x0, y1, 0], [x1, y1, 0], [x1, y1, z], [x0, y1, z]], "#10243A");
      quad([[x1, y0, 0], [x1, y1, 0], [x1, y1, z], [x1, y0, z]], "#0C1C2E");
      quad([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], lit > 0 ? "#213A55" : "#172E47");
      if (lit <= 0 || S < 5) return;
      var ww = Math.max(1, S * .045), wh = Math.max(1, S * .06);
      g.beginPath();
      h.win.forEach(function (w) {
        if (w[3] > lit) return;
        var wx = w[0] ? x1 : x0 + w[1] * h.w, wy = w[0] ? y0 + w[1] * h.h : y1;
        g.rect(X(wx, wy) - ww / 2, Y(wx, wy, w[2] * z) - wh / 2, ww, wh);
      });
      g.fillStyle = "#FFC87D"; g.fill();
    });
    // кооперативы: тёплое пятно света
    g.globalCompositeOperation = "lighter";
    coops.forEach(function (c) { var l = clamp((rH - maxH * .55 - (c.d - 8) * .35) / 2); if (l > 0) glow(gWarm, X(c.x, c.y), Y(c.x, c.y), S * 2.4, l * .6); });
    // уличные фонари
    lamps.forEach(function (l) {
      var t = clamp((rF - l[2]) / 2); if (t <= 0) return;
      var x = X(l[0], l[1]), y = Y(l[0], l[1], .12); glow(gWarm, x, y, S * .62, t * .75);
      if (seen(x, y, 2)) { g.globalAlpha = t; g.fillStyle = "#FFE3B8"; var r = Math.max(.8, S * .035); g.fillRect(x - r / 2, y - r / 2, r, r); }
    });
    // 802 ТП
    var tr = Math.max(1.4, Math.min(5, S * .085));
    tps.forEach(function (t) {
      var l = clamp((rT - t.d) / 1.5), x = X(t.x, t.y), y = Y(t.x, t.y, .06); if (!seen(x, y, S)) return;
      if (l > 0) glow(gBlue, x, y, tr * 5.5, l * (p > 2.5 ? .38 : .8));
      g.globalAlpha = 1; g.fillStyle = l > .5 ? "#A5E0FF" : "#24405C"; g.fillRect(x - tr / 2, y - tr / 2, tr, tr);
    });
    // тепло
    if (rQ > 0) {
      g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; g.beginPath();
      heat.forEach(function (h) { var l1 = Math.abs(h[0] - hs[0]), t = clamp(rQ / (h[2] || 1)), t1 = l1 ? clamp(t * h[2] / l1) : 1; ln(hs[0], hs[1], h[0], hs[1], t1); if (t * h[2] > l1) ln(h[0], hs[1], h[0], h[1], clamp((t * h[2] - l1) / (h[2] - l1))); });
      g.strokeStyle = "#E87B44"; g.lineWidth = Math.max(1.8, S * .11); g.lineJoin = "round"; g.stroke();
      g.globalCompositeOperation = "lighter";
      heat.forEach(function (h) { var l = clamp(rQ - h[2]); if (l <= 0) return; var x = X(h[0], h[1]), y = Y(h[0], h[1], .1); glow(gHeat, x, y, Math.max(14, S * 1.3), l); g.globalAlpha = l; g.fillStyle = "#FFD2B8"; g.beginPath(); g.arc(x, y, Math.max(2, S * .12), 0, 7); g.fill(); });
    }
    // ПС и центр питания
    g.globalCompositeOperation = "lighter";
    subs.forEach(function (s) { var l = clamp((rL - s[2]) / 1.5); if (l > 0) glow(gBlue, X(s[0], s[1]), Y(s[0], s[1]), Math.max(22, S * 1.8), l * .8); });
    glow(gBlue, X(0, 0), Y(0, 0, .5), Math.max(60, S * 4.2), 1);
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    function mast(x, y, z, on) { // портал подстанции
      g.beginPath();
      [-.28, .28].forEach(function (o) { g.moveTo(X(x + o, y - o), Y(x + o, y - o, 0)); g.lineTo(X(x + o, y - o), Y(x + o, y - o, z)); });
      [z, z * .72].forEach(function (h) { g.moveTo(X(x - .4, y + .4), Y(x - .4, y + .4, h)); g.lineTo(X(x + .4, y - .4), Y(x + .4, y - .4, h)); });
      g.strokeStyle = on ? "#DDF3FF" : "#4B6B8A"; g.lineWidth = Math.max(1, S * .045); g.stroke();
    }
    subs.forEach(function (s) { mast(s[0], s[1], .65, rL >= s[2]); });
    [-.62, .62].forEach(function (o) { mast(o, -o, 1.1, true); });
  }

  function fitCanvas(cv) {
    var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, r.width < 700 ? 1.5 : 2), g = cv.getContext("2d");
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { g: g, w: r.width, h: r.height, dpr: dpr, cv: cv };
  }

  /* «тихая жизнь»: готовый кадр кэшируется, поверх по горящим линиям медленно идут импульсы тока.
     Кадр = 1 drawImage + N спрайтов, поэтому на телефоне не тяжелее статичной картинки */
  var runs = segs.filter(function (s) { return s[5] >= 2; });
  function Life(o, n) { this.o = o; this.n = n; this.snap = null; }
  Life.prototype.frame = function (t, cam, rL) {
    var o = this.o, g = o.g, c = o.cv; if (!c.width || !c.height) return;
    if (!this.snap) { this.snap = d.createElement("canvas"); this.snap.width = c.width; this.snap.height = c.height; this.snap.getContext("2d").drawImage(c, 0, 0); }
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; g.drawImage(this.snap, 0, 0); g.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
    var S = cam.s, sz = Math.max(22, S * 1.6); g.globalCompositeOperation = "lighter";
    for (var k = 0; k < this.n; k++) {
      var s = runs[(k * 37) % runs.length]; if (rL < s[4] + s[5]) continue;
      var pos = (t * .0011 * (.7 + (k % 5) * .12) + k * 2.3) % (s[5] + 6); if (pos > s[5]) continue; // пауза между импульсами
      var f = pos / s[5], x = s[0] + (s[2] - s[0]) * f, y = s[1] + (s[3] - s[1]) * f;
      var px = cam.x + (x - y) * .866 * S, py = cam.y + (x + y) * .5 * S, r = Math.max(1.5, S * .07);
      g.globalAlpha = Math.sin(f * Math.PI);
      g.drawImage(gBlue, px - sz / 2, py - sz / 2, sz, sz); g.fillStyle = "#E6F6FF"; g.fillRect(px - r, py - r, r * 2, r * 2);
    }
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
  };
  var PULSES = innerWidth < 700 ? 16 : 34;

  /* hero: свет проходит по городу один раз после загрузки, дальше кадр неподвижен */
  var heroCv = $(".hero__city"), hero, heroP = K.REDUCED ? 4 : .15, heroLife;
  function heroCam() { var wide = hero.w > 900; return { x: hero.w * (wide ? .6 : .5), y: hero.h * .5, s: wide ? Math.max(hero.w / 40, hero.h / 24) : hero.h / 30 }; }
  function heroDraw() {
    if (!hero || !hero.w || !hero.h) return;
    draw(hero.g, hero.w, hero.h, heroP, heroCam()); heroLife.snap = null;
  }
  function heroSize() { hero = fitCanvas(heroCv); heroLife = new Life(hero, PULSES); heroDraw(); }
  heroSize();
  if (!K.REDUCED) {
    var t0 = 0;
    requestAnimationFrame(function step(t) { t0 = t0 || t; var k = clamp((t - t0) / 3400); heroP = K.still ? 4 : .15 + 3.85 * (1 - Math.pow(1 - k, 2)); heroDraw(); if (heroP < 4) requestAnimationFrame(step); });
    K.raf(heroCv, function (t) { if (t && heroP >= 4 && hero.w) heroLife.frame(t, heroCam(), maxD + 1); }, 24);
    // глубина: схема уходит медленнее текста
    var py = -1;
    addEventListener("scroll", function () { var y = Math.min(scrollY, innerHeight); if (y === py) return; py = y; heroCv.style.transform = "translate3d(0," + (y * .35).toFixed(1) + "px,0)"; }, { passive: true });
  }

  /* сцена */
  var sec = $("#city"), cv = $(".city__cv"), hud = $(".hud"), facts = $$("#facts li"), steps = $$(".hud__steps button");
  var view, cur = K.REDUCED ? 5 : 0, target = cur, idx = -1, raf = 0;
  var ZOOM = [3.1, 1.75, 1.45, 1, 1, 1.03];
  function camera(p) {
    var w = view.w, h = view.h, cr = cv.getBoundingClientRect(), hr = hud.getBoundingClientRect(), L = 0, T = 0, aw = w, ah = h;
    if (!K.REDUCED) { if (w > 900) { L = hr.right - cr.left; aw = w - L; T = 20; ah = h - 20; } else { T = 8; ah = Math.max(180, hr.top - cr.top - 8); } }
    var i0 = Math.floor(p), f = p - i0, z = ZOOM[i0] + ((ZOOM[Math.min(5, i0 + 1)]) - ZOOM[i0]) * f;
    var s = Math.min(aw / 36.5, ah / 22) * z, west = clamp(p - 4);
    return { x: L + aw / 2 + (w > 900 ? west * s * .5 : 0), y: T + ah / 2, s: s };
  }
  var bar = $(".hud__bar i"), life;
  function paint() { if (view && view.w && view.h) { draw(view.g, view.w, view.h, cur, camera(cur)); life.snap = null; } bar.style.transform = "scaleX(" + (cur / 5).toFixed(3) + ")"; }
  function tick() {
    var diff = target - cur;
    cur = Math.abs(diff) < .004 || K.still ? target : cur + diff * .14;
    paint(); raf = cur === target ? 0 : requestAnimationFrame(tick);
  }
  function show(n) {
    if (n === idx) return; idx = n;
    facts.forEach(function (f, k) { f.classList.toggle("on", k === n); });
    steps.forEach(function (b, k) { if (k === n) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
  }
  var span = function () { return sec.offsetHeight - sec.firstElementChild.offsetHeight; };
  function onScroll() {
    if (K.REDUCED) return;
    var r = sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    var t = clamp(-r.top / Math.max(1, span())) * 6, n = Math.min(5, Math.floor(t)), f = clamp((t - n) / .65);
    target = n ? n - 1 + f * f * (3 - 2 * f) : 0; show(n);
    if (!raf) raf = requestAnimationFrame(tick);
  }
  if (!K.REDUCED) sec.style.height = "560vh";
  steps.forEach(function (b, n) {
    b.addEventListener("click", function () {
      if (K.REDUCED) { cur = target = n; show(n); paint(); return; }
      var y = scrollY + sec.getBoundingClientRect().top + span() * (n + .8) / 6;
      if (K.lenis) K.lenis.scrollTo(y); else scrollTo({ top: y, behavior: "smooth" });
    });
  });
  function size() { view = fitCanvas(cv); life = new Life(view, PULSES); paint(); }
  size(); show(K.REDUCED ? 5 : 0); onScroll();
  K.raf(cv, function (t) { if (t && !raf && cur >= .5 && view.w) life.frame(t, camera(cur), clamp(cur) * (maxD + 1)); }, 24);
  addEventListener("scroll", onScroll, { passive: true });
  var lw = innerWidth, lh = innerHeight, rt = 0;
  addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { if (innerWidth !== lw || Math.abs(innerHeight - lh) > 120) { lw = innerWidth; lh = innerHeight; heroSize(); } size(); onScroll(); }, 120); });
  if (d.fonts) d.fonts.ready.then(paint);
})();
