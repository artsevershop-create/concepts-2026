/* Вход по задаче и условная схема рек. Пристани и км — из расписаний навигации 2026 г. на severflot.ru. */
(function () {
  "use strict";
  var d = document, K = window.KIT;
  var $ = function (s) { return d.querySelector(s); }, $$ = function (s) { return [].slice.call(d.querySelectorAll(s)); };

  /* ---------- вкладки задач ---------- */
  var tabs = $$('[role=tab]');
  function pickTab(t, focus) {
    tabs.forEach(function (b) { var on = b === t; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; d.getElementById(b.getAttribute("aria-controls")).hidden = !on; });
    if (focus) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { pickTab(t); });
    t.addEventListener("keydown", function (e) {
      var n = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (n === undefined) return; e.preventDefault(); pickTab(tabs[(n + tabs.length) % tabs.length], true);
    });
  });
  pickTab(tabs[0]);
  $$("[data-pick]").forEach(function (a) { a.addEventListener("click", function () { $("#f-task").value = a.dataset.pick; }); });

  /* ---------- схема: координаты условные (поле 1000×1000), не в масштабе ---------- */
  var N = {
    "Салехард": [330, 90], "Катравож": [262, 128], "Аксарка": [425, 100], "Салемал": [505, 76], "Панаевск": [585, 92], "Яр-Сале": [668, 76], "Ныда": [815, 108],
    "Самбург": [862, 190], "Уренгой": [905, 300],
    "Шурышкары": [255, 190], "Мужи": [235, 258], "Азовы": [216, 322], "Теги": [216, 378], "Берёзово": [200, 428],
    "Питляр": [352, 185], "Горки": [346, 258], "Лопхари": [368, 300], "Казым-Мыс": [346, 346], "Ванзеват": [358, 405], "Полноват": [338, 462], "Белоярский": [505, 442],
    "Тугияны": [338, 505], "Вежакоры": [312, 542], "Перегребное": [290, 590], "Нижние Нарыкары": [222, 530], "Шеркалы": [318, 630], "Приобье": [292, 668], "Приобье·паром": [262, 672], "Андра": [326, 658],
    "Шайтанка": [165, 442], "Ванзетур": [130, 428], "Игрим": [105, 468], "Анеева": [78, 497], "Сартынья": [88, 548], "Сосьва": [52, 590],
    "Октябрьское": [345, 696], "Большой Камень": [310, 718], "Сотниково": [378, 706], "Малый Атлым": [398, 724], "Большие Леуши": [425, 726], "Карымкары": [446, 745],
    "Горнореченск": [474, 748], "Урманный": [494, 767], "Кедровый": [520, 766], "Елизарово": [538, 785], "Троица": [545, 818], "Луговской": [560, 795], "Белогорье": [582, 802], "Кирпичный": [598, 784],
    "Ханты-Мансийск": [625, 794],
    "Нялино": [662, 770], "Зенково": [690, 782], "Селиярово": [716, 764], "Сытомино": [748, 772], "Лямино": [774, 752], "Тундрино": [802, 764], "Сургут": [842, 744], "Банный": [874, 727],
    "Юган": [850, 802], "Еутские Юрты": [828, 838], "Малоюганский": [850, 866], "Угут": [836, 910],
    "Охтеурская переправа": [908, 686], "Охтеурье": [925, 660], "Белорусский": [925, 626], "Ларьяк": [962, 596],
    "Тюли": [620, 834], "Реполово": [640, 856], "Сибирский": [626, 876], "Батово": [646, 896], "Цингалы": [632, 920], "Чембакчино": [652, 940], "Горноправдинск": [636, 962], "Лугофилинская": [656, 982],
    "Выкатной": [588, 842], "Кама": [552, 866], "Алтай": [536, 888], "Болчары": [488, 894], "Чеснок": [460, 920], "Пушка": [424, 912], "Ленино": [396, 936], "Ильичёвка": [362, 922],
    "Кондинское": [330, 944], "Никулкино": [296, 928], "Катыш": [272, 950], "Вар-Бор": [244, 932], "Юмас": [212, 950], "Ямки": [186, 930], "Сотник": [160, 948], "Междуреченский": [126, 932], "Луговой": [82, 950]
  };
  N["Выкатное"] = N["Выкатной"];

  var L = function (s) { return s.split("|"); };
  var UP = "Приобье|Октябрьское|Сотниково|Малый Атлым|Большие Леуши|Карымкары|Горнореченск|Урманный|Кедровый|Елизарово|Луговской|Белогорье|Кирпичный|Ханты-Мансийск";
  /* реки: [толщина, пристани по порядку, свои точки в начале/конце] */
  var RIVERS = [
    [9, L("Яр-Сале|Панаевск|Салемал|Аксарка|Салехард|Питляр|Горки|Лопхари|Казым-Мыс|Ванзеват|Полноват|Тугияны|Вежакоры|Перегребное|Шеркалы|" + UP + "|Нялино|Зенково|Селиярово|Сытомино|Лямино|Тундрино|Сургут|Банный"), null, [[925, 712], [1010, 700]]],
    [6, L("Яр-Сале|Ныда"), null, [[900, 60], [1010, 20]]],
    [5, L("Салехард|Шурышкары|Мужи|Азовы|Теги|Берёзово|Нижние Нарыкары|Перегребное")],
    [4, L("Катравож|Салехард")],
    [4, L("Берёзово|Шайтанка|Ванзетур|Игрим|Анеева|Сартынья|Сосьва"), null, [[30, 640]]],
    [4, L("Полноват|Белоярский"), null, [[590, 458], [660, 430]]],
    [7, L("Ханты-Мансийск|Тюли|Реполово|Сибирский|Батово|Цингалы|Чембакчино|Горноправдинск|Лугофилинская"), null, [[644, 1015]]],
    [4, L("Тюли|Выкатной|Кама|Алтай|Болчары|Чеснок|Пушка|Ленино|Ильичёвка|Кондинское|Никулкино|Катыш|Вар-Бор|Юмас|Ямки|Сотник|Междуреченский|Луговой"), null, [[40, 925]]],
    [4, L("Сургут|Юган|Еутские Юрты|Малоюганский|Угут"), null, [[858, 945]]],
    [4, L("Банный|Охтеурская переправа|Охтеурье|Белорусский|Ларьяк"), null, [[1010, 580]]],
    [4, L("Самбург|Уренгой"), [[850, 130]], [[925, 372]]]
  ];
  var RNAMES = [["Обь", 318, 232, -90], ["Обь", 765, 726, -14], ["Иртыш", 700, 905, 72], ["Казым", 570, 478, -8]];

  /* маршруты: n — название, s — пристани и км, p — линия по реке (если длиннее списка остановок) */
  var st = function (s) { return s.split(";").map(function (x) { var a = x.split(":"); return [a[0], a[1] === undefined ? null : +a[1]]; }); };
  var T = function (v) { return "В навигацию 2026 года ориентировочная дата закрытия — " + v + "."; };
  var Y = function (v) { return "По расписанию 2026 года " + v + "."; };
  var HM_NW = "Ханты-Мансийск|Кирпичный|Белогорье|Луговской|Елизарово|Кедровый|Урманный|";
  var G = [
    { g: "Из Ханты-Мансийска", r: [
      { n: "Ханты-Мансийск — Берёзово", v: "«Метеор»", c: T("24 октября (рейс из Берёзово)"), s: st("Ханты-Мансийск:0;Елизарово:86;Кедровый:98;Урманный:125;Горнореченск:156;Карымкары:184;Большие Леуши:205;Малый Атлым:217;Сотниково:238;Октябрьское:276;Шеркалы:321;Перегребное:352;Нижние Нарыкары:392;Берёзово:518"),
        p: L(HM_NW + "Горнореченск|Карымкары|Большие Леуши|Малый Атлым|Сотниково|Октябрьское|Приобье|Шеркалы|Перегребное|Нижние Нарыкары|Берёзово") },
      { n: "Ханты-Мансийск — Сургут", v: "«Валдай 45Р»", c: T("25 октября"), s: st("Ханты-Мансийск:0;Нялино:85;Зенково:135;Селиярово:175;Сытомино:233;Лямино:262;Тундрино:288;Сургут:382;Банный:402") },
      { n: "Ханты-Мансийск — Кондинское", v: "«Заря»", c: "Ориентировочная дата закрытия в опубликованной таблице не указана.", s: st("Ханты-Мансийск:0;Тюли:62;Выкатное:76;Кама:130;Алтай:145;Болчары:238;Чеснок:262;Пушка:296;Ленино:316;Ильичёвка:361;Кондинское:387") },
      { n: "Ханты-Мансийск — Горноправдинск, Цингалы", v: "«Восход»", c: T("1 ноября"), s: st("Ханты-Мансийск:0;Тюли:62;Реполово:87;Сибирский:98;Батово:117;Цингалы:166;Чембакчино:183;Горноправдинск:197;Лугофилинская:200") },
      { n: "Урманный — Ханты-Мансийск", v: "«Метеор»", c: T("30 октября (рейс из Урманного)"), s: st("Урманный:0;Кедровый:34;Елизарово:46;Луговской:88;Ханты-Мансийск:128"), p: L("Урманный|Кедровый|Елизарово|Луговской|Белогорье|Кирпичный|Ханты-Мансийск") },
      { n: "Выкатной — Ханты-Мансийск", v: "«Линда»", c: T("1 ноября (рейс из Выкатного)"), s: st("Выкатной:0;Тюли:14;Ханты-Мансийск:76") },
      { n: "Ханты-Мансийск — Селиярово", v: "«Валдай»", c: T("24 октября"), s: st("Ханты-Мансийск:0;Нялино:85;Зенково:135;Селиярово:175") },
      { n: "Ханты-Мансийск — Нялино", v: "«Валдай»", c: T("25 октября"), s: st("Ханты-Мансийск:0;Нялино:85") },
      { n: "Ханты-Мансийск — Троица", v: "«Линда»", c: T("30 октября"), s: st("Ханты-Мансийск:0;Кирпичный:32;Белогорье:34;Луговской:40;Троица:46") }
    ] },
    { g: "Приобье и Октябрьское", r: [
      { n: "Приобье — Берёзово", v: "«Метеор»", c: T("22 октября"), s: st("Приобье:0;Шеркалы:32;Перегребное:63;Нижние Нарыкары:103;Берёзово:229") },
      { n: "Приобье — Белоярский", v: "«Заря» до Полновата, дальше судно на воздушной подушке", c: T("22 октября"), s: st("Приобье:0;Шеркалы:30;Перегребное:61;Вежакоры:121;Тугияны:157;Полноват:199;Белоярский:282") },
      { n: "Нижние Нарыкары — Приобье — Берёзово", short: "Нижние Нарыкары — Берёзово", v: "«Метеор»", c: T("25 октября (рейс из Нижних Нарыкар)"), s: st("Нижние Нарыкары:0;Перегребное:40;Шеркалы:71;Приобье:103;Октябрьское:166;Приобье:229;Шеркалы:261;Перегребное:292;Нижние Нарыкары:332;Берёзово:458") },
      { n: "Перегребное — Приобье", v: "«Линда»", c: T("25 октября"), s: st("Перегребное:0;Шеркалы:31;Приобье:63") },
      { n: "Октябрьское — Приобье", v: "«Линда»", c: T("25 октября"), s: st("Октябрьское:0;Приобье:31") },
      { n: "Октябрьское — Большой Камень", v: "«Линда»", c: T("23 октября"), s: st("Октябрьское:0;Большой Камень:12") }
    ] },
    { g: "Берёзово и Белоярский", r: [
      { n: "Берёзово — Сосьва", v: "«Линда»", c: "Ориентировочная дата закрытия в опубликованной таблице не указана.", s: st("Берёзово:0;Шайтанка:30;Ванзетур:60;Игрим:110;Анеева:138;Сартынья:216;Сосьва:288") },
      { n: "Игрим — Берёзово", v: "«Линда»", c: T("19 октября (рейс из Игрима)"), s: st("Игрим:0;Ванзетур:50;Шайтанка:80;Берёзово:110") },
      { n: "Игрим — Сосьва", v: "«Югорский-10»", c: "Ориентировочная дата закрытия в опубликованной таблице не указана.", s: st("Игрим:0;Анеева:28;Сартынья:106;Сосьва:178") },
      { n: "Белоярский — Ванзеват", v: "«Югорский»", c: T("19 октября"), s: st("Белоярский:0;Полноват:84;Ванзеват:156") }
    ] },
    { g: "Сургут, Конда, Вах", r: [
      { n: "Сургут — Угут", v: "«Заря»", c: "Ориентировочная дата закрытия в опубликованной таблице не указана.", s: st("Сургут:0;Юган:178;Еутские Юрты:224;Малоюганский:238;Угут:286") },
      { n: "Кондинское — Междуреченский", v: "«Заря»", c: T("31 октября"), s: st("Кондинское:0;Никулкино:37;Катыш:63;Вар-Бор:83;Юмас:112;Ямки:131;Сотник:139;Междуреченский:173") },
      { n: "Междуреченский — Луговой", v: "«Заря»", c: T("31 октября"), s: st("Междуреченский:0;Луговой:24") },
      { n: "Ларьяк — Охтеурская переправа", v: "«Заря»", c: T("18 октября"), s: st("Ларьяк:0;Белорусский:96;Охтеурье:120;Охтеурская переправа:129") }
    ] },
    { g: "Ямал", r: [
      { n: "Берёзово — Салехард", v: "«Метеор»; из Салехарда ходит обратно через Шурышкары и Мужи", c: Y("рейсы шли до 10 октября"), s: st("Берёзово:0;Теги:59;Азовы:147;Мужи:217;Шурышкары:300;Салехард:407") },
      { n: "Салехард — Ныда", v: "судно проекта А-145", c: Y("рейсы были по отдельным датам июля и августа"), s: st("Салехард:0;Аксарка:79;Салемал:156;Панаевск:215;Яр-Сале:271;Ныда:423") },
      { n: "Салехард — Яр-Сале", v: "судно проекта А-145", c: Y("рейсы шли до 10 октября"), s: st("Салехард:0;Аксарка:79;Салемал:156;Панаевск:215;Яр-Сале:271") },
      { n: "Салехард — Казым-Мыс", v: "судно типа «Метеор»", c: Y("последний рейс — 10 октября"), s: st("Салехард:0;Питляр:107;Горки:202;Лопхари:227;Казым-Мыс:270") },
      { n: "Салехард — Мужи", v: "судно проекта «Метеор»", c: Y("последняя дата отправления — 8 октября"), s: st("Салехард:0;Шурышкары:107;Мужи:190") },
      { n: "Салехард — Катравож", v: "«Фарман Салманов»", c: Y("рейсы шли до 12 октября"), s: st("Салехард:0;Катравож:45") },
      { n: "Самбург — Уренгой", v: "«Ляд Айваседо»", c: Y("рейсы шли до 6 октября"), s: st("Самбург:0;Уренгой:157") }
    ] },
    { g: "Паром", r: [
      { n: "Паром Приобье — Андра", ferry: true, v: "паром РТ-423", c: "Навигация 2026 года завершена. Расписание на 2027 год не опубликовано.", s: st("Приобье·паром;Андра") }
    ] }
  ];

  var HUBS = L("Ханты-Мансийск|Салехард|Берёзово|Приобье|Сургут|Белоярский|Кондинское|Горноправдинск|Сосьва|Ныда|Уренгой|Угут|Ларьяк|Междуреченский");
  var name = function (n) { return n.split("·")[0]; };
  var NS = "http://www.w3.org/2000/svg", svg = $("#chart");
  function el(tag, attrs, parent) { var e = d.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; }

  /* плавная линия через точки (Catmull-Rom): маршрут и река строятся из одних пристаней */
  function curve(P) {
    var s = "M" + P[0][0] + " " + P[0][1];
    for (var i = 0; i < P.length - 1; i++) {
      var a = P[i - 1] || P[i], b = P[i], c = P[i + 1], e = P[i + 2] || c;
      s += "C" + (b[0] + (c[0] - a[0]) / 7) + " " + (b[1] + (c[1] - a[1]) / 7) + " " + (c[0] - (e[0] - b[0]) / 7) + " " + (c[1] - (e[1] - b[1]) / 7) + " " + c[0] + " " + c[1];
    }
    return s;
  }
  var pt = function (n) { if (!N[n]) throw new Error("нет координат: " + n); return N[n]; };

  var gRiv = el("g", {}), gPiers = el("g", {}), gRoute = el("g", {}), gLab = el("g", { "class": "labs", "aria-hidden": "true" });
  var rivers = RIVERS.map(function (r) { return [el("path", { "class": "riv", d: curve((r[2] || []).concat(r[1].map(pt), r[3] || [])) }, gRiv), r[0]]; });
  var piers = Object.keys(N).filter(function (n) { return n !== "Выкатное" && n !== "Андра" && n.indexOf("·") < 0; }).map(function (n) { return el("circle", { "class": "pier", cx: N[n][0], cy: N[n][1] }, gPiers); });
  var route = el("path", { "class": "route" }, gRoute), glow = el("path", { "class": "glow" }, gRoute), wake = el("path", { "class": "wake" }, gRoute), gStops = el("g", {}, gRoute);
  /* кольца волны за кормой: пул из 7, переиспользуются */
  var ripples = [0, 1, 2, 3, 4, 5, 6].map(function () { return { c: el("circle", { "class": "ripple", r: 0, opacity: 0 }, gRoute), age: 1e9 }; }), rip = 0, ripT = 0;
  var ship = el("g", { "class": "ship" }, gRoute);
  /* судно на подводных крыльях, вид сверху, нос по +x */
  el("path", { "class": "hull", d: "M19 0C13-5.5 6-6.5-3-6.5H-15Q-18-6-18-3V3Q-18 6-15 6.5H-3C6 6.5 13 5.5 19 0Z" }, ship);
  el("path", { "class": "deck", d: "M9 0C6-3 2-3.4-3-3.4H-12V3.4H-3C2 3.4 6 3 9 0Z" }, ship);

  var cur, len = 0, dist = 0, dir = 1, hold = 0, k = 1, vb = [0, 0, 1000, 1000], vbId = 0, overview = false, speed = 90, ang = 0, pos = { x: 0, y: 0 }, stopL = [];

  /* dt — для плавного поворота носа (на разворотах судно поворачивает, а не «перескакивает»); без dt — сразу по курсу */
  function place(dt) {
    var a = route.getPointAtLength(dist), b = route.getPointAtLength(Math.max(0, Math.min(len, dist + 3 * dir)));
    if (a.x === b.x && a.y === b.y) { b = a; a = route.getPointAtLength(Math.max(0, dist - 3 * dir)); }
    var target = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    if (!dt) ang = target; else { var df = ((target - ang) % 360 + 540) % 360 - 180; ang += df * Math.min(1, dt / 260); }
    pos = route.getPointAtLength(dist);
    ship.setAttribute("transform", "translate(" + pos.x + " " + pos.y + ") rotate(" + ang + ") scale(" + k * 1.15 + ")");
    /* след за кормой: от начала пути в эту сторону до судна */
    var from = dir > 0 ? 0 : dist, to = dir > 0 ? dist : len, da = "0 " + from + " " + Math.max(0, to - from) + " " + (len + 10);
    wake.setAttribute("stroke-dasharray", da); glow.setAttribute("stroke-dasharray", da);
  }

  /* километры пути до каждой пристани — ищем по порядку, чтобы повторные заходы (Приобье дважды) не путались */
  function measure() {
    var n = 700, S = [], from = 0;
    for (var i = 0; i <= n; i++) { var p = route.getPointAtLength(len * i / n); S.push([p.x, p.y, len * i / n]); }
    stopL = cur.s.map(function (s) {
      var q = pt(s[0]), best = from, bd = 1e12;
      for (var j = from; j < S.length; j++) { var dd = (S[j][0] - q[0]) * (S[j][0] - q[0]) + (S[j][1] - q[1]) * (S[j][1] - q[1]); if (dd < bd - 1e-6) { bd = dd; best = j; } }
      from = best; return S[best][2];
    });
  }
  /* судно проходит пристань: кольцо на схеме и подсветка строки в списке */
  function arrive(i) {
    var li = $("#r-stops").children[i], c = gStops.children[i]; if (!li || !c) return;
    $$("#r-stops li.at").forEach(function (x) { x.classList.remove("at"); }); li.classList.add("at");
    c.classList.add("passed");
    var ol = $("#r-stops"); if (ol.scrollHeight > ol.clientHeight + 4) ol.scrollTo({ top: li.offsetTop - ol.clientHeight / 2, behavior: "smooth" });
    var q = pt(cur.s[i][0]), g = el("circle", { "class": "ping", cx: q[0], cy: q[1], r: 6 * k, "stroke-width": 2 * k }, gRoute);
    setTimeout(function () { g.remove(); }, 1700);
  }

  function frame(box) {
    var r = svg.getBoundingClientRect(), W = r.width || 700, H = r.height || 600, a = W / H;
    var x = box[0], y = box[1], w = box[2], h = box[3];
    if (w / h < a) { x -= (h * a - w) / 2; w = h * a; } else { y -= (w / a - h) / 2; h = w / a; }
    return { box: [x, y, w, h], k: w / W };
  }

  /* подписи: ставим по очереди важности, пропускаем те, что наезжают; полный список всегда рядом */
  function labels(names, box) {
    gLab.textContent = "";
    var fs = 13.5 * k, placed = [], isPhone = svg.getBoundingClientRect().width < 500;
    if (isPhone) fs = 12.5 * k;
    var dots = (overview ? HUBS : cur.s.map(function (s) { return s[0]; })).map(function (n) { return [pt(n)[0] - 6 * k, pt(n)[1] - 6 * k, 12 * k, 12 * k]; });
    /* кнопка «Вся схема» в правом верхнем углу тоже занята */
    placed.push([box[0] + box[2] - 124 * k, box[1], 124 * k, 60 * k]);
    var hit = function (a, b) { return a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1]; };
    names.forEach(function (o) {
      var p = pt(o[0]), t = el("text", { "class": "lb" + (o[1] ? " dim" : ""), "font-size": fs, "stroke-width": 4 * k }, gLab);
      t.textContent = name(o[0]);
      var w = t.getComputedTextLength(), g = 10 * k, h = fs * 1.15;
      var tries = [[g, -h / 2], [-g - w, -h / 2], [-w / 2, -g - h], [-w / 2, g], [g * .7, -g - h * .7], [g * .7, g * .5], [-w - g * .7, -g - h * .7], [-w - g * .7, g * .5]];
      for (var i = 0; i < tries.length; i++) {
        var b = [p[0] + tries[i][0], p[1] + tries[i][1], w, h];
        if (b[0] < box[0] + 4 * k || b[0] + w > box[0] + box[2] - 4 * k || b[1] < box[1] + 4 * k || b[1] + h > box[1] + box[3] - 4 * k) continue;
        if (placed.some(function (q) { return hit(b, q); }) || dots.some(function (q) { return hit(b, q); })) continue;
        placed.push(b); t.setAttribute("x", b[0]); t.setAttribute("y", b[1] + h * .78); return;
      }
      gLab.removeChild(t);
    });
    RNAMES.forEach(function (r) {
      var t = el("text", { "class": "rn", "font-size": 13 * k, "stroke-width": 4 * k, "text-anchor": "middle" }, gLab); t.textContent = r[0];
      var x = r[1], y = r[2], w = t.getComputedTextLength(), b = [x - w / 2, y - 8 * k, w, 16 * k];
      if (Math.abs(r[3]) > 45) b = [x - 8 * k, y - w / 2, 16 * k, w];
      if (b[0] < box[0] || b[0] + b[2] > box[0] + box[2] || b[1] < box[1] || b[1] + b[3] > box[1] + box[3] || placed.some(function (q) { return hit(b, q); })) { gLab.removeChild(t); return; }
      t.setAttribute("x", x); t.setAttribute("y", y + 4 * k); t.setAttribute("transform", "rotate(" + r[3] + " " + x + " " + y + ")");
    });
  }

  function sizes() {
    var phone = svg.getBoundingClientRect().width < 500;
    rivers.forEach(function (r) { r[0].setAttribute("stroke-width", r[1] * Math.max(.75, Math.min(1.5, k))); });
    piers.forEach(function (c) { c.setAttribute("r", 2.1 * k); });
    route.setAttribute("stroke-width", 5 * k); wake.setAttribute("stroke-width", 5 * k); glow.setAttribute("stroke-width", 16 * k);
    ripples.forEach(function (o) { o.c.setAttribute("stroke-width", 1.4 * k); });
    [].forEach.call(gStops.children, function (c) {
      if (c.tagName === "circle") { c.setAttribute("r", (c.classList.contains("end") ? 6 : 4.2) * k); c.setAttribute("stroke-width", 2 * k); }
      else c.setAttribute("stroke-width", 5 * k);
    });
    ship.style.display = ""; place();
    svg.dataset.phone = phone;
  }

  function draw(animate) {
    var names = cur.s.map(function (s) { return s[0]; });
    var xs = names.map(function (n) { return pt(n)[0]; }), ys = names.map(function (n) { return pt(n)[1]; });
    var x0 = Math.min.apply(0, xs), x1 = Math.max.apply(0, xs), y0 = Math.min.apply(0, ys), y1 = Math.max.apply(0, ys);
    var mw = cur.ferry ? 210 : 250, mh = cur.ferry ? 150 : 200, w = Math.max(mw, (x1 - x0) * 1.28 + 60), h = Math.max(mh, (y1 - y0) * 1.2 + 60);
    var f = frame(overview ? [20, 40, 975, 955] : [(x0 + x1) / 2 - w / 2, (y0 + y1) / 2 - h / 2, w, h]);
    k = f.k; speed = Math.max(len / 14, 55 * k);
    var order = [], seen = {};
    function add(n, dim) { if (!seen[name(n)]) { seen[name(n)] = 1; order.push([n, dim]); } }
    if (!overview) {
      add(names[0]); add(names[names.length - 1]);
      names.forEach(function (n) { if (HUBS.indexOf(n) > -1) add(n); });
      names.forEach(function (n) { add(n); });
    }
    HUBS.forEach(function (n) { add(n, !overview); });
    sizes(); labels(order, f.box);
    cancelAnimationFrame(vbId);
    var from = vb.slice(), to = f.box, t0 = performance.now();
    function set(v) { vb = v; svg.setAttribute("viewBox", v.join(" ")); }
    if (!animate || K.REDUCED || K.still) { gLab.style.opacity = 1; return set(to); }
    /* «полёт камеры»: центр и масштаб плавно (ease-in-out), а на дальних перелётах камера чуть отъезжает и снова приближается */
    var c0 = [from[0] + from[2] / 2, from[1] + from[3] / 2], c1 = [to[0] + to[2] / 2, to[1] + to[3] / 2];
    var far = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]) / Math.max(from[2], to[2]), bump = Math.min(.45, far * .6), T = 1100 + Math.min(700, far * 900);
    gLab.style.opacity = 0;
    (function step(t) {
      var q = Math.min(1, Math.max(0, (t - t0) / T)), e = q < .5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2, z = 1 + bump * Math.sin(Math.PI * q);
      var w = (from[2] + (to[2] - from[2]) * e) * z, h = (from[3] + (to[3] - from[3]) * e) * z, cx = c0[0] + (c1[0] - c0[0]) * e, cy = c0[1] + (c1[1] - c0[1]) * e;
      set([cx - w / 2, cy - h / 2, w, h]);
      if (q < 1) vbId = requestAnimationFrame(step); else gLab.style.opacity = 1;
    })(t0);
  }

  function select(r, animate) {
    cur = r; overview = false; $("#all").setAttribute("aria-pressed", "false");
    var path = r.p || r.s.map(function (s) { return s[0]; });
    var dd = r.ferry ? "M" + pt("Приобье·паром").join(" ") + "Q294 655 " + pt("Андра").join(" ") : curve(path.map(pt));
    route.setAttribute("d", dd); wake.setAttribute("d", dd); glow.setAttribute("d", dd); route.classList.toggle("ferry", !!r.ferry);
    len = route.getTotalLength(); dist = K.REDUCED ? len * .55 : 0; dir = 1; hold = animate ? 1300 : 600;
    ripples.forEach(function (o) { o.age = 1e9; o.c.setAttribute("opacity", 0); });
    /* линия маршрута прорисовывается, пока камера летит */
    if (animate && !K.REDUCED && !K.still) {
      route.style.transition = "none"; route.style.strokeDasharray = len + " " + (len + 10); route.style.strokeDashoffset = len;
      route.getBoundingClientRect(); route.style.transition = "stroke-dashoffset 1.6s cubic-bezier(.65,0,.35,1) .25s"; route.style.strokeDashoffset = 0;
    } else { route.style.transition = "none"; route.style.strokeDasharray = ""; route.style.strokeDashoffset = ""; }
    gStops.textContent = "";
    r.s.forEach(function (s, i) { var p = pt(s[0]); el("circle", { "class": "stop" + (i === 0 || i === r.s.length - 1 ? " end" : ""), cx: p[0], cy: p[1] }, gStops); });
    $("#r-title").textContent = r.n;
    var km = r.s[r.s.length - 1][1];
    $("#r-meta").textContent = (km ? km + " км · " : "") + (r.ferry ? "Переправа, " : "Судно в 2026 году: ") + r.v;
    var ol = $("#r-stops"); ol.textContent = "";
    r.s.forEach(function (s) { var li = d.createElement("li"), a = d.createElement("span"), b = d.createElement("span"); a.textContent = name(s[0]); b.textContent = s[1] === null ? "место погрузки" : s[1] + " км"; li.append(a, b); ol.appendChild(li); });
    ol.scrollTop = 0;
    $("#r-closed").textContent = r.c;
    $$("#routes button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.n === r.n); });
    measure();
    draw(animate);
    if (!K.REDUCED) arriveQuiet(0);
  }
  /* отметить пристань без кольца (старт маршрута) */
  function arriveQuiet(i) { var li = $("#r-stops").children[i]; $$("#r-stops li.at").forEach(function (x) { x.classList.remove("at"); }); if (li) li.classList.add("at"); }

  function group(g, animate) {
    var box = $("#routes"); box.textContent = ""; box.scrollTop = 0;
    g.r.forEach(function (r) {
      var b = d.createElement("button"); b.type = "button"; b.textContent = r.short || r.n; b.dataset.n = r.n;
      b.addEventListener("click", function () { select(r, true); }); box.appendChild(b);
    });
    $$("#groups button").forEach(function (b) { b.setAttribute("aria-pressed", b.textContent === g.g); });
    select(g.r[0], animate);
  }
  G.forEach(function (g) {
    var b = d.createElement("button"); b.type = "button"; b.textContent = g.g;
    b.addEventListener("click", function () { group(g, true); }); $("#groups").appendChild(b);
  });
  $("#all").addEventListener("click", function () { overview = !overview; this.setAttribute("aria-pressed", overview); draw(true); });

  group(G[0], false);
  /* проверка данных: у каждой пристани маршрута есть координаты, километры не убывают */
  G.forEach(function (g) { g.r.forEach(function (r) { var last = -1; r.s.forEach(function (s) { pt(s[0]); if (s[1] !== null) { console.assert(s[1] >= last, "км убывают", r.n, s[0]); last = s[1]; } }); (r.p || []).forEach(pt); }); });
  window.SF = { groups: G, state: function () { return { route: cur.n, dist: dist, len: len, overview: overview }; } };

  /* теплоход ходит туда и обратно, пока схема на экране; стоп-кран и reduced motion учитывает KIT.raf */
  K.raf(svg, function (t, dt) {
    if (!cur || !dt) return;
    /* волна: кольца расходятся и гаснут */
    ripples.forEach(function (o) {
      if (o.age > 2000) return; o.age += dt;
      var q = o.age / 2000; o.c.setAttribute("r", k * (3 + 15 * (1 - Math.pow(1 - q, 2)))); o.c.setAttribute("opacity", Math.max(0, .5 * (1 - q)));
    });
    if (hold > 0) { hold -= dt; place(dt); return; }
    /* разгон от пристани и торможение к концу пути */
    var ramp = Math.min(len * .2, speed * 1.8), edge = Math.min(dist, len - dist), v = speed * Math.max(.14, Math.min(1, edge / ramp));
    var prev = dist; dist += dir * v * dt / 1000;
    if (dist >= len) { dist = len; } else if (dist <= 0) { dist = 0; }
    stopL.forEach(function (L, i) { if ((dir > 0 && prev < L - .01 && dist >= L - .01) || (dir < 0 && prev > L + .01 && dist <= L + .01)) arrive(i); });
    if (dist === len || dist === 0) { dir = dist ? -1 : 1; hold = 1800; $$("#chart .stop.passed").forEach(function (c) { c.classList.remove("passed"); }); }
    place(dt);
    ripT += dt;
    if (ripT > 420 && v > speed * .3) {
      ripT = 0; var o = ripples[rip++ % ripples.length], rad = ang * Math.PI / 180;
      o.age = 0; o.c.setAttribute("cx", pos.x - Math.cos(rad) * 15 * k); o.c.setAttribute("cy", pos.y - Math.sin(rad) * 15 * k);
    }
  }, 60);
  var rt; addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { draw(false); }, 150); });
  d.fonts && d.fonts.ready.then(function () { draw(false); });
})();
