(function () {
  "use strict";
  var d = document, $ = function (s) { return d.querySelector(s); }, T = YL.T;
  var bill = $("#bill"), ctl = $("#wayctl"), dir = "ms";
  var FLAGS = ["warm", "fragile", "oversize"], NAMES = { warm: "тёплый", fragile: "хрупкий", oversize: "негабарит" };
  var fmt = function (n) { return n.toLocaleString("ru-RU"); };
  var rub = function (n) { return fmt(n) + " ₽"; };
  var dec = function (n) { return String(n).replace(".", ","); };
  var num = function (s) { s = String(s).replace(/\s/g, "").replace(",", "."); return s === "" ? 0 : Number(s); };
  var el = function (tag, cls, text) { var e = d.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
  var put = function (node, text) { if (node.textContent !== text) node.textContent = text; };

  /* таблицы прайса из того же объекта, что и расчёт */
  function row(body, cells) {
    var tr = el("tr");
    cells.forEach(function (c, i) { var td = el(i ? "td" : "th", "", c[1]); if (!i) td.scope = "row"; td.dataset.k = c[0]; tr.appendChild(td); });
    body.appendChild(tr);
  }
  Object.keys(T.routes).forEach(function (k) {
    var r = T.routes[k];
    row($("#t-routes"), [["", r.name + (r.note ? " (" + r.note + ")" : "")], ["Срок, суток", r.days], ["Минимум, ₽", fmt(r.min)], ["1 м³, ₽", fmt(r.m3)], ["1 кг, ₽", fmt(r.kg)]]);
  });
  [["0–49", "0–0,49"], ["50–99", "0,5–0,99"], ["100–299", "1–2,99"], ["300–699", "3–6,99"], ["700–999", "7–9,99"], ["1000–1999", "10–19,99"], ["2000–3499", "20–35,99"], ["3500–5000", "35–50"]].forEach(function (s, i) {
    row($("#t-exp"), [["", s[0] + " кг"], ["Объём, м³", s[1]], ["Москва", fmt(T.exp.msk[i])], ["Лабытнанги", fmt(T.exp.ynao[i])]]);
  });

  /* накладная */
  function read() {
    var f = bill.elements, o = { route: f.route.value, kg: num(f.kg.value), m3: num(f.m3.value) };
    FLAGS.concat("pickup", "delivery").forEach(function (k) { o[k] = f[k].checked && !f[k].disabled; });
    return o;
  }
  function lockExp() {
    var r = T.routes[bill.elements.route.value];
    [["pickup", r.from, "Забрать с адреса", "Забор уже в тарифе"], ["delivery", r.to, "Довезти до адреса", "Доставка уже в тарифе"]].forEach(function (s) {
      bill.elements[s[0]].disabled = s[1] === "incl";
      put($("#l-" + s[0]), s[1] === "incl" ? s[3] : s[2]);
    });
  }
  function flagNames(o) { return FLAGS.filter(function (k) { return o[k]; }).map(function (k) { return NAMES[k]; }).join(", "); }
  function render() {
    lockExp();
    var o = read(), res = YL.calc(o), list = $("#lines"), price = "", short;
    var size = [o.kg > 0 ? fmt(o.kg) + " кг" : "", o.m3 > 0 ? dec(o.m3) + " м³" : ""].filter(Boolean).join(", ");
    list.textContent = "";
    ["kg", "m3"].forEach(function (k) { var v = num(bill.elements[k].value); bill.elements[k].setAttribute("aria-invalid", String(!(v >= 0 && isFinite(v)))); });
    if (!res) {
      put($("#sum"), "—"); put($("#days"), "Укажите вес или объём числом больше нуля"); put($("#warn"), "");
      short = T.routes[o.route].name + ", вес и объём не указаны";
    } else {
      price = res.lo === res.hi ? rub(res.lo) : fmt(res.lo) + "–" + rub(res.hi);
      if (res.open) price = "от " + price;
      put($("#sum"), price);
      put($("#days"), "Срок по прайсу: " + res.route.days + " суток");
      var add = function (a, b) { var li = el("li"); li.appendChild(el("span", "", a)); li.appendChild(el("b", "", b)); list.appendChild(li); };
      add(res.by === "min" ? "Минимальная стоимость" : res.by === "kg" ? fmt(o.kg) + " кг × " + res.route.kg + " ₽" : dec(o.m3) + " м³ × " + fmt(res.route.m3) + " ₽", rub(res.base));
      if (res.n) add("Надбавка: " + flagNames(o), res.n === 1 ? "+20 %" : res.n + " × 20 %");
      res.exp.forEach(function (e) { add(e.label, e.sum === null ? "по согласованию" : rub(e.sum)); });
      var w = [];
      if (res.partial) w.push("Заполнено только одно из двух: сумма может вырасти, когда измерят " + (o.kg ? "объём" : "вес") + ".");
      if (res.n > 1) w.push("Прайс не уточняет, складываются надбавки или перемножаются, поэтому показана вилка.");
      if (res.exp.some(function (e) { return e.zone === "msk"; })) w.push("За МКАД +50 ₽/км в обе стороны.");
      if (res.exp.some(function (e) { return e.zone === "ynao"; })) w.push("За городом Лабытнанги +50 ₽/км в обе стороны.");
      if (o.route === "ms" || o.route === "sm") w.push("Строка «Организация переправы» в сумму не включена.");
      w.push("Итоговую стоимость подтверждает терминал.");
      put($("#warn"), w.join(" "));
      short = res.route.name + ", " + size + (res.n ? ", " + flagNames(o) : "") + res.exp.map(function (e) { return ", " + e.label.charAt(0).toLowerCase() + e.label.slice(1); }).join("");
    }
    var aks = dir === "ma";
    put($("#side-r"), aks ? "Москва — Аксарка" : T.routes[dir].name);
    put($("#side-s"), aks ? "Строки в прайсе нет: стоимость по согласованию" : price ? "Ориентир " + price : "Укажите вес или объём в накладной");
    var full = aks ? "Москва — Аксарка" + (size ? ", " + size : "") + (flagNames(o) ? ", " + flagNames(o) : "") + ". Стоимость по согласованию."
      : short + (price ? ". Ориентир " + price + " (тариф с " + T.since + ")." : ".");
    put($("#carbon"), full); $("#f-calc").value = full;
    put($("#cargo-t"), size.split(", ")[0]);
  }

  /* станции: только то, что есть на сайте компании; od — что происходит, you — что нужно от вас */
  function stations(k, c) {
    var back = k === "lm" || k === "sm";
    var apply = "Заявка: наименование, общий вес и объём, упаковка, количество мест, максимальная длина, отправитель, получатель и плательщик.";
    var marks = [];
    if (c.warm) marks.push("Тёплый груз: отметьте «соблюдение температурного режима», надбавка +20 %. Приём таких грузов объявлен с 1 октября (объявление от 28.09.2026).");
    if (c.fragile) marks.push("Хрупкий груз: надбавка +20 %. Отметьте в заявке «не кантовать».");
    if (c.oversize) marks.push("Негабарит (место от 100 кг или сумма сторон от 3 м): надбавка +20 %. Укажите максимальную длину.");
    var HOURS = "Будни 10:00–18:00, выходные 10:00–16:00.";
    var MSK = { tel: ["+79032188182", "8 (903) 218-81-82"] }, LAB = { tel: ["+79222887171", "8 (922) 288-71-71"] };
    var STORE = "Хранение свыше 3 дней в пункте назначения платное: 5 ₽/кг — 500 ₽/м³.";
    var mskIn = {
      name: "Москва", tag: "приём груза", stamp: "принят", tel: MSK.tel,
      od: ["Приём и погрузка: 1-я Мытищинская, д. 28, стр. 6, тупик слева от здания. " + HOURS, "Компания отвечает за груз, принятый по факту и оформленный на терминале."],
      you: [apply].concat(marks, "Привезите груз и скажите на охране, что приехали в ТК «ЯмалЛогистик», или закажите автозабор.")
    };
    var wagon = {
      name: "Тёплый вагон", tag: "в пути", stamp: "в пути",
      od: back ? ["Груз идёт почтово-багажным тёплым вагоном." + (k === "lm" ? " По прайсу в пути 2 суток." : "")]
        : ["Груз идёт почтово-багажным тёплым вагоном. Из Москвы вагоны выходят 3–4 раза в неделю (через день), в пути 2 суток.", "Выход вагонов — по расписанию РЖД (объявление от 13.12.2021)."],
      you: [k === "ma" ? "Срок до Аксарки в прайсе не указан: уточните в терминале." : "Планируйте по полному сроку из прайса, а не по дороге: " + T.routes[k].days + " суток."]
    };
    if (c.warm) wagon.you.push("Скажите в терминале при сдаче, что грузу нужна плюсовая температура.");
    var lab;
    if (k === "lm") lab = { name: "Лабытнанги", tag: "приём груза", stamp: "принят", tel: LAB.tel, od: ["Терминал: промзона, территория «Стройдвора». " + HOURS], you: [apply].concat(marks, "Сдайте груз на терминале или закажите забор по городу.") };
    else if (k === "sm") lab = { name: "Лабытнанги", tag: "перевалка", stamp: "прибыл", tel: LAB.tel, od: ["Терминал: промзона, территория «Стройдвора». Отсюда груз уходит вагоном в Москву."], you: ["Отдельных действий на сайте не названо. Где сейчас груз, спрашивайте в терминале."] };
    else if (k === "ml") lab = { name: "Лабытнанги", tag: "получение", stamp: "доставлен", tel: LAB.tel, od: ["Выдача на терминале: промзона, территория «Стройдвора». " + HOURS], you: ["Заберите груз или закажите доставку до двери.", STORE] };
    else lab = { name: "Лабытнанги", tag: "перевалка", stamp: "прибыл", tel: LAB.tel, od: ["Терминал и склад: промзона, территория «Стройдвора».", "В ледостав и распутицу грузы на Салехард и Аксарку собирают здесь на бесплатное хранение до открытия переправы."], you: [k === "ms" ? "Забирать груз здесь не нужно: в тариф входит доставка до адреса в Салехарде. Спросите, переправляют ли уже грузы." : "Спросите в терминале, переправляют ли уже грузы."] };
    var ob = {
      name: "Переправа через Обь", tag: "сезонный участок", water: true, tel: LAB.tel, status: "по объявлению от 24.10.2026",
      od: ["Компания организует доставку через реку. 24.10.2026 объявлено: паромная переправа скоро закроется, в ледостав грузы на Салехард и Аксарку бесплатно хранят в Лабытнанги до открытия ледовой переправы."],
      you: back ? ["Объявление написано о грузах на Салехард и Аксарку. Как забирают груз из Салехарда в межсезонье, уточните до отправки."]
        : ["Позвоните и узнайте, открыта ли ледовая переправа: объявления об открытии на главной странице их сайта не было (сверено 26.11.2026).", "Спросите, как посчитают переправу: в прайсе это отдельная строка."]
    };
    if (k === "ml") return [mskIn, wagon, lab];
    if (k === "lm") return [lab, wagon, { name: "Москва", tag: "получение", stamp: "доставлен", tel: MSK.tel, od: ["Московский терминал: 1-я Мытищинская, д. 28, стр. 6."], you: ["Договоритесь о получении или закажите доставку по Москве (за МКАД +50 ₽/км в обе стороны).", STORE] }];
    if (k === "ms") return [mskIn, wagon, lab, ob, { name: "Салехард", tag: "доставка до адреса", stamp: "доставлен", od: ["Доставка автомобилем до адреса входит в тариф «Москва — Салехард». Срок по прайсу 4–9 суток."], you: ["Укажите адрес доставки и телефон получателя.", STORE] }];
    if (k === "ma") return [mskIn, wagon, lab, ob, { name: "Аксарка", tag: "назначение", od: ["Аксарка названа в объявлениях о переправе. Отдельной строки в прайсе нет."], you: ["До отправки согласуйте с терминалом, возьмут ли груз, стоимость, срок и порядок получения."], tel: LAB.tel }];
    return [{ name: "Салехард", tag: "забор с адреса", stamp: "принят", od: ["Забор груза с адреса входит в тариф «Салехард — Москва». Срок по прайсу 5–9 суток."], you: [apply].concat(marks, "Укажите адрес загрузки и дату."), tel: LAB.tel }, ob, lab, wagon,
      { name: "Москва", tag: "получение", stamp: "доставлен", tel: MSK.tel, od: ["Московский терминал: 1-я Мытищинская, д. 28, стр. 6."], you: ["Договоритесь о получении или закажите доставку по Москве (за МКАД +50 ₽/км в обе стороны).", STORE] }];
  }

  var listEl = $("#stations"), nav = $("#side-nav");
  var live = matchMedia("(min-width:900px) and (prefers-reduced-motion:no-preference)");
  var items = [];

  function build() {
    var c = {}; FLAGS.forEach(function (k) { c[k] = ctl.elements[k].checked; });
    var data = stations(dir, c);
    listEl.textContent = ""; nav.textContent = "";
    data.forEach(function (s, i) {
      var li = el("li", "st" + (s.water ? " st--water" : "")); li.id = "st-" + i;
      var card = el("article", "st-card"), head = el("div", "st-head"), h = el("h3", "", s.name);
      h.tabIndex = -1;
      head.appendChild(el("p", "st-tag mono", "Шаг " + (i + 1) + " из " + data.length + " · " + s.tag)); head.appendChild(h);
      card.appendChild(head);
      if (s.stamp) { var m = el("span", "stamp st-stamp", s.stamp); m.setAttribute("aria-hidden", "true"); card.appendChild(m); }
      if (s.status) card.appendChild(el("p", "stamp st-status", s.status));
      var cols = el("div", "st-cols");
      [["Что происходит", s.od, "st-do"], ["Что нужно от вас", s.you, "st-you"]].forEach(function (p) {
        var box = el("div", p[2]); box.appendChild(el("h4", "", p[0]));
        var ul = el("ul"); p[1].forEach(function (t) { ul.appendChild(el("li", "", t)); }); box.appendChild(ul); cols.appendChild(box);
      });
      card.appendChild(cols);
      var foot = el("div", "st-foot"), last = i === data.length - 1;
      var nx = el("a", "st-next", last ? "К заявке →" : "Дальше: " + data[i + 1].name + " ↓");
      nx.href = last ? "#zayavka" : "#st-" + (i + 1); foot.appendChild(nx);
      if (last) { var calcA = el("a", "st-tel", "К расчёту ↑"); calcA.href = "#raschet"; foot.appendChild(calcA); }
      if (s.tel) { var a = el("a", "mono st-tel", s.tel[1]); a.href = "tel:" + s.tel[0]; foot.appendChild(a); }
      card.appendChild(foot); li.appendChild(card); listEl.appendChild(li);
      var ni = el("li"), na = el("a", "", s.name); na.href = "#st-" + i; ni.appendChild(na); nav.appendChild(ni);
    });
    items = [].slice.call(listEl.children);
    /* без fx.js (или на телефоне, при reduced motion) показываем собранный путь целиком */
    items.forEach(function (it) { it.classList.add("is-passed"); });
    d.dispatchEvent(new Event("yl:built"));
  }
  /* переходы между станциями: прокрутка и фокус на заголовке; capture — раньше обработчика Lenis из kit */
  $("#put").addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#st-"]'); if (!a) return;
    e.preventDefault(); e.stopPropagation();
    var t = $(a.hash), y = t.getBoundingClientRect().top + scrollY - (live.matches ? innerHeight * .24 : 90);
    if (window.KIT && KIT.lenis) KIT.lenis.scrollTo(y); else scrollTo({ top: y, behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth" });
    t.querySelector("h3").focus({ preventScroll: true });
  });

  /* связь накладной и маршрута в обе стороны */
  bill.addEventListener("input", function (e) {
    var n = e.target.name;
    if (n === "route") { dir = e.target.value; ctl.elements.dir.value = dir; build(); }
    if (FLAGS.indexOf(n) > -1) { ctl.elements[n].checked = e.target.checked; build(); }
    render();
  });
  ctl.addEventListener("input", function (e) {
    var n = e.target.name;
    if (n === "dir") { dir = e.target.value; if (dir !== "ma") bill.elements.route.value = dir; }
    else bill.elements[n].checked = e.target.checked;
    build(); render();
  });
  /* браузер мог восстановить поля после возврата на страницу; по умолчанию маршрут показывает Салехард — там есть переправа */
  if (bill.elements.route.value !== "ml") dir = bill.elements.route.value;
  ctl.elements.dir.value = dir;
  FLAGS.forEach(function (k) { ctl.elements[k].checked = bill.elements[k].checked; });
  build(); render();

  /* подсветка текущего раздела */
  var links = [].slice.call(d.querySelectorAll("[data-menu] a"));
  var spy = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) links.forEach(function (a) { if (a.hash === "#" + e.target.id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  links.forEach(function (a) { var s = $(a.hash); if (s) spy.observe(s); });
})();
