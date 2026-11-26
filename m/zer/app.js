/* Сцена «Пуск мощности». Одна GSAP-timeline (длина = 5 этапов): установки едут по пути (MotionPath),
   кабели рисуются (DrawSVG), потребители загораются. На широком экране её ведёт ScrollTrigger (scrub),
   на телефоне и при reduced motion — кнопки этапов (tweenTo или мгновенно). Ток по кабелям — импульсы MotionPath. */
(function () {
"use strict";
var d = document, sec = d.getElementById("deploy");
if (!sec || !window.gsap) return;
gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);
var $$ = function (s, r) { return [].slice.call((r || sec).querySelectorAll(s)); };
var steps = $$(".steps li"), rail = $$(".rail button"), units = $$(".unit"), users = $$(".user"), tags = $$(".t-u"), halos = $$(".halo"),
    live = $$(".live path"), plan = d.getElementById("plan"), status = d.getElementById("status"), pulses = $$(".pulse"),
    fail = d.getElementById("fail"), prev = d.getElementById("prev"), next = d.getElementById("next"), route = d.getElementById("route"),
    poles = sec.querySelector(".poles"), draws = ["ln-gas", "bus", "grid-l"].map(function (c) { return sec.querySelector("." + c); });
var N = steps.length, len = route.getTotalLength();
var wide = matchMedia("(min-width:901px) and (min-height:600px)"), calm = matchMedia("(prefers-reduced-motion:reduce)");
var scrub = false, st = null, active = -1, manual = null, key = "";
function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function cls(el, name, v) { el.classList.toggle(name, !!v); }

/* ---- timeline ---- */
var tl = gsap.timeline({ paused: true, defaults: { ease: "none" }, onUpdate: sync });
units.forEach(function (u, i) {
  /* колонна выходит с базы по пути route и растёт до натурального размера; позиция считается по длине пути */
  var cy = 301 + i * 57, o = { e: 0 };
  function put() {
    var e = o.e, pt = route.getPointAtLength(e * len), x = pt.x + (3 - i) * 16 * (1 - e), y = pt.y + (cy - 385) * e, k = .45 + .55 * e;
    u.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") scale(" + k.toFixed(3) + ") translate(-420 " + -cy + ")");
  }
  put();
  tl.to(o, { e: 1, duration: .46, ease: "power2.inOut", onUpdate: put }, i * .045);
});
tl.fromTo(draws[0], { drawSVG: "0%" }, { drawSVG: "100%", duration: .3, ease: "power1.inOut" }, 1)
  .fromTo(draws[1], { drawSVG: "0%" }, { drawSVG: "100%", duration: .25, ease: "power1.inOut" }, 1.22)
  .fromTo(draws[2], { drawSVG: "0%" }, { drawSVG: "100%", duration: .32, ease: "power1.inOut" }, 1.36)
  .fromTo(poles, { opacity: 0 }, { opacity: 1, duration: .18 }, 1.5)
  .fromTo(plan, { "--g": 0 }, { "--g": 1, duration: 1.9 }, 2)
  .fromTo(route, { opacity: 1 }, { opacity: .15, duration: .3 }, 1.1);
halos.forEach(function (h, i) {
  tl.fromTo(h, { opacity: 0, scale: .5, svgOrigin: "872 " + [100, 265, 438, 600][i] }, { opacity: 1, scale: 1, duration: .38, ease: "power1.out" }, 3 + i * .12);
});
tl.set({}, {}, N);

/* ---- импульсы тока: бегут, пока сцена на экране и свет подан ---- */
var pulseTl = gsap.timeline({ paused: true });
pulses.forEach(function (c, i) {
  var id = "#cp" + [0, 1, 2, 3, 1, 2][i];
  pulseTl.to(c, { motionPath: { path: id, align: id, alignOrigin: [.5, .5] }, duration: 2.8 + (i % 3) * .3, ease: "none", repeat: -1, repeatDelay: .4 }, i * .55);
});
ScrollTrigger.create({ trigger: sec, start: "top bottom", end: "bottom top", onToggle: function (s) { if (calm.matches) return; s.isActive ? pulseTl.play() : pulseTl.pause(); } });

