/* Ноябрьская ПГЭ: шторка, вход hero, искры, курсор-манометр, кнопки, подсветка, меню-бегунок, сцена «цикл блока». */
(function () {
"use strict";
var d = document, root = d.documentElement, w = window;
var calm = matchMedia("(prefers-reduced-motion:reduce)"), fine = matchMedia("(hover:hover) and (pointer:fine)");
var $ = function (s, r) { return (r || d).querySelector(s); };
var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
var G = w.gsap, hasG = !!(G && w.ScrollTrigger);
if (hasG) G.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);
var still = function () { return calm.matches || (w.KIT && KIT.still); };

/* ---- шторка: раз за сеанс, до 1 с ---- */
var curtain = $(".curtain"), intro = 0.1;
function dropCurtain() { if (curtain) { curtain.remove(); curtain = null; } }
if (curtain && (calm.matches || root.classList.contains("seen") || !hasG)) dropCurtain();
else if (curtain) {
  try { sessionStorage.setItem("npge-seen", "1"); } catch (e) {}
  G.timeline({ onComplete: dropCurtain })
    .from(curtain.children, { opacity: 0, y: 12, duration: .3, stagger: .08, ease: "power2.out" })
    .to(curtain, { yPercent: -100, duration: .55, ease: "power3.inOut" }, .45);
  intro = .7;
}

/* ---- кнопки: перекат текста, стрелка, заливка от точки входа ---- */
function roll(b, t) { b.querySelector(".roll") ? $$(".roll span", b).forEach(function (s) { s.textContent = t; }) : (b.innerHTML = '<span class="roll"><span>' + t + '</span><span aria-hidden="true">' + t + "</span></span>"); }
$$(".btn").forEach(function (b) {
  roll(b, b.textContent.trim());
  if (b.hasAttribute("data-arrow")) { var a = d.createElement("i"); a.className = "arr"; a.setAttribute("aria-hidden", "true"); a.textContent = "→"; b.appendChild(a); }
  function pt(e) { var r = b.getBoundingClientRect(); b.style.setProperty("--x", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%"); b.style.setProperty("--y", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%"); }
  b.addEventListener("pointerenter", pt); b.addEventListener("pointerleave", pt);
});

/* ---- вход hero одной timeline (≈3 с) ---- */
function heroIn() {
  var h1 = $(".hero h1"), split = SplitText.create(h1, { type: "lines", mask: "lines" });
  G.timeline({ delay: intro, defaults: { ease: "power3.out" } })
    .from(".hero", { backgroundPosition: "0 40px", duration: 1 }, 0)
    .from(split.lines, { yPercent: 110, duration: 1.05, stagger: .14, ease: "power4.out" }, .1)
    .from(".lead", { y: 20, opacity: 0, duration: .8 }, .7)
    .from(".hero .cta .btn", { y: 16, opacity: 0, duration: .7, stagger: .1, clearProps: "transform,opacity" }, .85)
    .from(".plant .frame path, .plant .kit-eq :is(path,rect,circle)", { drawSVG: "0%", duration: 1.5, stagger: .025, ease: "power2.inOut" }, .6)
    .from(".plant .flow, .plant .stripe", { opacity: 0, duration: .8, stagger: .06 }, 1.7)
    .from(".plant .lbl text, .plant .g", { opacity: 0, y: 8, duration: .6, stagger: .07 }, 2)
    .from(".specs > div", { opacity: 0, y: 14, duration: .7, stagger: .08 }, 2.1);
}
if (hasG && !calm.matches) (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(heroIn);

/* ---- прокрутка: прогресс, параллакс, наезд сцены, бегущая строка ---- */
if (hasG && !calm.matches) {
  G.to(".progress i", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });
  G.to(".plant svg", { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  G.from(".cycle", { scale: .95, borderRadius: 64, ease: "none", scrollTrigger: { trigger: ".cycle", start: "top bottom", end: "top 30%", scrub: true } });
  $$(".st-photo img, .ph img").forEach(function (el) { G.fromTo(el, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: "none", scrollTrigger: { trigger: el.parentNode, start: "top bottom", end: "bottom top", scrub: true } }); });
  G.fromTo(".band .track", { xPercent: 0 }, { xPercent: -35, ease: "none", scrollTrigger: { trigger: ".band", start: "top bottom", end: "bottom top", scrub: true } });
}

/* ---- атмосфера: редкие искры над станцией (≤ 40, спят вне экрана и на скрытой вкладке) ---- */
(function () {
  var c = $(".embers"), hero = $(".hero"); if (!c || !w.KIT) return;
  var x = c.getContext("2d"), ps = [], W = 0, H = 0, n = 0;
  function spawn(p, any) { p.x = Math.random() * W; p.y = any ? Math.random() * H : H + 4; p.v = 10 + Math.random() * 22; p.r = .6 + Math.random() * 1.6; p.ph = Math.random() * 6.3; p.life = .35 + Math.random() * .45; return p; }
  function size() { W = c.width = Math.round(hero.clientWidth * .5); H = c.height = Math.round(hero.clientHeight * .5); n = W < 300 ? 18 : 40; while (ps.length < n) ps.push(spawn({}, true)); ps.length = n; }
  size(); addEventListener("resize", size);
  KIT.raf(c, function (t, dt) {
    x.clearRect(0, 0, W, H); var s = dt / 1000;
    for (var i = 0; i < n; i++) {
      var p = ps[i]; p.y -= p.v * s; p.x += Math.sin(t / 1100 + p.ph) * .25;
      if (p.y < H * (1 - p.life)) spawn(p);
      var a = Math.max(0, (p.y - H * (1 - p.life)) / (H * p.life));
      x.globalAlpha = a * .8; x.fillStyle = a > .7 ? "#FFB089" : "#FF5B1F";
      x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283); x.fill();
    }
    x.globalAlpha = 1;
  }, 30);
})();

/* ---- подсветка за курсором, меню-бегунок, текущий раздел ---- */
if (fine.matches) $$(".door, .figs > div, .feed li, .form, .m, .unit li").forEach(function (el) {
  el.classList.add("sp");
  el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); el.style.setProperty("--x", (e.clientX - r.left) + "px"); el.style.setProperty("--y", (e.clientY - r.top) + "px"); });
});
var nav = $(".hdr nav"), runner = nav && $(".runner", nav), links = $$("a", nav);
function runTo() {
  var a = links.filter(function (l) { return l.hasAttribute("aria-current"); })[0];
  if (!runner) return;
  if (!a) { runner.style.opacity = 0; return; }
  runner.style.opacity = 1; runner.style.width = a.offsetWidth + "px"; runner.style.transform = "translateX(" + a.offsetLeft + "px)";
}
var spy = new IntersectionObserver(function (es) {
  es.forEach(function (e) {
    if (!e.isIntersecting) return;
    var a = links.filter(function (l) { return l.hash === "#" + e.target.id; })[0];
    links.forEach(function (l) { l.removeAttribute("aria-current"); }); if (a) a.setAttribute("aria-current", "true");
    runTo();
  });
}, { rootMargin: "-45% 0px -54% 0px" });
$$("main > section").forEach(function (s) { spy.observe(s); });
addEventListener("resize", runTo);

