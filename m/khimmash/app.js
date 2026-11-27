/* Курганхиммаш: курсор-термощуп, кнопки, вход hero, сцена «мороз → обогрев → изоляция → термограмма», подбор, проекты. */
(function () {
  "use strict";
  var d = document, root = d.documentElement, KIT = window.KIT || {}, G = window.gsap;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)");
  var fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  var gsapOn = !!(G && window.ScrollTrigger);
  if (gsapOn) G.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);
  var SVGNS = "http://www.w3.org/2000/svg";
  function go(y) { if (KIT.lenis) KIT.lenis.scrollTo(y, { duration: 1.2, force: true }); else scrollTo({ top: y, behavior: reduce.matches ? "auto" : "smooth" }); }
  /* детерминированный ГПСЧ: иней одинаковый при каждой загрузке */
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  /* ---------- кнопки (механика «перекат + заливка из точки входа») ---------- */
  var ARROW = '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  $$(".btn").forEach(function (b) {
    if (!b.children.length) {
      var t = b.textContent.trim(), r = d.createElement("span"), a = d.createElement("span"), c = d.createElement("span");
      r.className = "roll"; a.textContent = t; c.textContent = t; c.setAttribute("aria-hidden", "true"); r.append(a, c);
      b.textContent = ""; b.appendChild(r);
      if (b.hasAttribute("data-arrow")) b.insertAdjacentHTML("beforeend", ARROW);
    }
    function pos(e) { var q = b.getBoundingClientRect(); b.style.setProperty("--mx", (e.clientX - q.left) + "px"); b.style.setProperty("--my", (e.clientY - q.top) + "px"); b.style.setProperty("--fill", Math.ceil(Math.hypot(q.width, q.height) / 5 + 2)); }
    b.addEventListener("pointerenter", pos); b.addEventListener("pointerleave", pos);
  });
  if (fine) $$("[data-spot]").forEach(function (c) {
    c.addEventListener("pointermove", function (e) { var q = c.getBoundingClientRect(); c.style.setProperty("--x", (e.clientX - q.left) + "px"); c.style.setProperty("--y", (e.clientY - q.top) + "px"); });
  });

  /* ---------- прогресс чтения и бегунок меню ---------- */
  var prog = $(".prog i"), pt = false;
  function upP() { pt = false; var h = root.scrollHeight - innerHeight; prog.style.setProperty("--p", h > 0 ? (scrollY / h).toFixed(4) : 0); }
  addEventListener("scroll", function () { if (!pt) { pt = true; requestAnimationFrame(upP); } }, { passive: true }); upP();
  (function () {
    var nav = $(".nav"), run = $(".nav-run"), links = $$(".nav a"), cur = null;
    function mark(a) {
      if (a === cur) return; cur = a; links.forEach(function (l) { l.classList.toggle("cur", l === a); });
      if (a) { run.style.setProperty("--x", a.offsetLeft + 12 + "px"); run.style.setProperty("--w", a.offsetWidth - 24 + "px"); run.style.setProperty("--o", 1); } else run.style.setProperty("--o", 0);
    }
    var vis = new Map();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0); });
      var best = null, v = 0; vis.forEach(function (r, id) { if (r > v) { v = r; best = id; } });
      mark(best ? nav.querySelector('a[href="#' + best + '"]') : null);
    }, { threshold: [0, .15, .3, .5, .7], rootMargin: "-30% 0px -40% 0px" });
    links.forEach(function (l) { var s = d.querySelector(l.hash); if (s) io.observe(s); });
    addEventListener("resize", function () { var a = cur; cur = null; mark(a); });
  })();

  /* ---------- иней на аппарате (hero и сцена) ---------- */
  function rime(g, seed, k) {
    var R = rng(seed), f = d.createDocumentFragment();
    function ln(x1, y1, x2, y2, w, o) { var l = d.createElementNS(SVGNS, "line"); l.setAttribute("x1", x1.toFixed(1)); l.setAttribute("y1", y1.toFixed(1)); l.setAttribute("x2", x2.toFixed(1)); l.setAttribute("y2", y2.toFixed(1)); l.setAttribute("stroke-width", w.toFixed(2)); l.setAttribute("opacity", o.toFixed(2)); f.appendChild(l); }
    for (var x = 266; x < 936; x += (2 + R() * 9) / k) { var h = R() < .2 ? 8 + R() * 8 : 2 + R() * 6; ln(x, 201, x + (R() - .5) * 8, 201 - h, .8 + R() * 1.4, .3 + R() * .6); }
    for (var a = 0; a < 3.14; a += .09 / k) { /* днища: иней по эллипсу */
      var s = Math.sin(a), c = Math.cos(a), hx = 60 * s, hy = 80 * c;
      ln(260 - hx, 280 - hy, 260 - hx * 1.12 - R() * 4, 280 - hy * 1.08, 1 + R(), .35 + R() * .4);
      ln(940 + hx, 280 - hy, 940 + hx * 1.12 + R() * 4, 280 - hy * 1.08, 1 + R(), .35 + R() * .4);
    }
    for (var i = 290; i < 920; i += 18 + R() * 26) { var L = 4 + R() * 14; ln(i, 360, i + (R() - .5) * 2, 360 + L, 1.6 + R() * 1.2, .6 + R() * .35); }
    g.appendChild(f);
  }
  var hvR = $(".hv-rime"), svR = $(".rime");
  if (hvR) rime(hvR, 11, 1);
  if (svR) rime(svR, 29, 1.2);

  /* ---------- атмосфера hero: ледяная крупа на canvas (≤ 48 частиц, спит вне экрана) ---------- */
  (function () {
    var cv = $(".frost"); if (!cv || !KIT.raf) return;
    var cx = cv.getContext("2d"), P = [], R = rng(7), W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 1.5);
    function size() { W = cv.clientWidth; H = cv.clientHeight; if (!W || !H) return; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener("resize", size);
    for (var i = 0; i < 32; i++) P.push({ x: R(), y: R(), r: .8 + R() * 1.6, v: .008 + R() * .02, s: R() * 6.28, o: .12 + R() * .3 });
    KIT.raf(cv, function (t, dt) {
      if (!W || !H) return; cx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; p.y += p.v * dt / 1000; p.x += Math.sin(t / 4000 + p.s) * .00012 * dt - .00002 * dt;
        if (p.y > 1.02) { p.y = -.02; p.x = Math.random(); } if (p.x < -.02) p.x = 1.02;
        cx.globalAlpha = p.o; cx.fillStyle = "#DCEFFF"; cx.beginPath(); cx.arc(p.x * W, p.y * H, p.r, 0, 6.283); cx.fill();
      }
    }, 30);
  })();

  /* ---------- шторка: один раз за сеанс, ≤ 1 с ---------- */
  var veil = $(".veil"), first = false;
  try { first = !sessionStorage.getItem("kh-veil"); sessionStorage.setItem("kh-veil", 1); } catch (e) { first = false; }
  if (veil && first && gsapOn && !reduce.matches) {
    veil.classList.add("on");
    G.timeline().fromTo(".veil i", { scaleX: 0 }, { scaleX: 1, duration: .5, ease: "power2.inOut" })
      .to(veil, { yPercent: -100, duration: .45, ease: "power3.inOut", onComplete: function () { veil.remove(); } });
  } else if (veil) veil.remove();

  /* ---------- вход hero (≤ 3,5 с) и «тихая жизнь» ---------- */
  if (gsapOn && !reduce.matches) {
    var delay = first ? .75 : .05;
    (d.fonts ? d.fonts.ready : Promise.resolve()).then(function () {
      var h1 = $("#hero-h"), split = SplitText.create(h1, { type: "lines", mask: "lines" });
      var tl = G.timeline({ delay: delay, defaults: { ease: "power3.out" } });
      tl.from(".hero-grid", { opacity: 0, duration: 1.2 }, 0)
        .from(".hv-shell", { drawSVG: "50% 50%", duration: 1.4, ease: "power2.inOut" }, .1)
        .from(".hv-l", { drawSVG: 0, duration: 1.1, stagger: .12, ease: "power2.inOut" }, .5)
        .from(split.lines, { yPercent: 110, duration: 1, stagger: .08, ease: "power4.out" }, .2)
        .from(".meta", { y: 12, opacity: 0, duration: .6 }, .2)
        .from(".lead", { y: 18, opacity: 0, duration: .8 }, .8)
        .from(".acts > *", { y: 16, opacity: 0, duration: .6, stagger: .08 }, 1.05)
        .from(".trust > div", { y: 14, opacity: 0, duration: .6, stagger: .08 }, 1.3)
        .from(".hv-rime", { opacity: 0, duration: 1.4, ease: "none" }, 1.2)
        .from(".hv-tag", { opacity: 0, x: -10, duration: .8 }, 1.9)
        .from(".hv-dim", { opacity: 0, duration: .8 }, 2.1)
        .from(".hero-v figcaption", { opacity: 0, y: 8, duration: .6 }, 2.3);
      /* тихая жизнь: иней едва «дышит» (цикл 60 с) */
      G.to(".hv-rime", { opacity: .7, duration: 30, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 4 });
    });
    if (fine) (function () {
      var hv = $(".hv"), hero = $(".hero"), qx = G.quickTo(hv, "x", { duration: 1.2, ease: "power3" }), qy = G.quickTo(hv, "y", { duration: 1.2, ease: "power3" });
      hero.addEventListener("pointermove", function (e) { qx((e.clientX / innerWidth - .5) * -14); qy((e.clientY / innerHeight - .5) * -10); });
      G.to(".hv", { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    })();
  }

  /* ---------- курсор-термощуп: остриё + щуп с ярлыком зоны ---------- */
  if (fine) (function () {
    var el = d.createElement("div"); el.className = "cur hide"; el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<i class="cur-tip"></i><span class="cur-probe"><i class="cur-rod"></i><b class="cur-tag"></b></span>';
    d.body.appendChild(el); root.classList.add("has-cur");
    var probe = el.querySelector(".cur-probe"), tag = el.querySelector(".cur-tag");
    var x = -100, y = -100, cx = x, cy = y, px = x, py = y, id = 0, txt = "", col = "";
    var ZC = { "Наружный воздух · до −60 °С": "#2B8BD0", "Корпус аппарата": "#7FB8DA", "Кабель электрообогрева": "#FF6A2B", "Теплоизоляция с обшивкой": "#3BAE9C", "Рабочая среда": "#FFC27A" };
    function label(t) {
      var z = t.closest && t.closest("[data-zone]"); if (z && z.closest(".sv")) return [z.getAttribute("data-zone"), ZC[z.getAttribute("data-zone")] || ""];
      var a = t.closest && t.closest("a,button"); if (!a) return ["", ""];
      if (a.dataset.cursor) return [a.dataset.cursor, ""];
      if (a.matches('a[href^="tel"]')) return ["Позвонить", "#FF6A2B"];
      if (a.matches('a[href^="mailto"]')) return ["Написать", "#FF6A2B"];
      if (a.matches(".add")) return [a.classList.contains("on") ? "Убрать" : "В запрос", "#FF6A2B"];
      if (a.matches('[role="tab"]')) return ["Задача", ""];
      if (a.matches(".ap-b")) return ["Проект", ""];
      if (a.matches(".ctrl-b")) return ["Шаг сцены", ""];
      if (a.matches('a[href^="#"]')) return ["Перейти", ""];
      if (a.matches("a[href]")) return ["Открыть", ""];
      return ["", ""];
    }
    function loop() {
      cx += (x - cx) * .45; cy += (y - cy) * .45; px += (x - px) * .16; py += (y - py) * .16;
      el.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px)";
      probe.style.transform = "translate(" + (px - cx).toFixed(1) + "px," + (py - cy).toFixed(1) + "px) rotate(" + Math.max(-18, Math.min(18, (cx - px) * .6)).toFixed(1) + "deg)";
      id = Math.abs(x - cx) + Math.abs(y - cy) + Math.abs(x - px) + Math.abs(y - py) > .3 ? requestAnimationFrame(loop) : 0;
    }
    addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY; el.classList.remove("hide");
      var t = e.target, field = t.closest && t.closest("input,textarea,select");
      el.classList.toggle("hide", !!field);
      var L = label(t);
      if (L[0] !== txt) { txt = L[0]; tag.textContent = txt; el.classList.toggle("tag", !!txt); el.classList.toggle("link", !!txt && !(t.closest && t.closest(".sv"))); }
      if (L[1] !== col) { col = L[1]; if (col) el.style.setProperty("--ct", col); else el.style.removeProperty("--ct"); }
      if (!id) id = requestAnimationFrame(loop);
    }, { passive: true });
    d.addEventListener("pointerleave", function () { el.classList.add("hide"); });
    addEventListener("pointerdown", function () { el.classList.add("down"); });
    addEventListener("pointerup", function () { el.classList.remove("down"); });
  })();

  /* ---------- подбор: сегментные вкладки с бегущей подложкой и подсветкой наведения (механика 21st «Segmented Tabs») ---------- */
  (function () {
    var seg = $(".seg"); if (!seg) return;
    var tabs = $$('[role="tab"]', seg), ind = $(".seg-ind", seg), hov = $(".seg-hover", seg);
    function place(i, b) { i.style.width = b.offsetWidth + "px"; i.style.height = b.offsetHeight + "px"; i.style.transform = "translate(" + b.offsetLeft + "px," + b.offsetTop + "px)"; }
    function sel(b, focus) {
      tabs.forEach(function (t) { var on = t === b; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; d.getElementById(t.getAttribute("aria-controls")).hidden = !on; });
      place(ind, b); if (focus) b.focus();
      var p = d.getElementById(b.getAttribute("aria-controls"));
      if (gsapOn && !reduce.matches) G.fromTo($$(".eq", p), { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .07, ease: "power3.out", clearProps: "transform,opacity" });
    }
    tabs.forEach(function (b, i) {
      b.addEventListener("click", function () { sel(b); });
      b.addEventListener("pointerenter", function () { place(hov, b); hov.style.opacity = 1; });
      b.addEventListener("keydown", function (e) {
        var k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key], n = null;
        if (k) n = tabs[(i + k + tabs.length) % tabs.length]; else if (e.key === "Home") n = tabs[0]; else if (e.key === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); sel(n, true); }
      });
    });
    seg.addEventListener("pointerleave", function () { hov.style.opacity = 0; });
    function re() { place(ind, tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0]); }
    re(); addEventListener("resize", re); if (d.fonts) d.fonts.ready.then(re);

    /* запрос: список выбранного → письмо в отдел продаж и поле формы */
    var list = $(".req-list"), empty = $(".req-empty"), picked = [], ta = $('textarea[name="Оборудование"]'), mail = $('.req-note a[href^="mailto"]');
    function render() {
      $$("li:not(.req-empty)", list).forEach(function (li) { li.remove(); });
      empty.hidden = picked.length > 0;
      picked.forEach(function (n) {
        var li = d.createElement("li"), s = d.createElement("span"), x = d.createElement("button");
        s.textContent = n; x.type = "button"; x.textContent = "×"; x.setAttribute("aria-label", "Убрать: " + n);
        x.addEventListener("click", function () { toggle(n); }); li.append(s, x); list.appendChild(li);
        if (gsapOn && !reduce.matches && n === render.last) G.from(li, { x: -14, opacity: 0, duration: .45, ease: "power3.out" });
      });
      if (ta) ta.value = picked.join("; ");
      mail.href = "mailto:zakaz@khm-msk.ru" + (picked.length ? "?subject=" + encodeURIComponent("Запрос оборудования") + "&body=" + encodeURIComponent("Интересует:\n— " + picked.join("\n— ")) : "");
      $$(".add").forEach(function (b) { var on = picked.indexOf(b.dataset.add) > -1; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); b.lastChild.nodeValue = on ? "В запросе" : "В запрос"; });
    }
    function toggle(n) { var i = picked.indexOf(n); if (i > -1) picked.splice(i, 1); else { picked.push(n); render.last = n; } render(); render.last = null; }
    $$(".add").forEach(function (b) { b.setAttribute("aria-pressed", "false"); b.addEventListener("click", function () { toggle(b.dataset.add); }); });
    $(".req-go").addEventListener("click", function () { setTimeout(function () { ta && ta.focus({ preventScroll: true }); }, 900); });
  })();

  /* ---------- сигнатурная сцена ---------- */
  (function () {
    var sec = $("#holod"); if (!sec || !gsapOn) return;
    var svg = $(".sv", sec), therm = $(".therm", svg), steps = $$(".st", sec), btns = $$(".ctrl-b", sec), dial = $(".dial input", sec), out = $(".dial output", sec);
    svg.insertBefore(therm, $(".core-zone", svg)); /* термограмма поверх аппарата */
    var so = $(".shell", svg).cloneNode(); so.removeAttribute("fill"); so.removeAttribute("data-zone"); so.setAttribute("class", "shell-o"); svg.insertBefore(so, $(".core-zone", svg));
    var NAMES = ["Мороз", "Обогрев", "Изоляция", "Термограмма"], AT = [.5, 2.7, 4.9, 7.6], cur = -1;
    /* снег: CSS-анимация, спит вне экрана */
    var sn = $(".snow", svg), R = rng(3);
    for (var i = 0; i < 36; i++) { var c = d.createElementNS(SVGNS, "circle"); c.setAttribute("cx", (60 + R() * 1080).toFixed(0)); c.setAttribute("cy", (R() * 120).toFixed(0)); c.setAttribute("r", (1 + R() * 2.2).toFixed(1)); c.setAttribute("opacity", (.3 + R() * .5).toFixed(2)); c.style.cssText = "--d:" + (9 + R() * 12).toFixed(1) + "s;--dl:-" + (R() * 20).toFixed(1) + "s;--dx:" + (-40 + R() * 30).toFixed(0) + "px"; sn.appendChild(c); }
    if (KIT.onView) KIT.onView(sec, function (v) { sec.classList.toggle("vis", v); });

    var tl = G.timeline({ paused: true, defaults: { ease: "none" } });
    G.set(".cable,.cable-in", { drawSVG: 0 }); G.set(".pulse,.jbox,.clad-seam", { opacity: 0 }); G.set(".band", { scaleY: 0, transformOrigin: "50% 100%" });
    tl.to({}, { duration: 1 })
      .to(".cable", { drawSVG: "100%", duration: 1.2, ease: "power1.inOut" }, 1)
      .to(".pulse", { opacity: 1, duration: .2 }, 1)
      .to(".pulse", { motionPath: { path: "#cable", align: "#cable", alignOrigin: [.5, .5] }, duration: 1.2, ease: "power1.inOut" }, 1)
      .to(".jbox", { opacity: 1, duration: .3 }, 1.9)
      .to(".cable-in", { drawSVG: "100%", duration: .3 }, 1.9)
      .to(".rime", { opacity: .45, duration: 1.2 }, 1.2)
      .to(".pulse", { opacity: 0, duration: .3 }, 2.3)
      .to(".band", { scaleY: 1, duration: .55, stagger: .12, ease: "power2.out" }, 3.2)
      .to(".clad-seam", { opacity: 1, duration: .4 }, 4)
      .to(".rime", { opacity: 0, duration: .8 }, 3.4)
      .to(".r1", { attr: { r: 640 }, duration: 1.6, ease: "power1.inOut" }, 5.4)
      .to(".r2", { attr: { r: 460 }, duration: 1.5, ease: "power1.inOut" }, 5.8)
      .to(".r3", { attr: { r: 420 }, duration: 1.4, ease: "power1.inOut" }, 6.2)
      .to(".band", { opacity: .35, duration: 1 }, 5.6)
      .to({}, { duration: .8 }, 7.6);
    var D = tl.duration();
    function stepOf(t) { return t < 1.6 ? 0 : t < 3.9 ? 1 : t < 6 ? 2 : 3; }
    function show(i) {
      if (i === cur) return; cur = i;
      steps.forEach(function (s, k) { s.classList.toggle("on", k === i); });
      btns.forEach(function (b, k) { b.setAttribute("aria-pressed", k === i); });
      out.textContent = NAMES[i]; dial.setAttribute("aria-valuetext", NAMES[i]);
      svg.classList.toggle("is-therm", i === 3);
      $(".core-zone", svg).style.pointerEvents = i === 3 ? "auto" : "none";
    }
    tl.eventCallback("onUpdate", function () { show(stepOf(tl.time())); var v = Math.round(tl.progress() * 100); if (+dial.value !== v && d.activeElement !== dial) dial.value = v; });
    show(0);

    var st = null;
    function toTime(t, instant) {
      if (st) { go(st.start + (t / D) * (st.end - st.start)); return; }
      if (instant || reduce.matches) tl.pause().time(t); else tl.tweenTo(t, { duration: 1.1, ease: "power2.inOut" });
    }
    btns.forEach(function (b, k) { b.addEventListener("click", function () { toTime(AT[k]); }); });
    dial.addEventListener("input", function () { var t = dial.value / 100 * D; if (st) go(st.start + dial.value / 100 * (st.end - st.start)); else tl.pause().time(t); });

    var mm = G.matchMedia();
    mm.add({ scrub: "(min-width: 901px) and (prefers-reduced-motion: no-preference)", stat: "(max-width: 900px), (prefers-reduced-motion: reduce)" }, function (ctx) {
      if (ctx.conditions.scrub) {
        st = ScrollTrigger.create({ trigger: sec, start: "top top", end: function () { return "+=" + Math.round(innerHeight * 3.4); }, pin: true, scrub: .8, animation: tl, invalidateOnRefresh: true });
        return function () { st = null; };
      }
      sec.classList.add("no-scrub"); tl.pause().time(AT[3]); show(3);
      return function () { sec.classList.remove("no-scrub"); };
    });
  })();

  /* ---------- печь: аппарат въезжает по направляющим (scrub) ---------- */
  if (gsapOn) {
    if (reduce.matches) G.set(".furn-ves", { x: 330 });
    else G.timeline({ scrollTrigger: { trigger: ".furn", start: "top 85%", end: "center 35%", scrub: .6 } })
      .to(".furn-ves", { x: 330, ease: "power1.inOut" }, 0)
      .to(".rollers circle", { rotation: 360, transformOrigin: "50% 50%", ease: "none" }, 0)
      .to(".oven-glow", { opacity: .34, ease: "none" }, .4);
  }

  /* ---------- проекты: горизонтальный аккордеон (механика 21st «Hover Expand») ---------- */
  (function () {
    var ps = $$(".ap"); if (!ps.length) return;
    var wide = matchMedia("(min-width: 1200px)"), tm = 0;
    function open(p, toggle) {
      var was = p.hasAttribute("data-open");
      ps.forEach(function (q) { var on = q === p && !(toggle && was && !wide.matches); q.toggleAttribute("data-open", on); $(".ap-b", q).setAttribute("aria-expanded", on); });
    }
    ps.forEach(function (p) {
      $(".ap-b", p).addEventListener("click", function () { open(p, true); });
      if (fine) p.addEventListener("pointerenter", function () { if (!wide.matches) return; clearTimeout(tm); tm = setTimeout(function () { open(p); }, 140); });
      if (fine) p.addEventListener("pointerleave", function () { clearTimeout(tm); });
    });
  })();

  /* ---------- бегущая строка партнёров: скорость растёт от прокрутки ---------- */
  (function () {
    var run = $(".run"), t = $(".run-t"); if (!run || !t || !KIT.raf) return;
    t.innerHTML += t.innerHTML;
    if (reduce.matches) return;
    var x = 0, lastY = scrollY, v = 0;
    KIT.raf(run, function (time, dt) {
      var dy = scrollY - lastY; lastY = scrollY; v += (Math.min(Math.abs(dy), 80) - v) * .1;
      x -= (40 + v * 6) * dt / 1000; var half = t.scrollWidth / 2; if (half && -x > half) x += half;
      t.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
    }, 30);
  })();

  /* ---------- форма: состояние кнопки ---------- */
  (function () {
    var f = $("form[data-demo-form]"); if (!f) return;
    f.addEventListener("submit", function () {
      var done = $(".done", f);
      if (gsapOn && !reduce.matches) G.from(done, { y: 16, opacity: 0, duration: .6, ease: "power3.out" });
    });
  })();

  if (gsapOn) addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
