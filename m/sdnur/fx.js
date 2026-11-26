/* Живость страницы: шторка, вход hero, курсор-ключ, кнопки, подсветка, прогресс, снег, бегущая строка, меню-бегунок, сцена на scroll. */
(function () {
"use strict";
var d = document, root = d.documentElement, w = window;
var calm = matchMedia("(prefers-reduced-motion:reduce)"), fine = matchMedia("(hover:hover) and (pointer:fine)");
var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
var G = w.gsap, hasG = !!(G && w.ScrollTrigger), Z = w.SD_zones;
if (hasG) G.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);
var ready = false; /* вход hero закончился — дальше перерисовки схемы анимируем сами */

/* ---- 8. шторка: один раз за сеанс, до 1 с ---- */
var curtain = d.querySelector(".curtain"), intro = 0.1;
function dropCurtain() { if (curtain) { curtain.remove(); curtain = null; } }
if (curtain && (calm.matches || root.classList.contains("seen") || !hasG)) dropCurtain();
else if (curtain) {
  try { sessionStorage.setItem("sd-seen", "1"); } catch (e) {}
  G.timeline({ onComplete: dropCurtain })
    .from(curtain.querySelector("img"), { opacity: 0, y: 10, scale: .96, duration: .35, ease: "power2.out" })
    .to(curtain, { clipPath: "inset(0 0 100% 0)", duration: .55, ease: "power3.inOut" }, .45);
  intro = .7;
}

/* ---- 3. вход hero одной timeline (≈3 с) и «тихая жизнь» ---- */
function lines(svg) { return svg ? svg.querySelectorAll(".body .ln, [data-z] .ln:not(.cut):not(.pipe):not(.dash)") : []; }
function heroIn() {
  var h1 = d.querySelector(".hero h1"), svg = d.querySelector("#hero-house svg");
  var split = SplitText.create(h1, { type: "lines", mask: "lines" });
  var tl = G.timeline({ delay: intro, defaults: { ease: "power3.out" }, onComplete: function () { ready = true; } });
  tl.from(".kick", { y: 14, opacity: 0, duration: .6 }, .05)
    .from(split.lines, { yPercent: 110, duration: 1.05, stagger: .12, ease: "power4.out" }, .15)
    .from(".hero .lead", { y: 20, opacity: 0, duration: .8 }, .6)
    .from(".finder-l, .finder-box", { y: 18, opacity: 0, duration: .7, stagger: .08, clearProps: "transform,opacity" }, .8)
    .from(".chips button", { y: 10, opacity: 0, duration: .5, stagger: .05, clearProps: "transform,opacity" }, 1.05);
  if (svg) {
    tl.fromTo(svg.querySelectorAll('[data-z="yard"] > *'), { opacity: 0 }, { opacity: 1, duration: .6, stagger: .02 }, .4)
      .from(lines(svg), { drawSVG: "0%", duration: 1.4, ease: "power2.inOut", stagger: { amount: .5 } }, .6)
      .fromTo(svg.querySelectorAll(".body polygon:not(.ln), [data-z=entr] polygon:not(.ln), [data-z=roof] polygon:not(.ln)"), { opacity: 0 }, { opacity: 1, duration: .8, stagger: { amount: .6 } }, 1.1);
  }
  tl.from(".card", { y: 26, opacity: 0, duration: .8, clearProps: "transform,opacity" }, 1.6)
    .from(".hero-strip li", { y: 14, opacity: 0, duration: .6, stagger: .1, clearProps: "transform,opacity" }, 1.9);
}
if (hasG && !calm.matches) (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(heroIn); else ready = true;

/* перерисовка схемы при выборе дома */
d.addEventListener("sd:drawn", function (e) {
  var svg = e.detail; if (!ready || !hasG || calm.matches || !svg) return;
  G.from(lines(svg), { drawSVG: "0%", duration: 1, ease: "power2.inOut", stagger: { amount: .35 } });
  G.fromTo(svg.querySelectorAll(".body polygon:not(.ln)"), { opacity: 0 }, { opacity: 1, duration: .6, stagger: { amount: .4 } });
});

/* тихая жизнь: в окнах загорается и гаснет свет (раз в секунду, только пока hero виден) */
(function () {
  var fig = d.querySelector("#hero-house"); if (!fig || !w.KIT) return;
  KIT.raf(fig, function (t) {
    if (!t) return; var ws = fig.querySelectorAll(".win"); if (!ws.length) return;
    ws[(Math.random() * ws.length) | 0].classList.toggle("lit");
  }, 1.4);
})();

/* ---- 4. прогресс чтения, параллакс при прокрутке, бегущая строка ---- */
if (hasG && !calm.matches) {
  G.to(".progress i", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });
  [[".quote", 30], [".lic", 26], [".tko", 22], [".figs", 18]].forEach(function (a) {
    $$(a[0]).forEach(function (el) { G.fromTo(el, { y: a[1] }, { y: -a[1], ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }); });
  });
  var tr = d.querySelector(".band .track");
  if (tr) G.fromTo(tr, { xPercent: 0 }, { xPercent: -45, ease: "none", scrollTrigger: { trigger: ".band", start: "top bottom", end: "bottom top", scrub: .4 } });
}

/* ---- 5. сигнатурная сцена: закреплена, прокрутка ведёт ключ-маркер по маршруту кровля → подъезд → подвал → двор ---- */
(function () {
  if (!Z || !hasG) return;
  var ORDER = ["roof", "entr", "base", "yard"], NS = "http://www.w3.org/2000/svg";
  var pinned = false, tl = null, st = null;
  function route(svg, P) {
    var pts = ORDER.map(function (k) { return P[k]; }), dd = "M" + pts[0].x + " " + pts[0].y, segs = [];
    for (var i = 1; i < 4; i++) {
      var a = pts[i - 1], b = pts[i], c = { x: (a.x + b.x) / 2 + (i % 2 ? 70 : -70), y: (a.y + b.y) / 2 };
      var s = " Q" + c.x.toFixed(1) + " " + c.y.toFixed(1) + " " + b.x + " " + b.y; dd += s;
      var tmp = d.createElementNS(NS, "path"); tmp.setAttribute("d", "M" + a.x + " " + a.y + s); svg.appendChild(tmp); segs.push(tmp.getTotalLength()); tmp.remove();
    }
    var p = d.createElementNS(NS, "path"); p.setAttribute("d", dd); p.setAttribute("class", "route");
    p.style.cssText = "fill:none;stroke:#2E5B43;stroke-width:2;stroke-dasharray:2 6;stroke-linecap:round;opacity:.7;vector-effect:non-scaling-stroke";
    svg.insertBefore(p, svg.querySelector(".pin"));
    var tot = segs[0] + segs[1] + segs[2], f = [0, segs[0] / tot, (segs[0] + segs[1]) / tot, 1];
    return { el: p, f: f };
  }
  /* таймлайн 4 единицы: зона i — плато [i, i+1]; переезд маркера — около границы */
  function make() {
    if (tl) tl.kill(); tl = null;
    var svg = Z.svg, P = Z.pins, mk = svg && svg.querySelector(".mk"); if (!svg) return;
    if (!pinned) { G.set(mk, { x: P[Z.cur || "roof"].x, y: P[Z.cur || "roof"].y }); return; }
    var r = route(svg, P);
    G.set(mk, { x: P.roof.x, y: P.roof.y });
    tl = G.timeline({ paused: true, defaults: { ease: "power1.inOut" } });
    tl.set({}, {}, 4);
    for (var k = 0; k < 3; k++) {
      tl.fromTo(r.el, { drawSVG: "0% " + r.f[k] * 100 + "%" }, { drawSVG: "0% " + r.f[k + 1] * 100 + "%", duration: .5 }, k + .75)
        .to(mk, { motionPath: { path: r.el, align: r.el, alignOrigin: [.5, .5], start: r.f[k], end: r.f[k + 1] }, duration: .5 }, k + .75);
    }
    G.set(r.el, { drawSVG: "0% 0%" });
    if (st) tl.progress(st.progress);
  }
  function stopAt(z) { var i = ORDER.indexOf(z); if (!st || i < 0) return false; var y = st.start + (st.end - st.start) * (i + .5) / 4; if (KIT.lenis) KIT.lenis.scrollTo(y, { duration: 1.1 }); else scrollTo({ top: y, behavior: calm.matches ? "auto" : "smooth" }); return true; }
  d.addEventListener("sd:scene", make);
  d.addEventListener("sd:zone", function (e) {
    if (pinned) return; var P = Z.pins, mk = Z.svg && Z.svg.querySelector(".mk"); if (!mk) return;
    G.to(mk, { x: P[e.detail].x, y: P[e.detail].y, duration: calm.matches ? 0 : .7, ease: "power3.inOut" });
  });
  var mm = G.matchMedia();
  mm.add("(min-width:1101px) and (prefers-reduced-motion:no-preference)", function () {
    pinned = true;
    st = ScrollTrigger.create({
      trigger: "#zones", start: "top top", end: "+=320%", pin: true, anticipatePin: 1,
      onUpdate: function (s) {
        if (tl) G.to(tl, { progress: s.progress, duration: .6, ease: "power2.out", overwrite: true });
        Z.set(ORDER[Math.min(3, Math.floor(s.progress * 4))]);
      }
    });
    Z.scrollTo = stopAt; make();
    return function () { pinned = false; Z.scrollTo = null; st = null; make(); };
  });
  /* вход сцены: контуры дома прорисовываются один раз */
  ScrollTrigger.create({ trigger: "#zones", start: "top 75%", once: true, onEnter: function () {
    if (calm.matches || !Z.svg) return;
    G.from(lines(Z.svg), { drawSVG: "0%", duration: 1.5, ease: "power2.inOut", stagger: { amount: .6 } });
    G.from(Z.svg.querySelectorAll(".pin"), { scale: 0, transformOrigin: "50% 50%", duration: .6, stagger: .12, delay: .9, ease: "back.out(2)" });
  } });
  make();
})();

/* ---- 7. атмосфера: редкий снег в hero (≤ 40 снежинок; спит вне экрана и на скрытой вкладке) ---- */
(function () {
  var c = d.querySelector(".snow"), hero = d.querySelector(".hero"); if (!c || !w.KIT) return;
  var x = c.getContext("2d"), fl = [], W = 0, H = 0, n = 0, dpr = Math.min(2, w.devicePixelRatio || 1);
  function size() {
    W = hero.clientWidth; H = hero.clientHeight; if (!W || !H) return;
    c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); n = W < 600 ? 18 : 40;
    while (fl.length < n) fl.push({ x: Math.random() * W, y: Math.random() * H, r: .8 + Math.random() * 1.8, v: 10 + Math.random() * 18, ph: Math.random() * 6.3, a: .25 + Math.random() * .35 });
    fl.length = n;
  }
  size(); addEventListener("resize", size);
  KIT.raf(c, function (t, dt) {
    if (!W) return; x.clearRect(0, 0, W, H); var s = dt / 1000; x.fillStyle = "#8FA79A";
    for (var i = 0; i < n; i++) {
      var f = fl[i]; f.y += f.v * s; f.x += Math.sin(t / 1600 + f.ph) * .25 + 4 * s;
      if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; } if (f.x > W + 4) f.x = -4;
      x.globalAlpha = f.a; x.beginPath(); x.arc(f.x, f.y, f.r, 0, 6.283); x.fill();
    }
    x.globalAlpha = 1;
  }, 30);
})();

