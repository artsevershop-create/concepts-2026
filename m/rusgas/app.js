(function () {
  "use strict";
  var d = document, root = d.documentElement, KIT = window.KIT || {}, G = window.gsap;
  var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)");
  var fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  function go(y) { if (KIT.lenis) KIT.lenis.scrollTo(y, { force: true }); else scrollTo({ top: y, behavior: reduce.matches ? "auto" : "smooth" }); }
  var gsapOn = !!(G && window.ScrollTrigger);
  if (gsapOn) G.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);

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

  /* подсветка карточек за курсором */
  if (fine) $$("[data-spot]").forEach(function (c) {
    c.addEventListener("pointermove", function (e) { var q = c.getBoundingClientRect(); c.style.setProperty("--x", (e.clientX - q.left) + "px"); c.style.setProperty("--y", (e.clientY - q.top) + "px"); });
  });

  /* ---------- курсор: тонкое кольцо цвета логотипа; над фото — рамка видоискателя ---------- */
  if (fine) (function () {
    var el = d.createElement("div"); el.className = "cur"; el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<i class="cur-dot"></i><i class="cur-ring"><b></b></i><i class="cur-frame"></i>';
    d.body.appendChild(el); root.classList.add("has-cur");
    var dot = el.firstChild, ring = dot.nextSibling, frame = ring.nextSibling, tag = ring.firstChild;
    var x = -100, y = -100, rx = x, ry = y, id = 0, shown = false;
    function label(a) {
      if (a.dataset.cursor) return a.dataset.cursor;
      if (a.matches('a[href^="tel"]')) return "Позвонить";
      if (a.matches('a[href^="mailto"]')) return "Написать";
      if (a.matches('[target="_blank"]')) return "Открыть";
      if (a.closest(".flow-line")) return "Этап";
      if (a.matches("[data-next]")) return "Дальше";
      if (a.matches("[data-prev]")) return "Назад";
      if (a.closest(".rail") && a.tagName === "BUTTON") return "Глава";
      if (a.matches("[data-copy]")) return "Копировать";
      if (a.matches('a[href^="#"]')) return "Перейти";
      if (a.matches("summary")) return "Раскрыть";
      if (a.matches('[type="submit"]')) return "Отправить";
      return "";
    }
    function loop() {
      var k = reduce.matches ? 1 : .2; rx += (x - rx) * k; ry += (y - ry) * k;
      dot.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      var t = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0)"; ring.style.transform = t; frame.style.transform = t;
      id = Math.abs(x - rx) + Math.abs(y - ry) > .1 ? requestAnimationFrame(loop) : 0;
    }
    addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      x = e.clientX; y = e.clientY; if (!shown) { shown = true; rx = x; ry = y; el.classList.add("on"); }
      if (!id) id = requestAnimationFrame(loop);
    }, { passive: true });
    d.addEventListener("pointerover", function (e) {
      var t = e.target; if (!t.closest) return;
      var a = t.closest("a,button,summary,select,[role=tab],label"), txt = t.closest("input,textarea"), v = !a && !txt && t.closest(".shot,.px,[data-img]"), l = a ? label(a) : "";
      el.classList.toggle("is-link", !!a); el.classList.toggle("has-label", !!l); el.classList.toggle("is-text", !!txt);
      el.classList.toggle("is-view", !!v); el.classList.toggle("on-dark", !!t.closest('[data-theme="night"]'));
      if (l) tag.textContent = l;
      if (!id) id = requestAnimationFrame(loop);
    });
    d.documentElement.addEventListener("mouseleave", function () { el.classList.remove("on"); shown = false; });
  })();

  /* ---------- меню: бегунок под текущим разделом ---------- */
  var nav = d.querySelector(".nav"), runner = nav.querySelector(".runner"), links = $$("a", nav);
  function run() {
    var a = nav.querySelector("a[aria-current]");
    if (!a || !runner || getComputedStyle(runner).display === "none") { if (runner) runner.style.opacity = 0; return; }
    runner.style.opacity = 1; runner.style.width = a.offsetWidth + "px"; runner.style.transform = "translateX(" + a.offsetLeft + "px)";
  }
  var navIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) { if (a.hash === "#" + e.target.id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
      run();
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  $$("main>section").forEach(function (s) { navIO.observe(s); });
  addEventListener("resize", run);

  /* ---------- путь газа: этапы вручную, труба и частица газа ---------- */
  var flow = d.querySelector("[data-flow]"), line = flow.querySelector(".flow-line"), btns = $$("button", line),
      panels = $$(".step", flow), prev = flow.querySelector("[data-prev]"), next = flow.querySelector("[data-next]"),
      count = flow.querySelector("[data-count-step]"), at = 0, svg, base, fill, gas, glow, gasTw, fillTw, lastW = 0;
  var NS = "http://www.w3.org/2000/svg";
  function mk(tag, cls, attrs) { var n = d.createElementNS(NS, tag); n.setAttribute("class", cls); for (var k in attrs) n.setAttribute(k, attrs[k]); return n; }
  function pipeOK() { return gsapOn && flow.classList.contains("is-tabs") && matchMedia("(min-width:901px)").matches && !reduce.matches; }
  function buildPipe() {
    if (!pipeOK()) { if (svg) { svg.remove(); svg = null; } flow.classList.remove("has-pipe"); return; }
    var W = line.offsetWidth; if (svg && W === lastW) return; lastW = W;
    if (svg) svg.remove();
    svg = mk("svg", "pipe", { width: W, height: 38, viewBox: "0 0 " + W + " 38", "aria-hidden": "true" });
    var dd = "M" + (W * .1) + " 19H" + (W * .9);
    base = mk("path", "base", { d: dd }); fill = mk("path", "fill", { d: dd });
    glow = mk("circle", "glow", { r: 11 }); gas = mk("circle", "gas", { r: 5 });
    svg.append(base, fill, glow, gas); flow.insertBefore(svg, flow.firstChild); flow.classList.add("has-pipe");
    G.set(fill, { drawSVG: "0% 0%" }); pipeTo(at, true);
  }
  function pipeTo(i, instant) {
    if (!svg) return; var p = i / (btns.length - 1);
    if (fillTw) fillTw.kill(); if (gasTw) gasTw.kill();
    fillTw = G.to(fill, { drawSVG: "0% " + (p * 100) + "%", duration: instant || KIT.still ? 0 : .8, ease: "power2.inOut" });
    var mp = function (e) { return { path: base, align: base, alignOrigin: [.5, .5], start: 0, end: e }; };
    G.set([glow, gas], { motionPath: mp(0) });
    if (p > 0 && !KIT.still) gasTw = G.to([glow, gas], { motionPath: mp(p), duration: 1.4 + p * 3, ease: "power1.inOut", repeat: -1, repeatDelay: .35 });
  }
  function stage(panel) {
    if (!gsapOn || reduce.matches || KIT.still) return;
    var t = G.timeline();
    t.fromTo($$("h3,.step-t p,blockquote,.big", panel), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .09, ease: "power3.out", clearProps: "transform,opacity" }, 0);
    var px = panel.querySelector(".px"); if (px) t.fromTo(px, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "power3.inOut", clearProps: "clipPath" }, .05);
    var bars = $$(".bars div", panel); if (bars.length) t.fromTo(bars, { "--k": 0 }, { "--k": 1, duration: 1.1, stagger: .12, ease: "power3.out" }, .15);
  }
  function show(i, anim) {
    at = Math.max(0, Math.min(btns.length - 1, i));
    btns.forEach(function (b, k) { b.setAttribute("aria-selected", k === at); b.tabIndex = k === at ? 0 : -1; b.classList.toggle("past", k < at); panels[k].hidden = k !== at; });
    line.style.setProperty("--p", at / (btns.length - 1));
    prev.disabled = at === 0;
    next.querySelector(".roll") ? next.querySelectorAll(".roll>span").forEach(function (s) { s.textContent = at === btns.length - 1 ? "С начала" : "Следующий этап"; }) : (next.textContent = at === btns.length - 1 ? "С начала" : "Следующий этап");
    count.textContent = "Этап " + (at + 1) + " из " + btns.length;
    if (anim) { stage(panels[at]); } pipeTo(at, !anim);
  }
  function flowMode() {
    var tabsOn = !reduce.matches;
    flow.classList.toggle("is-tabs", tabsOn);
    if (tabsOn) {
      line.setAttribute("role", "tablist"); $$("li", line).forEach(function (li) { li.setAttribute("role", "presentation"); });
      btns.forEach(function (b) { b.setAttribute("role", "tab"); });
      panels.forEach(function (p, k) { p.setAttribute("role", "tabpanel"); p.setAttribute("aria-labelledby", btns[k].id); p.tabIndex = 0; });
      show(at, false); buildPipe();
    } else { buildPipe(); panels.forEach(function (p) { p.hidden = false; p.removeAttribute("role"); p.removeAttribute("tabindex"); }); }
  }
  btns.forEach(function (b, k) { b.addEventListener("click", function () { show(k, true); }); });
  line.addEventListener("keydown", function (e) {
    var to = { ArrowRight: at + 1, ArrowDown: at + 1, ArrowLeft: at - 1, ArrowUp: at - 1, Home: 0, End: btns.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault(); show((to + btns.length) % btns.length, true); btns[at].focus();
  });
  prev.addEventListener("click", function () { show(at - 1, true); });
  next.addEventListener("click", function () { show(at === btns.length - 1 ? 0 : at + 1, true); });
  reduce.addEventListener("change", flowMode); flowMode();
  if (window.ResizeObserver) new ResizeObserver(function () { if (flow.classList.contains("is-tabs")) buildPipe(); }).observe(line);
  addEventListener("resize", function () { if (flow.classList.contains("is-tabs")) buildPipe(); });

  /* ---------- справка для СМИ ---------- */
  var copy = d.querySelector("[data-copy]"), ok = d.querySelector(".copy-ok");
  copy.addEventListener("click", function () {
    var el = d.getElementById(copy.dataset.copy);
    function fail() { var r = d.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); ok.textContent = "Текст выделен — скопируйте его вручную"; }
    if (!navigator.clipboard) return fail();
    navigator.clipboard.writeText(el.textContent).then(function () { ok.textContent = "Скопировано"; }, fail);
  });

  /* ---------- форма: кнопка с состояниями (ожидание, затем «письмо у получателя») ---------- */
  $$("form[data-demo-form]").forEach(function (f) {
    var b = f.querySelector(".btn--send");
    f.addEventListener("submit", function (e) {
      if (f.dataset.go) { delete f.dataset.go; return; }
      e.preventDefault(); e.stopImmediatePropagation();
      b.classList.add("is-busy"); b.setAttribute("aria-busy", "true");
      setTimeout(function () { b.classList.remove("is-busy"); b.removeAttribute("aria-busy"); f.dataset.go = 1; f.requestSubmit(); }, reduce.matches ? 0 : 900);
    }, true);
  });

  /* ---------- репортаж: главы вручную ---------- */
  var trip = d.querySelector(".trip"), shots = $$(".shot", trip), N = shots.length, tabs = $$(".rail button", trip), st = null;
  tabs.forEach(function (b, i) {
    b.addEventListener("click", function () {
      if (!trip.classList.contains("on")) return;
      var top = trip.getBoundingClientRect().top + scrollY, seg = (trip.offsetHeight - innerHeight) / N;
      go(top + seg * (i ? i + .45 : 0));
    });
  });

  /* ---------- вся хореография на GSAP ---------- */
  var mm, introDone = false;
  function initMotion() {
    if (!gsapOn) return;
    mm = G.matchMedia();

    /* общее: прелоадер, вход hero, полоса чтения, бегущая строка, параллакс фото */
    mm.add("(prefers-reduced-motion: no-preference)", function () {
      var h1 = trip.querySelector("h1"), note = h1.parentNode, rest = $$("p,.acts", note), rail = trip.querySelector(".rail"), stg = trip.querySelector(".trip-stage"), cur = d.querySelector(".curtain");
      var tl = G.timeline({ paused: true, onComplete: function () { root.classList.remove("pre", "hero-pre"); } });
      var heroAt = 0;
      if (root.classList.contains("pre")) {
        tl.from(cur.firstElementChild, { opacity: 0, y: 10, duration: .3, ease: "power2.out" }).to(cur, { yPercent: -100, duration: .55, ease: "expo.inOut" }, .5).add(function () { root.classList.remove("pre"); });
        heroAt = .6;
      }
      var run = function () {
        var sp = SplitText.create(h1, { type: "lines", mask: "lines", autoSplit: false });
        G.set(sp.lines, { yPercent: 108 }); G.set(note, { opacity: 0, y: 40 }); G.set(rest, { opacity: 0, y: 16 }); G.set(rail, { opacity: 0 });
        root.classList.remove("hero-pre");
        G.set(note.children, { visibility: "visible" }); G.set(rail, { visibility: "visible" });
        tl.fromTo(stg, { scale: 1.07 }, { scale: 1, duration: 2.2, ease: "power2.out", clearProps: "transform" }, heroAt)
          .to(note, { opacity: 1, y: 0, duration: .8, ease: "power3.out", clearProps: "transform" }, heroAt + .15)
          .to(sp.lines, { yPercent: 0, duration: .9, stagger: .11, ease: "power4.out" }, heroAt + .3)
          .to(rest, { opacity: 1, y: 0, duration: .7, stagger: .12, ease: "power3.out", clearProps: "transform" }, heroAt + .75)
          .to(rail, { opacity: 1, duration: .6, clearProps: "opacity" }, heroAt + 1.3)
          .add(function () { sp.revert(); G.set(note, { clearProps: "opacity" }); introDone = true; }, heroAt + 1.4);
        tl.play(0);
      };
      if (introDone) { root.classList.remove("pre", "hero-pre"); } else (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(run);

      G.to(".progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });

      var mq = d.querySelector(".marq-in");
      if (mq) { if (!mq.dataset.dup) { mq.dataset.dup = 1; mq.innerHTML += mq.innerHTML; } G.fromTo(mq, { xPercent: 0 }, { xPercent: -50, ease: "none", scrollTrigger: { trigger: ".marq", start: "top bottom", end: "bottom top", scrub: true } }); }

      $$(".px img").forEach(function (img) {
        G.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
      });
      if (fine) {
        var pxs = $$(".step .px img"); var pointer = function (e) { var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5; pxs.forEach(function (im) { G.to(im, { x: nx * 14, duration: 1.2, ease: "power3.out", overwrite: "auto" }); }); };
        addEventListener("pointermove", pointer, { passive: true });
        return function () { removeEventListener("pointermove", pointer); };
      }
    });

    /* сигнатура: закреплённый репортаж, маска-шторка между кадрами, кен-бёрнс */
    mm.add("(min-width:901px) and (min-height:560px) and (prefers-reduced-motion: no-preference)", function () {
      trip.classList.add("on");
      var imgs = shots.map(function (s) { return s.querySelector("img"); }), notes = shots.map(function (s) { return s.querySelector(".note"); }),
          wipe = trip.querySelector(".wipe"), cache = [], cur = -1;
      function chap(s) {
        tabs.forEach(function (b, i) { var f = clamp(s - i).toFixed(2); if (cache[i] !== f) { cache[i] = f; b.style.setProperty("--f", f); } });
        var c = Math.min(N - 1, Math.floor(s + .07));
        if (c !== cur) { cur = c; tabs.forEach(function (b, i) { if (i === c) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); }); }
      }
      var tl = G.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: trip, start: "top top", end: "bottom bottom", scrub: .7, invalidateOnRefresh: true, onUpdate: function (self) { chap(self.progress * N); } }
      });
      shots.forEach(function (sh, i) {
        var t0 = i ? i - .16 : 0;
        tl.fromTo(imgs[i], { scale: 1.05 }, { scale: 1.2, duration: i + 1 - t0, immediateRender: true }, t0);
        if (i) {
          tl.fromTo(sh, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .3, ease: "power2.inOut" }, t0);
          tl.set(wipe, { y: function () { return innerHeight; }, opacity: 1 }, t0).to(wipe, { y: 0, duration: .3, ease: "power2.inOut" }, t0).set(wipe, { opacity: 0 }, t0 + .3);
          tl.fromTo(notes[i], { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: .12, ease: "power2.out" }, i + .1);
        }
        if (i < N - 1) tl.to(notes[i], { autoAlpha: 0, y: -18, duration: .09, ease: "power2.in" }, i + .8);
      });
      tl.to({}, { duration: 0 }, N);
      chap(0);

      var cleanups = [];
      if (fine) {
        var xs = imgs.map(function (im) { return G.quickTo(im, "x", { duration: 1.2, ease: "power3.out" }); }), ys = imgs.map(function (im) { return G.quickTo(im, "y", { duration: 1.2, ease: "power3.out" }); });
        var mv = function (e) { var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5; xs.forEach(function (f) { f(nx * -16); }); ys.forEach(function (f) { f(ny * -10); }); };
        trip.addEventListener("pointermove", mv, { passive: true }); cleanups.push(function () { trip.removeEventListener("pointermove", mv); });
      }
      return function () { cleanups.forEach(function (f) { f(); }); trip.classList.remove("on"); tabs.forEach(function (b) { b.style.removeProperty("--f"); b.removeAttribute("aria-current"); }); };
    });
  }

  /* снег на сцене: 50 частиц, цикл спит вне экрана, на скрытой вкладке и при «остановить анимацию» */
  (function () {
    var cv = trip.querySelector(".snow"), c = cv.getContext && cv.getContext("2d"); if (!c) return;
    var fl = [], i, W = 0, H = 0;
    for (i = 0; i < 50; i++) fl.push({ x: Math.random(), y: Math.random(), r: .8 + Math.random() * 1.9, v: .018 + Math.random() * .03, p: Math.random() * 6.28 });
    if (KIT.raf) KIT.raf(cv, function (t, dt) {
      if (!trip.classList.contains("on")) return;
      if (cv.clientWidth !== W || cv.clientHeight !== H) { W = cv.width = cv.clientWidth; H = cv.height = cv.clientHeight; }
      c.clearRect(0, 0, W, H); c.fillStyle = "rgba(255,255,255,.82)"; c.strokeStyle = "rgba(40,80,120,.22)"; c.lineWidth = .6;
      fl.forEach(function (f) {
        f.y += f.v * dt / 1000; if (f.y > 1.02) { f.y = -.02; f.x = Math.random(); }
        var px = (f.x + Math.sin(t / 1800 + f.p) * .012) * W; c.beginPath(); c.arc(px, f.y * H, f.r, 0, 6.283); c.fill(); c.stroke();
      });
    }, 30);
  })();

  initMotion();
  /* «Остановить анимацию» из плашки: возвращаем статичную версию, обратно — снова движение */
  d.addEventListener("kit:still", function () {
    if (!gsapOn) return;
    if (KIT.still) { if (mm) mm.revert(); G.globalTimeline.paused(false); root.classList.remove("pre", "hero-pre"); if (gasTw) gasTw.kill(); if (fillTw) fillTw.kill(); }
    else { initMotion(); pipeTo(at, true); }
  });
  addEventListener("load", function () { if (gsapOn) ScrollTrigger.refresh(); });
})();
