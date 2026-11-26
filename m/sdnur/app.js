/* Мой дом: поиск дома из списка sdnur.ru/house, изометрическая схема дома, сцена «кто за что отвечает». */
(function () {
"use strict";
var d = document, root = d.documentElement;
var $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
var SITE = "https://sdnur.ru/house";

/* 38 записей «Список домов в управлении» (sdnur.ru/house). Паспортные данные — только для домов, чьи страницы прочитаны:
   y — год постройки (или ввода), e — подъездов, f — этажей (макс.), kv — квартир; id — номер страницы дома на сайте. */
var HOUSES = [
  ["ул. Арктическая, 31", 49, { y: "2021", e: 5, f: 9, kv: 322 }],
  ["мкр. Восточный, 1 корп. 1А", 16, { y: "2011", f: 9, kv: 56 }],
  ["мкр. Восточный, 2 корп. 3А", 2, { y: "2011", e: 2, f: 9, kv: 43 }],
  ["мкр. Восточный, 3 корп. 3", 12, { y: "1999", e: 4, f: 9, kv: 108 }],
  ["мкр. Восточный, 4 корп. 2", 13, { y: "2006", f: 10, kv: 121 }],
  ["мкр. Восточный, 4 корп. 3", 72, { y: "2001", yl: "Ввод в эксплуатацию", e: 2, f: 9, kv: 42 }],
  ["мкр. Восточный, 5 корп. 4", 30, { y: "2005", e: 1, f: 9, kv: 44 }],
  ["мкр. Восточный, 6 корп. 4Б", 48, { y: "2006", e: 2, f: 9, kv: 72 }],
  ["пр-кт. Губкина, 7 лит. Б", 27, { y: "2007", e: 4, f: 9, kv: 120 }],
  ["пр-кт. Губкина, 15"], ["пр-кт. Губкина, 19"], ["пр-кт. Губкина, 26"], ["пр-кт. Губкина, 26 (Паркинг)"],
  ["мкр. Дружба, 2 корп. 2"], ["мкр. Дружба, 6 корп. 2"], ["мкр. Дружба, 6 (Паркинг) корп. 2"],
  ["ул. Железнодорожная, 46А"], ["пр. Ленинградский, 17"], ["ул. Набережная, 32 корп. 1"], ["ул. Надымская, 12 корп. 1"],
  ["мкр. Оптимистов, 4 корп. 1"], ["мкр. Оптимистов, 4 корп. 3"], ["мкр. Оптимистов, 10 корп. 1"],
  ["мкр. Советский, 3 корп. 1"], ["мкр. Созидателей, 2А"], ["мкр. Созидателей, 4 корп. 1"],
  ["мкр. Строителей, 3"], ["мкр. Строителей, 5 корп. 5"],
  ["мкр. Тундровый, 1"], ["мкр. Тундровый, 2"], ["мкр. Тундровый, 3"], ["мкр. Тундровый, 4"], ["мкр. Тундровый, 5"], ["мкр. Тундровый, 6"],
  ["мкр. Юбилейный, 1 корп. 1А"], ["мкр. Юбилейный, 2 корп. 2 А"], ["мкр. Юбилейный, 3 корп. 1а"], ["ул. Южная, 52 лит. А"]
].map(function (h, i) { return { i: i, a: h[0], id: h[1] || 0, p: h[2] || null, k: norm(h[0]) }; });
window.SD_HOUSES = HOUSES;

function norm(s) { return s.toLowerCase().replace(/ё/g, "е").replace(/(мкр|ул|пр-кт|пр|корп|лит)\.?/g, " ").replace(/[.,()]/g, " ").replace(/\s+/g, " ").trim(); }
function nb(s) { return s.replace(/ (?=\S{1,3}(\s|$))/g, " ").replace(/\. /g, ". "); }
function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
/* поиск: все слова запроса должны встретиться в адресе (порядок не важен), «3 3» найдёт «Восточный, 3 корп. 3» */
function match(q) {
  var w = norm(q).split(" ").filter(Boolean); if (!w.length) return HOUSES.slice();
  var res = HOUSES.filter(function (h) { var hw = h.k.split(" "); return w.every(function (x) { return /^\d/.test(x) ? hw.indexOf(x) > -1 || hw.some(function (y) { return y.indexOf(x) === 0 && /^\d/.test(y); }) : h.k.indexOf(x) > -1; }); });
  /* точные совпадения номеров — выше: «Восточный 3» сначала даст «3 корп. 3», а не «2 корп. 3А» */
  function sc(h) { var hw = h.k.split(" "); return w.filter(function (x) { return hw.indexOf(x) > -1; }).length; }
  return res.sort(function (a, b) { return sc(b) - sc(a) || a.i - b.i; });
}
window.SD_match = match;

/* ---------- изометрическая схема дома (SVG-строка). Схема условная: число подъездов и этажей — из паспорта, если он есть ---------- */
var S = 21;
function house(opt) {
  var E = Math.max(1, Math.min(opt.e || 3, 6)), F = Math.max(2, Math.min(opt.f || 9, 12));
  var W = E * 3.2, D = 2.6, fh = .62, B = .5, H = B + F * fh, Y = D + 5.2;
  var mnx = 1e9, mny = 1e9, mxx = -1e9, mxy = -1e9;
  function pt(x, y, z) { var X = (x - y) * .866 * S, Yp = ((x + y) * .5 - z) * S; if (X < mnx) mnx = X; if (X > mxx) mxx = X; if (Yp < mny) mny = Yp; if (Yp > mxy) mxy = Yp; return X.toFixed(1) + "," + Yp.toFixed(1); }
  function poly(a, cls) { return '<polygon class="' + cls + '" points="' + a.map(function (p) { return pt(p[0], p[1], p[2]); }).join(" ") + '"/>'; }
  function line(a, cls) { return '<polyline class="' + cls + '" points="' + a.map(function (p) { return pt(p[0], p[1], p[2]); }).join(" ") + '"/>'; }
  function box(x0, y0, x1, y1, z0, z1, cls) { /* три видимые грани коробки */
    return poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], cls + " f1") + poly([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], cls + " f2") + poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], cls + " f3");
  }
  var o = { yard: "", base: "", body: "", entr: "", roof: "", front: "" }, e, i, x0;
  /* двор */
  o.yard += poly([[-2.4, -1.4, 0], [W + 2.4, -1.4, 0], [W + 2.4, Y, 0], [-2.4, Y, 0]], "ground");
  o.yard += poly([[-2.4, D, 0], [W + 2.4, D, 0], [W + 2.4, D + 1, 0], [-2.4, D + 1, 0]], "walk");
  o.yard += poly([[-2.4, D + 2.3, 0], [W + 2.4, D + 2.3, 0], [W + 2.4, D + 3.2, 0], [-2.4, D + 3.2, 0]], "road");
  o.yard += line([[-2.4, D + 2.75, 0], [W + 2.4, D + 2.75, 0]], "ln dash");
  o.yard += poly([[.6, D + 3.7, 0], [Math.min(4.2, W - .4), D + 3.7, 0], [Math.min(4.2, W - .4), D + 4.9, 0], [.6, D + 4.9, 0]], "play ln");
  /* подвал: условный разрез под домом и трубы */
  o.base += line([[0, D, 0], [0, D, -1.1], [W, D, -1.1], [W, 0, -1.1], [W, 0, 0]], "cut ln");
  o.base += line([[W, D, 0], [W, D, -1.1]], "cut ln");
  o.base += '<path class="pipe ln" d="M' + pt(.3, D - .2, -.45) + "L" + pt(W - .3, D - .2, -.45) + "L" + pt(W - .3, .4, -.45) + '"/>';
  o.base += '<path class="pipe pipe2 ln" d="M' + pt(.3, D - .2, -.8) + "L" + pt(W - .3, D - .2, -.8) + '"/>';
  for (e = 0; e < E; e++) o.base += '<path class="pipe ln" d="M' + pt(e * 3.2 + 1.6, D - .2, -.45) + "L" + pt(e * 3.2 + 1.6, D - .2, 0) + '"/>';
  /* корпус */
  o.body += poly([[W, 0, 0], [W, D, 0], [W, D, H], [W, 0, H]], "side ln");
  o.body += poly([[0, D, 0], [W, D, 0], [W, D, H], [0, D, H]], "front ln");
  var plinth = poly([[0, D, 0], [W, D, 0], [W, D, B], [0, D, B]], "plinth") + poly([[W, 0, 0], [W, D, 0], [W, D, B], [W, 0, B]], "plinth s");
  for (x0 = .5; x0 < W - .3; x0 += 1.6) plinth += poly([[x0, D, .16], [x0 + .32, D, .16], [x0 + .32, D, .32], [x0, D, .32]], "vent");
  o.base = plinth + o.base;
  for (i = 0; i < F; i++) {
    var zb = B + i * fh + .17, zt = zb + .3;
    for (e = 0; e < E; e++) {
      x0 = e * 3.2;
      [.35, .95, 2.15, 2.75].forEach(function (dx) { o.body += poly([[x0 + dx, D, zb], [x0 + dx + .38, D, zb], [x0 + dx + .38, D, zt], [x0 + dx, D, zt]], "win"); });
      if (i > 0) o.entr += poly([[x0 + 1.43, D, zb - .2], [x0 + 1.77, D, zb - .2], [x0 + 1.77, D, zt - .25], [x0 + 1.43, D, zt - .25]], "stair");
    }
    [.45, 1.75].forEach(function (y) { o.body += poly([[W, y, zb], [W, y + .4, zb], [W, y + .4, zt], [W, y, zt]], "win s"); });
  }
  for (e = 0; e < E; e++) {
    x0 = e * 3.2;
    o.entr += poly([[x0 + 1.33, D, 0], [x0 + 1.87, D, 0], [x0 + 1.87, D, .62], [x0 + 1.33, D, .62]], "door ln");
    o.entr += poly([[x0 + 1.15, D, .72], [x0 + 2.05, D, .72], [x0 + 2.05, D + .5, .72], [x0 + 1.15, D + .5, .72]], "canopy ln");
    o.entr += poly([[x0 + 1.25, D, .06], [x0 + 1.95, D, .06], [x0 + 1.95, D + .55, .06], [x0 + 1.25, D + .55, .06]], "step");
  }
  /* кровля */
  o.roof += poly([[0, 0, H], [W, 0, H], [W, D, H], [0, D, H]], "top ln");
  o.roof += line([[.15, D - .15, H + .001], [W - .15, D - .15, H], [W - .15, .15, H]], "ln parapet");
  for (e = 0; e < E; e++) o.roof += box(e * 3.2 + 1.25, .8, e * 3.2 + 1.95, 1.5, H, H + .5, "hut ln");
  o.roof += '<path class="ln drain" d="M' + pt(W, D, H) + "L" + pt(W, D, .05) + '"/>';
  /* передний двор: фонари, площадка, контейнеры, деревья */
  var fr = [];
  for (x0 = 1; x0 < W + 1; x0 += 4.2) fr.push([x0 + D + 1.2, '<g class="lamp">' + line([[x0, D + 1.25, 0], [x0, D + 1.25, 1.7]], "ln pole") + '<circle class="bulb" cx="' + pt(x0, D + 1.25, 1.75).split(",")[0] + '" cy="' + pt(x0, D + 1.25, 1.75).split(",")[1] + '" r="3.2"/></g>']);
  var cx = W - 2.1;
  fr.push([cx + D + 4, '<g class="bins">' + poly([[cx - .2, D + 3.6, 0], [cx + 1.8, D + 3.6, 0], [cx + 1.8, D + 4.8, 0], [cx - .2, D + 4.8, 0]], "pad ln") + box(cx, D + 3.9, cx + .45, D + 4.4, 0, .5, "bin") + box(cx + .65, D + 3.9, cx + 1.1, D + 4.4, 0, .5, "bin") + box(cx + 1.3, D + 3.9, cx + 1.6, D + 4.4, 0, .5, "bin k") + "</g>"]);
  [[-1.3, D + 1.6], [-1.1, D + 4.4], [W + 1.4, D + 1.9]].forEach(function (t) { var c = pt(t[0], t[1], 1.25).split(","); fr.push([t[0] + t[1], '<g class="tree">' + line([[t[0], t[1], 0], [t[0], t[1], .9]], "ln trunk") + '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + (S * .55).toFixed(1) + '"/></g>']); });
  fr.sort(function (a, b) { return a[0] - b[0]; });
  o.front = fr.map(function (f) { return f[1]; }).join("");
  /* метки зон (экранные точки для маркера) */
  function P(x, y, z) { var p = pt(x, y, z).split(","); return { x: +p[0], y: +p[1] }; }
  var mid = Math.floor(E / 2) * 3.2;
  var pins = { roof: P(W * .5, D * .5, H + .35), entr: P(mid + 1.6, D + .55, .95), base: P(W * .62, D, -.9), yard: P(2.4, D + 4.3, .1) };
  var pad = 14, vb = [mnx - pad, mny - pad - 10, mxx - mnx + pad * 2, mxy - mny + pad * 2 + 10].map(function (v) { return v.toFixed(0); }).join(" ");
  var svg = '<svg class="house" viewBox="' + vb + '" role="img" aria-label="' + esc(opt.label || "Схема дома") + '">' +
    '<g data-z="yard">' + o.yard + "</g>" + '<g data-z="base">' + o.base + "</g>" +
    '<g class="body">' + o.body + "</g>" + '<g data-z="entr">' + o.entr + "</g>" + '<g data-z="roof">' + o.roof + "</g>" +
    '<g data-z="yard" class="yard-front">' + o.front + "</g>" + (opt.marker ? '<g class="mk"><circle r="15"/><path d="M-9 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M-1 0h10M6 0v3.5M9 0v3"/></g>' : "") + "</svg>";
  return { svg: svg, pins: pins };
}
window.SD_house = house;

/* ---------- состояние: выбранный дом ---------- */
var cur = null, listeners = [];
function pick(h) { cur = h; listeners.forEach(function (f) { f(h); }); }
function onPick(f) { listeners.push(f); }
window.SD_pick = function (i) { pick(HOUSES[i]); };

/* ---------- поиск-комбобокс в hero ---------- */
var inp = $("#q"), lb = $("#q-list"), act = -1, shown = [];
function render(q) {
  shown = match(q); act = shown.length ? 0 : -1;
  lb.innerHTML = shown.length ? shown.map(function (h, n) { return '<li role="option" id="qo' + n + '" data-i="' + h.i + '"' + (n === 0 ? ' aria-selected="true"' : "") + ">" + esc(nb(h.a)) + (h.p ? '<span class="has">паспорт</span>' : "") + "</li>"; }).join("") : '<li class="none" role="presentation">Такого адреса нет в&nbsp;списке домов управляющей компании</li>';
  inp.setAttribute("aria-activedescendant", act > -1 ? "qo0" : "");
  $("#q-count").textContent = shown.length ? "Найдено адресов: " + shown.length : "Нет совпадений";
}
function open(v) { lb.hidden = !v; inp.setAttribute("aria-expanded", v); }
function move(n) {
  if (!shown.length) return; var items = $$('[role="option"]', lb);
  if (act > -1) items[act].removeAttribute("aria-selected");
  act = (act + n + shown.length) % shown.length; items[act].setAttribute("aria-selected", "true"); items[act].scrollIntoView({ block: "nearest" });
  inp.setAttribute("aria-activedescendant", "qo" + act);
}
function choose(h) { inp.value = h.a; open(false); pick(h); }
if (inp) {
  inp.addEventListener("input", function () { render(inp.value); open(true); });
  inp.addEventListener("focus", function () { render(inp.value === (cur && cur.a) ? "" : inp.value); open(true); });
  inp.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); if (lb.hidden) { render(inp.value); open(true); } else move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") { e.preventDefault(); if (act > -1 && !lb.hidden) choose(shown[act]); }
    else if (e.key === "Escape") open(false);
  });
  lb.addEventListener("pointerdown", function (e) { var li = e.target.closest("[data-i]"); if (li) { e.preventDefault(); choose(HOUSES[+li.dataset.i]); } });
  d.addEventListener("pointerdown", function (e) { if (!e.target.closest(".finder")) open(false); });
  $$(".chips button").forEach(function (b) { b.addEventListener("click", function () { inp.value = b.dataset.q; render(inp.value); open(true); inp.focus(); }); });
  render("");
}

