/* Студия «Северный характер»: лапа-портал, следы на снегу, кейсы, календарь */
(function () {
  'use strict';
  var d = document, $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); }, K = window.KIT, P = window.PAW, C = window.CASES;
  d.documentElement.style.setProperty('--paw', 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + P.vb.join(' ') + '"><path d="' + P.mini + '"/></svg>') + '")');

  /* ---- лапа: шесть окон ---- */
  (function paw() {
    var shapes = [P.pad].concat(P.toes), s = '<svg viewBox="-12 -12 ' + (P.vb[0] + 24) + ' ' + (P.vb[1] + 24) + '" role="group" aria-label="Шесть работ"><defs><filter id="dep" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="13"/></filter>';
    shapes.forEach(function (p, i) { s += '<clipPath id="c' + i + '"><path d="' + p + '"/></clipPath>'; }); s += '</defs>';
    P.claws.forEach(function (p, i) { s += '<g class="st" style="--n:' + (6 + i) + '"><path class="claw" d="' + p + '"/></g>'; });
    C.slice().sort(function (a, b) { return a.w - b.w; }).forEach(function (c) {
      var b = P.box[c.w], bw = b[2] - b[0], bh = b[3] - b[1], h = bh * c.f[2], w = h * 1.6; if (w < bw * 1.12) { w = bw * 1.12; h = w / 1.6; }
      var x = (b[0] + b[2]) / 2 - w * c.f[0], y = (b[1] + b[3]) / 2 - h * c.f[1]; x = Math.min(b[0] - bw * .05, Math.max(b[2] + bw * .05 - w, x)); y = Math.min(b[1] - bh * .03, Math.max(b[3] + bh * .03 - h, y));
      s += '<a href="#' + c.k + '" data-k="' + c.k + '" aria-label="' + c.n + '. ' + c.t + '"><g class="st" style="--n:' + c.w + '"><g class="w"><g clip-path="url(#c' + c.w + ')"><rect x="' + b[0] + '" y="' + b[1] + '" width="' + bw + '" height="' + bh + '" fill="' + c.bg + '"/><g class="im"><g class="pan" style="--n:' + c.w + '"><image href="img/' + c.k + '-0.webp" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" preserveAspectRatio="none"/></g></g><path d="' + shapes[c.w] + '" fill="none" stroke="rgba(4,14,36,.75)" stroke-width="46" filter="url(#dep)"/></g><path class="rim" d="' + shapes[c.w] + '"/></g></g></a>';
    });
    $('#paw').insertAdjacentHTML('beforeend', s + '</svg>');
    var lab = $('.paw-l'), por = $('.portal'), busy = false;
    function show(c) { $('b', lab).textContent = c.n; $('span', lab).textContent = c.t; lab.classList.add('on'); }
    $$('#paw a').forEach(function (a) {
      var c = C.filter(function (q) { return q.k === a.dataset.k; })[0];
      ['pointerenter', 'focus'].forEach(function (e) { a.addEventListener(e, function () { show(c); }); }); a.addEventListener('pointerleave', function () { if (innerWidth > 900) lab.classList.remove('on'); }); a.addEventListener('blur', function () { if (innerWidth > 900) lab.classList.remove('on'); });
      a.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation(); if (busy) return; var t = $('#' + c.k), jump = function () { var y = t.getBoundingClientRect(), top = 0, n = t; // sticky: складываем высоты предыдущих секций
            top = $('#works').offsetTop; $$('.case').some(function (q) { if (q === t) return true; top += q.offsetHeight - parseFloat(getComputedStyle(q).getPropertyValue('--cut') || 0) * innerWidth / 100; });
            if (K.lenis) K.lenis.scrollTo(top + innerWidth * .05, { immediate: true, force: true }); else scrollTo(0, top + innerWidth * .05); history.replaceState(null, '', '#' + c.k); };
        if (K.REDUCED) return jump();
        busy = true; var r = a.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; por.style.cssText = 'visibility:visible;background-image:url(img/' + c.k + '-0.webp);clip-path:circle(' + Math.min(r.width, r.height) / 2.4 + 'px at ' + x + 'px ' + y + 'px)';
        por.animate([{ clipPath: 'circle(' + Math.min(r.width, r.height) / 2.4 + 'px at ' + x + 'px ' + y + 'px)' }, { clipPath: 'circle(' + Math.hypot(innerWidth, innerHeight) + 'px at ' + x + 'px ' + y + 'px)' }], { duration: 850, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' }).onfinish = function () { jump(); setTimeout(function () { por.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, fill: 'forwards' }).onfinish = function () { por.getAnimations().forEach(function (q) { q.cancel(); }); por.style.cssText = ''; busy = false; }; }, 180); };
      });
    });
    if (innerWidth <= 900) show(C[0]);
  })();

  /* ---- следы ---- */
  var mini = new Path2D(P.mini);
  function tracks(cv, host, o) {
    var x = cv.getContext('2d'), w = 0, h = 0, pr = [], last = null, side = 1, fl = [], auto = 0, moved = -1e9;
    function size() { var r = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; if (w < 20) return; cv.width = w * r; cv.height = h * r; x.setTransform(r, 0, 0, r, 0, 0); }
    function step(px, py, a) { side *= -1; pr.push({ x: px + Math.cos(a + Math.PI / 2) * 17 * side, y: py + Math.sin(a + Math.PI / 2) * 17 * side, a: a + Math.PI / 2, m: side, t: 0 }); if (pr.length > 46) pr.shift(); }
    function go(px, py) { if (!last) { last = [px, py]; return; } var dx = px - last[0], dy = py - last[1], L = Math.hypot(dx, dy); if (L < 62) return; if (L > 320) { last = [px, py]; return; } var n = Math.floor(L / 62), a = Math.atan2(dy, dx); for (var i = 1; i <= n; i++) step(last[0] + dx * i / n, last[1] + dy * i / n, a); last = [px, py]; }
    for (var i = 0; i < (o.flakes || 0); i++) fl.push({ x: i * .618 % 1, y: i * .414 % 1, s: .8 + i * .37 % 1 * 2, v: .018 + i * .21 % 1 * .03, f: i });
    host.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; var r = cv.getBoundingClientRect(); moved = performance.now(); go(e.clientX - r.left, e.clientY - r.top); }, { passive: true });
    size(); addEventListener('resize', size);
    function draw(t, dt) {
      if (w < 20) { size(); if (w < 20) return; } x.clearRect(0, 0, w, h);
      if (performance.now() - moved > 5000 || K.REDUCED) { auto += dt * .06; var A = o.route(auto / Math.max(w, 600), w, h); if (dt) go(A[0], A[1]); }
      if (K.REDUCED && !pr.length) { last = null; for (var q = 0; q < 1; q += .02) { var B = o.route(q, w, h); go(B[0], B[1]); } }
      pr = pr.filter(function (p) { p.t += dt; return p.t < 9000; });
      pr.forEach(function (p) { var k = (p.t < 120 ? p.t / 120 : 1) * (1 - Math.max(0, (p.t - 4500) / 4500)), s = o.size / P.vb[1]; if (K.REDUCED) k = 1; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.scale(s * p.m, s); x.translate(-P.vb[0] / 2, -P.vb[1] / 2); if (o.hi) { x.save(); x.translate(14, 18); x.globalAlpha = k; x.fillStyle = o.hi; x.fill(mini); x.restore(); } x.globalAlpha = k * o.al; x.fillStyle = o.col; x.fill(mini); x.restore(); });
      fl.forEach(function (f) { f.y += f.v * dt / 1000; if (f.y > 1.02) f.y = -.02; x.globalAlpha = .85; x.fillStyle = o.fc; x.beginPath(); x.arc((f.x + .012 * Math.sin(t / 2600 + f.f)) * w, f.y * h, f.s, 0, 6.3); x.fill(); }); x.globalAlpha = 1;
    }
    K.raf(cv, draw, 40);
  }
  tracks($('#snow'), $('.hero'), { size: 46, col: '#4B6C96', al: .34, hi: 'rgba(255,255,255,.95)', flakes: 60, fc: '#FFFFFF', route: function (p, w, h) { p %= 1.15; return [p * w * 1.02 - 30, h * (.9 + .045 * Math.sin(p * 9))]; } });
  tracks($('#trail'), $('.contact'), { size: 50, col: '#FFFFFF', al: .1, flakes: 46, fc: 'rgba(255,255,255,.7)', route: function (p, w, h) { p %= 1.2; return [w - p * w, h * (.16 + .5 * p + .05 * Math.sin(p * 8))]; } });

  /* ---- кейсы ---- */
  $$('.case').forEach(function (c) {
    var im = $$('.win img', c), b = $$('.feat button', c), cur = 0, tm = 0, vis = false, user = false;
    function go(i) { if (i === cur) return; im.forEach(function (x) { x.classList.remove('prev'); }); im[cur].classList.add('prev'); im[cur].classList.remove('on'); im[i].classList.add('on'); b.forEach(function (x, j) { x.setAttribute('aria-pressed', j === i); }); cur = i; }
    function play() { clearTimeout(tm); c.classList.remove('run'); if (!vis || user || K.REDUCED || K.still) return; void c.offsetWidth; c.classList.add('run'); tm = setTimeout(function () { go((cur + 1) % im.length); play(); }, 5200); }
    b.forEach(function (x, i) { x.addEventListener('click', function () { user = true; go(i); play(); }); x.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { user = true; go(i); play(); } }); });
    K.onView(c, function (v) { vis = v; if (v) { im.forEach(function (x) { x.loading = 'eager'; }); if (cur === 0 || !user) play(); } else clearTimeout(tm); }, { threshold: .35 });
  });

  /* ---- календарь ---- */
  var cal = $('.cal'), days = $$('.day[data-p]'); days.forEach(function (x, i) { x.style.setProperty('--k', i); $('i', x).style.setProperty('--a', (i % 2 ? 9 : -9) + 'deg'); });
  K.onView(cal, function (v) { if (v) { cal.classList.add('in'); setTimeout(function () { cal.classList.add('done'); }, 2800); } }, { threshold: .35 });
  $$('.ph button').forEach(function (b) { function on() { $$('.ph button').forEach(function (q) { q.classList.toggle('on', q === b); }); cal.classList.add('dim'); days.forEach(function (x) { x.classList.toggle('hi', x.dataset.p === b.dataset.ph); }); } b.addEventListener('pointerenter', on); b.addEventListener('focus', on); b.addEventListener('click', on); });
  $('.ph').addEventListener('pointerleave', function () { cal.classList.remove('dim'); days.forEach(function (x) { x.classList.remove('hi'); }); $$('.ph button').forEach(function (q) { q.classList.remove('on'); }); });

  /* ---- письмо ---- */
  $('#f').addEventListener('submit', function (e) { e.preventDefault(); var t = [], n = ''; new FormData(e.target).forEach(function (v, k) { if (String(v).trim()) t.push(k + ': ' + v); if (k === 'Компания') n = v; }); $('.hint').textContent = 'Открываем почту. Если не открылась, напишите на severmerch89@yandex.ru'; location.href = 'mailto:severmerch89@yandex.ru?subject=' + encodeURIComponent('Сайт для ' + n) + '&body=' + encodeURIComponent(t.join('\n')); });
})();
