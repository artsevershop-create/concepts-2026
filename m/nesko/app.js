(function () {
  "use strict";
  var d = document, root = d.documentElement, KIT = window.KIT || {}, G = window.gsap;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var LV = root.classList.contains("lv");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)");
  var fine = matchMedia("(hover:hover) and (pointer:fine)").matches && !LV;
  var motion = function () { return !reduce.matches && !LV; };
  var gsapOn = !!(G && window.ScrollTrigger);
  if (gsapOn) G.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);
  if (LV && KIT.lenis) { KIT.lenis.destroy(); KIT.lenis = null; root.classList.remove("lenis"); }
  function go(y) { if (KIT.lenis) KIT.lenis.scrollTo(y, { force: true }); else scrollTo({ top: y, behavior: motion() ? "smooth" : "auto" }); }

  /* ---------- кнопки: перекат текста, стрелка, заливка из точки входа ---------- */
  var ARROW = '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  function dressBtn(b) {
    if (!b.querySelector(".roll")) {
      var t = b.textContent.trim(), r = d.createElement("span"), a = d.createElement("span"), c = d.createElement("span");
      r.className = "roll"; a.textContent = t; c.textContent = t; c.setAttribute("aria-hidden", "true"); r.append(a, c);
      b.textContent = ""; b.appendChild(r);
      if (b.hasAttribute("data-arrow")) b.insertAdjacentHTML("beforeend", ARROW);
    }
    if (b.dataset.dressed) return; b.dataset.dressed = 1;
    function pos(e) { var q = b.getBoundingClientRect(); b.style.setProperty("--mx", (e.clientX - q.left) + "px"); b.style.setProperty("--my", (e.clientY - q.top) + "px"); }
    b.addEventListener("pointerenter", pos); b.addEventListener("pointerleave", pos);
  }
  $$(".btn").forEach(dressBtn);
  if (fine) $$("[data-spot]").forEach(function (c) {
    c.addEventListener("pointermove", function (e) { var q = c.getBoundingClientRect(); c.style.setProperty("--x", (e.clientX - q.left) + "px"); c.style.setProperty("--y", (e.clientY - q.top) + "px"); });
  });

  /* ---------- курсор «окошко счётчика» ---------- */
  if (fine) (function () {
    var el = d.createElement("div"); el.className = "cur"; el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<div class="cur-ring"><b></b></div><div class="cur-dot"><i></i></div>';
    d.body.appendChild(el); root.classList.add("has-cur");
    var ring = el.firstChild, dot = ring.nextSibling, tag = ring.firstChild;
    var x = -100, y = -100, rx = x, ry = y, id = 0, shown = false;
    function label(a) {
      if (a.dataset.cursor) return a.dataset.cursor;
      if (a.matches('a[href^="tel"]')) return "Позвонить";
      if (a.matches('a[href^="mailto"]')) return "Написать";
      if (a.matches('[target="_blank"]')) return "Открыть";
      if (a.closest(".seg")) return "Выбрать";
      if (a.matches('[type="submit"]')) return "Отправить";
      if (a.matches('a[href^="#"]')) return "Перейти";
      return "";
    }
    function loop() {
      rx += (x - rx) * .2; ry += (y - ry) * .2;
      dot.style.transform = "translate3d(" + x + "px," + y + "px,0)";
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
      var f = t.closest("input:not([type=radio]):not([type=checkbox]),textarea,select"), a = !f && t.closest("a,button,summary,label"), l = a ? label(a) : "";
      el.classList.toggle("is-field", !!f); el.classList.toggle("is-link", !!a); el.classList.toggle("has-label", !!l);
      el.classList.toggle("is-scene", !a && !f && !!t.closest(".month-art,.slip-body"));
      el.classList.toggle("on-dark", !!t.closest('[data-theme="night"],.q--main,.b--oc'));
      if (l) tag.textContent = l;
    });
    root.addEventListener("mouseleave", function () { el.classList.remove("on"); shown = false; });
  })();

  /* ---------- меню: текущий раздел и бегунок ---------- */
  var nav = $(".nav"), runner = $(".runner"), links = $$("a:not(.btn)", nav);
  function run() {
    var a = nav.querySelector("a[aria-current]");
    if (!a || getComputedStyle(runner).display === "none") { runner.style.opacity = 0; return; }
    runner.style.opacity = 1; runner.style.width = a.offsetWidth - 22 + "px"; runner.style.transform = "translateX(" + (a.offsetLeft + 11) + "px)";
  }
  var navIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var id = e.target.id === "top" ? "do" : e.target.id;
      links.forEach(function (a) { if (a.hash === "#" + id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
      run();
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main>section[id]").forEach(function (s) { navIO.observe(s); });
  $(".hero").id || navIO.observe($(".quick-wrap"));
  addEventListener("resize", run);

  /* ---------- прогресс чтения ---------- */
  var bar = $(".progress i"), tick = false;
  function prog() { tick = false; var h = root.scrollHeight - innerHeight; bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0).toFixed(4) + ")"; }
  addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(prog); } }, { passive: true }); prog();

  /* ---------- версия для слабовидящих ---------- */
  (function () {
    var btn = $(".lv-btn"), panel = $("#lv-panel"), st;
    try { st = JSON.parse(localStorage.getItem("nesko-lv") || "null"); } catch (e) { st = null; }
    function save(v) { try { if (v) localStorage.setItem("nesko-lv", JSON.stringify(v)); else localStorage.removeItem("nesko-lv"); } catch (e) {} }
    function paint() {
      $$("[data-lv-s]", panel).forEach(function (b) { b.setAttribute("aria-pressed", !!st && String(st.s) === b.dataset.lvS); });
      $$("[data-lv-c]", panel).forEach(function (b) { b.setAttribute("aria-pressed", !!st && st.c === b.dataset.lvC); });
      $("[data-lv-img]", panel).setAttribute("aria-pressed", !!(st && st.noimg));
      if (!st) return;
      root.className = root.className.replace(/\blv-(s\d|c-\w+|noimg)\b/g, "").trim();
      root.classList.add("lv-s" + st.s, "lv-c-" + st.c); if (st.noimg) root.classList.add("lv-noimg");
    }
    function set(patch) {
      var on = !!st; st = Object.assign(st || { s: 1, c: "bw" }, patch); save(st);
      if (!on) { location.reload(); return; } paint();
    }
    btn.addEventListener("click", function () {
      if (!LV) { set({}); return; }
      var open = panel.hidden; panel.hidden = !open; btn.setAttribute("aria-expanded", open);
    });
    $$("[data-lv-s]", panel).forEach(function (b) { b.addEventListener("click", function () { set({ s: +b.dataset.lvS }); }); });
    $$("[data-lv-c]", panel).forEach(function (b) { b.addEventListener("click", function () { set({ c: b.dataset.lvC }); }); });
    $("[data-lv-img]", panel).addEventListener("click", function () { set({ noimg: !(st && st.noimg) }); });
    $("[data-lv-off]", panel).addEventListener("click", function () { save(null); location.reload(); });
    if (LV) { panel.hidden = false; btn.setAttribute("aria-expanded", "true"); btn.querySelector("span").textContent = "Настройки"; }
    paint();
  })();

  /* ---------- hero: вход по таймлайну, тихая жизнь, параллакс, тёплые огоньки ---------- */
  var heroH = $(".hero-h"), photo = $(".hero-photo img");
  function heroIn() {
    root.classList.remove("hero-pre");
    if (!gsapOn || !motion()) return;
    var split = SplitText.create(heroH, { type: "lines", mask: "lines", linesClass: "ln" });
    var tl = G.timeline({ defaults: { ease: "expo.out" }, delay: root.classList.contains("pre") ? .95 : .1 });
    tl.from(photo, { scale: 1.16, duration: 2.4, ease: "power2.out" }, 0)
      .from(".hero .eyebrow", { autoAlpha: 0, y: 12, duration: .7 }, .15)
      .from(split.lines, { yPercent: 110, duration: 1.1, stagger: .09 }, .2)
      .from(".hero .lead", { autoAlpha: 0, y: 16, duration: .8 }, .55)
      .from(".hero-cta", { autoAlpha: 0, y: 14, duration: .7 }, .7)
      .from(".quick > li", { autoAlpha: 0, y: 46, duration: 1, stagger: .08 }, .85)
      .from(".outage", { autoAlpha: 0, duration: .6 }, 1.5)
      .add(function () { G.to(photo, { scale: 1.1, duration: 70, ease: "sine.inOut", yoyo: true, repeat: -1 }); });
  }
  if (d.readyState === "complete") heroIn(); else addEventListener("load", heroIn);
  setTimeout(function () { root.classList.remove("hero-pre"); }, 3600);

  if (fine) (function () {
    var tx = 0, ty = 0, cx = 0, cy = 0, id = 0, hero = $(".hero");
    function loop() { cx += (tx - cx) * .07; cy += (ty - cy) * .07; photo.style.translate = cx.toFixed(2) + "px " + cy.toFixed(2) + "px"; id = Math.abs(tx - cx) + Math.abs(ty - cy) > .05 ? requestAnimationFrame(loop) : 0; }
    hero.addEventListener("pointermove", function (e) { if (!motion()) return; tx = (e.clientX / innerWidth - .5) * -18; ty = (e.clientY / innerHeight - .5) * -10; if (!id) id = requestAnimationFrame(loop); });
  })();

  var cv = $(".glow");
  if (cv && KIT.raf && !LV) (function () {
    var ctx = cv.getContext("2d"), P = [], W = 0, H = 0, dpr = Math.min(2, devicePixelRatio || 1);
    function size() { W = cv.offsetWidth; H = cv.offsetHeight; if (W < 20 || H < 20) return; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener("resize", size);
    for (var i = 0; i < 36; i++) P.push({ x: .3 + Math.random() * .6, o: Math.random(), r: .8 + Math.random() * 2, v: .02 + Math.random() * .035, ph: Math.random() * 6.3 });
    KIT.raf(cv, function (t) {
      if (W < 20) { size(); if (W < 20) return; }
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], k = ((p.o + t * p.v * .001) % 1), yy = .9 - k * .55, xx = p.x + Math.sin(t * .0004 + p.ph) * .015;
        ctx.globalAlpha = Math.sin(k * Math.PI) * .55;
        var g = ctx.createRadialGradient(xx * W, yy * H, 0, xx * W, yy * H, p.r * 3);
        g.addColorStop(0, "#FFE2A8"); g.addColorStop(1, "rgba(255,170,80,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(xx * W, yy * H, p.r * 3, 0, 6.283); ctx.fill();
      }
    }, 24);
  })();

  /* ---------- бегущая строка: скорость и наклон от прокрутки ---------- */
  var track = $(".ticker-track");
  if (track && KIT.raf && !LV) (function () {
    var x = 0, lastY = scrollY, v = 0, half = 0;
    KIT.raf(track, function (t, dt) {
      if (!dt) return; if (!half) half = track.scrollWidth / 2;
      var dy = scrollY - lastY; lastY = scrollY; v = v * .9 + dy * .1;
      x -= (0.04 + Math.abs(v) * .02) * dt * (v < -0.5 ? -1 : 1);
      if (x <= -half) x += half; if (x > 0) x -= half;
      var sk = Math.max(-8, Math.min(8, v * -.5));
      track.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0) skewX(" + sk.toFixed(2) + "deg)";
    }, 30);
  })();

  /* ---------- заголовки по строкам, листы, параллакс ---------- */
  if (gsapOn) {
    var mm = G.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", function () {
      if (LV) return;
      d.fonts.ready.then(function () {
        $$("[data-lines]").forEach(function (h) {
          var s = SplitText.create(h, { type: "lines", mask: "lines" });
          G.from(s.lines, { yPercent: 112, duration: 1.05, ease: "power4.out", stagger: .08, scrollTrigger: { trigger: h, start: "top 86%", once: true } });
        });
      });
      $$(".sheet,.about").forEach(function (s) { G.from(s, { y: 70, ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "top 55%", scrub: true } }); });
      G.from(".years", { "--yl": 0, ease: "none", scrollTrigger: { trigger: ".years", start: "top 85%", end: "top 45%", scrub: true } });
      G.fromTo(".ftr-big", { yPercent: 40 }, { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".ftr", start: "top bottom", end: "bottom bottom", scrub: true } });
      G.to(photo, { yPercent: 6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      var bars = $$(".bars li"); bars.forEach(function (b) { b.style.setProperty("--s", 0); });
      ScrollTrigger.create({ trigger: ".bars", start: "top 85%", once: true, onEnter: function () { bars.forEach(function (b, i) { setTimeout(function () { b.style.setProperty("--s", 1); }, i * 120); }); } });
      return function () { bars.forEach(function (b) { b.style.removeProperty("--s"); }); };
    });
  }

  /* ---------- демо-форма: состояние «отправляется» ---------- */
  $$("form[data-demo-form]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      if (f.dataset.go) { delete f.dataset.go; return; }
      e.preventDefault(); e.stopImmediatePropagation();
      var b = f.querySelector("[type=submit]"); b.classList.add("is-sending");
      setTimeout(function () { b.classList.remove("is-sending"); f.dataset.go = 1; f.requestSubmit(b); }, motion() ? 900 : 0);
    }, true);
  });

  /* =================== МЕСЯЦ АБОНЕНТА (scrub-сцена) =================== */
  var month = $("[data-month]");
  (function () {
    var svg = $(".month-svg", month), path = $("#mpath"), L = path.getTotalLength(), U = 49, NS = "http://www.w3.org/2000/svg";
    function at(u) { return path.getPointAtLength(L * u / U); }
    var gt = $(".m-ticks", svg);
    function tickAt(u, big, lbl, hot) {
      var p = at(u), q = at(Math.min(U, u + .2)), r = at(Math.max(0, u - .2)), ang = Math.atan2(q.y - r.y, q.x - r.x), nx = Math.sin(ang), ny = -Math.cos(ang), h = big ? 12 : 6;
      var ln = d.createElementNS(NS, "line"); ln.setAttribute("x1", (p.x - nx * h).toFixed(1)); ln.setAttribute("y1", (p.y - ny * h).toFixed(1)); ln.setAttribute("x2", (p.x + nx * h).toFixed(1)); ln.setAttribute("y2", (p.y + ny * h).toFixed(1)); if (big) ln.setAttribute("class", "big"); gt.appendChild(ln);
      if (lbl) { var tx = d.createElementNS(NS, "text"); var o = innerWidth < 761 ? 52 : 28; tx.setAttribute("x", (p.x - nx * o).toFixed(1)); tx.setAttribute("y", (p.y - ny * o + 4).toFixed(1)); tx.textContent = lbl; if (hot) tx.setAttribute("class", hot === true ? "hot" : hot); gt.appendChild(tx); }
    }
    for (var dd = 1; dd <= 31; dd++) tickAt(dd - 1, [1, 10, 20, 25, 31].indexOf(dd) >= 0, [1, 5, 10, 15, 20, 25, 31].indexOf(dd) >= 0 ? String(dd) : "", dd >= 20 && dd <= 25);
    for (var k = 1; k <= 10; k++) tickAt(30 + k, k === 1 || k === 10, k === 1 || k === 5 ? String(k) : "", k === 1 ? "nm" : false);
    function place(sel, u, dy) { var p = at(u), g = $(sel, svg); g.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + (p.y + (dy || 0)).toFixed(1) + ")"); return g; }
    place(".m-mark--read", 24); place(".m-mark--pay", 40); place(".m-mark--fine", U);
    place(".m-orbit", 24, 74);
    var band = $(".m-band", svg); band.style.strokeDasharray = "0 " + (L * 19 / U).toFixed(1) + " " + (L * 5 / U).toFixed(1) + " " + L.toFixed(1);
    var slip = $(".m-slip", svg); place(".m-slip", 0);
    var steps = $$(".ms", month);
    var dots = d.createElement("div"); dots.className = "month-dots"; dots.setAttribute("aria-label", "Этапы месяца");
    steps.forEach(function (s, i) { var b = d.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Этап " + (i + 1) + ": " + s.querySelector("h3").textContent); dots.appendChild(b); });
    $(".month-steps", month).after(dots);
    var dotBtns = $$("button", dots);
    function cur(i) { steps.forEach(function (s, k) { s.classList.toggle("on", k === i); }); dotBtns.forEach(function (b, k) { if (k === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); }); }

    if (!gsapOn) return;
    var mm = G.matchMedia();
    // широкий экран + движение: закрепление, линия рисуется прокруткой, квитанция едет по месяцу; у каждой подписи своё плато
    mm.add("(min-width: 981px) and (prefers-reduced-motion: no-preference)", function () {
      if (LV) return;
      month.classList.add("is-pinned");
      var marks = $$(".m-mark", svg), orbit = $(".m-orbit", svg);
      G.set(marks, { autoAlpha: 0, scale: .4, transformOrigin: "50% 50%" }); G.set(orbit, { autoAlpha: 0, rotation: -90, transformOrigin: "50% 50%" });
      G.set(band, { autoAlpha: 0 }); G.set(steps, { autoAlpha: 0, y: 24 }); G.set(steps[0], { autoAlpha: 1, y: 0 });
      var stops = [24 / U, 24 / U, 40 / U, 1], prev = 0, labels = [];
      var tl = G.timeline({ defaults: { ease: "none" } });
      tl.set(".m-draw", { drawSVG: "0% 0%" });
      stops.forEach(function (s, i) {
        labels.push(tl.duration());
        if (i > 0) tl.to(steps[i - 1], { autoAlpha: 0, y: -24, duration: .25, ease: "power1.in" }).to(steps[i], { autoAlpha: 1, y: 0, duration: .3, ease: "power2.out" }, ">-.05");
        if (s > prev) tl.to(".m-draw", { drawSVG: "0% " + (s * 100).toFixed(2) + "%", duration: 1 }, i > 0 ? "<" : 0)
          .to(slip, { motionPath: { path: path, align: path, alignOrigin: [.5, .5], start: prev, end: s }, duration: 1 }, "<");
        if (i === 0) tl.to(band, { autoAlpha: .3, duration: .3 }, .55).to(marks[0], { autoAlpha: 1, scale: 1, duration: .3, ease: "back.out(2)" }, .8);
        if (i === 1) tl.to(orbit, { autoAlpha: 1, rotation: 0, duration: .8, ease: "power2.out" }, "<");
        if (i === 2) tl.to(marks[1], { autoAlpha: 1, scale: 1, duration: .3, ease: "back.out(2)" }, ">-.15");
        if (i === 3) tl.to(marks[2], { autoAlpha: 1, scale: 1, duration: .3, ease: "back.out(2)" }, ">-.15");
        tl.to({}, { duration: 1.1 }); // плато
        prev = s;
      });
      var st = ScrollTrigger.create({
        trigger: month, start: "top top", end: function () { return "+=" + innerHeight * 4.4; }, pin: true, scrub: .6, animation: tl, anticipatePin: 1,
        onUpdate: function (self) { var t = self.progress * tl.duration(), i = 0; labels.forEach(function (l, k) { if (t >= l - .05) i = k; }); if (i !== self._i) { self._i = i; cur(i); } }
      });
      cur(0);
      function jump(i) { go(st.start + (st.end - st.start) * Math.min(1, (labels[i] + (i ? 1.2 : .9)) / tl.duration())); }
      var h = function (e) { var i = dotBtns.indexOf(e.currentTarget); jump(i); };
      dotBtns.forEach(function (b) { b.addEventListener("click", h); });
      var key = function (e) { if (!/Arrow(Left|Right)/.test(e.key)) return; var i = dotBtns.indexOf(d.activeElement); if (i < 0) return; e.preventDefault(); var n = Math.max(0, Math.min(3, i + (e.key === "ArrowRight" ? 1 : -1))); dotBtns[n].focus(); jump(n); };
      dots.addEventListener("keydown", key);
      return function () { month.classList.remove("is-pinned"); dotBtns.forEach(function (b) { b.removeEventListener("click", h); }); dots.removeEventListener("keydown", key); steps.forEach(function (s) { s.classList.add("on"); }); };
    });
    // телефон / узкий экран без reduced: линия рисуется один раз при появлении, всё остальное сразу видно
    mm.add("(max-width: 980px) and (prefers-reduced-motion: no-preference)", function () {
      if (LV) return;
      G.set(slip, { autoAlpha: 0 });
      G.from(".m-draw", { drawSVG: "0% 0%", duration: 1.8, ease: "power2.inOut", scrollTrigger: { trigger: svg, start: "top 80%", once: true } });
      G.from($$(".m-mark", svg), { autoAlpha: 0, scale: .4, transformOrigin: "50% 50%", stagger: .25, duration: .5, ease: "back.out(2)", scrollTrigger: { trigger: svg, start: "top 70%", once: true } });
    });
    mm.add("(prefers-reduced-motion: reduce)", function () { G.set(slip, { autoAlpha: 0 }); });
  })();

  /* =================== ПЛАНИРОВЩИК «ПУТЬ ПОКАЗАНИЙ И КВИТАНЦИИ» =================== */
  var LKF = "https://lkfl.ric-nv.ru", LKU = "https://ulk.nesko-nv.ru", TRM = "https://trmnl.vostok-electra.ru/?r=860",
    ERM = "https://pay.bankermak.ru/", MAX = "https://max.ru/id8603227790_bot", QUE = "https://nesko-nv.ru/electronic_queue/", SITE = "https://nesko-nv.ru";
  var KIND = { "24": "круглосуточно", work: "в рабочее время", web: "онлайн", office: "в офисе" };
  var CALL = ["Call-центр 408-508", "work", "tel:+73466408508"], OFFICE = ["Офис: ул. Ленина, 34-А", "office"];
  var CLAIM = { t: "Не согласны с начислением — письменная претензия", d: "Укажите услугу, основания, приложите подтверждающие документы, номер и дату договора. Каждую претензию регистрируют, рассматривают и дают официальный ответ." };
  var R = {
    fl: {
      read: { name: "Показания", src: "/clients/physical-persons/the-modes-of-transmission-of-meter-readings-of-the-electric-power/", cta: ["Передать без входа в кабинет", TRM], steps: [
        { t: "Снимите показания счётчика", due: "с 20 по 25 число", d: "Каждый месяц, даже если они не изменились. Интеллектуальный счётчик типа М2М подключён к системе учёта — с ним передавать не нужно." },
        { t: "Передайте одним способом — и только один раз", due: "не позднее 25-го", ch: [["Личный кабинет", "24", LKF], ["Без авторизации", "24", TRM], ["Автосекретарь 408-608", "24", "tel:+73466408608"], CALL, OFFICE] },
        { t: "Проверьте сумму к оплате", d: "В Личном кабинете видна сумма и задолженность, если она есть. Сверить показания можно у оператора Call-центра.", ch: [["Личный кабинет", "24", LKF], CALL] }] },
      pay: { name: "Оплата", src: "/clients/physical-persons/payment-methods/", cta: ["Оплатить картой в кабинете", LKF], steps: [
        { t: "Оплатите в срок", due: "до 10-го числа следующего месяца", d: "Срок установлен частью 1 статьи 155 Жилищного кодекса, если договором управления домом или решением собрания ТСЖ не установлен другой." },
        { t: "Выберите способ", ch: [["Картой в Личном кабинете", "24", LKF], ["Сайт банка «Ермак» — карта любого банка", "24", ERM], ["Приложения: Т-Банк, Сбербанк Онлайн, ВТБ, Почта Банк", "web"], ["Отделения банков", "work"]] },
        { t: "Если ограничен мобильный интернет", d: "Wi-Fi — сервисы работают в полном объёме; приложения Сбербанка, Т-Банка, ВТБ; лицевой счёт и оплата через ГИС ЖКХ; начисления, показания и оплата — в отделениях Почты России." },
        { t: "Просрочка — пени и ограничение", due: "с 31-го дня после срока", d: "1/300 ставки рефинансирования Банка России за каждый день, с 91-го дня — 1/130. Подачу могут ограничить; после полного погашения долга её возобновляют в течение двух календарных дней." }] },
      calc: { name: "Перерасчёт", src: "/press-center/news/v-tsentrakh-obsluzhivaniya-klientov-nrits-i-nesko-poyavilas-predvaritelnaya-zapis-na-priem/", cta: ["Записаться на приём", QUE], steps: [
        { t: "Сверьте начисления и показания", ch: [["Личный кабинет", "24", LKF], CALL, ["info@gesnv.ru — вопросы начислений", "web", "mailto:info@gesnv.ru"]] },
        { t: "Спросите в Онлайн-центре", d: "Онлайн-центр обслуживания клиентов в «Максе» — полный аналог очного офиса: чат, аудио- и видеосвязь, документы можно отправить прямо в чат.", ch: [["Онлайн-центр в «Максе»", "web", MAX]] },
        { t: "Запишитесь на приём", due: "запись на месяц вперёд", d: "Сверка расчётов, справки и перерасчёты — услуги по предварительной записи. Приходите не раньше чем за 15 и не позже чем через 5 минут после назначенного времени, введите пин-код в терминале.", ch: [["Предварительная запись", "24", QUE]] },
        CLAIM] },
      deal: { name: "Договор", src: "/clients/physical-persons/the-conclusion-of-the-contract-of-power-supply/", cta: ["Типовой договор и документы", SITE + "/clients/physical-persons/the-conclusion-of-the-contract-of-power-supply/"], steps: [
        { t: "Соберите документы", d: "Квартира: паспорт собственника, документ о праве на жильё (собственность, соцнайм, аренда), сведения о счётчике (паспорт, поверка, акт ввода), справка о составе семьи — если счётчика нет или он неисправен. Частный дом: ещё акты технологического присоединения от сетевой организации." },
        { t: "Запишитесь на приём", due: "запись на месяц вперёд", d: "Заключение, расторжение и изменение договора — в списке услуг по записи.", ch: [["Предварительная запись", "24", QUE]] },
        { t: "Приходите в центр обслуживания", due: "пн–пт 8:00–18:00", d: "Режим для физических лиц с 1 ноября 2026 года.", ch: [OFFICE] }] }
    },
    ul: {
      read: { name: "Показания", src: "/clients/legal-entity/distantsionnye-servisy-ul/", cta: ["Войти в кабинет юрлица", LKU], steps: [
        { t: "Оформите акт снятия показаний", d: "В Личном кабинете юридического лица — акт снятия показаний приборов учёта и динамика потребления.", ch: [["Личный кабинет юрлица", "web", LKU]] },
        { t: "Вопросы по расчётам", due: "будни 8:00–17:00, обед 12–13", ch: [["Расчётный отдел 45-38-01", "work", "tel:+73466453801"], ["Вопрос специалисту в кабинете", "web", LKU]] }] },
      pay: { name: "Оплата", src: "/clients/legal-entity/methods-of-payment-of-electricity/", cta: ["Реквизиты для оплаты", SITE + "/clients/legal-entity/methods-of-payment-of-electricity/"], steps: [
        { t: "Проверьте начисления", ch: [["Личный кабинет юрлица", "web", LKU]] },
        { t: "Оплатите по реквизитам", d: "В офисе НЭСКО или в отделениях банков: Уралсиб, «ФК Открытие», «Ермак», Сбербанк.", ch: [OFFICE, ["Отделения банков", "work"]] }] },
      calc: { name: "Сверка и перерасчёт", src: "/clients/physical-persons/the-procedure-for-filing-appeals/", cta: ["Войти в кабинет юрлица", LKU], steps: [
        { t: "Сверьте начисления и оплату", ch: [["Личный кабинет юрлица", "web", LKU]] },
        { t: "Позвоните в расчётный отдел", due: "будни 8:00–17:00, обед 12–13", ch: [["+7 3466 45-38-01", "work", "tel:+73466453801"]] },
        CLAIM] },
      deal: { name: "Договор", src: "/clients/legal-entity/the-conclusion-of-the-contract-of-energy-supply/", cta: ["Типовые договоры", SITE + "/clients/legal-entity/the-conclusion-of-the-contract-of-energy-supply/"], steps: [
        { t: "Найдите свой типовой договор", d: "Договоры и перечни документов по ценовым категориям с 1-й по 6-ю, для бюджетных потребителей, исполнителей коммунальных услуг, сетевых и энергосбытовых компаний, владельцев объектов микрогенерации." },
        { t: "Свяжитесь с договорным отделом", ch: [["+7 3466 45-51-34", "work", "tel:+73466455134"]] },
        { t: "Нежилое помещение в многоквартирном доме", d: "Нужен письменный договор ресурсоснабжения напрямую с гарантирующим поставщиком — без него объём считают как бездоговорное потребление." }] }
    }
  };
  var pl = $("[data-planner]"), list = $(".slip-steps", pl), rail = $(".slip-rail", pl), rBase = $(".r-base", rail), rDraw = $(".r-draw", rail), rDot = $(".r-dot", rail);
  var idEl = $(".slip-id", pl), cta = $(".slip-foot .btn", pl), src = $(".slip-src", pl);
  var NB = function (s) { return s.replace(/ (в|и|с|к|о|у|по|на|за|до|от|не|без|из|для|или|—) /g, " $1 ").replace(/ —/g, " —"); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  function chip(c) {
    var inner = '<i class="ch-' + c[1] + '"></i>' + esc(NB(c[0])) + '<span class="sr">, ' + KIND[c[1]] + "</span>";
    if (!c[2]) return '<span class="ch">' + inner + "</span>";
    var ext = /^https?:/.test(c[2]) ? ' target="_blank" rel="noopener"' : "";
    return '<a class="ch" href="' + esc(c[2]) + '"' + ext + ">" + inner + "</a>";
  }
  function layoutRail() {
    var items = $$(".st", list); if (!items.length) return;
    var body = list.parentNode, x = parseFloat(getComputedStyle(body).paddingLeft) - 42, top = list.offsetTop;
    var ys = items.map(function (li) { return top + li.offsetTop + 36; });
    rail.setAttribute("viewBox", "0 0 70 " + body.offsetHeight); rail.style.height = body.offsetHeight + "px";
    var dd = "M" + x + " " + (ys[0] - 22);
    ys.forEach(function (y, i) { if (i) dd += "C" + (x + 10) + " " + (ys[i - 1] + (y - ys[i - 1]) * .4) + " " + (x - 10) + " " + (ys[i - 1] + (y - ys[i - 1]) * .6) + " " + x + " " + y; });
    rBase.setAttribute("d", dd); rDraw.setAttribute("d", dd);
    return { x: x, y: ys[ys.length - 1] };
  }
  var state = { who: "fl", what: "read" }, first = true;
  function render(anim) {
    var r = R[state.who][state.what];
    idEl.textContent = (state.who === "fl" ? "Физлицо" : "Юрлицо") + " · " + r.name;
    list.innerHTML = r.steps.map(function (s, i) {
      return '<li class="st" data-n="' + (i + 1) + '"><h3>' + esc(NB(s.t)) + "</h3>" + (s.due ? '<span class="st-due">' + esc(s.due) + "</span>" : "") + (s.d ? "<p>" + esc(NB(s.d)) + "</p>" : "") + (s.ch ? '<div class="chs">' + s.ch.map(chip).join("") + "</div>" : "") + "</li>";
    }).join("");
    cta.href = r.cta[1]; if (/^https?:/.test(r.cta[1])) { cta.target = "_blank"; cta.rel = "noopener"; } else { cta.removeAttribute("target"); }
    cta.textContent = r.cta[0]; cta.removeAttribute("data-dressed"); dressBtn(cta);
    src.href = SITE + r.src;
    var end = layoutRail();
    if (G && anim && motion()) {
      G.killTweensOf([rDraw, rDot]);
      G.fromTo(rDraw, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.1, ease: "power2.inOut" });
      G.fromTo(rDot, { autoAlpha: 1 }, { motionPath: { path: rDraw, align: rDraw, alignOrigin: [.5, .5] }, duration: 1.1, ease: "power2.inOut" });
      G.from($$(".st", list), { autoAlpha: 0, x: -16, duration: .55, stagger: .09, ease: "power2.out", clearProps: "all" });
      G.from($$(".ch", list), { autoAlpha: 0, y: 8, duration: .4, stagger: .03, delay: .25, ease: "power2.out", clearProps: "all" });
    } else if (end) { if (G) G.set(rDraw, { drawSVG: "100%" }); rDot.setAttribute("transform", "translate(" + end.x + " " + end.y + ")"); }
  }
  $$("input[name=who]", pl).forEach(function (i) { i.addEventListener("change", function () { state.who = i.value; render(true); }); });
  $$("input[name=what]", pl).forEach(function (i) { i.addEventListener("change", function () { state.what = i.value; render(true); }); });
  render(false);
  if (KIT.onView) KIT.onView(pl, function (v) { if (v && first) { first = false; render(true); } }, { threshold: .25 });
  var rt = 0; addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { var e = layoutRail(); if (e) { if (G) G.set(rDraw, { drawSVG: "100%" }); G && G.set(rDot, { clearProps: "transform" }); rDot.setAttribute("transform", "translate(" + e.x + " " + e.y + ")"); } }, 150); });
  d.fonts && d.fonts.ready.then(function () { layoutRail(); if (G) ScrollTrigger.refresh(); });
})();