/* ---- 2. кнопки: перекат текста, стрелка, заливка от точки входа мыши ---- */
$$(".btn").forEach(function (b) {
  var t = b.textContent.trim();
  b.innerHTML = '<span class="roll"><span>' + t + '</span><span aria-hidden="true">' + t + "</span></span>";
  if (b.hasAttribute("data-arrow")) { var a = d.createElement("i"); a.className = "arr"; a.setAttribute("aria-hidden", "true"); a.textContent = "→"; b.appendChild(a); }
  function pt(e) { var r = b.getBoundingClientRect(); b.style.setProperty("--x", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%"); b.style.setProperty("--y", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%"); }
  b.addEventListener("pointerenter", pt); b.addEventListener("pointerleave", pt);
});

/* ---- 6. подсветка карточек за курсором и лёгкий наклон, меню-бегунок, подсветка раздела ---- */
if (fine.matches && !calm.matches) $$(".act, .docs a, .figs > div, .form, .stands, .card").forEach(function (el) {
  el.classList.add("sp"); var tilt = el.matches(".act, .docs a");
  el.addEventListener("pointermove", function (e) {
    var r = el.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    el.style.setProperty("--x", px + "px"); el.style.setProperty("--y", py + "px");
    if (tilt) el.style.transform = "perspective(900px) rotateX(" + ((py / r.height - .5) * -3).toFixed(2) + "deg) rotateY(" + ((px / r.width - .5) * 3).toFixed(2) + "deg)";
  });
  if (tilt) el.addEventListener("pointerleave", function () { el.style.transform = ""; });
});
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
  var b = f.querySelector(".btn"), ok = false;
  f.addEventListener("submit", function (e) {
    if (ok) { ok = false; return; }
    e.preventDefault(); e.stopImmediatePropagation(); if (b.classList.contains("sending")) return;
    b.classList.add("sending"); b.setAttribute("aria-busy", "true");
    var r = b.querySelectorAll(".roll span"); r.forEach(function (s) { s.textContent = "Отправляем…"; });
    setTimeout(function () { b.classList.remove("sending"); b.removeAttribute("aria-busy"); r.forEach(function (s) { s.textContent = "Отправить заявку"; }); ok = true; f.requestSubmit(); }, 1000);
  }, true);
});

