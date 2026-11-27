/* Смысл страницы: часы диспетчерской, список работ с превью, сцена «Сезон зимника» (scrub), справочник зимников (ручной выбор). */
(function () {
"use strict";
var d = document, w = window;
var $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
var G = w.gsap, hasG = !!(G && w.ScrollTrigger);
if (hasG) G.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);
var calm = matchMedia("(prefers-reduced-motion:reduce)");
var SRC = "https://severavtodor.ru/123123123yo12/situacziya-na-dorogax/";

/* ---- часы в Сургуте (UTC+5): пишем в DOM только при смене минуты ---- */
var clock = $("[data-clock]");
if (clock) {
  var fmt = new Intl.DateTimeFormat("ru-RU", { timeZone: "Asia/Yekaterinburg", hour: "2-digit", minute: "2-digit" });
  var tick = function () { var v = fmt.format(new Date()); if (clock.textContent !== v) clock.textContent = v; };
  tick(); setInterval(tick, 15000);
}

/* ---- работы: наведение или фокус на строке меняет превью ---- */
var prev = $(".preview");
$$(".row").forEach(function (row, i) {
  function on() {
    $$(".row").forEach(function (r) { r.classList.toggle("is-on", r === row); });
    if (prev) $$("img", prev).forEach(function (im) { im.classList.toggle("on", im.dataset.k === row.dataset.k); });
  }
  row.addEventListener("pointerenter", on); row.addEventListener("focusin", on);
  if (!i) row.classList.add("is-on");
});

/* ---- сигнатурная сцена: сезон зимника по прокрутке (только широкий экран без reduced) ---- */
var sea = $(".season");
if (sea && hasG) {
  var mm = G.matchMedia();
  mm.add("(min-width:901px) and (prefers-reduced-motion:no-preference)", function () {
    sea.classList.remove("is-static");
    var steps = $$(".step", sea), bead = ".beacon, .beacon-glow";
    G.set(steps, { autoAlpha: 0, y: 18 }); G.set(steps[0], { autoAlpha: 1, y: 0 });
    G.set(".scene .ice", { opacity: 0 }); G.set(".scene .road-bed, .scene .cross-lbl", { opacity: 0 });
    G.set(".scene .sign", { scale: 0, transformOrigin: "50% 50%" }); G.set(".scene .closed", { autoAlpha: 0, y: -16 });
    G.set(bead, { autoAlpha: 0 }); G.set(".scene .crossing", { opacity: 0 });
    var tl = G.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: sea, pin: ".season-pin", start: "top top", end: "+=380%", scrub: .8, invalidateOnRefresh: true } });
    function swap(a, b, at) { tl.to(steps[a], { autoAlpha: 0, y: -14, duration: .3, ease: "power1.in" }, at).to(steps[b], { autoAlpha: 1, y: 0, duration: .4, ease: "power2.out" }, at + .25); }
    tl.to(".ruler-fill", { scaleX: .24, duration: 2.4 }, 0).to(".ruler-fill", { scaleX: .4, duration: 2.5 }, 2.4).to(".ruler-fill", { scaleX: .68, duration: 2.4 }, 4.9).to(".ruler-fill", { scaleX: .94, duration: 2.2 }, 7.3)
      // 1. река встаёт
      .from(".scene .ice-edge path", { drawSVG: "0%", duration: 1.4, stagger: .2, ease: "power1.inOut" }, .2)
      .to(".scene .ice", { opacity: 1, duration: 1.2 }, .7)
      .to(".scene .river-lbl", { opacity: 0, duration: .6 }, 1.4);
    swap(0, 1, 2.2);
    // 2. зимник прокладывают через переправу, по нему идёт машина
    tl.from(".scene .road", { drawSVG: "0%", duration: 2, ease: "power1.inOut" }, 2.4)
      .to(".scene .road-bed", { opacity: .14, duration: 1 }, 3)
      .set(".scene .crossing", { opacity: .9 }, 3.2).from(".scene .crossing", { drawSVG: "50% 50%", duration: 1, ease: "power2.out" }, 3.2)
      .to(".scene .cross-lbl", { opacity: 1, duration: .5 }, 3.8)
      .to(bead, { autoAlpha: 1, duration: .3 }, 2.7)
      .to(bead, { motionPath: { path: "#winterRoad", align: "#winterRoad", alignOrigin: [.5, .5], start: 0, end: 1 }, duration: 4.6, ease: "power1.inOut" }, 2.6);
    swap(1, 2, 4.9);
    // 3. оттепель: знаки ограничения массы
    tl.to(".scene .s1", { scale: 1, duration: .5, ease: "back.out(1.6)" }, 5.3)
      .to(".scene .s2", { scale: 1, duration: .5, ease: "back.out(1.6)" }, 5.6);
    swap(2, 3, 7.3);
    // 4. закрытие: лёд тает, дорога гаснет
    tl.to(bead, { autoAlpha: 0, duration: .4 }, 7.4)
      .to(".scene .road, .scene .crossing", { opacity: .3, duration: 1 }, 7.6)
      .to(".scene .ice", { opacity: .25, duration: 1.2 }, 7.7)
      .from(".scene .melt", { drawSVG: "0%", duration: 1, stagger: .15 }, 7.8)
      .to(".scene .closed", { autoAlpha: 1, y: 0, duration: .6, ease: "power2.out" }, 8)
      .to(".scene .sign", { opacity: .4, duration: .6 }, 8.1)
      .to({}, { duration: 1 }, 9);
    return function () { sea.classList.add("is-static"); };
  });
}

