/* «Маршрут груза»: условная схема ЯНАО/ХМАО. Пункты — только названные на ulogist.ru; связи условны (подпись на схеме). */
(function () {
  "use strict";
  var d = document, NS = "http://www.w3.org/2000/svg", svg = d.getElementById("map"); if (!svg) return;
  function el(tag, at, parent) { var e = d.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function $(id) { return d.getElementById(id); }

  /* условная география, viewBox 0 120 860 820 */
  var SEA = "M0 120H860V150C820 158 790 150 760 165C720 185 690 178 660 196C630 212 600 206 572 204L556 300C552 356 566 398 602 420C640 440 662 456 676 480L660 492C626 472 590 458 552 458C522 474 492 520 458 550L436 556C446 502 470 424 480 344C487 278 482 228 472 196C436 176 404 158 368 150C334 156 314 196 304 236C290 310 274 372 250 414C214 444 150 438 104 420C64 404 30 390 0 380Z";
  var RIVERS = [
    ["M446 553C414 574 384 590 352 600C312 614 282 650 270 700C260 745 268 780 290 806C312 834 322 860 330 882C380 898 450 892 520 880C566 872 606 862 650 850", 9],
    ["M268 742C258 738 246 736 236 736", 4],
    ["M598 466C614 522 640 572 660 620C672 650 684 674 696 696", 5]
  ];
  var BOUND = [
    "M0 690C160 684 240 690 330 712C430 744 520 752 600 742C680 732 720 748 760 760",
    "M760 140C776 300 744 420 772 560C790 650 760 760 772 940"
  ];
  var REG = { ya: "M0 120H760C776 300 744 420 772 560 L760 760C720 748 680 732 600 742C520 752 430 744 330 712C240 690 160 684 0 690Z",
              hm: "M0 690C160 684 240 690 330 712C430 744 520 752 600 742C680 732 720 748 760 760L772 940H0Z" };
  var N = {
    Q:  [62, 850, "Карьер", "q"],
    Pr: [282, 800, "Приобье", "base", "r"], Lb: [318, 590, "Лабытнанги", "base", "l"], Kr: [698, 700, "Коротчаево", "base", "l"],
    hm: [330, 884, "Ханты-Мансийск", "dest", "b"], sg: [520, 880, "Сургут", "dest", "b"], pl: [598, 818, "нефтепровод «Урьевские — Южный Балык»", "dest", "pl"],
    bz: [234, 736, "Березово", "dest", "l"], sh: [364, 614, "Салехард", "dest", "r"], nu: [662, 652, "Новый Уренгой", "dest", "l"],
    tz: [684, 498, "Тазовский", "dest", "t"], hb: [326, 384, "Харбейское м-е", "dest", "l"], tb: [432, 214, "Тамбейское м-е", "dest", "l"]
  };
  var P = function (k) { return N[k].slice(0, 2); };
  var QPr = ["auto", [P("Q"), [170, 830], P("Pr")]];
  var RUP = [P("Pr"), [270, 760], [268, 700], [300, 632]];          /* вверх по Оби от Приобья */
  var BAY = [[352, 600], [446, 553], [500, 470]];                      /* в Обскую губу */
  var R = {
    hm: { s: [QPr, ["river", [P("Pr"), [312, 842], P("hm")]]], w: [QPr, ["auto", [P("Pr"), [300, 850], P("hm")]]] },
    sg: { s: [QPr, ["river", [P("Pr"), [314, 846], [336, 884], [450, 892], P("sg")]]], w: [QPr, ["auto", [P("Pr"), [380, 860], P("sg")]]] },
    pl: { s: [QPr, ["river", [P("Pr"), [314, 846], [336, 884], [450, 892], P("sg")]], ["auto", [P("sg"), P("pl")]]], w: [QPr, ["auto", [P("Pr"), [420, 846], P("pl")]]] },
    bz: { s: [QPr, ["river", [P("Pr"), [270, 762], [252, 740], P("bz")]]], w: [QPr, ["winter", [P("Pr"), [250, 770], P("bz")]]] },
    sh: { s: [QPr, ["river", RUP.concat([P("sh")])]], w: [QPr, ["winter", [P("Pr"), [300, 720], [340, 660], P("sh")]]] },
    nu: { s: [QPr, ["river", RUP.concat(BAY, [[560, 450], [602, 470], [624, 530], [662, 616], P("Kr")])], ["auto", [P("Kr"), P("nu")]]],
          w: [["auto", [P("Q"), [200, 900], [420, 872], [600, 790], P("Kr")]], ["auto", [P("Kr"), P("nu")]]] },
    hb: { s: [["river", [P("Lb")].concat(BAY.slice(0), [[486, 404]])], ["auto", [[486, 404], [400, 392], P("hb")]]], w: [["winter", [P("Lb"), [300, 500], P("hb")]]] },
    tb: { s: [["river", [P("Lb")].concat(BAY, [[514, 360], [508, 262], [470, 222], P("tb")])]], w: [["winter", [P("Lb"), [366, 470], [404, 320], P("tb")]]] },
    tz: { s: [["river", [P("Lb")].concat(BAY, [[560, 450], [624, 466], P("tz")])]], w: [["winter", [P("Kr"), [712, 600], P("tz")]]] }
  };
  var CARGO = {
    sand:   { k: "Песок", v: "более 700 тыс. т", d: "Для дорожного строительства и производства ЖБИ, для ремонта основной нитки нефтепровода «Урьевские — Южный Балык».", to: ["sg", "sh", "bz", "pl"], form: "Песок" },
    gravel: { k: "Щебень", v: "более 900 тыс. т", d: "Для строительных работ в Березово, Ханты-Мансийске и Новом Уренгое.", to: ["bz", "hm", "nu"], form: "Щебень" },
    plates: { k: "Дорожные плиты ПДН", v: "более 11 тыс. шт.", d: "На Харбейское и Тамбейское нефтегазоконденсатные месторождения и для нужд посёлка Тазовский.", to: ["hb", "tb", "tz"], form: "Дорожные плиты" },
    coal:   { k: "Уголь", v: "более 30 тыс. т", d: "Для районов и населённых пунктов ЯНАО и ХМАО. Конкретные пункты на сайте компании не названы — поэтому на схеме выделены округа и базы.", to: [], form: "Уголь" }
  };
  var MODE = { auto: "авто", river: "река", winter: "зимник" };
  var NAME = { Q: "Карьер", Pr: "база Приобье", Lb: "база Лабытнанги", Kr: "база Коротчаево" };

  /* плавная линия через точки (Catmull-Rom → кубические Безье) */
  function curve(p) {
    var s = "M" + p[0][0] + " " + p[0][1];
    for (var i = 0; i < p.length - 1; i++) {
      var a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
      s += "C" + (b[0] + (c[0] - a[0]) / 6).toFixed(1) + " " + (b[1] + (c[1] - a[1]) / 6).toFixed(1) + " " + (c[0] - (e[0] - b[0]) / 6).toFixed(1) + " " + (c[1] - (e[1] - b[1]) / 6).toFixed(1) + " " + c[0] + " " + c[1];
    }
    return s;
  }

  /* статичная подложка */
  var gReg = $("m-reg"), gW = $("m-water"), gB = $("m-bound"), gR = $("m-route"), gN = $("m-nodes"), gD = $("m-dots");
  var regs = { ya: el("path", { d: REG.ya, "class": "reg" }, gReg), hm: el("path", { d: REG.hm, "class": "reg" }, gReg) };
  el("path", { d: SEA, "class": "water" }, gW);
  RIVERS.forEach(function (r) { el("path", { d: r[0], "class": "riv", "stroke-width": r[1] }, gW); });
  BOUND.forEach(function (b) { el("path", { d: b, "class": "bnd" }, gB); });
  var rgl = {
    ya: el("text", { x: 560, y: 600, "class": "rg" }, gB), hm: el("text", { x: 430, y: 800, "class": "rg" }, gB),
    kr: el("text", { x: 792, y: 410, "class": "rg", transform: "rotate(90 792 410)" }, gB)
  };
  rgl.ya.textContent = "ЯНАО"; rgl.hm.textContent = "ХМАО"; rgl.kr.textContent = "КРАСНОЯРСКИЙ КРАЙ";
  [["Карское море", 120, 200], ["Обская губа", 520, 330]].forEach(function (t) { var x = el("text", { x: t[1], y: t[2], "class": "rg" }, gB); x.textContent = t[0]; x.style.letterSpacing = ".04em"; x.style.fontStyle = "italic"; });

  var nodes = {};
  Object.keys(N).forEach(function (k) {
    var n = N[k], g = el("g", { "class": "nd " + n[3] }, gN), t;
    if (n[3] === "base") el("rect", { x: n[0] - 11, y: n[1] - 11, width: 22, height: 22, rx: 3 }, g);
    else if (n[3] === "q") el("rect", { x: n[0] - 12, y: n[1] - 12, width: 24, height: 24, rx: 3 }, g);
    else el("circle", { cx: n[0], cy: n[1], r: 8 }, g);
    t = el("text", {}, g); t.textContent = n[2];
    var pos = n[4];
    if (n[3] === "q") { t.setAttribute("x", n[0] - 14); t.setAttribute("y", n[1] - 26); }
    else if (pos === "t") { t.setAttribute("x", n[0]); t.setAttribute("y", n[1] - 20); t.setAttribute("text-anchor", "middle"); }
    else if (pos === "l") { t.setAttribute("x", n[0] - 18); t.setAttribute("y", n[1] + 7); t.setAttribute("text-anchor", "end"); }
    else if (pos === "b") { t.setAttribute("x", n[0]); t.setAttribute("y", n[1] + 36); t.setAttribute("text-anchor", "middle"); }
    else if (pos === "pl") { t.setAttribute("x", n[0] + 14); t.setAttribute("y", n[1] - 16); t.setAttribute("text-anchor", "middle"); t.textContent = "нефтепровод"; }
    else { t.setAttribute("x", n[0] + 18); t.setAttribute("y", n[1] + 7); }
    nodes[k] = g;
  });

  /* состояние */
  var st = { cargo: "sand", season: "s" }, runs = [];
  var RED = function () { return window.KIT && (KIT.REDUCED || KIT.still); };

  function render() {
    var c = CARGO[st.cargo], used = {};
    gR.textContent = ""; gD.textContent = ""; runs = [];
    svg.classList.toggle("winter", st.season === "w");
    regs.ya.classList.toggle("on", st.cargo === "coal"); regs.hm.classList.toggle("on", st.cargo === "coal");
    rgl.ya.classList.toggle("hl", st.cargo === "coal"); rgl.hm.classList.toggle("hl", st.cargo === "coal");
    var list = $("r-l"); list.textContent = "";
    c.to.forEach(function (dest, di) {
      var segs = R[dest][st.season], all = [], parts = [];
      segs.forEach(function (sg, si) {
        var pts = sg[1], dd = curve(pts), p = el("path", { d: dd, "class": "seg-r m-" + sg[0] }, gR);
        pts.forEach(function (q) { all.push(q); });
        Object.keys(N).forEach(function (k) { if (N[k][0] === pts[0][0] && N[k][1] === pts[0][1]) used[k] = 1; if (N[k][0] === pts[pts.length - 1][0] && N[k][1] === pts[pts.length - 1][1]) used[k] = 1; });
        var len = p.getTotalLength();
        if (!RED() && sg[0] !== "winter") { p.style.strokeDasharray = len; p.style.strokeDashoffset = len; p.getBoundingClientRect(); p.classList.add("draw"); p.style.transitionDelay = (di * 180 + si * 500) + "ms"; p.style.strokeDashoffset = 0;
          p.addEventListener("transitionend", function () { p.style.strokeDasharray = ""; }, { once: true }); }
        parts.push(sg[0]);
      });
      used[dest] = 1;
      /* текстовая цепочка */
      var chain = [], first = segs[0][1][0];
      Object.keys(NAME).forEach(function (k) { if (N[k][0] === first[0] && N[k][1] === first[1]) chain.push(NAME[k]); });
      segs.forEach(function (sg) {
        var last = sg[1][sg[1].length - 1], nm = "";
        Object.keys(N).forEach(function (k) { if (N[k][0] === last[0] && N[k][1] === last[1]) nm = NAME[k] || N[k][2]; });
        chain.push(' → <span class="mode">' + MODE[sg[0]] + '</span> → ' + (nm || "берег Обской губы"));
      });
      var li = d.createElement("li"); li.innerHTML = "<b>" + N[dest][2] + "</b>" + chain.join(""); list.appendChild(li);
      /* путь для «груза» */
      var path = el("path", { d: curve(all), fill: "none", stroke: "none" }, gD);
      var dot = el("circle", { r: 9, "class": "dot" }, gD);
      runs.push({ p: path, dot: dot, L: path.getTotalLength(), off: di * .23 });
    });
    if (st.cargo === "coal") { used.Pr = used.Lb = used.Kr = 1; }
    if (c.to.length && !used.Q) used.Q = 0;
    Object.keys(nodes).forEach(function (k) { nodes[k].classList.toggle("dim", !used[k] && !(N[k][3] === "base" && st.cargo === "coal")); });
    if (!c.to.length) { var li = d.createElement("li"); li.innerHTML = "<b>Базы УЛС</b>Коротчаево, Приобье, Лабытнанги — хранение и перевалка между рекой и дорогой"; list.appendChild(li); }
    $("r-k").textContent = c.k + (st.season === "s" ? " · навигация" : " · зимник");
    $("r-v").textContent = c.v; $("r-d").textContent = c.d;
    tick(RED() ? 600 : 0);
  }
  function tick(t) {
    runs.forEach(function (r) {
      var k = ((t / 1000) / Math.max(6, r.L / 90) + r.off) % 1, e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, pt = r.p.getPointAtLength(e * r.L);
      r.dot.setAttribute("cx", pt.x.toFixed(1)); r.dot.setAttribute("cy", pt.y.toFixed(1));
    });
  }

  function bindSeg(attr, key) {
    var bs = [].slice.call(d.querySelectorAll("[" + attr + "]"));
    bs.forEach(function (b) { b.addEventListener("click", function () { set(key, b.getAttribute(attr)); }); });
  }
  function set(key, v) {
    st[key] = v;
    [].forEach.call(d.querySelectorAll("[data-cargo]"), function (b) { b.setAttribute("aria-pressed", b.dataset.cargo === st.cargo); });
    [].forEach.call(d.querySelectorAll("[data-season]"), function (b) { b.setAttribute("aria-pressed", b.dataset.season === st.season); });
    render();
  }
  bindSeg("data-cargo", "cargo"); bindSeg("data-season", "season");
  /* ссылки «Показать на схеме» */
  [].forEach.call(d.querySelectorAll("[data-go]"), function (a) { a.addEventListener("click", function () { set("cargo", a.dataset.go); }); });
  /* кнопка под схемой переносит выбор в форму */
  $("r-cta").addEventListener("click", function () { $("f-cargo").value = CARGO[st.cargo].form; $("f-season").selectedIndex = st.season === "s" ? 0 : 1; });

  function start() { render(); if (window.KIT && KIT.raf) KIT.raf(svg, function (t) { tick(t); }); }
  if (window.KIT) start(); else d.addEventListener("kit:ready", start);
})();
