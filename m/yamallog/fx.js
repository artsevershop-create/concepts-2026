/* Движение «накладной»: шторка, вход hero, курсор-ярлык и печать, табло суммы, сцена маршрута на ScrollTrigger (DrawSVG + MotionPath),
   бегущая строка, счётчики, снег, мелочи. Без GSAP страница остаётся рабочей и статичной. */
(function () {
  "use strict";
  var d = document, root = d.documentElement, g = window.gsap;
  var RM = matchMedia("(prefers-reduced-motion: reduce)"), FINE = matchMedia("(hover:hover) and (pointer:fine)"), WIDE = matchMedia("(min-width:900px)");
  var $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var mk = function (tag, cls, text) { var e = d.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
  var moving = function () { return !RM.matches; };
  if (!g || !window.ScrollTrigger || !window.DrawSVGPlugin || !window.MotionPathPlugin) { root.classList.remove("fx", "pre-on"); return; }
  g.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);

  /* ───── чтение страницы ───── */
  var prog = $(".prog");
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: function (s) { prog.style.transform = "scaleX(" + s.progress.toFixed(4) + ")"; } });
  d.addEventListener("kit:still", function () { g.globalTimeline.paused(!!(window.KIT && KIT.still)); });

  /* ───── подсказки к отметкам ───── */
  var TIPS = {
    warm: "+20 %. Приём тёплых грузов объявлен с 1 октября (28.09.2026)",
    fragile: "+20 %. В заявке есть отметка «не кантовать»",
    oversize: "+20 %. Место от 100 кг или сумма трёх сторон от 3 м",
    pickup: "Цена по ступеням веса и объёма, см. прайс ниже",
    delivery: "Цена по ступеням веса и объёма, см. прайс ниже"
  };
  $$("input[name=warm],input[name=fragile],input[name=oversize],input[name=pickup],input[name=delivery]").forEach(function (i) { i.closest("label").dataset.tip = TIPS[i.name]; });

  /* ───── кнопки: перекатываемый текст, стрелка, заливка из точки входа ───── */
  function label(b, t) { var s = $$(".roll>span", b); if (s.length) s.forEach(function (x) { x.textContent = t; }); else b.textContent = t; }
  $$(".btn").forEach(function (b) {
    var t = b.textContent.trim(), r = mk("span", "roll"), a = mk("span", "", t), c = mk("span", "", t);
    c.setAttribute("aria-hidden", "true"); r.appendChild(a); r.appendChild(c); b.textContent = ""; b.appendChild(r);
    if (!b.classList.contains("btn--ghost")) { var ar = mk("i", "arr", "→"); ar.setAttribute("aria-hidden", "true"); b.appendChild(ar); }
    var xy = function (e) { var q = b.getBoundingClientRect(); b.style.setProperty("--mx", (e.clientX - q.left) + "px"); b.style.setProperty("--my", (e.clientY - q.top) + "px"); };
    b.addEventListener("pointerenter", xy); b.addEventListener("pointerleave", xy);
  });

  /* ───── табло суммы ───── */
  var sumEl = $("#sum"), vis = mk("span", "sum-vis"), bill = $(".bill"), shaking = null;
  sumEl.classList.add("sr"); vis.setAttribute("aria-hidden", "true"); sumEl.after(vis);
  function paint(text, anim) {
    var old = vis.dataset.v || ""; if (text === old) return; vis.dataset.v = text;
    var oc = Array.from(old), nc = Array.from(text), off = nc.length - oc.length, roll = anim && moving();
    vis.textContent = "";
    nc.forEach(function (ch, i) {
      var o = oc[i - off], dg = mk("span", "dg"), col = mk("span"), n = 1;
      if (roll && o !== ch) {
        var rnd = function () { return String(Math.floor(Math.random() * 10)); };
        [o === undefined ? " " : o, rnd(), ch].forEach(function (c) { col.appendChild(mk("b", "", c)); }); n = 3;
        g.fromTo(col, { yPercent: 0 }, { yPercent: -100 * (n - 1) / n, duration: .6, delay: i * .035, ease: "power3.out" });
      } else col.appendChild(mk("b", "", ch));
      dg.appendChild(col); vis.appendChild(dg);
    });
    if (roll && old) shuffle();
  }
  /* бумага «шуршит» при пересчёте */
  function shuffle() {
    if (shaking) shaking.kill();
    shaking = g.timeline().fromTo(bill, { x: 0, rotation: 0 }, { keyframes: { x: [3, -2.5, 1.5, 0], rotation: [.22, -.16, .08, 0] }, duration: .4, ease: "sine.inOut" }, 0)
      .fromTo(".tear", { y: 0 }, { keyframes: { y: [2, -1.5, 0] }, duration: .4, ease: "sine.inOut" }, 0);
  }
  paint(sumEl.textContent, false);
  new MutationObserver(function () { paint(sumEl.textContent, true); }).observe(sumEl, { childList: true, characterData: true, subtree: true });
  /* штамп даты падает со стуком */
  function slam(delay) {
    if (!moving()) return;
    g.timeline({ delay: delay || 0 })
      .fromTo(".stamp--hero", { opacity: 0, scale: 2.5, rotation: -16 }, { opacity: 1, scale: 1, rotation: -3, duration: .3, ease: "power4.in" })
      .to(bill, { y: 5, duration: .07, ease: "power2.out" })
      .to(bill, { y: 0, duration: .5, ease: "elastic.out(1.4,.35)" });
  }
  bill.addEventListener("input", function (e) { if (e.target.name === "route") slam(.05); });

  /* ───── шторка и вход первого экрана ───── */
  function curtain() {
    var p = $(".pre"); if (!p || !root.classList.contains("pre-on")) return 0;
    g.timeline({ onComplete: function () { root.classList.remove("pre-on"); } })
      .from(".pre img", { opacity: 0, y: 12, duration: .3, ease: "power3.out" })
      .fromTo(".pre i", { scaleX: 0 }, { scaleX: 1, duration: .35, ease: "power2.inOut" }, .1)
      .to(p, { yPercent: -100, duration: .5, ease: "power4.inOut" }, "+=.02");
    return .62;
  }
  function heroIn() {
    var at = curtain();
    root.classList.remove("fx");
    if (!moving()) return;
    var tl = g.timeline({ delay: at, defaults: { ease: "power3.out" } });
    tl.from(".hero-lines", { opacity: 0, duration: .8 }, 0)
      .from(".hero h1 .ln>span", { yPercent: 110, duration: .9, stagger: .09, ease: "power4.out" }, .05)
      .from(".lead", { y: 18, opacity: 0, duration: .7 }, .4)
      .from(".phones>div", { x: -18, opacity: 0, duration: .6, stagger: .08 }, .55)
      .from(".hours", { opacity: 0, duration: .6 }, .8)
      .fromTo(bill, { clipPath: "inset(0 0 100% 0)", y: -20, opacity: 1 }, { clipPath: "inset(-80px)", y: 0, duration: 1.05, ease: "power3.out", clearProps: "clipPath" }, .15)
      .from(".bill fieldset,.f-num label", { opacity: 0, y: 10, duration: .5, stagger: .06 }, .6)
      .from(".bill .acts .btn", { opacity: 0, y: 12, duration: .5, stagger: .08 }, 1.05)
      .add(function () { slam(0); }, 1.15)
      .add(function () { vis.dataset.v = "0"; paint(sumEl.textContent, true); }, 1.25);
    /* тихая жизнь: линейка бумаги медленно плывёт, накладная и заголовок чуть следуют за курсором */
    g.to(".hero-lines", { y: 32, duration: 7, ease: "none", repeat: -1, scrollTrigger: { trigger: ".hero", toggleActions: "play pause resume pause" } });
    var bw = $(".bill-w"), h1 = $(".hero h1");
    if (FINE.matches) {
      var qx = g.quickTo(bw, "x", { duration: .9, ease: "power3" }), qy = g.quickTo(bw, "y", { duration: .9, ease: "power3" }),
        hx = g.quickTo(h1, "x", { duration: 1.1, ease: "power3" }), hy = g.quickTo(h1, "y", { duration: 1.1, ease: "power3" });
      $(".hero").addEventListener("pointermove", function (e) {
        if (!moving()) return;
        var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
        qx(nx * 16); qy(ny * 12); hx(nx * -10); hy(ny * -8);
      });
    }
  }

  /* ───── курсор-ярлык и печать ───── */
  var cur = mk("div", "cur"), dot = mk("div", "cur-dot"), ring = mk("div", "cur-ring"), rg = mk("div", "rg"), lab = mk("span", "lab");
  dot.appendChild(mk("i")); rg.appendChild(lab); ring.appendChild(rg); cur.appendChild(dot); cur.appendChild(ring); d.body.appendChild(cur);
  var tx = -100, ty = -100, x = -100, y = -100, rx = -100, ry = -100, loopId = 0, lastT = null;
  function cursorOn() { return FINE.matches && moving(); }
  function syncCursor() { root.classList.toggle("has-cur", cursorOn()); if (!cursorOn()) cur.classList.remove("on"); }
  function loop() {
    loopId = 0;
    x += (tx - x) * .5; y += (ty - y) * .5; rx += (tx - rx) * .17; ry += (ty - ry) * .17;
    dot.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
    ring.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0)";
    if (Math.abs(tx - rx) > .1 || Math.abs(ty - ry) > .1 || Math.abs(tx - x) > .1) loopId = requestAnimationFrame(loop);
  }
  function kind(t) {
    var f = t.closest("input,textarea,select");
    if (f && f.type !== "checkbox" && f.type !== "radio") return ["hide", ""];
    var el = t.closest("a,button,label,summary");
    if (el) {
      if (el.closest(".chips,.seg")) return ["link", "Выбрать"];
      if (el.matches("a[href^='tel:']")) return ["link", "Позвонить"];
      if (el.matches("a[href^='mailto:']")) return ["link", "Написать"];
      if (el.classList.contains("st-next")) return ["link", "Этап →"];
      if (el.matches("button[type=submit]")) return ["link", "Отправить"];
      if (el.closest("[data-menu]")) return ["link", "Раздел"];
      return ["link", "Открыть"];
    }
    if (t.closest(".track")) return ["scene", "Груз"];
    return ["idle", ""];
  }
  function look(t) {
    if (t === lastT) return; lastT = t; var k = kind(t);
    cur.dataset.s = k[0]; if (lab.textContent !== k[1]) lab.textContent = k[1];
    cur.classList.toggle("dark", !!t.closest("[data-theme=night],.hdr.on-dark"));
  }
  var scrollQ = 0;
  addEventListener("scroll", function () {
    if (!cursorOn() || scrollQ || !cur.classList.contains("on")) return;
    scrollQ = requestAnimationFrame(function () { scrollQ = 0; var t = d.elementFromPoint(tx, ty); if (t) look(t); });
  }, { passive: true });
  d.addEventListener("pointermove", function (e) {
    if (!cursorOn() || e.pointerType === "touch") return;
    tx = e.clientX; ty = e.clientY;
    if (!cur.classList.contains("on")) { x = rx = tx; y = ry = ty; cur.classList.add("on"); }
    look(e.target);
    if (!loopId) loopId = requestAnimationFrame(loop);
  }, { passive: true });
  d.documentElement.addEventListener("pointerleave", function () { cur.classList.remove("on"); });
  d.addEventListener("pointerdown", function (e) {
    if (!cursorOn()) return; cur.classList.add("down");
    var b = e.target.closest(".btn,.chips label,.seg label,.st-next,.side-nav a");
    if (!b) return;
    var s = mk("span", "stamp stp", b.matches(".chips label,.seg label") ? "отмечено" : "принято");
    s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px"; d.body.appendChild(s);
    g.timeline({ onComplete: function () { s.remove(); } })
      .fromTo(s, { opacity: 0, scale: 1.9, rotation: -4 }, { opacity: 1, scale: 1, rotation: -9 + Math.random() * 6, duration: .16, ease: "power4.in" })
      .to(s, { opacity: 0, y: -8, duration: .5, delay: .45, ease: "power1.in" });
    var old = $$(".stp"); if (old.length > 3) old[0].remove();
  });
  d.addEventListener("pointerup", function () { cur.classList.remove("down"); });
  FINE.addEventListener("change", syncCursor); RM.addEventListener("change", syncCursor); syncCursor();

  /* ───── подсветка карточек за курсором ───── */
  var SP = ".st-card,.pack li,.board li,.terms article,.sheet", spQ = null, spBusy = false;
  d.addEventListener("pointermove", function (e) {
    if (!cursorOn()) return;
    var c = e.target.closest(SP); if (!c) return;
    if (!c.querySelector(":scope>.spot-l")) { var l = mk("i", "spot-l"); l.setAttribute("aria-hidden", "true"); c.insertBefore(l, c.firstChild); }
    spQ = [c, e.clientX, e.clientY];
    if (spBusy) return; spBusy = true;
    requestAnimationFrame(function () { spBusy = false; var q = spQ, r = q[0].getBoundingClientRect(); q[0].style.setProperty("--x", (q[1] - r.left) + "px"); q[0].style.setProperty("--y", (q[2] - r.top) + "px"); });
  }, { passive: true });

  /* ───── бегущая строка по скорости прокрутки ───── */
  var tk = { tw: null, st: null, timer: 0 };
  function ticker() {
    var t = $(".ticker"), tr = $(".ticker-track"); if (!t) return;
    if (tk.tw) { tk.tw.kill(); tk.st.kill(); tk.tw = null; g.set(tr, { clearProps: "transform" }); }
    $$(".tk[data-clone]", tr).forEach(function (c) { c.remove(); });
    if (!moving()) { t.classList.add("is-static"); return; }
    t.classList.remove("is-static");
    var one = $(".tk", tr), copy = one.cloneNode(true); copy.dataset.clone = 1; copy.setAttribute("aria-hidden", "true"); tr.appendChild(copy);
    tk.tw = g.to(tr, { xPercent: -50, duration: 60, ease: "none", repeat: -1 });
    tk.st = ScrollTrigger.create({
      trigger: t, start: "top bottom", end: "bottom top",
      onToggle: function (s) { tk.tw.paused(!s.isActive); },
      onUpdate: function (s) {
        var v = s.getVelocity(), dir = s.direction < 0 ? -1 : 1;
        g.to(tk.tw, { timeScale: dir * (1 + Math.min(Math.abs(v) / 250, 7)), duration: .3, overwrite: true });
        clearTimeout(tk.timer); tk.timer = setTimeout(function () { g.to(tk.tw, { timeScale: 1, duration: 1, overwrite: true }); }, 140);
      }
    });
  }

  /* ───── счётчики, призрачная дата ───── */
  $$("[data-n]").forEach(function (e) {
    var n = +e.dataset.n, o = { v: 0 }; if (!moving()) return; e.textContent = "0";
    ScrollTrigger.create({ trigger: e, start: "top 90%", once: true, onEnter: function () { g.to(o, { v: n, duration: 1.6, ease: "power2.out", onUpdate: function () { e.textContent = Math.round(o.v); } }); } });
  });
  if (moving()) g.to(".ghost", { yPercent: -35, ease: "none", scrollTrigger: { trigger: ".rates", scrub: true, start: "top bottom", end: "bottom top" } });

  /* ───── сцена маршрута ───── */
  var scene = { tl: null, sts: [], targets: [], intro: null }, wasPassed = [], curIdx = -1;
  function killScene() {
    scene.sts.forEach(function (s) { s.kill(); }); scene.sts = [];
    if (scene.tl) { scene.tl.kill(); scene.tl = null; }
    if (scene.intro) { scene.intro.kill(); scene.intro = null; }
    if (scene.targets.length) g.set(scene.targets, { clearProps: "opacity,transform" }); scene.targets = [];
    g.killTweensOf(".st-stamp");
  }
  function buildScene() {
    killScene();
    var track = $(".track"), host = $("#rails"), items = $$(".st", $("#stations")), tag = $(".cargo-tag");
    host.textContent = ""; if (!items.length) return;
    var live = WIDE.matches && moving(), mob = innerWidth < 600, cx = mob ? 10 : 42, w = cx * 2, H = track.offsetHeight, amp = live ? 18 : 0;
    var ys = items.map(function (it) { return it.offsetTop + 42; });
    var D = "M" + cx + " " + ys[0];
    for (var i = 1; i < ys.length; i++) { var a = (i % 2 ? 1 : -1) * amp, y0 = ys[i - 1], dy = ys[i] - y0; D += " C" + (cx + a) + " " + (y0 + dy * .3) + " " + (cx + a) + " " + (y0 + dy * .7) + " " + cx + " " + ys[i]; }
    var water = "";
    items.forEach(function (it, i) { if (it.classList.contains("st--water")) water += '<rect x="-8" y="' + (ys[i] - 52) + '" width="' + (w + 16) + '" height="104" rx="6" fill="rgba(23,151,207,.16)"/><path d="M-8 ' + (ys[i] - 52) + 'H' + (w + 8) + 'M-8 ' + (ys[i] + 52) + 'H' + (w + 8) + '" stroke="#1797CF" stroke-opacity=".6" stroke-dasharray="3 5" fill="none"/>'; });
    var rails = function (c1, c2, c3) { return '<path d="' + D + '" fill="none" stroke="' + c1 + '" stroke-width="24"/><path d="' + D + '" fill="none" stroke="#FBFAF5" stroke-width="18"/><path d="' + D + '" fill="none" stroke="' + c3 + '" stroke-width="20" stroke-dasharray="3 11"/>'; };
    host.innerHTML = '<svg class="rails-svg' + (live ? " live" : "") + '" width="' + w + '" height="' + H + '" viewBox="0 0 ' + w + " " + H + '" focusable="false">' +
      '<defs><mask id="ylm" maskUnits="userSpaceOnUse" x="-60" y="0" width="' + (w + 120) + '" height="' + H + '"><path class="mk" d="' + D + '" fill="none" stroke="#fff" stroke-width="56"/></mask>' +
      '<mask id="ylb" maskUnits="userSpaceOnUse" x="-60" y="0" width="' + (w + 120) + '" height="' + H + '"><path class="mkb" d="' + D + '" fill="none" stroke="#fff" stroke-width="56"/></mask>' +
      '<radialGradient id="ylg"><stop offset="0" stop-color="#FFC21C" stop-opacity=".6"/><stop offset="1" stop-color="#FFC21C" stop-opacity="0"/></radialGradient></defs>' +
      '<g>' + water + '</g><g mask="url(#ylb)" class="base">' + rails("#7F8C92", "", "#A9B0B0") + '</g><g mask="url(#ylm)" class="blue">' + rails("#0A5F87", "", "#1797CF") + '</g>' +
      '<g class="wg"><circle class="halo" r="40" fill="url(#ylg)"/><g class="wb"><rect x="-30" y="-13" width="60" height="26" rx="5" fill="#FFC21C" stroke="#14202A" stroke-width="2"/>' +
      '<rect x="-4" y="-13" width="8" height="26" fill="#fff" opacity=".4"/><rect x="-24" y="-7" width="10" height="14" rx="2" fill="#14202A" opacity=".2"/><rect x="14" y="-7" width="10" height="14" rx="2" fill="#14202A" opacity=".2"/>' +
      '<path d="M-37 0H-30M30 0H37" stroke="#14202A" stroke-width="3"/></g></g></svg>';
    track.classList.toggle("is-live", live);
    var stamps = $$(".st-stamp", track), cards = $$(".st-card", track);
    wasPassed = []; curIdx = -1;
    if (!live) { g.set(stamps, { clearProps: "all" }); items.forEach(function (it) { it.classList.add("is-passed"); it.classList.remove("is-now"); }); $$("#side-nav a").forEach(function (an) { an.removeAttribute("aria-current"); }); return; }

    var mk1 = $(".mk", host), mkb = $(".mkb", host), wg = $(".wg", host), main = $(".base path", host), first = ys[0], last = ys[ys.length - 1];
    var yy = function () { return ys = items.map(function (it) { return it.offsetTop + 42; }); };
    g.set(mk1, { drawSVG: "0% 0%" });
    scene.intro = g.fromTo(mkb, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 1.1, ease: "power2.inOut" });
    g.set(stamps, { opacity: 0 }); scene.targets.push.apply(scene.targets, stamps);
    scene.tl = g.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: track, scrub: .6, invalidateOnRefresh: true,
        start: function () { yy(); return "top+=" + ys[0] + " 46%"; },
        end: function () { return "top+=" + ys[ys.length - 1] + " 46%"; },
        onUpdate: function (s) { mark(s.progress); }
      }
    });
    scene.tl.to(mk1, { drawSVG: "0% 100%" }, 0).to(wg, { motionPath: { path: main, align: main, alignOrigin: [.5, .5], autoRotate: true } }, 0);
    /* ярлык с весом едет за вагоном на каждом кадре сцены */
    scene.tl.eventCallback("onUpdate", function () { tag.style.transform = "translate3d(" + (g.getProperty(wg, "x") - tag.offsetWidth / 2) + "px," + (g.getProperty(wg, "y") - 48) + "px,0)"; });
    scene.sts.push(scene.tl.scrollTrigger);
    /* карточки появляются хореографией по мере подхода */
    cards.forEach(function (c) {
      var parts = $$(".st-head>*,.st-do li,.st-you li,.st-foot>*", c); g.set(parts, { opacity: 0, y: 18 }); scene.targets.push.apply(scene.targets, parts);
      scene.sts.push(ScrollTrigger.create({ trigger: c, start: "top 84%", once: true, onEnter: function () { g.to(parts, { opacity: 1, y: 0, duration: .7, stagger: .05, ease: "power3.out" }); } }));
    });
    function mark(p) {
      var yv = first + p * (last - first), now = 0;
      ys.forEach(function (v, i) { if (v <= yv + 120) now = i; });
      if (now === curIdx) return; curIdx = now;
      items.forEach(function (it, i) {
        var on = i <= now; it.classList.toggle("is-now", i === now);
        if (on !== !!wasPassed[i]) {
          wasPassed[i] = on; it.classList.toggle("is-passed", on);
          var st = stamps[i]; if (!st) return;
          if (on) g.fromTo(st, { opacity: 0, scale: 1.9, rotation: -16 }, { opacity: 1, scale: 1, rotation: -7, duration: .42, ease: "back.out(2.2)", overwrite: true });
          else g.to(st, { opacity: 0, duration: .2, overwrite: true });
        }
      });
      $$("#side-nav li").forEach(function (li, i) { var an = li.firstChild; li.classList.toggle("is-passed", i <= now); if (i === now) an.setAttribute("aria-current", "step"); else an.removeAttribute("aria-current"); });
    }
    items.forEach(function (it) { it.classList.remove("is-passed", "is-now"); });
    mark(scene.tl.scrollTrigger.progress);
  }
  var rebuildQ = 0;
  function rebuild() { if (rebuildQ) return; rebuildQ = requestAnimationFrame(function () { rebuildQ = 0; buildScene(); ticker(); ScrollTrigger.refresh(); }); }
  d.addEventListener("yl:built", rebuild);
  WIDE.addEventListener("change", rebuild); RM.addEventListener("change", rebuild);
  var lastW = innerWidth; addEventListener("resize", function () { if (innerWidth !== lastW) { lastW = innerWidth; rebuild(); } });
  new ResizeObserver(function () { rebuild(); }).observe($("#stations"));
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(rebuild);

  /* ───── бегунок меню ───── */
  var nav = $("[data-menu]"), run = mk("i", "run"); nav.appendChild(run);
  function runner() {
    var a = $("a[aria-current]", nav);
    if (!a || innerWidth <= 1240) { run.style.opacity = 0; return; }
    run.style.opacity = 1; run.style.width = (a.offsetWidth - 24) + "px"; run.style.transform = "translateX(" + (a.offsetLeft + 12) + "px)";
  }
  new MutationObserver(runner).observe(nav, { attributes: true, subtree: true, attributeFilter: ["aria-current"] });
  addEventListener("resize", runner); runner();

  /* ───── отправка демо-формы: состояния кнопки ───── */
  var form = $(".sheet"), sb = $("button[type=submit]", form), pass = false, orig = sb.textContent;
  form.addEventListener("submit", function (e) {
    if (pass || !moving()) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (sb.classList.contains("is-busy") || sb.classList.contains("is-ok")) return;
    sb.classList.add("is-busy"); label(sb, "Отправляем…");
    setTimeout(function () {
      sb.classList.replace("is-busy", "is-ok"); label(sb, "Готово ✓");
      setTimeout(function () {
        pass = true; form.requestSubmit(); pass = false; sb.classList.remove("is-ok"); label(sb, orig);
        g.from(".done>*", { opacity: 0, y: 14, duration: .6, stagger: .08, ease: "power3.out" });
      }, 650);
    }, 900);
  }, true);

  /* ───── снег в ночной секции ───── */
  var cv = $(".snow");
  if (cv && window.KIT && KIT.raf) {
    var ctx = cv.getContext("2d"), W = 0, Hh = 0, fl = [];
    var size = function () { W = cv.width = cv.clientWidth; Hh = cv.height = cv.clientHeight; };
    new ResizeObserver(size).observe(cv); size();
    for (var n = 0; n < 45; n++) fl.push({ x: Math.random() * (W || 1200), y: Math.random() * (Hh || 800), r: 1 + Math.random() * 2.3, v: .3 + Math.random() * .7, s: Math.random() * 6.28 });
    KIT.raf(cv, function (t, dt) {
      ctx.clearRect(0, 0, W, Hh); ctx.fillStyle = "rgba(234,242,244,.55)";
      fl.forEach(function (f) {
        f.y += f.v * dt * .035; f.x += Math.sin(t / 1700 + f.s) * .12; if (f.y > Hh + 4) { f.y = -4; f.x = Math.random() * W; }
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
      });
    }, 30);
  }

  ticker();
  heroIn();
})();
