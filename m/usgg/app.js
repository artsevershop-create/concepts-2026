/* «Путь газа» (этапы по прокрутке + горелка на canvas), инструкция при запахе газа, быстрые действия */
(function () {
  "use strict";
  var d = document, $ = function (s) { return d.querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var K = window.KIT;

  var more = $(".sos-more"), list = $("#sos-steps");
  more.addEventListener("click", function () { var v = list.hidden; list.hidden = !v; more.setAttribute("aria-expanded", v); });

  // до обработчика прокрутки Lenis: открыть нужный раздел и подставить тему заявки
  d.addEventListener("click", function (e) {
    var a = e.target.closest("[data-open],[data-topic]"); if (!a) return;
    if (a.dataset.open) { var det = d.getElementById(a.dataset.open); det.open = true; }
    if (a.dataset.topic) $("#a-t").value = a.dataset.topic;
  }, true);

  var path = $(".path"), steps = $$(".steps li"), dots = $$(".dots button"), layers = $$(".s", path), pipes = $$(".pipe", path);
  var N = steps.length, cur = -1, target = 1, level = 1;
  // низкий горизонтальный экран: закреплённая сцена не помещается, остаётся статичный список
  var live = !K.REDUCED && !matchMedia("(max-height:520px)").matches;

  var cv = $("#flame"), cx = cv.getContext("2d");
  function jet(a, t, i, R, mx, my, rx, ry) {
    var c = Math.cos(a), s = Math.sin(a), x = mx + rx * c, y = my + ry * s;
    var f = .86 + .1 * Math.sin(t * .011 + i * 1.7) + .06 * Math.sin(t * .027 + i * 3.1);
    var L = R * .36 * f * level, tx = x + c * L * .82, ty = y + s * L * .22 - L * .62;
    var qx = x + c * L * .66, qy = y + s * L * .2 - L * .06, nx = -(ty - y), ny = tx - x, n = Math.hypot(nx, ny) || 1, bw = R * .034;
    nx *= bw / n; ny *= bw / n;
    [[1, "rgba(70,200,255,.9)", "rgba(20,100,255,.55)", "rgba(80,60,230,0)"], [.46, "rgba(235,255,255,.95)", "rgba(120,225,255,.7)", "rgba(40,160,255,0)"]].forEach(function (k) {
      var ex = x + (tx - x) * k[0], ey = y + (ty - y) * k[0], g = cx.createLinearGradient(x, y, ex, ey);
      g.addColorStop(0, k[1]); g.addColorStop(.55, k[2]); g.addColorStop(1, k[3]); cx.fillStyle = g;
      var mxq = x + (qx - x) * k[0], myq = y + (qy - y) * k[0];
      cx.beginPath(); cx.moveTo(x + nx * k[0], y + ny * k[0]); cx.quadraticCurveTo(mxq + nx, myq + ny, ex, ey); cx.quadraticCurveTo(mxq - nx, myq - ny, x - nx * k[0], y - ny * k[0]); cx.fill();
    });
    if (i % 7 === 3) { cx.fillStyle = "rgba(255,150,40," + (.35 * level * f) + ")"; cx.beginPath(); cx.ellipse(tx, ty, R * .012, R * .035, Math.atan2(tx - x, y - ty), 0, 7); cx.fill(); }
  }
  function disc(x, y, rx, ry, fill) { cx.fillStyle = fill; cx.beginPath(); cx.ellipse(x, y, rx, ry, 0, 0, 7); cx.fill(); }
  function draw(t, dt) {
    var w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
    var r = Math.min(2, devicePixelRatio || 1);
    if (cv.width !== Math.round(w * r)) { cv.width = Math.round(w * r); cv.height = Math.round(h * r); }
    cx.setTransform(r, 0, 0, r, 0, 0); cx.clearRect(0, 0, w, h);
    level = dt ? level + (target - level) * Math.min(1, dt / 420) : target;
    var R = w / 2, mx = R, my = h * .62, rx = R * .5, ry = R * .17, i, a, N2 = 44;
    if (level > .01) {
      cx.save(); cx.translate(mx, my - R * .08); cx.scale(1, .62);
      var g = cx.createRadialGradient(0, 0, 0, 0, 0, R); g.addColorStop(0, "rgba(30,130,255," + .5 * level + ")"); g.addColorStop(1, "rgba(30,80,255,0)");
      cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, R, 0, 7); cx.fill(); cx.restore();
    }
    disc(mx, my + R * .17, rx * 1.18, ry * 1.18, "#0C1330");
    disc(mx, my + R * .07, rx * 1.04, ry * 1.04, "#28345C");
    disc(mx, my, rx, ry, "#4B5A86");
    function ring(front) {
      if (level <= .01) return;
      cx.globalCompositeOperation = "lighter";
      for (i = 0; i < N2; i++) { a = (i + .5) / N2 * Math.PI * 2; if ((Math.sin(a) >= 0) === front) jet(a, t, i, R, mx, my, rx, ry); }
      cx.globalCompositeOperation = "source-over";
    }
    ring(false);
    var cap = cx.createLinearGradient(mx - rx, 0, mx + rx, 0); cap.addColorStop(0, "#0A0F24"); cap.addColorStop(.38, "#39456E"); cap.addColorStop(1, "#080C1C");
    disc(mx, my - R * .015, rx * .82, ry * .82, "#070A18");
    disc(mx, my - R * .05, rx * .78, ry * .76, cap);
    ring(true);
  }

  function repaint() { if (K.still || K.REDUCED) draw(0, 0); }
  function setStage(n, p) {
    // труба растёт на этапе «Строительство» (индекс 3)
    var grow = Math.max(0, Math.min(1, (p * N - 3) / .85));
    pipes.forEach(function (el) { el.style.strokeDashoffset = 100 - grow * 100; el.style.visibility = grow ? "visible" : "hidden"; });
    if (n === cur) return; cur = n;
    steps.forEach(function (el, i) { el.classList.toggle("on", i === n); });
    dots.forEach(function (el, i) { el.classList.toggle("done", i < n); if (i === n) el.setAttribute("aria-current", "step"); else el.removeAttribute("aria-current"); });
    layers.forEach(function (el) {
      var from = +el.getAttribute("class").match(/\bs([0-6])\b/)[1];
      // выноски «Заявка/Проект» уступают место построенной трубе
      el.classList.toggle("on", n >= from && !((from === 1 && n > 3) || (from === 2 && n > 2)));
    });
    target = n >= 5 ? 1 : 0; repaint();
    var box = dots[n].parentNode; if (box.scrollWidth > box.clientWidth) box.scrollLeft = dots[n].offsetLeft - box.offsetLeft - box.clientWidth / 2 + dots[n].offsetWidth / 2;
  }

  if (live) {
    path.classList.add("is-live"); level = target = 0;
    var tick = false;
    var upd = function () {
      tick = false;
      var r = path.getBoundingClientRect(), p = Math.max(0, Math.min(1, -r.top / (r.height - innerHeight)));
      setStage(Math.min(N - 1, Math.floor(p * N)), p);
    };
    addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener("resize", function () { upd(); repaint(); });
    dots.forEach(function (b, i) {
      b.addEventListener("click", function () {
        var y = path.getBoundingClientRect().top + scrollY + (path.offsetHeight - innerHeight) * (i + .9) / N;
        if (K.lenis) K.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo({ top: y, behavior: "instant" });
      });
    });
    upd();
  } else addEventListener("resize", function () { draw(0, 0); });

  K.raf(cv, draw, 30);
})();
