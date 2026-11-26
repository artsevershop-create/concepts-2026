/* Расчёт ориентира по прайсу https://yamallogistic.ru/tarify («Цены действительны с 01.10.2026», руб., с НДС).
   Один источник цифр для калькулятора, таблиц и теста. */
(function (g) {
  "use strict";
  var T = {
    since: "01.10.2026",
    routes: {
      ml: { name: "Москва — Лабытнанги", days: "3–8", min: 2500, m3: 11000, kg: 55, from: "msk", to: "ynao", note: "2 суток в пути" },
      ms: { name: "Москва — Салехард", days: "4–9", min: 3000, m3: 12000, kg: 60, from: "msk", to: "incl", note: "а/д в адрес" },
      lm: { name: "Лабытнанги — Москва", days: "3–8", min: 2500, m3: 6000, kg: 30, from: "ynao", to: "msk", note: "2 суток в пути" },
      sm: { name: "Салехард — Москва", days: "5–9", min: 3000, m3: 7000, kg: 35, from: "incl", to: "msk", note: "а/з с адреса" }
    },
    /* автоэкспедирование: 8 ступеней по весу или объёму, берётся старшая */
    kgSteps: [50, 100, 300, 700, 1000, 2000, 3500], m3Steps: [0.5, 1, 3, 7, 10, 20, 35],
    exp: { ynao: [1000, 1500, 2000, 2500, 3500, 4500, 6000, 7500], msk: [2000, 2500, 3000, 3500, 5000, 6500, 9000, 12000] },
    expMax: { kg: 5000, m3: 50 },
    extra: 0.2
  };
  function expedition(zone, w, v) {
    if (w > T.expMax.kg || v > T.expMax.m3) return null; /* таблица заканчивается — по согласованию */
    var i = 0;
    while (i < 7 && (w >= T.kgSteps[i] || v >= T.m3Steps[i])) i++;
    return T.exp[zone][i];
  }
  /* o: {route, kg, m3, warm, fragile, oversize, pickup, delivery} */
  function calc(o) {
    var r = T.routes[o.route], w = +o.kg, v = +o.m3;
    if (!r || !isFinite(w) || !isFinite(v) || w < 0 || v < 0 || (!w && !v)) return null;
    var byKg = w * r.kg, byM3 = v * r.m3, base = Math.round(Math.max(r.min, byKg, byM3));
    var n = (o.warm ? 1 : 0) + (o.fragile ? 1 : 0) + (o.oversize ? 1 : 0);
    /* прайс не говорит, складываются несколько «+20 %» или перемножаются, поэтому при двух и более — вилка */
    var lo = Math.round(base * (1 + T.extra * n)), hi = Math.round(base * Math.pow(1 + T.extra, n));
    var exp = [], open = false;
    [["pickup", r.from, "Забор с адреса"], ["delivery", r.to, "Доставка до адреса"]].forEach(function (s) {
      if (!o[s[0]] || s[1] === "incl") return;
      var p = expedition(s[1], w, v);
      if (p === null) open = true; else { lo += p; hi += p; }
      exp.push({ label: s[2] + (s[1] === "msk" ? " в Москве" : " в Лабытнанги"), sum: p, zone: s[1] });
    });
    return { base: base, by: base === r.min && r.min >= Math.max(byKg, byM3) ? "min" : byM3 > byKg ? "m3" : "kg", n: n, lo: lo, hi: hi, exp: exp, open: open, partial: !w || !v, route: r };
  }
  g.YL = { T: T, calc: calc, expedition: expedition };
  if (typeof module !== "undefined") module.exports = g.YL;
})(typeof window !== "undefined" ? window : globalThis);
