/* Живость «Ремэкс»: шторка, вход hero, позёмка, курсор-звёздочка, кнопки, бегунок меню, прогресс, фото за курсором, подсветка, сцена «След» на scrub, параллакс, карта, форма. */
(function () {
"use strict";
var d = document, root = d.documentElement, w = window, KIT = w.KIT || {};
var calmQ = matchMedia("(prefers-reduced-motion:reduce)"), fineQ = matchMedia("(hover:hover) and (pointer:fine)");
var $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
var G = w.gsap, hasG = !!(G && w.ScrollTrigger && w.SplitText);
if (hasG) G.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);

/* ---- кнопки: перекат текста, заливка из точки входа (работает и без GSAP) ---- */
$$(".btn").forEach(function (b) {
  var t = $(".btn-t", b); if (t && !$(".in", t)) { var s = d.createElement("span"); s.className = "in"; s.dataset.t = t.dataset.t || t.textContent; s.textContent = t.textContent; t.textContent = ""; t.appendChild(s); }
  var f = d.createElement("i"); f.className = "fill"; f.setAttribute("aria-hidden", "true"); b.insertBefore(f, b.firstChild);
  b.addEventListener("pointerenter", function (e) { var r = b.getBoundingClientRect(); b.style.setProperty("--mx", e.clientX - r.left + "px"); b.style.setProperty("--my", e.clientY - r.top + "px"); b.style.setProperty("--fd", Math.max(r.width, r.height) * 2.4 + "px"); });
});
d.addEventListener("rx:list", function () { $$("#list .btn").forEach(function (b) { if ($(".fill", b)) return; var t = $(".btn-t", b), s = d.createElement("span"); s.className = "in"; s.dataset.t = t.dataset.t; s.textContent = t.textContent; t.textContent = ""; t.appendChild(s); var f = d.createElement("i"); f.className = "fill"; b.insertBefore(f, b.firstChild); b.addEventListener("pointerenter", function (e) { var r = b.getBoundingClientRect(); b.style.setProperty("--mx", e.clientX - r.left + "px"); b.style.setProperty("--my", e.clientY - r.top + "px"); b.style.setProperty("--fd", Math.max(r.width, r.height) * 2.4 + "px"); }); }); });

/* ---- подсветка за курсором у фишек и карточек ---- */
d.addEventListener("pointermove", function (e) { var c = e.target.closest && e.target.closest(".chip label,.mc"); if (!c) return; var r = c.getBoundingClientRect(); c.style.setProperty("--x", e.clientX - r.left + "px"); c.style.setProperty("--y", e.clientY - r.top + "px"); }, { passive: true });

/* ---- 1. курсор: точка + звёздочка гусеницы, катится по ходу движения ---- */
(function cursor() {
  var cur = $(".cur"); if (!cur) return;
  var gear = $(".cur-gear", cur), ring = $(".cur-ring", cur), dot = $(".cur-dot", cur), lab = $(".cur-t", cur);
  var p = "", n = 12; for (var i = 0; i < n; i++) { var a0 = i / n * Math.PI * 2, a1 = a0 + Math.PI / n * .55, a2 = a0 + Math.PI / n * 1.0, a3 = a0 + Math.PI / n * 1.45; [[a0, 16], [a1, 16], [a1 + .05, 21], [a2, 21], [a3 - .05, 21], [a3, 16]].forEach(function (q, j) { p += (i + j ? "L" : "M") + (Math.cos(q[0]) * q[1]).toFixed(2) + " " + (Math.sin(q[0]) * q[1]).toFixed(2); }); }
  gear.setAttribute("d", p + "ZM7 0A7 7 0 1 0 -7 0A7 7 0 1 0 7 0Z");
  var mx = -100, my = -100, x = -100, y = -100, rot = 0, id = 0, on = false;
  function loop() {
    var dx = mx - x, dy = my - y; x += dx * .2; y += dy * .2; rot += (dx * .2 + dy * .1) * 1.4;
    ring.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) rotate(" + rot.toFixed(1) + "deg)";
    id = Math.abs(dx) + Math.abs(dy) > .3 ? requestAnimationFrame(loop) : 0;
  }
  function enable() { on = fineQ.matches && !calmQ.matches; root.classList.toggle("has-cur", on); }
  enable(); fineQ.addEventListener("change", enable); calmQ.addEventListener("change", enable);
  var lastT = "";
  d.addEventListener("pointermove", function (e) {
    if (!on || e.pointerType !== "mouse") return;
    mx = e.clientX; my = e.clientY; dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
    if (!id) id = requestAnimationFrame(loop);
    var t = e.target, link = t.closest && t.closest("a,button,label,[data-cur]"), zone = t.closest && t.closest("[data-cur-zone]");
    cur.classList.toggle("is-link", !!link); cur.classList.toggle("is-photo", !link && !!zone && zone.dataset.curZone === "photo");
    cur.classList.toggle("on-dark", !!(t.closest && t.closest("[data-theme=night]")));
    var txt = link ? (link.dataset.cur || "") : ""; if (txt !== lastT) { lastT = txt; lab.textContent = txt; cur.classList.toggle("has-t", !!txt); }
  }, { passive: true });
  d.addEventListener("pointerdown", function () { cur.classList.add("is-down"); });
  d.addEventListener("pointerup", function () { cur.classList.remove("is-down"); });
  d.documentElement.addEventListener("mouseleave", function () { mx = my = -100; dot.style.transform = "translate3d(-100px,-100px,0)"; if (!id) id = requestAnimationFrame(loop); });
})();

