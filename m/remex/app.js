/* Подбор «Техника под местность», карта сервиса, связка с формой. Данные — data.js (цифры из карточек pkfr.ru). */
(function () {
"use strict";
var d = document, D = window.REMEX; if (!D) return;
var $ = function (s, r) { return (r || d).querySelector(s); };
var ICON = {
  snow: '<path d="M15 3v24M4.6 9l20.8 12M4.6 21L25.4 9M11 5l4 3 4-3M11 25l4-3 4 3"/>',
  bog: '<path d="M3 22c3-2 5-2 8 0s5 2 8 0 5-2 8 0M9 21V9M9 13l-3-3M15 21V6M15 11l3-3M21 21v-9"/>',
  tundra: '<path d="M2 23c4-5 7-7 11-7s7 3 15 7M6 18l2-5 2 4M20 15l2-5 2 6"/><circle cx="23" cy="6" r="2"/>',
  water: '<path d="M2 12c3-2 5-2 8 0s5 2 8 0 5-2 8 0M2 18c3-2 5-2 8 0s5 2 8 0 5-2 8 0M2 24c3-2 5-2 8 0s5 2 8 0 5-2 8 0"/>',
  offroad: '<path d="M2 25L13 9l5 7 3-4 7 13zM9 25l3-4 3 4"/>',
  forest: '<path d="M8 4l-5 9h3l-4 7h12l-4-7h3zM8 20v5M22 7l-4 8h3l-4 6h10l-4-6h3zM22 21v4"/>'
};
var state = { t: "snow", k: "all", sel: null };
var chipsT = $("#chips-t"), chipsK = $("#chips-k"), list = $("#list"), num = $("#list-n"), empty = $("#empty");
var win = $("#win-img"), cap = $("#win-cap"), wurl = $("#win-url"), fM = $("#f-machine"), fT = $("#f-terrain");
var byId = {}; D.machines.forEach(function (m) { byId[m.id] = m; });

D.terrains.forEach(function (t) {
  var w = d.createElement("div"); w.className = "chip";
  w.innerHTML = '<input type="radio" name="pt" id="pt-' + t.id + '" value="' + t.id + '"' + (t.id === state.t ? " checked" : "") + '><label for="pt-' + t.id + '" data-cur="Выбрать"><svg viewBox="0 0 30 30" aria-hidden="true">' + ICON[t.id] + '</svg><span><b>' + t.name + '</b><small>' + t.hint + '</small></span></label>';
  chipsT.appendChild(w);
});
D.tasks.forEach(function (k) {
  chipsK.insertAdjacentHTML("beforeend", '<input type="radio" name="pk" id="pk-' + k.id + '" value="' + k.id + '"' + (k.id === state.k ? " checked" : "") + '><label for="pk-' + k.id + '" data-cur="Выбрать">' + k.name + '</label>');
});
D.machines.forEach(function (m) { var o = d.createElement("option"); o.value = m.name; o.textContent = m.name; fM.appendChild(o); });

function plural(n) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? "машина" : a >= 2 && a <= 4 && (b < 12 || b > 14) ? "машины" : "машин"; }
function show(m, user) {
  state.sel = m.id;
  [].forEach.call(list.children, function (li) { li.classList.toggle("is-sel", li.dataset.id === m.id); });
  if (win.dataset.id === m.id) return;
  win.dataset.id = m.id;
  var swap = function () { win.src = "img/" + m.img + ".webp"; win.alt = m.name; win.classList.toggle("light", !!m.light); cap.textContent = m.name; wurl.href = m.url; };
  if (window.gsap && !window.KIT.REDUCED && user !== 0) gsap.timeline().to(win, { opacity: 0, scale: 1.04, duration: .22, ease: "power2.in", onComplete: swap }).to(win, { opacity: 1, scale: 1, duration: .6, ease: "power3.out" });
  else swap();
}
function render() {
  var tName = D.terrains.filter(function (t) { return t.id === state.t; })[0].name;
  var res = D.machines.filter(function (m) { return m.t.indexOf(state.t) > -1 && (state.k === "all" || m.k.indexOf(state.k) > -1); });
  var first = list.children.length ? [].map.call(list.children, function (li) { return li.getBoundingClientRect().top; }) : [];
  list.textContent = "";
  res.forEach(function (m, i) {
    var li = d.createElement("li"); li.className = "mc"; li.dataset.id = m.id;
    li.innerHTML = '<div class="mc-pic"><img src="img/' + m.img + '.webp" alt=""' + (m.light ? ' class="light"' : "") + ' loading="lazy" width="96" height="76"></div>' +
      '<h3><button type="button" aria-label="Показать фото: ' + m.name + '">' + m.name + '</button>' + (m.own ? '<span class="mc-own">своё производство</span>' : "") + '</h3>' +
      '<dl>' + m.f.map(function (f) { return '<div><dt>' + f[1] + '</dt><dd class="num">' + f[0] + '</dd></div>'; }).join("") + '</dl>' +
      '<p class="mc-note">' + m.note + '</p>' +
      '<div class="mc-act"><a class="btn btn--main" href="#contacts" data-ask="' + m.id + '" data-cur="Запросить"><span class="btn-t" data-t="Запросить цену">Запросить цену</span></a><a class="link" href="' + m.url + '" data-cur="Открыть">Карточка на pkfr.ru</a></div>';
    list.appendChild(li);
  });
  num.textContent = tName + (state.k === "all" ? "" : " · " + D.tasks.filter(function (k) { return k.id === state.k; })[0].name.toLowerCase()) + ": " + res.length + " " + plural(res.length) + " в каталоге";
  empty.hidden = res.length > 0; list.hidden = !res.length;
  if (res.length) show(res.filter(function (m) { return m.id === state.sel; })[0] || res[0]);
  d.dispatchEvent(new CustomEvent("rx:list", { detail: { first: first } }));
}
chipsT.addEventListener("change", function (e) { state.t = e.target.value; render(); });
chipsK.addEventListener("change", function (e) { state.k = e.target.value; render(); });
list.addEventListener("click", function (e) {
  var b = e.target.closest("h3 button"); if (b) { show(byId[b.closest(".mc").dataset.id], 1); return; }
  var a = e.target.closest("[data-ask]"); if (!a) return;
  var m = byId[a.dataset.ask]; fM.value = m.name;
  fT.value = D.terrains.filter(function (t) { return t.id === state.t; })[0].name.toLowerCase();
});
render();

/* карта сервиса: проекция по реальным координатам городов */
var C = [["Сургут", 73.40, 61.25, 1], ["Нижневартовск", 76.57, 60.94], ["Ханты-Мансийск", 69.02, 61.00], ["Новый Уренгой", 76.68, 66.08], ["Томск", 84.95, 56.49], ["Тюмень", 65.53, 57.15], ["Новосибирск", 82.92, 55.03]];
var svg = $(".map svg"); if (!svg) return;
var NS = "http://www.w3.org/2000/svg", lon0 = 63, lon1 = 88, lat0 = 54, lat1 = 67.4;
var K = Math.cos(61 * Math.PI / 180), S = 580 / ((lon1 - lon0) * K);
function P(lon, lat) { return [30 + (lon - lon0) * K * S, 20 + (lat1 - lat) * S]; }
function el(n, a, p) { var e = d.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; }
var g = $(".map-grid", svg), ln = $(".map-lines", svg), pts = $(".map-pts", svg);
for (var lo = 65; lo <= 85; lo += 5) { var a = P(lo, lat1), b = P(lo, lat0); el("path", { d: "M" + a[0] + " " + a[1] + "L" + b[0] + " " + b[1] }, g); }
for (var la = 55; la <= 66; la += 2.5) { var c1 = P(lon0, la), c2 = P(lon1, la); el("path", { d: "M" + c1[0] + " " + c1[1] + "L" + c2[0] + " " + c2[1] }, g); }
var hub = P(C[0][1], C[0][2]);
C.forEach(function (c, i) {
  var p = P(c[1], c[2]);
  if (i) el("path", { d: "M" + hub[0] + " " + hub[1] + "Q" + ((hub[0] + p[0]) / 2 + 18) + " " + ((hub[1] + p[1]) / 2 - 22) + " " + p[0] + " " + p[1] }, ln);
  var gg = el("g", { class: i ? "pt" : "pt hub", tabindex: "0", "aria-label": c[0] + (i ? "" : ", главная база") }, pts);
  if (!i) el("circle", { class: "halo", cx: p[0], cy: p[1], r: 16 }, gg);
  el("circle", { cx: p[0], cy: p[1], r: i ? 6 : 9 }, gg);
  var right = c[0] === "Ханты-Мансийск" || c[0] === "Тюмень" || c[0] === "Томск", t = el("text", { x: p[0] + (right ? -12 : 12), y: p[1] + (c[0] === "Нижневартовск" ? 20 : -10), "text-anchor": right ? "end" : "start" }, gg);
  t.textContent = c[0];
});
})();
