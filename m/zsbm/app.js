/* Завод СибБурМаш: свет и параллакс изделия в hero; витрина каталога; сцена «Изделие в разборе» —
   детали разнесённого вида (вырезаны из их же рендера, parts.js) сходятся по линиям сборки, «камера» доезжает
   до масштаба сборки, сканирующая линия сменяет разнесённый вид собранным; линия истории; запрос КП. */
(function () {
  "use strict";
  var d = document, K = window.KIT || {};
  var REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches, FINE = matchMedia("(hover:hover) and (pointer:fine)").matches;
  var cl = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var ease = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var onScroll = []; var ticking = false;
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; onScroll.forEach(function (f) { f(); }); }); } }, { passive: true });
  addEventListener("resize", function () { onScroll.forEach(function (f) { f(); }); });
  function go(target) {
    if (K.lenis) K.lenis.scrollTo(target, { offset: typeof target === "number" ? 0 : -70 });
    else if (typeof target === "number") scrollTo({ top: target, behavior: REDUCED ? "auto" : "smooth" }); else target.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
  }

  /* ── hero: свет и параллакс (курсор — только pointer:fine; изделие не вращаем, чтобы не искажать рендер) ── */
  var hero = d.querySelector(".hero");
  if (hero && !REDUCED) {
    var tx = 0, ty = 0, px = 0, py = 0, hid = 0;
    var loop = function () { px += (tx - px) * .06; py += (ty - py) * .06; hero.style.setProperty("--px", px.toFixed(3)); hero.style.setProperty("--py", py.toFixed(3)); hid = Math.abs(tx - px) + Math.abs(ty - py) > .002 ? requestAnimationFrame(loop) : 0; };
    if (FINE) {
      hero.addEventListener("pointermove", function (e) { tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1; if (!hid) hid = requestAnimationFrame(loop); });
      hero.addEventListener("pointerleave", function () { tx = ty = 0; if (!hid) hid = requestAnimationFrame(loop); });
    }
    var lastSy = -1;
    onScroll.push(function () { var v = Math.round(cl(scrollY / innerHeight) * 1000) / 1000; if (v !== lastSy) { lastSy = v; hero.style.setProperty("--sy", v); } });
  }

  /* ── витрина каталога: вкладки (клик, клавиатура, наведение) ── */
  var ctabs = [].slice.call(d.querySelectorAll(".show-l [role=tab]"));
  function cselect(t, focus) {
    ctabs.forEach(function (b) { var on = b === t; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; d.getElementById(b.getAttribute("aria-controls")).classList.toggle("on", on); });
    if (focus) t.focus();
    if (!FINE && t.scrollIntoView) { var l = t.parentNode; l.scrollTo({ left: t.offsetLeft - 16, behavior: REDUCED ? "auto" : "smooth" }); }
  }
  ctabs.forEach(function (t, i) {
    var hv = 0;
    t.addEventListener("click", function () { cselect(t); });
    if (FINE) { t.addEventListener("pointerenter", function () { hv = setTimeout(function () { cselect(t); }, 110); }); t.addEventListener("pointerleave", function () { clearTimeout(hv); }); }
    t.addEventListener("keydown", function (e) {
      var n = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key], j;
      if (e.key === "Home") j = 0; else if (e.key === "End") j = ctabs.length - 1; else if (n) j = (i + n + ctabs.length) % ctabs.length; else return;
      e.preventDefault(); cselect(ctabs[j], true);
    });
  });

  /* ── сцена «Изделие в разборе» ── */
  var scene = d.getElementById("razbor");
  if (scene) (function () {
    var pin = matchMedia("(min-width: 901px)");
    var tabs = [].slice.call(scene.querySelectorAll("[role=tab]")), cur = "pp2";
    var marks = scene.querySelectorAll("[data-go]"), frame = scene.querySelector(".frame");
    var svg = scene.querySelector(".lines"), balls = scene.querySelector(".balls"), scan = scene.querySelector(".scan");
    var NAMES = { pp2: "ПП2-160х21Ш", pk1: "ПК1-156х21", pmsh: "ПМШ" };
    /* куда «камера» приводит разнесённый вид к масштабу собранного: точка pe (разнесённый) → pa (собранный), масштаб s; f — доля схождения деталей */
    var CFG = { pp2: { pe: [645, 180], pa: [620, 170], s: 1.7, f: .58 }, pk1: { pe: [696, 796], pa: [635, 778], s: 1.66, f: .64 }, pmsh: { pe: [887, 630], pa: [627, 705], s: 1.75, f: .62 } };
    var W = 1258, H = 808, P = window.PARTS || {}, S = {}, k = 0, NS = "http://www.w3.org/2000/svg";

    function build(id) {
      if (S[id] || REDUCED || !P[id]) return;
      var rend = scene.querySelector('.rend[data-p="' + id + '"]'), vex = rend.querySelector(".v-ex"), img = vex.querySelector(".r-ex");
      var g = d.createElement("div"); g.className = "ex-g"; g.style.cssText = "position:absolute;inset:0;transform-origin:0 0;will-change:transform";
      vex.appendChild(g); g.appendChild(img);
      var parts = P[id].parts, body = parts.filter(function (p) { return p.body; })[0] || parts[0], wait = [];
      var st = { g: g, vex: vex, vas: rend.querySelector(".v-as"), parts: [], body: body, ready: false };
      /* номера позиций — по часовой стрелке от «12 часов», корпус — 1 */
      var order = parts.slice().sort(function (a, b) {
        if (a.body) return -1; if (b.body) return 1;
        var aa = (Math.atan2(a.cx - body.cx, -(a.cy - body.cy)) + 2 * Math.PI) % (2 * Math.PI), bb = (Math.atan2(b.cx - body.cx, -(b.cy - body.cy)) + 2 * Math.PI) % (2 * Math.PI); return aa - bb;
      });
      parts.forEach(function (p) {
        var el = d.createElement("div"); el.className = "part";
        el.style.cssText = "left:" + p.x / W * 100 + "%;top:" + p.y / H * 100 + "%;width:" + p.w / W * 100 + "%;height:" + p.h / H * 100 + "%";
        var im = new Image(); im.alt = ""; im.src = "img/" + p.f; im.width = p.w; im.height = p.h; el.appendChild(im); g.appendChild(el);
        wait.push(im.decode ? im.decode().catch(function () {}) : Promise.resolve());
        var n = order.indexOf(p) + 1;
        var b = d.createElement("span"); b.className = "ball" + (p.body ? " b1" : ""); b.textContent = n;
        var ax = p.body ? null : d.createElementNS(NS, "line"), ld = d.createElementNS(NS, "line"); ld.setAttribute("class", "ld");
        st.parts.push({ p: p, el: el, b: b, ax: ax, ld: ld, n: n, small: !p.body && p.w * p.h < body.w * body.h * .12 });
      });
      S[id] = st;
      Promise.all(wait).then(function () { st.ready = true; vex.classList.add("parted"); if (id === cur) { mount(); render(); } });
    }
    function mount() {
      svg.textContent = ""; balls.textContent = "";
      var st = S[cur]; if (!st || !st.ready) return;
      st.parts.forEach(function (o) { if (o.ax) svg.appendChild(o.ax); svg.appendChild(o.ld); balls.appendChild(o.b); });
    }
    function render() {
      scene.style.setProperty("--k", k);
      marks[0].classList.toggle("on", k < .5); marks[1].classList.toggle("on", k >= .5);
      var st = S[cur];
      if (!st || !st.ready) { /* детали ещё не готовы (или parts.js не загрузился) — простая смена видов */
        var rv = scene.querySelector('.rend[data-p="' + cur + '"] .v-as'); rv.style.clipPath = "inset(0 " + ((1 - cl((k - .4) / .4)) * 100).toFixed(2) + "% 0 0)"; return;
      }
      var c = CFG[cur], fw = frame.clientWidth, sc = fw / W;
      var e1 = ease(cl((k - .06) / .6)), ez = ease(cl((k - .18) / .55)), la = 1 - cl((k - .3) / .25), r = ease(cl((k - .66) / .24)), t = cl((k - .88) / .1);
      var s = 1 + (c.s - 1) * ez, b0 = st.body;
      /* габарит видимых деталей на этой фазе — изделие целиком в рамке: масштаб не больше допустимого, сдвиг внутрь */
      var ux0 = 1e9, uy0 = 1e9, ux1 = -1e9, uy1 = -1e9;
      st.parts.forEach(function (o) {
        var p = o.p; if (o.small && e1 > .9) return;
        var ddx = p.body ? 0 : -(p.cx - b0.cx) * c.f * e1, ddy = p.body ? 0 : -(p.cy - b0.cy) * c.f * e1;
        ux0 = Math.min(ux0, p.x + ddx); uy0 = Math.min(uy0, p.y + ddy); ux1 = Math.max(ux1, p.x + p.w + ddx); uy1 = Math.max(uy1, p.y + p.h + ddy);
      });
      var m = 14 * ez, sMax = Math.min((W - 2 * m) / (ux1 - ux0), (H - 2 * m) / (uy1 - uy0));
      if (s > sMax) s = Math.max(1, sMax);
      var gx = c.pe[0] + (c.pa[0] - c.pe[0]) * ez - c.pe[0] * s, gy = c.pe[1] + (c.pa[1] - c.pe[1]) * ez - c.pe[1] * s;
      var fitX = function (a0, a1, g, lim) { var lo = a0 * s + g, hi = a1 * s + g; if (hi - lo > lim - 2 * m) return (lim - (a1 - a0) * s) / 2 - a0 * s; if (lo < m) return m - a0 * s; if (hi > lim - m) return lim - m - a1 * s; return g; };
      if (ez > 0) { gx = fitX(ux0, ux1, gx, W); gy = fitX(uy0, uy1, gy, H); }
      st.g.style.transform = "translate(" + (gx / W * 100).toFixed(3) + "%," + (gy / H * 100).toFixed(3) + "%) scale(" + s.toFixed(4) + ")";
      var b = st.body, bx = b.cx * s + gx, by = b.cy * s + gy;
      st.parts.forEach(function (o) {
        var p = o.p, dx = p.body ? 0 : -(p.cx - b.cx) * c.f * e1, dy = p.body ? 0 : -(p.cy - b.cy) * c.f * e1;
        o.el.style.transform = "translate(" + (dx / p.w * 100).toFixed(3) + "%," + (dy / p.h * 100).toFixed(3) + "%)";
        if (o.small) o.el.style.opacity = (1 - cl((e1 - .55) / .4)).toFixed(3); /* мелкие детали (болты, прокладки) уходят внутрь корпуса */
        var X = (p.cx + dx) * s + gx, Y = (p.cy + dy) * s + gy;
        var vx = X - bx, vy = Y - by, L = Math.sqrt(vx * vx + vy * vy) || 1;
        if (p.body) { vx = -.6; vy = -.8; L = 1; }
        var rad = Math.min(Math.max(p.w, p.h) * s * .42, 150) + 34;
        var BX = Math.min(W - 24, Math.max(24, X + vx / L * rad)), BY = Math.min(H - 24, Math.max(24, Y + vy / L * rad));
        if (o.ax) { o.ax.setAttribute("x1", bx); o.ax.setAttribute("y1", by); o.ax.setAttribute("x2", X); o.ax.setAttribute("y2", Y); o.ax.style.opacity = la * .9; }
        o.ld.setAttribute("x1", X); o.ld.setAttribute("y1", Y); o.ld.setAttribute("x2", BX); o.ld.setAttribute("y2", BY); o.ld.style.opacity = la;
        o.b.style.transform = "translate(" + (BX * sc).toFixed(1) + "px," + (BY * sc).toFixed(1) + "px)"; o.b.style.opacity = la;
      });
      st.vex.style.clipPath = r > 0 ? "inset(0 0 0 " + (r * 100).toFixed(2) + "%)" : "";
      st.vas.style.clipPath = "inset(0 " + ((1 - r) * 100).toFixed(2) + "% 0 0)";
      st.vas.style.transform = "scale(" + (1.015 - .015 * r).toFixed(4) + ")";
      st.vas.style.setProperty("--t", t);
      scan.style.left = (r * 100).toFixed(2) + "%"; scan.style.opacity = r > 0 && r < 1 ? 1 : 0;
    }

    function select(id, focus) {
      cur = id;
      tabs.forEach(function (t) {
        var on = t.id === "t-" + id; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
        d.getElementById(t.getAttribute("aria-controls")).hidden = !on; if (on && focus) t.focus();
      });
      scene.querySelectorAll(".rend").forEach(function (r) { r.hidden = r.dataset.p !== id; });
      build(id); mount(); render();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t.id.slice(2)); });
      t.addEventListener("keydown", function (e) {
        var n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!n) return;
        e.preventDefault(); select(tabs[(i + n + tabs.length) % tabs.length].id.slice(2), true);
      });
    });
    d.querySelectorAll("[data-pick]").forEach(function (a) { a.addEventListener("click", function () { select(a.dataset.pick); }); });
    d.getElementById("ask").addEventListener("click", function () {
      var s = d.getElementById("f-prod"); s.value = NAMES[cur]; go(d.getElementById("kp"));
      setTimeout(function () { s.focus({ preventScroll: true }); }, 900);
    });

    if (REDUCED) { k = 1; render(); return; }
    var manual = null, tw = 0;
    function measure() {
      if (manual !== null) { if (Math.abs(scrollY - manual) < 160) return; manual = null; }
      var p;
      if (pin.matches) { var rr = scene.getBoundingClientRect(); p = -rr.top / Math.max(1, rr.height - innerHeight); p = (p - .06) / .8; }
      else { var sr = frame.getBoundingClientRect(); p = (innerHeight * .82 - sr.top) / (innerHeight * .62); }
      var v = Math.round(cl(p) * 1000) / 1000; if (v !== k) { k = v; render(); }
    }
    onScroll.push(measure);
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) { build(cur); } }, { rootMargin: "900px 0px" }).observe(scene);
    measure();
    /* кнопки шкалы: на ПК — прокрутка к нужной точке, на телефоне — плавная сборка/разборка на месте */
    marks.forEach(function (b) {
      b.addEventListener("click", function () {
        var v = +b.dataset.go;
        if (pin.matches) { var top = scene.getBoundingClientRect().top + scrollY, len = scene.offsetHeight - innerHeight; go(top + len * (v ? .9 : .04)); return; }
        cancelAnimationFrame(tw); manual = scrollY; var k0 = k, t0 = performance.now();
        (function step(now) { var q = cl((now - t0) / 1400); k = k0 + (v - k0) * ease(q); render(); if (q < 1) tw = requestAnimationFrame(step); })(t0);
      });
    });
  })();

  /* ── история: линия дорисовывается по прокрутке; фото цеха чуть отстаёт (параллакс) ── */
  var hist = d.querySelector(".hist"), zp2 = d.querySelector(".zp2");
  if (!REDUCED) {
    if (hist) onScroll.push(function () { var r = hist.getBoundingClientRect(); hist.style.setProperty("--hp", cl((innerHeight * .85 - r.top) / (r.height + innerHeight * .25)).toFixed(3)); });
    if (zp2 && FINE) onScroll.push(function () { var r = zp2.getBoundingClientRect(); var q = cl((innerHeight - r.top) / (innerHeight + r.height)); zp2.style.transform = "translateY(" + ((q - .5) * -70).toFixed(1) + "px)"; });
  }
  onScroll.forEach(function (f) { f(); });
})();