/* ---- фото направления за курсором ---- */
(function rowsPic() {
  var box = $(".cursor-pic"), img = box && $("img", box), rows = $(".rows"); if (!box || !rows) return;
  var x = 0, y = 0, tx = 0, ty = 0, id = 0;
  function loop() { x += (tx - x) * .14; y += (ty - y) * .14; box.style.transform = "translate3d(" + (x + 28).toFixed(1) + "px," + (y - 120).toFixed(1) + "px,0) rotate(" + ((tx - x) * .02).toFixed(2) + "deg)"; id = Math.abs(tx - x) + Math.abs(ty - y) > .3 ? requestAnimationFrame(loop) : 0; }
  rows.addEventListener("pointermove", function (e) { if (!fineQ.matches || calmQ.matches) return; tx = e.clientX; ty = e.clientY; if (!box.classList.contains("on")) { x = tx; y = ty; } var r = e.target.closest(".row"); if (r && img.getAttribute("src") !== r.dataset.pic) img.src = r.dataset.pic; box.classList.toggle("on", !!r); if (!id) id = requestAnimationFrame(loop); });
  rows.addEventListener("pointerleave", function () { box.classList.remove("on"); });
})();

/* ---- 7. позёмка: снег несёт низко над настом, ≤ 48 частиц ---- */
(function drift() {
  var cv = $(".drift"); if (!cv || !KIT.raf) return;
  var cx = cv.getContext("2d"), W = 0, H = 0, P = [], seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function size() { var r = cv.getBoundingClientRect(), k = Math.min(devicePixelRatio || 1, 1.5); W = Math.max(1, r.width); H = Math.max(1, r.height); cv.width = W * k; cv.height = H * k; cx.setTransform(k, 0, 0, k, 0, 0); }
  size(); addEventListener("resize", size);
  for (var i = 0; i < 48; i++) P.push({ x: rnd(), y: .35 + rnd() * .65, v: .04 + rnd() * .08, l: 10 + rnd() * 50, a: .15 + rnd() * .35, ph: rnd() * 6 });
  KIT.raf(cv, function (t, dt) {
    cx.clearRect(0, 0, W, H); if (calmQ.matches) return;
    P.forEach(function (p) {
      p.x -= p.v * dt / 1000; if (p.x < -.1) { p.x = 1.05; p.y = .35 + Math.random() * .65; }
      var X = p.x * W, Y = p.y * H + Math.sin(t / 900 + p.ph) * 6, g = cx.createLinearGradient(X, 0, X + p.l, 0);
      g.addColorStop(0, "rgba(238,242,243," + p.a + ")"); g.addColorStop(1, "rgba(238,242,243,0)");
      cx.strokeStyle = g; cx.lineWidth = 1.4; cx.beginPath(); cx.moveTo(X, Y); cx.lineTo(X + p.l, Y - 2); cx.stroke();
    });
  }, 30);
})();

