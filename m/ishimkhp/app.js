/* Смысловые интерактивы: «Что вам нужно» (механика Segmented Tabs 21st), путь зерна (scrub), фасовка в масштабе, летопись (механика Interactive Timeline 21st), копирование. */
(function () {
"use strict";
var d = document, $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
var calm = matchMedia("(prefers-reduced-motion:reduce)");

/* ---- копирование реквизитов ---- */
$$("[data-copy]").forEach(function (b) {
  b.addEventListener("click", function () {
    var t = b.textContent, done = function () { b.textContent = "Скопировано"; b.classList.add("ok"); setTimeout(function () { b.textContent = t; b.classList.remove("ok"); }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copy).then(done, done); else done();
  });
});

/* ---- «Что вам нужно»: выбранная плашка едет к вкладке, мягкая подсветка следует за курсором ---- */
(function () {
  var seg = $(".seg"); if (!seg) return;
  var tabs = $$("[role=tab]", seg), sel = $(".seg-sel", seg), hov = $(".seg-hov", seg);
  function place(el, b) { el.style.width = b.offsetWidth + "px"; el.style.height = b.offsetHeight + "px"; el.style.transform = "translate(" + b.offsetLeft + "px," + b.offsetTop + "px)"; }
  function pick(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i, p = d.getElementById(t.getAttribute("aria-controls"));
      t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
      if (on && p.hidden) {
        p.hidden = false; p.classList.add("enter");
        $$(".ticks li", p).forEach(function (li, n) { li.style.setProperty("--n", n); });
        requestAnimationFrame(function () { requestAnimationFrame(function () { p.classList.remove("enter"); }); });
        if (window.gsap && !calm.matches) gsap.from(p.children, { y: 14, opacity: 0, duration: .55, stagger: .08, ease: "power3.out", clearProps: "all" });
      } else if (!on) p.hidden = true;
    });
    place(sel, tabs[i]); if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { pick(i); });
    t.addEventListener("pointerenter", function (e) { if (e.pointerType === "touch") return; place(hov, t); seg.classList.add("hovering"); });
    t.addEventListener("keydown", function (e) {
      var n = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (n === undefined) return; e.preventDefault(); pick((n + tabs.length) % tabs.length, true);
    });
  });
  seg.addEventListener("pointerleave", function () { seg.classList.remove("hovering"); });
  addEventListener("resize", function () { place(sel, tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0]); });
  place(sel, tabs[0]); if (d.fonts) d.fonts.ready.then(function () { place(sel, tabs[0]); });
})();

/* ---- фасовка в масштабе ---- */
(function () {
  var cap = $(".scale-cap"); if (!cap) return;
  var txt = { 50: "Мешок 50 кг — полипропиленовый, высший и первый сорт", 10: "Мешок 10 кг — полипропиленовый, высший сорт", 5: "Мешок 5 кг — полипропиленовый, высший сорт", 2: "Бумажный пакет 2 кг — высший сорт", 1: "Бумажный пакет 1 кг — высший сорт" };
  var gs = $$(".sacks-svg g[data-k]"), chips = $$(".chips button");
  function show(k, src) {
    gs.forEach(function (g) { g.classList.toggle("on", g.dataset.k === k); });
    chips.forEach(function (c) { c.setAttribute("aria-pressed", c === src || (!src && c.dataset.k === k && c.closest(".pcard") === chips[0].closest(".pcard"))); });
    cap.textContent = txt[k];
  }
  chips.forEach(function (c) { c.addEventListener("click", function () { show(c.dataset.k, c); }); });
  gs.forEach(function (g) { g.style.cursor = "pointer"; g.addEventListener("click", function () { show(g.dataset.k); }); });
  show("50", chips[0]);
})();

