/* «Изделие в разборе»: по прокрутке разнесённый вид собирается; вкладки изделий; запрос КП с выбранным изделием */
(function () {
  "use strict";
  var d = document, scene = d.getElementById("razbor"); if (!scene) return;
  var K = window.KIT || {}, REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pin = matchMedia("(min-width: 901px)");
  var tabs = [].slice.call(scene.querySelectorAll("[role=tab]")), cur = "pp2";
  var marks = scene.querySelectorAll("[data-go]");
  var NAMES = { pp2: "ПП2-160х21Ш", pk1: "ПК1-156х21", pmsh: "ПМШ" };

  function select(id, focus) {
    cur = id;
    tabs.forEach(function (t) {
      var on = t.id === "t-" + id; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
      d.getElementById(t.getAttribute("aria-controls")).hidden = !on; if (on && focus) t.focus();
    });
    scene.querySelectorAll(".rend").forEach(function (r) { r.hidden = r.dataset.p !== id; });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(t.id.slice(2)); });
    t.addEventListener("keydown", function (e) {
      var n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!n) return;
      e.preventDefault(); select(tabs[(i + n + tabs.length) % tabs.length].id.slice(2), true);
    });
  });
  d.querySelectorAll("[data-pick]").forEach(function (a) { a.addEventListener("click", function () { select(a.dataset.pick); }); });

  function go(target) {
    if (K.lenis) K.lenis.scrollTo(target, { offset: 0 }); else (typeof target === "number" ? scrollTo({ top: target, behavior: "smooth" }) : target.scrollIntoView({ behavior: "smooth" }));
  }
  d.getElementById("ask").addEventListener("click", function () {
    var s = d.getElementById("f-prod"); s.value = NAMES[cur]; go(d.getElementById("kp"));
    setTimeout(function () { s.focus({ preventScroll: true }); }, 900);
  });

  /* прогресс сборки k: 0 — разнесено, 1 — в сборе */
  var k = -1;
  function setK(v) {
    v = Math.round(v * 1000) / 1000; if (v === k) return; k = v;
    scene.style.setProperty("--k", v);
    marks[0].classList.toggle("on", v < .5); marks[1].classList.toggle("on", v >= .5);
  }
  function ease(x) { return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function measure() {
    var p;
    if (pin.matches) { var r = scene.getBoundingClientRect(); p = -r.top / Math.max(1, r.height - innerHeight); p = (p - .12) / .7; }
    else { var s = scene.querySelector(".draw").getBoundingClientRect(); p = (innerHeight * .8 - s.top) / (innerHeight * .55); }
    setK(ease(Math.min(1, Math.max(0, p))));
  }
  if (REDUCED) { setK(1); }
  else {
    var tick = false;
    addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; measure(); }); } }, { passive: true });
    addEventListener("resize", measure); measure();
  }
  /* кнопки шкалы: доступ к обоим видам без прокрутки-скраба */
  marks.forEach(function (b) {
    b.addEventListener("click", function () {
      var v = +b.dataset.go;
      if (REDUCED) return;
      if (pin.matches) { var top = scene.getBoundingClientRect().top + scrollY, len = scene.offsetHeight - innerHeight; go(top + len * (v ? .86 : .08)); }
      else setK(v);
    });
  });
})();