/* ---- видео в hero: только при движении, на широком экране и без экономии трафика ---- */
(function video() {
  var v = $(".hero-video"); if (!v) return;
  var save = navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || ""));
  function upd() {
    var ok = !calmQ.matches && !save && matchMedia("(min-width:701px)").matches && !KIT.still;
    if (ok) { if (!v.src) { v.src = v.dataset.src; v.addEventListener("playing", function () { v.classList.add("on"); }, { once: true }); } v.play().catch(function () {}); }
    else { v.pause(); v.classList.remove("on"); }
  }
  addEventListener("load", function () { setTimeout(upd, 900); });
  calmQ.addEventListener("change", upd); d.addEventListener("kit:still", upd);
  KIT.onView && KIT.onView(v, function (vis) { if (!v.src) return; if (vis && !calmQ.matches && !KIT.still) v.play().catch(function () {}); else v.pause(); });
})();

/* ---- бегунок меню и текущий раздел ---- */
(function menu() {
  var nav = $(".hdr nav"), run = $(".runner"), links = $$(".hdr nav a"); if (!nav) return;
  function move(a) {
    links.forEach(function (l) { l.classList.toggle("is-cur", l === a); if (l === a) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current"); });
    if (!a) { run.style.opacity = 0; return; }
    run.style.opacity = 1; run.style.width = a.offsetWidth + "px"; run.style.transform = "translateX(" + a.offsetLeft + "px)";
  }
  var secs = links.map(function (a) { return d.querySelector(a.hash); });
  var tick = false;
  function upd() { tick = false; var y = innerHeight * .4, cur = null; secs.forEach(function (s, i) { if (!s) return; var r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) cur = links[i]; }); move(cur); }
  addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); addEventListener("resize", upd); upd();
})();

/* ---- прогресс чтения (без GSAP — тоже работает) ---- */
(function progress() {
  var bar = $(".progress i"); if (!bar) return; var tick = false;
  function upd() { tick = false; var m = root.scrollHeight - innerHeight; bar.style.transform = "scaleX(" + (m > 0 ? Math.min(1, scrollY / m) : 0).toFixed(4) + ")"; }
  addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
})();

/* ---- форма: проверка, «отправка», галочка рисуется ---- */
(function form() {
  var f = $("form[data-demo-form]"); if (!f) return; var go = false;
  f.addEventListener("submit", function (e) {
    if (go) { go = false; return; }
    e.preventDefault(); e.stopImmediatePropagation();
    var bad = $$("[required]", f).filter(function (i) { return i.type === "checkbox" ? !i.checked : !i.value.trim(); });
    var btn = $("button[type=submit]", f);
    if (bad.length) { btn.classList.remove("shake"); void btn.offsetWidth; btn.classList.add("shake"); bad[0].focus(); return; }
    btn.classList.add("is-busy"); $(".in", btn).textContent = "Отправляем…";
    setTimeout(function () {
      go = true; f.dispatchEvent(new Event("submit", { cancelable: true }));
      if (hasG && !calmQ.matches) G.fromTo(".done-ok circle,.done-ok path", { drawSVG: "0%" }, { drawSVG: "100%", duration: .9, stagger: .25, ease: "power2.inOut" });
    }, 700);
  }, true);
})();

if (!hasG) { var c0 = $(".curtain"); if (c0) c0.remove(); $(".trace").classList.add("static"); return; }

/* ---- 8. шторка: раз за сеанс, < 1 с ---- */
var curtain = $(".curtain"), intro = .05;
function dropCurtain() { if (curtain) { curtain.remove(); curtain = null; } }
if (curtain && (calmQ.matches || root.classList.contains("seen"))) dropCurtain();
else if (curtain) {
  try { sessionStorage.setItem("rx-seen", "1"); } catch (e) {}
  G.timeline({ onComplete: dropCurtain })
    .from($("img", curtain), { opacity: 0, y: 10, duration: .3, ease: "power2.out" })
    .fromTo($("i", curtain), { scaleX: 0 }, { scaleX: 1, duration: .45, ease: "power2.inOut" }, 0)
    .to(curtain, { clipPath: "inset(0 0 100% 0)", duration: .45, ease: "power3.inOut" }, .5);
  intro = .7;
}