/* ---- летопись: годы, полоса прогресса, смена кадра ---- */
(function () {
  var box = $(".tl"); if (!box) return;
  var Y = [
    ["1914", "Мельница купца Кузнецова", "Начало работы мельницы купца Кузнецова, выпуск первой продукции. В 1914 году производительность мельницы составляла 48 тонн муки в сутки.", "img/mill1920.webp", "Здание мельницы, архивное фото с сайта комбината"],
    ["1922", "Отделение «Хлебопродукт»", "Для восстановления мельницы с железной дороги сняли паровоз и поставили основным двигателем — 14 февраля 1922 года мельница пущена. 2 августа в Ишиме организовано отделение «Хлебопродукт»: с этой даты комбинат ведёт свою историю."],
    ["1929", "Деревянный элеватор", "Построен деревянный элеватор ёмкостью 3350 тонн."],
    ["1932", "Заезжий дом хлебосдатчиков", "Для хозяйств, привозивших зерно, построен заезжий дом хлебосдатчиков.", "img/house1932.webp", "Заезжий дом хлебосдатчиков, 1932 год, архивное фото"],
    ["1954", "Новый элеватор", "Введены в эксплуатацию новый элеватор, силосный корпус и электростанция."],
    ["1958", "Ишимский мелькомбинат", "Элеватор «Заготзерно» объединён с Ишимским мельзаводом № 10 треста «Главмука» — создано единое предприятие «Ишимский мелькомбинат»."],
    ["1962", "Овёс для Монголии", "Мельзавод выполнил правительственный заказ на поставку партии овса в Монголию. По инвентаризации у мелькомбината — 34 нории, 11 самоходных зернопогрузчиков, 512 электромоторов.", "img/veterans.webp", "Работники комбината, архивное фото"],
    ["1972", "Комбинат хлебопродуктов", "Мелькомбинат переименован в комбинат хлебопродуктов в статусе филиала ОАО «Тюменьхлебопродукт»."],
    ["1975", "Силосные корпуса", "Введены в эксплуатацию силосные корпуса; годом раньше — комплекс мельничного элеватора."],
    ["1997", "Реконструкция мельниц", "Проведена реконструкция мельниц. В 1991 году принято дробильное отделение комбикормового завода."],
    ["2011", "Самостоятельное предприятие", "Комбинат стал самостоятельным предприятием — ООО «Ишимский комбинат хлебопродуктов» во главе с генеральным директором Юрием Михайловичем Рожковым."],
    ["2022", "Сто лет", "2 августа 2022 года Ишимскому комбинату хлебопродуктов исполнилось 100 лет."]
  ];
  var bar = $(".tl-years", box), stage = $(".tl-stage", box), fig = $(".tl-ph", box), img = $("img", fig), yEl = $(".tl-y", box), h = $("h3", stage), p = $(".tl-d", stage), fill = $(".tl-bar i", box);
  var btns = Y.map(function (y, i) {
    var b = d.createElement("button"); b.type = "button"; b.setAttribute("role", "tab"); b.textContent = y[0]; b.className = "num";
    b.addEventListener("click", function () { go(i); });
    b.addEventListener("keydown", function (e) { var n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: Y.length - 1 }[e.key]; if (n === undefined) return; e.preventDefault(); go(Math.max(0, Math.min(Y.length - 1, n)), true); });
    bar.appendChild(b); return b;
  });
  var cur = -1, tm = 0;
  function fillIn(i) {
    var y = Y[i]; yEl.textContent = y[0]; h.textContent = y[1]; p.textContent = y[2];
    fig.dataset.y = y[0]; fig.classList.toggle("plate", !y[3]);
    if (y[3]) { img.src = y[3]; img.alt = y[4]; } else img.alt = "";
  }
  function go(i, focus) {
    if (i === cur) return; cur = i;
    btns.forEach(function (b, k) { b.setAttribute("aria-selected", k === i); b.tabIndex = k === i ? 0 : -1; });
    var b = btns[i]; fill.style.setProperty("--p", ((b.offsetLeft + b.offsetWidth / 2) / bar.scrollWidth).toFixed(3));
    bar.scrollTo({ left: b.offsetLeft - bar.clientWidth / 2 + b.offsetWidth / 2, behavior: calm.matches ? "auto" : "smooth" });
    if (focus) b.focus({ preventScroll: true });
    clearTimeout(tm);
    if (calm.matches || !yEl.textContent) return fillIn(i);
    stage.classList.add("swap"); tm = setTimeout(function () { fillIn(i); stage.classList.remove("swap"); }, 320);
  }
  $(".tl-prev", box).addEventListener("click", function () { go(Math.max(0, cur - 1)); });
  $(".tl-next", box).addEventListener("click", function () { go(Math.min(Y.length - 1, cur + 1)); });
  go(0);
})();

/* ---- путь зерна: scrub-сцена (pin на ПК, собранная схема на телефоне и при reduced motion) ---- */
(function () {
  var sec = $(".path"); if (!sec) return;
  var lis = $$(".steps li", sec), rail = $$(".rail button", sec), sts = $$(".st", sec), cur = -1;
  var bounds = [0, .16, .34, .62, .84]; // доля пути зерна, где начинается этап
  var mids = [.05, .25, .48, .73, .95];
  function step(i) {
    if (i === cur) return; cur = i;
    lis.forEach(function (l, k) { l.classList.toggle("on", k === i); });
    rail.forEach(function (b, k) { b.setAttribute("aria-pressed", k === i); });
    sts.forEach(function (s, k) { s.classList.toggle("lit", k <= i); });
  }
  sts.forEach(function (s) { s.classList.add("lit"); });
  if (!window.gsap || !window.ScrollTrigger || !window.MotionPathPlugin) return;
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);
  var st = null;
  rail.forEach(function (b, i) {
    b.addEventListener("click", function () {
      if (!st) return; var y = st.start + (st.end - st.start) * mids[i];
      if (window.KIT && KIT.lenis) KIT.lenis.scrollTo(y, { duration: 1.4 }); else scrollTo({ top: y, behavior: calm.matches ? "auto" : "smooth" });
    });
  });
  var mm = gsap.matchMedia();
  mm.add("(min-width:901px) and (prefers-reduced-motion:no-preference)", function () {
    sec.classList.add("is-live"); cur = -1; step(0);
    var tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
      trigger: sec, start: "top top", end: "+=420%", pin: true, scrub: .8, anticipatePin: 1,
      onUpdate: function (s) { var p = s.progress, i = 0; for (var k = 0; k < bounds.length; k++) if (p >= bounds[k]) i = k; step(i); }
    } });
    st = tl.scrollTrigger;
    tl.fromTo(".plant .flow-done", { drawSVG: "0%" }, { drawSVG: "100%", duration: 10 }, 0)
      .fromTo(".plant .grain-dot", { opacity: 1 }, { motionPath: { path: "#flow", align: "#flow", alignOrigin: [.5, .5], autoRotate: true }, duration: 10 }, 0)
      .fromTo(".plant .silos .fill", { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 1.6, stagger: .35, ease: "power1.inOut" }, 3.4)
      .fromTo(".plant .st-3 .win", { opacity: .2 }, { opacity: .9, duration: 1 }, 6.4)
      .fromTo(".plant .sacks rect", { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .25, ease: "power2.out" }, 8.8)
      .to({}, { duration: .6 });
    return function () { sec.classList.remove("is-live"); st = null; sts.forEach(function (s) { s.classList.add("lit"); }); };
  });
})();
})();
