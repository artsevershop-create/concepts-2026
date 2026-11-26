(function () {
  "use strict";
  var d = document, root = d.documentElement, KIT = window.KIT || {}, G = window.gsap;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)"), wide = matchMedia("(min-width:981px)");
  var fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var gsapOn = !!(G && window.ScrollTrigger);
  if (gsapOn) G.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);
  function go(y, now) { if (KIT.lenis) KIT.lenis.scrollTo(y, { force: true, immediate: !!now }); else scrollTo({ top: y, behavior: now || reduce.matches ? "auto" : "smooth" }); }

  /* ---------- кнопки: перекат текста, стрелка, заливка из точки входа ---------- */
  var ARROW = '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  $$(".btn").forEach(function (b) {
    if (!b.children.length) {
      var t = b.textContent.trim(), r = d.createElement("span"), a = d.createElement("span"), c = d.createElement("span");
      r.className = "roll"; a.textContent = t; c.textContent = t; c.setAttribute("aria-hidden", "true"); r.append(a, c);
      b.textContent = ""; b.appendChild(r);
      if (b.hasAttribute("data-arrow")) b.insertAdjacentHTML("beforeend", ARROW);
    }
    function pos(e) { var q = b.getBoundingClientRect(); b.style.setProperty("--mx", (e.clientX - q.left) + "px"); b.style.setProperty("--my", (e.clientY - q.top) + "px"); }
    b.addEventListener("pointerenter", pos); b.addEventListener("pointerleave", pos);
  });
  if (fine) $$("[data-spot]").forEach(function (c) {
    c.addEventListener("pointermove", function (e) { var q = c.getBoundingClientRect(); c.style.setProperty("--x", (e.clientX - q.left) + "px"); c.style.setProperty("--y", (e.clientY - q.top) + "px"); });
  });

  /* ---------- курсор: капля пламени; над полями гаснет до струйки дыма ---------- */
  if (fine) (function () {
    var el = d.createElement("div"); el.className = "cur"; el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<div class="cur-ring"><i></i><b></b></div><div class="cur-flame"><svg viewBox="0 0 16 22"><path class="fo" d="M8 0C9.5 5 15 8 15 14a7 7 0 0 1-14 0C1 10 4 8 5 4c1 2 2 3 3 3C8 5 8 2 8 0Z"/><path class="fi" d="M8 10c1 2.5 3.5 3.5 3.5 6a3.5 3.5 0 0 1-7 0c0-2 2-3 3.5-6Z"/></svg><i class="cur-smoke"></i></div>';
    d.body.appendChild(el); root.classList.add("has-cur");
    var ring = el.firstChild, flame = ring.nextSibling, tag = ring.querySelector("b");
    var x = -100, y = -100, rx = x, ry = y, id = 0, shown = false;
    function label(a) {
      if (a.dataset.cursor) return a.dataset.cursor;
      if (a.matches('a[href^="tel"]')) return "Позвонить";
      if (a.matches('a[href^="mailto"]')) return "Написать";
      if (a.matches('[target="_blank"]')) return "Открыть";
      if (a.matches("[role=tab]")) return "Ситуация";
      if (a.closest(".rail-dots")) return "Шаг";
      if (a.matches("[data-next]")) return "Дальше";
      if (a.matches("[data-prev]")) return "Назад";
      if (a.matches('[type="submit"]')) return "Отправить";
      if (a.matches('a[href^="#"]')) return "Перейти";
      return "";
    }
    function loop() {
      rx += (x - rx) * .2; ry += (y - ry) * .2;
      flame.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      ring.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0)";
      id = Math.abs(x - rx) + Math.abs(y - ry) > .1 ? requestAnimationFrame(loop) : 0;
    }
    addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      x = e.clientX; y = e.clientY; if (!shown) { shown = true; rx = x; ry = y; el.classList.add("on"); }
      if (!id) id = requestAnimationFrame(loop);
    }, { passive: true });
    d.addEventListener("pointerover", function (e) {
      var t = e.target; if (!t.closest) return;
      var f = t.closest("input,textarea,select"), a = !f && t.closest("a,button,summary,[role=tab],label"), l = a ? label(a) : "";
      el.classList.toggle("is-field", !!f); el.classList.toggle("is-link", !!a); el.classList.toggle("has-label", !!l);
      el.classList.toggle("is-red", !!(a && (a.matches('a[href="tel:104"],a[href="tel:04"],.is-red') || a.closest(".sos,.c-sos"))));
      el.classList.toggle("is-art", !a && !f && !!t.closest(".art"));
      el.classList.toggle("on-dark", !!t.closest('[data-theme="night"]'));
      if (l) tag.textContent = l;
    });
    root.addEventListener("mouseleave", function () { el.classList.remove("on"); shown = false; });
  })();

  /* ---------- меню: текущий раздел и бегунок ---------- */
  var nav = $(".nav"), runner = $(".runner"), links = $$("a", nav);
  function run() {
    var a = nav.querySelector("a[aria-current]");
    if (!a || getComputedStyle(runner).display === "none") { runner.style.opacity = 0; return; }
    runner.style.opacity = 1; runner.style.width = a.offsetWidth - 20 + "px"; runner.style.transform = "translateX(" + (a.offsetLeft + 10) + "px)";
  }
  var navIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) { if (a.hash === "#" + e.target.id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
      run();
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main>section[id]").forEach(function (s) { navIO.observe(s); });
  addEventListener("resize", run);

  /* ---------- прогресс чтения ---------- */
  var bar = $(".progress"), tick = false;
  function prog() { tick = false; var h = root.scrollHeight - innerHeight; bar.style.transform = "scaleX(" + (h > 0 ? clamp(scrollY / h) : 0).toFixed(4) + ")"; }
  addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(prog); } }, { passive: true }); prog();

  /* ---------- hero: вход по таймлайну, пылинки в луче окна, параллакс ---------- */
  var heroH = $(".hero-h");
  function heroIn() {
    root.classList.remove("hero-pre");
    if (!gsapOn || reduce.matches) return;
    var split = new SplitText(heroH, { type: "lines", linesClass: "ln", mask: "lines" });
    var tl = G.timeline({ defaults: { ease: "expo.out" }, delay: root.classList.contains("pre") ? .95 : .1 });
    tl.from(".window", { opacity: 0, scale: 1.04, duration: 1.4, ease: "power2.out" })
      .from(".window-frame path", { drawSVG: "0%", duration: 1.3, stagger: .12, ease: "power2.inOut" }, "<.1")
      .from(split.lines, { yPercent: 110, duration: 1.1, stagger: .1 }, "<.15")
      .from(".hero .eyebrow", { opacity: 0, y: 12, duration: .8 }, "<")
      .from(".hero .lead", { opacity: 0, y: 18, duration: .9 }, "-=.7")
      .from(".hero-cta > *", { opacity: 0, y: 16, duration: .8, stagger: .08 }, "-=.65")
      .from(".sos", { opacity: 0, y: 40, duration: 1.1 }, "-=.9")
      .from(".sos-steps li", { opacity: 0, x: -10, duration: .6, stagger: .07 }, "-=.6")
      .from(".hero-facts > div", { opacity: 0, y: 12, duration: .7, stagger: .08 }, "-=.6");
  }
  if (d.readyState === "complete") heroIn(); else addEventListener("load", heroIn);
  setTimeout(function () { root.classList.remove("hero-pre"); }, 3800);

  var win = $("[data-par]");
  if (fine && win) (function () {
    var tx = 0, ty = 0, cx = 0, cy = 0, id = 0, hero = $(".hero");
    function loop() { cx += (tx - cx) * .07; cy += (ty - cy) * .07; win.style.translate = cx.toFixed(2) + "px " + cy.toFixed(2) + "px"; id = Math.abs(tx - cx) + Math.abs(ty - cy) > .05 ? requestAnimationFrame(loop) : 0; }
    hero.addEventListener("pointermove", function (e) { if (reduce.matches) return; tx = (e.clientX / innerWidth - .5) * -16; ty = (e.clientY / innerHeight - .5) * -10; if (!id) id = requestAnimationFrame(loop); });
  })();

  var cv = $(".motes");
  if (cv && KIT.raf) (function () {
    var ctx = cv.getContext("2d"), P = [], W = 0, H = 0, dpr = Math.min(2, devicePixelRatio || 1);
    function size() { W = cv.offsetWidth; H = cv.offsetHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener("resize", size);
    for (var i = 0; i < 38; i++) P.push({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 1.8, v: .004 + Math.random() * .01, ph: Math.random() * 6.3 });
    KIT.raf(cv, function (t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], yy = ((p.y - t * p.v * .001) % 1 + 1) % 1, xx = p.x + Math.sin(t * .0003 + p.ph) * .02;
        ctx.globalAlpha = .25 + .35 * Math.sin(t * .0008 + p.ph) * Math.sin(t * .0008 + p.ph);
        ctx.fillStyle = "#fff6e0"; ctx.beginPath(); ctx.arc(xx * W, yy * H, p.r, 0, 6.283); ctx.fill();
      }
    }, 30);
  })();

  /* ---------- параллакс и появление секций ---------- */
  if (gsapOn && !reduce.matches) {
    G.utils.toArray(".sheet,.about").forEach(function (s) {
      G.from(s, { y: 60, ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "top 60%", scrub: true } });
    });
    G.to(".marquee .mq-track", { xPercent: -8, ease: "none", scrollTrigger: { trigger: ".marquee", start: "top bottom", end: "bottom top", scrub: true } });
  }

  /* ---------- демо-форма: состояние «отправляется» ---------- */
  $$("form[data-demo-form]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      if (f.dataset.go) { delete f.dataset.go; return; }
      e.preventDefault(); e.stopImmediatePropagation();
      var b = f.querySelector("[type=submit]"); b.classList.add("is-sending");
      setTimeout(function () { b.classList.remove("is-sending"); f.dataset.go = 1; f.requestSubmit(b); }, reduce.matches ? 0 : 900);
    }, true);
  });

  /* =================== ПОМОЩНИК «ЧТО ДЕЛАТЬ, ЕСЛИ…» =================== */
  var help = $("[data-helper]"); if (!help) return;
  var tabs = $$("[role=tab]", help), lists = $$(".steps", help), art = $(".art", help), svg = $(".art-svg", help), cap = $(".art-cap", help);
  var railSvg = $(".rail-svg", help), dotsBox = $(".rail-dots", help), prevB = $("[data-prev]", help), nextB = $("[data-next]", help);
  var outline = $(".outline", help), panel = $("#p-help");
  var lock = 0, sc = "gas", idx = -1, items = [], loops = [], tl = null, st = null, rail = null;
  var S = function (s) { return svg.querySelectorAll(s); };
  var TRANSIENT = { schedule: 1, contract: 1, docs: 1, order: 1, receipt: 1, app: 1, desk: 1, apply: 1, status: 1 };
  var MONTHS = "ЯФМАМИИАСОНД";

  lists.forEach(function (ol) { var li = $$("li", ol); li.forEach(function (l, i) { l.dataset.k = "Шаг " + (i + 1) + " из " + li.length; }); });
  // сетка месяцев для графика ТО
  (function () { var g = svg.querySelector(".cells"), NS = "http://www.w3.org/2000/svg"; for (var i = 0; i < 12; i++) { var r = d.createElementNS(NS, "rect"), t = d.createElementNS(NS, "text"), cx = 16 + (i % 4) * 44, cy = 50 + Math.floor(i / 4) * 40; r.setAttribute("x", cx); r.setAttribute("y", cy); r.setAttribute("width", 38); r.setAttribute("height", 32); r.setAttribute("rx", 5); t.setAttribute("x", cx + 19); t.setAttribute("y", cy + 21); t.setAttribute("text-anchor", "middle"); t.setAttribute("class", "lbl"); t.textContent = MONTHS[i]; g.append(r, t); } })();

  function reset() {
    loops.forEach(function (l) { l.kill(); }); loops = [];
    if (tl) { tl.kill(); tl = null; }
    $$(".ov", svg).forEach(function (o) { o.classList.remove("on"); });
    $$(".hl", svg).forEach(function (o) { o.classList.remove("hl"); });
    if (!G) return;
    G.killTweensOf(svg.querySelectorAll("*"));
    G.set(S(".flames circle"), { scale: 1, opacity: 1, transformOrigin: "50% 50%" });
    G.set(S(".v-rot"), { rotation: 0, transformOrigin: "50% 50%" });
    G.set(S(".x,.tick,.ban circle,.ban path,.route,.link-a,.link-b,.status circle,.ov .ln,.slip .ln"), { drawSVG: "0%" });
    G.set(S(".ban"), { opacity: 1 });
    G.set(S(".sash"), { rotation: 0, svgOrigin: "300 30" }); G.set(S(".leaf"), { rotation: 0, svgOrigin: "80 360" });
    G.set(S(".swing"), { opacity: 0 });
    G.set(S(".haze"), { opacity: sc === "gas" ? 1 : 0 });
    G.set(S(".air circle,.walker,.mail,.phone,.meet,.lbl-a,.lbl-b,.status"), { opacity: 0 });
    G.set(S(".phone"), { scale: 1, transformOrigin: "50% 50%" });
    G.set(S(".dev,.till,.slip"), { opacity: 1 });
    G.set(S(".plate rect,.plate>circle"), { drawSVG: "100%" });
    G.set(S(".hand-h"), { rotation: 0, svgOrigin: "330 235" }); G.set(S(".hand-m"), { rotation: 0, svgOrigin: "330 235" });
    G.set(S(".ov"), { opacity: 1, y: 0 }); G.set(S(".rows rect,.cells rect,.cells text,.li"), { opacity: 1, x: 0 });
  }
  function hl(sel) { $$(sel, svg).forEach(function (n) { n.classList.add("hl"); }); }
  function ov(sel, t) { var o = svg.querySelector(sel); o.classList.add("on"); t.from(o, { opacity: 0, y: 14, duration: .5, ease: "power2.out" }, 0); return o; }
  function loop(tw) { if (!reduce.matches) loops.push(tw); else tw.progress(1).kill(); }

  var ACTS = {
    stop: function (t) { hl(".plate,.valve"); t.to(S(".flames circle"), { scale: 0, opacity: 0, duration: .6, stagger: .1, ease: "power2.in" }).to(S(".v-rot"), { rotation: 90, duration: .7, ease: "back.out(2)" }, "-=.3"); },
    nospark: function (t) { hl(".lamp,.switch"); t.to(S(".x"), { drawSVG: "100%", duration: .45, stagger: .18, ease: "power2.out" }); },
    air: function (t, live) {
      t.to(S(".sash"), { rotation: 62, duration: 1, ease: "power3.inOut" }).to(S(".win .swing"), { opacity: 1, duration: .4 }, "<.3").to(S(".haze"), { opacity: .12, duration: 1.6 }, "<");
      if (live) S(".air circle").forEach(function (c, i) { loop(G.fromTo(c, { opacity: 0 }, { keyframes: [{ opacity: .9, duration: .3 }, { opacity: .9, duration: 1.4 }, { opacity: 0, duration: .5 }], motionPath: { path: "#airPath", align: "#airPath", alignOrigin: [.5, .5] }, duration: 2.2, ease: "none", repeat: -1, delay: .4 + i * .7 })); });
    },
    call: function (t) {
      G.set(S(".sash"), { rotation: 62 });
      t.to(S(".route"), { drawSVG: "100%", duration: 1.1, ease: "power1.inOut" })
        .fromTo(S(".walker"), { opacity: 1 }, { motionPath: { path: "#exitPath", align: "#exitPath", alignOrigin: [.5, .5] }, duration: 1.1, ease: "power1.inOut" }, "<")
        .fromTo(S(".phone"), { opacity: 0, scale: .4 }, { opacity: 1, scale: 1, duration: .5, ease: "back.out(2)" });
    },
    meet: function (t) {
      t.to(S(".leaf"), { rotation: -75, duration: .9, ease: "power3.inOut" }).to(S(".door .swing"), { opacity: 1 }, "<.3").to(S(".meet"), { opacity: 1, duration: .4 }, "<");
      S(".meet .ring").forEach(function (r, i) { loop(G.fromTo(r, { scale: 1, opacity: .8, transformOrigin: "50% 50%" }, { scale: 3.2, opacity: 0, duration: 2, repeat: -1, delay: i, ease: "power1.out" })); });
    },
    schedule: function (t) { ov(".ov-cal", t); t.from(S(".cells rect"), { opacity: 0, duration: .3, stagger: .04 }, .2).from(S(".cells text"), { opacity: 0, duration: .3, stagger: .04 }, .3); },
    contract: function (t) { svg.querySelector(".doc-t").textContent = sc === "rep" ? "Документы" : "Договор ТО"; ov(".ov-doc", t); t.to(S(".ov-doc .ln"), { drawSVG: "100%", duration: .4, stagger: .1 }, .2).from(S(".stamp"), { scale: 1.8, opacity: 0, rotation: -40, transformOrigin: "50% 50%", duration: .5, ease: "back.out(2)" }); },
    check: function (t) {
      if (sc === "con") { hl(".house,.net"); t.to(S(".ticks2 .tick"), { drawSVG: "100%", duration: .45, stagger: .35 }); return; }
      hl(".plate,.heater,.valve"); t.to(S(".leaf"), { rotation: -75, duration: .8 }).to(S(".ticks .tick"), { drawSVG: "100%", duration: .4, stagger: .3 });
    },
    receipt: function (t) { G.set(S(".dev,.till"), { opacity: .25 }); hl(".slip"); t.to(S(".slip .ln"), { drawSVG: "100%", duration: .4, stagger: .15 }).to(S(".slip .tick"), { drawSVG: "100%", duration: .5 }); },
    docs: function (t) { ov(".ov-list", t); t.from(S(".li"), { opacity: 0, x: -8, duration: .3, stagger: .12 }, .2).to(S(".li .tick"), { drawSVG: "100%", duration: .3, stagger: .12 }, .4); },
    apply: function (t) { hl(".office"); t.fromTo(S(".mail"), { opacity: 1 }, { motionPath: { path: "#mailPath", align: "#mailPath", alignOrigin: [.5, .5] }, duration: 1.4, ease: "power2.inOut" }).to(S(".mail"), { opacity: 0, duration: .3 }); },
    status: function (t) { hl(".office"); t.to(S(".status"), { opacity: 1, duration: .2 }).to(S(".status circle"), { drawSVG: "100%", duration: .8 }).to(S(".status .tick"), { drawSVG: "100%", duration: .4 }); },
    connect: function (t) { t.to(S(".link-a"), { drawSVG: "100%", duration: .9, ease: "power2.inOut" }).to(S(".lbl-a"), { opacity: 1, duration: .4 }).to(S(".link-b"), { drawSVG: "100%", duration: .9, ease: "power2.inOut" }).to(S(".lbl-b"), { opacity: 1, duration: .4 }); },
    app: function (t) { G.set(S(".till,.slip"), { opacity: .25 }); hl(".dev"); t.from(S(".rows rect"), { opacity: 0, x: -14, duration: .4, stagger: .12 }); loop(G.fromTo(S(".tap"), { scale: .6, opacity: 1, transformOrigin: "50% 50%" }, { scale: 1.6, opacity: 0, duration: 1.4, repeat: -1, ease: "power1.out" })); },
    desk: function (t) { G.set(S(".dev,.slip"), { opacity: .25 }); hl(".till"); t.to(S(".hand-m"), { rotation: 360, duration: 1.6, ease: "power2.inOut" }).to(S(".hand-h"), { rotation: 30, duration: 1.6, ease: "power2.inOut" }, "<"); },
    no: function (t) { hl(".plate"); t.to(S(".ban circle"), { drawSVG: "100%", duration: .7, ease: "power2.inOut" }).to(S(".ban path"), { drawSVG: "100%", duration: .35 }); },
    order: function (t) { ov(".ov-order", t); t.to(S(".ov-order .ln"), { drawSVG: "100%", duration: .5 }, .3); },
    accept: function (t) { G.set(S(".ban"), { opacity: 0 }); hl(".plate"); t.fromTo(S(".plate rect,.plate>circle"), { drawSVG: "0%" }, { drawSVG: "100%", duration: .9, stagger: .08, ease: "power2.inOut" }).to(S(".ticks .tick:first-child"), { drawSVG: "100%", duration: .4 }); }
  };

  function paint(i) {
    reset();
    var li = items[i]; art.dataset.scene = li.dataset.scene;
    if (!G) return;
    // предыдущие шаги этой ситуации — сразу в конечном состоянии
    for (var k = 0; k < i; k++) { var a = items[k].dataset.act; if (TRANSIENT[a] || items[k].dataset.scene !== li.dataset.scene) continue; var p = G.timeline({ paused: true }); ACTS[a](p, false); p.progress(1).kill(); }
    $$(".hl", svg).forEach(function (o) { o.classList.remove("hl"); });
    tl = G.timeline(); ACTS[li.dataset.act](tl, !reduce.matches);
    if (reduce.matches) tl.progress(1);
  }

  function show(i, force) {
    i = Math.max(0, Math.min(items.length - 1, i)); if (i === idx && !force) return; idx = i;
    items.forEach(function (li, k) { li.classList.toggle("on", k === i); });
    $$("button", dotsBox).forEach(function (b, k) { b.classList.toggle("done", k <= i); if (k === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    $$("button", outline).forEach(function (b, k) { b.classList.toggle("done", k < i); if (k === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    prevB.disabled = i === 0; nextB.disabled = i === items.length - 1;
    var tab = tabs.filter(function (t) { return t.dataset.sc === sc; })[0];
    cap.textContent = tab.textContent + " · шаг " + (i + 1);
    if (!pinned()) railTo(i / Math.max(1, items.length - 1), true);
    paint(i);
  }

  /* рельс: волнистая линия через точки шагов; огонёк едет по ней */
  function buildRail() {
    var W = railSvg.clientWidth || 300, n = items.length, pad = 22, pts = [], dd = "";
    for (var i = 0; i < n; i++) pts.push([pad + i * (W - pad * 2) / Math.max(1, n - 1), i % 2 ? 16 : 32]);
    pts.forEach(function (p, i) { if (!i) { dd = "M" + p[0] + " " + p[1]; return; } var q = pts[i - 1], m = (p[0] - q[0]) / 2; dd += "C" + (q[0] + m) + " " + q[1] + " " + (p[0] - m) + " " + p[1] + " " + p[0] + " " + p[1]; });
    railSvg.setAttribute("viewBox", "0 0 " + W + " 48");
    railSvg.innerHTML = '<path class="r-base" d="' + dd + '"/><path class="r-fill" d="' + dd + '"/><path class="r-mark" d="M0 -11C1.2 -7 5 -5 5 -1a5 5 0 0 1-10 0C-5 -4 -2 -5 -1.5 -8C-.7 -6.5 0 -6 0 -6Z"/>';
    dotsBox.innerHTML = "";
    pts.forEach(function (p, i) { var b = d.createElement("button"); b.type = "button"; b.style.left = p[0] + "px"; b.style.top = p[1] + "px"; b.setAttribute("aria-label", "Шаг " + (i + 1)); b.addEventListener("click", function () { jump(i); }); dotsBox.appendChild(b); });
    rail = { fill: railSvg.querySelector(".r-fill"), mark: railSvg.querySelector(".r-mark"), base: railSvg.querySelector(".r-base") };
    rail.len = rail.base.getTotalLength(); rail.c = 0;
    rail.fill.style.strokeDasharray = rail.len; railTo(Math.max(0, idx) / Math.max(1, n - 1), false);
  }
  function railSet(c) {
    if (!rail) return; rail.c = c;
    rail.fill.style.strokeDashoffset = (rail.len * (1 - c)).toFixed(1);
    var p = rail.base.getPointAtLength(rail.len * c); rail.mark.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + (p.y - 4).toFixed(1) + ")");
  }
  function railTo(c, anim) {
    if (!rail) return;
    if (!anim || !G || reduce.matches) return railSet(c);
    var o = { c: rail.c }; G.to(o, { c: c, duration: .8, ease: "power3.inOut", onUpdate: function () { railSet(o.c); } });
  }

  function setSc(name, keepFocus) {
    sc = name; help.dataset.cur = name;
    tabs.forEach(function (t) { var on = t.dataset.sc === name; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; if (on) panel.setAttribute("aria-labelledby", t.id); });
    lists.forEach(function (ol) { ol.hidden = ol.dataset.sc !== name; });
    items = $$(".steps[data-sc=" + name + "] li", help); buildOutline();
    idx = -1; buildRail(); show(0, true);
    if (pinned()) { lock = performance.now() + 1300; go(st.start + 2); }
  }
  function jump(i) {
    if (pinned()) { var n = items.length; lock = performance.now() + 1300; go(st.start + (st.end - st.start) * (i + .5) / n); }
    show(i);
  }

  tabs.forEach(function (t, k) {
    t.addEventListener("click", function () { setSc(t.dataset.sc); });
    t.addEventListener("keydown", function (e) {
      var m = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!m) return;
      e.preventDefault(); var n = tabs[(k + m + tabs.length) % tabs.length]; n.focus(); setSc(n.dataset.sc);
    });
  });
  prevB.addEventListener("click", function () { jump(idx - 1); });
  nextB.addEventListener("click", function () { jump(idx + 1); });
  help.addEventListener("keydown", function (e) {
    if (e.target.closest("[role=tablist]") || e.target.closest("input,textarea")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); jump(idx + 1); } else if (e.key === "ArrowLeft") { e.preventDefault(); jump(idx - 1); }
  });
  $$("[data-go-sc]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault(); setSc(a.dataset.goSc);
      if (!pinned()) go(help.getBoundingClientRect().top + scrollY - 70);
      var t = tabs.filter(function (x) { return x.dataset.sc === a.dataset.goSc; })[0]; setTimeout(function () { t.focus({ preventScroll: true }); }, 600);
    });
  });

  /* прокрутка листает шаги (широкий экран, без reduced motion): у каждого шага своё «плато» ~80–130vh */
  function pinned() { return !!st; }
  function mode() {
    var want = gsapOn && wide.matches && !reduce.matches;
    help.classList.toggle("is-pinned", want);
    if (want && !st) {
      st = ScrollTrigger.create({
        trigger: help, start: "top top", end: function () { return "+=" + innerHeight * 4; }, pin: true, anticipatePin: 1,
        onUpdate: function (self) {
          var n = items.length, p = self.progress;
          railSet(clamp((p * n - .5) / Math.max(1, n - 1)));
          if (performance.now() > lock) show(Math.min(n - 1, Math.floor(p * n)));
        }
      });
    } else if (!want && st) { st.kill(true); st = null; }
    buildRail(); show(Math.max(0, idx), true);
    if (gsapOn) ScrollTrigger.refresh();
  }
  function buildOutline() { outline.innerHTML = ""; items.forEach(function (li, i) { var o = d.createElement("li"), b = d.createElement("button"); b.type = "button"; b.innerHTML = "<i class=mono>" + (i + 1) + "</i>"; b.appendChild(d.createTextNode(li.querySelector("h3").textContent)); b.addEventListener("click", function () { jump(i); }); o.appendChild(b); outline.appendChild(o); }); }
  items = $$(".steps[data-sc=gas] li", help); help.dataset.cur = "gas"; buildOutline();
  buildRail(); show(0, true);
  mode();
  [reduce, wide].forEach(function (q) { (q.addEventListener ? q.addEventListener("change", mode) : q.addListener(mode)); });
  var rw = 0; addEventListener("resize", function () { clearTimeout(rw); rw = setTimeout(function () { buildRail(); railSet(rail.c); }, 150); });
})();
