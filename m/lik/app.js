/* ЛИК Форсайд: hero-вход, сцена «облик здания» (scrub + ручное управление), лента объектов с фильтрами и карточкой */
(function () {
  "use strict";
  var d = document, root = d.documentElement, KIT = window.KIT || {}, G = window.gsap;
  var $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var REDUCED = !!KIT.REDUCED, FINE = !!KIT.FINE;
  var seen = root.classList.contains("seen");
  var fmt = function (n) { return Math.round(n).toLocaleString("ru-RU"); };
  if (G) G.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);

  /* ---------- hero ---------- */
  function hero() {
    var nums = $$(".figures [data-n]");
    if (!G || REDUCED) { root.classList.add("ready"); return; }
    var h1 = $(".hero h1"), split = new SplitText(h1, { type: "lines", mask: "lines" });
    var tl = G.timeline({ delay: seen ? .15 : .85, defaults: { ease: "expo.out" } });
    G.set([".kicker", ".hero .lead", ".cta", ".figures li > span", ".figures b"], { autoAlpha: 0, y: 18 });
    G.set(split.lines, { yPercent: 110 });
    G.set(".dim path", { drawSVG: "50% 50%" });
    G.set(".hp-in img", { scale: 1.18 });
    root.classList.add("ready");
    tl.to(".slats i", { scaleY: 0, duration: 1.15, ease: "expo.inOut", stagger: .07 }, 0)
      .to(".hp-in img", { scale: 1, duration: 2.2, ease: "power3.out" }, 0)
      .to(".kicker", { autoAlpha: 1, y: 0, duration: .8 }, .25)
      .to(split.lines, { yPercent: 0, duration: 1.1, stagger: .1 }, .35)
      .to(".hero .lead", { autoAlpha: 1, y: 0, duration: .9 }, .9)
      .to(".cta", { autoAlpha: 1, y: 0, duration: .9 }, 1.1)
      .to(".dim path", { drawSVG: "0% 100%", duration: 1, ease: "power2.inOut", stagger: .08 }, 1.25)
      .to(".figures b", { autoAlpha: 1, y: 0, duration: .8, stagger: .08 }, 1.45)
      .to(".figures li > span", { autoAlpha: 1, y: 0, duration: .8, stagger: .08 }, 1.55);
    nums.forEach(function (el, i) {
      var to = parseFloat(el.textContent.replace(/\D/g, "")), o = { v: 0 };
      el.textContent = "0";
      tl.to(o, { v: to, duration: 1.5, ease: "power3.out", onUpdate: function () { el.textContent = fmt(o.v); } }, 1.45 + i * .08);
    });
    /* тихая жизнь: фото слегка следует за мышью */
    if (FINE) {
      var qx = G.quickTo(".hp-in", "x", { duration: 1.2, ease: "power3" }), qy = G.quickTo(".hp-in", "y", { duration: 1.2, ease: "power3" });
      $(".hero").addEventListener("pointermove", function (e) { qx((e.clientX / innerWidth - .5) * -12); qy((e.clientY / innerHeight - .5) * -10); });
    }
  }

  /* ---------- сцена: облик здания ---------- */
  function scene() {
    var svg = $(".elev svg"), NS = "http://www.w3.org/2000/svg";
    var mk = function (tag, at, par) { var e = d.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); par.appendChild(e); return e; };
    var geo = $(".s-geo", svg), cas = $(".s-cas", svg);
    for (var y = 100; y <= 660; y += 70) for (var x = 90; x <= 510; x += 70) mk("circle", { cx: x, cy: y, r: 3 }, geo);
    [[90, 100], [510, 100], [90, 660], [510, 660]].forEach(function (p) { mk("path", { d: "M" + (p[0] - 12) + " " + p[1] + "h24M" + p[0] + " " + (p[1] - 12) + "v24" }, geo); mk("circle", { cx: p[0], cy: p[1], r: 9, fill: "none", stroke: "currentColor" }, geo); });
    for (var f = 0; f < 8; f++) for (var b = 0; b < 6; b++) mk("rect", { x: 90 + b * 70, y: 590 - f * 70, width: 70, height: 70, "class": (b === 0 || b === 5) ? "c-g" : b === 2 ? "c-o" : "c-w", "data-f": f }, cas);

    var caps = $$(".cap"), btns = $$(".stages button"), cur = -1;
    function setStage(i) {
      if (i === cur) return; cur = i;
      caps.forEach(function (c, k) { c.classList.toggle("on", k === i); });
      btns.forEach(function (bt, k) { if (k === i) bt.setAttribute("aria-current", "step"); else bt.removeAttribute("aria-current"); });
    }
    if (!G) { setStage(5); return; }

    function build() {
      var tl = G.timeline({ paused: true, defaults: { ease: "power2.inOut" } }), starts = [];
      var stage = function (fn) { starts.push(tl.duration()); tl.addLabel("s" + starts.length); fn(tl.duration()); tl.to({}, { duration: .9 }); };
      G.set(".s-alt path,.s-out path,.s-grid path,.s-dim path", { drawSVG: 0 });
      G.set(".s-sw rect,.s-geo > *,.s-tlabel", { autoAlpha: 0 });
      G.set(".s-cas rect", { scaleY: 0, transformOrigin: "50% 100%" });
      G.set(".s-therm .tr", { scaleY: 0, transformOrigin: "50% 0%" });
      G.set(".s-cradle", { autoAlpha: 0 });
      stage(function (t) { tl.to(".s-out path", { drawSVG: "100%", duration: 1, stagger: .15 }, t).to(".s-alt path", { drawSVG: "100%", duration: .9, stagger: .2 }, t + .2).to(".s-alt", { opacity: .2, duration: .4 }, t + 1.2); });
      stage(function (t) { tl.to(".s-grid path", { drawSVG: "100%", duration: .8, stagger: .05 }, t).to(".s-alt", { opacity: 0, duration: .5 }, t).to(".s-sw rect", { autoAlpha: 1, duration: .4, stagger: .15 }, t + .5); });
      stage(function (t) { tl.to(".s-dim path", { drawSVG: "100%", duration: 1, stagger: .12 }, t); });
      stage(function (t) { tl.to(".s-geo path,.s-geo circle[r='9']", { autoAlpha: 1, duration: .3, stagger: .08 }, t).to(".s-geo circle[r='3']", { autoAlpha: 1, duration: .2, stagger: { each: .012, from: "end" } }, t + .3).to(".s-sw rect", { autoAlpha: 0, duration: .4 }, t + .3); });
      stage(function (t) {
        tl.to(".s-cradle", { autoAlpha: 1, duration: .2 }, t)
          .to(".s-cradle", { motionPath: { path: ".s-track", align: ".s-track", alignOrigin: [.5, 1] }, duration: 1.6, ease: "none" }, t)
          .to(".s-cas rect", { scaleY: 1, duration: .35, ease: "power3.out", stagger: { each: .03 } }, t + .05)
          .to(".s-geo", { opacity: 0, duration: .5 }, t + 1.2).to(".s-cradle", { autoAlpha: 0, duration: .3 }, t + 1.7);
      });
      stage(function (t) { tl.to(".s-therm .tr", { scaleY: 1, duration: 1.1, ease: "power1.inOut" }, t).to(".s-tlabel", { autoAlpha: 1, duration: .3 }, t + .7); });
      var tot = tl.duration();
      var at = function (time) { var i = 0; starts.forEach(function (s, k) { if (time >= s - .2) i = k; }); return i; };
      tl.eventCallback("onUpdate", function () { setStage(at(tl.time())); });
      return { tl: tl, starts: starts, tot: tot };
    }

    var mm = G.matchMedia(), api = null;
    mm.add({ desk: "(min-width:901px) and (prefers-reduced-motion:no-preference)", mob: "(max-width:900px)", rm: "(prefers-reduced-motion:reduce)" }, function (c) {
      var s = build(); api = s;
      if (c.conditions.desk) {
        var st = ScrollTrigger.create({ trigger: ".cycle", start: "top top", end: "+=" + 480 + "%", pin: true, scrub: .8, animation: s.tl, anticipatePin: 1 });
        api.go = function (i) {
          var y = st.start + (s.starts[i] + .5) / s.tot * (st.end - st.start);
          if (KIT.lenis) KIT.lenis.scrollTo(y, { duration: 1.4 }); else scrollTo({ top: y, behavior: "smooth" });
        };
        setStage(0);
      } else {
        s.tl.progress(1); setStage(5);
        api.go = function (i) { var end = (s.starts[i + 1] || s.tot) - .05; if (c.conditions.rm) { s.tl.seek(end); setStage(i); } else s.tl.tweenTo(end, { duration: 1.6, ease: "power2.inOut" }); };
      }
      return function () { api = null; cur = -1; };
    });
    btns.forEach(function (bt, i) { bt.addEventListener("click", function () { if (api) api.go(i); }); });
  }

  /* ---------- объекты ---------- */
  function objects() {
    var L = window.LIK_OBJECTS || [], rib = $(".ribbon"), pins = $(".pins"), rays = $(".rays");
    var KN = { f: "Фасады и витражи", e: "Инженерные системы", l: "Архитектурная подсветка", s: "Эскизы" };
    var P = [
      { g: "nur", n: "Новый Уренгой", x: .80, y: .14, l: 1 }, { g: "yur", n: "Южно-Русское м-е", x: .93, y: .25, l: 1 },
      { g: "hm", n: "Ханты-Мансийск", x: .60, y: .40, l: 1 }, { g: "sur", n: "Сургут", x: .75, y: .45, lm: 1 },
      { g: "nfu", n: "Нефтеюганск", x: .70, y: .50, l: 1 }, { g: "nvr", n: "Нижневартовск и район", x: .88, y: .53, b: 1 },
      { g: "tob", n: "Тобольск", x: .58, y: .72 }, { g: "ekb", n: "Екатеринбург", x: .38, y: .80 }, { g: "kzn", n: "Казань", x: .07, y: .88 },
      { g: "amur", n: "Циолковский, Амурская обл.", x: .965, y: .67, l: 1, far: 1 }, { g: "x", n: "Место не указано", x: .05, y: .06, none: 1 }
    ];
    var st = { k: "*", g: null, sel: null }, items = {}, pinEl = {};
    var ok = function (o) { return (st.k === "*" || o.k.indexOf(st.k) > -1) && (!st.g || o.g === st.g); };
    var nf = function (n, a, b, c) { var m = n % 10, h = n % 100; return n + " " + (m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c); };

    L.forEach(function (o) {
      var li = d.createElement("li"), bt = d.createElement("button");
      bt.type = "button"; bt.className = "ob"; bt.setAttribute("aria-pressed", "false"); bt.dataset.cur = "Открыть";
      bt.innerHTML = '<span class="ph"><img loading="lazy" alt="" width="280" height="210"></span><strong></strong><small></small>';
      $("img", bt).src = "img/o" + o.i + "-0.webp"; $("strong", bt).textContent = o.t;
      $("small", bt).textContent = (o.geo || "место не указано") ;
      bt.addEventListener("click", function () { select(o, true); });
      li.appendChild(bt); rib.appendChild(li); items[o.i] = li;
    });
    P.forEach(function (p) {
      var b = d.createElement("button"); b.type = "button"; b.className = "pin" + (p.l ? " l" : "") + (p.b ? " b" : "") + (p.lm ? " lm" : "") + (p.far ? " far" : "");
      b.style.left = p.x * 100 + "%"; b.style.top = p.y * 100 + "%"; b.setAttribute("aria-pressed", "false"); b.dataset.cur = "Фильтр";
      var cnt = L.filter(function (o) { return o.g === p.g; }).length, s = Math.min(26, 10 + Math.sqrt(cnt) * 4);
      b.style.setProperty("--s", p.none ? "10px" : s + "px");
      b.innerHTML = "<i></i><span></span>"; if (p.none) $("i", b).style.borderRadius = "2px";
      b.addEventListener("click", function () { st.g = st.g === p.g ? null : p.g; render(); });
      pins.appendChild(b); pinEl[p.g] = { el: b, p: p };
      if (!p.none && p.g !== "sur") { var ns = "http://www.w3.org/2000/svg", path = d.createElementNS(ns, "path"); path.setAttribute("d", "M450 189L" + p.x * 600 + " " + p.y * 420); rays.appendChild(path); }
    });
    $$(".flt .chip").forEach(function (c) { c.addEventListener("click", function () { st.k = c.dataset.k; render(); }); });
    $$("[data-filter]").forEach(function (a) { a.addEventListener("click", function () { st.k = a.dataset.filter; st.g = null; render(); }); });
    $$(".rb").forEach(function (b) { b.addEventListener("click", function () { rib.scrollBy({ left: +b.dataset.d * rib.clientWidth * .8, behavior: REDUCED ? "auto" : "smooth" }); }); });

    var det = $(".detail"), ph = $(".d-photo", det), img = $("img", ph), th = $(".d-thumbs", det);
    function show(o, n) {
      img.src = "img/o" + o.i + "-" + n + ".webp"; img.alt = o.t + (o.geo ? ", " + o.geo : "");
      ph.classList.remove("swap"); void ph.offsetWidth; ph.classList.add("swap");
      $$("button", th).forEach(function (b, k) { b.setAttribute("aria-pressed", k === n); });
    }
    function select(o, user) {
      st.sel = o.i;
      $$(".ob", rib).forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      $(".ob", items[o.i]).setAttribute("aria-pressed", "true");
      $(".d-kind", det).textContent = o.k.map(function (k) { return KN[k]; }).join(" · ");
      $(".d-title", det).textContent = o.t;
      $(".d-desc", det).textContent = o.d || "—";
      $(".d-geo", det).textContent = o.geo || "На сайте не указано";
      $(".d-cust", det).textContent = o.c || "На сайте не указан";
      $(".d-when", det).textContent = o.w; $(".d-wrow", det).hidden = !o.w;
      th.textContent = "";
      if (o.n > 1) for (var k = 0; k < o.n; k++) (function (k) {
        var b = d.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Фото " + (k + 1) + " из " + o.n); b.dataset.cur = "Фото";
        b.innerHTML = '<img alt="" loading="lazy" width="72" height="52">'; $("img", b).src = "img/o" + o.i + "-" + k + ".webp";
        b.addEventListener("click", function () { show(o, k); }); th.appendChild(b);
      })(k);
      show(o, 0);
      if (user && innerWidth <= 900) det.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
    }
    function render() {
      var vis = L.filter(ok);
      L.forEach(function (o) { var li = items[o.i], was = li.classList.contains("out"), on = ok(o); li.classList.toggle("out", !on); li.classList.toggle("new", on && was); });
      $$(".flt .chip").forEach(function (c) { c.setAttribute("aria-pressed", c.dataset.k === st.k); });
      P.forEach(function (p) {
        var e = pinEl[p.g].el, n = L.filter(function (o) { return o.g === p.g && (st.k === "*" || o.k.indexOf(st.k) > -1); }).length;
        $("span", e).textContent = p.n + " · " + n; e.setAttribute("aria-pressed", st.g === p.g); e.classList.toggle("dim0", !n);
        e.setAttribute("aria-label", p.n + ": " + nf(n, "объект", "объекта", "объектов") + (st.g === p.g ? ", фильтр включён" : ""));
      });
      $(".shown").textContent = "Показано: " + nf(vis.length, "объект", "объекта", "объектов") + (st.g ? " · " + pinEl[st.g].p.n : "");
      rib.scrollLeft = 0;
      if (vis.length && !vis.some(function (o) { return o.i === st.sel; })) select(vis[0]);
    }
    render();
    select(L.filter(function (o) { return o.i === 39; })[0] || L[0]);
    if (G && !REDUCED) {
      G.set(".rays path", { drawSVG: 0 });
      ScrollTrigger.create({ trigger: ".map", start: "top 75%", once: true, onEnter: function () { G.to(".rays path", { drawSVG: "100%", duration: 1.4, stagger: .08, ease: "power2.out" }); G.from(".pin", { autoAlpha: 0, scale: .6, duration: .6, stagger: .05, ease: "back.out(2)" }); } });
    }
  }

  /* ---------- прокрутка: лист наезжает, параллакс, меню ---------- */
  function scroll() {
    if (G && !REDUCED) {
      G.matchMedia().add("(min-width:901px)", function () {
        G.to(".cycle .cycle-grid", { scale: .94, opacity: .35, ease: "none", scrollTrigger: { trigger: ".objects", start: "top bottom", end: "top top", scrub: true } });
      });
      G.fromTo(".about-photo img", { yPercent: -12 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".about-photo", start: "top bottom", end: "bottom top", scrub: true } });
      G.fromTo(".hero-photo", { yPercent: 0 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    }
    var links = $$(".hdr nav a"), runner = $(".runner"), map = {};
    links.forEach(function (a) { map[a.hash.slice(1)] = a; });
    function mark(a) {
      links.forEach(function (x) { x.classList.toggle("on", x === a); if (x === a) x.setAttribute("aria-current", "true"); else x.removeAttribute("aria-current"); });
      if (!a) { runner.style.opacity = 0; return; }
      runner.style.opacity = 1; runner.style.width = a.offsetWidth + "px"; runner.style.transform = "translateX(" + a.offsetLeft + "px)";
    }
    var secs = $$("main section[id]"), bar = $(".progress i"), tick = false, lastA;
    function upd() {
      tick = false; var h = root.scrollHeight - innerHeight, mid = innerHeight * .45, a = null;
      bar.style.transform = "scaleX(" + (h > 0 ? scrollY / h : 0).toFixed(4) + ")";
      secs.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) a = map[s.id] || null; });
      if (a !== lastA) { lastA = a; mark(a); }
    }
    addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener("resize", function () { lastA = undefined; upd(); });
    upd();
  }

  hero(); scene(); objects(); scroll();
  addEventListener("load", function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
})();
