/* ЮВиС: цепочка «от намыва до покрытия» и каталог с запросом на поставку. Позиции — со страниц каталога skuvis.ru. */
(function () {
  "use strict";
  var d = document, K = window.KIT || {};
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  function el(tag, cls, text) { var e = d.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function go(target, offset) {
    if (K.lenis) K.lenis.scrollTo(target, { offset: offset || 0 });
    else window.scrollTo({ top: typeof target === "number" ? target : target.getBoundingClientRect().top + scrollY + (offset || 0), behavior: K.REDUCED ? "auto" : "smooth" });
  }

  /* Chrome не начинает lazy-загрузку фото, обрезанного clip-path: будим заранее, пока блок только подъезжает */
  $$("[data-img], .chain").forEach(function (box) {
    new IntersectionObserver(function (es, io) {
      if (!es[0].isIntersecting) return; io.disconnect(); $$("img", box).forEach(function (i) { i.loading = "eager"; });
    }, { rootMargin: "1200px 0px" }).observe(box);
  });

  /* ---------- цепочка ---------- */
  var chain = $("#chain"), steps = $$(".step", chain), dots = $$(".rail button", chain), chips = $$(".mix li", chain);
  var note = $("#mix-s"), mix = $(".mix", chain), cur = -1;
  /* закрепляем только там, где сцена целиком помещается в экран; иначе — обычный список звеньев */
  var mq = matchMedia("(min-width:1000px) and (min-height:640px) and (prefers-reduced-motion:no-preference)");
  function show(i) {
    if (i === cur) return; cur = i;
    steps.forEach(function (s, n) { s.classList.toggle("on", n === i); s.classList.toggle("past", n < i); });
    dots.forEach(function (b, n) { b.classList.toggle("past", n < i); if (n === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    var m = +steps[i].dataset.mix;
    chips.forEach(function (c, n) { c.classList.toggle("on", n < m); });
    mix.classList.toggle("ready", m > 4);
    note.textContent = steps[i].dataset.note;
    chain.style.setProperty("--p", i / (steps.length - 1));
  }
  function span() { return chain.offsetHeight - innerHeight; }
  function onScroll() {
    if (!chain.classList.contains("pinned")) return;
    var p = Math.min(.999, Math.max(0, -chain.getBoundingClientRect().top / span()));
    show(Math.floor(p * steps.length));
  }
  function mode() { chain.classList.toggle("pinned", mq.matches); cur = -1; show(0); onScroll(); }
  mq.addEventListener("change", mode);
  addEventListener("scroll", onScroll, { passive: true });
  dots.forEach(function (b, i) {
    b.addEventListener("click", function () { go(chain.getBoundingClientRect().top + scrollY + span() * (i + .5) / steps.length); });
  });
  mode();

  /* ---------- каталог ---------- */
  var CAT = [
    { id: "inert", name: "Щебень и песок", img: "k-stone", alt: "Щебень крупным планом", where: "Дробильно-сортировочные комплексы: Солнечный (Сургут), Нягань, Ханты-Мансийск, Белоярский, Лабытнанги.", items: ["Щебень", "Песок"] },
    { id: "asphalt", name: "Асфальт и эмульсия", img: "k-asphalt", alt: "Свежеуложенная асфальтобетонная смесь", where: "Заводы Ammann: Сургут, Ханты-Мансийск, Нягань, Урай. Эмульсия: Сургут, Нягань, Ханты-Мансийск.", items: [
      "Смесь А 8 ВЛ на БНД 100/130", "Смесь А 16 ВН на ПБВ-130", "Смесь А 16 НН на БНД 100/130", "Смесь А 22 НН на ПБВ-130", "Смесь А 32 НН на ПБВ-130",
      "ЩМА-16 на ПБВ-130", "ЩМА-20 на БНД 100/130", "ЩМА-20 на ПБВ-130", "Чёрный щебень на БНД 100/130",
      "Горячая плотная мелкозернистая, тип А, марка I", "Горячая плотная мелкозернистая, тип Б, марка I, на БНД 100/130", "Горячая плотная мелкозернистая, тип В, марка II, на БНД 100/130",
      "Горячая пористая мелкозернистая, марка I, на БНД 100/130", "Горячая пористая крупнозернистая, марка I, на БНД 100/130", "Горячая высокопористая щебёночная крупнозернистая, марка I", "Эмульсия битумная катионная"] },
    { id: "concrete", name: "Бетон и растворы", img: "c4-mix", alt: "Бетонный завод MEKA", where: "Бетонный завод MEKA в Сургуте (Солнечный), до 100 м³ в час.", items: [
      "Бетон В3,5 П2 М50", "Бетон В10 П4 М150", "Бетон В12,5 П3 М150", "Бетон В15 П2 М200", "Бетон В15 П4 М200", "Бетон В20 П3 М300", "Бетон В20 П4 М250", "Бетон В22,5 П3 М300", "Бетон В22,5 П4 М300",
      "Бетон В25 П4 М350", "Бетон В25 П5 М350", "Бетон В30 П3 М400", "Бетон В30 П4 М400", "Бетон В30 П5 М400", "Бетон В40 П5 М500",
      "Раствор М50", "Раствор М75", "Раствор М100", "Раствор М150", "Раствор М200"] },
    { id: "tile", name: "Тротуарная плитка", img: "k-tile", alt: "Мощение тротуарной плиткой", where: "Вибропрессование HESS, Сургут. Для «Старого города», «Австрийского камня» и «Квадрата»: ГОСТ 17608-2017, F200, W4, на поддоне 13,44 м².", items: [
      "«Кирпич» серый 100×200×80", "«Кирпич» с пигментом 100×200×80", "«Кирпич» с пигментом на белом цементе 100×200×80", "«Старый город», серый", "«Австрийский камень»", "«Квадрат» 200×200×60"] },
    { id: "curb", name: "Бордюрный камень", img: "k-curb", alt: "Бетонный бортовой камень", where: "ГОСТ 6665-91, F200, W4. Дорожный: 95 кг, 13 шт на поддоне. Тротуарный: 35 кг, 36 шт на поддоне.", items: [
      "Бордюр дорожный серый 100×30×15", "Бордюр тротуарный 100×20×8"] },
    { id: "wood", name: "Пиломатериалы", where: "Доска обрезная, размеры в миллиметрах.", items: [
      "Доска 25×100×5000", "Доска 25×100×6000", "Доска 25×150×4000", "Доска 25×150×5000", "Доска 25×150×6000", "Доска 25×200×6000", "Доска 50×150×4000", "Доска 50×150×5000", "Доска 50×150×6000"] }
  ];

  var tabs = $(".tabs"), panels = $("#panels"), list = $("#picked"), empty = $("#empty"), count = $("#count"), mbar = $("#mbar-req");
  var picked = new Map(), rowBtns = {};

  function sync() {
    var n = picked.size;
    count.textContent = n; empty.hidden = n > 0;
    mbar.textContent = n ? "Запрос: позиций " + n : "Запрос на поставку";
    Object.keys(rowBtns).forEach(function (k) { rowBtns[k].setAttribute("aria-pressed", picked.has(k)); });
  }
  function add(name) {
    if (picked.has(name)) return;
    var li = el("li"), lab = el("label"), inp = el("input"), x = el("button", "x", "×");
    lab.append(el("span", "", name), inp);
    inp.name = name; inp.placeholder = "Объём"; inp.value = ""; inp.dataset.item = "1";
    x.type = "button"; x.setAttribute("aria-label", "Убрать: " + name);
    x.onclick = function () { drop(name); (rowBtns[name] || mbar).focus({ preventScroll: true }); };
    li.append(lab, x); list.append(li); picked.set(name, li); sync();
  }
  function drop(name) { var li = picked.get(name); if (!li) return; li.remove(); picked.delete(name); sync(); }

  function openTab(id, focus) {
    $$("[role=tab]", tabs).forEach(function (t) { var on = t.dataset.id === id; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    $$("[role=tabpanel]", panels).forEach(function (p) { p.hidden = p.id !== "p-" + id; });
  }

  CAT.forEach(function (c) {
    var t = el("button", "", c.name); t.type = "button"; t.id = "t-" + c.id; t.dataset.id = c.id;
    t.setAttribute("role", "tab"); t.setAttribute("aria-controls", "p-" + c.id); t.onclick = function () { openTab(c.id); };
    tabs.append(t);
    var p = el("div", "panel"); p.id = "p-" + c.id; p.setAttribute("role", "tabpanel"); p.setAttribute("aria-labelledby", t.id);
    var head = el("div", "p-head" + (c.img ? "" : " noimg"));
    if (c.img) { var im = el("img"); im.src = "img/" + c.img + ".webp"; im.alt = c.alt; im.loading = "lazy"; head.append(im); }
    head.append(el("p", "", c.where));
    var ul = el("ul", c.items.length > 6 ? "rows dense" : "rows");
    c.items.forEach(function (name) {
      var li = el("li"), b = el("button"); b.type = "button"; var ic = el("i"); ic.setAttribute("aria-hidden", "true"); b.append(el("span", "", name), ic);
      b.onclick = function () { if (picked.has(name)) drop(name); else add(name); };
      rowBtns[name] = b; li.append(b); ul.append(li);
    });
    p.append(head, ul); panels.append(p);
  });
  tabs.addEventListener("keydown", function (e) {
    var k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!k) return;
    e.preventDefault();
    var i = CAT.findIndex(function (c) { return c.id === d.activeElement.dataset.id; });
    openTab(CAT[(i + k + CAT.length) % CAT.length].id, true);
  });
  openTab("inert"); sync();

  /* кнопки сцены: открыть раздел каталога и положить позицию в запрос. Capture — раньше общего перехода по якорям */
  d.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-tab]"); if (!a) return;
    openTab(a.dataset.tab); if (a.dataset.add) add(a.dataset.add);
  }, true);

  /* kit не показывает пустые поля: позиция без объёма не должна пропасть из запроса. Capture — раньше обработчика kit */
  d.addEventListener("submit", function () { $$("input[data-item]", list).forEach(function (i) { if (!i.value.trim()) i.value = "объём уточнить"; }); }, true);

  var how = $$("input[name='Получение']"), where = $("#where");
  how.forEach(function (r) { r.addEventListener("change", function () { var pick = how[1].checked; where.hidden = pick; $("input", where).disabled = pick; }); });

  /* самопроверка: названия позиций уникальны, иначе кнопки и поля запроса перепутаются */
  var all = CAT.reduce(function (a, c) { return a.concat(c.items); }, []);
  console.assert(new Set(all).size === all.length, "каталог: повтор названия позиции");
  console.assert(steps.length === dots.length, "цепочка: число звеньев и кнопок не совпало");
})();
