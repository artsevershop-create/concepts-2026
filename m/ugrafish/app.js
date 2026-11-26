/* Югорский рыбоводный завод: погружение, годовой цикл, курсор, кнопки, атмосфера.
   GSAP + ScrollTrigger (SplitText, DrawSVG, MotionPath). Сцены включаются через gsap.matchMedia: широкий экран без reduced motion. */
(function () {
  "use strict";
  var d = document, root = d.documentElement, K = window.KIT || {}, g = window.gsap;
  if (!g || !window.ScrollTrigger) return;
  g.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });
  var $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var calm = matchMedia("(prefers-reduced-motion: reduce)"), FINE = !!K.FINE;
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var ease = function (v) { v = clamp(v); return v * v * (3 - 2 * v); };
  function go(y, instant) { if (K.lenis) K.lenis.scrollTo(y, instant ? { immediate: true, force: true } : {}); else scrollTo({ top: y, behavior: instant || calm.matches ? "auto" : "smooth" }); }

  /* скорость прокрутки (px за кадр, сглажена): волна, пузырьки, бегущая строка */
  var vel = 0, lastY = scrollY;
  g.ticker.add(function () { var y = scrollY; vel += (Math.abs(y - lastY) - vel) * .12; lastY = y; });

  var dive = $(".dive"), pin = $(".dive-pin"), water = $(".water"), lens = $(".lens"), photo = $("img", lens), surf = $(".surface"), deep = $(".deep"), bubbles = $(".bubbles"), fx = $(".water-fx");

  /* ---------- вода: волна на SVG (реагирует на скорость), пузырьки и каустика на canvas ---------- */
  var pw = $(".wave:not(.wave-b) path"), pb = $(".wave-b path");
  function wave(phase, amp, k) {
    var s = "M0 60", n = 36;
    for (var i = 0; i <= n; i++) { var u = i / n; s += "L" + (u * 1440).toFixed(0) + " " + (30 + amp * (Math.sin(u * 6.283 * k + phase) + .45 * Math.sin(u * 6.283 * k * 2.1 - phase * 1.3))).toFixed(1); }
    return s + "L1440 60Z";
  }
  K.raf(water, function (t) {
    var a = 3.5 + Math.min(11, vel * .45);
    pw.setAttribute("d", wave(t * .0012, a, 1.6)); pb.setAttribute("d", wave(2 - t * .0009, a * .8, 1.1));
  }, 30);

  var bx = bubbles.getContext("2d"), BW = 1, BH = 1, B = [], i;
  for (i = 0; i < 34; i++) B.push({ x: Math.random(), y: Math.random(), r: 2 + Math.random() * 7, s: .25 + Math.random() * .6, w: Math.random() * 6 });
  function bsize() { BW = bubbles.width = Math.max(1, pin.clientWidth); BH = bubbles.height = Math.max(1, pin.clientHeight); }
  new ResizeObserver(bsize).observe(pin); bsize();
  K.raf(bubbles, function (t, dt) {
    bx.clearRect(0, 0, BW, BH); var boost = 1 + vel * .1;
    for (var j = 0; j < B.length; j++) {
      var b = B[j]; b.y -= b.s * dt * .00006 * boost; if (b.y < -.05) { b.y = 1.05; b.x = Math.random(); }
      var px = (b.x + Math.sin(t * .001 + b.w) * .01) * BW, py = b.y * BH;
      bx.beginPath(); bx.arc(px, py, b.r, 0, 6.283); bx.strokeStyle = "rgba(217,255,242,.55)"; bx.lineWidth = 1.2; bx.stroke();
      bx.beginPath(); bx.arc(px - b.r * .3, py - b.r * .3, b.r * .28, 0, 6.283); bx.fillStyle = "rgba(255,255,255,.55)"; bx.fill();
    }
  }, 30);

  var cc = $(".caustic"), cx = cc.getContext("2d"), CW = cc.width, CH = cc.height, cimg = cx.createImageData(CW, CH);
  K.raf(cc, function (t) {
    var T = t * .0006, k = 0, x, y;
    for (y = 0; y < CH; y++) for (x = 0; x < CW; x++) {
      var u = x / CW * 12.566, v = y / CH * 7.5;
      var s = Math.sin(u + T * 2 + Math.sin(v * 1.3 + T)) + Math.sin(v * 1.7 - T * 1.4 + Math.sin(u * .9 - T * .6)) + Math.sin((u + v) * .8 + T);
      var a = Math.max(0, 1 - Math.abs(s) * 1.5); a = a * a * a * a;
      cimg.data[k] = 200; cimg.data[k + 1] = 255; cimg.data[k + 2] = 240; cimg.data[k + 3] = a * 255; k += 4;
    }
    cx.putImageData(cimg, 0, 0);
  }, 16);


  /* ---------- рыбы: плавание под водой (клоны нарисованных видов), реакция на курсор, пауза вне экрана ---------- */
  var mouse = { x: -9999, y: -9999, on: false };
  d.addEventListener("pointermove", function (e) { if (e.pointerType !== "mouse") return; mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; }, { passive: true });
  d.documentElement.addEventListener("mouseleave", function () { mouse.on = false; });
  function swim(layer, defs, vh) {
    if (!layer) return;
    var small = innerWidth < 700, F = [], W = 1, H = 1;
    function size() { W = layer.clientWidth || innerWidth; H = Math.min(layer.clientHeight || innerHeight, (vh || .8) * innerHeight); }
    size(); addEventListener("resize", size);
    defs.forEach(function (s, i) {
      var src = d.querySelector("#sp-" + s.k + " svg"); if (!src) return;
      var el = d.createElement("div"), svg = src.cloneNode(true), w = small ? s.w * .62 : s.w;
      el.className = "sw-f"; el.style.width = w + "px"; el.style.opacity = s.a; svg.style.setProperty("--t", s.t + "s"); el.appendChild(svg); layer.appendChild(el);
      F.push({ el: el, w: w, vx: s.v, sc: s.v < 0 ? -1 : 1, x: (i + .5) / defs.length * W - w / 2, y0: s.y, amp: 6 + 10 * s.depth, f: .6 + i * .13, ph: i * 2.1, depth: s.depth, fx: 0, fy: 0, ox: 0, oy: 0 });
    });
    var live = false;
    function setLive() { layer.classList.toggle("live", live && !d.hidden); }
    K.onView(layer, function (v) { live = v; setLive(); }); d.addEventListener("visibilitychange", setLive);
    var still = calm.matches;
    K.raf(layer, function (t, dt) {
      var lr = layer.getBoundingClientRect(), mxp = mouse.on ? mouse.x : innerWidth / 2, par = (mxp / innerWidth - .5);
      F.forEach(function (s) {
        var ty = s.y0 * H + (still ? 0 : Math.sin(t * .0006 * s.f + s.ph) * s.amp);
        if (!still && dt) {
          var k = dt / 1000, cx = lr.left + s.x + s.ox + s.w / 2, cy = lr.top + ty + s.oy + s.w * .17;
          if (mouse.on) { var dx = cx - mouse.x, dy = cy - mouse.y, dist = Math.sqrt(dx * dx + dy * dy) || 1, R = 120 + 130 * s.depth; if (dist < R) { var p = 1 - dist / R; s.fx += dx / dist * p * 420 * k * 4; s.fy += dy / dist * p * 260 * k * 4; } }
          s.fx *= .94; s.fy *= .94;
          s.ox += s.fx * k * 2.2; s.oy += s.fy * k * 2.2; s.ox *= .995; s.oy *= .985;
          s.x += s.vx * k * (1 + vel * .06);
          if (s.vx > 0 && s.x > W + s.w * .3) s.x = -s.w * 1.2; else if (s.vx < 0 && s.x < -s.w * 1.3) s.x = W + s.w * .3;
          var tv = s.vx + s.fx; s.sc += ((tv < 0 ? -1 : 1) - s.sc) * .08;
        }
        var rot = still ? 0 : Math.max(-14, Math.min(14, s.fy * .1)) * (s.sc < 0 ? -1 : 1) * 0.5;
        s.el.style.transform = "translate3d(" + (s.x + s.ox + (still ? 0 : par * s.depth * -26)).toFixed(1) + "px," + (ty + s.oy).toFixed(1) + "px,0) scaleX(" + s.sc.toFixed(2) + ") rotate(" + rot.toFixed(1) + "deg)";
      });
    }, 30);
  }
  swim($(".swim-back"), [{ k: "muksun", w: 420, v: 15, y: .2, a: .28, t: 3.6, depth: .4 }, { k: "pelyad", w: 340, v: -19, y: .52, a: .26, t: 3.2, depth: .35 }, { k: "chir", w: 460, v: 11, y: .74, a: .22, t: 4, depth: .3 }], .82);
  swim($(".swim-front"), [{ k: "sterlyad", w: 320, v: -34, y: .1, a: .34, t: 2.4, depth: 1 }, { k: "osetr", w: 380, v: 26, y: .36, a: .34, t: 2.8, depth: .9 }, { k: "forel", w: 230, v: -44, y: .58, a: .3, t: 2.1, depth: .8 }], .82);
  swim($(".swim-about"), [{ k: "muksun", w: 240, v: 18, y: .2, a: .3, t: 3.6, depth: .5 }, { k: "sterlyad", w: 210, v: -24, y: .5, a: .32, t: 3, depth: .6 }, { k: "chir", w: 260, v: 14, y: .78, a: .26, t: 3.8, depth: .4 }], 5);

  /* карточки видов: подробнее по клику и с клавиатуры */
  $$(".sp").forEach(function (card) {
    var b = $(".sp-more", card), p = $(".sp-d", card), lab = $("span", b); p.inert = true;
    b.addEventListener("click", function () {
      var o = card.classList.toggle("open"); b.setAttribute("aria-expanded", o); p.inert = !o; lab.textContent = o ? "Свернуть" : "Подробнее";
    });
  });

  /* ---------- погружение (hero) ---------- */
  function shape(k) {
    var pts = [], n = 72;
    for (var q = 0; q < n; q++) {
      var a = q / n * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      var rx = 44 + 6 * k, ry = 40 + 8 * k, e = .96 - .22 * k, wob = 1 + (.028 - .016 * k) * Math.sin(a * 5 + k * 5);
      pts.push((50 + rx * Math.sign(c) * Math.pow(Math.abs(c), e) * wob).toFixed(2) + "% " + (50 + ry * (1 - .07 * c) * Math.sign(s) * Math.pow(Math.abs(s), e) * wob).toFixed(2) + "%");
    }
    photo.style.clipPath = "polygon(" + pts.join(",") + ")"; lens.classList.add("cut");
  }
  var lastP = -1;
  function drawDive(p) {
    p = Math.round(clamp(p) * 500) / 500; if (p === lastP) return; lastP = p;
    var H = pin.clientHeight, sink = ease(p / .5);
    water.style.transform = fx.style.transform = "translateY(" + (-sink * H * .8).toFixed(1) + "px)";
    lens.style.transform = "translateY(" + (-sink * H * .45).toFixed(1) + "px) scale(" + (.9 + .1 * sink).toFixed(3) + ")";
    shape(ease(p / .55));
    surf.style.transform = "translateY(" + (-ease(p / .34) * H * .2).toFixed(1) + "px)";
    var o = 1 - ease((p - .05) / .2); surf.style.opacity = o.toFixed(3); surf.style.visibility = o < .02 ? "hidden" : "";
    deep.style.opacity = ease((p - .46) / .14).toFixed(3);
    bubbles.style.opacity = ease((p - .15) / .3).toFixed(3);
  }
  function waterline() { if (!root.classList.contains("scene")) pin.style.setProperty("--wl", (surf.offsetTop + surf.offsetHeight + 60) + "px"); }

  /* ---------- годовой цикл: ScrollTrigger + икринка по шкале месяцев ---------- */
  var cycle = $(".cycle"), track = $(".track"), stages = $$(".stage"), tabs = $$("[data-go]"), months = $$(".months li"), steps = $(".steps"), hdr = $(".hdr");
  var N = stages.length, HOLD = .72, cur = -1, lastX = null, scene = false;
  var fl = $(".fishline"), flBase = $(".fl-base"), flDone = $(".fl-done"), egg = $(".fl-egg"), fishTw = null, fish = { x: 0 };
  var ANCH = [.06, .3, .62, .8, .96];
  function pOf(x) { var i = Math.min(N - 2, Math.max(0, Math.floor(x))); return ANCH[i] + (ANCH[i + 1] - ANCH[i]) * clamp(x - i); }
  function setFish(x) {
    fish.x = x; var p = pOf(x); if (fishTw) fishTw.progress(p);
    g.set(flDone, { drawSVG: "0% " + (p * 100).toFixed(1) + "%" }); egg.setAttribute("rx", (5 + 11 * p).toFixed(1));
  }
  function layoutFish() {
    var W = fl.clientWidth; if (!W) return; fl.setAttribute("viewBox", "0 0 " + W + " 30");
    var s = "M0 15"; for (var q = 1; q <= 60; q++) s += "L" + (W * q / 60).toFixed(1) + " " + (15 + 5 * Math.sin(q / 60 * 6.283 * 3.5)).toFixed(1);
    flBase.setAttribute("d", s); flDone.setAttribute("d", s);
    if (fishTw) fishTw.kill();
    fishTw = g.to(egg, { motionPath: { path: flBase, align: flBase, alignOrigin: [.5, .5], autoRotate: true }, ease: "none", paused: true, duration: 1 });
    setFish(fish.x);
  }
  function select(i) {
    if (i === cur) return; cur = i;
    tabs.forEach(function (b, k) { if (k === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    months.forEach(function (m) { m.classList.toggle("on", m.dataset.s.split(" ").indexOf(String(i)) > -1); });
    stages.forEach(function (s, k) { s.inert = scene && k !== i; });
    var b = tabs[i].parentNode; if (steps.scrollWidth > steps.clientWidth) steps.scrollLeft = b.offsetLeft - steps.offsetLeft - (steps.clientWidth - b.offsetWidth) / 2;
    if (!scene) { if (calm.matches) setFish(i); else g.to(fish, { x: i, duration: .9, ease: "power2.inOut", overwrite: true, onUpdate: function () { setFish(fish.x); } }); }
  }
  function span() { return cycle.offsetHeight - innerHeight; }
  function cycleScene(p) {
    hdr.classList.toggle("off", p > .001 && p < .999);
    var t = clamp(p) * (N - 1 + HOLD), i = Math.min(N - 1, Math.floor(t));
    var x = i === N - 1 ? i : i + ease((t - i - HOLD) / (1 - HOLD));
    x = Math.round(x * 1000) / 1000;
    if (x !== lastX) { lastX = x; track.style.transform = "translate3d(" + (-x * 100 / N) + "%,0,0)"; setFish(x); }
    select(Math.round(x));
  }
  function cycleFlat() {
    var line = innerHeight * .5, a = 0;
    stages.forEach(function (s, k) { if (s.getBoundingClientRect().top < line) a = k; });
    select(a);
  }
  function show(i) {
    if (scene) go(cycle.getBoundingClientRect().top + scrollY + span() * (i + (i === N - 1 ? 0 : HOLD / 2)) / (N - 1 + HOLD));
    else go(stages[i].getBoundingClientRect().top + scrollY - ($(".cycle-nav").offsetHeight + 76));
  }
  tabs.forEach(function (b, k) {
    b.addEventListener("click", function () { show(k); });
    b.addEventListener("keydown", function (e) {
      var to = e.key === "ArrowRight" ? k + 1 : e.key === "ArrowLeft" ? k - 1 : e.key === "Home" ? 0 : e.key === "End" ? N - 1 : -1;
      if (to < 0 || to >= N) return; e.preventDefault(); tabs[to].focus({ preventScroll: true }); show(to);
    });
  });
  var mi = (new Date().getMonth() + 4) % 12, nowBtn = $(".now"), nowStage = +months[mi].dataset.s.split(" ")[0];
  var NAMES = ["сентябрь", "октябрь", "ноябрь", "декабрь", "январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август"];
  nowBtn.textContent = "Сейчас по схеме (" + NAMES[mi] + "): " + $("b", tabs[nowStage]).textContent.toLowerCase();
  nowBtn.hidden = false; nowBtn.addEventListener("click", function () { show(nowStage); });

  /* ---------- режимы: сцена / собранная версия, переключаются живьём ---------- */
  var mm = g.matchMedia();
  mm.add({ scene: "(min-width:901px) and (min-height:601px) and (prefers-reduced-motion:no-preference)", flat: "(max-width:900px), (max-height:600px), (prefers-reduced-motion:reduce)" }, function (ctx) {
    scene = !!ctx.conditions.scene; lastP = lastX = null; cur = -1;
    root.classList.toggle("scene", scene); cycle.classList.toggle("is-pinned", scene);
    if (!scene) { shape(matchMedia("(min-width:901px)").matches ? 1 : .7); waterline(); }
    if (scene) {
      ScrollTrigger.create({ trigger: dive, start: "top top", end: "bottom bottom", onUpdate: function (s) { drawDive(s.progress); }, onRefresh: function (s) { drawDive(s.progress); } });
      ScrollTrigger.create({ trigger: cycle, start: "top top", end: "bottom bottom", onUpdate: function (s) { cycleScene(s.progress); }, onRefresh: function (s) { cycleScene(s.progress); } });
    } else {
      ScrollTrigger.create({ trigger: cycle, start: "top bottom", end: "bottom top", onUpdate: cycleFlat, onRefresh: cycleFlat });
    }
    layoutFish(); if (!scene) { cur = -1; cycleFlat(); }
    return function () {
      hdr.classList.remove("off");
      [water, fx, lens, surf, deep, bubbles, track].forEach(function (el) { el.style.transform = el.style.opacity = el.style.visibility = ""; });
      stages.forEach(function (s) { s.inert = false; });
    };
  });
  addEventListener("resize", function () { layoutFish(); waterline(); bsize(); });
  d.fonts && d.fonts.ready.then(function () { waterline(); layoutFish(); runTo(); });

  /* ---------- вход: curtain (≤1 с, раз за сеанс) → timeline hero ≤3,5 с → тихая жизнь ---------- */
  var split = null, introBuilt = false, tl = null;
  function quiet() {
    if (calm.matches) return;
    g.to(photo, { y: -7, duration: 5.5, ease: "sine.inOut", yoyo: true, repeat: -1 });
  }
  function buildIntro() {
    if (introBuilt) return; introBuilt = true;
    var h1 = $(".surface h1");
    if (calm.matches) { root.classList.remove("intro", "curt"); return; }
    split = SplitText.create(h1, { type: "lines", mask: "lines", linesClass: "ln" });
    tl = g.timeline({ paused: true, defaults: { ease: "power3.out" }, onComplete: quiet });
    tl.from(water, { autoAlpha: 0, duration: .9 }, 0)
      .from(photo, { scale: 1.16, autoAlpha: 0, duration: 1.5, ease: "power2.out" }, .1)
      .from(split.lines, { yPercent: 115, duration: .95, stagger: .12 }, .45)
      .from(".surface p", { y: 18, autoAlpha: 0, duration: .8 }, 1)
      .from(".surface .cta .btn", { y: 20, autoAlpha: 0, duration: .7, stagger: .1 }, 1.2)
      .from(".hdr-in", { y: -24, autoAlpha: 0, duration: .8 }, 1.5);
    root.classList.remove("intro");
    var c = $("body > .curtain");
    if (root.classList.contains("curt")) {
      g.timeline({ onComplete: function () { root.classList.remove("curt"); try { sessionStorage.setItem("ugf", "1"); } catch (e) {} } })
        .from($("img", c), { autoAlpha: 0, y: 12, duration: .3 })
        .to({}, { duration: .15 })
        .to(c, { yPercent: -100, duration: .45, ease: "power3.inOut" })
        .call(function () { tl.play(); }, null, "<+.1");
    } else tl.play();
  }
  (d.fonts ? d.fonts.ready : Promise.resolve()).then(buildIntro);
  setTimeout(buildIntro, 1500);
  setTimeout(function () { root.classList.remove("intro", "curt"); if (tl && tl.paused()) tl.play(); }, 4500);
  var rz = 0, lw = innerWidth;
  addEventListener("resize", function () {
    clearTimeout(rz); rz = setTimeout(function () {
      if (!split || innerWidth === lw || (tl && tl.isActive())) return; lw = innerWidth;
      split.revert(); split = SplitText.create($(".surface h1"), { type: "lines", mask: "lines", linesClass: "ln" });
    }, 250);
  });

  /* мышиный параллакс фото 6–12 px: только мышь, засыпает в покое */
  if (FINE && !calm.matches) (function () {
    var tx = 0, ty = 0, x = 0, y = 0, run = 0;
    function loop() { x += (tx - x) * .08; y += (ty - y) * .08; lens.style.setProperty("--pmx", x.toFixed(2)); lens.style.setProperty("--pmy", y.toFixed(2)); run = Math.abs(tx - x) + Math.abs(ty - y) > .05 ? requestAnimationFrame(loop) : 0; }
    d.addEventListener("pointermove", function (e) { if (e.pointerType !== "mouse") return; tx = (e.clientX / innerWidth - .5) * -14; ty = (e.clientY / innerHeight - .5) * -10; if (!run) run = requestAnimationFrame(loop); }, { passive: true });
  })();

  /* ---------- курсор: капля-пузырь, над фото — линза ---------- */
  var PHOTO = ".lens,.stage figure,.fish-side figure,.tours-a,.tours-g figure,.band,.tech figure";
  (function () {
    if (!FINE) return;
    var dot = d.createElement("div"), ring = d.createElement("div"); dot.className = "cur-dot"; ring.className = "cur-ring";
    ring.innerHTML = '<i class="rg"></i><span class="lb"></span>'; d.body.append(dot, ring);
    var lb = $(".lb", ring), x = -100, y = -100, rx = x, ry = y, run = 0, kk = calm.matches ? 1 : .2, state = "";
    if (window.CSS && CSS.supports("backdrop-filter", "url(#lens)")) root.classList.add("svg-lens");
    function loop() {
      rx += (x - rx) * kk; ry += (y - ry) * kk;
      dot.style.transform = "translate3d(" + x + "px," + y + "px,0)"; ring.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0)";
      run = Math.abs(x - rx) + Math.abs(y - ry) > .15 ? requestAnimationFrame(loop) : 0;
    }
    function label(a) {
      if (a.dataset.cursor) return a.dataset.cursor;
      var h = a.getAttribute("href") || "";
      if (a.matches("[data-go]")) return "Этап";
      if (/^tel:/.test(h)) return "Позвонить"; if (/^mailto:/.test(h)) return "Написать";
      if (a.matches("summary")) return "Развернуть";
      if (a.matches(".btn,button,label")) return "";
      if (h.charAt(0) === "#") return "Перейти"; return "Открыть";
    }
    function classify(t) {
      if (t.closest("input,textarea,select")) { root.classList.add("cur-field"); return; } root.classList.remove("cur-field");
      var a = t.closest("a,button,summary,[data-go],label"), s, txt = "";
      if (a) { txt = label(a); s = txt ? "is-link" : "is-btn"; } else s = t.closest(PHOTO) ? "is-photo" : "";
      if (s + txt === state) return; state = s + txt;
      ring.className = "cur-ring " + s + (ring.classList.contains("is-down") ? " is-down" : ""); lb.textContent = txt;
    }
    d.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return; x = e.clientX; y = e.clientY; root.classList.add("cur-on");
      dot.style.transform = "translate3d(" + x + "px," + y + "px,0)"; if (!run) run = requestAnimationFrame(loop);
    }, { passive: true });
    d.addEventListener("pointerover", function (e) { if (e.pointerType === "mouse") classify(e.target); });
    d.addEventListener("pointerdown", function (e) { if (e.pointerType === "mouse") ring.classList.add("is-down"); });
    d.addEventListener("pointerup", function () { ring.classList.remove("is-down"); });
    root.addEventListener("mouseleave", function () { root.classList.remove("cur-on"); });
    root.addEventListener("mouseenter", function () { root.classList.add("cur-on"); });
  })();

  /* ---------- кнопки ---------- */
  $$(".btn").forEach(function (b) {
    if (!b.closest(".mbar") && !b.classList.contains("btn--ghost") && b.type !== "submit") b.classList.add("go");
    if (!FINE) return;
    var h = b.innerHTML; b.innerHTML = '<span class="bt"><span>' + h + '</span><span aria-hidden="true">' + h + "</span></span>";
    function pos(e) { var r = b.getBoundingClientRect(); b.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%"); b.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%"); }
    b.addEventListener("pointerenter", pos); b.addEventListener("pointerleave", pos);
    if (b.classList.contains("go") && !calm.matches) {
      var qx = g.quickTo(b, "x", { duration: .5, ease: "power3" }), qy = g.quickTo(b, "y", { duration: .5, ease: "power3" });
      b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .22); qy((e.clientY - r.top - r.height / 2) * .22); });
      b.addEventListener("pointerleave", function () { qx(0); qy(0); });
    }
  });
  /* тема заявки по кнопке */
  var topic = $("#f-topic");
  $$("[data-topic]").forEach(function (a) { a.addEventListener("click", function () { topic.value = a.dataset.topic; }); });
  /* отправка демо-формы: состояния кнопки (до обработчика kit) */
  var form = $("#request");
  form.addEventListener("submit", function (e) {
    if (form.dataset.go) return; e.preventDefault(); e.stopImmediatePropagation();
    var b = $("button[type=submit]", form); b.classList.add("sending"); b.innerHTML = '<i class="spin"></i><span>Отправляем…</span>';
    setTimeout(function () { form.dataset.go = 1; b.classList.remove("sending"); b.innerHTML = "<span>Готово</span>"; setTimeout(function () { form.requestSubmit(); }, 260); }, calm.matches ? 0 : 900);
  }, true);

  /* ---------- микро: подсветка за курсором, наклон ---------- */
  d.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return; var s = e.target.closest && e.target.closest("[data-spot]"); if (!s) return;
    var r = s.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    s.style.setProperty("--x", (px * r.width).toFixed(0) + "px"); s.style.setProperty("--y", (py * r.height).toFixed(0) + "px");
    if (s.hasAttribute("data-tilt") && !calm.matches) { s.style.setProperty("--ry", ((px - .5) * 6).toFixed(2) + "deg"); s.style.setProperty("--rx", (-(py - .5) * 5).toFixed(2) + "deg"); }
  }, { passive: true });
  d.addEventListener("pointerout", function (e) {
    var s = e.target.closest && e.target.closest("[data-tilt]"); if (s && !s.contains(e.relatedTarget)) { s.style.setProperty("--rx", "0deg"); s.style.setProperty("--ry", "0deg"); }
  });

  /* ---------- скролл: прогресс, параллакс, появления, строка ---------- */
  g.to(".progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: calm.matches ? true : .2 } });
  if (calm.matches) $$("[data-in]").forEach(function (e) { e.classList.add("in"); });
  else ScrollTrigger.batch("[data-in]", { start: "top 90%", once: true, onEnter: function (els) { els.forEach(function (e, k) { setTimeout(function () { e.classList.add("in"); }, k * 90); }); } });

  var mq = g.matchMedia();
  mq.add("(prefers-reduced-motion:no-preference)", function () {
    var imgs = $$(".tours-a img,.band img,.tech figure img,.fish-side figure img,.tours-g figure img");
    imgs.forEach(function (im) {
      im.classList.add("px");
      g.fromTo(im, { "--py": "-7%" }, { "--py": "7%", ease: "none", scrollTrigger: { trigger: im.closest("figure"), start: "top bottom", end: "bottom top", scrub: true } });
    });
    /* бегущая строка: одна на сайт; скорость и наклон от прокрутки */
    var mqi = $(".marq-in"), mx = 0, half = 1, vis = false;
    function msize() { half = mqi.scrollWidth / 2; } msize();
    ScrollTrigger.create({ trigger: ".marq", start: "top bottom", end: "bottom top", onToggle: function (s) { vis = s.isActive; } });
    function tick(t, dt) {
      if (!vis) return; mx -= (.55 + vel * .5) * dt / 16; if (mx < -half) mx += half;
      mqi.style.transform = "translate3d(" + mx.toFixed(1) + "px,0,0) skewX(" + Math.min(8, vel * .25).toFixed(2) + "deg)";
    }
    g.ticker.add(tick); addEventListener("resize", msize);
    return function () { g.ticker.remove(tick); removeEventListener("resize", msize); imgs.forEach(function (im) { im.classList.remove("px"); }); mqi.style.transform = ""; };
  });

  /* ---------- меню: бегунок под текущим разделом ---------- */
  var links = $$("[data-menu] a"), secs = links.map(function (a) { return $(a.hash); }), runner = $(".runner");
  function runTo() {
    var a = links.filter(function (l) { return l.hasAttribute("aria-current"); }).pop();
    if (!a || getComputedStyle(runner).display === "none") { runner.style.opacity = 0; return; }
    runner.style.width = (a.offsetWidth - 20) + "px"; runner.style.transform = "translateX(" + (a.offsetLeft + 10) + "px)"; runner.style.opacity = 1;
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { var a = links[secs.indexOf(e.target)]; if (e.isIntersecting) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    runTo();
  }, { rootMargin: "-45% 0px -54% 0px" });
  secs.forEach(function (s) { io.observe(s); });
  addEventListener("resize", runTo);

  /* клавиатура: фокус на кнопке hero возвращает наверх */
  surf.addEventListener("focusin", function () { if (scene && scrollY > innerHeight * .1) go(0, true); });
})();
