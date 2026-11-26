/* Живость: шторка, вход hero, курсор-фара, кнопки, подсветка, прогресс, огни трассы, бегущая строка, меню-бегунок, сцена подбора на scroll. */
(function () {
"use strict";
var d = document, root = d.documentElement, w = window;
var calm = matchMedia("(prefers-reduced-motion:reduce)"), fine = matchMedia("(hover:hover) and (pointer:fine)");
var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
var G = w.gsap, hasG = !!(G && w.ScrollTrigger);
if (hasG) G.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);

/* ---- 8. шторка: раз за сеанс, < 1 с ---- */
var curtain = d.querySelector(".curtain"), intro = 0.1;
function dropCurtain() { if (curtain) { curtain.remove(); curtain = null; } }
if (curtain && (calm.matches || root.classList.contains("seen") || !hasG)) dropCurtain();
else if (curtain) {
  try { sessionStorage.setItem("am-seen", "1"); } catch (e) {}
  G.timeline({ onComplete: dropCurtain })
    .from(curtain.querySelector("img"), { opacity: 0, scale: .9, duration: .35, ease: "power2.out" })
    .to(curtain, { clipPath: "inset(0 0 100% 0)", duration: .5, ease: "power3.inOut" }, .45);
  intro = .65;
}

/* ---- 3. вход hero одной timeline (≈3 с) ---- */
function heroIn() {
  var h1 = d.querySelector(".hero h1"), split = SplitText.create(h1, { type: "lines", mask: "lines" });
  G.timeline({ delay: intro, defaults: { ease: "power3.out" } })
    .fromTo(".hero-photo", { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: 1.2, ease: "power4.inOut" }, 0)
    .from(".hero-photo img", { scale: 1.18, duration: 1.8, ease: "power3.out" }, 0)
    .from(".kick", { y: 14, opacity: 0, duration: .6 }, .2)
    .from(split.lines, { yPercent: 110, duration: 1, stagger: .12, ease: "power4.out" }, .3)
    .from(".hero .lead", { y: 18, opacity: 0, duration: .8 }, .8)
    .from(".hero-cta .btn", { y: 16, opacity: 0, duration: .6, stagger: .08, clearProps: "transform,opacity" }, 1)
    .from(".hero-fig figcaption", { y: 10, opacity: 0, duration: .6 }, 1.3)
    .from(".brandline li", { y: 20, opacity: 0, duration: .6, stagger: .07, clearProps: "transform,opacity" }, 1.4)
    .fromTo(".flare", { backgroundPosition: "120% 0" }, { backgroundPosition: "-30% 0", duration: 1.4, ease: "power2.inOut" }, 1.6);
  /* тихая жизнь: блик фары проходит по фото раз в 8 с */
  G.fromTo(".flare", { backgroundPosition: "120% 0" }, { backgroundPosition: "-30% 0", duration: 1.6, ease: "power2.inOut", repeat: -1, repeatDelay: 7, delay: intro + 9 });
}
if (hasG && !calm.matches) (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(heroIn);

/* ---- 4. прогресс, параллакс, раскрытие фото, наезд листов, бегущая строка ---- */
if (hasG && !calm.matches) {
  G.to(".progress i", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });
  G.to(".hero-photo img", { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  G.fromTo(".about-photo img", { scale: 1.18, yPercent: -4 }, { scale: 1, yPercent: 4, ease: "none", scrollTrigger: { trigger: ".about-photo", start: "top bottom", end: "bottom top", scrub: true } });
  G.fromTo(".about-photo", { clipPath: "inset(12% 12% 12% 12% round 16px)" }, { clipPath: "inset(0% 0% 0% 0% round 16px)", ease: "power2.out", scrollTrigger: { trigger: ".about-photo", start: "top 90%", end: "top 40%", scrub: .6 } });
  G.fromTo(".bphoto", { clipPath: "inset(0 100% 0 0 round 12px)" }, { clipPath: "inset(0 0% 0 0 round 12px)", duration: 1.2, ease: "power4.inOut", scrollTrigger: { trigger: ".bstage", start: "top 75%", once: true } });
  [".service", ".contacts"].forEach(function (s) {
    G.fromTo(s, { y: 90 }, { y: 0, ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "top 55%", scrub: true } });
  });
  var tr = d.querySelector(".band .track");
  if (tr) G.fromTo(tr, { xPercent: 0 }, { xPercent: -40, ease: "none", scrollTrigger: { trigger: ".band", start: "top bottom", end: "bottom top", scrub: .4 } });
  var sl = d.querySelector(".steps-line path");
  if (sl) {
    G.set(sl, { drawSVG: "0%" });
    ScrollTrigger.create({ trigger: "#steps", start: "top 75%", once: true, onEnter: function () {
      G.to(sl, { drawSVG: "100%", duration: 1.6, ease: "power2.inOut" });
      G.from("#steps i", { scale: 0, duration: .6, stagger: .3, ease: "back.out(2)", delay: .1 });
    } });
  }
}

/* ---- 5. сигнатурная сцена: прокрутка ведёт машину по трассе через 7 задач ---- */
(function () {
  var A = w.AM, sec = d.querySelector("#pick"), road = d.querySelector("#road"), path = d.querySelector("#road-path"), car = d.querySelector(".road-car");
  if (!A || !sec) return;
  var N = A.keys.length, cur = 0;
  function animCards() {
    if (!hasG || calm.matches) return;
    G.fromTo("#cards > li", { y: 26, opacity: 0, clipPath: "inset(0 0 18% 0 round 14px)" }, { y: 0, opacity: 1, clipPath: "inset(0 0 0% 0 round 14px)", duration: .6, stagger: .06, ease: "power3.out", overwrite: true, clearProps: "clipPath" });
  }
  d.addEventListener("am:cards", animCards);
  if (!hasG) return;
  /* доли длины трассы, где машина стоит над карточкой задачи i */
  function stops() {
    var L = path.getTotalLength(), out = [];
    for (var i = 0; i < N; i++) {
      var x = (i + .5) / N * 1200, lo = 0, hi = L;
      for (var k = 0; k < 22; k++) { var m = (lo + hi) / 2; if (path.getPointAtLength(m).x < x) lo = m; else hi = m; }
      out.push(lo / L);
    }
    return out;
  }
  var tl = null, st = null;
  function build() {
    if (tl) tl.kill();
    var f = stops();
    G.set(car, { x: 0, y: 0 });
    tl = G.timeline({ paused: true, defaults: { ease: "power1.inOut" } }).set({}, {}, N);
    tl.fromTo(path, { drawSVG: "0% " + f[0] * 100 + "%" }, { drawSVG: "0% " + f[0] * 100 + "%", duration: .01 }, 0);
    tl.to(car, { motionPath: { path: path, align: path, alignOrigin: [.5, .5], autoRotate: true, start: f[0], end: f[0] }, duration: .01 }, 0);
    for (var i = 0; i < N - 1; i++) {
      tl.fromTo(path, { drawSVG: "0% " + f[i] * 100 + "%" }, { drawSVG: "0% " + f[i + 1] * 100 + "%", duration: .5, immediateRender: false }, i + .75)
        .to(car, { motionPath: { path: path, align: path, alignOrigin: [.5, .5], autoRotate: true, start: f[i], end: f[i + 1] }, duration: .5 }, i + .75);
    }
    tl.progress(1).progress(st ? st.progress : 0);
  }
  var mm = G.matchMedia();
  mm.add("(min-width:1101px) and (prefers-reduced-motion:no-preference)", function () {
    sec.classList.add("pinned"); road.classList.add("has-road");
    st = ScrollTrigger.create({
      trigger: sec, start: "top top", end: "+=" + (N * 55) + "%", pin: true, anticipatePin: 1,
      onUpdate: function (s) {
        if (tl) G.to(tl, { progress: s.progress, duration: .5, ease: "power2.out", overwrite: true });
        var i = Math.min(N - 1, Math.floor(s.progress * N)); if (i !== cur) { cur = i; A.setTask(A.keys[i], true); }
      },
      onRefresh: build
    });
    A.scrollTo = function (i) {
      var y = st.start + (st.end - st.start) * (i + .5) / N;
      if (w.KIT && KIT.lenis) KIT.lenis.scrollTo(y, { duration: 1.2 }); else w.scrollTo({ top: y, behavior: "smooth" });
      return true;
    };
    build();
    /* вход сцены: трасса прорисовывается, задачи выезжают */
    G.from(".road-base", { drawSVG: "0%", duration: 1.4, ease: "power2.inOut", scrollTrigger: { trigger: sec, start: "top 70%", once: true } });
    G.from(".task", { y: 24, opacity: 0, duration: .6, stagger: .06, ease: "power3.out", clearProps: "transform,opacity", scrollTrigger: { trigger: sec, start: "top 70%", once: true } });
    return function () { sec.classList.remove("pinned"); road.classList.remove("has-road"); A.scrollTo = null; st = null; if (tl) tl.kill(); tl = null; };
  });
})();

/* ---- 7. атмосфера: огни трассы в hero (≤ 36 полос, спит вне экрана и на скрытой вкладке) ---- */
(function () {
  var c = d.querySelector(".beams"), hero = d.querySelector(".hero"); if (!c || !w.KIT) return;
  var x = c.getContext("2d"), fl = [], W = 0, H = 0, n = 0, dpr = Math.min(2, w.devicePixelRatio || 1);
  function size() {
    W = hero.clientWidth; H = hero.clientHeight; if (!W || !H) return;
    c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); n = W < 600 ? 14 : 36;
    while (fl.length < n) fl.push({ x: Math.random() * W, y: H * (.72 + Math.random() * .24), l: 40 + Math.random() * 140, v: 30 + Math.random() * 90, red: Math.random() < .45, a: .12 + Math.random() * .25 });
    fl.length = n;
  }
  size(); addEventListener("resize", size);
  KIT.raf(c, function (t, dt) {
    if (!W) return; x.clearRect(0, 0, W, H); var s = dt / 1000;
    for (var i = 0; i < n; i++) {
      var f = fl[i]; f.x += (f.red ? -f.v : f.v) * s;
      if (f.x > W + f.l) f.x = -f.l; if (f.x < -f.l) f.x = W + f.l;
      var g = x.createLinearGradient(f.x - f.l, 0, f.x, 0), col = f.red ? "225,37,27" : "255,222,170";
      if (f.red) { g.addColorStop(0, "rgba(" + col + "," + f.a + ")"); g.addColorStop(1, "rgba(" + col + ",0)"); } else { g.addColorStop(0, "rgba(" + col + ",0)"); g.addColorStop(1, "rgba(" + col + "," + f.a + ")"); }
      x.fillStyle = g; x.fillRect(f.x - f.l, f.y, f.l, 1.4);
    }
  }, 30);
})();

/* ---- 2. кнопки: перекат текста, стрелка, заливка из точки входа ---- */
$$(".btn").forEach(function (b) {
  var t = b.textContent.trim();
  b.innerHTML = '<span class="roll"><span>' + t + '</span><span aria-hidden="true">' + t + "</span></span>";
  if (b.hasAttribute("data-arrow")) { var a = d.createElement("i"); a.className = "arr"; a.setAttribute("aria-hidden", "true"); a.textContent = "→"; b.appendChild(a); }
  function pt(e) { var r = b.getBoundingClientRect(); b.style.setProperty("--x", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%"); b.style.setProperty("--y", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%"); }
  b.addEventListener("pointerenter", pt); b.addEventListener("pointerleave", pt);
});

/* ---- 6. подсветка и наклон карточек, меню-бегунок ---- */
if (fine.matches && !calm.matches) {
  d.addEventListener("pointermove", function (e) {
    var el = e.target.closest && e.target.closest(".sp, .act, .card, .fin-card, .task"); if (!el) return;
    var r = el.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    el.style.setProperty("--x", px + "px"); el.style.setProperty("--y", py + "px");
    if (el.matches(".act, .fin-card")) el.style.transform = "perspective(900px) rotateX(" + ((py / r.height - .5) * -3).toFixed(2) + "deg) rotateY(" + ((px / r.width - .5) * 3).toFixed(2) + "deg)";
  }, { passive: true });
  $$(".act, .fin-card").forEach(function (el) { el.classList.add("sp"); el.addEventListener("pointerleave", function () { el.style.transform = ""; }); });
}
var nav = d.querySelector(".hdr nav"), runner = nav && nav.querySelector(".runner"), links = $$("a", nav);
function runTo() {
  var a = links.filter(function (l) { return l.hasAttribute("aria-current"); })[0]; if (!runner) return;
  if (!a) { runner.style.opacity = 0; return; }
  runner.style.opacity = 1; runner.style.width = (a.offsetWidth - 22) + "px"; runner.style.transform = "translateX(" + (a.offsetLeft + 11) + "px)";
}
var spy = new IntersectionObserver(function (es) {
  es.forEach(function (e) {
    if (!e.isIntersecting) return; var a = links.filter(function (l) { return l.hash === "#" + e.target.id; })[0];
    links.forEach(function (l) { l.removeAttribute("aria-current"); }); if (a) a.setAttribute("aria-current", "true"); runTo();
  });
}, { rootMargin: "-45% 0px -54% 0px" });
$$("main section[id]").forEach(function (s) { spy.observe(s); });
addEventListener("resize", runTo);

/* ---- анимированная отправка демо-формы ---- */
$$("form[data-demo-form]").forEach(function (f) {
  var b = f.querySelector("button.btn"), ok = false;
  f.addEventListener("submit", function (e) {
    if (ok) { ok = false; return; }
    e.preventDefault(); e.stopImmediatePropagation(); if (b.classList.contains("sending")) return;
    b.classList.add("sending"); b.setAttribute("aria-busy", "true");
    var r = b.querySelectorAll(".roll span"); r.forEach(function (s) { s.textContent = "Отправляем…"; });
    setTimeout(function () { b.classList.remove("sending"); b.removeAttribute("aria-busy"); r.forEach(function (s) { s.textContent = "Отправить заявку"; }); ok = true; f.requestSubmit(); }, 1000);
  }, true);
});

/* ---- 1. курсор «фара»: точка + прицел с инерцией; над фото — луч, над действием — подпись ---- */
(function () {
  if (calm.matches || !fine.matches) return;
  var cur = d.createElement("div"); cur.className = "cur"; cur.setAttribute("aria-hidden", "true");
  cur.innerHTML = '<i class="cur-dot"></i><span class="cur-ring"><svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="12"/><path d="M17 0v6M17 28v6M0 17h6M28 17h6"/></svg></span><span class="cur-lab"></span>';
  d.body.appendChild(cur); root.classList.add("has-cur");
  var dot = cur.firstChild, ring = dot.nextSibling, lab = ring.nextSibling;
  var tx = -99, ty = -99, rx = -99, ry = -99, id = 0, shown = false, mode = "", txt = "";
  function label(el) {
    if (!el.closest) return ["", ""];
    if (el.closest("input,textarea,select")) return ["off", ""];
    if (el.closest("[data-req]")) return ["btn", "В заявку"];
    if (el.closest(".task")) return ["btn", "Эта задача"];
    if (el.closest(".seg button")) return ["btn", "Фильтр"];
    if (el.closest("#btabs button")) return ["btn", "Показать"];
    if (el.closest(".card figure, .hero-photo, .bphoto, .about-photo")) return ["photo", ""];
    var a = el.closest("a,button"); if (!a) return el.closest(".road") ? ["scene", "Листайте — едем дальше"] : ["", ""];
    var h = a.getAttribute("href") || "";
    if (h.indexOf("tel:") === 0) return ["tel", "Позвонить"];
    if (h.indexOf("mailto:") === 0) return ["link", "Написать"];
    if (a.type === "submit" || a.matches("form .btn")) return ["btn", "Отправить"];
    if (a.target === "_blank") return ["link", "Открыть ↗"];
    return [a.classList.contains("btn") ? "btn" : "link", h.charAt(0) === "#" ? "Перейти" : "Открыть"];
  }
  function loop() {
    rx += (tx - rx) * .2; ry += (ty - ry) * .2;
    dot.style.transform = "translate(" + tx + "px," + ty + "px)";
    ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
    lab.style.transform = "translate(" + (rx + 26).toFixed(1) + "px," + (ry + 22).toFixed(1) + "px)";
    id = Math.abs(tx - rx) + Math.abs(ty - ry) > .15 ? requestAnimationFrame(loop) : 0;
  }
  function set(m, t) { if (m !== mode) { mode = m; cur.className = "cur" + (shown ? " on" : "") + (m ? " is-" + m : ""); } if (t !== txt) { txt = t; lab.textContent = t; } }
  addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return; tx = e.clientX; ty = e.clientY;
    if (!shown) { shown = true; rx = tx; ry = ty; cur.classList.add("on"); }
    if (!id) id = requestAnimationFrame(loop);
  }, { passive: true });
  d.addEventListener("pointerover", function (e) { var l = label(e.target); set(l[0], l[1]); });
  d.addEventListener("pointerdown", function () { cur.classList.add("is-down"); });
  d.addEventListener("pointerup", function () { cur.classList.remove("is-down"); });
  root.addEventListener("pointerleave", function () { shown = false; cur.classList.remove("on"); });
})();

/* ---- 3. параллакс hero за мышью (6–12 px) ---- */
if (hasG && fine.matches && !calm.matches) {
  var hero = d.querySelector(".hero"), fig = d.querySelector(".hero-fig"), txt = d.querySelector(".hero-text");
  var qs = [G.quickTo(fig, "x", { duration: 1.2, ease: "power3" }), G.quickTo(fig, "y", { duration: 1.2, ease: "power3" })],
      qh = [G.quickTo(txt, "x", { duration: 1.6, ease: "power3" }), G.quickTo(txt, "y", { duration: 1.6, ease: "power3" })];
  hero.addEventListener("pointermove", function (e) { var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5; qs[0](nx * 22); qs[1](ny * 14); qh[0](nx * -10); qh[1](ny * -6); });
}
})();