/* ---------- карточка дома и схема в hero ---------- */
var card = $("#card"), heroFig = $("#hero-house");
function drawHero(h) {
  var p = h && h.p || {}, r = house({ e: p.e, f: p.f, label: h ? "Схема дома: " + h.a : "Схема многоквартирного дома" });
  heroFig.innerHTML = r.svg;
  d.dispatchEvent(new CustomEvent("sd:drawn", { detail: heroFig.firstChild }));
}
onPick(function (h) {
  var p = h.p, url = h.id ? SITE + "/" + h.id : SITE, rows = "";
  if (p) {
    rows = [[p.yl || "Год постройки", p.y], ["Этажей", p.f], ["Подъездов", p.e], ["Квартир", p.kv]].filter(function (r) { return r[1]; })
      .map(function (r) { return "<div><dt>" + r[0] + '</dt><dd class="num">' + r[1] + "</dd></div>"; }).join("");
    rows = '<dl class="facts">' + rows + "</dl>";
  } else rows = '<p class="muted">Паспорт этого дома в&nbsp;макет не&nbsp;перенесён&nbsp;— он&nbsp;есть на&nbsp;странице дома на&nbsp;сайте. Схема ниже условная.</p>';
  card.innerHTML = '<div class="c1"><p class="card-k">Ваш дом</p><h2 class="card-a">' + esc(nb(h.a)) + "</h2>" + rows + "</div>" +
    '<div class="c2"><ul class="card-go">' +
    '<li><a class="ulink" href="' + url + '" target="_blank" rel="noopener">Паспорт и&nbsp;раскрытие по&nbsp;дому</a></li>' +
    '<li><a class="ulink" href="#zones">Кто за&nbsp;что отвечает</a></li>' +
    '<li><a class="ulink" href="#news">Объявления для жителей</a></li></ul>' +
    '<a class="sos" href="tel:+73494927777"><span>Авария в&nbsp;доме&nbsp;— круглосуточно</span><b class="num">92-7777</b></a></div>';
  card.classList.add("is-set");
  drawHero(h);
  var nm = $("#zones-house"); if (nm) nm.textContent = nb(h.a);
});
if (heroFig) drawHero(null);

