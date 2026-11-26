/* Схема квартала в изометрии и разрезе + выбор сети, тема заявки, копирование реквизитов. */
(function () {
  "use strict";
  var d = document, svg = d.getElementById("iso"), U = 40, W = 14, H = 10, T = 2.5;
  var $$ = function (s) { return [].slice.call(d.querySelectorAll(s)); };

  function P(x, y, z) { return [+((x - y) * .866 * U).toFixed(1), +(((x + y) * .5 - (z || 0)) * U).toFixed(1)]; }
  function pts(a) { return a.map(function (p) { return P(p[0], p[1], p[2]).join(","); }).join(" "); }
  function poly(a, fill, extra) { return '<polygon points="' + pts(a) + '" fill="' + fill + '" ' + (extra || "") + '/>'; }
  function line(cls, a, extra) { return '<polyline class="' + cls + '" points="' + pts(a) + '" ' + (extra || "") + '/>'; }

  function rect(x0, y0, x1, y1, fill, extra) { return poly([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], fill, extra); }
  /* дом: две видимые стены, крыша и окна */
  function house(x0, y0, x1, y1, h) {
    var k = 0, win = function () { return 'class="win' + (k++ % 5 === 2 ? ' lit' : '') + '"'; };
    var s = poly([[x0, y1, 0], [x1, y1, 0], [x1, y1, h], [x0, y1, h]], "#8FA6AD") +
      poly([[x1, y0, 0], [x1, y1, 0], [x1, y1, h], [x1, y0, h]], "#6B848C") +
      poly([[x0, y0, h], [x1, y0, h], [x1, y1, h], [x0, y1, h]], "#CBD8DA");
    for (var z = .35; z < h - .3; z += .55) {
      for (var x = x0 + .3; x < x1 - .4; x += .6) s += poly([[x, y1, z], [x + .3, y1, z], [x + .3, y1, z + .28], [x, y1, z + .28]], "#2B434C", win());
      for (var y = y0 + .3; y < y1 - .4; y += .6) s += poly([[x1, y, z], [x1, y + .3, z], [x1, y + .3, z + .28], [x1, y, z + .28]], "#22363E", win());
    }
    return s;
  }
  function tag(x, y, z, text, dx, dy) {
    var p = P(x, y, z), ex = p[0] + dx, ey = p[1] + dy;
    return '<g class="tag"><line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + ex + '" y2="' + ey + '"/><text x="' + ex + '" y="' + (ey + (dy < 0 ? -7 : 19)) + '" text-anchor="middle">' + text + '</text></g>';
  }
  /* runs идут по направлению движения среды: по ним же рисуется поток */
  function net(name, runs, ends, extra) {
    return '<g class="net n-' + name + '">' +
      runs.map(function (r) { return line("halo", r.a); }).join("") +
      runs.map(function (r, i) { return line("pipe" + (r.back ? " back" : ""), r.a, 'pathLength="1" style="--k:' + i + '"'); }).join("") +
      runs.map(function (r) { return line("flow", r.a); }).join("") +
      ends.map(function (e) { var p = P(e[0], e[1], e[2]); return '<circle class="end" cx="' + p[0] + '" cy="' + p[1] + '" r="9"/>'; }).join("") +
      extra + '</g>';
  }
  function node(x, y) { var p = P(x, y, 0); return '<ellipse class="node" cx="' + p[0] + '" cy="' + p[1] + '" rx="8" ry="5"/>'; }

  function draw() {
    var houses = [[.9, .8, 4.7, 3.2, 2.5], [5.9, .8, 8.9, 3.9, 3.3], [10.1, 1, 13.1, 3.6, 2]];
    var doors = [2.9, 7.5, 11.7], s = "";
    /* грунтовый блок: поверхность и два среза со слоями */
    s += rect(0, 0, W, H, "#22373F");
    [["#2D3F43", 0, .8], ["#263539", .8, 1.7], ["#1F2C30", 1.7, T]].forEach(function (l) {
      s += poly([[0, H, -l[1]], [W, H, -l[1]], [W, H, -l[2]], [0, H, -l[2]]], l[0]);
      s += poly([[W, 0, -l[1]], [W, H, -l[1]], [W, H, -l[2]], [W, 0, -l[2]]], l[0], 'style="filter:brightness(.82)"');
    });
    s += '<polyline points="' + pts([[0, H, 0], [W, H, 0], [W, 0, 0]]) + '" fill="none" stroke="#C9D6D6" stroke-width="2"/>';
    /* двор и проезд */
    s += rect(0, 4.5, W, 5.3, "#2D4851") + rect(5, .4, 5.6, 4.5, "#2D4851") + rect(9.3, .4, 9.8, 4.5, "#2D4851");
    for (var g = 2; g < W; g += 2) s += '<polyline points="' + pts([[g, 5.3, 0], [g, H, 0]]) + '" stroke="rgba(255,255,255,.07)" fill="none"/>';
    s = '<g class="lay">' + s + '</g>';
    houses.forEach(function (h, i) { s += '<g class="hs" style="--k:' + i + '">' + house.apply(null, h) + '</g>'; });

    function branches(off, main, z, outward) {
      return doors.map(function (x, i) {
        var a = [[x + off, main, z], [x + off, houses[i][3], z], [x + off, houses[i][3], 0]];
        return { a: outward ? a.reverse() : a };
      });
    }
    var heatBack = branches(-.35, 6.5, -.7, true);
    heatBack.forEach(function (r) { r.back = true; });
    s += net("drain",
      [{ a: [[doors[0] + .55, 8.9, -1.95], [W, 8.9, -1.95]] }].concat(branches(.55, 8.9, -1.95, true)),
      [[W, 8.9, -1.95]],
      [4.9, 9.6, 12.9].map(function (x) { return line("pipe", [[x, 8.9, -1.95], [x, 8.9, 0]]) + node(x, 8.9); }).join("") +
      tag(9.6, 8.9, 0, "Смотровой колодец", -90, 96) + tag(W, 8.9, -1.95, "Отвод стоков", 104, 14));
    s += net("water",
      [{ a: [[W, 7.7, -1.35], [doors[0] + .1, 7.7, -1.35]] }].concat(branches(.1, 7.7, -1.35, false)),
      [[W, 7.7, -1.35]],
      doors.map(function (x, i) { return node(x + .1, houses[i][3]); }).join("") +
      tag(7.6, 3.9, 0, "Ввод в дом", 150, -190) + tag(W, 7.7, -1.35, "Подача воды", 66, 56));
    s += net("heat",
      [{ a: [[W, 5.9, -.7], [doors[0] - .75, 5.9, -.7]] }, { a: [[doors[0] - .35, 6.5, -.7], [W, 6.5, -.7]], back: true }]
        .concat(branches(-.75, 5.9, -.7, false), heatBack),
      [[W, 5.9, -.7], [W, 6.5, -.7]],
      tag(5.2, 5.9, -.7, "Подающая труба", -200, -70) + tag(5.2, 6.5, -.7, "Обратная труба", -130, 108));
    svg.innerHTML = s;
  }
  if (svg) draw();

  var scene = d.getElementById("scheme"), buttons = $$("[data-set]");
  function pick(name) {
    if (scene.getAttribute("data-net") === name) return;
    scene.setAttribute("data-net", name);
    scene.classList.add("on", "built");
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-set") === name); });
    /* выбранная сеть прокладывается заново */
    $$("#iso .net").forEach(function (g) { g.classList.remove("draw"); });
    void svg.getBBox();
    $$(name === "all" ? "#iso .net" : "#iso .n-" + name).forEach(function (g) { g.classList.add("draw"); });
  }
  /* первый показ: грунт → дома → сети по очереди */
  if (svg) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { scene.classList.add("on"); io.disconnect(); setTimeout(function () { scene.classList.add("built"); }, 3800); } }, { threshold: .2 });
    io.observe(svg);
  }
  buttons.forEach(function (b) { b.addEventListener("click", function () { pick(b.getAttribute("data-set")); }); });
  $$("[data-pick]").forEach(function (a) { a.addEventListener("click", function () { pick(a.getAttribute("data-pick")); }); });
  $$("[data-subject]").forEach(function (a) { a.addEventListener("click", function () { d.getElementById("subject").value = a.getAttribute("data-subject"); }); });

  d.getElementById("copy").addEventListener("click", function () {
    var text = $$("#req > div").map(function (r) { return r.children[0].textContent + ": " + r.children[1].textContent; }).join("\n").replace(/ /g, " ");
    var out = d.getElementById("copied"), fail = function () { out.textContent = "Скопировать не получилось: выделите текст реквизитов вручную."; };
    if (!navigator.clipboard) return fail();
    navigator.clipboard.writeText(text).then(function () { out.textContent = "Реквизиты скопированы."; }, fail);
  });
})();
