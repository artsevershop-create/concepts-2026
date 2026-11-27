/* СМК Шадринск — движение и интерактив. Механики 21st.dev перенесены в vanilla:
   Sliding Tabs (shadcnstore/motion-sliding-tabs) — бегунок вкладок подбора; Hover Expand Gallery — лента проектов;
   Direction Aware Hover (aceternity) — заливка кнопок из точки входа курсора. */
(function () {
  "use strict";
  var d = document, root = d.documentElement, K = window.KIT || {};
  var $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var mqR = matchMedia("(prefers-reduced-motion: reduce)"), FINE = matchMedia("(hover:hover) and (pointer:fine)").matches;
  var R = mqR.matches, G = window.gsap;
  var SVGNS = "http://www.w3.org/2000/svg";
  if (G) G.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);
  var still = function () { return R || K.still; };

  /* ---------- шторка + вход hero ---------- */
  function intro() {
    var seen = root.classList.contains("seen");
    try { sessionStorage.setItem("smksh-cur", "1"); } catch (e) {}
    if (!G || R) { var c = $(".curtain"); if (c) c.style.display = "none"; return; }
    var tl = G.timeline({ defaults: { ease: "expo.out" } });
    if (!seen) tl.to(".curtain-in", { autoAlpha: 0, y: -12, duration: .35, delay: .3, ease: "power2.in" })
      .to(".curtain", { yPercent: -100, duration: .6, ease: "expo.inOut" }, "<.15")
      .set(".curtain", { display: "none" });
    else G.set(".curtain", { display: "none" });
    var at = seen ? 0 : .55;
    tl.from(".hero-ph img", { scale: 1.22, filter: "brightness(.35)", duration: 2.2 }, at)
      .from(".hero-grid", { autoAlpha: 0, duration: 1.4 }, at)
      .from(".meta", { autoAlpha: 0, x: -16, duration: .8 }, at + .2);
    d.fonts.ready.then(function () {
      var h = $(".h1"), s = SplitText.create(h, { type: "lines", mask: "lines", linesClass: "ln" });
      tl.from(s.lines, { yPercent: 112, duration: 1.1, ease: "power4.out", stagger: .08 }, Math.max(at + .25, tl.time()))
        .from(".lead", { autoAlpha: 0, y: 18, duration: .9 }, "<.35")
        .from(".acts > *", { autoAlpha: 0, y: 16, duration: .8, stagger: .08 }, "<.15")
        .from(".trust li", { autoAlpha: 0, y: 14, duration: .8, stagger: .07 }, "<.1")
        .from(".hero-p figcaption", { autoAlpha: 0, y: 10, duration: .8 }, "<");
    });
    if (FINE) { // тихая жизнь: параллакс фото за мышью
      var img = $(".hero-ph img"), qx = G.quickTo(img, "x", { duration: 1.4, ease: "power3" }), qy = G.quickTo(img, "y", { duration: 1.4, ease: "power3" });
      $(".hero").addEventListener("pointermove", function (e) { if (still()) return; qx((e.clientX / innerWidth - .5) * -20); qy((e.clientY / innerHeight - .5) * -14); });
    }
  }

  /* ---------- искры сварки над фото hero ---------- */
  function sparks() {
    var cv = $(".sparks"); if (!cv || !K.raf) return;
    var cx = cv.getContext("2d"), W = 0, H = 0, P = [], DPR = Math.min(2, devicePixelRatio || 1) * .5;
    function size() { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = Math.max(1, W * DPR); cv.height = Math.max(1, H * DPR); }
    size(); addEventListener("resize", size);
    function spawn() { // точка сварки на узле фермы
      var ox = W * .5, oy = H * .34;
      for (var i = 0; i < 5 && P.length < 40; i++) P.push({ x: ox + (Math.random() - .5) * 8, y: oy, vx: (Math.random() - .5) * 2.2, vy: -Math.random() * 2.4, l: 0, m: 40 + Math.random() * 50 });
    }
    var acc = 0;
    K.raf(cv, function (t, dt) {
      if (W < 20 || H < 20) { size(); return; }
      cx.setTransform(DPR, 0, 0, DPR, 0, 0); cx.clearRect(0, 0, W, H);
      if (!dt) return;
      acc += dt; if (acc > 900 + Math.random() * 1400) { acc = 0; spawn(); }
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i]; p.l++; p.vy += .09; p.x += p.vx; p.y += p.vy;
        var a = 1 - p.l / p.m; if (a <= 0) { P.splice(i, 1); continue; }
        cx.strokeStyle = "rgba(255," + (190 + 60 * a | 0) + ",80," + a.toFixed(2) + ")"; cx.lineWidth = 1.4;
        cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x - p.vx * 2.5, p.y - p.vy * 2.5); cx.stroke();
      }
    }, 30);
  }

  /* ---------- прогресс, меню, бегунок ---------- */
  function chrome() {
    var bar = $(".prog"), last = -1, tick = false;
    function up() { tick = false; var p = Math.min(1, scrollY / Math.max(1, root.scrollHeight - innerHeight)); p = Math.round(p * 1000) / 1000; if (p !== last) { last = p; bar.style.setProperty("--p", p); } }
    addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(up); } }, { passive: true }); up();
    var links = $$(".hdr nav a"), run = $(".nav-run"), cur = null;
    function mark(a) {
      if (a === cur) return; cur = a; links.forEach(function (l) { l.classList.toggle("is-cur", l === a); if (l === a) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current"); });
      if (!run) return; if (!a) { run.style.opacity = 0; return; }
      run.style.opacity = 1; run.style.width = "10px"; run.style.transform = "translateX(" + a.offsetLeft + "px) scaleX(" + (a.offsetWidth / 10) + ")";
    }
    var map = links.map(function (a) { return [a, $(a.getAttribute("href"))]; });
    var io = new IntersectionObserver(function () {
      var best = null; map.forEach(function (m) { if (!m[1]) return; var r = m[1].getBoundingClientRect(); if (r.top < innerHeight * .45 && r.bottom > innerHeight * .45) best = m[0]; });
      mark(best);
    }, { threshold: [0, .25, .5, .75, 1], rootMargin: "-40% 0px -50% 0px" });
    map.forEach(function (m) { if (m[1]) io.observe(m[1]); });
  }

  /* ---------- курсор: двутавр → поворот над ссылками, крюк над фото ---------- */
  function cursor() {
    if (!FINE || R) return;
    var c = $(".cur"), dot = $(".cur-dot"), b = $(".cur-b"), t = $(".cur-t");
    root.classList.add("has-cur");
    var x = -100, y = -100, bx = -100, by = -100, id = 0;
    function loop() { bx += (x - bx) * .2; by += (y - by) * .2; b.style.transform = "translate(" + bx.toFixed(1) + "px," + by.toFixed(1) + "px)"; id = Math.abs(x - bx) + Math.abs(y - by) > .2 ? requestAnimationFrame(loop) : 0; }
    addEventListener("pointermove", function (e) {
      x = e.clientX; y = e.clientY; dot.style.transform = "translate(" + x + "px," + y + "px)"; if (!id) id = requestAnimationFrame(loop);
      var el = e.target, link = el.closest && el.closest("a,button,[data-cur],select,label,input[type=range]"), field = el.closest && el.closest("input:not([type=range]):not([type=checkbox]):not([type=radio]),textarea,select");
      var hook = el.closest && el.closest("[data-cur-hook]");
      root.classList.toggle("on-light", !!(el.closest && el.closest(".sheet")));
      c.classList.toggle("is-off", !!field);
      var lab = "";
      if (link && !field) { var h = link.getAttribute && link.getAttribute("href") || ""; lab = link.getAttribute("data-cur") || (/^tel:/.test(h) ? "Позвонить" : /^mailto:/.test(h) ? "Написать" : /^https?:/.test(h) ? "Перейти" : link.tagName === "BUTTON" ? "Выбрать" : "Открыть"); }
      var asLink = !!lab && (!hook || (link !== hook && hook.contains(link)));
      c.classList.toggle("is-link", asLink);
      c.classList.toggle("is-hook", !!hook && !asLink);
      if (lab && t.textContent !== lab) t.textContent = lab;
    }, { passive: true });
    addEventListener("pointerdown", function () { c.classList.add("is-down"); });
    addEventListener("pointerup", function () { c.classList.remove("is-down"); });
    d.addEventListener("pointerleave", function () { c.classList.add("is-off"); });
    d.addEventListener("pointerenter", function () { c.classList.remove("is-off"); });
  }

  /* ---------- кнопки: заливка из точки входа/выхода ---------- */
  function buttons() {
    $$(".bt").forEach(function (b) {
      function at(e) { var r = b.getBoundingClientRect(); b.style.setProperty("--fx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%"); b.style.setProperty("--fy", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%"); }
      b.addEventListener("pointerenter", at); b.addEventListener("pointerleave", at);
    });
    $$(".sp").forEach(function (el) {
      el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); el.style.setProperty("--x", (e.clientX - r.left) + "px"); el.style.setProperty("--y", (e.clientY - r.top) + "px"); });
    });
  }

  /* ---------- бегущая строка отраслей от скорости прокрутки ---------- */
  function band() {
    var t = $(".band-t"); if (!t || R || !K.raf) return;
    t.innerHTML += t.innerHTML; var x = 0, v = 0, lastY = scrollY, w = 0, sk = 0;
    K.raf(t.parentNode, function (time, dt) {
      if (!dt) return; if (!w) w = t.scrollWidth / 2;
      var dy = scrollY - lastY; lastY = scrollY; v = v * .9 + dy * .1;
      x -= (0.04 * dt) + Math.abs(v) * .6; if (-x > w) x += w;
      var s = Math.max(-10, Math.min(10, v * .4)); if (Math.abs(s - sk) > .05 || dt) { sk = s; t.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0) skewX(" + (-sk).toFixed(2) + "deg)"; }
    }, 60);
  }

  /* ---------- подбор конструкций ---------- */
  var DATA = {
    korpus: { t: "Каркас производственного корпуса", d: "Каркасы производственных и технологических корпусов для горнодобывающей, металлургической, нефтегазоперерабатывающей, машиностроительной и химической отраслей.",
      l: ["Фермы, связи, фонари", "Двухветьевые колонны", "Тормозные балки, площадки, щиты кровли", "Чертежи КМД — собственные конструкторские бюро"],
      ex: ["630 т", "Цех ремонта двигателей большой тяги АО «Уральский завод гражданской авиации», 2022"], f: 0 },
    gorno: { t: "Конструкции промышленного комплекса", d: "Металлоконструкции для объектов нефте- и газохимической, горнодобывающей, энергетической, химической отраслей и инфраструктуры.",
      l: ["Сечения сплошные двутавровые, Н-образные, коробчатые", "Технологические эстакады", "Площадки и ограждения", "Конструкции I группы по СП 16.13330.2017 для зданий 1-го уровня ответственности"],
      ex: ["более 14 000 т", "ГМК «Удокан», Забайкальский край, 2019–2022"], f: 1 },
    sklad: { t: "Каркас складского терминала", d: "Логистические и складские терминалы по принципу «одного окна»: от приёмки заказа до отгрузки, а по желанию заказчика — монтаж и шефмонтаж.",
      l: ["Колонны и ригели рам", "Связи и прогоны", "Изготовление по чертежам заказчика", "Двух- и трёхслойные системы антикоррозионной защиты"], ex: null, f: 2 },
    kult: { t: "Каркас общественного здания", d: "Офисные здания, уникальные культурные сооружения, спортивные объекты. Нестандартные конструкции проектируют совместно архитекторы и дизайнеры компании.",
      l: ["Уникальные металлоконструкции гражданского строительства", "Нестандартные конструкции специального назначения", "Огнезащита от R15 до R120"],
      ex: ["1 825 т", "Пермская художественная галерея, июнь–сентябрь 2022"], f: 3 },
    balka: { t: "Сварная двутавровая балка", d: "Типоразмеры Б, Ш, К из углеродистых и низколегированных сталей; специальные балки — по чертежам заказчика. Подвигайте высоту и длину: схема покажет пропорции.",
      l: ["Высота от 300 до 2 500 мм, длина от 3 до 18 м, вес от 300 до 12 000 кг", "Сварка поясных швов под слоем флюса, с полным проваром и без", "Снижение массы до 10 % против горячекатаной балки", "Сертификат на прокат и документ о качестве"],
      ex: ["900 т", "сварной балки в месяц — объём производства"], f: 4 }
  };
  function P(a) { return "M" + a[0] + " " + a[1] + "L" + a[2] + " " + a[3]; }
  function shapes(k) {
    var L = [], A = [], T = [], i, x;
    function ln(x1, y1, x2, y2, c) { L.push([P([x1, y1, x2, y2]), c || ""]); }
    if (k === "korpus") {
      [[70, 102], [498, 530]].forEach(function (c) { ln(c[0], 340, c[0], 196); ln(c[1], 340, c[1], 196); for (var y = 340; y > 200; y -= 36) ln(c[0], y, c[1], y - 18); ln(c[0], 196, c[1], 196); });
      ln(90, 196, 90, 112); ln(510, 196, 510, 112);
      ln(102, 190, 498, 190, "a"); ln(102, 178, 498, 178, "a");
      ln(80, 112, 520, 112); ln(80, 82, 520, 82);
      for (x = 80; x < 520; x += 55) { ln(x, 112, x + 27.5, 82); ln(x + 27.5, 82, x + 55, 112); }
      ln(240, 82, 240, 56, "a"); ln(360, 82, 360, 56, "a"); ln(230, 56, 370, 56, "a");
      T = [[300, 40, "фонарь"], [300, 214, "тормозная балка"], [300, 130, "ферма"], [86, 364, "двухветьевые колонны"]];
    } else if (k === "gorno") {
      var cols = [90, 240, 390, 510]; cols.forEach(function (c) { ln(c, 340, c, 60); ln(c + 7, 340, c + 7, 60); });
      [260, 180, 100, 60].forEach(function (y) { ln(90, y, 517, y, y === 60 ? "" : ""); });
      ln(247, 340, 390, 260, "a"); ln(247, 260, 390, 340, "a"); ln(247, 180, 390, 100, "a"); ln(247, 100, 390, 180, "a");
      for (x = 100; x < 510; x += 26) ln(x, 100, x, 82);
      ln(100, 82, 510, 82);
      ln(517, 180, 585, 180); ln(517, 196, 585, 196); for (x = 527; x < 585; x += 14) ln(x, 180, x, 196);
      T = [[318, 228, "связи"], [300, 50, "площадки и ограждения"], [120, 364, "колонны двутаврового сечения"], [555, 170, "эстакада"]];
    } else if (k === "sklad") {
      var fr = function (o, c) { ln(50 + o, 340 - o * .6, 50 + o, 210 - o * .6, c); ln(550 + o, 340 - o * .6, 550 + o, 210 - o * .6, c); ln(50 + o, 210 - o * .6, 300 + o, 130 - o * .6, c); ln(300 + o, 130 - o * .6, 550 + o, 210 - o * .6, c); };
      fr(26, ""); fr(0, "a");
      for (i = 1; i < 10; i++) { var px = 50 + i * 25, py = 210 - i * 8; ln(px, py, px + 26, py - 15.6); ln(600 - px, py, 626 - px, py - 15.6); }
      ln(50, 340, 76, 324.4); ln(550, 340, 576, 324.4); ln(50, 280, 76, 210 - 15.6); ln(550, 280, 576, 194.4);
      T = [[300, 112, "прогоны"], [300, 364, "рамы"], [60, 196, "колонна"]];
    } else if (k === "kult") {
      var arc = function (r, cy) { var o = []; for (var j = 0; j <= 16; j++) { var a = Math.PI * j / 16; o.push([300 - Math.cos(a) * r, cy - Math.sin(a) * r * .9]); } return o; };
      var A1 = arc(250, 340), A2 = arc(222, 340);
      for (i = 0; i < 16; i++) { ln(A1[i][0], A1[i][1], A1[i + 1][0], A1[i + 1][1], "a"); ln(A2[i][0], A2[i][1], A2[i + 1][0], A2[i + 1][1]); ln(A1[i][0], A1[i][1], A2[i + 1][0], A2[i + 1][1]); }
      for (i = 2; i < 15; i += 3) ln(A2[i][0], A2[i][1], A2[i][0], 340);
      ln(100, 250, 500, 250);
      T = [[300, 106, "уникальная конструкция"], [300, 270, "перекрытие"]];
    }
    return { L: L, T: T };
  }
  function balka(h, len, typ) {
    var hp = 60 + (h - 300) / 2200 * 220, bp = Math.min(200, hp * ({ "Б": .42, "Ш": .7, "К": .92 })[typ]), tf = Math.max(6, hp * .06), tw = Math.max(4, hp * .035), cx = 140, cy = 190;
    var y0 = cy - hp / 2, y1 = cy + hp / 2, x0 = cx - bp / 2, x1 = cx + bp / 2;
    var sec = "M" + x0 + " " + y0 + "H" + x1 + "V" + (y0 + tf) + "H" + (cx + tw / 2) + "V" + (y1 - tf) + "H" + x1 + "V" + y1 + "H" + x0 + "V" + (y1 - tf) + "H" + (cx - tw / 2) + "V" + (y0 + tf) + "H" + x0 + "Z";
    var lp = 80 + (len - 3) / 15 * 230, ex0 = 270, ex1 = ex0 + lp, eh = Math.max(40, hp * .9), ey0 = cy - eh / 2, ey1 = cy + eh / 2;
    var L = [[sec, "f"], [P([ex0, ey0, ex1, ey0]), ""], [P([ex0, ey1, ex1, ey1]), ""], [P([ex0, ey0 + 6, ex1, ey0 + 6]), "a"], [P([ex0, ey1 - 6, ex1, ey1 - 6]), "a"], [P([ex0, ey0, ex0, ey1]), ""], [P([ex1, ey0, ex1, ey1]), ""]];
    for (var i = 1; i < 4; i++) { var hx = ex0 + 10, hy = ey0 + i * eh / 4; L.push(["M" + (hx - 3) + " " + hy + "h6", ""]); L.push(["M" + (ex1 - 13) + " " + hy + "h6", ""]); }
    return { L: L, D: [[x1 + 22, y0, x1 + 22, y1], [ex0, ey1 + 28, ex1, ey1 + 28]], T: [[x1 + 32, cy + 5, "h " + h.toLocaleString("ru-RU") + " мм", "start"], [(ex0 + ex1) / 2, ey1 + 50, "L " + String(len).replace(".", ",") + " м", "middle"], [cx, y1 + 30, "сечение " + typ, "middle"]] };
  }
  function selector() {
    var tabs = $$(".sel-tabs [role=tab]"), pill = $(".sel-pill"), panel = $(".sel-p"), lnG = $(".sel-ln"), dimG = $(".sel-dim"), grid = $(".sel-gr");
    if (!tabs.length) return;
    var gp = ""; for (var gx = 0; gx <= 600; gx += 30) gp += "M" + gx + " 0V380"; for (var gy = 10; gy <= 380; gy += 30) gp += "M0 " + gy + "H600";
    var gpath = d.createElementNS(SVGNS, "path"); gpath.setAttribute("d", gp); grid.appendChild(gpath);
    var bm = $(".bm"), bh = $("#bm-h"), bl = $("#bm-l"), bho = $("#bm-ho"), blo = $("#bm-lo"), bst = $("#bm-st"), cur = "korpus";
    function moveTo(tab, anim) { // механика Sliding Tabs: меряем offsetLeft/Width, первый кадр и resize — без анимации
      if (!anim) pill.style.transition = "none";
      pill.style.transform = "translate(" + tab.offsetLeft + "px," + (tab.offsetTop - 4) + "px)"; pill.style.width = tab.offsetWidth + "px"; pill.style.height = tab.offsetHeight + "px";
      if (!anim) { void pill.offsetWidth; pill.style.transition = ""; }
    }
    function render(drawIn) {
      var o, k = cur; lnG.textContent = ""; dimG.textContent = "";
      if (k === "balka") { o = balka(+bh.value, +bl.value, ($("input[name=bmt]:checked") || {}).value || "Б"); bho.textContent = (+bh.value).toLocaleString("ru-RU") + " мм"; blo.textContent = String(bl.value).replace(".", ",") + " м"; }
      else o = shapes(k);
      o.L.forEach(function (l) { var p = d.createElementNS(SVGNS, "path"); p.setAttribute("d", l[0]); if (l[1]) p.setAttribute("class", l[1]); lnG.appendChild(p); });
      (o.D || []).forEach(function (a) { var p = d.createElementNS(SVGNS, "path"); p.setAttribute("d", P(a) + (a[0] === a[2] ? "M" + (a[0] - 6) + " " + a[1] + "h12M" + (a[0] - 6) + " " + a[3] + "h12" : "M" + a[0] + " " + (a[1] - 6) + "v12M" + a[2] + " " + (a[1] - 6) + "v12")); dimG.appendChild(p); });
      (o.T || []).forEach(function (a) { var t = d.createElementNS(SVGNS, "text"); t.setAttribute("x", a[0]); t.setAttribute("y", a[1]); t.setAttribute("text-anchor", a[3] || "middle"); t.textContent = a[2]; dimG.appendChild(t); });
      if (drawIn && G && !still()) {
        G.fromTo(lnG.children, { drawSVG: "0%" }, { drawSVG: "100%", duration: .9, ease: "power2.inOut", stagger: { amount: .9 } });
        G.fromTo(dimG.children, { autoAlpha: 0 }, { autoAlpha: 1, duration: .5, delay: .7, stagger: .06 });
      }
    }
    function fill(k) {
      var D = DATA[k]; $(".sel-k").textContent = "Выбрано: " + tabs[D.f].textContent;
      $(".sel-t").textContent = D.t; $(".sel-d").textContent = D.d;
      var ul = $(".sel-list"); ul.textContent = ""; D.l.forEach(function (s) { var li = d.createElement("li"); li.textContent = s; ul.appendChild(li); });
      var ex = $(".sel-ex"); ex.textContent = ""; if (D.ex) { var b = d.createElement("b"); b.textContent = D.ex[0]; var s = d.createElement("span"); s.textContent = D.ex[1]; ex.append(b, s); }
      bm.hidden = k !== "balka";
    }
    function select(tab, focus) {
      tabs.forEach(function (t) { var on = t === tab; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
      panel.setAttribute("aria-labelledby", tab.id); cur = tab.dataset.k; moveTo(tab, true); fill(cur); render(true);
      if (G && !still()) G.fromTo(".sel-i > *", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .04, ease: "power2.out", overwrite: true });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { if (t.getAttribute("aria-selected") !== "true") select(t); });
      t.addEventListener("keydown", function (e) {
        var n = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (n === undefined) return; e.preventDefault(); select(tabs[(n + tabs.length) % tabs.length], true);
      });
    });
    [bh, bl, bst].concat($$("input[name=bmt]")).forEach(function (el) { el.addEventListener("input", function () { render(false); }); el.addEventListener("change", function () { render(false); }); });
    requestAnimationFrame(function () { moveTo(tabs[0], false); });
    addEventListener("resize", function () { moveTo($(".sel-tabs [aria-selected=true]"), false); });
    fill(cur); render(false);
    var drawn = false; if (K.onView) K.onView($(".sel-v"), function (v) { if (v && !drawn) { drawn = true; render(true); } }, { threshold: .35 });
    // перенос в запрос
    $("#sel-go").addEventListener("click", function (e) {
      e.preventDefault();
      var D = DATA[cur], prot = $$(".sel-pr input:checked").map(function (c) { return c.value === "АКЗ" ? "антикоррозионная защита" : "огнезащита"; });
      var txt = cur === "balka" ? "Сварная балка, сечение " + (($("input[name=bmt]:checked") || {}).value) + ", высота " + bh.value + " мм, длина " + String(bl.value).replace(".", ",") + " м, сталь " + bst.value : D.t;
      if (prot.length) txt += "; покрытие: " + prot.join(", ");
      var sel = $("#f-type"); sel.selectedIndex = D.f; var ta = $("#f-par"); ta.value = txt + ".\n";
      var target = $("#request");
      if (K.lenis) K.lenis.scrollTo(target, { offset: -70 }); else target.scrollIntoView({ behavior: R ? "auto" : "smooth" });
      setTimeout(function () { ta.focus({ preventScroll: true }); ta.setSelectionRange(ta.value.length, ta.value.length); if (G && !still()) G.fromTo(".form", { boxShadow: "0 0 0 4px #f3c11b" }, { boxShadow: "0 0 0 0px rgba(243,193,27,0)", duration: 1.6, ease: "power2.out" }); }, R ? 0 : 900);
    });
  }

  /* ---------- сигнатурная сцена: лист → резка → сборка/сварка → окраска → отгрузка → каркас ---------- */
  function scene() {
    var sec = $(".cyc"), svg = $(".cyc-svg"); if (!sec) return;
    var gs = $(".grid-s"), p = ""; for (var x = 40; x <= 760; x += 40) p += "M" + x + " 40V500"; for (var y = 60; y <= 500; y += 40) p += "M40 " + y + "H760";
    var gp = d.createElementNS(SVGNS, "path"); gp.setAttribute("d", p); gs.appendChild(gp);
    var painted = $(".painted"); $$(".frame path").forEach(function (q) { painted.appendChild(q.cloneNode(false)); }); // окрашенная копия каркаса
    if (!G) return;
    var items = $$(".cyc-st li"), fill = $(".cyc-fill"), mm = G.matchMedia();
    mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", function () {
      sec.classList.add("is-live");
      var idx = 0;
      function setIdx(n) { if (n === idx) return; idx = n; items.forEach(function (li, i) { li.classList.toggle("is-on", i === n); }); }
      items.forEach(function (li, i) { li.classList.toggle("is-on", i === 0); });
      var rect = $(".paint-r"), wag = $(".wag-b"), spark = $(".spark"), cuts = $$(".plate .cut");
      G.set(rect, { attr: { width: 0 } }); G.set(wag, { attr: { transform: "translate(-240 0)" } });
      G.set(".plate", { opacity: 1 }); G.set(".weld circle", { opacity: 0, scale: .2, transformOrigin: "50% 50%" });
      G.set([".frame path", ".plate .cut", ".mont path"], { drawSVG: "0%" }); G.set(".dimt", { opacity: 0 }); G.set(spark, { opacity: 0 });
      var tl = G.timeline({ defaults: { ease: "none" },
        scrollTrigger: { trigger: sec, pin: ".cyc-pin", start: "top top", end: "+=430%", scrub: .8, invalidateOnRefresh: true,
          onUpdate: function (s) { setIdx(Math.min(4, Math.floor(s.progress * 5 * .999))); fill.parentNode.style.setProperty("--cp", s.progress.toFixed(3)); } } });
      // 1 — заготовка: резка листа, искра идёт по резу
      tl.to(spark, { opacity: 1, duration: .1 }, .1);
      cuts.forEach(function (c, i) {
        tl.to(c, { drawSVG: "100%", duration: .5 }, .2 + i * .55)
          .to(spark, { motionPath: { path: c, align: c, alignOrigin: [.5, .5] }, duration: .5 }, .2 + i * .55);
      });
      // 2 — сборка и сварка
      tl.to(".plate", { opacity: .12, duration: .4 }, 2)
        .to(".frame .c", { drawSVG: "100%", duration: .6, stagger: .12 }, 2.05)
        .to(".frame .t", { drawSVG: "100%", duration: .5, stagger: .1 }, 2.75)
        .to(".frame .w", { drawSVG: "100%", duration: .55 }, 3.15)
        .to(".weld circle", { opacity: 1, scale: 1, duration: .15, stagger: .1, ease: "back.out(3)" }, 2.9);
      [[150, 250], [316, 250], [484, 250], [650, 250], [400, 176]].forEach(function (pt, i) { tl.to(spark, { x: pt[0], y: pt[1], duration: .12 }, 2.9 + i * .18); });
      tl.to(spark, { opacity: 0, duration: .2 }, 3.85);
      // 3 — окраска: распылитель проходит слева направо, каркас становится жёлтым
      tl.set(".spray", { opacity: 1 }, 4.05)
        .fromTo(".spray", { x: 80 }, { x: 720, duration: 1.6 }, 4.05)
        .fromTo(rect, { attr: { width: 80 } }, { attr: { width: 720 }, duration: 1.6 }, 4.05)
        .to(".weld circle", { opacity: .0, duration: .4 }, 5.3)
        .set(".spray", { opacity: 0 }, 5.7)
        .set(rect, { attr: { width: 800 } }, 5.7);
      // 4 — отгрузка: вагон с конструкциями
      tl.to(wag, { attr: { transform: "translate(285 0)" }, duration: 1.6, ease: "power2.out" }, 6.1);
      // 5 — каркас на объекте: связи, прогоны, размер
      tl.to(".mont path", { drawSVG: "100%", duration: .7, stagger: .2 }, 8.05)
        .to(".dimt", { opacity: 1, duration: .4 }, 8.7)
        .to({}, { duration: .9 }, 9.1);
      return function () { sec.classList.remove("is-live"); items.forEach(function (li) { li.classList.remove("is-on"); }); items[0].classList.add("is-on"); };
    });
  }

  /* ---------- лента проектов (механика Hover Expand Gallery) ---------- */
  function rail() {
    var ls = $$(".rl"); if (!ls.length) return;
    function open(li) { ls.forEach(function (l) { var on = l === li; l.classList.toggle("is-on", on); $(".rl-b", l).setAttribute("aria-expanded", on); }); }
    ls.forEach(function (li) {
      var b = $(".rl-b", li);
      b.addEventListener("click", function () { open(li); });
      b.addEventListener("focus", function () { open(li); });
      if (FINE) li.addEventListener("pointerenter", function () { open(li); });
    });
  }

  /* ---------- фото, параллакс, таймлайн, форма ---------- */
  function scrollFx() {
    if (!G || R) return;
    $$(".ph").forEach(function (f) {
      G.from(f, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.3, ease: "power4.inOut", scrollTrigger: { trigger: f, start: "top 88%", once: true } });
    });
    $$("[data-par] img").forEach(function (img) {
      G.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
    });
    var fac = $(".cont-ph img"); if (fac) G.fromTo(fac, { yPercent: -12 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".cont-ph", start: "top bottom", end: "bottom top", scrub: true } });
    var tlEl = $(".tl"); if (tlEl) {
      var f = d.createElement("i"); f.className = "tl-fill"; f.setAttribute("aria-hidden", "true"); tlEl.appendChild(f);
      G.fromTo(f, { "--tp": 0 }, { "--tp": 1, ease: "none", scrollTrigger: { trigger: tlEl, start: "top 75%", end: "bottom 55%", scrub: true } });
    }
    G.from(".qual-l li", { y: 24, autoAlpha: 0, duration: .8, stagger: .08, ease: "power3.out", scrollTrigger: { trigger: ".qual-l", start: "top 85%", once: true } });
    G.from(".kpi-i", { y: 24, autoAlpha: 0, duration: .8, stagger: .08, ease: "power3.out", scrollTrigger: { trigger: ".kpi", start: "top 88%", once: true } });
    G.from(".rl", { y: 40, autoAlpha: 0, duration: .9, stagger: .05, ease: "power3.out", scrollTrigger: { trigger: ".rail", start: "top 85%", once: true } });
  }
  function form() {
    var f = $("form[data-demo-form]"); if (!f) return;
    f.addEventListener("submit", function () {
      var pth = $(".done path", f); if (G && !still() && pth) G.fromTo(pth, { drawSVG: "0%" }, { drawSVG: "100%", duration: .8, delay: .1, ease: "power2.out" });
    });
  }

  function init() {
    intro(); sparks(); chrome(); cursor(); buttons(); band(); selector(); scene(); rail(); scrollFx(); form();
    if (window.ScrollTrigger) { addEventListener("load", function () { ScrollTrigger.refresh(); }); }
    mqR.addEventListener && mqR.addEventListener("change", function () { location.reload(); });
  }
  if (window.KIT) init(); else d.addEventListener("kit:ready", init);
})();