/* список домов внизу: клик выбирает дом и возвращает к hero */
$$("#houses [data-i]").forEach(function (b) {
  b.addEventListener("click", function () {
    var h = HOUSES[+b.dataset.i]; inp.value = h.a; pick(h);
    var t = $("#top"); if (window.KIT && KIT.lenis) KIT.lenis.scrollTo(t); else t.scrollIntoView({ behavior: "smooth" });
    setTimeout(function () { card.focus({ preventScroll: true }); }, 700);
  });
});

/* ---------- сцена «кто за что отвечает»: ручное переключение (клик, стрелки, касание) ---------- */
var scene = $("#zones"), stage = $("#zstage"), tabs = $$('#zones [role="tab"]'), panels = $$("#zones [role=tabpanel]"), ORDER = ["roof", "entr", "base", "yard"];
var Z = window.SD_zones = { cur: "", pins: null, svg: null, set: null, build: null };
function setZone(z, quiet) {
  if (z === Z.cur) return; Z.cur = z;
  tabs.forEach(function (t) { var on = t.dataset.z === z; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
  panels.forEach(function (p) { p.hidden = p.id !== "zp-" + z; });
  if (Z.svg) { Z.svg.setAttribute("data-active", z); $$("[data-z]", Z.svg).forEach(function (g) { g.classList.toggle("on", g.getAttribute("data-z") === z); }); }
  if (!quiet) d.dispatchEvent(new CustomEvent("sd:zone", { detail: z }));
}
Z.set = setZone;
Z.build = function (h) {
  var p = h && h.p || {}, r = house({ e: p.e, f: p.f, marker: true, label: "Схема дома с зонами ответственности" });
  stage.innerHTML = r.svg; Z.svg = stage.firstChild; Z.pins = r.pins;
  var z = Z.cur || "roof"; Z.cur = ""; setZone(z, true);
  ORDER.forEach(function (k) { var pn = r.pins[k]; Z.svg.querySelector(".mk").insertAdjacentHTML("beforebegin", '<g class="pin" data-pin="' + k + '" transform="translate(' + pn.x + " " + pn.y + ')"><circle r="5"/><circle class="halo" r="11"/></g>'); });
  $$(".pin", Z.svg).forEach(function (g) { g.addEventListener("click", function () { d.dispatchEvent(new CustomEvent("sd:want", { detail: g.dataset.pin })); }); });
  d.dispatchEvent(new CustomEvent("sd:scene", { detail: Z }));
};
if (scene) {
  tabs.forEach(function (t, n) {
    t.addEventListener("click", function () { d.dispatchEvent(new CustomEvent("sd:want", { detail: t.dataset.z })); });
    t.addEventListener("keydown", function (e) {
      var k = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0; if (!k) return;
      e.preventDefault(); var nx = tabs[(n + k + tabs.length) % tabs.length]; nx.focus(); nx.click();
    });
  });
  /* «хочу зону z»: fx.js при закреплённой сцене прокручивает к ней; иначе переключаем сразу */
  d.addEventListener("sd:want", function (e) { if (!Z.scrollTo || !Z.scrollTo(e.detail)) setZone(e.detail); });
  /* свайп по схеме на телефоне */
  var sx = 0; stage.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) < 40) return; var n = ORDER.indexOf(Z.cur) + (dx < 0 ? 1 : -1); if (n >= 0 && n < 4) d.dispatchEvent(new CustomEvent("sd:want", { detail: ORDER[n] })); });
  Z.build(null); setZone("roof", true);
  onPick(function (h) { Z.build(h); });
}

var dl = $("#dl-houses"); if (dl) dl.innerHTML = HOUSES.map(function (h) { return '<option value="' + esc(h.a) + '">'; }).join("");
onPick(function (h) { var f = $('[name="Дом"]'); if (f && !f.value) f.value = h.a; });

/* ---------- версия для слабовидящих (как на нынешнем сайте — вход сохранён) ---------- */
var vi = $("#vi");
function setVi(v) { root.classList.toggle("vi", v); vi.setAttribute("aria-pressed", v); try { localStorage.setItem("sd-vi", v ? "1" : ""); } catch (e) {} if (v && window.KIT && !KIT.still) { var s = $(".kit-bar button"); s && s.click(); } }
if (vi) { vi.addEventListener("click", function () { setVi(!root.classList.contains("vi")); }); try { if (localStorage.getItem("sd-vi")) setVi(true); } catch (e) {} }
})();
