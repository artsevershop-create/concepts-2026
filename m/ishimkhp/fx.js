/* Живость: шторка, вход hero, курсор-зерно, кнопки, подсветка, прогресс, параллакс, лента от скорости, мучная пыль, меню-бегунок, подвал. */
(function () {
"use strict";
var d = document, root = d.documentElement, w = window;
var calm = matchMedia("(prefers-reduced-motion:reduce)"), fine = matchMedia("(hover:hover) and (pointer:fine)");
var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
var G = w.gsap, hasG = !!(G && w.ScrollTrigger);
if (hasG) G.registerPlugin(ScrollTrigger, SplitText);

/* ---- 8. шторка: раз за сеанс, ≤ 1 с ---- */
var curtain = d.querySelector(".curtain"), intro = 0.05;
function dropCurtain() { if (curtain) { curtain.remove(); curtain = null; } }
if (curtain && (calm.matches || root.classList.contains("seen") || !hasG)) dropCurtain();
else if (curtain) {
  try { sessionStorage.setItem("ishim-seen", "1"); } catch (e) {}
  G.timeline({ onComplete: dropCurtain })
    .from(curtain.firstChild, { opacity: 0, scale: .92, duration: .35, ease: "power2.out" })
    .to(curtain, { clipPath: "inset(0 0 100% 0)", duration: .55, ease: "power3.inOut" }, .4);
  intro = .6;
}

/* ---- 3. вход hero одной timeline (≈3 с), потом тихая жизнь ---- */
function heroIn() {
  var h1 = d.querySelector(".hero h1"); if (!h1) return;
  var split = SplitText.create(h1, { type: "lines", mask: "lines" });
  var tl = G.timeline({ delay: intro, defaults: { ease: "power3.out" } });
  tl.from(".hero-logo", { y: 30, rotate: -6, scale: .9, opacity: 0, duration: 1.1, ease: "power4.out" }, 0)
    .from(".print", { y: 50, rotate: 4, opacity: 0, duration: 1.2 }, .15)
    .from(".print img", { clipPath: "inset(0 0 100% 0)", scale: 1.15, duration: 1.3, ease: "power4.inOut" }, .25)
    .from(".kicker", { y: 12, opacity: 0, duration: .6 }, .2)
    .from(split.lines, { yPercent: 115, duration: 1.05, stagger: .12, ease: "power4.out" }, .3)
    .from(".hero h1 em", { color: "#2A1B10", duration: 1.2, ease: "power1.inOut" }, 1.1)
    .from(".lead", { y: 20, opacity: 0, duration: .8 }, .9)
    .from(".cta .btn", { y: 16, opacity: 0, duration: .7, stagger: .1, clearProps: "transform,opacity" }, 1.1)
    .from(".trust li", { y: 14, opacity: 0, duration: .6, stagger: .09 }, 1.4);
  if (fine.matches) G.to(".hero-logo", { rotate: 1.5, duration: 7, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 3.5 });
}
if (hasG && !calm.matches) (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(heroIn);

/* ---- 4. прогресс, параллакс фото, лента от скорости, листы наезжают ---- */
if (hasG && !calm.matches) {
  G.to(".progress i", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });
  $$(".work-photos img, .shop .ph img").forEach(function (img) {
    G.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: "none", scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
  });
  G.to(".print", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  var tr = d.querySelector(".band .track"), x = 0, v = 0, sk = 0, skT = 0;
  if (tr) {
    ScrollTrigger.create({ trigger: ".band", start: "top bottom", end: "bottom top",
      onUpdate: function (s) { v = s.getVelocity(); skT = Math.max(-10, Math.min(10, v / -260)); } });
    G.ticker.add(function () {
      if (w.KIT && KIT.still) return;
      x -= .35 + Math.min(4, Math.abs(v) / 900); v *= .92; skT *= .9; sk += (skT - sk) * .12;
      var half = tr.scrollWidth / 2; if (-x > half) x += half;
      tr.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0) skewX(" + sk.toFixed(2) + "deg)";
    });
  }
  ["#need", ".path", ".contacts"].forEach(function (s) {
    var el = d.querySelector(s); if (!el || el.classList.contains("path")) return;
    G.from(el, { y: 60, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top 55%", scrub: true } });
  });
  /* подвал: «Сила Сибири» поднимается по буквам */
  var fw = d.querySelector(".ftr-word");
  if (fw) {
    var s = SplitText.create(fw, { type: "chars", charsClass: "ch" });
    G.from(s.chars, { yPercent: 100, opacity: 0, stagger: .04, duration: .9, ease: "power4.out", scrollTrigger: { trigger: fw, start: "top 92%" } });
  }
}

/* ---- 7. мучная пыль в hero: ≤ 40 частиц, спит вне экрана и на скрытой вкладке ---- */
(function () {
  var c = d.querySelector(".dust"), hero = d.querySelector(".hero"); if (!c || !w.KIT) return;
  var x = c.getContext("2d"), P = [], W = 0, H = 0, n = 0, k = .5;
  function size() {
    W = c.width = Math.max(20, Math.round(hero.clientWidth * k)); H = c.height = Math.max(20, Math.round(hero.clientHeight * k)); n = W < 260 ? 18 : 40;
    while (P.length < n) P.push({ x: Math.random() * W, y: Math.random() * H, r: .5 + Math.random() * 1.6, v: 3 + Math.random() * 7, ph: Math.random() * 6.3, a: .18 + Math.random() * .35, g: Math.random() < .25 });
    P.length = n;
  }
  size(); addEventListener("resize", size);
  KIT.raf(c, function (t, dt) {
    x.clearRect(0, 0, W, H); var s = dt / 1000;
    for (var i = 0; i < n; i++) {
      var p = P[i]; p.y += p.v * s; p.x += Math.sin(t / 2400 + p.ph) * .12 + 1.2 * s;
      if (p.y > H + 4) { p.y = -4; p.x = Math.random() * W; } if (p.x > W + 4) p.x = -4;
      x.globalAlpha = p.a; x.fillStyle = p.g ? "#C98E2B" : "#FFFFFF";
      x.beginPath(); if (p.g) x.ellipse(p.x, p.y, p.r * 1.6, p.r, p.ph, 0, 6.283); else x.arc(p.x, p.y, p.r, 0, 6.283); x.fill();
    }
    x.globalAlpha = 1;
  }, 25);
})();

/* ---- 2. кнопки: перекат текста, стрелка, заливка из точки входа ---- */
$$(".btn").forEach(function (b) {
  var t = b.textContent.trim();
  b.innerHTML = '<span class="roll"><span>' + t + '</span><span aria-hidden="true">' + t + "</span></span>";
  if (b.hasAttribute("data-arrow")) { var a = d.createElement("i"); a.className = "arr"; a.setAttribute("aria-hidden", "true"); a.textContent = "→"; b.appendChild(a); }
  function pt(e) { var r = b.getBoundingClientRect(); b.style.setProperty("--x", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%"); b.style.setProperty("--y", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%"); }
  b.addEventListener("pointerenter", pt); b.addEventListener("pointerleave", pt);
});

/* ---- 6. подсветка за курсором, бегунок меню, шапка с маркой после hero ---- */
if (fine.matches) $$(".pcard, .chooser, .form, .scale, .dirs li").forEach(function (el) {
  el.classList.add("sp"); if (getComputedStyle(el).position === "static") el.style.position = "relative";
  el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); el.style.setProperty("--x", (e.clientX - r.left) + "px"); el.style.setProperty("--y", (e.clientY - r.top) + "px"); });
});
var hdr = d.querySelector(".hdr"), nav = d.querySelector(".hdr nav"), runner = nav && nav.querySelector(".runner"), links = $$("a", nav);
function runTo() {
  if (!runner) return; var a = links.filter(function (l) { return l.hasAttribute("aria-current"); })[0];
  if (!a) { runner.style.opacity = 0; return; }
  runner.style.opacity = 1; runner.style.width = a.offsetWidth + "px"; runner.style.transform = "translateX(" + a.offsetLeft + "px)";
}
var spy = new IntersectionObserver(function (es) {
  es.forEach(function (e) {
    if (!e.isIntersecting) return;
    var id = e.target.id === "about" ? "products" : e.target.id, a = links.filter(function (l) { return l.hash === "#" + id; })[0];
    links.forEach(function (l) { l.removeAttribute("aria-current"); }); if (a) a.setAttribute("aria-current", "true");
    runTo();
  });
}, { rootMargin: "-45% 0px -54% 0px" });
$$("main > section").forEach(function (s) { spy.observe(s); });
addEventListener("resize", runTo);
new IntersectionObserver(function (es) { hdr.classList.toggle("past", !es[0].isIntersecting); }, { rootMargin: "0px" }).observe(d.querySelector(".hero-logo"));

/* ---- анимированная отправка демо-формы ---- */
$$("form[data-demo-form]").forEach(function (f) {
  var b = f.querySelector(".btn"), ok = false;
  f.addEventListener("submit", function (e) {
    if (ok) { ok = false; return; }
    e.preventDefault(); e.stopImmediatePropagation();
    if (b.classList.contains("sending")) return;
    b.classList.add("sending"); b.setAttribute("aria-busy", "true");
    var r = b.querySelectorAll(".roll span"); r.forEach(function (s) { s.textContent = "Отправляем…"; });
    setTimeout(function () { b.classList.remove("sending"); b.removeAttribute("aria-busy"); r.forEach(function (s) { s.textContent = "Отправить заявку"; }); ok = true; f.requestSubmit(); }, 900);
  }, true);
});

/* ---- 1. курсор: зерно поворачивается по ходу движения, за ним с инерцией — оболочка-колосок ---- */
(function () {
  if (calm.matches || !fine.matches) return;
  var cur = d.createElement("div"); cur.className = "cur"; cur.setAttribute("aria-hidden", "true");
  cur.innerHTML = '<span class="cur-h"><i></i></span><span class="cur-g"><i></i></span><span class="cur-lab"></span>';
  d.body.appendChild(cur); root.classList.add("has-cur");
  var hull = cur.children[0], g = cur.children[1], lab = cur.children[2];
  var tx = -99, ty = -99, rx = -99, ry = -99, ang = 0, id = 0, shown = false, mode = "", txt = "";
  function label(el) {
    if (el.closest("input,textarea,select")) return ["off", ""];
    if (el.closest(".plant")) return ["scene", "Путь зерна"];
    var a = el.closest("a,button,summary,[data-burger],.sacks-svg g"); if (!a) return ["", ""];
    var h = a.getAttribute("href") || "", btn = a.classList.contains("btn");
    var t = h.indexOf("tel:") === 0 ? "Позвонить" : h.indexOf("mailto:") === 0 ? "Написать" : a.hasAttribute("data-copy") ? "Копировать" : a.closest(".rail") ? "К этапу" : a.closest(".tl") ? "Год" : a.getAttribute("role") === "tab" ? "Выбрать" : a.closest(".chips,.sacks-svg") ? "Фасовка" : a.type === "submit" ? "Отправить" : h.charAt(0) === "#" ? "Перейти" : "Открыть";
    return [btn ? "btn" : "link", t];
  }
  function loop() {
    var dx = tx - rx, dy = ty - ry; rx += dx * .16; ry += dy * .16;
    if (Math.abs(dx) + Math.abs(dy) > 2) { var diff = ((Math.atan2(dy, dx) * 57.3 - ang + 540) % 360) - 180; ang += Math.max(-12, Math.min(12, diff * .25)); }
    g.style.transform = "translate(" + tx + "px," + ty + "px) rotate(" + ang.toFixed(1) + "deg)";
    hull.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px) rotate(" + ang.toFixed(1) + "deg)";
    lab.style.transform = "translate(" + (rx + 26).toFixed(1) + "px," + (ry + 18).toFixed(1) + "px)";
    id = Math.abs(tx - rx) + Math.abs(ty - ry) > .15 ? requestAnimationFrame(loop) : 0;
  }
  function set(m, t) {
    if (m !== mode) { mode = m; cur.className = "cur" + (shown ? " on" : "") + (m ? " is-" + m : ""); }
    if (t !== txt) { txt = t; lab.textContent = t; }
  }
  addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    tx = e.clientX; ty = e.clientY;
    if (!shown) { shown = true; rx = tx; ry = ty; cur.classList.add("on"); }
    if (!id) id = requestAnimationFrame(loop);
  }, { passive: true });
  d.addEventListener("pointerover", function (e) { var l = label(e.target); set(l[0], l[1]); });
  d.addEventListener("pointerdown", function () { cur.classList.add("is-down"); });
  d.addEventListener("pointerup", function () { cur.classList.remove("is-down"); });
  root.addEventListener("pointerleave", function () { shown = false; cur.classList.remove("on"); });
})();

/* ---- 3. параллакс hero за мышью (6–14 px) ---- */
if (hasG && fine.matches && !calm.matches) {
  var hero = d.querySelector(".hero");
  var q = [[".hero-logo", 14], [".print", -9], [".hero h1", -6]].map(function (a) { var el = d.querySelector(a[0]); return [G.quickTo(el, "x", { duration: 1.4, ease: "power3" }), G.quickTo(el, "y", { duration: 1.4, ease: "power3" }), a[1]]; });
  hero.addEventListener("pointermove", function (e) {
    var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
    q.forEach(function (f) { f[0](nx * f[2]); f[1](ny * f[2]); });
  });
}
})();
