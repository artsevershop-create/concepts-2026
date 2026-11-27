/* «Дружба Н»: шторка, вход hero, курсор-отвес, кнопки, прогресс, меню-бегунок, пылинки в луче,
   сцена «Дом по этапам» (pin + scrub, DrawSVG, MotionPath, ручное управление), слова «загораются», улицы бегут. */
(function () {
"use strict";
var d = document, root = d.documentElement, w = window;
var calm = matchMedia("(prefers-reduced-motion:reduce)"), fine = matchMedia("(hover:hover) and (pointer:fine)");
var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
var G = w.gsap, hasG = !!(G && w.ScrollTrigger);
if (hasG) G.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);
var NS = "http://www.w3.org/2000/svg";
function el(tag, attrs, parent) { var e = d.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

/* ---- 8. шторка: раз за сеанс, < 1 с ---- */
var curtain = d.querySelector(".curtain"), intro = 0.1;
function dropCurtain() { if (curtain) { curtain.remove(); curtain = null; } }
if (curtain && (calm.matches || root.classList.contains("seen") || !hasG)) dropCurtain();
else if (curtain) {
  try { sessionStorage.setItem("dn-seen", "1"); } catch (e) {}
  G.timeline({ onComplete: dropCurtain })
    .from(curtain.querySelector("img"), { opacity: 0, y: 10, duration: .35, ease: "power2.out" })
    .to(curtain, { clipPath: "inset(0 0 100% 0)", duration: .5, ease: "power3.inOut" }, .5);
  intro = .7;
}

/* ---- 3. вход hero одной timeline (≈3 с), потом тихая жизнь ---- */
function heroIn() {
  var h1 = d.querySelector(".hero h1"), split = SplitText.create(h1, { type: "lines", mask: "lines" });
  G.timeline({ delay: intro, defaults: { ease: "power3.out" } })
    .fromTo(".hero-photo", { clipPath: "inset(100% 0 0 0 round 240px 240px 4px 4px)" }, { clipPath: "inset(0% 0 0 0 round 240px 240px 4px 4px)", duration: 1.4, ease: "power4.inOut", clearProps: "clipPath" }, 0)
    .from(".hero-photo img", { scale: 1.2, duration: 2, ease: "power3.out" }, 0)
    .from(".kick", { y: 14, opacity: 0, duration: .6 }, .25)
    .from(split.lines, { yPercent: 110, duration: 1, stagger: .1, ease: "power4.out" }, .35)
    .from(".hero .lead", { y: 18, opacity: 0, duration: .8 }, .9)
    .from(".hero-cta .btn", { y: 16, opacity: 0, duration: .6, stagger: .08, clearProps: "transform,opacity" }, 1.1)
    .from(".trust li", { y: 18, opacity: 0, duration: .6, stagger: .08, clearProps: "transform,opacity" }, 1.35)
    .from(".hero-fig figcaption", { opacity: 0, duration: .6 }, 1.8);
  G.to(".hero-photo img", { scale: 1.05, duration: 60, ease: "sine.inOut", yoyo: true, repeat: -1, delay: intro + 3 });
}
if (hasG && !calm.matches) (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(heroIn);

/* ---- 4. прогресс, параллакс, наезд листов, бегущие улицы, слова загораются ---- */
if (hasG) {
  var mm4 = G.matchMedia();
  mm4.add("(prefers-reduced-motion:no-preference)", function () {
    G.to(".progress i", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });
    G.to(".hero-fig", { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    [".services", ".contacts"].forEach(function (s) {
      G.fromTo(s, { y: 90 }, { y: 0, ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "top 55%", scrub: true } });
    });
    G.fromTo(".streets-track", { xPercent: 0 }, { xPercent: -42, ease: "none", scrollTrigger: { trigger: ".streets", start: "top bottom", end: "bottom top", scrub: .4 } });
    G.from(".ftr-word", { yPercent: 60, opacity: 0, ease: "none", scrollTrigger: { trigger: ".ftr", start: "top bottom", end: "top 50%", scrub: true } });
    var big = d.querySelector("[data-words]"), wds = [];
    if (big) {
      if (!big.dataset.done) {
        big.dataset.done = 1; big.setAttribute("aria-label", big.textContent.replace(/\s+/g, " ").trim());
        big.innerHTML = big.textContent.split(/(\s+)/).map(function (t) { return /^\s+$/.test(t) ? " " : '<span class="wd" aria-hidden="true">' + t + "</span>"; }).join("");
      }
      wds = $$(".wd", big); var lit = -1;
      ScrollTrigger.create({ trigger: big, start: "top 80%", end: "bottom 45%", onUpdate: function (s) {
        var n = Math.round(s.progress * wds.length); if (n === lit) return; lit = n;
        wds.forEach(function (x, i) { x.classList.toggle("on", i < n); });
      } });
    }
    return function () { wds.forEach(function (x) { x.classList.add("on"); }); };
  });
}

/* ---- 5. сигнатурная сцена «Дом по этапам» ---- */
var OBJ = [
  { city: "г. Югорск", addr: "ул. Магистральная, 21", type: "Многоквартирный жилой дом", url: "https://drugba-n.tilda.ws/page83013116.html",
    facts: ["На странице объекта — квартиры в 3‑м и 5‑м подъездах", "Двухкомнатные квартиры: от 60,4 и от 60,7 м²"] },
  { city: "г. Югорск", addr: "ул. Мира", type: "Многоквартирный жилой дом", url: "https://drugba-n.tilda.ws/page83013206.html",
    facts: ["В перечне квартир — три подъезда, с 1‑го по 8‑й этаж", "Одно-, двух- и трёхкомнатные квартиры, от 35 м²"] },
  { city: "г. Югорск", addr: "ул. Садовая, 62", type: "Многоквартирный жилой дом", url: "https://drugba-n.tilda.ws/page83013096.html",
    facts: ["На странице объекта — квартира во 2‑м подъезде", "Однокомнатная, от 61,5 м²"] },
  { city: "г. Советский", addr: "ул. Ленина — Гагарина — Юбилейная — Железнодорожная", type: "Многоквартирный жилой дом", url: "https://drugba-n.tilda.ws/gagarina",
    facts: ["Корпус 1 — так объект назван на сайте компании"] }
];

var sec = d.querySelector("#objects"), svg = sec && sec.querySelector(".house");
var tabs = $$(".obj-tabs [role=tab]"), card = d.querySelector(".obj-card"), stBtns = $$(".stages button");
var X0 = 180, X1 = 560, F = 8, FH = 34, BASE = 470, T = 2; // T — «длина» этапа в таймлайне: 1,2 стройка + 0,8 плато
var floors = [];

function buildHouse() {
  var frame = svg.querySelector(".frame"), bricks = svg.querySelector(".bricks"), wins = svg.querySelector(".wins");
  var cols = [180, 243, 307, 370, 433, 497, 560];
  for (var k = 1; k <= F; k++) {
    var y = BASE - k * FH, y0 = y + FH, f = { lines: [], brick: el("g", {}, bricks), wins: [], lit: [] };
    cols.forEach(function (x) { f.lines.push(el("line", { x1: x, y1: y0, x2: x, y2: y }, frame)); });
    f.lines.push(el("line", { x1: X0 - 4, y1: y, x2: X1 + 4, y2: y }, frame));
    el("rect", { x: X0, y: y, width: X1 - X0, height: FH }, f.brick);
    [298, 424].forEach(function (x) { el("rect", { class: "band", x: x, y: y, width: 18, height: FH }, f.brick); });
    for (var s = 0; s < 3; s++) for (var j = 0; j < 3; j++) {
      var wx = X0 + s * 126.7 + 16 + j * 34, r = el("rect", { x: wx, y: y + 9, width: 20, height: 17 }, wins);
      f.wins.push(r);
      if ((k * 7 + s * 5 + j * 3) % 4 === 1) f.lit.push(r);
    }
    floors.push(f);
  }
  el("rect", { x: X0 - 6, y: BASE - F * FH - 8, width: X1 - X0 + 12, height: 8, class: "parapet", fill: "#7E3420" }, bricks);
  var trees = svg.querySelector(".trees"), lamps = svg.querySelector(".lamps");
  [90, 130, 610, 700, 740].forEach(function (x, i) {
    var g = el("g", { class: "tree" }, trees), h = 26 + (i % 2) * 10;
    el("path", { d: "M" + x + " 480 V" + (480 - h) }, g); el("circle", { cx: x, cy: 480 - h - 10, r: 13 + (i % 2) * 4 }, g);
  });
  [110, 620].forEach(function (x) {
    var g = el("g", { class: "lamp" }, lamps);
    el("path", { d: "M" + x + " 480 V446 H" + (x + 8) }, g); el("circle", { cx: x + 8, cy: 448, r: 3.5 }, g);
  });
}

var tl = null, st = null, curObj = 0, curSt = 3;
function setStageUI(i, p) {
  if (i !== curSt) { curSt = i; stBtns.forEach(function (b, k) { b.setAttribute("aria-pressed", k === i ? "true" : "false"); }); }
  if (p != null) stBtns.forEach(function (b, k) { b.style.setProperty("--p", Math.max(0, Math.min(1, (p * 4 - k)))); });
}
function buildTL() {
  var load = svg.querySelector(".load"), cable = svg.querySelector(".cable");
  function cab() { var x = G.getProperty(load, "x"), y = G.getProperty(load, "y"); cable.setAttribute("d", "M" + x + " 80 V" + (y - 5)); }
  G.set(load, { x: 700, y: 470 }); cab();
  var t = G.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
  /* 1. котлован */
  t.from(".house .ground", { drawSVG: "50% 50%", duration: .5 }, 0)
   .from(".house .pit", { drawSVG: "0%", duration: .9 }, .2)
   .from(".house .pit-fill", { opacity: 0, duration: .6 }, .6)
   .from(".house .stakes", { drawSVG: "0%", duration: .4 }, .8);
  /* 2. каркас: кран рисуется, груз едет по пути к каждому этажу, этаж прорисовывается */
  var s2 = T;
  t.from(".house .crane .draw", { drawSVG: "0%", duration: .5, stagger: .1 }, s2)
   .to(".house .pit-fill, .house .pit, .house .stakes", { opacity: 0, duration: .4 }, s2)
   .from(".house .slab0", { scaleX: 0, transformOrigin: "50% 50%", duration: .3 }, s2 + .1);
  var per = .9 / F;
  floors.forEach(function (f, i) {
    var y = BASE - (i + 1) * FH, at = s2 + .3 + i * per;
    t.to(load, { motionPath: { path: "M700 470 L700 120 L370 120 L370 " + (y - 6) }, duration: per, ease: "none", onUpdate: cab }, at)
     .from(f.lines, { drawSVG: "0%", duration: per * 1.2, stagger: per * .08, ease: "power1.out" }, at + per * .55);
  });
  t.set(load, { opacity: 0 }, s2 + 1.25);
  /* 3. фасад: кирпич снизу вверх, окна */
  var s3 = 2 * T;
  floors.forEach(function (f, i) {
    t.from(f.brick, { scaleY: 0, transformOrigin: "50% 100%", duration: .3, ease: "power2.out" }, s3 + i * .1)
     .from(f.wins, { opacity: 0, duration: .2, stagger: .015 }, s3 + .15 + i * .1);
  });
  t.from(".house .parapet", { opacity: 0, duration: .2 }, s3 + .95);
  /* 4. благоустройство: кран уходит, двор, деревья, фонари, свет в окнах, тёплое небо */
  var s4 = 3 * T, lit = [];
  floors.forEach(function (f) { lit = lit.concat(f.lit); });
  t.to(".house .crane", { opacity: 0, y: -30, duration: .5 }, s4)
   .from(".house .walk", { opacity: 0, duration: .6 }, s4 + .1)
   .from(".house .tree", { scale: 0, transformOrigin: "50% 100%", duration: .5, stagger: .07, ease: "back.out(1.6)" }, s4 + .3)
   .from(".house .lamp", { opacity: 0, duration: .4, stagger: .1 }, s4 + .5)
   .to(lit, { fill: "#FFC77D", duration: .3, stagger: { each: .02, from: "random" } }, s4 + .6)
   .from(".house .dusk", { opacity: 0, duration: .8 }, s4 + .4);
  t.set({}, {}, 4 * T);
  return t;
}
function stageAt(time) { return Math.max(0, Math.min(3, Math.floor(time / T))); }

if (sec && svg) {
  buildHouse();
  var still = !hasG;
  function fill(i) {
    var o = OBJ[i]; curObj = i;
    tabs.forEach(function (t, k) { t.setAttribute("aria-selected", k === i ? "true" : "false"); t.tabIndex = k === i ? 0 : -1; });
    card.querySelector("[data-f=city]").textContent = o.city;
    card.querySelector("[data-f=addr]").textContent = o.addr;
    card.querySelector("[data-f=type]").textContent = o.type;
    card.querySelector("[data-f=facts]").innerHTML = o.facts.map(function (f) { return "<li>" + f + "</li>"; }).join("");
    card.querySelector("[data-f=url]").href = o.url;
  }
  fill(0);
  function pick(i, focus) {
    if (i === curObj) return; fill(i); if (focus) tabs[i].focus();
    if (!tl || calm.matches) return;
    G.fromTo(card, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .5, ease: "power3.out", clearProps: "transform,opacity" });
    /* дом этого адреса собирается заново до текущего этапа */
    var to = st ? tl.time() : 4 * T; G.killTweensOf(tl);
    G.fromTo(tl, { time: 0 }, { time: to, duration: st ? 1.4 : 2.6, ease: "power2.inOut" });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { pick(i); });
    t.addEventListener("keydown", function (e) {
      var k = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
      if (e.key === "Home") { e.preventDefault(); pick(0, true); } else if (e.key === "End") { e.preventDefault(); pick(tabs.length - 1, true); }
      else if (k) { e.preventDefault(); pick((curObj + k + tabs.length) % tabs.length, true); }
    });
  });
  stBtns.forEach(function (b, i) {
    b.addEventListener("click", function () {
      var target = i * T + 1.6;
      if (st) {
        var y = st.start + (st.end - st.start) * target / (4 * T);
        if (w.KIT && KIT.lenis) KIT.lenis.scrollTo(y, { duration: 1.2 }); else w.scrollTo({ top: y, behavior: "smooth" });
        return;
      }
      setStageUI(i, (i + 1) / 4);
      if (!tl) return;
      G.killTweensOf(tl);
      if (calm.matches) tl.time(i * T + 1.3); else G.to(tl, { time: i * T + 1.3, duration: 1.4, ease: "power2.inOut" });
    });
  });
  if (!still) {
    tl = buildTL(); tl.time(4 * T); setStageUI(3, 1);
    var mm = G.matchMedia();
    mm.add("(min-width:1101px) and (prefers-reduced-motion:no-preference)", function () {
      sec.classList.add("pinned"); tl.time(0); setStageUI(0, 0);
      st = ScrollTrigger.create({
        trigger: sec, start: "top top", end: "+=360%", pin: true, anticipatePin: 1,
        onUpdate: function (s) {
          G.to(tl, { time: s.progress * 4 * T, duration: .6, ease: "power2.out", overwrite: true });
          setStageUI(stageAt(s.progress * 4 * T), s.progress);
        }
      });
      return function () { sec.classList.remove("pinned"); st = null; G.killTweensOf(tl); tl.time(4 * T); setStageUI(3, 1); };
    });
    /* телефон, планшет и reduced: собранный дом; при входе в экран (без reduced) — один раз собирается */
    mm.add("(max-width:1100px) and (prefers-reduced-motion:no-preference)", function () {
      var once = ScrollTrigger.create({ trigger: svg, start: "top 75%", once: true, onEnter: function () {
        G.fromTo(tl, { time: 0 }, { time: 4 * T, duration: 3.2, ease: "power1.inOut" }); } });
      return function () { once.kill(); };
    });
  }
}

