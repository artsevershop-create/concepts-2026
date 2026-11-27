/* Живость: шторка, вход hero, заголовки по строкам, курсор «знак главной дороги», кнопки, подсветка, меню-бегунок,
   прогресс, параллакс и раскрытие фото, бегущая строка от скорости, иней в hero, отправка демо-формы. */
(function () {
"use strict";
var d = document, root = d.documentElement, w = window;
var calm = matchMedia("(prefers-reduced-motion:reduce)"), fine = matchMedia("(hover:hover) and (pointer:fine)");
var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
var G = w.gsap, hasG = !!(G && w.ScrollTrigger);
if (hasG) { G.registerPlugin(ScrollTrigger, SplitText); if (w.CustomEase) CustomEase.create("ps.out", "0.22,1,0.36,1"); }

/* ---- 8. шторка: один раз за сеанс, < 1 с ---- */
var curtain = d.querySelector(".curtain"), intro = 0;
function drop() { if (curtain) { curtain.remove(); curtain = null; } }
if (curtain && (calm.matches || root.classList.contains("seen") || !hasG)) drop();
else if (curtain) {
  try { sessionStorage.setItem("sad-seen", "1"); } catch (e) {}
  G.timeline({ onComplete: drop })
    .from(".curtain-plate", { y: 12, opacity: 0, duration: .3, ease: "power2.out" })
    .from(".curtain-line", { scaleX: 0, duration: .35, ease: "power2.inOut" }, .1)
    .to(curtain, { yPercent: -100, duration: .5, ease: "power3.inOut" }, .45);
  intro = .6;
}

/* ---- 3. вход hero одной timeline (≈3 с): фото → строки заголовка → лид → кнопки → пульт → цифры ---- */
function heroIn() {
  var h1 = d.querySelector(".hero h1"); if (!h1) return;
  var sp = SplitText.create(h1, { type: "lines", mask: "lines" });
  var tl = G.timeline({ delay: intro, defaults: { ease: "power3.out" } });
  tl.fromTo(".band", { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: 1.3, ease: "power3.inOut" }, 0)
    .from(".band img", { scale: 1.12, duration: 1.8 }, 0)
    .from(".kicker", { opacity: 0, y: 10, duration: .6 }, .15)
    .from(sp.lines, { yPercent: 112, duration: 1, stagger: .1, ease: "power4.out" }, .25)
    .from(".lead", { opacity: 0, y: 18, duration: .7 }, .85)
    .from(".hero .cta .btn", { opacity: 0, y: 16, duration: .6, stagger: .09, clearProps: "transform,opacity" }, 1.05)
    .from(".desk", { opacity: 0, x: 24, duration: .8 }, .9)
    .from(".desk-why li", { opacity: 0, x: 10, duration: .5, stagger: .08 }, 1.4)
    .from(".trust > div", { opacity: 0, y: 14, duration: .6, stagger: .08 }, 1.6);
}

/* ---- заголовки секций по строкам из маски ---- */
function linesIn() {
  $$("[data-lines]").forEach(function (h) {
    var s = SplitText.create(h, { type: "lines", mask: "lines" });
    G.from(s.lines, { yPercent: 110, duration: 1, stagger: .08, ease: "power4.out", scrollTrigger: { trigger: h, start: "top 86%", once: true } });
  });
}

/* ---- 4. прокрутка: прогресс, параллакс, раскрытие фото, бегущая строка от скорости, полосы графика ---- */
function scrollFx() {
  G.to(".progress i", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });
  G.to(".band img", { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  $$(".museum-ph img, .jobs-ph img").forEach(function (im) {
    G.fromTo(im, { yPercent: -10 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: im.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
    G.fromTo(im.parentNode, { clipPath: "inset(18% 8% 18% 8% round 18px)" }, { clipPath: "inset(0% 0% 0% 0% round 18px)", duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: im.parentNode, start: "top 85%", once: true } });
  });
  G.from(".bars i", { scaleY: 0, duration: 1.1, stagger: .1, ease: "power3.out", scrollTrigger: { trigger: ".bars", start: "top 85%", once: true } });
  G.from(".stack i", { scaleX: 0, duration: 1, stagger: .12, ease: "power3.out", scrollTrigger: { trigger: ".stack", start: "top 88%", once: true } });
  var tr = d.querySelector(".ticker-track"), x = 0, v = 0, lastY = scrollY, half = 0;
  if (tr) {
    var setX = G.quickSetter(tr, "x", "px");
    var meas = function () { half = tr.scrollWidth / 2; }; meas(); addEventListener("resize", meas);
    var run = function () { var y = scrollY, dy = y - lastY; lastY = y; v += (Math.max(-40, Math.min(40, dy)) - v) * .1; x -= .5 + Math.abs(v) * .6; if (-x > half) x += half; setX(x); };
    ScrollTrigger.create({ trigger: ".ticker", start: "top bottom", end: "bottom top", onToggle: function (s) { s.isActive ? G.ticker.add(run) : G.ticker.remove(run); } });
  }
}

/* ---- 2. кнопки: перекат текста, стрелка, заливка из точки входа ---- */
$$(".btn").forEach(function (b) {
  var t = b.textContent.trim();
  b.innerHTML = '<span class="roll"><span>' + t + '</span><span aria-hidden="true">' + t + "</span></span>";
  if (b.hasAttribute("data-arrow")) { var a = d.createElement("i"); a.className = "arr"; a.setAttribute("aria-hidden", "true"); a.textContent = "→"; b.appendChild(a); }
  function pt(e) { var r = b.getBoundingClientRect(); b.style.setProperty("--x", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%"); b.style.setProperty("--y", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%"); }
  b.addEventListener("pointerenter", pt); b.addEventListener("pointerleave", pt);
});

/* ---- 6. подсветка карточек за курсором ---- */
if (fine.matches) d.addEventListener("pointermove", function (e) {
  var el = e.target.closest && e.target.closest(".sp"); if (!el) return;
  var r = el.getBoundingClientRect(); el.style.setProperty("--x", (e.clientX - r.left) + "px"); el.style.setProperty("--y", (e.clientY - r.top) + "px");
}, { passive: true });

/* ---- 6. меню: бегунок и текущий раздел ---- */
var nav = d.querySelector(".hdr nav"), runner = nav && nav.querySelector(".runner"), links = nav ? $$("a", nav) : [];
function runTo() {
  if (!runner) return; var a = links.filter(function (l) { return l.hasAttribute("aria-current"); })[0];
  if (!a) { runner.style.opacity = 0; return; }
  runner.style.opacity = 1; runner.style.width = a.offsetWidth + "px"; runner.style.transform = "translateX(" + a.offsetLeft + "px)";
}
var spy = new IntersectionObserver(function (es) {
  es.forEach(function (e) {
    if (!e.isIntersecting) return;
    links.forEach(function (l) { if (l.hash === "#" + e.target.id) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current"); });
    runTo();
  });
}, { rootMargin: "-45% 0px -54% 0px" });
$$("main > section").forEach(function (s) { spy.observe(s); });
addEventListener("resize", runTo);

/* ---- 6. демо-форма: состояние «отправляем», затем показ письма (kit) и рисование галочки ---- */
$$("form[data-demo-form]").forEach(function (f) {
  var b = f.querySelector(".btn"), ok = false;
  f.addEventListener("submit", function (e) {
    if (ok) { ok = false; if (hasG && !calm.matches) G.fromTo(f.querySelectorAll(".ok circle, .ok path"), { drawSVG: "0%" }, { drawSVG: "100%", duration: .7, stagger: .2, delay: .05 }); return; }
    e.preventDefault(); e.stopImmediatePropagation();
    if (b.classList.contains("sending")) return;
    b.classList.add("sending"); b.setAttribute("aria-busy", "true");
    var r = b.querySelectorAll(".roll span"), t = r[0].textContent; r.forEach(function (s) { s.textContent = "Отправляем…"; });
    setTimeout(function () { b.classList.remove("sending"); b.removeAttribute("aria-busy"); r.forEach(function (s) { s.textContent = t; }); ok = true; f.requestSubmit(); }, 900);
  }, true);
  f.addEventListener("invalid", function () { if (hasG && !calm.matches) G.fromTo(f, { x: -6 }, { x: 0, duration: .4, ease: "elastic.out(1,.3)" }); }, true);
});

/* ---- 1. курсор «знак главной дороги»: жёлтый ромб + рамка с инерцией; над схемой — знак переправы ---- */
(function () {
  if (calm.matches || !fine.matches) return;
  var cur = d.createElement("div"); cur.className = "cur"; cur.setAttribute("aria-hidden", "true");
  cur.innerHTML = '<span class="cur-ring"><i></i></span><span class="cur-dot"><i></i></span><span class="cur-lab"></span>';
  d.body.appendChild(cur); root.classList.add("has-cur");
  var ring = cur.children[0], dot = cur.children[1], lab = cur.children[2];
  var tx = -99, ty = -99, rx = -99, ry = -99, id = 0, mode = null, txt = "", dark = false, nights = $$('[data-theme="night"], .dir-card');
  function kind(el) {
    if (el.closest("input,textarea,select")) return ["off", ""];
    if (el.closest(".scene,.dir-svg")) return ["scene", "Схема"];
    var a = el.closest("a,button,[data-burger],.row"); if (!a) return ["", ""];
    var h = a.getAttribute("href") || "";
    var t = h.indexOf("tel:") === 0 ? "Позвонить" : h.indexOf("mailto:") === 0 ? "Написать" : a.closest(".dir-tabs") ? "Район" : a.closest(".dir-list") ? "Показать" : a.classList.contains("row") ? "Смотреть" : a.type === "submit" || (a.tagName === "BUTTON" && a.closest("form")) ? "Отправить" : h.charAt(0) === "#" ? "Перейти" : h ? "Открыть" : "";
    return [a.classList.contains("btn") ? "btn" : "link", t];
  }
  function loop() {
    rx += (tx - rx) * .18; ry += (ty - ry) * .18;
    dot.style.transform = "translate(" + tx + "px," + ty + "px)";
    ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
    lab.style.transform = "translate(" + (rx + 24).toFixed(1) + "px," + (ry + 18).toFixed(1) + "px)";
    id = Math.abs(tx - rx) + Math.abs(ty - ry) > .2 ? requestAnimationFrame(loop) : 0;
  }
  addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    tx = e.clientX; ty = e.clientY;
    if (mode === null) { rx = tx; ry = ty; mode = ""; }
    cur.classList.add("on");
    if (!id) id = requestAnimationFrame(loop);
  }, { passive: true });
  d.addEventListener("pointerover", function (e) {
    var k = kind(e.target), nd = nights.some(function (s) { return s.contains(e.target); });
    if (k[0] !== mode || nd !== dark) { mode = k[0]; dark = nd; cur.className = "cur on" + (mode ? " is-" + mode : "") + (dark ? " on-night" : ""); }
    if (k[1] !== txt) { txt = k[1]; lab.textContent = txt; }
  });
  d.addEventListener("pointerdown", function () { cur.classList.add("is-down"); });
  d.addEventListener("pointerup", function () { cur.classList.remove("is-down"); });
  root.addEventListener("pointerleave", function () { cur.classList.remove("on"); });
})();

/* ---- 3. тихая жизнь hero: параллакс за мышью (6–12 px) ---- */
function heroParallax() {
  var hero = d.querySelector(".hero"); if (!hero) return;
  var qd = [G.quickTo(".desk", "x", { duration: 1.2, ease: "power3" }), G.quickTo(".desk", "y", { duration: 1.2, ease: "power3" })],
      qb = [G.quickTo(".band img", "x", { duration: 1.6, ease: "power3" })],
      qh = [G.quickTo(".hero h1", "x", { duration: 1.6, ease: "power3" }), G.quickTo(".hero h1", "y", { duration: 1.6, ease: "power3" })];
  hero.addEventListener("pointermove", function (e) {
    var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
    qd[0](nx * 12); qd[1](ny * 10); qb[0](nx * -16); qh[0](nx * -8); qh[1](ny * -6);
  });
}

/* ---- 7. атмосфера: иней мерцает в hero (≤ 46 искр, спит вне экрана и на скрытой вкладке) ---- */
(function () {
  var c = d.querySelector(".frost"), hero = d.querySelector(".hero"); if (!c || !w.KIT) return;
  var x = c.getContext("2d"), pts = [], W = 0, H = 0;
  function size() {
    var cw = hero.clientWidth, ch = hero.clientHeight; if (cw < 20 || ch < 20) return;
    W = c.width = Math.round(cw * .5); H = c.height = Math.round(ch * .5);
    var n = cw < 600 ? 18 : 34; pts.length = 0;
    for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H * .62, s: .8 + Math.random() * 1.5, ph: Math.random() * 6.28, sp: .25 + Math.random() * .5, dr: (Math.random() - .5) * 2 });
  }
  size(); addEventListener("resize", size);
  KIT.raf(c, function (t) {
    x.clearRect(0, 0, W, H); var s = t / 1000;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], a = .08 + .32 * Math.max(0, Math.sin(s * p.sp + p.ph)), px = (p.x + p.dr * s * 2 + W) % W, r = p.s * (.6 + a);
      x.globalAlpha = a; x.fillStyle = "#D8ECFF";
      x.beginPath(); x.moveTo(px, p.y - r * 2); x.lineTo(px + r * .5, p.y); x.lineTo(px, p.y + r * 2); x.lineTo(px - r * .5, p.y); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(px - r * 2, p.y); x.lineTo(px, p.y + r * .5); x.lineTo(px + r * 2, p.y); x.lineTo(px, p.y - r * .5); x.closePath(); x.fill();
    }
    x.globalAlpha = 1;
  }, 24);
})();

/* ---- запуск GSAP-слоёв с живым переключением reduced motion ---- */
if (hasG) {
  var mm = G.matchMedia();
  mm.add("(prefers-reduced-motion:no-preference)", function (ctx) {
    // SplitText — после шрифтов; ctx.add, чтобы при включении reduced всё откатилось
    (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(ctx.add(function () { heroIn(); linesIn(); ScrollTrigger.refresh(); }));
    scrollFx();
    if (fine.matches) heroParallax();
  });
}
})();
