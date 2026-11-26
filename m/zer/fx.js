/* Живость страницы: вход hero, курсор чертёжника, кнопки, подсветка карточек, прогресс, позёмка, бегущая строка, меню-бегунок. */
(function () {
"use strict";
var d = document, root = d.documentElement, w = window;
var calm = matchMedia("(prefers-reduced-motion:reduce)"), fine = matchMedia("(hover:hover) and (pointer:fine)");
var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
var G = w.gsap, hasG = !!(G && w.ScrollTrigger);
if (hasG) G.registerPlugin(ScrollTrigger, SplitText);

/* ---- 8. шторка: один раз за сеанс, до 1 с ---- */
var curtain = d.querySelector(".curtain"), seen = root.classList.contains("seen"), intro = 0.1;
function dropCurtain() { if (curtain) { curtain.remove(); curtain = null; } }
if (curtain && (calm.matches || seen || !hasG)) dropCurtain();
else if (curtain) {
  try { sessionStorage.setItem("zer-seen", "1"); } catch (e) {}
  var img = curtain.querySelector("img");
  G.timeline({ onComplete: dropCurtain })
    .from(img, { opacity: 0, y: 10, duration: .3, ease: "power2.out" })
    .to(curtain, { yPercent: -100, duration: .55, ease: "power3.inOut" }, .42);
  intro = .62;
}

/* ---- 3. вход hero одной timeline (≈3 с) и «тихая жизнь» ---- */
function heroIn() {
  var h1 = d.querySelector(".hero h1"); if (!h1) return;
  var split = SplitText.create(h1, { type: "lines", mask: "lines", linesClass: "hl" });
  var tl = G.timeline({ delay: intro, defaults: { ease: "power3.out" } });
  tl.from(".sheet", { opacity: 0, duration: .5 }, 0)
    .from(".zones b", { opacity: 0, duration: .5, stagger: .04 }, .1)
    .from(split.lines, { yPercent: 115, duration: 1.05, stagger: .13, ease: "power4.out" }, .2)
    .from(h1.querySelector("em"), { color: "#5E7396", duration: 1.3, ease: "power1.inOut" }, .9)
    .from(".lead p", { y: 22, opacity: 0, duration: .8 }, .85)
    .from(".cta .btn", { y: 18, opacity: 0, duration: .7, stagger: .1, clearProps: "transform,opacity" }, 1.05)
    .from(".scheme .draw > *", { drawSVG: "0%", duration: 1.6, ease: "power2.inOut", stagger: .08 }, .6)
    .from(".scheme ol li, .scheme figcaption", { opacity: 0, y: 8, duration: .6, stagger: .1 }, 1.5)
    .from(".stamp > div", { opacity: 0, y: 14, duration: .7, stagger: .09 }, 1.7);
  if (!fine.matches) return;
  G.to(".scheme .draw", { y: -4, duration: 5, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 3 });
}
if (hasG && !calm.matches) (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(heroIn);

/* ---- 4. прогресс чтения, параллакс при прокрутке, бегущая строка ---- */
if (hasG && !calm.matches) {
  G.to(".progress i", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });
  [[".spec", 36], [".about-top > div", 24], [".sites-head p", 18], [".jobs-side", 22]].forEach(function (a) {
    $$(a[0]).forEach(function (el) { G.fromTo(el, { y: a[1] }, { y: -a[1], ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }); });
  });
  var tr = d.querySelector(".band .track");
  if (tr) G.fromTo(tr, { xPercent: 0 }, { xPercent: -30, ease: "none", scrollTrigger: { trigger: ".band", start: "top bottom", end: "bottom top", scrub: true } });
}

/* ---- 7. атмосфера: позёмка в hero (одна; ≤ 48 частиц; спит вне экрана и на скрытой вкладке) ---- */
(function () {
  var c = d.querySelector(".snow"), hero = d.querySelector(".hero"); if (!c || !w.KIT) return;
  var x = c.getContext("2d"), fl = [], W = 0, H = 0, n = 0;
  function size() {
    W = c.width = Math.round(hero.clientWidth * .6); H = c.height = Math.round(hero.clientHeight * .6); n = W < 300 ? 26 : 48;
    while (fl.length < n) fl.push({ x: Math.random() * W, y: Math.random() * H, r: .6 + Math.random() * 1.5, v: 8 + Math.random() * 16, ph: Math.random() * 6.3, a: .25 + Math.random() * .4 });
    fl.length = n;
  }
  size(); addEventListener("resize", size);
  KIT.raf(c, function (t, dt) {
    x.clearRect(0, 0, W, H); var s = dt / 1000, gust = 20 + 16 * Math.sin(t / 5200);
    x.fillStyle = "#CFE3FF";
    for (var i = 0; i < n; i++) {
      var f = fl[i]; f.x += (gust * (.5 + f.r / 2)) * s; f.y += f.v * s + Math.sin(t / 900 + f.ph) * .12;
      if (f.x > W + 4) f.x = -4; if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; }
      x.globalAlpha = f.a; x.beginPath(); x.arc(f.x, f.y, f.r, 0, 6.283); x.fill();
    }
    x.globalAlpha = 1;
  }, 30);
})();

/* ---- 2. кнопки: перекат текста, стрелка, заливка от точки входа мыши ---- */
$$(".btn").forEach(function (b) {
  if (b.id !== "fail") {
    var t = b.textContent.trim();
    b.innerHTML = '<span class="roll"><span>' + t + '</span><span aria-hidden="true">' + t + "</span></span>";
  }
  if (b.hasAttribute("data-arrow")) { var a = d.createElement("i"); a.className = "arr"; a.setAttribute("aria-hidden", "true"); a.textContent = "→"; b.appendChild(a); }
  function pt(e) { var r = b.getBoundingClientRect(); b.style.setProperty("--x", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%"); b.style.setProperty("--y", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%"); }
  b.addEventListener("pointerenter", pt); b.addEventListener("pointerleave", pt);
});

/* ---- 6. подсветка карточек за курсором, меню-бегунок, подсветка раздела ---- */
if (fine.matches) $$(".ledger li, .figs > div, .stamp > div, .form, .spec li").forEach(function (el) {
  el.classList.add("sp");
  el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); el.style.setProperty("--x", (e.clientX - r.left) + "px"); el.style.setProperty("--y", (e.clientY - r.top) + "px"); });
});
var nav = d.querySelector(".hdr nav"), runner = nav && nav.querySelector(".runner"), links = $$("a", nav);
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

