/* ЛИК Форсайд: шторка, курсор «строительный уровень», кнопки, spotlight, бегущая строка, отправка демо-формы */
(function () {
  "use strict";
  var d = document, root = d.documentElement, KIT = window.KIT || {};
  var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };

  /* шторка: только при первом заходе за сеанс */
  var cur = d.querySelector(".curtain");
  if (cur && !root.classList.contains("seen")) {
    setTimeout(function () { cur.classList.add("off"); try { sessionStorage.setItem("lik-seen", 1); } catch (e) {} }, 750);
    setTimeout(function () { cur.style.display = "none"; }, 1500);
  }

  /* кнопки: текст перекатывается, заливка из точки входа */
  $$(".btn").forEach(function (b) {
    var t = b.textContent.trim(); if (!t) return;
    b.textContent = "";
    var r = d.createElement("span"); r.className = "roll"; r.innerHTML = "<span></span><span aria-hidden=\"true\"></span>";
    r.firstChild.textContent = t; r.lastChild.textContent = t; b.appendChild(r);
    if (!b.classList.contains("btn--ghost") && !b.closest(".mbar")) { var a = d.createElement("i"); a.className = "arr"; a.setAttribute("aria-hidden", "true"); b.appendChild(a); }
    b.addEventListener("pointerenter", function (e) { var q = b.getBoundingClientRect(); b.style.setProperty("--mx", e.clientX - q.left + "px"); b.style.setProperty("--my", e.clientY - q.top + "px"); });
    b.addEventListener("pointerleave", function (e) { var q = b.getBoundingClientRect(); b.style.setProperty("--mx", e.clientX - q.left + "px"); b.style.setProperty("--my", e.clientY - q.top + "px"); });
  });

  /* spotlight на карточках */
  $$(".card").forEach(function (c) {
    c.addEventListener("pointermove", function (e) { var q = c.getBoundingClientRect(); c.style.setProperty("--x", e.clientX - q.left + "px"); c.style.setProperty("--y", e.clientY - q.top + "px"); });
  });

  /* бегущая строка спит вне экрана */
  var mq = d.querySelector(".marq");
  if (mq && KIT.onView) KIT.onView(mq, function (v) { mq.classList.toggle("paused", !v); });

  /* демо-форма: состояние «отправляем» перед показом письма (kit покажет результат) */
  d.addEventListener("submit", function (e) {
    var f = e.target; if (!f.matches("[data-demo-form]") || f.dataset.go) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var b = f.querySelector(".btn"), r = b.querySelector(".roll > span");
    b.classList.add("sending"); if (r) r.textContent = "Отправляем…";
    setTimeout(function () { f.dataset.go = 1; b.classList.remove("sending"); f.requestSubmit(); delete f.dataset.go; }, KIT.REDUCED ? 0 : 900);
  }, true);

  /* курсор: уровень с пузырьком. Наклоняется по скорости мыши, над действием выравнивается (пузырёк в центре) */
  if (!KIT.FINE) return;
  var c = d.querySelector(".cur"), lvl = c.querySelector(".lvl"), bub = c.querySelector(".bub"), dot = c.querySelector(".dot"), lab = c.querySelector(".cur-t");
  root.classList.add("has-cur"); c.classList.add("hide");
  var mx = -100, my = -100, x = -100, y = -100, ang = 0, vx = 0, px = -100, id = 0, act = false, plumb = false, txt = "";
  function loop() {
    x += (mx - x) * .2; y += (my - y) * .2;
    vx = vx * .85 + (mx - px) * .15; px = mx;
    var target = act ? 0 : Math.max(-14, Math.min(14, vx * .9));
    if (plumb && !act) target = 90;
    ang += (target - ang) * .14;
    var tilt = plumb ? 0 : ang;
    var off = act ? 0 : Math.max(-14, Math.min(14, -tilt * 1.2));
    lvl.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + ang.toFixed(2) + "deg)";
    bub.style.transform = "translateX(" + off.toFixed(1) + "px)";
    lab.style.transform = "translate(" + x.toFixed(1) + "px," + (y + 8).toFixed(1) + "px) translateX(-50%)";
    dot.style.transform = "translate(" + mx + "px," + my + "px)";
    id = (Math.abs(mx - x) + Math.abs(my - y) + Math.abs(target - ang) + Math.abs(vx) > .3) ? requestAnimationFrame(loop) : 0;
  }
  addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    mx = e.clientX; my = e.clientY; c.classList.remove("hide");
    var t = e.target.closest ? e.target : e.target.parentElement;
    var a = t && t.closest("a,button,[data-cur],label.agree,select"), p = t && t.closest("[data-cur=plumb]"), field = t && t.closest("input,textarea,select");
    var isAct = !!a && !(a.dataset && a.dataset.cur === "plumb") && !field;
    var nt = isAct ? (a.dataset.cur || (a.tagName === "A" ? "Открыть" : "Нажать")) : "";
    if (isAct !== act || nt !== txt) { act = isAct; txt = nt; c.classList.toggle("act", act); lab.textContent = txt; }
    plumb = !!p && !isAct;
    c.classList.toggle("hide", !!field);
    if (!id) id = requestAnimationFrame(loop);
  }, { passive: true });
  d.addEventListener("pointerleave", function () { c.classList.add("hide"); });
  d.addEventListener("pointerdown", function () { lvl.style.scale = ".9"; });
  d.addEventListener("pointerup", function () { lvl.style.scale = ""; });
})();
