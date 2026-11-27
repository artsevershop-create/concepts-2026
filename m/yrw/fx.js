/* ЯЖДК: курсор «колея», кнопки, вход hero, снег, параллакс, прогресс, меню-бегунок, вкладки услуг, лента истории, форма. */
(function () {
  "use strict";
  var d = document, root = d.documentElement, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  function go() {
    var K = window.KIT || {}, FINE = matchMedia("(hover:hover) and (pointer:fine)").matches, G = window.gsap;
    var motion = function () { return !matchMedia("(prefers-reduced-motion: reduce)").matches; };
    if (G) { gsap.registerPlugin(ScrollTrigger); if (window.SplitText) gsap.registerPlugin(SplitText); if (window.DrawSVGPlugin) gsap.registerPlugin(DrawSVGPlugin); }

    /* ---------- курсор: точка-сигнал и два рельса со шпалами, поворачиваются по ходу ---------- */
    var cur = d.querySelector(".cur");
    if (FINE && cur) {
      root.classList.add("has-cur");
      var dot = cur.querySelector(".cur-d"), ring = cur.querySelector(".cur-r"), lab = cur.querySelector(".cur-t");
      var mx = -100, my = -100, rx = -100, ry = -100, ang = 0, tang = 0, id = 0;
      function loop() {
        rx += (mx - rx) * .2; ry += (my - ry) * .2;
        var vx = mx - rx, vy = my - ry; if (vx * vx + vy * vy > 4) tang = Math.atan2(vy, vx) * 57.3 + 90;
        var da = ((tang - ang + 540) % 360) - 180; ang += da * .15;
        dot.style.transform = "translate(" + mx + "px," + my + "px)";
        ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px) rotate(" + ang.toFixed(1) + "deg)";
        lab.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px) translate(-50%,-150%)";
        id = (Math.abs(mx - rx) + Math.abs(my - ry) > .3 || Math.abs(da) > .5) ? requestAnimationFrame(loop) : 0;
      }
      addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; if (!id) id = requestAnimationFrame(loop); }, { passive: true });
      addEventListener("pointerdown", function () { cur.classList.add("is-down"); });
      addEventListener("pointerup", function () { cur.classList.remove("is-down"); });
      d.addEventListener("pointerleave", function () { mx = my = -100; });
      d.addEventListener("pointerover", function (e) {
        var t = e.target, a = t.closest("[data-cur]"), link = t.closest("a,button,[role=tab],label"), ph = t.closest("[data-cur-photo]"), sc = t.closest("[data-cur-scene]");
        var txt = a ? a.dataset.cur : "";
        cur.classList.toggle("is-link", !!txt); lab.textContent = txt;
        cur.classList.toggle("is-hover", !txt && !!link);
        cur.classList.toggle("is-photo", !link && !!ph);
        cur.classList.toggle("is-scene", !!sc && !txt);
      });
    }

    /* ---------- кнопки: заливка из точки входа ---------- */
    $$(".btn").forEach(function (b) {
      function at(e) { var r = b.getBoundingClientRect(); b.style.setProperty("--mx", (e.clientX - r.left) + "px"); b.style.setProperty("--my", (e.clientY - r.top) + "px"); b.style.setProperty("--fs", (Math.hypot(r.width, r.height) * 2.2 / 10).toFixed(1)); }
      b.addEventListener("pointerenter", at); b.addEventListener("pointerleave", at);
    });

    /* ---------- spotlight и лёгкий наклон карточек ---------- */
    if (FINE) $$("[data-spot]").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--x", (x * 100).toFixed(1) + "%"); c.style.setProperty("--y", (y * 100).toFixed(1) + "%");
        if (motion()) { c.style.setProperty("--ry", ((x - .5) * 4).toFixed(2) + "deg"); c.style.setProperty("--rx", ((.5 - y) * 4).toFixed(2) + "deg"); }
      });
      c.addEventListener("pointerleave", function () { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
    });

    /* ---------- прогресс чтения ---------- */
    var bar = d.querySelector(".prog i"), tick = false;
    function prog() { tick = false; var h = root.scrollHeight - innerHeight; bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, scrollY / h) : 0).toFixed(4) + ")"; }
    addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(prog); } }, { passive: true }); prog();

    /* ---------- меню: подсветка раздела и бегунок ---------- */
    var nav = d.querySelector(".hdr nav"), runner = nav && nav.querySelector(".runner"), links = $$(".hdr nav a"), curLink = null;
    function moveRunner() { if (!runner) return; if (!curLink) { runner.style.opacity = 0; return; } runner.style.opacity = 1; runner.style.width = curLink.offsetWidth - 24 + "px"; runner.style.transform = "translateX(" + (curLink.offsetLeft + 12) + "px)"; }
    var secs = links.map(function (a) { return d.querySelector(a.hash); }).filter(Boolean);
    function spy() {
      var y = innerHeight * .35, hit = null;
      secs.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) hit = s; });
      var a = hit ? links.filter(function (l) { return l.hash === "#" + hit.id; })[0] : null;
      if (a !== curLink) { links.forEach(function (l) { l.classList.toggle("cur", l === a); if (l === a) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current"); }); curLink = a; moveRunner(); }
    }
    var st2 = false; addEventListener("scroll", function () { if (!st2) { st2 = true; requestAnimationFrame(function () { st2 = false; spy(); }); } }, { passive: true }); addEventListener("resize", moveRunner); spy();

    /* ---------- снег в hero: ≤ 46 хлопьев, спит вне экрана ---------- */
    var cv = d.querySelector(".hero .snow");
    if (cv && K.raf && motion()) {
      var cx = cv.getContext("2d"), W = 0, H = 0, fl = [];
      function size() { var r = cv.getBoundingClientRect(), k = .5; W = cv.width = Math.round(r.width * k); H = cv.height = Math.round(r.height * k); }
      size(); addEventListener("resize", size);
      for (var i = 0; i < 46; i++) fl.push({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 1.6, s: .012 + Math.random() * .03, w: Math.random() * 6 });
      K.raf(cv, function (t, dt) {
        cx.clearRect(0, 0, W, H); cx.fillStyle = "rgba(236,240,244,.7)";
        fl.forEach(function (f) { f.y += f.s * dt / 1000; f.x += Math.sin(t / 1400 + f.w) * .00025 - .0002; if (f.y > 1.02) { f.y = -.02; f.x = Math.random(); } if (f.x < -.02) f.x = 1.02; cx.beginPath(); cx.arc(f.x * W, f.y * H, f.r, 0, 6.283); cx.fill(); });
      }, 25);
    }

    /* ---------- вкладки услуг и смена фото ---------- */
    var tabs = $$(".tabs [role=tab]"), ink = d.querySelector(".tab-ink"), ph = d.querySelector(".svc-ph"), imgs = ph ? $$("img", ph) : [], front = 0, curImg = "freight";
    function inkTo(t) { if (!ink) return; ink.style.width = t.offsetWidth + "px"; ink.style.transform = "translateX(" + t.offsetLeft + "px)"; }
    function photo(name) {
      if (!ph || name === curImg) return; curImg = name;
      var back = imgs[1 - front]; back.src = "img/" + name + ".webp"; back.decode ? back.decode().catch(function () {}).then(sw) : sw();
      function sw() { back.style.zIndex = 2; imgs[front].style.zIndex = 1; back.classList.add("on"); var old = imgs[front]; setTimeout(function () { old.classList.remove("on"); }, 820); front = 1 - front; }
    }
    function rowOn(li) { $$(".rows li.on").forEach(function (x) { x.classList.remove("on"); }); li.classList.add("on"); photo(li.dataset.img); }
    function select(t, focus) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; d.getElementById(x.getAttribute("aria-controls")).hidden = !on; });
      inkTo(t); if (focus) t.focus();
      var p = d.getElementById(t.getAttribute("aria-controls")), first = p.querySelector(".rows li"); if (first) rowOn(first);
      if (G && motion()) gsap.from(p.querySelectorAll(".rows li, .price"), { y: 18, autoAlpha: 0, duration: .6, stagger: .05, ease: "power3.out" });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) { var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); } });
    });
    $$(".rows li").forEach(function (li) { var b = li.querySelector("button"); ["pointerenter", "focus", "click"].forEach(function (ev) { (ev === "pointerenter" ? li : b).addEventListener(ev, function () { rowOn(li); }); }); });
    var r0 = d.querySelector(".rows li"); if (r0) r0.classList.add("on");
    if (tabs[0]) { inkTo(tabs[0]); addEventListener("resize", function () { inkTo(tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0]); }); }

    /* ---------- форма: состояния кнопки (kit показывает письмо) ---------- */
    $$("form[data-demo-form]").forEach(function (f) {
      f.addEventListener("submit", function () {
        var b = f.querySelector("button[type=submit]"); f.classList.remove("sent"); b.classList.add("is-busy");
        var ok = b.querySelector(".ok path");
        setTimeout(function () { b.classList.remove("is-busy"); b.classList.add("is-ok"); if (G && ok && window.DrawSVGPlugin && motion()) gsap.from(ok, { drawSVG: 0, duration: .45 }); }, 800);
        setTimeout(function () { f.classList.add("sent"); b.classList.remove("is-ok"); var o = f.querySelector(".done"); o && o.focus({ preventScroll: true }); }, 1500);
      });
    });

    if (!G) return;
    var mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion:no-preference)", fine: "(hover:hover) and (pointer:fine)", wide: "(min-width:901px)" }, function (ctx) {
      var c = ctx.conditions; if (!c.motion) return;

      /* hero: фото → заголовок по строкам из маски → лид → кнопки → столбики-километры → рельс */
      var delay = root.classList.contains("pre-on") ? 1.15 : .15;
      var h1 = d.querySelector(".hero-h"), split = window.SplitText ? SplitText.create(h1, { type: "lines", mask: "lines" }) : null;
      var tl = gsap.timeline({ delay: delay, defaults: { ease: "power3.out" } });
      tl.fromTo(".hero-ph img", { scale: 1.12, filter: "brightness(.45)" }, { scale: 1, filter: "brightness(1)", duration: 2, ease: "power2.out" }, 0)
        .from(split ? split.lines : h1, { yPercent: 110, duration: 1.05, stagger: .1, ease: "power4.out" }, .25)
        .from(".hero-k", { autoAlpha: 0, y: 14, duration: .7 }, .35)
        .from(".lead", { autoAlpha: 0, y: 18, duration: .8 }, .75)
        .from(".hero-cta > *", { autoAlpha: 0, y: 18, duration: .7, stagger: .08 }, .95)
        .from(".post li", { autoAlpha: 0, x: 22, duration: .6, stagger: .07 }, 1.05)
        .fromTo(".hero-rail path", { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.6, ease: "power2.inOut", stagger: .1 }, .6);
      /* тихая жизнь: медленный дрейф и параллакс фото по мыши */
      var drift = gsap.to(".hero-ph", { scale: 1.035, duration: 22, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.4 });
      if (c.fine) {
        var qx = gsap.quickTo(".hero-ph img", "x", { duration: 1.2, ease: "power3.out" }), qy = gsap.quickTo(".hero-ph img", "y", { duration: 1.2, ease: "power3.out" });
        var hero = d.querySelector(".hero"), mv = function (e) { qx((e.clientX / innerWidth - .5) * -18); qy((e.clientY / innerHeight - .5) * -12); };
        hero.addEventListener("pointermove", mv);
      }
      /* hero уходит под лист «Клиентам» */
      gsap.to(".hero-g", { yPercent: -14, autoAlpha: .2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      /* схема уходит под лист услуг */
      gsap.to(".line-pin", { scale: .95, autoAlpha: .45, ease: "none", scrollTrigger: { trigger: ".svc", start: "top bottom", end: "top 25%", scrub: true } });

      /* параллакс фото */
      $$("[data-par]").forEach(function (im) { gsap.fromTo(im, { yPercent: -9 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: im.parentElement, start: "top bottom", end: "bottom top", scrub: true } }); });

      /* шкала оценки пути */
      gsap.from(".grade-fill", { scaleX: 0, duration: 1.6, ease: "power2.inOut", scrollTrigger: { trigger: ".grade", start: "top 80%", once: true } });
      gsap.from(".d25", { left: "37.5%", duration: 1.6, ease: "power2.inOut", scrollTrigger: { trigger: ".grade", start: "top 80%", once: true } });

      /* история: горизонтальная лента, только широкий экран */
      if (c.wide) {
        var track = d.querySelector(".hist-track"), list = d.querySelector(".hist-l"); track.style.overflow = "hidden";
        var dist = function () { return Math.max(0, list.scrollWidth - innerWidth); };
        var ht = gsap.timeline({ scrollTrigger: { trigger: ".hist", start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1 } });
        ht.to(list, { x: function () { return -dist(); }, ease: "none" }, 0).to(".hist-bar i", { scaleX: 1, ease: "none" }, 0);
        return function () { track.style.overflow = ""; drift.kill(); };
      }
      return function () { drift.kill(); };
    });
  }
  if (window.KIT) go(); else d.addEventListener("kit:ready", go);
})();
