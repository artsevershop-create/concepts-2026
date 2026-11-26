/* Подбор исследования. Все позиции, названия лабораторий и номера — из текстов cnipr.ru (услуги 147, 199–203; раздел «Лицензии»). */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

  var FH = [
    { t: "Лаборатории физико-химических исследований", r: [["Когалым", "РОСС RU.0001.21НН22"], ["Лангепас", "РОСС RU.0001.21НН14"], ["Покачи", "RA.RU.516581"], ["Урай", "RA.RU.518506"]] },
    { t: "Лаборатория химико-аналитических исследований", r: [["Когалым", "RA.RU.21АО57"]] }];
  var ECO = { t: "Лаборатории экологии и промсанитарии", r: [["Когалым", "РОСС RU.0001.511597"], ["Лангепас", "RA.RU.511241"], ["Урай", "РОСС RU.0001.512180"]] };
  var CHEM = "Химико-аналитические исследования", ANALYSIS = "Анализ и систематизация данных";

  /* id, кнопка, цвет жидкости в пробирке, фото, alt, название, пояснение, услуга, позиции, лаборатории */
  var O = [
    ["oil", "Нефть", "#2a170b", "p20", "Мерные цилиндры с пробами нефти", "Нефть", "Состав и свойства нефти, отбор глубинных проб на скважине.", CHEM,
      ["Состав и свойства нефти", "Отбор глубинных проб", ANALYSIS], FH],
    ["gas", "Газ и ПНГ", "#bfe0ff", "p19", "Специалисты в касках у сепараторов блока сепарации", "Природный и попутный нефтяной газ", "Состав и свойства газа и попутного нефтяного газа.", CHEM,
      ["Состав и свойства газа", "Состав и свойства попутного нефтяного газа", ANALYSIS], FH],
    ["water", "Вода", "#4fb3c9", "p13", "Колба с пробой воды в руках лаборанта", "Попутно добываемая и закачиваемая вода", "Анализ воды и оценка того, насколько она опасна для металла.", CHEM + ", коррозионный мониторинг",
      ["Состав и свойства вод", "Заражённость коррозионно-опасной микрофлорой (СВБ)", "Содержание коррозионно-активных агентов", "Скорость коррозии металлов в лаборатории и на промысле"], FH],
    ["salt", "Солевые отложения", "#d8bd8b", "p22", "Испытание на лабораторном аппарате", "Твёрдые солевые отложения", "Исследование состава и свойств отложений.", CHEM,
      ["Состав и свойства солевых отложений", ANALYSIS], FH],
    ["reagent", "Химреагенты", "#e08a1e", "p10", "Анализ растворов за лабораторным столом", "Химреагенты и композиции", "Реагенты, которыми повышают нефтеотдачу пластов.", CHEM,
      ["Контроль качества реагентов и композиций", "Анализ результатов и рекомендации по применению"], FH],
    ["fuel", "ГСМ и топливо", "#e9bb2f", "p21", "Общий вид лаборатории", "ГСМ, топлива, пенообразователь", "Входной и текущий контроль качества.", CHEM,
      ["Качество горюче-смазочных материалов", "Качество нефтяных топлив", "Качество пенообразователя"], FH],
    ["air", "Воздух и рабочие места", "#dceaf2", "p15", "Сотрудница лаборатории выполняет измерение ручным прибором", "Воздух и рабочая среда", "Замеры факторов на рабочих местах и перед опасными работами.", "Специальная оценка условий труда",
      ["Химические факторы: H₂S, бензол, оксиды азота, метан и др.", "Физические факторы: шум, вибрация, микроклимат, свет и др.", "Воздух из ёмкостей перед огневыми работами", "Эффективность вентиляции", "Радиационный контроль"],
      [ECO, { t: "Лицензии и реестры", r: [["Реестр СОУТ", "№ 425"], ["Ионизирующее излучение", "86.ХЦ.23.002.Л.000056.10.08"]] }]],
    ["soil", "Почва и отходы", "#7d5a38", "p17", "Спектрометрический комплект СКС-99 в кейсе", "Почва, нефтешлам, природная среда", "Спектрометрия и экологический мониторинг с проектной частью.", "Экологическая безопасность, СОУТ",
      ["Спектрометрия почвы и нефтяного шлама", "Экологический мониторинг природной среды", "Обследование водоохранных зон", "Проекты нормативов отходов и паспорта опасных отходов", "Проекты нормативов выбросов в атмосферу"],
      [ECO, { t: "Лицензия", r: [["Гидрометеорология", "Р/2015/2782/100/Л"]] }]],
    ["well", "Скважина и пласт", "#14100d", "p07", "Передвижная лаборатория ЦНИПР у станка-качалки", "Скважина и пласт", "Исследования на промысле и интерпретация: Sapfir, «Мониторинг ГДИС», «Гидрозонд» и др.", "Гидродинамические исследования",
      ["Замер пластового давления", "КВД, КПД, КВУ, индикаторная диаграмма", "Интерференция скважин", "Уровни, динамометрирование, отбивка забоя", "Дебит и газовый фактор", "Трассерные исследования", "Газоконденсатные и газодинамические"],
      [{ t: "Цеха научно-исследовательских и производственных работ", r: [["Когалым", ""], ["Покачи", ""], ["Лангепас", ""], ["Урай", ""]] }]],
    ["metal", "Металл и оборудование", "#8d9aa8", "p18", "Ультразвуковой контроль образца трубы", "Оборудование опасных объектов", "Котлы, газопроводы, краны, буровые вышки, резервуары, трубопроводы.", "Экспертиза промышленной безопасности",
      ["Ультразвуковой", "Рентгено- и гаммаграфический", "Акустико-эмиссионный", "Магнитный", "Вихретоковый", "Капиллярный, течеискание", "Визуальный и измерительный", "Вибродиагностический", "Электрический", "Тепловой", "Оптический"],
      [{ t: "Лаборатория неразрушающего контроля и технической диагностики", r: [["Аккредитация", "ИЛ/ЛРИ-00354"], ["Аттестация", "89А141479"]] }, { t: "Лицензия на экспертизу промбезопасности", r: [["Номер", "ДЭ-00-011086"]] }]]
  ];

  var run = $("#run"), rack = $("#rack"), cur, picked = {}, timers = [], seen = false;
  O.forEach(function (o) {
    picked[o[0]] = o[8].slice(0, 2);
    var l = el("label"), i = el("input"), s = el("span"), dot = el("i");
    i.type = "radio"; i.name = "obj"; i.value = o[0]; i.className = "sr";
    dot.style.background = o[2]; s.append(dot, document.createTextNode(o[1])); l.append(i, s); rack.append(l);
    i.addEventListener("change", function () { show(o[0]); play(); });
  });

  var vial = $("#vial");
  function still() { return KIT.REDUCED || KIT.still; }
  /* перезапуск CSS-анимации: снять класс, пересчитать, вернуть */
  function kick(e, c) { e.classList.remove(c); void e.offsetWidth; e.classList.add(c); }
  function enter(e, i) { e.classList.add("nx"); e.style.setProperty("--d", i); return e; }
  function play() {
    timers.forEach(clearTimeout); timers = [];
    if (still()) { run.dataset.at = 4; return; }
    run.dataset.at = 1; kick(vial, "pour");
    [2, 3, 4].forEach(function (n) { timers.push(setTimeout(function () { run.dataset.at = n; kick(vial, "go"); }, (n - 1) * 900)); });
  }
  function show(id) {
    cur = O.filter(function (o) { return o[0] === id; })[0];
    rack.querySelector('[value="' + id + '"]').checked = true;
    run.style.setProperty("--sample", cur[2]);
    var img = $("#s-img"); img.src = "img/" + cur[3] + ".webp"; img.alt = cur[4];
    kick(img.parentNode, "nx");
    $("#s-name").textContent = cur[5]; $("#s-text").textContent = cur[6]; $("#s-svc").textContent = cur[7];
    [$("#s-name"), $("#s-text"), $("#s-svc").parentNode].forEach(function (e, i) { e.style.setProperty("--d", i + 2); kick(e, "nx"); });
    var w = $("#works"); w.textContent = ""; w.classList.toggle("dense", cur[8].length > 8);
    cur[8].forEach(function (name, n) {
      var l = enter(el("label", "opt"), n), c = el("input"); c.type = "checkbox"; c.checked = picked[id].indexOf(name) > -1;
      c.addEventListener("change", function () {
        picked[id] = [].filter.call(w.querySelectorAll("input"), function (x) { return x.checked; }).map(function (x) { return x.value; });
        sheet();
      });
      c.value = name; l.append(c, el("span", "", name)); w.append(l);
    });
    var b = $("#labs"); b.textContent = "";
    var k = 0;
    cur[9].forEach(function (g) {
      var d = el("div", "lg"), ul = el("ul"); d.append(enter(el("p", "", g.t), k++));
      g.r.forEach(function (r) { var li = enter(el("li"), k++); li.append(el("span", "", r[0])); if (r[1]) li.append(el("code", "", r[1])); ul.append(li); });
      d.append(ul); b.append(d);
    });
    sheet(true);
  }
  function sheet(fresh) {
    var list = picked[cur[0]], ul = $("#o-list"); ul.textContent = "";
    $("#o-obj").textContent = cur[5]; $("#o-n").textContent = list.length ? "(" + list.length + ")" : "";
    if (fresh) kick($("#o-obj"), "nx");
    (list.length ? list : ["не отмечены, уточним по телефону"]).forEach(function (n, i) { var li = el("li", "", n); ul.append(fresh ? enter(li, i + 1) : li); });
  }
  $("#o-go").addEventListener("click", function () {
    $("#form").classList.remove("sent");
    $("#f-obj").value = cur[5]; $("#f-list").value = picked[cur[0]].join(";\n");
  });
  [].forEach.call(document.querySelectorAll("[data-pick]"), function (a) {
    a.addEventListener("click", function () { seen = true; show(a.dataset.pick); play(); });
  });
  [].forEach.call(document.querySelectorAll("[data-ask]"), function (a) {
    a.addEventListener("click", function () { $("#form").classList.remove("sent"); $("#f-obj").value = a.dataset.ask; $("#f-list").value = ""; });
  });

  show("water");
  if (!KIT.REDUCED) {
    run.dataset.at = 1;
    var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); if (!seen) { seen = true; show(cur[0]); play(); } } }, { threshold: .35 });
    io.observe(run);
  }
  document.addEventListener("kit:still", function () { if (KIT.still) { timers.forEach(clearTimeout); run.dataset.at = 4; } });

  /* hero: слои фото расходятся при прокрутке и чуть следуют за курсором (только translate, только пока hero виден) */
  var ph = $("[data-depth]");
  if (ph && !KIT.REDUCED) {
    var figs = [].slice.call(ph.children), sp = [-.05, .1, .17], mx = 0, my = 0, on = true, tk = 0;
    function draw() {
      tk = 0; if (KIT.still) return;
      var y = Math.min(scrollY, innerHeight);
      figs.forEach(function (f, i) { f.style.translate = (mx * (i + 1) * 6).toFixed(1) + "px " + (-y * sp[i] + my * (i + 1) * 5).toFixed(1) + "px"; });
    }
    function req() { if (on && !tk) tk = requestAnimationFrame(draw); }
    KIT.onView(ph, function (v) { on = v; req(); });
    addEventListener("scroll", req, { passive: true });
    if (KIT.FINE) $(".hero").addEventListener("pointermove", function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; req(); });
  }
})();