/* ---- демо-форма: состояние «отправляем» перед показом письма ---- */
$$("form[data-demo-form]").forEach(function (f) {
  var b = $(".btn", f), ok = false, t = $(".roll span", b).textContent;
  f.addEventListener("submit", function (e) {
    if (ok) { ok = false; return; }
    e.preventDefault(); e.stopImmediatePropagation();
    if (b.classList.contains("sending")) return;
    b.classList.add("sending"); b.setAttribute("aria-busy", "true"); roll(b, "Отправляем…");
    setTimeout(function () { b.classList.remove("sending"); b.removeAttribute("aria-busy"); roll(b, t); ok = true; f.requestSubmit(); }, 1000);
  }, true);
});

/* ---- курсор-манометр: стрелка давления растёт над действиями ---- */
(function () {
  if (calm.matches || !fine.matches) return;
  var cur = $(".cur"); if (!cur) return; root.classList.add("has-cur");
  var dot = $(".cur-dot", cur), g = $(".cur-g", cur), lab = $(".cur-lab", cur);
  var tx = -99, ty = -99, gx = -99, gy = -99, id = 0, shown = false, mode = "";
  function label(el) {
    if (el.closest("input,textarea,select")) return ["off", ""];
    if (el.closest(".screen")) return ["scene", "Шаг →"];
    var a = el.closest("a,button"); if (!a) return ["", ""];
    var h = a.getAttribute("href") || "", btn = a.classList.contains("btn");
    var t = h.indexOf("tel:") === 0 ? "Позвонить" : h.indexOf("mailto:") === 0 ? "Написать" : a.closest(".rail,.pager") ? "Шаг →" : a.type === "submit" ? "Отправить" : a.hasAttribute("data-burger") ? "Меню" : h.charAt(0) === "#" ? "Перейти" : "Открыть";
    return [btn ? "btn" : "link", t];
  }
  function loop() {
    gx += (tx - gx) * .2; gy += (ty - gy) * .2;
    dot.style.transform = "translate(" + tx + "px," + ty + "px)";
    g.style.transform = "translate(" + gx.toFixed(1) + "px," + gy.toFixed(1) + "px)";
    lab.style.transform = "translate(" + (gx + 30).toFixed(1) + "px," + (gy + 22).toFixed(1) + "px)";
    id = Math.abs(tx - gx) + Math.abs(ty - gy) > .15 ? requestAnimationFrame(loop) : 0;
  }
  addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    tx = e.clientX; ty = e.clientY;
    if (!shown) { shown = true; gx = tx; gy = ty; cur.classList.add("on"); }
    if (!id) id = requestAnimationFrame(loop);
  }, { passive: true });
  d.addEventListener("pointerover", function (e) {
    var l = label(e.target); if (l[1]) lab.textContent = l[1];
    if (l[0] !== mode) { mode = l[0]; cur.className = "cur" + (shown ? " on" : "") + (mode ? " is-" + mode : ""); }
  });
  d.addEventListener("pointerdown", function () { cur.classList.add("is-down"); });
  d.addEventListener("pointerup", function () { cur.classList.remove("is-down"); });
  root.addEventListener("pointerleave", function () { shown = false; cur.classList.remove("on"); });
})();