/* ---- анимированная отправка демо-формы ---- */
$$("form[data-demo-form]").forEach(function (f) {
  var b = f.querySelector(".btn:not(#fail)"), ok = false;
  f.addEventListener("submit", function (e) {
    if (ok) { ok = false; return; }
    e.preventDefault(); e.stopImmediatePropagation();
    if (b.classList.contains("sending")) return;
    b.classList.add("sending"); b.setAttribute("aria-busy", "true");
    var r = b.querySelectorAll(".roll span"); r.forEach(function (s) { s.textContent = "Отправляем…"; });
    setTimeout(function () { b.classList.remove("sending"); b.removeAttribute("aria-busy"); r.forEach(function (s) { s.textContent = "Отправить заявку"; }); ok = true; f.requestSubmit(); }, 1000);
  }, true);
});

/* ---- 1. курсор чертёжника: перекрестье + кольцо с инерцией + координаты сетки листа ---- */
(function () {
  if (calm.matches || !fine.matches) return;
  var cur = d.createElement("div"); cur.className = "cur"; cur.setAttribute("aria-hidden", "true");
  cur.innerHTML = '<i class="cur-x"></i><span class="cur-ring"></span><span class="cur-lab"></span>';
  d.body.appendChild(cur); root.classList.add("has-cur");
  var xh = cur.firstChild, ring = xh.nextSibling, lab = ring.nextSibling;
  var tx = -99, ty = -99, rx = -99, ry = -99, id = 0, shown = false, mode = "", txt = "", coord = "";
  function label(el) {
    if (el.closest("input,textarea,select")) return ["off", ""];
    if (el.closest(".plan")) return ["scene", "Схема"];
    var a = el.closest("a,button,[data-burger]"); if (!a) return ["", ""];
    var h = a.getAttribute("href") || "", btn = a.classList.contains("btn") || a.hasAttribute("data-magnetic");
    var t = h.indexOf("tel:") === 0 ? "Позвонить" : h.indexOf("mailto:") === 0 ? "Написать" : a.closest(".rail,.pager") ? "Этап →" : a.id === "fail" ? "Резерв" : a.type === "submit" ? "Отправить" : h.charAt(0) === "#" ? "Перейти" : "Открыть";
    return [btn ? "btn" : "link", t];
  }
  function loop() {
    rx += (tx - rx) * .2; ry += (ty - ry) * .2;
    xh.style.transform = "translate(" + tx + "px," + ty + "px)";
    ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
    lab.style.transform = "translate(" + (rx + 26).toFixed(1) + "px," + (ry + 20).toFixed(1) + "px)";
    var c = "x " + (tx / 40).toFixed(1).replace(".", ",") + " · y " + (ty / 40).toFixed(1).replace(".", ",");
    if (!txt && c !== coord) { coord = c; lab.textContent = c; }
    id = Math.abs(tx - rx) + Math.abs(ty - ry) > .15 ? requestAnimationFrame(loop) : 0;
  }
  function set(m, t) {
    if (m !== mode) { mode = m; cur.className = "cur" + (shown ? " on" : "") + (m ? " is-" + m : ""); }
    if (t !== txt) { txt = t; if (t) lab.textContent = t; else { coord = ""; if (!id) id = requestAnimationFrame(loop); } }
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
  d.documentElement.addEventListener("pointerleave", function () { shown = false; cur.classList.remove("on"); });
})();

/* ---- 3. параллакс hero за мышью: сетка листа, заголовок, схема (6–14 px) ---- */
if (hasG && fine.matches && !calm.matches) {
  var hero = d.querySelector(".hero"), sheet = d.querySelector(".sheet"), sv = d.querySelector(".scheme svg"), h1 = d.querySelector(".hero h1");
  if (hero && sheet) {
    var qg = [G.quickTo(sheet, "--gx", { duration: 1.4, ease: "power3" }), G.quickTo(sheet, "--gy", { duration: 1.4, ease: "power3" })],
        qs = [G.quickTo(sv, "x", { duration: 1.2, ease: "power3" }), G.quickTo(sv, "y", { duration: 1.2, ease: "power3" })],
        qh = [G.quickTo(h1, "x", { duration: 1.6, ease: "power3" }), G.quickTo(h1, "y", { duration: 1.6, ease: "power3" })];
    hero.addEventListener("pointermove", function (e) {
      var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      qg[0](nx * -28); qg[1](ny * -28); qs[0](nx * 20); qs[1](ny * 20); qh[0](nx * -12); qh[1](ny * -12);
    });
  }
}
})();
