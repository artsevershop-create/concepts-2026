/* Ямалкоммунэнерго: иней и солнце (WebGL), путь тепла (панорама), тепловая карта, искры */
(function () {
  'use strict';
  var d = document, $ = function (s) { return d.querySelector(s); }, K = window.KIT, NS = 'http://www.w3.org/2000/svg';
  var lerp = function (a, b, t) { return a + (b - a) * t; }, clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- 1. Герой: иней тает от солнца и от курсора ---------- */
  (function hero() {
    var c = $('#sun'), gl = c.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false }); if (!gl) { c.remove(); return; }
    var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var FS = [
      'precision highp float;uniform vec2 R;uniform float T,M;uniform vec3 S;uniform sampler2D H;',
      'float h2(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
      'float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}',
      'float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n2(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return s;}',
      /* перья инея: ячейки Вороного, вытянутые шумом */
      'float crys(vec2 p){p+=.55*vec2(fbm(p*1.3),fbm(p*1.3+7.));vec2 i=floor(p),f=fract(p);float a=9.,b=9.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(x,y),o=vec2(h2(i+g),h2(i+g+31.7));float q=length(g+o-f);if(q<a){b=a;a=q;}else if(q<b)b=q;}return 1.-smoothstep(0.,.16,b-a);}',
      'vec3 fire(float t){return mix(mix(vec3(.35,.05,.01),vec3(.93,.33,.06),smoothstep(0.,.45,t)),mix(vec3(1.,.62,.14),vec3(1.,.95,.74),smoothstep(.6,1.,t)),smoothstep(.35,.8,t));}',
      'void main(){vec2 uv=gl_FragCoord.xy/R,p=gl_FragCoord.xy/min(R.x,R.y),q=p-S.xy*R/min(R.x,R.y);float r=length(q),a=atan(q.y,q.x),rr=S.z;',
      'vec3 col=mix(vec3(.012,.04,.125),vec3(.03,.15,.34),smoothstep(1.,0.,uv.y));',
      'col+=vec3(.95,.38,.08)*.30*exp(-r*2.1)*M;',
            /* языки: кромка солнца с лучами, закрученными как на знаке */
      'float sw=a+.9*(r-rr)+.10*sin(T*.16),k=abs(fract(sw*14./6.28318+.06*sin(T*.3+a*3.))-.5)*2.;',
      'float k2=abs(fract((sw+.22)*14./6.28318)-.5)*2.;float len=rr*(.13+.30*pow(1.-k,1.25)+.13*pow(1.-k2,1.6)+.13*(fbm(vec2(a*3.,r*5.-T*.35))-.4));',
      'float cor=smoothstep(len,len*.12,r-rr)*step(rr*.985,r);float tex=fbm(vec2(cos(a),sin(a))*3.+vec2(r*7.-T*.28,T*.08));',
      'float edge=smoothstep(rr*1.75,rr,r);col=mix(col,fire(clamp(edge*.80+tex*.42-.20,0.,1.)),cor*(.35+.65*M));',
      'col+=fire(.55)*.5*exp(-max(0.,r-rr)*11.)*M*step(rr,r);',
      'float disk=smoothstep(rr,rr*.985,r);vec3 dc=mix(vec3(.02,.17,.40),vec3(.05,.38,.72),smoothstep(-rr,rr,q.y));dc+=vec3(1.,.5,.12)*.35*smoothstep(-.1*rr,-rr,q.y)*M;dc+=.06*fbm(q*9.+T*.05);col=mix(col,dc,disk);',
      'col=mix(col,vec3(1.,.83,.5),smoothstep(.010,0.,abs(r-rr))*.9*M);',
      /* иней */
      'float heat=texture2D(H,uv).r;float cr=crys(p*7.)*.6+crys(p*19.+3.)*.35;float f=fbm(p*3.+11.);',
      'float melt=heat*1.9+M*1.55*smoothstep(1.55,.05,r*1.05)+M*.62;float fr=clamp(1.32+.55*f-melt-.18*cr,0.,1.);',
      'fr*=mix(1.,.55,M*smoothstep(1.2,.2,r));float vig=smoothstep(.25,.95,length((uv-.5)*vec2(1.15,1.05))*1.35);fr=clamp(fr+M*vig*(.55+.35*f)-heat*1.2*M,0.,1.);',
      'vec3 ice=mix(vec3(.07,.24,.50),vec3(.80,.92,1.),clamp(cr*.75+f*.45,0.,1.));float dk=mix(.30,1.,smoothstep(.28,.66,uv.x));ice*=R.x>R.y?dk:1.;',
      'float wet=smoothstep(.02,.28,fr)*(1.-smoothstep(.28,.6,fr));col=mix(col,ice,fr*.86);col+=vec3(1.,.72,.35)*wet*.16*(.4+M);',
      'col+=fire(.55)*heat*.10;float tx=R.x>R.y?smoothstep(.62,.08,uv.x):0.;col=mix(col,vec3(.012,.05,.15),tx*.62*M);',
      'col+=(h2(gl_FragCoord.xy+fract(T))-.5)*.018;gl_FragColor=vec4(col,1.);}'].join('\n');
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(o)); return null; } return o; }
    var v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS); if (!v || !f) { c.remove(); return; }
    var pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); var l = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['R', 'T', 'M', 'S', 'H'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
    var hb = d.createElement('canvas'), hx = hb.getContext('2d'); hb.width = 128; hb.height = 80; hx.fillStyle = '#000'; hx.fillRect(0, 0, 128, 80);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture()); [[gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE], [gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR]].forEach(function (x) { gl.texParameteri(gl.TEXTURE_2D, x[0], x[1]); }); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    function size() { var w = c.clientWidth, h = c.clientHeight, k = w < 900 ? .8 : Math.min(.62, 1150 / w); c.width = Math.max(2, w * k | 0); c.height = Math.max(2, h * k | 0); gl.viewport(0, 0, c.width, c.height); }
    function spot(x, y, r, a) { var g = hx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,255,' + a + ')'); g.addColorStop(1, 'rgba(255,255,255,0)'); hx.globalCompositeOperation = 'lighter'; hx.fillStyle = g; hx.fillRect(x - r, y - r, r * 2, r * 2); hx.globalCompositeOperation = 'source-over'; }
    var px = -1, py = -1, lastMove = -1e9, t0 = performance.now(), M = K.REDUCED ? 1 : 0;
    var sec = c.parentElement; sec.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); px = (e.clientX - r.left) / r.width * 128; py = (e.clientY - r.top) / r.height * 80; lastMove = performance.now(); }, { passive: true });
    size(); addEventListener('resize', function () { size(); draw(T, 0); });
    var T = 0;
    function draw(t, dt) {
      T = t; if (!K.REDUCED) M = clamp((t - 250) / 3000, 0, 1); var m = M * M * (3 - 2 * M);
      hx.fillStyle = 'rgba(0,0,0,' + (dt ? .022 : 0) + ')'; hx.fillRect(0, 0, 128, 80);
      if (performance.now() - lastMove < 120) spot(px, py, 15, .16); else if (t > 4500) { var s = t / 1000; spot(64 + 52 * Math.sin(s * .17), 40 + 30 * Math.sin(s * .23 + 1), 11, .035); }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, hb);
      var mob = innerWidth <= 900; gl.uniform2f(U.R, c.width, c.height); gl.uniform1f(U.T, t / 1000); gl.uniform1f(U.M, m); var sy = mob ? 1 - innerHeight * .32 / c.clientHeight : .52; gl.uniform3f(U.S, mob ? .5 : .7, sy, mob ? .33 : .30); gl.uniform1i(U.H, 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    c.addEventListener('webglcontextlost', function (e) { e.preventDefault(); c.style.display = 'none'; });
    K.raf(c, draw, 30);
  })();

  /* ---------- 1а. Провода: кривая, упругая «струна», импульсы энергии (механика из макета ЭСКА) ---------- */
  function Grid(cv, host, opt) {
    var c = cv.getContext('2d'), W = 0, H = 0, N = 46, G = { wires: [] };
    function size() { var r = host.getBoundingClientRect(), k = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; if (W < 2) return; cv.width = W * k; cv.height = H * k; c.setTransform(k, 0, 0, k, 0, 0); }
    G.pt = function (w, t) { var u = 1 - t, k = w.k, s = Math.sin(Math.PI * t) * w.a + Math.sin(2 * Math.PI * t) * w.a2; return [u * u * u * k[0] + 3 * u * u * t * k[2] + 3 * u * t * t * k[4] + t * t * t * k[6] + s * w.nx, u * u * u * k[1] + 3 * u * u * t * k[3] + 3 * u * t * t * k[5] + t * t * t * k[7] + s * w.ny]; };
    G.add = function (w) { w.a = w.a2 = w.v = w.v2 = 0; w.p = []; G.wires.push(w); return w; };
    G.layout = function () { size(); G.wires.forEach(function (w) { w.k = w.geo(host.getBoundingClientRect()); if (!w.k) return; var dx = w.k[6] - w.k[0], dy = w.k[7] - w.k[1], l = Math.hypot(dx, dy) || 1; w.nx = -dy / l * (dx < 0 ? -1 : 1); w.ny = dx / l * (dx < 0 ? -1 : 1); }); };
    G.fire = function (w, sp, rgb) { if (K.REDUCED || K.still) { if (w.hit) w.hit(); return; } w.p.push({ t: 0, s: sp || .8, c: rgb || opt.rgb, d: 0 }); w.v += 60; w.v2 -= 30; };
    G.draw = function (t, dt) {
      if (W < 2) { G.layout(); if (W < 2) return; } dt = (dt || 0) / 1000; c.clearRect(0, 0, W, H); c.lineCap = 'round';
      G.wires.forEach(function (w, i) {
        if (!w.k) return; for (var z = Math.max(1, Math.ceil(dt * 90)), e0 = dt / z; z--;) { w.v += (-210 * w.a - 3.2 * w.v) * e0; w.a += w.v * e0; w.v2 += (-640 * w.a2 - 4.4 * w.v2) * e0; w.a2 += w.v2 * e0; } w.a = clamp(w.a, -46, 46); w.a2 = clamp(w.a2, -16, 16); // дробный шаг: при низком fps пружина не расходится
        var idle = K.REDUCED ? 0 : Math.sin((t || 0) / 1700 + i * 1.3) * opt.sway, P = [], j, q; w.a += idle; for (j = 0; j <= N; j++) P.push(G.pt(w, j / N)); w.a -= idle;
        c.beginPath(); P.forEach(function (p, n) { c[n ? 'lineTo' : 'moveTo'](p[0], p[1]); }); if (opt.under) { c.lineWidth = opt.w + 3; c.strokeStyle = opt.under; c.stroke(); } var g = c.createLinearGradient(w.k[0], w.k[1], w.k[6], w.k[7]), st = w.grad || opt.grad; st.forEach(function (s, n) { g.addColorStop(n / (st.length - 1), s); }); c.lineWidth = w.hot ? opt.w + 1.2 : opt.w; c.strokeStyle = g; c.globalAlpha = w.dim ? .35 : 1; c.stroke(); c.globalAlpha = 1;
        w.p = w.p.filter(function (p) { p.t += p.s * dt; if (p.t >= 1 && !p.d) { p.d = 1; if (w.hit) w.hit(); } return p.t < 1.22; });
        w.p.forEach(function (p) {
          for (j = 1; j <= N; j++) { q = j / N; var e = p.t - q; if (e < 0 || e > .22) continue; var al = 1 - e / .22; c.beginPath(); c.moveTo(P[j - 1][0], P[j - 1][1]); c.lineTo(P[j][0], P[j][1]); c.lineWidth = opt.w + al * 3.4; c.strokeStyle = 'rgba(' + p.c + ',' + al + ')'; c.stroke(); }
          if (p.t < 1) { var h = G.pt(w, p.t), r = c.createRadialGradient(h[0], h[1], 0, h[0], h[1], 28); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.16, 'rgba(' + p.c + ',.85)'); r.addColorStop(1, 'rgba(' + p.c + ',0)'); c.fillStyle = r; c.fillRect(h[0] - 28, h[1] - 28, 56, 56); }
        });
      });
    };
    var rt = 0; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { G.layout(); G.draw(0, 0); }, 90); });
    return G;
  }
  var rel = function (el, r) { var b = el.getBoundingClientRect(); return [b.left + b.width / 2 - r.left, b.top + b.height / 2 - r.top]; };

  (function heroWires() {
    var host = $('#hero'), G = Grid($('#wires'), host, { sway: 1.5, w: 2.2, under: 'rgba(3,10,30,.5)', rgb: '255,190,84', grad: ['#F4F9FF', '#FFD589', '#F7B25C', '#CFE6FF'] }), an = [].slice.call(host.querySelectorAll('.an')), inn = [].slice.call(host.querySelectorAll('.in')), li = [].slice.call(d.querySelectorAll('#terms li')), mob = function () { return innerWidth <= 900; }, out = [], inc = [];
    li.forEach(function (l, i) { var A = an[i]; out.push(G.add({ hit: function () { l.classList.add('lit'); }, geo: function (r) { var a = rel(A, r), m = mob(); if (m) return [a[0], a[1], a[0] - r.width * .12, a[1] + 26, r.width * .08, a[1] + 30 + i * 7, -30, a[1] + 6 + i * 8]; var b = l.querySelector('i').getBoundingClientRect(), x = b.left - r.left + 17, y = b.top - r.top, dx = a[0] - x; return [a[0], a[1], a[0] - dx * .16, a[1] + (y - a[1]) * .62, x + dx * .46, y + 10, x, y]; } })); });
    inn.forEach(function (A, i) { inc.push(G.add({ grad: ['#CFE6FF', '#FFD589', '#F4F9FF'], geo: function (r) { var a = rel(A, r), x = r.width + 40, y = a[1] - 46 + i * 16; return [x, y, x - (x - a[0]) * .33, (y + a[1]) / 2 + 64, x - (x - a[0]) * .66, (y + a[1]) / 2 + 66, a[0], a[1]]; } })); });
    function cycle(all) { inc.forEach(function (w, i) { setTimeout(function () { G.fire(w, 1.15, '150,208,255'); }, i * 130); }); out.forEach(function (w, i) { if (all || Math.random() < .5) setTimeout(function () { G.fire(w, .72); }, 820 + i * 240); }); }
    li.forEach(function (l, i) { var go = function () { G.fire(out[i], 1.25); out[i].hot = 1; }; l.addEventListener('pointerenter', go); l.addEventListener('focusin', go); ['pointerleave', 'focusout'].forEach(function (e) { l.addEventListener(e, function () { out[i].hot = 0; }); }); });
    // курсор задевает провод, он пружинит
    if (K.FINE && !K.REDUCED) { var px = null, py = null; host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; if (py !== null) G.wires.forEach(function (w) { var k = w.k; if (!k || x < Math.min(k[0], k[6]) || x > Math.max(k[0], k[6])) return; var lo = 0, hi = 1, n; for (n = 0; n < 12; n++) { var m = (lo + hi) / 2; if ((G.pt(w, m)[0] < x) === (k[0] < k[6])) lo = m; else hi = m; } var q = G.pt(w, lo)[1]; if ((py - q) * (y - q) < 0) w.v += clamp((y - py) * 9, -190, 190); }); px = x; py = y; }, { passive: true }); }
    function start() { G.layout(); G.draw(0, 0); } if (d.fonts) d.fonts.ready.then(start); start(); K.raf($('#wires'), G.draw, 40);
    if (K.REDUCED) li.forEach(function (l) { l.classList.add('lit'); }); else { setTimeout(function () { cycle(true); }, 1900); setInterval(function () { if (!d.hidden && !K.still && host.getBoundingClientRect().bottom > 200) cycle(false); }, 7000); if (mob()) li.forEach(function (l, i) { setTimeout(function () { l.classList.add('lit'); }, 2600 + i * 260); }); }
  })();

  /* ---------- 1б. Полёт вдоль линии электропередачи ---------- */
  (function lep() {
    var cv = $('#lep'), x = cv.getContext('2d'), W = 0, H = 0, k = 1, sec = $('#line'), li = [].slice.call(d.querySelectorAll('.lsteps li')), STEP = 46, NP = 15, ZT = STEP * (NP - 1) + 70, cur = 0, tgt = K.REDUCED ? .86 : 0, rnd = (function (a) { return function () { a = a * 16807 % 2147483647; return a / 2147483647; }; })(19);
    function size() { var r = Math.min(1.25, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; if (W < 2) return; cv.width = W * r; cv.height = H * r; x.setTransform(r, 0, 0, r, 0, 0); k = Math.max(H * 1.02, W * .62); }
    var bx = function (z) { return 15 + 7 * Math.sin(z / 150); }, cz = 0, cy = 5.4, cxx = 0, hor = .56;
    function pr(X, Y, Z) { var dz = Z - cz; if (dz < .8) dz = .8; return [W * .5 + (X - cxx) / dz * k, H * hor - (Y - cy) / dz * k, dz]; }
    // опора: [x,y,x,y] в плоскости; размеры в метрах сцены
    var ARM = [[13.2, 4.2], [17.4, 5.8], [21.2, 4.4]], T = []; (function () { var f = function (y) { return 2.5 - 2.15 * y / 24; }, ys = [0, 5, 9.4, 13.2, 17.4, 21.2, 24], s; T.push([-f(0), 0, -f(24), 24.6], [f(0), 0, f(24), 24.6], [-f(24), 24.6, f(24), 24.6]); for (s = 0; s < 6; s++) { var a = ys[s], b = ys[s + 1]; T.push([-f(a), a, f(b), b], [f(a), a, -f(b), b], [-f(b), b, f(b), b]); } ARM.forEach(function (q) { T.push([-q[1], q[0], q[1], q[0]], [-q[1], q[0], -f(q[0] + 1.5), q[0] + 1.5], [q[1], q[0], f(q[0] + 1.5), q[0] + 1.5]); }); })();
    var AT = []; ARM.forEach(function (q) { AT.push([-q[1], q[0] - 1.1], [q[1], q[0] - 1.1]); });
    var trees = [], i; for (i = 0; i < 230; i++) trees.push([(rnd() < .5 ? -1 : 1) * (26 + rnd() * 90), rnd() * (ZT + 60), 2.4 + rnd() * 4.6]);
    var stars = []; for (i = 0; i < 150; i++) stars.push([rnd(), rnd() * .52, .4 + rnd() * 1.1]);
    var town = []; for (i = 0; i < 17; i++) { var w = 5 + rnd() * 5, fl = 3 + (rnd() * 6 | 0); town.push({ x: -34 + i * 5.6 + rnd() * 2, z: ZT + 24 + rnd() * 34, w: w, f: fl, l: rnd() }); } town.sort(function (a, b) { return b.z - a.z; });
    // спрайты вместо градиентов в кадре: сияние и вспышки импульсов
    function spr(w, h, f) { var q = d.createElement('canvas'); q.width = w; q.height = h; f(q.getContext('2d')); return q; }
    var AU = ['80,255,190', '90,190,255', '150,130,255'].map(function (c) { return spr(1, 64, function (y) { var a = y.createLinearGradient(0, 0, 0, 64); a.addColorStop(0, 'rgba(' + c + ',0)'); a.addColorStop(.82, 'rgba(' + c + ',1)'); a.addColorStop(1, 'rgba(' + c + ',0)'); y.fillStyle = a; y.fillRect(0, 0, 1, 64); }); }), GL = ['130,205,255', '255,190,84'].map(function (c) { return spr(64, 64, function (y) { var a = y.createRadialGradient(32, 32, 0, 32, 32, 32); a.addColorStop(0, '#fff'); a.addColorStop(.25, 'rgba(' + c + ',.75)'); a.addColorStop(1, 'rgba(' + c + ',0)'); y.fillStyle = a; y.fillRect(0, 0, 64, 64); }); });
    function seg(a, b) { x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); }
    function draw(t, dt) {
      if (W < 2) { size(); if (W < 2) return; } var s = t / 1000; cur += (tgt - cur) * (K.REDUCED ? 1 : Math.min(1, (dt || 16) / 130)); cz = -24 + cur * (ZT - 40) + (K.REDUCED ? 0 : Math.sin(s * .2) * 1.2); cxx = bx(cz + 30) - 15 + (W > 900 ? 3 : 8); cy = 5.4 + 1.4 * Math.sin(cur * 3.1); hor = W > 900 ? .60 : .64;
      var g = x.createLinearGradient(0, 0, 0, H * hor); g.addColorStop(0, '#020a22'); g.addColorStop(.6, '#07265a'); g.addColorStop(1, '#1b5690'); x.fillStyle = g; x.fillRect(0, 0, W, H * hor + 2);
      stars.forEach(function (q) { x.globalAlpha = .35 + .35 * Math.sin(s * .6 + q[0] * 50); x.fillStyle = '#fff'; x.fillRect(q[0] * W, q[1] * H, q[2], q[2]); }); x.globalAlpha = 1;
      // сияние
      x.globalCompositeOperation = 'lighter'; for (var b = 0; b < 3; b++) { for (var u = 0; u <= W; u += 14) { var n = u / W, y0 = H * (.16 + .07 * b + .06 * Math.sin(n * 5 + s * .12 + b * 2) + .03 * Math.sin(n * 13 - s * .2)), hh = H * (.17 + .06 * Math.sin(n * 7 + s * .16 + b)), al = .10 * (.5 + .5 * Math.sin(n * 4 + b * 1.7 + s * .1)); x.globalAlpha = al; x.drawImage(AU[b], u, y0 - hh, 14, hh + 14); } } x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
      // снег
      g = x.createLinearGradient(0, H * hor, 0, H); g.addColorStop(0, '#2a639c'); g.addColorStop(.12, '#1c4c86'); g.addColorStop(1, '#0a2149'); x.fillStyle = g; x.fillRect(0, H * hor, W, H * (1 - hor));
      // город на горизонте
      var on = clamp((cur - .5) / .42, 0, 1), gp = pr(8, 0, ZT + 30), gr = clamp(26 / gp[2] * k, 40, W * .9); g = x.createRadialGradient(gp[0], gp[1], 0, gp[0], gp[1], gr * 1.5); g.addColorStop(0, 'rgba(255,168,66,' + (.12 + .5 * on) + ')'); g.addColorStop(1, 'rgba(255,150,50,0)'); x.fillStyle = g; x.fillRect(gp[0] - gr * 1.5, gp[1] - gr * 1.5, gr * 3, gr * 3);
      town.forEach(function (q, n) { var p0 = pr(q.x, 0, q.z), p1 = pr(q.x + q.w, q.f * 2.9 + 1.2, q.z), ww = p1[0] - p0[0], hh = p0[1] - p1[1]; if (ww < 1) return; x.fillStyle = ['#0c2a5c', '#10336d', '#0a2450'][n % 3]; x.fillRect(p0[0], p1[1], ww, hh); x.fillStyle = '#DCEBFA'; x.fillRect(p0[0], p1[1] - Math.max(1, hh * .02), ww, Math.max(1, hh * .02)); var nx = Math.max(2, q.w / 1.7 | 0), cw = ww / nx, ch = hh / (q.f + .4); if (cw < 1.2) return; for (var r = 0; r < q.f; r++) for (var m = 0; m < nx; m++) { var lit = on > ((n * 7 + r * 5 + m * 11) % 23) / 23 * .96; x.fillStyle = lit ? '#FFC765' : '#1c3d75'; x.fillRect(p0[0] + m * cw + cw * .24, p1[1] + (r + .3) * ch, cw * .52, ch * .52); } });
      // ёлки
      trees.forEach(function (q) { var z = q[1]; if (z < cz + 4 || z > cz + 230) return; var p = pr(q[0] + bx(z) - 15, 0, z), hh = q[2] / p[2] * k, al = clamp(1 - (p[2] - 60) / 170, .12, 1); x.fillStyle = 'rgba(6,24,56,' + al + ')'; x.beginPath(); x.moveTo(p[0], p[1] - hh); x.lineTo(p[0] + hh * .24, p[1]); x.lineTo(p[0] - hh * .24, p[1]); x.fill(); });
      // провода и опоры от дальних к ближним
      for (var n2 = NP - 1; n2 >= 0; n2--) {
        var z = n2 * STEP, near = z - cz; if (near > 300) continue; var ox = bx(z);
        if (n2 < NP) { var last = n2 === NP - 1, z2 = z + (last ? 100 : STEP), ox2 = last ? 9 : bx(z2), dy = last ? 1 : 0; if (z2 > cz + 1.5) AT.forEach(function (q, w) {
          var pts = [], m, ns = near > 130 ? 5 : 12; for (m = 0; m <= ns; m++) { var f = m / ns, zz = z + (z2 - z) * f; if (zz < cz + 1.4) continue; pts.push(pr(ox + (ox2 - ox) * f + q[0], q[1] - 11 * f * (1 - f) * (1 + .03 * Math.sin(s * 1.3 + w + n2)) - dy * f * (q[1] - 9), zz)); }
          if (pts.length < 2) return; var al = clamp(1.25 - (z - cz) / 250, .12, 1); x.beginPath(); pts.forEach(function (p, e) { x[e ? 'lineTo' : 'moveTo'](p[0], p[1]); }); x.lineWidth = clamp(70 / Math.max(6, near + 22), .9, 3.4); x.strokeStyle = 'rgba(190,220,255,' + .75 * al + ')'; x.stroke();
          // импульсы бегут вперёд, к городу
          if (!K.REDUCED && near < 190) for (var e = 0; e < 8; e++) { var pz = ((s * 74 + e * 100 + w * 41) % 800) - 40; if (pz < z || pz > z2 + 9) continue; var tr = []; for (m = 0; m < 9; m++) { var zf = pz - m * 1.9, f2 = (zf - z) / (z2 - z); if (f2 < 0 || f2 > 1 || zf < cz + 1.6) continue; tr.push(pr(ox + (ox2 - ox) * f2 + q[0], q[1] - 11 * f2 * (1 - f2) - dy * f2 * (q[1] - 9), zf)); } if (!tr.length) continue; var rgb = w % 2 ? '255,190,84' : '130,205,255', rr = clamp(.24 * k / tr[0][2], 1.2, 13); x.lineCap = 'round'; for (m = 1; m < tr.length; m++) { x.beginPath(); seg(tr[m - 1], tr[m]); x.lineWidth = clamp(rr * .62, 1, 7) * (1 - m / 10); x.strokeStyle = 'rgba(' + rgb + ',' + (1 - m / 9) + ')'; x.stroke(); } x.drawImage(GL[w % 2], tr[0][0] - rr * 3, tr[0][1] - rr * 3, rr * 6, rr * 6); }
        }); }
        if (near > 2.5) { var a = clamp(1.3 - near / 250, .14, 1), P = function (X, Y) { return pr(ox + X, Y, z); }; x.beginPath(); T.forEach(function (q) { seg(P(q[0], q[1]), P(q[2], q[3])); }); AT.forEach(function (q) { seg(P(q[0], q[1] + 1.1), P(q[0], q[1])); }); x.lineWidth = clamp(70 / near, .8, 5); x.strokeStyle = 'rgba(' + (near > 120 ? '126,168,220' : '222,236,252') + ',' + a + ')'; x.stroke(); var L = P(0, 24.9), lr = clamp(26 / near, 1.2, 9); x.fillStyle = 'rgba(255,120,60,' + (.55 + .45 * Math.sin(s * 1.6 + n2)) * a + ')'; x.beginPath(); x.arc(L[0], L[1], lr, 0, 6.3); x.fill(); }
      }
      // летящий снег
      if (!K.REDUCED) { x.fillStyle = 'rgba(255,255,255,.7)'; for (i = 0; i < 60; i++) { var sx = (i * .618 + s * .02 * (1 + i % 3)) % 1, sy = (i * .414 + s * .05 * (1 + i % 4 * .4)) % 1; x.fillRect(sx * W, sy * H, 1 + i % 3 * .7, 1 + i % 3 * .7); } }
      g = x.createLinearGradient(0, 0, W * .62, 0); g.addColorStop(0, 'rgba(3,12,36,.72)'); g.addColorStop(1, 'rgba(3,12,36,0)'); if (W > 900) { x.fillStyle = g; x.fillRect(0, 0, W * .62, H); } else { g = x.createLinearGradient(0, 0, 0, H * .5); g.addColorStop(0, 'rgba(3,12,36,.85)'); g.addColorStop(1, 'rgba(3,12,36,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H * .5); }
    }
    function upd() { if (K.REDUCED) return; var r = sec.getBoundingClientRect(); tgt = clamp(-r.top / (r.height - innerHeight), 0, 1); var n = tgt < .3 ? 0 : tgt < .7 ? 1 : 2; li.forEach(function (e, j) { e.classList.toggle('on', j === n); }); }
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', function () { size(); upd(); draw(9000, 0); }); size(); upd(); K.raf(cv, draw, 40);
  })();

  /* ---------- 1в. Подключение: провода от ресурсов к заявке ---------- */
  (function conWires() {
    var host = $('#conf'), G = Grid($('#cw'), host, { sway: .9, w: 2, rgb: '245,138,31', grad: ['#C9D6E8', '#C9D6E8'] }), lab = [].slice.call(host.querySelectorAll('.res label')), soc = $('.sock'), hex = function (c) { var n = parseInt(c.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255].join(); };
    lab.forEach(function (l) { var sp = l.querySelector('span'), col = sp.style.getPropertyValue('--c').trim(), rg = d.createRange(); G.add({ el: l, col: col, hit: function () { soc.style.setProperty('--rc', col); }, geo: function (r) { if (innerWidth <= 900) return null; rg.selectNodeContents(sp); var b = rg.getBoundingClientRect(), s = rel(soc, r), x = b.right - r.left + 22, y = b.top + b.height / 2 - r.top; return [x, y, x + (s[0] - x) * .4, y + 26, x + (s[0] - x) * .62, s[1] + 34, s[0], s[1]]; } }); });
    function sync(fire) { G.wires.forEach(function (w) { var on = w.el.querySelector('input').checked; w.hot = on; w.grad = on ? [w.col, w.col] : null; if (on && fire) { G.fire(w, 1.1, hex(w.col)); setTimeout(function () { G.fire(w, 1.1, hex(w.col)); }, 260); } if (on && K.REDUCED) soc.style.setProperty('--rc', w.col); }); }
    host.addEventListener('change', function (e) { if (e.target.name === 'Ресурс') { setTimeout(G.layout, 650); sync(true); } });
    lab.forEach(function (l, i) { l.addEventListener('pointerenter', function () { G.wires[i].v += 70; }); });
    if (d.fonts) d.fonts.ready.then(function () { G.layout(); sync(false); G.draw(0, 0); }); K.raf($('#cw'), G.draw, 40);
    K.onView(host, function (v) { if (v) { G.layout(); sync(true); } }, { threshold: .4 }); setInterval(function () { if (!d.hidden && !K.still && !K.REDUCED && innerWidth > 900) { var w = G.wires.filter(function (q) { return q.hot; })[0], r = host.getBoundingClientRect(); if (w && r.top < innerHeight && r.bottom > 0) G.fire(w, .9, hex(w.col)); } }, 2400);
    host.addEventListener('submit', function () { $('#cw').style.display = 'none'; });
  })();

  /* ---------- 2. Путь тепла: панорама, камера по прокрутке ---------- */
  (function flow() {
    var W = 4300, G = 596, s = [], rnd = (function (a) { return function () { a = a * 16807 % 2147483647; return a / 2147483647; }; })(77);
    function line(d0, o) { s.push('<path d="' + d0 + '" ' + (o || '') + '/>'); }
    function rect(x, y, w, h, o) { s.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" ' + (o || '') + '/>'); }
    s.push('<defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE4FA"/><stop offset=".12" stop-color="#5b86bd"/><stop offset="1" stop-color="#0a1f49"/></linearGradient><linearGradient id="bl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12376f"/><stop offset="1" stop-color="#0a2350"/></linearGradient><linearGradient id="hot" gradientUnits="userSpaceOnUse" x1="0" x2="' + W + '" y1="0" y2="0"><stop offset="0" stop-color="#FFE3A0"/><stop offset=".4" stop-color="#FFB13B"/><stop offset="1" stop-color="#F2701C"/></linearGradient><radialGradient id="sm"><stop offset="0" stop-color="#E7F2FF" stop-opacity=".75"/><stop offset="1" stop-color="#E7F2FF" stop-opacity="0"/></radialGradient><radialGradient id="warm"><stop offset="0" stop-color="#FFA63A" stop-opacity=".55"/><stop offset="1" stop-color="#FFA63A" stop-opacity="0"/></radialGradient><clipPath id="cp"><rect id="cpr" x="-50" y="-400" width="0" height="1300"/></clipPath></defs>');
    // дальние сопки и земля
    var far = 'M0 540'; for (var x = 0; x <= W; x += 120) far += 'L' + x + ' ' + (500 + Math.sin(x * .004) * 26 + Math.sin(x * .0113) * 14).toFixed(0); line(far + 'L' + W + ' 720L0 720Z', 'fill="#0a2757"');
    var gd = 'M0 ' + G; for (x = 0; x <= W; x += 200) gd += 'Q' + (x + 100) + ' ' + (G - 7 + rnd() * 12).toFixed(0) + ' ' + (x + 200) + ' ' + G;
    // ёлки вдали
    for (x = 40; x < W; x += 26 + rnd() * 60) { var h = 16 + rnd() * 30, y = 566 + rnd() * 10; line('M' + x.toFixed(0) + ' ' + (y - h).toFixed(0) + 'l' + (h * .26).toFixed(0) + ' ' + h.toFixed(0) + 'h-' + (h * .52).toFixed(0) + 'z', 'fill="#0d2f63"'); }
    // котельная
    rect(250, 426, 330, 170, 'fill="url(#bl)"'); line('M236 430 415 372 594 430Z', 'fill="#1b4a8c"'); for (var i = 0; i < 6; i++) rect(276 + i * 50, 470, 28, 54, 'class="win" data-x="' + (300 + i * 50) + '"');
    [[300, 170, 30], [380, 120, 34], [462, 196, 28]].forEach(function (k) { line('M' + (k[0] - k[2] / 2) + ' 400 L' + (k[0] - k[2] / 2 + 4) + ' ' + k[1] + 'h' + (k[2] - 8) + 'L' + (k[0] + k[2] / 2) + ' 400Z', 'fill="#23569c"'); for (var b = 0; b < 3; b++) rect(k[0] - k[2] / 2 + 3, k[1] + 12 + b * 40, k[2] - 6, 15, 'fill="' + (b % 2 ? '#EAF3FE' : '#F58A1F') + '"'); for (var q = 0; q < 3; q++) s.push('<g transform="translate(' + k[0] + ' ' + (k[1] - 4) + ')"><circle class="steam" r="34" fill="url(#sm)" style="animation-delay:-' + (q * 3 + k[0] % 7) + 's"/></g>'); });
    // трасса с П-образными компенсаторами
    function route(y) { var p = 'M560 ' + y, xs = [760, 1180, 1600]; xs.forEach(function (c) { var o = (y - 520) * 1; p += 'H' + (c - o) + 'V' + (430 + o * 0) + 'H' + (c + 120 + o) + 'V' + y; }); return p + 'H1950'; }
    var R1 = 'M560 520H760V430H880V520H1180V430H1300V520H1600V430H1720V520H1960', R2 = 'M560 542H782V452H858V542H1202V452H1278V542H1622V452H1698V542H1960';
    for (x = 620; x < 1960; x += 85) line('M' + x + ' 548V' + (G + 4) + 'M' + (x - 16) + ' 552h32', 'stroke="#2a558f" stroke-width="6" fill="none"');
    [R1, R2].forEach(function (r) { line(r, 'fill="none" stroke="#3a679f" stroke-width="13" stroke-linejoin="round"'); line(r, 'fill="none" stroke="#7fa6d2" stroke-width="2" stroke-linejoin="round" transform="translate(0 -4)"'); });
    // тепловой пункт
    rect(1950, 440, 210, 156, 'fill="url(#bl)"'); rect(1938, 428, 234, 16, 'fill="#23569c"'); s.push('<g class="wheel"><circle cx="2055" cy="516" r="38" fill="none" stroke="#F58A1F" stroke-width="7"/><path d="M2017 516h76M2055 478v76M2028 489l54 54M2082 489l-54 54" stroke="#F58A1F" stroke-width="5"/></g>');
    // электростанция и ЛЭП
    rect(2330, 452, 250, 144, 'fill="url(#bl)"'); line('M2330 452h250l-22-40h-206z', 'fill="#1b4a8c"'); for (i = 0; i < 4; i++) rect(2354 + i * 56, 486, 32, 40, 'class="win" data-x="' + (2370 + i * 56) + '"'); rect(2532, 250, 26, 164, 'fill="#23569c"'); rect(2532, 262, 26, 14, 'fill="#EAF3FE"');
    var tw = [2700, 3010, 3320], top = 214; tw.forEach(function (t) { line('M' + (t - 46) + ' ' + G + 'L' + (t - 10) + ' 190h20L' + (t + 46) + ' ' + G + 'M' + (t - 36) + ' 480h72M' + (t - 26) + ' 380h52M' + (t - 17) + ' 290h34M' + (t - 70) + ' ' + top + 'h140M' + (t - 52) + ' 262h104M' + (t - 36) + ' 480l62-100M' + (t + 36) + ' 480l-62-100M' + (t - 26) + ' 380l43-90M' + (t + 26) + ' 380l-43-90', 'stroke="#8fb4de" stroke-width="4" fill="none"'); });
    function wire(y0, y1, off) { var p = 'M2545 ' + (y0 + 60) + 'Q2620 ' + (y0 + 70) + ' ' + (tw[0] + off) + ' ' + y0; for (var j = 0; j < 2; j++) p += 'Q' + ((tw[j] + tw[j + 1]) / 2 + off) + ' ' + (y0 + 78) + ' ' + (tw[j + 1] + off) + ' ' + y0; return p + 'Q' + (3500 + off) + ' ' + (y0 + 80) + ' 3640 ' + y1; }
    var wires = [wire(214, 330, -66), wire(214, 330, 66), wire(262, 350, -48), wire(262, 350, 48)]; wires.forEach(function (w) { line(w, 'fill="none" stroke="#41699f" stroke-width="2.5"'); });
    // дома на сваях
    [[2180, 120, 5], [2840, 150, 4], [3130, 130, 5], [3420, 170, 7], [3640, 220, 9], [3890, 170, 6], [4090, 190, 8]].forEach(function (b, n) {
      var hh = b[2] * 38 + 18, y = G - 24 - hh; for (var px = b[0] + 8; px < b[0] + b[1]; px += 22) rect(px, G - 26, 6, 30, 'fill="#1a3e74"'); rect(b[0], y, b[1], hh, 'fill="' + ['#153e7c', '#1a4a8d', '#123569', '#1d5399', '#164483', '#1a4a8d', '#1d5399'][n] + '"'); rect(b[0] - 6, y - 8, b[1] + 12, 9, 'fill="#DCEBFA"');
      for (var r = 0; r < b[2]; r++) for (var q = 0; q < Math.floor((b[1] - 16) / 30); q++) rect(b[0] + 14 + q * 30, y + 16 + r * 38, 17, 21, 'class="win" data-x="' + (b[0] + q * 30 + r * 16 + 40) + '"'); });
    // подземный ввод к домам
    var R3 = 'M2160 566H4290', R4 = 'M2160 580H4290'; [R3, R4].forEach(function (r) { line(r, 'fill="none" stroke="#3a679f" stroke-width="8"'); });
    line(gd + 'V760H0Z', 'fill="url(#gr)"');
    // поток
    s.push('<g clip-path="url(#cp)"><g fill="none" stroke="url(#hot)" stroke-linejoin="round"><path d="' + R1 + '" stroke-width="9"/><path d="' + R2 + '" stroke-width="5" opacity=".75"/><path d="' + R3 + '" stroke-width="6"/></g><path class="pulse" d="' + R1 + '" fill="none" stroke="#FFF6DC" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path class="pulse" d="' + R3 + '" fill="none" stroke="#FFF6DC" stroke-width="3" stroke-linecap="round"/>' + wires.map(function (w) { return '<path d="' + w + '" fill="none" stroke="#7CC4FF" stroke-width="3"/><path class="pulse" d="' + w + '" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>'; }).join('') + '</g><ellipse id="head" cx="0" cy="525" rx="260" ry="200" fill="url(#warm)"/>');
    var box = $('.pano'); box.innerHTML = '<svg viewBox="0 0 ' + W + ' 720" width="' + W + '" height="720">' + s.join('') + '</svg>';
    var svg = box.firstChild, cpr = $('#cpr'), hd = $('#head'), wins = [].slice.call(box.querySelectorAll('.win')).map(function (w) { return { e: w, x: +w.dataset.x, on: 0 }; }), li = [].slice.call(d.querySelectorAll('.steps li')), sec = $('#flow'), rail = $('.rail');
    li[0].classList.add('on'); if (K.REDUCED) { cpr.setAttribute('width', W + 100); wins.forEach(function (w) { w.e.classList.add('lit'); }); return; }
    var cur = 0, tgt = 0, on = false, id = 0, TH = [0, .19, .42, .54, .76];
    function frame() {
      cur = Math.abs(tgt - cur) < .0004 ? tgt : lerp(cur, tgt, .16); var hgt = box.clientHeight, sc = hgt / 720, vw = innerWidth / sc, cam = cur * Math.max(0, W - vw), head = 430 + cur * (W - 360);
      box.style.transform = 'translate3d(' + (-cam * sc).toFixed(1) + 'px,0,0)'; cpr.setAttribute('width', (head + 50).toFixed(0)); hd.setAttribute('cx', head.toFixed(0)); rail.style.setProperty('--p', cur.toFixed(4));
      wins.forEach(function (w) { var v = head > w.x + 60; if (v !== w.on) { w.on = v; w.e.classList.toggle('lit', v); } });
      var k = 0; TH.forEach(function (t, i) { if (cur >= t) k = i; }); li.forEach(function (e, i) { e.classList.toggle('on', i === k); });
      id = on && (cur !== tgt) ? requestAnimationFrame(frame) : 0;
    }
    function upd() { var r = sec.getBoundingClientRect(); tgt = clamp(-r.top / (r.height - innerHeight), 0, 1); if (on && !id) id = requestAnimationFrame(frame); }
    K.onView(sec, function (v) { on = v; upd(); }); addEventListener('scroll', upd, { passive: true }); addEventListener('resize', function () { upd(); frame(); }); frame();
  })();

  /* ---------- 3. Филиалы и тепловая карта ---------- */
  var B = [
    ['Салехард', 'Исполнительная дирекция', 'г. Салехард, ул. Республики, д. 67, офис 600', '8 (34922) 3-99-63', '', 'office@id.yamalkomenergo.ru'],
    ['Губкинский', 'Филиал в городе Губкинский', 'г. Губкинский, мкр. 2‑й, д. 55', '8 (34936) 2-77-01', '5-42-68, 3-96-25', 'office@gb.yamalkomenergo.ru'],
    ['Красноселькуп', 'Филиал в селе Красноселькуп', 'с. Красноселькуп, ул. Энтузиастов, д. 8', '8 (34932) 2-22-88', '8 902 628-82-80', 'office@kr.yamalkomenergo.ru'],
    ['Лабытнанги', 'Филиал в городе Лабытнанги', 'г. Лабытнанги, ул. Карьерная, д. 9', '8 (34992) 5-17-95', '5-18-08', 'office@lb.yamalkomenergo.ru'],
    ['Муравленко', 'Филиал «Тепло» в городе Муравленко', 'г. Муравленко, ул. Губкина, д. 54', '8 (34938) 43-2-03', '43-2-10', 'office@mt.yamalkomenergo.ru'],
    ['Надым', 'Филиал в Надымском районе', 'г. Надым, проезд 13‑й, панель С', '8 (3499) 50-20-00', '50-20-71', 'office@nd.yamalkomenergo.ru', 'Надымский район'],
    ['Аксарка', 'Филиал в Приуральском районе', 'г. Салехард, ул. Республики, д. 62, оф. 82', '8 (34922) 3-71-00', '8 902 857-60-35', 'office@pr.yamalkomenergo.ru', 'Приуральский район'],
    ['Тарко-Сале', 'Филиал «Тепло» в Пуровском районе', 'г. Тарко‑Сале, ул. Геологов, д. 7, корп. 1', '8 (34997) 2-12-12', '8 904 874-26-56', 'office@pt.yamalkomenergo.ru', 'Пуровский район'],
    ['Тазовский', 'Филиал в Тазовском районе', 'п. Тазовский, ул. Геофизиков, д. 1', '8 (34940) 2-04-07', '2-04-24', 'office@tz.yamalkomenergo.ru', 'Тазовский район'],
    ['Мужи', 'Филиал в Шурышкарском районе', 'с. Мужи, ул. Уральская, д. 16 А', '8 (34994) 22-0-71', '2-15-55 или 05', 'office@sh.yamalkomenergo.ru', 'Шурышкарский район'],
    ['Яр-Сале', 'Филиал в Ямальском районе', 'с. Яр‑Сале, ул. Советская, д. 38', '8 (34996) 3-05-14', '3-04-05', 'office@ym.yamalkomenergo.ru', 'Ямальский район']
  ];
  var sel = 0, selT = 0, btns = [];
  function tel(t) { var a = d.createElement('a'); a.className = 'num'; a.textContent = t; a.href = 'tel:' + t.replace(/^8/, '+7').replace(/[^\d+]/g, ''); return a; }
  function pick(i, now, user) {
    sel = i; selT = now || performance.now(); var b = B[i]; btns.forEach(function (x, j) { x.setAttribute('aria-pressed', j === i); });
    $('#b-n').textContent = b[1]; $('#b-a').textContent = b[2]; $('#b-t').replaceChildren(tel(b[3])); $('#b-d').textContent = b[4] || 'в филиалах'; var m = d.createElement('a'); m.href = 'mailto:' + b[5]; m.textContent = b[5]; $('#b-e').replaceChildren(m);
    if (i && user) { $('#c-b').selectedIndex = i - 1; $('#a-b').selectedIndex = i; route(); }
  }
  B.forEach(function (b, i) {
    var x = d.createElement('button'); x.type = 'button'; x.textContent = i ? (b[6] || b[0]) : 'Салехард, дирекция'; x.addEventListener('click', function () { pick(i, 0, true); }); $('#brs').appendChild(x); btns.push(x);
    var o = d.createElement('option'); o.textContent = i ? (b[6] || b[0]) : 'Салехард'; if (i) $('#c-b').appendChild(o); var o2 = d.createElement('option'); o2.textContent = o.textContent; $('#a-b').appendChild(o2);
  });
  function route() { $('#c-to').textContent = B[$('#c-b').selectedIndex + 1][5]; } $('#c-b').addEventListener('change', route); route(); pick(0, -1e5);
  d.querySelectorAll('[data-topic]').forEach(function (a) { a.addEventListener('click', function () { $('#a-t').value = a.dataset.topic; }); });

  (function map() {
    var c = $('#ymap'), x = c.getContext('2d'), G = window.YGEO, P = G.pts, n = P.length / 2, S = B.map(function (b) { return G.c[b[0]]; }), D = new Float32Array(n * S.length), w = 0, h = 0, k = 1, ox = 0, oy = 0, hv = -1;
    for (var i = 0; i < n; i++) for (var j = 0; j < S.length; j++) D[i * S.length + j] = Math.hypot(P[i * 2] - S[j][0], P[i * 2 + 1] - S[j][1]);
    var LUT = []; for (i = 0; i < 48; i++) { var t = i / 47, a = t < .4 ? [[24, 68, 132], [150, 92, 96], t / .4] : t < .75 ? [[150, 92, 96], [245, 138, 31], (t - .4) / .35] : [[245, 138, 31], [255, 232, 170], (t - .75) / .25]; LUT.push('rgb(' + [0, 1, 2].map(function (q) { return lerp(a[0][q], a[1][q], a[2]) | 0; }) + ')'); }
    function size() { var r = Math.min(2, devicePixelRatio || 1); w = c.clientWidth; h = c.clientHeight; if (w < 20 || h < 20) return; c.width = w * r; c.height = h * r; x.setTransform(r, 0, 0, r, 0, 0); var bw = G.bbox[2] - G.bbox[0], bh = G.bbox[3] - G.bbox[1]; k = Math.min(w / bw, h / bh) * .98; ox = (w - bw * k) / 2 - G.bbox[0] * k; oy = (h - bh * k) / 2 - G.bbox[1] * k; }
    function draw(t) {
      if (w < 20) { size(); if (w < 20) return; } x.clearRect(0, 0, w, h); var T = t / 1000, age = K.REDUCED ? 9 : (performance.now() - selT) / 1000, ring = age * 26, bl = [], m = S.length, R = k * .5;
      for (var q = 0; q < 48; q++) bl.push([]);
      for (var i = 0; i < n; i++) { var v = 0; for (var j = 0; j < m; j++) { var dd = D[i * m + j], sg = j === sel ? 13 + 1.4 * Math.sin(T * 1.1) : 6.2 + .9 * Math.sin(T * .8 + j * 1.7); v += Math.exp(-dd * dd / (sg * sg)) * (j === sel ? 1 : .62); } var ds = D[i * m + sel] - ring; if (ring < 95) v += .55 * Math.exp(-ds * ds / 10) * (1 - ring / 95); bl[Math.min(47, Math.max(0, v * 47 | 0))].push(i); }
      for (q = 0; q < 48; q++) { if (!bl[q].length) continue; x.fillStyle = LUT[q]; x.beginPath(); var r = R * (.62 + q / 47 * .85); bl[q].forEach(function (i) { var X = P[i * 2] * k + ox, Y = P[i * 2 + 1] * k + oy; x.moveTo(X + r, Y); x.arc(X, Y, r, 0, 6.3); }); x.fill(); }
      x.textBaseline = 'middle'; S.forEach(function (s, j) { var X = s[0] * k + ox, Y = s[1] * k + oy, act = j === sel || j === hv; x.fillStyle = '#fff'; x.beginPath(); x.arc(X, Y, act ? 6 : 3.4, 0, 6.3); x.fill(); if (act) { x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 1.5; x.beginPath(); x.arc(X, Y, 12 + 2 * Math.sin(T * 2), 0, 6.3); x.stroke(); }
        if (act || w > 560) { x.font = (act ? '600 17px' : '500 14px') + ' "Golos Text",sans-serif'; var L = B[j][0], tw = x.measureText(L).width, lx = (j === 3 || j === 9 || X + tw + 18 > w) ? X - tw - 14 : X + 14, ly = Y + (j === 0 ? 15 : j === 6 ? -13 : j === 3 ? -9 : 0); x.lineWidth = 5; x.strokeStyle = 'rgba(4,17,48,.8)'; x.strokeText(L, lx, ly); x.fillStyle = act ? '#FFE3A0' : '#E6F1FF'; x.fillText(L, lx, ly); } });
    }
    function near(e) { var r = c.getBoundingClientRect(), X = e.clientX - r.left, Y = e.clientY - r.top, b = -1, bd = 34; S.forEach(function (s, j) { var q = Math.hypot(s[0] * k + ox - X, s[1] * k + oy - Y); if (q < bd) { bd = q; b = j; } }); return b; }
    c.addEventListener('click', function (e) { var b = near(e); if (b >= 0) pick(b, 0, true); }); c.addEventListener('pointermove', function (e) { hv = near(e); c.style.cursor = hv >= 0 ? 'pointer' : 'default'; });
    size(); addEventListener('resize', function () { size(); draw(0); }); if (d.fonts) d.fonts.ready.then(function () { draw(0); }); K.raf(c, draw, 24);
    // первый показ: волна тепла от Салехарда, дальше до клика филиалы подсвечиваются по очереди
    var seen = false, auto = 0; K.onView(c, function (v) { if (v && !seen) { seen = true; pick(0); if (!K.REDUCED) auto = setInterval(function () { if (K.still || d.hidden) return; pick((sel + 1) % B.length); }, 5200); } }, { threshold: .4 });
    ['click', 'focusin'].forEach(function (ev) { $('#map').addEventListener(ev, function () { clearInterval(auto); }); });
    $('#connect').addEventListener('pointerdown', function () { clearInterval(auto); }); $('#connect').addEventListener('focusin', function () { clearInterval(auto); });
  })();

  /* ---------- 4. Искры в подвале ---------- */
  (function ember() {
    var c = $('#ember'), x = c.getContext('2d'), w = 0, h = 0, p = [], i; function size() { w = c.width = Math.max(2, c.clientWidth / 2 | 0); h = c.height = Math.max(2, c.clientHeight / 2 | 0); }
    for (i = 0; i < 54; i++) p.push({ x: (i * .618) % 1, y: (i * .377) % 1, s: .5 + (i * .29 % 1) * 1.5, v: .012 + (i * .13 % 1) * .03, f: i });
    size(); addEventListener('resize', size);
    K.raf(c, function (t, dt) { x.clearRect(0, 0, w, h); x.globalCompositeOperation = 'lighter'; p.forEach(function (q) { q.y -= q.v * dt / 1000; if (q.y < -.02) q.y = 1.02; var X = (q.x + .02 * Math.sin(t / 3000 + q.f)) * w, Y = q.y * h, a = Math.min(1, (1 - q.y) * .3 + q.y) * .8, g = x.createRadialGradient(X, Y, 0, X, Y, q.s * 4); g.addColorStop(0, 'rgba(255,196,90,' + a * .9 + ')'); g.addColorStop(.35, 'rgba(245,120,30,' + a * .35 + ')'); g.addColorStop(1, 'rgba(245,100,20,0)'); x.fillStyle = g; x.fillRect(X - q.s * 4, Y - q.s * 4, q.s * 8, q.s * 8); }); }, 24);
  })();

  /* слабовидящим */
  var lv = $('.lv-btn'); function setLv(v) { d.documentElement.classList.toggle('lv', v); lv.setAttribute('aria-pressed', v); try { localStorage.setItem('yke-lv', v ? 1 : ''); } catch (e) { } }
  lv.addEventListener('click', function () { setLv(!d.documentElement.classList.contains('lv')); }); try { if (localStorage.getItem('yke-lv')) setLv(true); } catch (e) { }
})();
