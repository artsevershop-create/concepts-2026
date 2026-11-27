/* Сцена «Ямальская магистраль»: схема линии (не в масштабе), состав идёт по прокрутке, станции выбираются кликом, касанием и стрелками.
   Тексты карточек — со страниц yrw.ru/about/railway-stations, /about/scheme, /about, /services. */
(function () {
  "use strict";
  var d = document, sec = d.querySelector(".line"); if (!sec) return;
  var OWN = {
    rzd: "Участок — собственность ОАО «РЖД»",
    gdu: "Новый Уренгой — Еваяха: собственность ООО «Газпром добыча Уренгой». Дальше на Ямбург станции Селькупская, Тосовэй и Ямбург временно закрыты",
    gpn: "Пангоды — Надым-Пристань: собственность ООО «Газпром перевозки Надым», с 01.03.2023 — строительство и реконструкция участка"
  };
  var ST = [
    { id: "korot", n: "Коротчаево", km: "577 км", x: 1120, y: 330, open: 1, big: 1, lab: "up", img: "st-korotchaevo", own: "rzd", alt: "Вокзал станции Коротчаево",
      t: ["Пункт примыкания к Свердловской железной дороге — здесь линия входит в сеть РЖД", "Самая крупная грузопассажирская станция ЯЖДК, опорная для Парка Тихая и разъезда Тыдыл", "Локомотивное депо: ремонт тепловозов ТЭМ2 и ТЭ3, пункт текущего отцепочного ремонта вагонов", "Вокзал сдан 15 сентября 2003 года, построен на средства ЯНАО"] },
    { id: "tydyl", n: "Тыдыл", km: "597 км", x: 1010, y: 316, lab: "dn", img: "tidil", own: "rzd", alt: "Разъезд Тыдыл",
      t: ["Разъезд введён в эксплуатацию компанией", "Пропускная способность участка Коротчаево — Новый Уренгой выросла до 12,5 пар поездов в сутки", "Впервые на полигоне — бетонные шпалы, рельсы Р‑65 и безлюдное управление устройствами СЦБ"] },
    { id: "nart", n: "Нартовая", km: "615 км", x: 930, y: 292, lab: "up", img: "st-nartovaya", own: "rzd", alt: "Станция Нартовая",
      t: ["Промежуточная станция, введена в феврале 1982 года", "Приём, отправление и пропуск поездов", "Подача вагонов клиентам ЯЖДК на пути необщего пользования"] },
    { id: "faraf", n: "Фарафонтьевская", km: "630 км", x: 850, y: 272, open: 1, lab: "dn", img: "st-faraf", own: "rzd", alt: "Станция Фарафонтьевская",
      t: ["Основная станция компании по погрузке нефтеналивных грузов", "Грузовая, опорная для подачи и уборки вагонов на Нартовую", "Административно-бытовое здание ЯЖДК — с ноября 2012 года"] },
    { id: "nur", n: "Новый Уренгой", km: "801 км / 651 км", x: 745, y: 250, open: 1, big: 1, lab: "ul", img: "st-nur", own: "rzd", alt: "Вокзал станции Новый Уренгой",
      t: ["Участковая станция на три направления: Коротчаево, Ямбург, Пангоды — Надым-Пристань", "Здесь перерабатывается треть всего грузопотока полигона", "Участок погрузо-разгрузочных работ: грузовой двор и контейнерная площадка", "Оборот пассажирских поездов — 5 пар в сутки, вокзал 2015 года"] },
    { id: "evay", n: "Еваяха", km: "11 км", x: 705, y: 92, open: 1, lab: "r", img: "st-evayaha", own: "gdu", alt: "Станция Еваяха",
      t: ["Первая промежуточная станция на линии Новый Уренгой — Ямбург, грузовая", "К станции примыкает ремонтная база РММ ЯЖДК", "В 2012 году восстановлен путь № 40‑а на 16 вагонов для выгрузки сыпучих грузов"] },
    { id: "yagel", n: "Ягельная", km: "792 км", x: 640, y: 256, open: 1, lab: "dn", img: "st-yagel", own: "rzd", alt: "Станция Ягельная",
      t: ["Промежуточная станция в черте Нового Уренгоя, у аэропорта", "В ноябре 1982 года здесь дорогу от Коротчаево состыковали со старой надымской, восстановленной по трассе 501-й стройки", "Вахтовый комплекс ЯЖДК"] },
    { id: "pang", n: "Пангоды", km: "687 км", x: 430, y: 333, open: 1, big: 1, lab: "up", img: "st-pangody", own: "rzd", alt: "Станция Пангоды",
      t: ["Грузовая станция, под управлением компании с 1 декабря 2004 года", "С 2006 года обеспечивает грузами стройки, в том числе трассы Сургут — Салехард", "«Пангоды» в переводе с ненецкого — «олений мох»"] },
    { id: "vesel", n: "Весёлый", km: "617 км", x: 290, y: 372, lab: "dn", img: "", own: "gpn",
      t: ["Разъезд на участке Пангоды — Надым-Пристань", "Сейчас движение по участку осуществляется до разъезда Весёлый"] },
    { id: "nadym", n: "Надым-Пристань", km: "573 км", x: 150, y: 392, lab: "up", img: "st-nadym", own: "gpn", alt: "Станция Надым-Пристань",
      t: ["Тупиковая грузовая станция, в структуре ЯЖДК с 1 марта 2006 года", "С 2012 года — выгрузка грузов для Северного широтного хода, в том числе для мостового перехода через Надым", "Сейчас станция временно закрыта"] }
  ];
  var STOPS = [
    { t: "Коротчаево", id: "korot" },
    { t: "До Нового Уренгоя", id: "faraf" },
    { t: "Новый Уренгой", id: "nur" },
    { t: "Линия на Пангоды", id: "pang" },
    { t: "До разъезда Весёлый", id: "vesel" }
  ];
  var byId = {}; ST.forEach(function (s) { byId[s.id] = s; });

  /* --- разметка станций и участков --- */
  var box = sec.querySelector(".stations"), stopsEl = sec.querySelector(".stops");
  ST.forEach(function (s) {
    var b = d.createElement("button"); b.type = "button"; b.className = "stn" + (s.open ? " open" : "") + (s.big ? " big" : "") + (s.lab === "up" ? " up" : "") + (s.lab === "r" ? " r" : "") + (s.lab === "ul" ? " ul" : "");
    b.style.left = (s.x / 12) + "%"; b.style.top = (s.y / 5.2) + "%"; b.dataset.id = s.id; b.dataset.cur = "Станция";
    b.setAttribute("aria-label", s.n + ", " + s.km + (s.open ? ", открыта для грузовых операций" : ", не открыта для грузовых операций"));
    b.innerHTML = '<span class="stn-l" aria-hidden="true"><b>' + s.n + "</b><small>" + s.km + "</small></span>";
    box.appendChild(b); s.btn = b;
  });
  STOPS.forEach(function (p, i) {
    var li = d.createElement("li"), b = d.createElement("button"); b.type = "button"; b.textContent = p.t; b.dataset.i = i; li.appendChild(b); stopsEl.appendChild(li); p.btn = b;
  });
  var grid = sec.querySelector(".m-grid"), NS = "http://www.w3.org/2000/svg";
  for (var gx = 0; gx <= 1200; gx += 50) { var l = d.createElementNS(NS, "line"); l.setAttribute("x1", gx); l.setAttribute("x2", gx); l.setAttribute("y1", 0); l.setAttribute("y2", 520); grid.appendChild(l); }

  /* --- карточка --- */
  var card = sec.querySelector(".card"), cPh = card.querySelector(".card-ph"), cImg = cPh.querySelector("img"),
      cKm = card.querySelector(".card-km"), cH = card.querySelector(".card-h"), cSt = card.querySelector(".card-st"), cDo = card.querySelector(".card-do"), cOwn = card.querySelector(".card-own");
  var shown = null, swapT = 0;
  function fill(s) {
    cKm.textContent = s.km; cH.textContent = s.n;
    cSt.textContent = s.open ? "Открыта для грузовых операций" : "Не открыта для грузовых операций";
    cSt.style.setProperty("--c", s.open ? "var(--rzd)" : "var(--muted-n)");
    cDo.textContent = ""; s.t.forEach(function (x) { var li = d.createElement("li"); li.textContent = x; cDo.appendChild(li); });
    cOwn.textContent = OWN[s.own];
    if (s.img) { cPh.classList.remove("empty"); cImg.src = "img/" + s.img + ".webp"; cImg.alt = s.alt || s.n; } else { cPh.classList.add("empty"); cImg.removeAttribute("src"); cImg.alt = ""; }
  }
  function show(id, instant) {
    var s = byId[id]; if (!s || shown === id) return; shown = id;
    ST.forEach(function (x) { x.btn.classList.toggle("on", x.id === id); x.btn.setAttribute("aria-pressed", x.id === id); });
    clearTimeout(swapT);
    if (instant || KIT.REDUCED) { fill(s); return; }
    card.classList.add("swap"); cImg.classList.add("swap");
    swapT = setTimeout(function () { fill(s); card.classList.remove("swap"); requestAnimationFrame(function () { cImg.classList.remove("swap"); }); }, 230);
  }
  function markStop(i) { STOPS.forEach(function (p, k) { p.btn.setAttribute("aria-current", k === i ? "true" : "false"); }); }
  fill(byId.korot); shown = "korot"; byId.korot.btn.classList.add("on"); markStop(0);

  /* --- геометрия пути: подход с юга (от сети РЖД) + линия до Весёлого --- */
  var mPath = sec.querySelector("#m-path"), branch = sec.querySelector(".m-done-b");
  var D = "M1120 440 L1120 330 " + mPath.getAttribute("d").replace(/^M\s*1120 330/, "");
  var train = sec.querySelector(".train"), loco = train.querySelector(".loco"), cars = [".c1", ".c2", ".c3"].map(function (c) { return train.querySelector(c); });
  var raw = null, L = 0, STUB = 110, mLen = mPath.getTotalLength(), GAP = 30;
  function fracOf(x, y) { // ближайшая точка пути к станции (по длине)
    var best = 1e9, bf = 0, tmp = d.createElementNS(NS, "path"); tmp.setAttribute("d", D); var tl = tmp.getTotalLength();
    for (var u = 0; u <= tl; u += 2) { var p = tmp.getPointAtLength(u), q = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y); if (q < best) { best = q; bf = u / tl; } }
    return best < 400 ? bf : null;
  }
  function geom() {
    if (!window.MotionPathPlugin) return;
    raw = MotionPathPlugin.stringToRawPath(D); MotionPathPlugin.cacheRawPathMeasurements(raw); L = raw.totalLength;
    ST.forEach(function (s) { s.f = fracOf(s.x, s.y); });
  }
  var car = { f: 0 };
  function place() { // состав на пути: тепловоз впереди, вагоны отстают на GAP
    if (!raw) return;
    var parts = [loco].concat(cars);
    parts.forEach(function (el, k) {
      var f = Math.max(0, car.f - (k * GAP) / L), p = MotionPathPlugin.getPositionOnPath(raw, f, true);
      el.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ") rotate(" + p.angle.toFixed(1) + ")");
    });
    var done = Math.max(0, car.f * L - STUB); mPath.style.strokeDasharray = mLen; mPath.style.strokeDashoffset = Math.max(0, mLen - done);
  }
  function autoStation() { // последняя станция, которую прошёл состав
    var cur = "korot"; ST.forEach(function (s) { if (s.f != null && s.f <= car.f + .004 && s.f >= byId[cur].f) cur = s.id; }); return cur;
  }

  /* --- режимы: прокрутка (широкий экран, с движением) и собранная схема (телефон, reduced) --- */
  var lockUntil = 0, mode = "static", tl = null, stopT = [], lastAuto = "korot";
  function staticMode(motion) {
    mode = "static"; car.f = byId[shown].f != null ? byId[shown].f : byId.korot.f; place();
    mPath.style.strokeDashoffset = 0; branch.style.opacity = 1;
    if (motion && window.gsap && window.DrawSVGPlugin) {
      gsap.from(sec.querySelectorAll(".m-seg"), { drawSVG: 0, duration: 1.6, ease: "power2.inOut", stagger: .15, scrollTrigger: { trigger: sec, start: "top 70%", once: true } });
    }
  }
  function moveTo(id) { // ручное управление в собранной схеме: состав едет к станции
    var s = byId[id], tf = s.f != null ? s.f : (id === "evay" ? byId.nur.f : byId.vesel.f);
    if (window.gsap && !KIT.REDUCED) gsap.to(car, { f: tf, duration: 1.1, ease: "power2.inOut", onUpdate: place, overwrite: true });
    else { car.f = tf; place(); }
  }
  function pinMode() {
    mode = "pin";
    var segs = sec.querySelectorAll(".m-seg");
    tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: sec, start: "top top", end: "+=" + (STOPS.length * 105) + "%", pin: true, scrub: .7, anticipatePin: 1,
    } });
    car.f = 0; mPath.style.strokeDashoffset = mLen;
    tl.fromTo(segs, { drawSVG: "0%" }, { drawSVG: "100%", duration: .9, stagger: .12 }, 0)
      .from(sec.querySelectorAll(".stn"), { autoAlpha: 0, scale: .4, duration: .5, stagger: .05 }, .2)
      .fromTo(car, { f: 0 }, { f: byId.korot.f, duration: .6 }, .5)
      .set(branch, { drawSVG: "0%" }, 0);
    stopT = [tl.duration()]; tl.to({}, { duration: 1.1 });
    for (var i = 1; i < STOPS.length; i++) {
      var s = byId[STOPS[i].id];
      tl.to(car, { f: s.f, duration: 1.4 });
      stopT.push(tl.duration());
      if (s.id === "nur") tl.fromTo(branch, { drawSVG: "0%" }, { drawSVG: "100%", duration: .9, ease: "power1.inOut" }).to({}, { duration: .4 });
      else tl.to({}, { duration: 1.1 });
    }
    tl.eventCallback("onUpdate", function () {
      place(); var a = autoStation();
      if (a !== lastAuto) { lastAuto = a; if (performance.now() > lockUntil) show(a); }
      var t = tl.time(), i = 0; stopT.forEach(function (st, k) { if (t >= st - .9) i = k; }); markStop(i);
    });
  }
  function timeFor(id) { // время на таймлайне, когда состав у станции
    var s = byId[id]; if (s.f == null) return stopT[id === "evay" ? 2 : 4] + .5;
    var k = 0; STOPS.forEach(function (p, i) { if (byId[p.id].f <= s.f + 1e-6) k = i; });
    if (byId[STOPS[k].id].f === s.f || k === STOPS.length - 1) return stopT[k] + .3;
    var a = byId[STOPS[k].id].f, b = byId[STOPS[k + 1].id].f, moveStart = stopT[k + 1] - 1.4;
    return moveStart + (s.f - a) / (b - a) * 1.4;
  }
  function scrollToTime(t) {
    var st = tl.scrollTrigger, y = st.start + (st.end - st.start) * (t / tl.duration());
    lockUntil = performance.now() + 2200; if (KIT.lenis) KIT.lenis.scrollTo(y, { duration: 1.4 }); else scrollTo({ top: y, behavior: "smooth" });
  }
  function pick(id) {
    if (mode === "pin" && tl) {
      var s = byId[id]; lastAuto = s.f == null ? (id === "evay" ? "nur" : "vesel") : id;
      show(id); scrollToTime(timeFor(id));
    } else { show(id); moveTo(id); }
  }
  box.addEventListener("click", function (e) { var b = e.target.closest(".stn"); if (b) pick(b.dataset.id); });
  box.addEventListener("keydown", function (e) {
    var b = e.target.closest(".stn"); if (!b || (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowDown" && e.key !== "ArrowUp")) return;
    e.preventDefault(); var i = ST.indexOf(byId[b.dataset.id]), n = ST[(i + (e.key === "ArrowLeft" || e.key === "ArrowUp" ? 1 : -1) + ST.length) % ST.length]; // стрелка влево — дальше на запад
    n.btn.focus(); pick(n.id);
  });
  stopsEl.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return; var p = STOPS[+b.dataset.i];
    if (mode === "pin" && tl) { lastAuto = p.id; show(p.id); scrollToTime(stopT[+b.dataset.i] + .3); } else { markStop(+b.dataset.i); pick(p.id); }
  });

  function init() {
    geom();
    if (!window.gsap || !window.ScrollTrigger || !window.DrawSVGPlugin) { staticMode(false); return; }
    gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);
    var mm = gsap.matchMedia();
    mm.add({ pin: "(min-width:1024px) and (min-height:620px) and (prefers-reduced-motion:no-preference)", motion: "(prefers-reduced-motion:no-preference)" }, function (ctx) {
      if (ctx.conditions.pin) pinMode(); else staticMode(ctx.conditions.motion);
      return function () { tl = null; mode = "static"; KIT.REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches; };
    });
  }
  if (window.KIT) init(); else d.addEventListener("kit:ready", init);
})();
