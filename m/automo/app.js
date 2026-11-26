/* Подбор под задачу, витрина марок, подстановка модели в заявку. Движение — в fx.js. */
(function () {
"use strict";
var d = document, $ = function (s) { return d.querySelector(s); };
var T = window.AM_TASKS, M = window.AM_MODELS, B = window.AM_BRANDS, SITE = "https://auto-mo.ru";
var ICON = {
  city: '<path d="M4 27V12h19l8 7v8z"/><path d="M23 12v7h8"/><circle cx="11" cy="28" r="3"/><circle cx="26" cy="28" r="3"/>',
  cold: '<path d="M20 5v30M7 12.5l26 15M7 27.5l26-15M16 7l4 4 4-4M16 33l4-4 4 4"/>',
  long: '<path d="M3 26V10h22v16M25 15h6l6 6v5H25"/><path d="M9 10v16M15 10v16M20 10v16"/><circle cx="10" cy="29" r="3"/><circle cx="30" cy="29" r="3"/>',
  build: '<path d="M4 24l3-12h17l-3 12z"/><path d="M24 17h6l5 5v4H4"/><circle cx="10" cy="29" r="3"/><circle cx="29" cy="29" r="3"/>',
  crane: '<path d="M4 26h32v-6H4zM28 20V12l-14-6M14 6v9"/><circle cx="10" cy="29" r="3"/><circle cx="30" cy="29" r="3"/>',
  tract: '<path d="M14 25V10h9l7 7v8M14 25H4"/><path d="M23 10v7h7"/><circle cx="12" cy="28" r="3"/><circle cx="27" cy="28" r="3"/>',
  util: '<path d="M10 13h20l-2 21H12zM7 13h26M16 9h8M17 18v11M23 18v11"/>'
};
var st = { task: "city", mass: "all" };
function cls(g) { return g == null ? "" : g <= 3500 ? "a" : g <= 12000 ? "b" : g <= 20000 ? "c" : "d"; }
function list(task) { return M.filter(function (m) { return m.task === task && (st.mass === "all" || cls(m.gvw) === st.mass); }); }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

/* задачи */
var tasksEl = $("#tasks"), cards = $("#cards"), count = $("#res-count");
tasksEl.innerHTML = T.map(function (t, i) {
  return '<button type="button" role="tab" class="task" id="t-' + t.k + '" data-k="' + t.k + '" data-i="' + i + '" aria-selected="false" aria-controls="cards" tabindex="-1"><svg viewBox="0 0 40 40" aria-hidden="true">' + ICON[t.k] + '</svg><b>' + t.t + '</b><small>' + t.s + '</small><span class="cnt" aria-hidden="true"></span></button>';
}).join("");
var tabs = [].slice.call(tasksEl.children);

function counts() { tabs.forEach(function (b) { b.querySelector(".cnt").textContent = list(b.dataset.k).length || "—"; }); }
function render() {
  var t = T.filter(function (x) { return x.k === st.task; })[0], L = list(st.task);
  tabs.forEach(function (b) { var on = b.dataset.k === st.task; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
  cards.setAttribute("aria-labelledby", "t-" + st.task);
  count.innerHTML = L.length ? "<b>" + t.t + "</b> · " + L.length + " " + word(L.length) + " в каталоге" : "<b>" + t.t + "</b> · в этом классе массы моделей на сайте нет";
  cards.innerHTML = L.length ? L.map(function (m) {
    return '<li class="card"><figure><img src="img/cars/' + m.id + '.webp" alt="' + esc(m.n) + '" loading="lazy"' + (m.id === 53 ? ' class="cut"' : "") + '><span class="bb">' + B[m.b] + '</span></figure>' +
      '<div class="card-b"><h3><a href="' + SITE + m.u + '" target="_blank" rel="noopener">' + esc(m.n) + '</a></h3><ul>' + m.f.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + '</ul>' +
      '<div class="go"><button type="button" data-req="Запросить цену" data-model="' + esc(m.n) + '">Запросить цену</button><button type="button" data-req="Трейд-ин" data-model="' + esc(m.n) + '">Трейд-ин</button><button type="button" data-req="Лизинг" data-model="' + esc(m.n) + '">Лизинг</button></div></div></li>';
  }).join("") : '<li class="empty"><p>Под&nbsp;эту задачу в&nbsp;выбранном классе массы карточек нет&nbsp;— менеджер подберёт машину или надстройку на&nbsp;шасси.</p><button type="button" class="btn" data-req="Запросить цену" data-model="' + esc(t.t) + '">Оставить заявку</button></li>';
  cards.scrollLeft = 0;
  d.dispatchEvent(new CustomEvent("am:cards"));
}
function word(n) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? "модель" : a >= 2 && a <= 4 && (b < 12 || b > 14) ? "модели" : "моделей"; }
function setTask(k, fromScroll) { if (k === st.task) return; st.task = k; render(); if (!fromScroll) d.dispatchEvent(new CustomEvent("am:task", { detail: k })); }
window.AM = { setTask: setTask, keys: T.map(function (t) { return t.k; }), scrollTo: null };

tasksEl.addEventListener("click", function (e) {
  var b = e.target.closest(".task"); if (!b) return;
  if (window.AM.scrollTo && window.AM.scrollTo(+b.dataset.i)) return;
  setTask(b.dataset.k);
});
tasksEl.addEventListener("keydown", function (e) {
  var i = tabs.indexOf(d.activeElement); if (i < 0) return;
  var n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : -2;
  if (n === -2) return; e.preventDefault(); n = (n + tabs.length) % tabs.length; tabs[n].focus(); tabs[n].click();
});
[].slice.call(d.querySelectorAll(".seg button")).forEach(function (b, _, all) {
  b.addEventListener("click", function () { all.forEach(function (x) { x.setAttribute("aria-checked", x === b); }); st.mass = b.dataset.m; counts(); render(); });
});
d.querySelectorAll(".rn").forEach(function (b) { b.addEventListener("click", function () { cards.scrollBy({ left: +b.dataset.d * (cards.clientWidth * .8), behavior: "smooth" }); }); });
counts(); st.task = ""; setTask("city", true);

/* заявка: подстановка модели и типа */
var fType = $("#f-type"), fModel = $("#f-model"), fNote = $("#f-note"), fNoteL = $("#f-note-l");
var NOTE = { "Трейд-ин": ["Ваш автомобиль", "Марка, год выпуска, пробег"], "Запись на сервис": ["Машина и работы", "Марка, модель, какие работы нужны, удобная дата"], "Запчасти": ["Что нужно", "VIN или название детали"], "Лизинг": ["Комментарий", "Сколько машин, аванс, срок"] };
function note() { var n = NOTE[fType.value] || ["Комментарий", "Сколько машин, к какому сроку, нужна ли надстройка"]; fNoteL.textContent = n[0]; fNote.placeholder = n[1]; }
fType.addEventListener("change", note);
function go(type, model) {
  if (type) fType.value = type; note();
  if (model) { fModel.value = model; fModel.classList.remove("flash"); void fModel.offsetWidth; fModel.classList.add("flash"); }
  var f = $("#request");
  if (window.KIT && KIT.lenis) KIT.lenis.scrollTo(f, { offset: -90, duration: 1.4 }); else f.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth", block: "start" });
  setTimeout(function () { (model ? f.querySelector('[name="Имя"]') : fType).focus({ preventScroll: true }); }, 900);
}
d.addEventListener("click", function (e) {
  var r = e.target.closest("[data-req]"); if (r) { e.preventDefault(); go(r.dataset.req, r.dataset.model); return; }
  var a = e.target.closest("a[data-type]"); if (a && a.hash === "#request") { e.preventDefault(); go(a.dataset.type, ""); }
  else if (a) { fType.value = a.dataset.type; note(); }
});

/* витрина марок */
var BR = [
  { k: "foton", img: "cars/20.webp", alt: "Foton D18 шторно-бортовой", d: "Продукция одного из крупнейших автоконцернов КНР: доступная цена в сочетании с широким функционалом.", s: ["Лёгкая гамма", "Средняя гамма", "Тяжёлая гамма", "Фургоны"], u: "/catalog/foton/" },
  { k: "jac", img: "cars/37.webp", alt: "JAC N120 шторно-бортовой", d: "Технологичный и доступный транспорт с хорошей ремонтопригодностью всех узлов.", s: ["Среднетоннажная серия", "Тяжёлая серия"], u: "/catalog/jac/" },
  { k: "dongfeng", img: "cars/48.webp", alt: "DongFeng C120 с краном-манипулятором", d: "Один из главных брендов на рынке Китая, компания основана в 1969 году.", s: ["Малотоннажная серия", "Среднетоннажная серия", "Тяжёлая серия"], u: "/catalog/avtomobili-dongfeng/" },
  { k: "ambertruck", img: "cars/67.webp", alt: "Ambertruck SM500 шторно-бортовой", d: "Новая марка грузовых автомобилей от «Автотора».", s: ["JM", "SM", "JL", "EV — электрические"], u: "/catalog/ambertruck/" },
  { k: "daewoo", img: "d04.webp", alt: "Daewoo Novus с краном-манипулятором", d: "Семейство универсальных грузовиков Novus южнокорейского производства. «Авто-М» — официальный дилер Daewoo Trucks с 1 марта 2021 года.", s: ["Шасси 4×2, 6×4, 8×4", "Самосвалы", "Краны-манипуляторы", "Бетонная техника", "Автовышки"], u: "/catalog/Daewoo/" },
  { k: "forland", img: "cars/98.webp", alt: "Forland 8 шторно-бортовой", d: "Дочерний бренд Beiqi Foton Motor, основан в 1999 году.", s: ["Forland 3", "Forland 8", "Forland 12"], u: "/catalog/forland/" }
];
var bt = $("#btabs"), bimg = $("#b-img");
bt.innerHTML = BR.map(function (b, i) { return '<button type="button" role="tab" id="bt-' + b.k + '" aria-controls="bstage" aria-selected="' + (i === 0) + '" tabindex="' + (i ? -1 : 0) + '" data-i="' + i + '">' + B[b.k] + "</button>"; }).join("");
$("#bstage").setAttribute("role", "tabpanel");
var btns = [].slice.call(bt.children), bi = -1;
function fillBrand(b) {
  $("#b-name").textContent = B[b.k]; $("#b-desc").textContent = b.d;
  $("#b-series").innerHTML = b.s.map(function (x) { return "<li>" + x + "</li>"; }).join("");
  var l = $("#b-link"); l.href = SITE + b.u; l.innerHTML = "Все модели " + B[b.k] + " на&nbsp;auto-mo.ru";
  bimg.src = "img/" + b.img; bimg.alt = b.alt;
  $("#bstage").setAttribute("aria-labelledby", "bt-" + b.k);
}
function brand(i) {
  if (i === bi) return; var b = BR[i], first = bi < 0, dir = i > bi ? 1 : -1; bi = i;
  btns.forEach(function (x, j) { x.setAttribute("aria-selected", j === i); x.tabIndex = j === i ? 0 : -1; });
  var G = window.gsap, calm = matchMedia("(prefers-reduced-motion:reduce)").matches;
  if (first || !G || calm) { fillBrand(b); return; }
  var parts = d.querySelectorAll("#bstage .binfo > *");
  G.timeline({ defaults: { ease: "power3.inOut" } })
    .to(bimg, { xPercent: -14 * dir, opacity: 0, duration: .35 })
    .to(parts, { y: -10, opacity: 0, duration: .25, stagger: .03 }, 0)
    .add(function () { fillBrand(b); })
    .fromTo(bimg, { xPercent: 14 * dir, opacity: 0, scale: 1.04 }, { xPercent: 0, opacity: 1, scale: 1, duration: .7, ease: "power3.out" })
    .fromTo(parts, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .05, ease: "power3.out" }, "<.1");
}
bt.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) brand(+b.dataset.i); });
bt.addEventListener("keydown", function (e) {
  var i = btns.indexOf(d.activeElement); if (i < 0) return;
  var n = /Right|Down/.test(e.key) ? i + 1 : /Left|Up/.test(e.key) ? i - 1 : null; if (n == null) return;
  e.preventDefault(); n = (n + btns.length) % btns.length; btns[n].focus(); brand(n);
});
brand(0);
})();