/* ---- 7. атмосфера: тёплые пылинки в луче hero (≤ 40, спят вне экрана) ---- */
(function () {
  var c = d.querySelector(".motes"), hero = d.querySelector(".hero"); if (!c || !w.KIT) return;
  var x = c.getContext("2d"), P = [], W = 0, H = 0, n = 0, dpr = Math.min(2, w.devicePixelRatio || 1);
  function size() {
    W = hero.clientWidth; H = hero.clientHeight; if (W < 20 || H < 20) return;
    c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); n = W < 600 ? 16 : 40;
    while (P.length < n) P.push({ x: Math.random() * W, y: Math.random() * H, r: .6 + Math.random() * 1.8, v: 4 + Math.random() * 10, ph: Math.random() * 6.28, a: .15 + Math.random() * .4 });
    P.length = n;
  }
  size(); addEventListener("resize", size);
  KIT.raf(c, function (t, dt) {
    if (!W) return; x.clearRect(0, 0, W, H); var s = dt / 1000;
    for (var i = 0; i < n; i++) {
      var p = P[i]; p.y -= p.v * s; p.x += Math.sin(t / 2400 + p.ph) * 6 * s; if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
      var beam = Math.max(0, 1 - Math.abs(p.x / W - .74) * 2.2); // ярче в луче у фото
      x.fillStyle = "rgba(255,206,150," + (p.a * (.35 + beam)).toFixed(3) + ")";
      x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283); x.fill();
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

/* ---- 6. подсветка за курсором, меню-бегунок ---- */
if (fine.matches) {
  d.addEventListener("pointermove", function (e) {
    var t = e.target.closest && e.target.closest(".sp"); if (!t) return;
    var r = t.getBoundingClientRect(); t.style.setProperty("--x", (e.clientX - r.left) + "px"); t.style.setProperty("--y", (e.clientY - r.top) + "px");
  }, { passive: true });
}
var nav = d.querySelector(".hdr nav"), runner = nav && nav.querySelector(".runner"), links = nav ? $$("a", nav) : [];
function runTo() {
  var a = links.filter(function (l) { return l.hasAttribute("aria-current"); })[0]; if (!runner) return;
  if (!a) { runner.style.opacity = 0; return; }
  runner.style.opacity = 1; runner.style.width = (a.offsetWidth - 28) + "px"; runner.style.transform = "translateX(" + (a.offsetLeft + 14) + "px)";
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
    if (!f.checkValidity()) { f.reportValidity(); if (hasG && !calm.matches) G.fromTo(b, { x: -6 }, { x: 0, duration: .4, ease: "elastic.out(1,.3)" }); return; }
    b.classList.add("sending"); b.setAttribute("aria-busy", "true");
    var r = b.querySelectorAll(".roll span"); r.forEach(function (s) { s.textContent = "Отправляем…"; });
    setTimeout(function () { b.classList.remove("sending"); b.removeAttribute("aria-busy"); r.forEach(function (s) { s.textContent = "Отправить заявку"; }); ok = true; f.requestSubmit(); }, 900);
  }, true);
});

