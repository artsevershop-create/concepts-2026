/* Логика без анимации: календарь жителя, разбор квитанции (выбор строки), поиск офиса, подсветка меню. Работает и без GSAP. */
(function () {
  "use strict";
  var d = document, $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };

  /* ───── календарь месяца: окна показаний (15–25) и оплаты (до 15) ───── */
  (function cal() {
    var box = $("[data-cal]"); if (!box) return;
    var now = new Date(), y = now.getFullYear(), m = now.getMonth(), n = new Date(y, m + 1, 0).getDate(), t = now.getDate();
    var MON = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    box.style.setProperty("--n", n);
    for (var i = 1; i <= n; i++) {
      var c = d.createElement("i");
      if (i <= 15) c.className = "p";
      if (i >= 15 && i <= 25) c.className += " r";
      if (i === t) c.className += " t";
      if (i === 1 || i === 15 || i === 25 || i === n) c.dataset.d = i;
      box.appendChild(c);
    }
    $("[data-cal-month]").textContent = MON[m] + " " + y;
    var msg = t >= 15 && t <= 25 ? "идёт приём показаний" : t < 15 ? "срок оплаты за прошлый месяц" : "показания — с 15-го следующего месяца";
    $("[data-cal-today]").textContent = t + " число, " + msg;
  })();

  /* ───── разбор квитанции ───── */
  var rows = $$(".kv-row"), cards = $$(".kv-card"), dots = $$(".kv-steps li"), cur = 0;
  var KV = window.KV = { n: rows.length, i: 0, listeners: [], go: null };
  KV.set = function (i, quiet) {
    i = Math.max(0, Math.min(rows.length - 1, i)); if (i === cur && KV.ready) return; cur = KV.i = i; KV.ready = true;
    rows.forEach(function (r, k) { r.setAttribute("aria-selected", k === i); r.tabIndex = k === i ? 0 : -1; });
    cards.forEach(function (c, k) { c.classList.toggle("is-on", k === i); });
    dots.forEach(function (o, k) { o.classList.toggle("on", k <= i); });
    KV.listeners.forEach(function (f) { f(i, quiet); });
  };
  /* выбор пользователем: если сцена закреплена прокруткой — fx подставит KV.go (прокрутить к шагу) */
  function pick(i, focus) { if (KV.go && KV.go(i)) { } else KV.set(i); if (focus) rows[i].focus({ preventScroll: true }); }
  var narrow = matchMedia("(max-width:900px)");
  rows.forEach(function (r, k) {
    r.addEventListener("click", function () { pick(k); if (narrow.matches) $(".kv-panel").scrollIntoView({ behavior: "smooth", block: "nearest" }); });
    r.addEventListener("mouseenter", function () { if (!KV.go || !KV.pinned) KV.set(k); });
    r.addEventListener("keydown", function (e) {
      var to = { ArrowDown: k + 1, ArrowRight: k + 1, ArrowUp: k - 1, ArrowLeft: k - 1, Home: 0, End: rows.length - 1 }[e.key];
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(k); return; }
      if (to === undefined) return; e.preventDefault(); pick(Math.max(0, Math.min(rows.length - 1, to)), true);
    });
  });
  var back = $(".kv-back"); if (back) back.addEventListener("click", function () { rows[cur].scrollIntoView({ behavior: "smooth", block: "center" }); rows[cur].focus({ preventScroll: true }); });
  KV.set(0);

  /* ───── поиск офиса ───── */
  (function offices() {
    var data = window.OFFICES, list = $("#of-list"), q = $("#of-q"), chipsBox = $("#of-chips"), nEl = $("#of-n"); if (!data || !list) return;
    var who = "fz", terr = "", open = false, LIMIT = 8;
    var norm = function (s) { return s.toLowerCase().replace(/ё/g, "е").replace(/[«»"]/g, ""); };
    var TERR = ["Салехард", "Лабытнанги", "Ноябрьск", "Новый Уренгой", "Губкинский", "Муравленко", "Надымский р-н", "Пуровский р-н", "Приуральский р-н", "Ямальский р-н", "Шурышкарский р-н", "Тазовский р-н", "Красноселькупский р-н"];
    function chips() {
      chipsBox.textContent = "";
      TERR.forEach(function (t) {
        if (!data[who].some(function (o) { return o[0] === t; })) return;
        var b = d.createElement("button"); b.type = "button"; b.textContent = t; b.setAttribute("aria-pressed", t === terr);
        b.onclick = function () { terr = terr === t ? "" : t; open = false; chips(); draw(); };
        chipsBox.appendChild(b);
      });
    }
    function title(a) { /* «г. Салехард, ул. …» → заголовок = населённый пункт */
      var p = a.split(",").map(function (s) { return s.trim(); }), k = p.findIndex(function (s) { return /^(г\.|с\.|п\.|п\.г\.т\.)/.test(s); });
      if (k < 0) k = 0; return { t: p[k], rest: p.filter(function (_, j) { return j !== k; }).join(", ") };
    }
    function hl(text, qq) {
      var frag = d.createDocumentFragment(); if (!qq) { frag.textContent = text; return frag; }
      var i = norm(text).indexOf(qq); if (i < 0) { frag.textContent = text; return frag; }
      var m = d.createElement("mark"); m.textContent = text.slice(i, i + qq.length);
      frag.append(text.slice(0, i), m, text.slice(i + qq.length)); return frag;
    }
    function draw() {
      var qq = norm(q.value.trim());
      var res = data[who].filter(function (o) { return (!terr || o[0] === terr) && (!qq || norm(o[0] + " " + o[1]).indexOf(qq) >= 0); });
      list.textContent = "";
      var show = open ? res : res.slice(0, LIMIT);
      show.forEach(function (o) {
        var li = d.createElement("li"), h = title(o[1]), t = d.createElement("span"), a = d.createElement("span"), hr = d.createElement("span");
        t.className = "of-t"; t.appendChild(hl(h.t, qq)); a.className = "of-a"; a.appendChild(hl(h.rest, qq)); hr.className = "of-h"; hr.textContent = o[2];
        li.append(t, a, hr); list.appendChild(li);
      });
      if (!res.length) { var e = d.createElement("li"); e.className = "of-empty"; e.textContent = "Не нашли такой адрес. Проверьте написание или позвоните: 8 800 250-60-06 — подскажут ближайший офис."; list.appendChild(e); }
      if (res.length > show.length) {
        var mli = d.createElement("li"), b = d.createElement("button"); mli.className = "of-more of-empty"; b.type = "button"; b.className = "chip"; b.textContent = "Показать все: " + res.length;
        b.onclick = function () { open = true; draw(); }; mli.appendChild(b); list.appendChild(mli);
      }
      nEl.textContent = res.length ? "Адресов в списке: " + res.length + (who === "ul" ? " (юрлица)" : "") : "Ничего не найдено";
      d.dispatchEvent(new CustomEvent("of:draw"));
    }
    q.addEventListener("input", function () { open = false; draw(); });
    $$("input[name=who]").forEach(function (r) { r.addEventListener("change", function () { who = r.value; terr = ""; open = false; chips(); draw(); }); });
    var ulBtn = $("[data-of-ul]");
    if (ulBtn) ulBtn.addEventListener("click", function () {
      var r = $("input[name=who][value=ul]"); r.checked = true; r.dispatchEvent(new Event("change"));
      var t = $("#ofisy"); if (window.KIT && KIT.lenis) KIT.lenis.scrollTo(t, { offset: -70 }); else t.scrollIntoView({ behavior: "smooth" });
    });
    chips(); draw();
  })();

  /* ───── подсветка текущего раздела ───── */
  (function nav() {
    var links = $$(".hdr nav a"), run = $(".nav-run"), map = {};
    links.forEach(function (a) { map[a.hash.slice(1)] = a; });
    function mark(a) {
      links.forEach(function (x) { x.classList.toggle("on", x === a); if (x === a) x.setAttribute("aria-current", "true"); else x.removeAttribute("aria-current"); });
      if (!run) return; if (!a) { run.style.opacity = 0; return; }
      run.style.opacity = 1; run.style.width = (a.offsetWidth - 22) + "px"; run.style.transform = "translateX(" + (a.offsetLeft + 11) + "px)";
    }
    var vis = new Map();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis.set(e.target.id, e.isIntersecting ? e.intersectionRect.height : 0); });
      var best = null, bh = 0; vis.forEach(function (h, id) { if (h > bh) { bh = h; best = id; } });
      mark(best ? map[best] : null);
    }, { threshold: [0, .1, .25, .5, .75, 1], rootMargin: "-80px 0px -30% 0px" });
    Object.keys(map).forEach(function (id) { var s = d.getElementById(id); if (s) io.observe(s); });
  })();
})();
