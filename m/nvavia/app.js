/* «Задача для вертолёта». Все тексты и цифры — с nvavia.ru. Подключать до kit.js. */
(function () {
  "use strict";
  var d = document, $ = function (id) { return d.getElementById(id); };
  var ORDER = ["Служба организации воздушных перевозок", ["+7 3466 49-20-42", "+73466492042"], ["+7 912 938-04-70", "+79129380470"]];
  var G = "Фото: ", GUB = G + "Vladislav Gubzhokov", KRA = G + "Aleksandr Krasnikov", PAN = G + "Michael Panyuta";
  var TASKS = [
    { g: "В воздухе", n: "Перевозка пассажиров", img: "pax", alt: "Белый вертолёт Ми-8 авиакомпании над горной долиной в Непале", cap: "Ми-8 авиакомпании в Непале", load: "pax",
      text: "Перевозим пассажиров Заказчика по его заявкам на полёт и указанным маршрутам." },
    { g: "В воздухе", n: "Груз в фюзеляже", img: "cargo", alt: "Оранжевый вертолёт Ми-8 на стоянке аэродрома", cap: KRA, load: "ton", start: true,
      text: "Грузы Заказчика перевозятся на транспортном варианте вертолёта внутри фюзеляжа." },
    { g: "В воздухе", n: "Груз на внешней подвеске", img: "sling", alt: "Вертолёт Ми-8 с грузом на внешней подвеске над тайгой", load: "ton",
      text: "Груз идёт под вертолётом. Экипажи допущены к перевозке грузов на внешней подвеске.",
      note: "4,0 т — общая цифра авиакомпании по грузу. Отдельного значения для подвески на сайте нет: вес под ваш груз уточняйте при заявке." },
    { g: "В воздухе", n: "Погрузочно-разгрузочные работы", img: "load", alt: "Вертолёт Ми-8 в снежной пыли на площадке",
      text: "Экипажи авиакомпании допущены к погрузочно-разгрузочным работам." },
    { g: "В воздухе", n: "Воздушные съёмки", img: "survey", alt: "Оранжевый вертолёт Ми-8 в ясном небе", cap: GUB,
      text: "Экипажи авиакомпании допущены к выполнению воздушных съёмок." },
    { g: "В воздухе", n: "Лесоавиационные работы", img: "forest", alt: "Вертолёт Ми-8 летит над лесом", cap: PAN,
      text: "Среди тех, для кого летает авиакомпания, — авиалесоохрана. В 2023–2024 годах экипажи и инженеры работали на тушении пожаров в Турции." },
    { g: "В воздухе", n: "Поиск и спасение", img: "sar", alt: "Силуэт вертолёта Ми-8 на фоне пасмурного неба", cap: GUB,
      text: "Экипажи авиакомпании допущены к поисково-спасательным работам." },
    { g: "В воздухе", n: "Срочная медицинская помощь", img: "med", alt: "Белый вертолёт Ми-8 авиакомпании в полёте", cap: PAN,
      text: "Полёты для оказания срочной медицинской помощи населению. Экипажи летали в интересах центров медицины катастроф, а в 2020–2021 годах выполняли работы по санитарной авиации на Чукотке, в Самарской и Оренбургской областях, Калмыкии и Пермском крае." },
    { g: "На земле", n: "Обслуживание вертолётов", img: "mro", alt: "Оранжевый вертолёт Ми-8 на перроне, вид со стороны хвоста", cap: G + "Alexander Krasnikov",
      text: "Инженерно-авиационная служба, сертификат организации по ТО № 145-26-155. Техобслуживание и текущий ремонт Ми-8Т(П), Ми-8АМТ, Ми-8МТВ-1.",
      list: ["Оперативные и периодические регламенты Ми-8Т и Ми-8АМТ", "Ангары и наземное оборудование для персонала сторонних авиакомпаний", "Ультразвуковая промывка топливных и гидравлических фильтроэлементов", "Проверка компонентов АиРЭО на контрольно-проверочных комплексах", "Обслуживание авиационных аккумуляторных батарей", "Стажировка специалистов по ТО на Ми-8Т и Ми-8АМТ"],
      who: "Инженерно-авиационная служба", contact: [["49-20-06", "+73466492006"], ["49-20-83", "+73466492083"]] },
    { g: "На земле", n: "Расшифровка полётной информации", doc: ["№ 0930", "в Реестре подразделений полётной информации авиапредприятий России", "Свидетельства № MI8-16800011026-26 и № MI8-16900011026-26"],
      text: "Обработка, расшифровка и анализ полётной информации авиакомпаний, эксплуатирующих Ми-8Т(П) и Ми-8АМТ. Группа расшифровки зарегистрирована в Реестре подразделений полётной информации под № 0930.",
      list: ["Комплексная расшифровка", "Специальная расшифровка", "Графики и бланки экспресс-анализа", "Цифропечать и справки", "Звукозапись с речевых регистраторов МС-61, П-503Б, П-507М"],
      who: "Приёмная авиакомпании", contact: [["+7 3466 49-20-02", "+73466492002"]] },
    { g: "На земле", n: "Обучение в учебном центре", doc: ["20 000+", "человек авиационного персонала окончили курсы повышения квалификации за годы работы центра"],
      text: "Авиационный учебный центр: дополнительное профессиональное образование и профессиональное обучение, очно.",
      list: ["10 специализированных учебных кабинетов", "Тренажёр вертолёта Ми-8 и макеты кабины", "Лётная подготовка на Ми-8, Ми-8АМТ и Ми-8МТВ", "Класс для тренинга экипажей по CRM", "Лингафонный класс для подготовки к международным полётам"],
      who: "Авиационный учебный центр", contact: [["49-20-56", "+73466492056"]] }
  ];

  function el(tag, text, cls) { var e = d.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; }
  var list = $("tasks"), desk = $("desk"), frame = $("shot-in"), sel = $("f-task"), cur = -1, type = "Ми-8Т", token = 0;
  var still = matchMedia("(prefers-reduced-motion: reduce)");

  var group, seats = $("seats");
  for (var s = 0; s < 22; s++) seats.appendChild(el("u"));
  TASKS.forEach(function (t, i) {
    if (t.g !== group) {
      group = t.g;
      var h = el("p", group, "tg"); h.setAttribute("role", "presentation"); list.appendChild(h);
      var og = el("optgroup"); og.label = group; sel.appendChild(og);
    }
    var b = el("button", t.n); b.type = "button"; b.id = "t" + i; b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "desk"); list.appendChild(b);
    b.addEventListener("click", function () {
      show(i);
      /* на узком экране список выше кадра: показываем результат выбора */
      if (matchMedia("(max-width:1040px)").matches) desk.scrollIntoView({ behavior: still.matches ? "auto" : "smooth", block: "start" });
    });
    var o = el("option", t.n); o.value = t.n; sel.lastChild.appendChild(o);
  });
  list.addEventListener("keydown", function (e) {
    var step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    var i = e.key === "Home" ? 0 : e.key === "End" ? TASKS.length - 1 : step ? (cur + step + TASKS.length) % TASKS.length : null;
    if (i === null) return; e.preventDefault(); show(i); $("t" + i).focus();
  });

  /* новый кадр открывается «оборотом винта» поверх старого */
  function put(node) {
    while (frame.children.length > 1) frame.firstChild.remove();
    if (frame.children.length && !still.matches && !(window.KIT && KIT.still)) node.className += " sweep";
    frame.appendChild(node);
  }
  function picture(t) {
    var my = ++token;
    $("cap").textContent = t.cap || ""; $("shot").classList.toggle("is-doc", !!t.doc);
    if (t.doc) {
      var box = el("div", "", "doc"); t.doc.forEach(function (x, k) { box.appendChild(el(k ? "span" : "b", k ? nb(x) : x, k ? "" : "num")); });
      return put(box);
    }
    var img = new Image(); img.alt = t.alt; img.src = "img/" + t.img + ".webp";
    var go = function () { if (my === token) put(img); };
    if (img.decode) img.decode().then(go, go); else go();
  }

  function seatsFor() {
    var amt = type === "Ми-8АМТ";
    $("p-pax").textContent = amt ? "17–22" : "до 22";
    [].forEach.call(seats.children, function (u, i) { u.className = amt && i >= 17 ? "maybe" : ""; });
  }

  function show(i) {
    if (i === cur) return;
    var t = TASKS[i]; cur = i;
    [].forEach.call(list.querySelectorAll("[role=tab]"), function (b, k) { b.setAttribute("aria-selected", k === i); b.tabIndex = k === i ? 0 : -1; });
    desk.setAttribute("aria-labelledby", "t" + i);
    picture(t);
    $("p-title").textContent = nb(t.n); $("p-text").textContent = nb(t.text);
    $("p-note").textContent = nb(t.note || ""); $("p-note").hidden = !t.note;
    var air = !t.list;
    $("p-load").hidden = !air; $("p-load").dataset.focus = t.load || "";
    var ul = $("p-list"); ul.hidden = air; ul.textContent = ""; (t.list || []).forEach(function (x) { ul.appendChild(el("li", nb(x))); });
    var c = air ? [ORDER[1], ORDER[2]] : t.contact;
    $("p-who").textContent = air ? ORDER[0] : t.who;
    var pc = $("p-contact"); pc.textContent = ""; c.forEach(function (x) { var a = el("a", x[0].replace(/ /g, " "), "num"); a.href = "tel:" + x[1]; pc.appendChild(a); });
  }

  /* неразрывные пробелы после коротких слов и перед единицами */
  function nb(s) {
    return s.replace(/(^|[\s(«])(в|во|на|и|а|к|с|со|по|о|у|за|из|до|от|для|не|№)\s+(?=\S)/gi, "$1$2 ")
      .replace(/(^| )(в|во|на|и|а|к|с|со|по|о|у|за|из|до|от|для|не|№)\s+(?=\S)/gi, "$1$2 ")
      .replace(/(\d) (?=т\b|т |тысяч|год|специализ)/g, "$1 ").replace(/ —/g, " —");
  }

  /* заявка: цифры авиакомпании на один вертолёт — до 22 пассажиров или до 4,0 т (Ми-8АМТ: 17–22) */
  function limitHint(pax, ton, kind) {
    var out = [];
    if (ton > 4) out.push("Груз больше 4,0 т — это выше цифры авиакомпании для одного вертолёта.");
    if (pax > 22) out.push("Больше 22 пассажиров — это выше цифры авиакомпании для одного вертолёта.");
    else if (kind === "Ми-8АМТ" && pax > 17) out.push("Для Ми-8АМТ указано от 17 до 22 пассажиров: точное число мест уточните.");
    if (pax > 0 && ton > 0) out.push("Цифры даны «пассажиры или груз»: можно ли совместить, уточните в службе перевозок.");
    return out.join(" ");
  }

  var fType = $("f-type"), fPax = $("f-pax"), fTon = $("f-ton"), flight = $("f-flight");
  function hint() { $("f-hint").textContent = nb(limitHint(+fPax.value, +fTon.value, fType.value)); }
  function formMode() { var air = !TASKS[sel.selectedIndex].list; flight.disabled = !air; flight.hidden = !air; }
  [fType, fPax, fTon].forEach(function (f) { f.addEventListener("input", hint); });
  sel.addEventListener("change", formMode);
  [].forEach.call(d.querySelectorAll("[data-type]"), function (b) {
    b.addEventListener("click", function () {
      type = b.dataset.type; fType.value = type; hint(); seatsFor();
      [].forEach.call(d.querySelectorAll("[data-type]"), function (x) { x.setAttribute("aria-pressed", x === b); });
    });
  });
  /* перенос задачи в заявку; прокрутку делает ссылка */
  $("p-go").addEventListener("click", function () { sel.value = TASKS[cur].n; formMode(); });

  seatsFor();
  var start = TASKS.findIndex(function (t) { return t.start; });
  show(start); sel.value = TASKS[start].n; formMode();
  window.NVA = { limitHint: limitHint };
})();
