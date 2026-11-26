/* Маршрут заявки и подбор территории. Все формулировки — с utek-rs.ru (разделы «Потребителям», «Контакты»). */
(function () {
  "use strict";
  var d = document, $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  /* неразрывные пробелы после коротких слов и между числом и единицей (для строк из JS) */
  function nb(s) {
    return s.replace(/(^|[\s(«>])(в|и|к|с|о|у|а|я|на|по|за|из|до|от|не|но|со|во|об|для|без|при)\s+/gi, "$1$2 ")
      .replace(/(\d) (?=(кВт|МВт|км|дней|рабочих|календарных|экземплярах|года|—))/g, "$1 ");
  }

  var LK = "https://lk.utek-rs.ru/", DOCS = "https://utek-rs.ru/images/docs/";
  function file(path, label) { return '<a class="file" href="' + DOCS + path + '" target="_blank" rel="noopener">' + label + "</a>"; }

  var FORM150 = ["Techplus/2020/zayvka150kv.doc", "По одному источнику, до 150 кВт"];
  var TYPES = {
    fl15: { who: "Частное лицо, до 15 кВт",
      about: "Физическое лицо: мощность до 15 кВт включительно вместе с уже присоединённой в этой точке, для бытовых и иных нужд, не связанных с предпринимательством, по одному источнику электроснабжения.",
      form: ["Techplus/2020/zayvka_butovux.doc", "Физлицо, до 15 кВт, бытовые нужды"], contract: ["Dogovor/2020/forma1.docx", "Типовой договор: физлицо до 15 кВт"], way: "lk" },
    biz15: { who: "ИП или организация, до 15 кВт",
      about: "Юридическое лицо или индивидуальный предприниматель: мощность до 15 кВт включительно.",
      form: FORM150, contract: ["Dogovor/2020/forma2.docx", "Типовой договор: ИП и организации до 15 кВт"], way: "cat" },
    biz150: { who: "ИП или организация, 15–150 кВт",
      about: "Юридическое лицо или индивидуальный предприниматель: мощность от 15 до 150 кВт включительно.",
      form: FORM150, contract: ["Dogovor/2020/forma3.docx", "Типовой договор: от 15 до 150 кВт"], way: "cat" },
    biz670: { who: "ИП или организация, 150–670 кВт",
      about: "Юридическое лицо или индивидуальный предприниматель: мощность от 150 до 670 кВт включительно.",
      form: ["Techplus/2020/zayvka_na_prisoedinenie.doc", "На присоединение устройств"], contract: ["Dogovor/2020/forma4.docx", "Типовой договор: от 150 до 670 кВт"], way: "paper" },
    temp: { who: "Временное присоединение",
      about: "Временное присоединение энергопринимающих устройств. Подходит юридическим лицам, предпринимателям и физическим лицам: для них на сайте есть общая форма заявки.",
      form: ["Techplus/2020/zayvka_energo_ystr.doc", "На временное присоединение"], contract: ["Techplus/2020/uslovia.docx", "Условия типового договора о присоединении"], way: "ask" }
  };

  var WAY = {
    lk: { short: "в личный кабинет", text: "<p>Договор направляют в электронной форме: документы размещают в вашем личном кабинете.</p>" },
    cat: { short: "в кабинет — при II и III категории", text: "<p>При второй или третьей категории надёжности договор и документы размещают в личном кабинете. В остальных случаях сеть направляет подписанный ею проект договора в 2 экземплярах с техническими условиями в течение 20 рабочих дней после получения заявки.</p>" },
    paper: { short: "проектом с техусловиями за 20 рабочих дней", text: "<p>Сеть направляет заполненный и подписанный ею проект договора в 2 экземплярах и технические условия в течение 20 рабочих дней со дня получения заявки. Документами можно обмениваться и в электронной форме.</p>" },
    ask: { short: "порядок уточнить у куратора", text: "<p>Способ получения договора зависит от мощности и категории надёжности — уточните его у куратора своей территории. Отдельной формы договора для временного присоединения в разделе нет.</p>" }
  };

  var STEPS = [
    { name: "Заявитель", actor: "Ваш ход", shot: "ktp", lit: .4, title: "Определите, кто вы и какая нужна мощность",
      html: function (t) { return "<p>" + t.about + '</p><p>Не знаете мощность? <a href="' + LK + 'calculator" target="_blank" rel="noopener">Рассчитайте её в калькуляторе личного кабинета</a>.</p>'; } },
    { name: "Заявка", actor: "Ваш ход", shot: "ktp", lit: .52, title: "Заполните заявку и подайте её",
      html: function (t) {
        return file(t.form[0], "Форма заявки: " + t.form[1].charAt(0).toLowerCase() + t.form[1].slice(1)) +
          '<ul><li><a href="' + LK + '" target="_blank" rel="noopener">через личный кабинет</a>;</li><li>на почту <a href="mailto:info@utek-rs.ru">info@utek-rs.ru</a>;</li><li>письмом: 628011, г. Ханты-Мансийск, ул. Привольная, д. 15.</li></ul>' +
          (t.way === "lk" || t.way === "cat" ? "<p>До 150 кВт компания направляет всю документацию по присоединению в электронном виде через личный кабинет и рекомендует подавать заявку там же.</p>" : "");
      } },
    { name: "Договор", actor: "Ход сети, затем ваш", shot: "sot", lit: .66, title: "Получите и подпишите договор",
      html: function (t) { return WAY[t.way].text + file(t.contract[0], t.contract[1]) + "<p>Заключить договор сетевая организация обязана. Если она нарушит сроки присоединения из договора, вы вправе расторгнуть его в одностороннем порядке.</p>"; } },
    { name: "Работы", actor: "Работают обе стороны", shot: "work", lit: .8, title: "Выполните условия и вызовите на осмотр",
      html: function () { return "<p>Технические условия — приложение к договору. Присоединение объединяет технические работы и юридические процедуры и заканчивается фактическим подключением вашего объекта.</p><p>В ходе присоединения сеть устанавливает прибор учёта без оплаты. Выполнив свою часть, подайте заявление на осмотр.</p>" + file("Techplus/2021/znpz_.DOCX", "Заявление об осмотре и выдаче акта"); } },
    { name: "Акт", actor: "Ход сети", shot: "done", lit: 1, title: "Получите акты о присоединении",
      html: function (t) {
        return "<p>По вашему заявлению энергопринимающие устройства осматривают и выдают акт осмотра. Акт об осуществлении технологического присоединения подписывается в рамках договора.</p>" +
          (t.way === "lk" || t.way === "cat" ? "<p>Если документы размещали в личном кабинете, после завершения можно запросить их на бумаге: компания направит их в течение 10 календарных дней.</p>" : "");
      } }
  ];

  var rail = $(".rail"), shot = $(".shot"), body = $(".panel-body"), prev = $("[data-prev]"), next = $("[data-next]"), step = 0, type = "fl15";
  function route() {
    var t = TYPES[type], s = STEPS[step], last = step === STEPS.length - 1;
    body.classList.remove("swap"); void body.offsetWidth; body.classList.add("swap"); /* перезапуск въезда панели */
    $(".who", body).textContent = s.actor;
    $("h3", body).textContent = nb(s.title);
    $(".txt", body).innerHTML = nb(s.html(t));
    $$("button", rail).forEach(function (b, i) {
      var li = b.parentElement, state = i < step ? "пройден" : i === step ? "сейчас" : "впереди";
      li.className = i < step ? "is-done" : i === step ? "is-now" : "";
      $("em", b).textContent = state;
      if (i === step) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    rail.style.setProperty("--p", step / (STEPS.length - 1));
    shot.style.setProperty("--lit", s.lit);
    shot.classList.toggle("is-full", last);
    $$("figure", shot).forEach(function (f) { var on = f.dataset.shot === s.shot; f.classList.toggle("is-on", on); f.setAttribute("aria-hidden", !on); });
    $(".badge", shot).textContent = nb(last ? "Маршрут пройден: объект присоединён" : "Шаг " + (step + 1) + " из 5 · " + s.name.toLowerCase());
    var values = { 0: t.who, 1: t.form[1], 2: WAY[t.way].short, 4: last ? "акт — маршрут пройден" : "этап «" + s.name.toLowerCase() + "»" };
    $$("[data-cell]").forEach(function (c) {
      var i = +c.dataset.cell, known = i === 4 || step >= i;
      c.classList.toggle("wait", !known);
      $("dd", c).textContent = nb(known ? values[i] : "появится на шаге " + (i + 1));
    });
    prev.disabled = step === 0;
    next.textContent = last ? "Пройти сначала" : "Дальше: " + STEPS[step + 1].name.toLowerCase();
  }
  $$(".types input").forEach(function (r) { r.addEventListener("change", function () { type = r.value; route(); }); });
  var picked = $(".types input:checked"); if (picked) type = picked.value; /* браузер восстанавливает выбор после «назад» */
  $$("button", rail).forEach(function (b) { b.addEventListener("click", function () { step = +b.dataset.step; route(); }); });
  prev.addEventListener("click", function () { if (step) { step--; route(); if (!step) next.focus({ preventScroll: true }); } });
  next.addEventListener("click", function () { step = (step + 1) % STEPS.length; route(); });
  route();

  /* территории: кураторы — файл «opt-tel.pdf» (папка 2023 года), офисы — страница «Офисы обслуживания потребителей» */
  var CUR = {
    megion: ["г. Мегион, г. Нягань", "8-982-140-56-61", "118"],
    pyt: ["г. Пыть-Ях, г. Нефтеюганск", "8-982-570-31-79", "509"],
    hm: ["Ханты-Мансийский район, г. Ханты-Мансийск, г. Сургут", "8-982-200-45-79", "633"],
    okt: ["Октябрьский район, г. Лангепас", "8-982-140-56-31", "506"],
    nv: ["Нижневартовский район, г. Покачи, г. Когалым, г. Лянтор", "", "505"],
    urai: ["г. Урай, г. Югорск", "8-982-140-56-22", "712"]
  };
  /* [кнопка, куратор, организация, адрес, график, телефон, tel, почта] */
  var PLACES = [
    ["Ханты-Мансийск и район", "hm", "АО «РЭС-Сервис»", "г. Ханты-Мансийск, ул. Крупской, д. 25, кабинет 3", "8:30–18:00, обед 12:30–14:00", "8 (3467) 36-24-10, доб. 9123#", "+73467362410", "sekretar@res-service.org"],
    ["Сургут и Сургутский район", "hm", "АО «РЭС-Сервис»", "г. Сургут, ул. Западная, 1, корп. 3", "8:00–17:00, обед 12:00–13:00", "8 (952) 722-78-48", "+79527227848", "sekretar@res-service.org"],
    ["Нефтеюганск", "pyt", "АО «РЭС-Центр»", "г. Нефтеюганск, ул. Киевская, д. 10", "пн–чт 8:00–17:15, пт 8:00–12:00, обед 11:45–13:00", "8 (3463) 517-888", "+73463517888", "info-opnr@res-centr.ru"],
    ["Пыть-Ях", "pyt", "АО «РЭС-Центр»", "г. Пыть-Ях, мкр. 1 «Центральный», ул. Первопроходцев, д. 6", "8:00–17:00, обед 12:00–13:00", "8 (3463) 429-060", "+73463429060", "info-py@res-centr.ru"],
    ["Мегион", "megion", "АО «РЭС-Восток»", "г. Мегион, ул. Южная, д. 10", "8:00–17:00, обед 12:00–13:00", "8 (34643) 2-18-42", "+73464321842", "secretar@utek-langepas.ru"],
    ["Нягань", "megion", "АО «РЭС-Запад»", "г. Нягань, 7-й проезд, строение 1", "пн–чт 8:00–17:30, пт 8:00–12:00, обед 12:00–13:30", "8 (3467) 22-60-14", "+73467226014", "sekretar@res-n.ru"],
    ["Октябрьский район", "okt", "АО «РЭС-Запад»", "пгт Приобье, ул. Центральная, д. 1Б", "8:00–17:00, обед 12:00–13:00", "8 (34678) 3-35-15", "+73467833515", "info-okt@utek-energy.ru"],
    ["Лангепас", "okt", "АО «РЭС-Восток»", "г. Лангепас, ул. Первостроителей, д. 1", "8:00–17:00, обед 12:00–13:00", "8 (34669) 2-99-11", "+73466929911", "zariy@mail.ru"],
    ["Покачи", "nv", "АО «РЭС-Восток»", "г. Покачи, ул. Промышленная, 4", "8:00–17:30, обед 12:30–14:00", "8 (34669) 7-19-39", "+73466971939", "office-pk@utek-langepas.ru"],
    ["Когалым и Лянтор", "nv", "АО «РЭС-Сервис»", "г. Когалым, ул. Дружбы Народов, 17, кабинет 213", "пн–чт 8:30–18:00, обед 12:30–13:00, пт 8:30–12:30", "+7 (982) 180-12-33", "+79821801233", "secretar@res-srv.ru"],
    ["Нижневартовский район", "nv", "АО «ЮТЭК-Нижневартовский район»", "г. Нижневартовск, ул. Октябрьская, д. 54", "8:00–17:00, обед 12:00–13:00", "8 (3466) 21-48-03", "+73466214803", "office@utec-nvr.com"],
    ["Урай и Югорск", "urai", "АО «РЭС-Запад»", "г. Урай, ул. Сибирская, д. 2", "8:30–18:00, обед 12:00–13:18", "8 (34676) 212-16, доб. 101", "+73467621216", "mail@utek-energy.ru"]
  ];
  var chips = $(".chips"), select = $("#f-place");
  PLACES.forEach(function (p, i) {
    var b = d.createElement("button"); b.type = "button"; b.textContent = p[0]; b.addEventListener("click", function () { place(i); }); chips.appendChild(b);
    select.add(new Option(p[0]));
  });
  function place(i) {
    var p = PLACES[i], c = CUR[p[1]];
    $$("button", chips).forEach(function (b, n) { b.setAttribute("aria-pressed", n === i); });
    $(".cur-t").textContent = nb(c[0]);
    $(".cur-p").innerHTML = (c[1] ? '<a href="tel:+7' + c[1].replace(/\D/g, "").slice(1) + '">' + c[1] + "<small>мобильный</small></a>" : "") +
      '<a href="tel:+73467318118">318-118, доб. ' + c[2] + "<small>код +7 3467</small></a>";
    $(".off-org").textContent = p[2];
    var dl = $(".off-b dl"); dl.textContent = "";
    [["Адрес", p[3]], ["График", p[4]], ["Телефон", p[5], "tel:" + p[6]], ["Почта", p[7], "mailto:" + p[7]]].forEach(function (r) {
      var row = d.createElement("div"), dt = d.createElement("dt"), dd = d.createElement("dd"); dt.textContent = r[0];
      if (r[2]) { var a = d.createElement("a"); a.href = r[2]; a.textContent = r[1]; dd.appendChild(a); } else dd.textContent = nb(r[1]);
      row.append(dt, dd); dl.appendChild(row);
    });
    select.selectedIndex = i;
  }
  place(0);
})();
