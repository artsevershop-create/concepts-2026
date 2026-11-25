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
      var mob = innerWidth <= 900; gl.uniform2f(U.R, c.width, c.height); gl.uniform1f(U.T, t / 1000); gl.uniform1f(U.M, m); gl.uniform3f(U.S, mob ? .5 : .7, mob ? .68 : .48, mob ? .33 : .31); gl.uniform1i(U.H, 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    c.addEventListener('webglcontextlost', function (e) { e.preventDefault(); c.style.display = 'none'; });
    K.raf(c, draw, 30);
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