/* точки следа и их подписи */
var path = $("#trace-path"), ptsG = $(".trace-pts"), items = $$(".gauge li"), FR = [.14, .32, .5, .68, .87], stations = [];
(function makePts() {
  var L = path.getTotalLength(), NS = "http://www.w3.org/2000/svg";
  items.forEach(function (li, i) {
    var p = path.getPointAtLength(L * FR[i]), g = d.createElementNS(NS, "g"), cc = d.createElementNS(NS, "circle"), t = d.createElementNS(NS, "text");
    cc.setAttribute("cx", p.x); cc.setAttribute("cy", p.y); cc.setAttribute("r", 11);
    t.setAttribute("x", p.x); t.setAttribute("y", p.y - 58); t.setAttribute("text-anchor", "middle"); t.textContent = $("b", li).textContent;
    g.appendChild(cc); g.appendChild(t); ptsG.appendChild(g); stations.push(g);
  });
})();
function drawStatic() { G.set(".trace-mask", { drawSVG: "100%" }); stations.forEach(function (s) { s.classList.add("is-on"); }); }

var mm = G.matchMedia();
mm.add({ motion: "(prefers-reduced-motion:no-preference)", wide: "(min-width:901px)", fine: "(hover:hover) and (pointer:fine)" }, function (ctx) {
  var c = ctx.conditions, trace = $(".trace");
  if (!c.motion || !c.wide) trace.classList.add("static"); else trace.classList.remove("static");
  if (!c.motion) { drawStatic(); return function () { trace.classList.remove("static"); }; }

  /* 3. вход hero: фото → заголовок строками из маски → лид → кнопки → детали (≈3 с) */
  d.fonts.ready.then(function () {
    var h1 = $(".hero h1"), sp = SplitText.create(h1, { type: "lines", mask: "lines" });
    G.timeline({ delay: intro, defaults: { ease: "power3.out" } })
      .from(".hero-poster", { scale: 1.12, duration: 2.2, ease: "power2.out" }, 0)
      .from(".kick", { y: 14, autoAlpha: 0, duration: .6 }, .25)
      .from(sp.lines, { yPercent: 108, duration: 1.05, stagger: .11, ease: "power4.out" }, .35)
      .from(".hero .lead", { y: 18, autoAlpha: 0, duration: .8 }, 1)
      .from(".hero .cta > *", { y: 16, autoAlpha: 0, duration: .7, stagger: .08 }, 1.2)
      .from(".trust > div", { y: 14, autoAlpha: 0, duration: .7, stagger: .08 }, 1.45)
      .from(".hero-tag", { x: 24, autoAlpha: 0, duration: .8 }, 1.7)
      .from(".tread", { scaleX: 0, transformOrigin: "0 50%", duration: 1.2, ease: "power2.inOut" }, 1.2);
    /* заголовки секций строками */
    $$("[data-lines]").forEach(function (h) {
      var s = SplitText.create(h, { type: "lines", mask: "lines" });
      G.from(s.lines, { yPercent: 110, duration: 1, stagger: .08, ease: "power4.out", scrollTrigger: { trigger: h, start: "top 86%", once: true } });
    });
  });

  /* тихая жизнь: параллакс фото hero по мыши (до 10 px) и уход hero под лист */
  if (c.fine) {
    var hx = G.quickTo(".hero-media img, .hero-media video", "x", { duration: 1.2, ease: "power3" }), hy = G.quickTo(".hero-media img, .hero-media video", "y", { duration: 1.2, ease: "power3" });
    $(".hero").addEventListener("pointermove", function (e) { hx((e.clientX / innerWidth - .5) * -20); hy((e.clientY / innerHeight - .5) * -12); });
  }
  G.to(".hero-in", { yPercent: -10, autoAlpha: .35, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .4 } });

  /* 4. параллакс и раскрытие фото */
  $$("[data-par]").forEach(function (im) { G.fromTo(im, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: im.parentNode, start: "top bottom", end: "bottom top", scrub: .5 } }); });

  /* 5. сцена «След»: pin + scrub, протектор рисуется, звёздочка идёт по пути, на каждой машине плато */
  if (c.wide) scene(); else drawStatic();

  /* подбор: новые строки входят каскадом */
  function onList() { G.from("#list .mc", { y: 18, autoAlpha: 0, duration: .5, stagger: .06, ease: "power3.out", overwrite: true }); }
  d.addEventListener("rx:list", onList);

  /* карта: линии от Сургута прорисовываются */
  G.from(".map-lines path", { drawSVG: "0%", duration: 1.4, stagger: .12, ease: "power2.inOut", scrollTrigger: { trigger: ".map", start: "top 75%", once: true } });
  G.from(".map-pts .pt", { scale: 0, transformOrigin: "50% 50%", autoAlpha: 0, duration: .5, stagger: .1, ease: "back.out(2)", scrollTrigger: { trigger: ".map", start: "top 75%", once: true } });
  G.to(".map-pts .halo", { attr: { r: 26 }, opacity: 0, duration: 2.4, repeat: -1, ease: "power1.out" });

  return function () { d.removeEventListener("rx:list", onList); trace.classList.remove("static"); };
});