/* ---- состояние ---- */
function sync() {
  var p = tl.time(), i = Math.min(N - 1, Math.floor(p));
  if (scrub && i < 4) manual = null;
  if (scrub) mark(i);
  render(p);
}
function render(p) {
  var start = clamp((p - 2) / .55), supply = clamp((p - 3) / .55), mount = clamp((p - 1) / .55), move = clamp(p / .55);
  var failed = manual === null ? (scrub && p >= 4.35) : manual;
  var k = [start.toFixed(1), supply.toFixed(1), Math.round(start * 4), Math.round(supply * 4), mount === 1, move === 1, failed].join();
  if (k === key) return; key = k;
  units.forEach(function (u, i) {
    var run = i < 3 ? start > .2 + i * .25 : false;
    if (failed) run = i !== 1;
    cls(u, "on", run); cls(u, "off", failed && i === 1);
  });
  live.forEach(function (l) { var n = /l(\d)/.exec(l.getAttribute("class") || ""); cls(l, "on", n ? supply > Number(n[1]) * .24 + .05 : start > .8); });
  pulses.forEach(function (c) { cls(c, "on", start > .8); });
  users.forEach(function (c, i) { var on = supply > i * .24 + .12; cls(c, "on", on); cls(tags[i], "on", on); });
  fail.setAttribute("aria-pressed", failed);
  fail.textContent = failed ? "Вернуть в работу" : "Отключить одну ПАЭС";
  status.textContent = failed ? "Одна ПАЭС отключена — включилась резервная. Потребители остаются со светом."
    : supply === 1 ? "Все потребители на схеме получают электроэнергию."
    : start === 1 ? "Установки работают, напряжение подаётся."
    : mount === 1 ? "Газ и линии смонтированы. Площадка ещё без света."
    : move === 1 ? "Установки на площадке. Света пока нет."
    : "Площадка вдали от ЛЭП: света нет.";
  d.dispatchEvent(new CustomEvent("zer:state", { detail: { p: p } }));
}
function mark(i) {
  if (i === active) return; active = i;
  steps.forEach(function (s, j) { cls(s, "on", j === i); });
  rail.forEach(function (b, j) { cls(b, "past", j < i); if (j === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
  prev.disabled = i <= 0;
  next.textContent = i === N - 1 ? "К заявке" : "Следующий этап";
}

function span() { return sec.offsetHeight - sec.querySelector(".stage").offsetHeight; }
function go(i) {
  i = Math.max(0, Math.min(N - 1, i));
  manual = null;
  if (scrub) {
    /* середина плато; для резерва — до автоматического отключения, чтобы нажать самому */
    var at = i + (i === 4 ? .2 : .75);
    var y = sec.getBoundingClientRect().top + scrollY + span() * at / N;
    if (window.KIT && KIT.lenis) KIT.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo({ top: y, behavior: "instant" });
  } else {
    mark(i);
    var to = i + .75, quick = calm.matches || (window.KIT && KIT.still);
    if (quick) { tl.pause().time(to); } else tl.tweenTo(to, { duration: .9, ease: "power1.inOut" });
  }
}

function mode() {
  scrub = wide.matches && !calm.matches;
  cls(sec, "scrub", scrub);
  key = ""; active = -1; manual = null;
  if (st) { st.kill(); st = null; }
  tl.pause();
  if (scrub) {
    st = ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom bottom", scrub: .6, animation: tl, invalidateOnRefresh: true });
    st.update();
    sync();
  } else {
    tl.time(N); steps.forEach(function (s) { s.classList.remove("on"); });
    rail.forEach(function (b) { b.removeAttribute("aria-current"); b.classList.add("past"); });
    render(N);
  }
  if (calm.matches) { pulseTl.pause(); } else if (sec.getBoundingClientRect().bottom > 0 && sec.getBoundingClientRect().top < innerHeight) pulseTl.play();
  ScrollTrigger.refresh();
}

rail.forEach(function (b, i) { b.addEventListener("click", function () { go(i); }); });
sec.addEventListener("keydown", function (e) {
  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
  var here = rail.indexOf(e.target), from = here >= 0 ? here : active < 0 ? N - 1 : active, to = Math.max(0, Math.min(N - 1, from + (e.key === "ArrowRight" ? 1 : -1)));
  e.preventDefault();
  /* фокус уходит на кнопку этапа: прежний элемент мог скрыться вместе с этапом */
  rail[to].focus({ preventScroll: true }); go(to);
});
prev.addEventListener("click", function () { go(active - 1); });
next.addEventListener("click", function () {
  if (active === N - 1) { d.querySelector(".acts a").click(); return; }
  go(active + 1);
});
fail.addEventListener("click", function () {
  var now = fail.getAttribute("aria-pressed") === "true";
  if (!scrub && active !== 4) { mark(4); if (tl.time() < 4.6) tl.pause().time(4.7); }
  manual = !now; key = ""; render(tl.time());
  /* на телефоне кнопка ниже схемы: показываем, что произошло */
  if (!scrub && plan.getBoundingClientRect().top < 0) plan.scrollIntoView({ block: "center" });
});
wide.addEventListener("change", mode); calm.addEventListener("change", mode);
mode();
window.ZER = { go: go, tl: tl };
})();