/* ---- параллакс hero за мышью (6–12 px) ---- */
if (hasG && fine.matches && !calm.matches) {
  var hero = $(".hero"), pl = $(".plant"), h1 = $(".hero h1");
  var qp = [G.quickTo(pl, "x", { duration: 1.3, ease: "power3" }), G.quickTo(pl, "y", { duration: 1.3, ease: "power3" })],
      qh = [G.quickTo(h1, "x", { duration: 1.6, ease: "power3" }), G.quickTo(h1, "y", { duration: 1.6, ease: "power3" })];
  hero.addEventListener("pointermove", function (e) {
    var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
    qp[0](nx * 20); qp[1](ny * 12); qh[0](nx * -10); qh[1](ny * -6);
  });
}

/* ---- сигнатурная сцена: цикл блока по шагам ---- */
(function () {
  var screen = $("#screen"), src = $(".plant svg"); if (!screen || !src) return;
  var NS = "http://www.w3.org/2000/svg", svg = src.cloneNode(true);
  svg.removeAttribute("role"); svg.removeAttribute("aria-label"); svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  var defs = $("defs", svg); if (defs) defs.remove();
  screen.appendChild(svg);
  /* куда смотрит «камера» на каждом шаге (пропорция кадра 8:3,6) */
  var VB = ["0 290 760 342", "40 290 760 342", "380 40 1000 450", "560 60 1040 468", "0 -60 1600 720"];
  /* путь одной порции топлива по шагам */
  var SEG = ["M0 520H385V445", "M385 445H520", "M520 445L640 432C700 400 760 300 780 100", "M780 100V84H1110V440H1240", "M1240 440H1170V528H1600"].map(function (dd) {
    var p = d.createElementNS(NS, "path"); p.setAttribute("d", dd); p.setAttribute("fill", "none"); svg.appendChild(p); return p;
  });
  var tok = d.createElementNS(NS, "g"); tok.innerHTML = '<circle class="tok-h" r="22"/><circle class="tok" r="9"/>'; svg.appendChild(tok);
  var parts = $$("[data-s]", svg), tabs = $$(".rail [role=tab]"), panes = $$(".pane"), next = $("#next"), prev = $("#prev");
  var mw = $("#mw"), heat = $("#heat"), mEl = $(".m-el"), mHeat = $(".m-heat"), bGt = $(".b-gt"), bSt = $(".b-st"), kGt = $(".k-gt"), kSt = $(".k-st");
  var cur = -1, mwNow = { v: 0 };
  function endOf(p) { var q = p.getPointAtLength(p.getTotalLength()); return { x: q.x, y: q.y }; }
  function go(i, fromStart) {
    i = (i + 5) % 5; var was = cur; cur = i; var anim = hasG && !still();
    parts.forEach(function (el) { var s = +el.getAttribute("data-s"); el.classList.toggle("hot", s <= i); el.classList.toggle("now", s === i); });
    tabs.forEach(function (t, k) { t.setAttribute("aria-selected", k === i); t.tabIndex = k === i ? 0 : -1; t.classList.toggle("done", k < i); });
    panes.forEach(function (p, k) { p.hidden = k !== i; });
    roll(next, i === 4 ? "Пройти заново" : "Следующий шаг"); prev.disabled = i === 0;
    var v = i >= 3 ? 62 : i >= 1 ? 42 : 0;
    mEl.classList.toggle("on", i >= 1); bGt.classList.toggle("on", i >= 1); bSt.classList.toggle("on", i >= 3); kGt.classList.toggle("on", i >= 1); kSt.classList.toggle("on", i >= 3);
    mHeat.classList.toggle("on", i >= 4); heat.textContent = i >= 4 ? "идёт в сеть" : i === 3 ? "пар в турбине" : i === 2 ? "готовится пар" : "ждёт пара";
    if (anim) {
      G.to(mwNow, { v: v, duration: .9, ease: "power2.out", onUpdate: function () { mw.textContent = Math.round(mwNow.v); } });
      G.to(svg, { attr: { viewBox: VB[i] }, duration: 1.1, ease: "power3.inOut" });
      G.killTweensOf(tok);
      if (was === i - 1 || fromStart) G.fromTo(tok, { opacity: 1 }, { motionPath: { path: SEG[i], start: 0, end: 1 }, duration: 1.3, ease: "power1.inOut" });
      else { var e = endOf(SEG[i]); G.timeline().to(tok, { opacity: 0, duration: .15 }).set(tok, e).to(tok, { opacity: 1, duration: .3 }); }
    } else {
      mwNow.v = v; mw.textContent = v; svg.setAttribute("viewBox", VB[i]);
      var q = endOf(SEG[i]); tok.setAttribute("transform", "translate(" + q.x + "," + q.y + ")");
    }
  }
  tabs.forEach(function (t, k) {
    t.addEventListener("click", function () { go(k); });
    t.addEventListener("keydown", function (e) {
      var to = { ArrowRight: k + 1, ArrowLeft: k - 1, Home: 0, End: 4 }[e.key]; if (to === undefined) return;
      e.preventDefault(); to = (to + 5) % 5; go(to); tabs[to].focus();
    });
  });
  next.addEventListener("click", function () { go(cur + 1, cur === 4); });
  prev.addEventListener("click", function () { if (cur > 0) go(cur - 1); });
  screen.addEventListener("click", function () { go(cur + 1, cur === 4); });
  screen.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") { e.preventDefault(); go(cur + 1, cur === 4); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); if (cur > 0) go(cur - 1); }
  });
  /* стартовый кадр: шаг 1, без движения; при первом показе — фишка топлива едет по трубе */
  go(0); if (hasG) G.set(tok, endOf(SEG[0]));
  if (w.KIT) KIT.onView(screen, function (v) { if (v && cur === 0 && !screen.dataset.run) { screen.dataset.run = 1; if (hasG && !still()) go(0, true); } }, { threshold: .5 });
  /* при прокрутке контур станции в кадре прорисовывается (scrub) */
  if (hasG && !calm.matches) G.from($$(".frame path, .kit-eq :is(path,rect,circle)", svg), { drawSVG: "0%", stagger: .02, ease: "none", scrollTrigger: { trigger: ".cycle", start: "top 85%", end: "top 15%", scrub: .6 } });
  /* живое переключение reduced motion: сразу в собранное состояние */
  calm.addEventListener("change", function () { if (hasG) { ScrollTrigger.getAll().forEach(function (s) { s.progress && s.animation && s.animation.progress(1); }); G.globalTimeline.getChildren().forEach(function (t) { t.progress(1); }); } var k = cur; cur = -1; go(k); });
})();
})();
