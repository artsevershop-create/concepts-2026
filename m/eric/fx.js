/* Движение «одной квитанции»: шторка, вход hero, курсор-скрепка (над строкой — лупа), кнопки, подсказки,
   сцена «разбор квитанции» на ScrollTrigger (pin + DrawSVG + MotionPath), поток платежа, листы, бегущая строка, ледяная пыль.
   Без GSAP страница остаётся рабочей и статичной. */
(function () {
  "use strict";
  var d = document, root = d.documentElement, g = window.gsap;
  var RM = matchMedia("(prefers-reduced-motion: reduce)"), FINE = matchMedia("(hover:hover) and (pointer:fine)");
  var $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var mk = function (tag, cls, text) { var e = d.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
  if (!g || !window.ScrollTrigger || !window.DrawSVGPlugin || !window.MotionPathPlugin) { root.classList.remove("fx", "pre-on"); return; }
  g.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);
  var still = function () { return !!(window.KIT && KIT.still); };

  /* ───── прогресс чтения ───── */
  var prog = $(".prog");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: function (s) { prog.style.transform = "scaleX(" + s.progress.toFixed(4) + ")"; } });

  /* ───── кнопки: перекат текста, заливка из точки входа, стрелка ───── */
  $$(".btn").forEach(function (b) {
    var t = b.textContent.trim(), r = mk("span", "roll"), a = mk("span", "", t), c = mk("span", "", t);
    c.setAttribute("aria-hidden", "true"); r.append(a, c); b.textContent = ""; b.append(mk("span", "fill"), r);
    if (b.classList.contains("fm-send")) { var ar = mk("i", "arr", "→"); ar.setAttribute("aria-hidden", "true"); b.appendChild(ar); }
    var xy = function (e) { var q = b.getBoundingClientRect(); b.style.setProperty("--mx", (e.clientX - q.left) + "px"); b.style.setProperty("--my", (e.clientY - q.top) + "px"); };
    b.addEventListener("pointerenter", xy); b.addEventListener("pointerleave", xy);
  });
  var label = function (b, t) { $$(".roll>span", b).forEach(function (x) { x.textContent = t; }); };

  /* ───── подсветка карточек за курсором ───── */
  $$(".spot,.act").forEach(function (el) {
    el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); el.style.setProperty("--x", (e.clientX - r.left) + "px"); el.style.setProperty("--y", (e.clientY - r.top) + "px"); });
  });

  /* ───── подсказки ───── */
  var tip = $("#tip");
  function showTip(el) { tip.textContent = el.dataset.tip; var r = el.getBoundingClientRect(), w = Math.min(280, innerWidth - 24); tip.style.maxWidth = w + "px"; tip.classList.add("on"); var tr = tip.getBoundingClientRect(); var x = Math.max(12, Math.min(innerWidth - tr.width - 12, r.left)), y = r.top - tr.height - 10; if (y < 70) y = r.bottom + 10; tip.style.left = x + "px"; tip.style.top = y + "px"; el.setAttribute("aria-describedby", "tip"); }
  function hideTip(el) { tip.classList.remove("on"); if (el) el.removeAttribute("aria-describedby"); }
  $$("[data-tip]").forEach(function (el) {
    el.addEventListener("mouseenter", function () { showTip(el); }); el.addEventListener("mouseleave", function () { hideTip(el); });
    el.addEventListener("focus", function () { showTip(el); }); el.addEventListener("blur", function () { hideTip(el); });
  });
  addEventListener("scroll", function () { tip.classList.remove("on"); }, { passive: true });

  /* ───── курсор: точка + кольцо со скрепкой; над ссылкой — подпись, над строкой квитанции — лупа ───── */
  (function cursor() {
    if (!FINE.matches || RM.matches) return;
    root.classList.add("has-cur");
    var c = $(".cur"), dot = $(".cur-d"), ring = $(".cur-r"), lab = $(".cur-l");
    var mx = -100, my = -100, rx = -100, ry = -100, id = 0, rot = 18;
    function loop() {
      rx += (mx - rx) * .2; ry += (my - ry) * .2; var vx = mx - rx;
      rot += ((18 + Math.max(-40, Math.min(40, vx * .9))) - rot) * .15;
      ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)"; ring.style.setProperty("--rot", rot.toFixed(1) + "deg");
      id = Math.abs(mx - rx) + Math.abs(my - ry) > .2 ? requestAnimationFrame(loop) : 0;
    }
    addEventListener("pointermove", function (e) { if (e.pointerType !== "mouse") return; mx = e.clientX; my = e.clientY; dot.style.transform = "translate(" + mx + "px," + my + "px)"; if (rx < -50) { rx = mx; ry = my; c.classList.remove("is-init"); } if (!id) id = requestAnimationFrame(loop); }, { passive: true });
    d.addEventListener("pointerover", function (e) {
      var t = e.target, s = c.classList;
      s.toggle("is-hide", !!t.closest("input:not([type=radio]):not([type=checkbox]),textarea,select"));
      var row = t.closest(".kv-row"), a = !row && t.closest("a,button,label,[data-cur]");
      s.toggle("is-lens", !!row);
      s.toggle("is-link", !!a);
      s.toggle("is-paper", !row && !a && !!t.closest(".kv-paper,.hero-city"));
      s.toggle("is-dark", !!t.closest("[data-theme=night]"));
      if (a) lab.textContent = a.dataset.cur || (a.href && a.href.indexOf("tel:") === 0 ? "Позвонить" : a.href && a.href.indexOf("mailto:") === 0 ? "Написать" : a.target === "_blank" ? "Перейти" : a.tagName === "A" ? "Открыть" : "Выбрать");
    });
    d.addEventListener("pointerdown", function () { c.classList.add("is-down"); });
    d.addEventListener("pointerup", function () { c.classList.remove("is-down"); });
    d.addEventListener("mouseleave", function () { c.classList.add("is-hide"); });
    d.addEventListener("mouseenter", function () { c.classList.remove("is-hide"); });
  })();

  /* ───── демо-форма: проверка, состояние «отправляем», затем отчёт kit ───── */
  (function form() {
    var f = $(".ct-form"); if (!f) return; var b = $(".fm-send", f), ok = false;
    f.addEventListener("submit", function (e) {
      if (ok) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var bad = $$("[required]", f).filter(function (i) { return i.type === "checkbox" ? !i.checked : !i.value.trim(); });
      $$("[required]", f).forEach(function (i) { i.setAttribute("aria-invalid", bad.indexOf(i) >= 0); });
      if (bad.length) { bad[0].focus(); if (!RM.matches) g.fromTo(b, { x: 0 }, { keyframes: { x: [-6, 6, -4, 3, 0] }, duration: .4 }); label(b, "Заполните поля"); setTimeout(function () { label(b, "Отправить обращение"); }, 1600); return; }
      b.classList.add("is-busy"); label(b, "Отправляем…");
      setTimeout(function () { ok = true; label(b, "Отправить обращение"); b.classList.remove("is-busy"); f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event("submit", { cancelable: true })); ok = false; }, RM.matches ? 0 : 700);
    }, true);
  })();

  /* ───── шторка и вход первого экрана ───── */
  function curtain() {
    if (!$(".pre") || !root.classList.contains("pre-on")) return 0;
    g.timeline({ onComplete: function () { root.classList.remove("pre-on"); } })
      .from(".pre img", { opacity: 0, y: 14, duration: .3, ease: "power3.out" })
      .fromTo(".pre i", { scaleX: 0 }, { scaleX: 1, duration: .35, ease: "power2.inOut" }, .1)
      .to(".pre", { clipPath: "inset(0 0 100% 0)", duration: .45, ease: "power4.inOut" }, "+=.02");
    return .6;
  }
  function heroIn() {
    var at = curtain(); root.classList.remove("fx");
    if (RM.matches) return;
    var tl = g.timeline({ delay: at, defaults: { ease: "power3.out" } });
    tl.from(".hero-city img", { clipPath: "inset(30% 0 0 0)", scale: 1.12, duration: 1.6, ease: "power2.out" }, 0)
      .from(".hero-kicker", { y: 14, opacity: 0, duration: .6 }, .05)
      .from(".hero-kicker .dots i", { scale: 0, duration: .5, stagger: .07, ease: "back.out(2)" }, .15)
      .from(".hero h1 .ln>span", { yPercent: 112, duration: 1, stagger: .1, ease: "power4.out" }, .15)
      .from(".hero h1 mark", { backgroundSize: "0% 100%", duration: .8, ease: "power2.inOut" }, .95)
      .from(".lead", { y: 18, opacity: 0, duration: .7 }, .55)
      .from(".act", { y: 26, opacity: 0, duration: .7, stagger: .08 }, .6)
      .from(".cal", { y: 18, opacity: 0, duration: .6 }, .95)
      .from(".cal-days i", { scaleY: 0, duration: .5, stagger: .015, ease: "back.out(1.6)" }, 1.1)
      .from(".act-badge", { scale: .4, opacity: 0, duration: .5, ease: "back.out(2.2)" }, 1.4);
  }

  /* ───── тихая жизнь hero: параллакс фото по мыши ───── */
  (function heroLife() {
    if (!FINE.matches || RM.matches) return;
    var img = $(".hero-city"), qx = g.quickTo(img, "x", { duration: 1.2, ease: "power3" });
    $(".hero").addEventListener("pointermove", function (e) { qx((e.clientX / innerWidth - .5) * -16); });
  })();

  /* ───── ледяная пыль в hero (≤ 36 частиц, пауза вне экрана) ───── */
  (function air() {
    var cv = $(".hero-air"); if (!cv || !window.KIT) return;
    var cx = cv.getContext("2d"), W = 0, H = 0, dpr = Math.min(2, devicePixelRatio || 1), P = [];
    function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener("resize", size);
    for (var i = 0; i < 36; i++) P.push({ x: Math.random(), y: Math.random(), r: .8 + Math.random() * 2.2, v: .006 + Math.random() * .012, w: Math.random() * 6.28, s: Math.random() < .25 });
    KIT.raf(cv, function (t, dt) {
      cx.clearRect(0, 0, W, H);
      P.forEach(function (p) {
        p.y += p.v * dt / 1000; p.w += dt / 1600; if (p.y > 1.02) { p.y = -.02; p.x = Math.random(); }
        var x = (p.x + Math.sin(p.w) * .01) * W, y = p.y * H, a = .25 + .35 * Math.sin(p.w * 1.7) * Math.sin(p.w * 1.7);
        cx.fillStyle = p.s ? "rgba(255,200,61," + (a * .9).toFixed(3) + ")" : "rgba(10,116,126," + (a * .5).toFixed(3) + ")";
        cx.beginPath(); cx.arc(x, y, p.r, 0, 6.283); cx.fill();
      });
    }, 30);
  })();

  /* ───── сцена: разбор квитанции ───── */
  var KV = window.KV, paper = $(".kv-paper"), rows = $$(".kv-row"), lens = $(".kv-lens"), kvg = $(".kv-g"), linkP = $(".kv-link path"), cutsG = $(".kv-cuts g"), paperW = $(".kv-paper-w");
  function rel(el, to) { var a = el.getBoundingClientRect(), b = to.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; }
  function buildCuts() {
    cutsG.textContent = ""; var NS = "http://www.w3.org/2000/svg", W = paper.clientWidth;
    rows.slice(1).forEach(function (r) { var l = d.createElementNS(NS, "line"), y = r.offsetTop; l.setAttribute("x1", 18); l.setAttribute("x2", W - 18); l.setAttribute("y1", y); l.setAttribute("y2", y); cutsG.appendChild(l); });
  }
  function pt(k) { var q = rel(rows[k], paperW); return { x: paper.clientWidth - 72, y: q.y + q.h / 2 - 24 }; }
  function drawLink(i, animate) {
    if (innerWidth <= 900) return;
    var r = rel(rows[i], kvg), c = rel($(".kv-card.is-on"), kvg);
    var x1 = r.x + r.w + 6, y1 = r.y + r.h / 2, x2 = c.x - 6, y2 = c.y + 40, mx = (x1 + x2) / 2;
    linkP.setAttribute("d", "M" + x1 + "," + y1 + " C" + mx + "," + y1 + " " + mx + "," + y2 + " " + x2 + "," + y2);
    if (animate && !RM.matches) g.fromTo(linkP, { drawSVG: "0%" }, { drawSVG: "100%", duration: .6, ease: "power2.out" }); else g.set(linkP, { drawSVG: "100%" });
  }
  KV.listeners.push(function (i, quiet) {
    var card = $(".kv-card.is-on");
    if (!RM.matches) g.fromTo(card.children, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .06, ease: "power3.out", overwrite: true });
    drawLink(i, true);
  });
  buildCuts();
  addEventListener("resize", function () { buildCuts(); drawLink(KV.i, false); });
  addEventListener("load", function () { buildCuts(); drawLink(KV.i, false); ScrollTrigger.refresh(); });

  var mm = g.matchMedia();
  /* широкий экран: закрепляем сцену, прокрутка ведёт лупу по строкам */
  mm.add("(min-width:1024px) and (min-height:680px) and (prefers-reduced-motion: no-preference)", function () {
    var N = rows.length, A = .06, last = -1;
    lens.style.display = "block";
    var intro = g.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".kv", start: "top 85%", end: "top 5%", scrub: .6 } }), tl = g.timeline({ defaults: { ease: "none" } });
    intro.fromTo(paper, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: .8 }, 0)
      .from(".kv-clip", { y: -40, opacity: 0, duration: .4 }, .5)
      .fromTo(".kv-cuts line", { drawSVG: "0%" }, { drawSVG: "100%", duration: .5, stagger: .08 }, .3)
      .fromTo(".kv-meter b", { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .3, stagger: .03 }, .5)
      .from(".kv-qr", { scale: .3, opacity: 0, duration: .3 }, .7);
    tl.fromTo(lens, { opacity: 0, x: function () { return pt(0).x; }, y: function () { return pt(0).y - 60; } }, { opacity: 1, y: function () { return pt(0).y; }, duration: A }, 0);
    var seg = (1 - A) / N;
    for (var k = 1; k < N; k++) (function (k) { /* лупа переезжает по дуге к строке k в начале её шага и стоит на ней остаток плато */
      tl.to(lens, { motionPath: { path: function () { var a = pt(k - 1), b = pt(k), sw = k % 2 ? -44 : 36; return [{ x: a.x + sw, y: a.y + (b.y - a.y) * .5 }, { x: b.x, y: b.y }]; }, curviness: 1.3 }, duration: seg * .4, ease: "power1.inOut" }, A + k * seg - seg * .15);
    })(k);
    var st = ScrollTrigger.create({
      trigger: ".kv-pin", start: "top top", end: "+=" + Math.round(N * .85 * 100) + "%", pin: true, scrub: .6, animation: tl, invalidateOnRefresh: true,
      onUpdate: function (s) { var k = Math.max(0, Math.min(N - 1, Math.floor((s.progress - A) / ((1 - A) / N)))); if (k !== last) { last = k; KV.set(k, true); } }
    });
    KV.go = function (i) {
      var p = A + (i + .5) * (1 - A) / N, y = st.start + p * (st.end - st.start);
      if (window.KIT && KIT.lenis) KIT.lenis.scrollTo(y, { duration: 1 }); else scrollTo({ top: y, behavior: "smooth" });
      KV.set(i); return true;
    };
    return function () { KV.go = null; lens.style.display = "none"; g.set(paper, { clipPath: "none" }); };
  });
  /* остальное: квитанция просто появляется, линии рисуются при входе */
  mm.add("(max-width:1023px), (max-height:679px)", function () {
    if (RM.matches) return;
    g.fromTo(".kv-cuts line", { drawSVG: "0%" }, { drawSVG: "100%", duration: .8, stagger: .1, scrollTrigger: { trigger: paper, start: "top 80%" } });
  });

  /* ───── поток платежа: линии рисуются, точки идут по путям вместе с прокруткой ───── */
  mm.add("(prefers-reduced-motion: no-preference)", function () {
    var dots = $$(".fl-dot"), paths = $$(".fl-p");
    var tl = g.timeline({ scrollTrigger: { trigger: ".flow", start: "top 85%", end: "bottom 30%", scrub: .8 } });
    tl.from(".fl-src", { scale: .6, opacity: 0, duration: .15 }, 0)
      .fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", duration: .4, stagger: .06 }, .1)
      .from(".fl-dst li", { y: 16, opacity: 0, duration: .2, stagger: .06 }, .3);
    dots.forEach(function (c, i) {
      tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: .05 }, .35 + i * .05)
        .to(c, { motionPath: { path: paths[i], align: paths[i], alignOrigin: [.5, .5] }, duration: .5, ease: "power1.inOut" }, .35 + i * .05);
    });
    tl.to(".fl-dst li", { backgroundColor: "rgba(255,200,61,.16)", borderColor: "rgba(255,200,61,.6)", duration: .1, stagger: .05 }, .8);

    /* параллакс фото hero при прокрутке */
    g.to(".hero-city img", { yPercent: -12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

    /* листы наезжают: предыдущий слой чуть отступает */
    $$(".sheet").forEach(function (s) {
      var prev = s.previousElementSibling; if (!prev || prev.classList.contains("kv") || prev.classList.contains("marq")) return;
      var w = prev.querySelector(".wrap"); if (!w) return;
      g.to(w, { scale: .965, opacity: .55, transformOrigin: "50% 100%", ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "top 30%", scrub: true } });
    });

    /* бегущая строка: скорость и направление от прокрутки */
    var mt = $(".marq-t"); mt.innerHTML += mt.innerHTML;
    var loop = g.to(mt, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
    ScrollTrigger.create({ trigger: ".marq", start: "top bottom", end: "bottom top", onUpdate: function (s) { var v = s.getVelocity() / 600; g.to(loop, { timeScale: (s.direction < 0 ? -1 : 1) * Math.min(4, 1 + Math.abs(v)), duration: .3, overwrite: true }); } });

    /* офисы: карточки появляются волной при фильтре */
    d.addEventListener("of:draw", function () { g.from("#of-list li", { y: 12, opacity: 0, duration: .4, stagger: .03, ease: "power2.out", overwrite: true }); });
    return function () { mt.innerHTML = mt.innerHTML.slice(0, mt.innerHTML.length / 2); };
  });

  d.addEventListener("kit:still", function () { g.globalTimeline.paused(still()); });
  /* живое переключение reduced motion: hero и курсор пересобираются перезагрузкой состояния классов */
  RM.addEventListener("change", function () { if (RM.matches) { root.classList.remove("has-cur", "fx", "pre-on"); g.set(".hero *, .act, .cal", { clearProps: "all" }); } });

  heroIn();
})();