/* ---- 1. курсор «ключ от квартиры»: точка + ключ с инерцией; над действием ключ поворачивается, как в замке ---- */
(function () {
  if (calm.matches || !fine.matches) return;
  var cur = d.createElement("div"); cur.className = "cur"; cur.setAttribute("aria-hidden", "true");
  cur.innerHTML = '<i class="cur-dot"></i><span class="cur-key"><svg viewBox="0 0 44 44"><circle class="bow" cx="12" cy="22" r="8"/><circle class="bit" cx="12" cy="22" r="2.6"/><path class="bit" d="M20 22h20M34 22v5M38 22v4M30 22v3"/></svg></span><span class="cur-lab"></span>';
  d.body.appendChild(cur); root.classList.add("has-cur");
  var dot = cur.firstChild, key = dot.nextSibling, lab = key.nextSibling;
  var tx = -99, ty = -99, rx = -99, ry = -99, id = 0, shown = false, mode = "", txt = "";
  function label(el) {
    if (el.closest("input,textarea,select")) return ["off", ""];
    if (el.closest(".pin")) return ["btn", "Открыть зону"];
    if (el.closest("#q-list [data-i]")) return ["btn", "Это мой дом"];
    if (el.closest(".zstage")) return ["scene", "Нажмите на точку"];
    var a = el.closest("a,button,[role=tab]"); if (!a) return ["", ""];
    var h = a.getAttribute("href") || "";
    if (h.indexOf("tel:") === 0) return ["tel", "Позвонить"];
    if (h.indexOf("mailto:") === 0) return ["link", "Написать"];
    if (a.matches("[data-i]")) return ["btn", "Мой дом"];
    if (a.matches("[role=tab]")) return ["btn", "Показать"];
    if (a.matches("#vi")) return ["btn", "Крупнее"];
    if (a.type === "submit" || a.matches("form .btn")) return ["btn", "Отправить"];
    if (a.target === "_blank") return ["link", "Открыть ↗"];
    return [a.classList.contains("btn") ? "btn" : "link", h.charAt(0) === "#" ? "Перейти" : "Открыть"];
  }
  function loop() {
    rx += (tx - rx) * .2; ry += (ty - ry) * .2;
    dot.style.transform = "translate(" + tx + "px," + ty + "px)";
    key.style.transform = "translate(" + (rx + 16).toFixed(1) + "px," + (ry + 16).toFixed(1) + "px)";
    lab.style.transform = "translate(" + (rx + 40).toFixed(1) + "px," + (ry + 30).toFixed(1) + "px)";
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

/* ---- 3. параллакс hero за мышью: схема дома и заголовок (6–12 px) ---- */
if (hasG && fine.matches && !calm.matches) {
  var hero = d.querySelector(".hero"), fig = d.querySelector("#hero-house"), h1 = d.querySelector(".hero h1");
  if (hero && fig) {
    var qs = [G.quickTo(fig, "x", { duration: 1.2, ease: "power3" }), G.quickTo(fig, "y", { duration: 1.2, ease: "power3" })],
        qh = [G.quickTo(h1, "x", { duration: 1.6, ease: "power3" }), G.quickTo(h1, "y", { duration: 1.6, ease: "power3" })];
    hero.addEventListener("pointermove", function (e) { var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5; qs[0](nx * 20); qs[1](ny * 14); qh[0](nx * -10); qh[1](ny * -8); });
  }
}
})();