/* ---- 1. курсор-отвес: точка, на нити качается отвес; над действием — кольцо с подписью ---- */
(function () {
  if (!fine.matches) return;
  var cur = d.createElement("div"); cur.className = "cur"; cur.setAttribute("aria-hidden", "true");
  cur.innerHTML = '<span class="cur-bob"><svg viewBox="0 0 18 40"><line x1="9" y1="0" x2="9" y2="22"/><path d="M9 21 L14.5 29 L9 39 L3.5 29 Z"/></svg></span><span class="cur-ring"></span><i class="cur-dot"></i><span class="cur-lab"></span>';
  d.body.appendChild(cur); root.classList.add("has-cur");
  var bob = cur.firstChild, bsv = bob.firstChild, ring = bob.nextSibling, dot = ring.nextSibling, lab = dot.nextSibling;
  var tx = -99, ty = -99, rx = -99, ry = -99, px = -99, a = 0, va = 0, id = 0, shown = false, mode = "", txt = "";
  function label(e) {
    if (!e.closest) return ["", ""];
    if (e.closest("input,textarea,select")) return ["off", ""];
    if (e.closest(".obj-tabs button")) return ["btn", "Этот дом"];
    if (e.closest(".stages button")) return ["btn", "Этап →"];
    if (e.closest(".hero-photo, .srv-photo")) return ["photo", ""];
    var l = e.closest("a,button"); if (!l) return e.closest(".house") ? ["scene", st ? "Листайте — дом растёт" : "Выберите этап"] : ["", ""];
    var h = l.getAttribute("href") || "";
    if (h.indexOf("tel:") === 0) return ["tel", "Позвонить"];
    if (h.indexOf("mailto:") === 0) return ["link", "Написать"];
    if (l.type === "submit") return ["btn", "Отправить"];
    if (l.target === "_blank") return ["link", "Открыть ↗"];
    return [l.classList.contains("btn") ? "btn" : "link", h.charAt(0) === "#" ? "Перейти" : "Открыть"];
  }
  function loop() {
    var vx = tx - px; px = tx;
    rx += (tx - rx) * .2; ry += (ty - ry) * .2;
    va += (-a * .06) - vx * .35; va *= .88; a += va; a = Math.max(-60, Math.min(60, a)); // маятник: толчок от скорости мыши
    dot.style.transform = "translate(" + tx + "px," + ty + "px)";
    bob.style.transform = "translate(" + tx + "px," + (ty + 4) + "px)"; bsv.style.transform = "rotate(" + a.toFixed(2) + "deg)";
    ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
    lab.style.transform = "translate(" + (rx + 28).toFixed(1) + "px," + (ry + 18).toFixed(1) + "px)";
    var busy = Math.abs(tx - rx) + Math.abs(ty - ry) > .15 || Math.abs(a) > .05 || Math.abs(va) > .05;
    id = busy ? requestAnimationFrame(loop) : 0;
  }
  function set(m, t) { if (m !== mode) { mode = m; cur.className = "cur" + (shown ? " on" : "") + (m ? " is-" + m : ""); } if (t !== txt) { txt = t; lab.textContent = t; } }
  addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch" || calm.matches) return; tx = e.clientX; ty = e.clientY;
    if (!shown) { shown = true; rx = px = tx; ry = ty; cur.classList.add("on"); }
    if (!id) id = requestAnimationFrame(loop);
  }, { passive: true });
  d.addEventListener("pointerover", function (e) { var l = label(e.target); set(l[0], l[1]); });
  d.addEventListener("pointerdown", function () { cur.classList.add("is-down"); });
  d.addEventListener("pointerup", function () { cur.classList.remove("is-down"); });
  root.addEventListener("pointerleave", function () { shown = false; cur.classList.remove("on"); });
})();

/* ---- 3. параллакс hero за мышью (6–12 px) ---- */
if (hasG && fine.matches) {
  var hero = d.querySelector(".hero"), ph = d.querySelector(".hero-photo"), txt = d.querySelector(".hero-text");
  var qs = [G.quickTo(ph, "x", { duration: 1.2, ease: "power3" }), G.quickTo(ph, "y", { duration: 1.2, ease: "power3" })],
      qh = [G.quickTo(txt, "x", { duration: 1.6, ease: "power3" }), G.quickTo(txt, "y", { duration: 1.6, ease: "power3" })];
  hero.addEventListener("pointermove", function (e) { if (calm.matches) return; var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5; qs[0](nx * 22); qs[1](ny * 12); qh[0](nx * -10); qh[1](ny * -6); });
}
})();