function scene() {
  var card = $(".trace-card"), txt = card.children[1], img = $(".trace-card-img", card), v = $(".trace-v b", card), n = $(".trace-n", card), s = $(".trace-s", card), dots = $$(".trace-dots li", card), cur = -1;
  function setCard(i) {
    if (i === cur) return; cur = i; var li = items[i];
    G.timeline().to([img, txt], { autoAlpha: 0, y: 6, duration: .15, ease: "power1.in", onComplete: function () {
      img.src = "img/" + li.dataset.photo + ".webp"; v.textContent = $("b", li).textContent; n.textContent = $("span", li).textContent; s.innerHTML = li.dataset.s;
    } }).to([img, txt], { autoAlpha: 1, y: 0, duration: .35, ease: "power2.out" });
    dots.forEach(function (dd, j) { dd.classList.toggle("on", j <= i); });
    stations.forEach(function (st, j) { st.classList.toggle("is-on", j === i); });
    card.classList.toggle("is-own", li.classList.contains("is-own"));
  }
  G.set(".trace-mask", { drawSVG: "0%" }); G.set(".trace-gear", { autoAlpha: 1 });
  G.set(stations, { autoAlpha: 0, scale: .4, transformOrigin: "50% 50%" });
  var tl = G.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".trace-pin", start: "top top", end: "+=" + (innerHeight * 3.4), pin: true, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true,
    onUpdate: function (st) { var p = tl.time(), i = 0; marks.forEach(function (m, j) { if (p >= m - .4) i = j; }); setCard(i); } } });
  var marks = [], prev = 0, t = 0;
  tl.to(".trace-head", { autoAlpha: .9, duration: .01 }, 0);
  FR.forEach(function (f, i) {
    var seg = (f - prev) * 6;
    tl.to(".trace-mask", { drawSVG: "0% " + (f * 100) + "%", duration: seg }, t)
      .to(".trace-gear", { motionPath: { path: path, align: path, alignOrigin: [.5, .5], start: prev, end: f }, duration: seg, ease: "power1.inOut" }, t)
      .to(stations[i], { autoAlpha: 1, scale: 1, duration: .5, ease: "back.out(2)" }, t + seg - .3);
    t += seg; marks.push(t); t += 1.1; prev = f; // плато ~1,1 доли: подпись стоит, пока читают
  });
  tl.to(".trace-mask", { drawSVG: "0% 100%", duration: (1 - prev) * 6 }, t)
    .to(".trace-gear", { motionPath: { path: path, align: path, alignOrigin: [.5, .5], start: prev, end: 1 }, duration: (1 - prev) * 6 }, t)
    .to(".trace-head", { autoAlpha: 0, y: -20, duration: 1 }, t)
    .fromTo(".trace-bg img", { scale: 1.12 }, { scale: 1, duration: tl.duration() + 1 }, 0);
  setCard(0);
}
addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