/* ---- справочник зимников (данные — из сообщений сайта за сезон 2024/25) ---- */
var DATA = [
  { t: "Березовский", s: "648931", items: [
    { n: ["пгт. Березово", "п. Ванзетур", "пгт. Игрим"], plus: "и «Подъезд к п. Ванзетур»", r: ["р. Северная Сосьва", "р. Северная Сосьва", "пр. Чуанельская"], last: "закрыт с 14:00 27.03.2025" },
    { n: ["пгт. Березово", "с. Теги", "п. Устрем"], plus: "и «Подъезд к п. Устрем»", r: ["р. Луговая Вогулка", "р. Горная Вогулка"], last: "закрыт с 8:00 29.03.2025" },
    { n: ["с. Теги", "граница ХМАО — Югры"], r: [], last: "закрыт с 8:00 29.03.2025" } ] },
  { t: "Кондинский", s: "pafip", items: [
    { n: ["пгт. Кондинский", "с. Болчары"], r: ["р. Конда"], last: "закрыт с 8:00 28.03.2025" },
    { n: ["с. Болчары", "с. Алтай", "д. Кама"], r: ["р. Конда", "р. Конда (д. Кама)"], last: "закрыт с 8:00 28.03.2025" },
    { n: ["пгт. Мортка", "п. Нижняя Тавда"], r: [], last: "закрыт с 8:00 28.03.2025" },
    { n: ["пгт. Кондинское", "д. Никулкина"], r: [], last: "закрыт с 8:00 28.03.2025" },
    { n: ["пгт. Междуреченский", "пгт. Кондинский"], plus: "и подъезды к д. Сотник, с. Ямки и д. Юмас", r: ["р. Конда (д. Ямки)", "р. Конда (д. Юмас)", "р. Конда (85 км)"], last: "закрыт с 8:00 28.03.2025" } ] },
  { t: "Октябрьский", s: "164986", items: [
    { n: ["пгт. Приобье", "с. Перегребное"], plus: "и «Подъезд к с. Перегребное»", r: ["пр. Ехалпосл", "пр. Ун-Хобыстпосл", "пр. Пугорас", "пр. Пугорас", "р. Обь"], last: "закрыт с 8:00 01.04.2025" },
    { n: ["п. Сергино", "пгт. Андра"], r: ["пр. Алешкинская", "р. Обь"], last: "закрыт с 8:00 01.04.2025" },
    { n: ["п. Урманный", "с. Каменное"], r: ["пр. Ендырская"], last: "закрыт с 8:00 01.04.2025" },
    { n: ["д. Нарыкары", "д. Мулигорт", "с. Перегребное"], r: ["пр. Мулигорт"], last: "закрыт с 8:00 01.04.2025" },
    { n: ["69 карьер", "с. Пальяново"], r: ["р. Ендырь"], last: "закрыт с 8:00 01.04.2025" },
    { n: ["левый берег", "правый берег"], name: "Переправа через р. Обь у с. Шеркалы", cross: 1, r: ["р. Обь"], last: "закрыта с 8:00 01.04.2025" },
    { n: ["подъезд", "с. Большой Атлым"], name: "Подъезд к с. Большой Атлым", r: ["р. Большой Атлым", "р. Малый Атлым"], last: "закрыт с 8:00 01.04.2025" },
    { n: ["п. Октябрьское", "с. Большой Камень"], r: ["р. Кормужиханка"], last: "закрыт с 8:00 01.04.2025" },
    { n: ["с. Большой Камень", "п. Большие Леуши"], r: [], last: "закрыт с 8:00 01.04.2025" },
    { n: ["п. Карымкары", "п. Горнореченск", "п. Урманный"], r: [], last: "закрыт с 8:00 01.04.2025" } ] },
  { t: "Ханты-Мансийский", s: "eshes", items: [
    { n: ["г. Ханты-Мансийск", "д. Нялина", "п. Пырьях", "д. Кышик"], r: null, last: "закрыт с 31.03.2025" },
    { n: ["г. Ханты-Мансийск", "с. Имитуй", "д. Янгуловка"], r: null, last: "закрыт с 31.03.2025" },
    { n: ["д. Янгуловка", "с. Согом"], r: null, last: "закрыт с 31.03.2025" },
    { n: ["с. Тюли", "п. Выкатной"], r: null, last: "закрыт с 31.03.2025" },
    { n: ["п. Сибирский", "с. Батово"], r: null, last: "закрыт с 31.03.2025" },
    { n: ["с. Цингалы", "п. Горноправдинский"], r: null, last: "закрыт с 31.03.2025" },
    { n: ["13 км а/д на Талинку", "д. Белогорье"], name: "13 км автодороги «г. Ханты-Мансийск — пгт. Талинка» — д. Белогорье", r: null, last: "закрыт с 31.03.2025" },
    { n: ["д. Белогорье", "п. Кирпичный"], r: null, last: "закрыт с 31.03.2025" },
    { n: ["д. Белогорье", "п. Луговской"], r: null, last: "закрыт с 31.03.2025" },
    { n: ["п. Луговской", "с. Троица"], r: null, last: "закрыт с 31.03.2025" },
    { n: ["с. Троица", "с. Елизарово", "п. Кедровый"], r: null, last: "закрыт с 31.03.2025" },
    { n: ["п. Кедровый", "п. Урманный"], r: null, last: "закрыт с 31.03.2025" } ] },
  { t: "Сургутский", s: "reyavr", items: [
    { n: ["г. Сургут", "п. Банный"], r: ["р. Тром-Еган"], last: "закрыт с 8:00 01.04.2025" },
    { n: ["с. Сытомино", "п. Горный"], r: [], last: "закрыт с 8:00 01.04.2025" },
    { n: ["с. Угут", "д. Каюкова"], r: [], last: "закрыт с 8:00 01.04.2025" },
    { n: ["с. Угут", "д. Малоюганский"], r: [], last: "закрыт с 8:00 01.04.2025" } ] },
  { t: "Другие из ленты", items: [
    { n: ["с. Ларьяк", "д. Чехломей", "д. Большой Ларьяк"], km: "29,83 км", r: ["р. Вах", "р. Пасол"], last: "закрыт с 6:00 05.04.2025", s: "167893" },
    { n: ["п. Белорусский", "с. Ларьяк"], r: [], last: "закрыт с 6:00 10.04.2025", s: "rkukr" },
    { n: ["с. Былино", "п. Зайцева Речка"], r: [], last: "закрыт с 8:00 03.04.2025", s: "rtchar" },
    { n: ["д. Соснино", "граница Томской области"], r: [], last: "сообщение 01.04.2025: «закрыт»", s: "ope" },
    { n: ["г. Белоярский", "с. Полноват"], r: [], last: "с 10:00 28.03.2025 ограничено движение машин массой свыше 3 т", s: "reeuvr" } ] }
];
var dir = $("[data-dir]");
if (dir) (function () {
  var tabs = $(".dir-tabs", dir), list = $(".dir-list", dir), svg = $(".dir-svg", dir), card = $(".dir-card", dir), NS = "http://www.w3.org/2000/svg";
  var cur = 0, curItem = null;
  function nm(it) { return it.name || "«" + it.n.join(" — ") + "»"; }
  DATA.forEach(function (g, i) {
    var b = d.createElement("button"); b.type = "button"; b.setAttribute("role", "tab"); b.id = "dt" + i;
    b.innerHTML = g.t + "<small>" + g.items.length + "</small>";
    b.addEventListener("click", function () { pick(i, true); });
    tabs.appendChild(b);
  });
  // стрелки по вкладкам и по списку
  tabs.addEventListener("keydown", function (e) {
    var k = e.key, n = DATA.length; if (k !== "ArrowRight" && k !== "ArrowLeft" && k !== "Home" && k !== "End") return;
    e.preventDefault(); var i = k === "Home" ? 0 : k === "End" ? n - 1 : (cur + (k === "ArrowRight" ? 1 : -1) + n) % n;
    pick(i, true); tabs.children[i].focus();
  });
  list.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return; e.preventDefault();
    var bs = $$("button", list), i = bs.indexOf(d.activeElement); i = (i + (e.key === "ArrowDown" ? 1 : -1) + bs.length) % bs.length; bs[i].focus(); bs[i].click();
  });
  function pick(i, user) {
    cur = i; var g = DATA[i];
    [].forEach.call(tabs.children, function (b, j) { b.setAttribute("aria-selected", j === i); b.tabIndex = j === i ? 0 : -1; });
    list.textContent = "";
    g.items.forEach(function (it, j) {
      var li = d.createElement("li"), b = d.createElement("button"); b.type = "button";
      b.innerHTML = "<span></span><i></i>"; b.firstChild.textContent = nm(it);
      b.lastChild.textContent = it.cross ? "переправа" : it.r && it.r.length ? "переправ: " + it.r.length : "";
      b.addEventListener("click", function () { show(it, g, b); });
      li.appendChild(b); list.appendChild(li);
      if (!j) show(it, g, b, !user);
    });
  }
  function el(tag, a, txt) { var e = d.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (txt) e.textContent = txt; return e; }
  function draw(it) {
    var narrow = svg.clientWidth && svg.clientWidth < 480, W = narrow ? 420 : 640, H = 170;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.textContent = "";
    svg.setAttribute("aria-label", "Условная схема: " + it.n.join(", ") + (it.r && it.r.length ? "; ледовые переправы: " + it.r.join(", ") : ""));
    var n = it.n.length, x0 = narrow ? 36 : 56, x1 = W - x0, pts = it.n.map(function (_, k) { return [x0 + (x1 - x0) * k / (n - 1), 88 + (k % 2 ? -14 : 14) * (n > 2 ? 1 : 0)]; });
    var dd = "M" + pts[0][0] + " " + pts[0][1];
    for (var k = 1; k < n; k++) { var a = pts[k - 1], b = pts[k], mx = (a[0] + b[0]) / 2; dd += " C" + mx + " " + a[1] + " " + mx + " " + b[1] + " " + b[0] + " " + b[1]; }
    var rv = el("g"), bed = el("path", { d: dd, class: "rd-bed" }), rd = el("path", { d: dd, class: "rd" }), ice = el("g"), pg = el("g");
    svg.append(rv, bed, rd, ice, pg);
    var L = rd.getTotalLength ? rd.getTotalLength() : 0, rs = it.r || [];
    rs.forEach(function (name, k) {
      var fr = (k + 1) / (rs.length + 1); for (var j = 0; j < n; j++) if (Math.abs(fr - j / (n - 1)) < .07) fr += .09; var p = rd.getPointAtLength(L * Math.min(fr, .95)), x = p.x;
      rv.appendChild(el("path", { class: "rv", d: "M" + (x - 9) + " 0 C" + (x - 16) + " 60 " + (x + 2) + " 110 " + (x - 8) + " " + H + " H" + (x + 10) + " C" + (x + 20) + " 110 " + (x + 2) + " 60 " + (x + 9) + " 0Z" }));
      ice.appendChild(el("path", { class: "rv-ice", d: "M" + (x - 12) + " " + p.y + " H" + (x + 12) }));
      if (!narrow) ice.appendChild(el("text", { class: "rv-t", x: x, y: k % 2 ? H - 10 : 18, "text-anchor": "middle" }, name));
    });
    pts.forEach(function (p, k) {
      pg.appendChild(el("circle", { class: "pt", cx: p[0], cy: p[1], r: 7 }));
      var up = n > 2 ? k % 2 : 0, anchor = k === 0 ? "start" : k === n - 1 ? "end" : "middle";
      pg.appendChild(el("text", { class: "pt-t", x: p[0] + (k === 0 ? -6 : k === n - 1 ? 6 : 0), y: up ? p[1] - 18 : p[1] + 30, "text-anchor": anchor }, it.n[k]));
    });
    if (hasG && !calm.matches && !(w.KIT && KIT.still)) {
      G.fromTo(rd, { drawSVG: "0%" }, { drawSVG: "100%", duration: .9, ease: "power2.inOut" });
      G.from(rv.children, { scaleY: 0, transformOrigin: "50% 0%", duration: .6, stagger: .08, ease: "power2.out" });
      G.from(ice.children, { opacity: 0, duration: .4, stagger: .06, delay: .5 });
      G.from(pg.children, { opacity: 0, scale: .6, transformOrigin: "50% 50%", duration: .4, stagger: .05, delay: .2 });
    }
  }
  function show(it, g, btn, quiet) {
    curItem = it;
    $$("button", list).forEach(function (b) { b.setAttribute("aria-pressed", b === btn); });
    $(".dir-name", card).textContent = nm(it) + (it.plus ? " " + it.plus : "");
    var f = function (k) { return $('[data-f="' + k + '"]', card); };
    f("type").textContent = (it.cross ? "Ледовая переправа" : it.r && it.r.length ? "Зимняя автодорога с ледовыми переправами" : "Зимняя автодорога") + (g.t !== "Другие из ленты" ? ", " + g.t + " район" : "") + (it.km ? ", " + it.km : "");
    f("cross").textContent = it.r === null ? "в сообщении сайта не перечислены" : it.r.length ? it.r.join(", ") : "в сообщении не указаны";
    var last = f("last"); last.textContent = it.last + " · ";
    var a = d.createElement("a"); a.href = SRC + (it.s || g.s) + ".html"; a.textContent = "сообщение на их сайте"; a.rel = "noopener"; last.appendChild(a);
    draw(it);
    if (!quiet && hasG && !calm.matches) G.fromTo($(".dir-facts", card), { opacity: .2, y: 6 }, { opacity: 1, y: 0, duration: .45, ease: "power2.out" });
  }
  pick(0, false);
  var rw = 0; addEventListener("resize", function () { clearTimeout(rw); rw = setTimeout(function () { if (curItem) draw(curItem); }, 200); });
})();
})();
