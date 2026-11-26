/* Разрез дороги: аксонометрия из SVG-граней, грани залиты фото материалов. Слой опускается на место по мере прокрутки. */
(function () {
  "use strict";
  var d = document, svg = d.getElementById("road"), steps = [].slice.call(d.querySelectorAll(".step"));
  var tabs = [].slice.call(d.querySelectorAll(".rz-tabs button")), nameEl = d.getElementById("rz-name");
  var grid = d.querySelector(".rz-g");
  var NS = "http://www.w3.org/2000/svg", DX = 230, DY = -170, REDUCED = window.KIT && KIT.REDUCED;

  function el(tag, attrs, parent) { var n = d.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; }
  var defs = el("defs", {}, svg);
  function pattern(id, src, w, h, y, matrix) {
    var p = el("pattern", { id: id, patternUnits: "userSpaceOnUse", width: w, height: h, y: y || 0 }, defs);
    if (matrix) p.setAttribute("patternTransform", matrix);
    el("image", { href: "img/" + src + ".webp", width: w, height: h, preserveAspectRatio: "xMidYMid slice" }, p);
  }
  var TOP = "matrix(1 0 -0.81 0.6 0 0)", SIDE = "matrix(0.8 -0.59 0 1 0 0)";
  pattern("p-sf", "tx-sand", 600, 95, 465); pattern("p-st", "tx-sand", 520, 120, 0, TOP); pattern("p-sr", "tx-sand", 600, 95, 0, SIDE);
  pattern("p-gf", "tx-stone", 130, 130, 0); pattern("p-gt", "tx-stone", 130, 130, 0, TOP); pattern("p-gr", "tx-stone", 130, 130, 0, SIDE);
  pattern("p-af", "tx-asphalt", 200, 74, 0); pattern("p-at", "tx-asphalt-top", 260, 56, 0, TOP); pattern("p-ar", "tx-asphalt", 200, 74, 0, SIDE);

  function pts(a) { return a.map(function (p) { return p[0] + "," + p[1]; }).join(" "); }
  /* призма-трапеция: низ [xb0,xb1] на высоте yb, верх [xt0,xt1] на высоте yt */
  function faces(s) {
    var xb0 = s[0], xb1 = s[1], yb = s[2], xt0 = s[3], xt1 = s[4], yt = s[5];
    return {
      top: [[xt0, yt], [xt1, yt], [xt1 + DX, yt + DY], [xt0 + DX, yt + DY]],
      right: [[xb1, yb], [xt1, yt], [xt1 + DX, yt + DY], [xb1 + DX, yb + DY]],
      front: [[xb0, yb], [xb1, yb], [xt1, yt], [xt0, yt]]
    };
  }
  function prism(parent, shape, fills, cls) {
    var g = el("g", { "class": cls || "" }, parent), f = faces(shape);
    [["top", fills[1], "rgba(255,255,255,.16)"], ["right", fills[2], "rgba(12,20,30,.36)"], ["front", fills[0], "rgba(12,20,30,.04)"]].forEach(function (x) {
      el("polygon", { points: pts(f[x[0]]), fill: x[1] }, g);
      el("polygon", { points: pts(f[x[0]]), fill: x[2], "class": "shade" }, g);
    });
    return g;
  }

  var ground = [14, 566, 600, 14, 566, 566];
  var L = [
    { name: "Песчаная насыпь", s: [40, 540, 566, 112, 468, 468], f: ["url(#p-sf)", "url(#p-st)", "url(#p-sr)"] },
    { name: "Щебёночное основание", s: [128, 452, 468, 156, 424, 418], f: ["url(#p-gf)", "url(#p-gt)", "url(#p-gr)"] },
    { name: "Асфальтобетон", s: [164, 416, 418, 176, 404, 386], f: ["url(#p-af)", "url(#p-at)", "url(#p-ar)"] },
    { name: "Дорога в работе", s: [178, 402, 386, 184, 396, 370], f: ["url(#p-af)", "url(#p-at)", "url(#p-ar)"] }
  ];
  prism(svg, ground, ["#59636d", "#c3c9c8", "#46505a"]);
  var ghosts = el("g", { "class": "ghost", "aria-hidden": "true" }, svg);
  L.forEach(function (l) { var f = faces(l.s); ["top", "right", "front"].forEach(function (k) { el("polygon", { points: pts(f[k]) }, ghosts); }); });

  L.forEach(function (l, i) {
    l.g = prism(svg, l.s, l.f, "layer");
    var f = faces(l.s);
    if (i === 3) { /* разметка по плоскости покрытия */
      var s = l.s, P = function (u, v) { return [s[3] + u * (s[4] - s[3]) + v * DX, s[5] + v * DY]; };
      [.08, .92].forEach(function (u) { el("polygon", { points: pts([P(u - .012, 0), P(u + .012, 0), P(u + .012, 1), P(u - .012, 1)]), fill: "#f4f5f2" }, l.g); });
      for (var v = .03; v < .95; v += .17) el("polygon", { points: pts([P(.487, v), P(.513, v), P(.513, v + .095), P(.487, v + .095)]), fill: "#f4f5f2" }, l.g);
    }
    /* контур активного слоя и размерная скобка */
    var hl = el("g", { "class": "hl" }, l.g);
    el("polygon", { points: pts(f.front) }, hl); el("polyline", { points: pts([f.front[2], f.top[2], f.top[3], f.top[0]]) }, hl); el("polyline", { points: pts([f.front[1], f.right[3], f.right[2]]) }, hl);
    var x = 26, yb = l.s[2], yt = l.s[5];
    el("path", { d: "M" + x + " " + yt + "V" + yb + "M" + (x - 9) + " " + yt + "h18M" + (x - 9) + " " + yb + "h18M" + (x + 14) + " " + yt + "H" + (l.s[3] - 8), "class": "dim" }, hl);
  });

  var active = -1, queued = false;
  function setActive(i) {
    if (i === active) return; active = i;
    L.forEach(function (l, k) { l.g.classList.toggle("on", k === i); });
    tabs.forEach(function (t, k) { t.setAttribute("aria-current", k === i ? "true" : "false"); });
    nameEl.textContent = L[i].name;
  }
  /* линия срабатывания: на телефоне экран под схемой, поэтому она ниже */
  function line() { return innerHeight * (matchMedia("(max-width:900px)").matches ? .8 : .56); }
  function update() {
    queued = false; var H = innerHeight, ln = line(), cur = 0;
    steps.forEach(function (st, i) {
      var top = st.getBoundingClientRect().top;
      if (top < ln) cur = i;
      var p = REDUCED ? 1 : Math.max(0, Math.min(1, (ln + H * .34 - top) / (H * .32)));
      var e = 1 - Math.pow(1 - p, 3), g = L[i].g;
      g.style.transform = "translateY(" + (-(1 - e) * 96).toFixed(1) + "px)";
      g.style.opacity = Math.min(1, p * 2.2).toFixed(3);
    });
    setActive(cur);
    /* на телефоне шапка не должна наезжать на прилипшую схему */
    var r = grid.getBoundingClientRect(); d.body.classList.toggle("rz-on", r.top < 2 && r.bottom > H * .6);
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  addEventListener("scroll", queue, { passive: true }); addEventListener("resize", queue); update();

  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      var y = steps[+t.dataset.go].getBoundingClientRect().top + scrollY - line() + 24;
      if (window.KIT && KIT.lenis) KIT.lenis.scrollTo(y, { immediate: !!REDUCED });
      else scrollTo({ top: y, behavior: REDUCED ? "auto" : "smooth" });
    });
  });

  /* «Запросить эти работы» подставляет направление в форму */
  var sel = d.getElementById("f-dir");
  d.addEventListener("click", function (e) { var a = e.target.closest("[data-pick]"); if (a) sel.value = a.dataset.pick; });
})();
