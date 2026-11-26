/* Модели для подбора — только с карточек auto-mo.ru (ноябрь 2026). gvw — полная/разрешённая масса, кг (null — на карточке не указана).
   f — три ключевые цифры с карточки модели. id = имя фото в img/cars. */
window.AM_BRANDS = { foton: "Foton", jac: "JAC", dongfeng: "DongFeng", ambertruck: "Ambertruck", daewoo: "Daewoo", forland: "Forland" };
window.AM_TASKS = [
  { k: "city", t: "Развозка по городу", s: "Фургоны, изотермы, электрогрузовик" },
  { k: "cold", t: "Продукты и холод", s: "Рефрижераторы и изотермы на 14–18 паллет" },
  { k: "long", t: "Межгород и паллеты", s: "Шторно-бортовые и бортовые платформы" },
  { k: "build", t: "Стройка", s: "Самосвалы, бетоносмеситель, бетононасос" },
  { k: "crane", t: "Манипулятор", s: "Борт с краном-манипулятором (КМУ)" },
  { k: "tract", t: "Тягач", s: "Седельные тягачи 4×2" },
  { k: "util", t: "Коммунальная и спецтехника", s: "Мусоровозы, вакуумная, автовышка, эвакуатор" }
];
window.AM_MODELS = [
  { id: 7, task: "city", b: "foton", n: "Foton Toano 5,5 м, средняя крыша", gvw: 3500, f: ["3 500 кг полная масса", "150 л.с.", "цельнометаллический фургон"], u: "/catalog/foton/toano-55-m-srednyaya-krysha/" },
  { id: 53, task: "city", b: "dongfeng", n: "DongFeng K33", gvw: 3500, f: ["3 500 кг полная масса", "цельнометаллический фургон", "малотоннажная серия"], u: "/catalog/avtomobili-dongfeng/dongfeng-k33/" },
  { id: 1, task: "city", b: "foton", n: "Foton S35, изотермический фургон", gvw: 3500, f: ["8 паллет", "947 кг грузоподъёмность шасси", "150 л.с., кат. B"], u: "/catalog/foton/foton-s35-izotermicheskij-furgon/" },
  { id: 47, task: "city", b: "dongfeng", n: "DongFeng Z55, изотермический фургон", gvw: 3500, f: ["3 500 кг полная масса", "955 кг грузоподъёмность шасси", "140 л.с."], u: "/catalog/avtomobili-dongfeng/df-z55-izotermicheskij-furgon/" },
  { id: 60, task: "city", b: "ambertruck", n: "Ambertruck JM55S, промтоварный фургон", gvw: 3495, f: ["3 495 кг, категория B", "3 225 кг грузоподъёмность шасси", "120 л.с."], u: "/catalog/ambertruck/ambertruck-jm55s-promtovarnyj-furgon-4600x2300x2300/" },
  { id: 93, task: "city", b: "forland", n: "Forland 3, изотермический фургон", gvw: 3500, f: ["3 500 кг полная масса", "735 кг грузоподъёмность", "фургон 3690×2095×2075"], u: "/catalog/forland/izotermicheskij-furgon-forland-3/" },
  { id: 62, task: "city", b: "ambertruck", n: "Ambertruck EV 75, электрический", gvw: 7500, f: ["до 200 км запас хода", "5 030 кг грузоподъёмность шасси", "зарядка 80 кВт"], u: "/catalog/ambertruck/e-vi-ev-75/" },

  { id: 26, task: "cold", b: "jac", n: "JAC N90N, изотермический фургон", gvw: 8990, f: ["14 паллет", "8 990 кг полная масса", "6 170 кг грузоподъёмность шасси"], u: "/catalog/jac/jac-n90n-izotermicheskij-furgon/" },
  { id: 23, task: "cold", b: "foton", n: "Foton S120, рефрижератор", gvw: 12000, f: ["18 паллет", "12 000 кг полная масса", "166 л.с."], u: "/catalog/foton/refrizherator-foton-s120-7500x2600x2500-18-pallet/" },
  { id: 31, task: "cold", b: "jac", n: "JAC N120L, рефрижератор", gvw: 11980, f: ["18 паллет", "11 980 кг полная масса", "7 900 кг грузоподъёмность шасси"], u: "/catalog/jac/refrizherator-jac-n120l-7500x2590x2500-18-pallet/" },

  { id: 20, task: "long", b: "foton", n: "Foton D18, шторно-бортовой", gvw: 18000, f: ["18 000 кг полная масса", "22 000 кг автопоезд", "261 л.с."], u: "/catalog/foton/foton-d18-shtorno-bortovoj/" },
  { id: 37, task: "long", b: "jac", n: "JAC N120, шторно-бортовой", gvw: 11980, f: ["20 паллет", "11 980 кг полная масса", "кузов 8 500 мм"], u: "/catalog/jac/jac-n120-shtorno-bortovoj-20-pallet/" },
  { id: 67, task: "long", b: "ambertruck", n: "Ambertruck SM500, шторно-бортовой", gvw: 11990, f: ["11 990 кг полная масса", "7 592 кг грузоподъёмность шасси", "170 л.с."], u: "/catalog/ambertruck/ambertruck-sm500-shtorno-bortovoj/" },
  { id: 98, task: "long", b: "forland", n: "Forland 8, шторно-бортовой", gvw: null, f: ["152 л.с.", "кузов 6200×2480×2340"], u: "/catalog/forland/forland-8-shtorno-bortovoj/" },
  { id: 22, task: "long", b: "foton", n: "Foton S120, бортовая платформа", gvw: 12000, f: ["12 000 кг полная масса", "платформа 6 800 мм", "168 л.с."], u: "/catalog/foton/foton-s120-bortovaya-platforma-6800x2550x600/" },

  { id: 83, task: "build", b: "daewoo", n: "Daewoo CL7D7, самосвал 20 м³", gvw: 40000, f: ["20 м³ кузов", "40 000 кг полная масса шасси", "6×4"], u: "/catalog/Daewoo/samosval-cl7d7-20-m3-amkar/" },
  { id: 84, task: "build", b: "daewoo", n: "Daewoo CR8M7, самосвал 22 м³", gvw: 43000, f: ["22 м³ кузов", "43 000 кг полная масса шасси", "8×4, 440 л.с."], u: "/catalog/Daewoo/previous-next-samosval-cr8m7-22-amkar/" },
  { id: 74, task: "build", b: "daewoo", n: "Daewoo CL4DY, автобетоносмеситель 7 м³", gvw: 29500, f: ["7 м³ бетонной смеси", "29 500 кг полная масса шасси", "6×4, 410 л.с."], u: "/catalog/Daewoo/avtobetonosmesitel-cl4dy-7-m3/" },
  { id: 72, task: "build", b: "daewoo", n: "Daewoo CL8KR, автобетононасос KCP 37ZX5170", gvw: 31000, f: ["31 000 кг полная масса шасси", "6×4", "390 л.с."], u: "/catalog/Daewoo/avtobetononasos-cl8kr-kcp-37zx5170/" },

  { id: 38, task: "crane", b: "jac", n: "JAC N90, борт с КМУ HKTC 3014", gvw: 8990, f: ["8 990 кг полная масса", "6 170 кг грузоподъёмность шасси", "156 л.с."], u: "/catalog/jac/jac-n90-bortovoj-s-kmu-hktc-3014/" },
  { id: 48, task: "crane", b: "dongfeng", n: "DongFeng C120, борт с КМУ FG514", gvw: 11900, f: ["12,9 м высота подъёма", "11 900 кг полная масса", "166 л.с."], u: "/catalog/avtomobili-dongfeng/dongfeng-c120-bortovoj-s-kmu-fg514/" },
  { id: 80, task: "crane", b: "daewoo", n: "Daewoo CC6CT, борт с КМУ HKTC 7016L", gvw: 16600, f: ["22 м высота подъёма", "16 600 кг полная масса шасси", "270 л.с."], u: "/catalog/Daewoo/bortovaya-s-kmu-cc6ct-hktc-7016l/" },
  { id: 82, task: "crane", b: "daewoo", n: "Daewoo CL8KR, борт с КМУ Soosan SCS746", gvw: 31000, f: ["21,8 м высота подъёма", "31 000 кг полная масса шасси", "6×4, 390 л.с."], u: "/catalog/Daewoo/bortovaya-s-kmu-cl8kr-soosan-scs746/" },

  { id: 11, task: "tract", b: "foton", n: "Foton Auman EST A (BJ4189)", gvw: 18000, f: ["470 л.с.", "45 000 кг автопоезд", "4×2"], u: "/catalog/foton/auman-est-a-bj4189/" },
  { id: 21, task: "tract", b: "foton", n: "Foton Galaxy (1852 AMT)", gvw: null, f: ["520 л.с.", "автоматизированная КПП", "4×2"], u: "/catalog/foton/foton-galaxy-1852-amt/" },
  { id: 36, task: "tract", b: "jac", n: "JAC K7", gvw: 18000, f: ["490 л.с.", "18 000 кг полная масса", "4×2"], u: "/catalog/jac/jac-k7/" },
  { id: 50, task: "tract", b: "dongfeng", n: "DongFeng DFH4180", gvw: null, f: ["508 л.с.", "КПП Eaton, АМТ", "4×2"], u: "/catalog/avtomobili-dongfeng/dongfeng-dfh4180/" },

  { id: 28, task: "util", b: "jac", n: "JAC N90, мусоровоз EMI-8", gvw: null, f: ["8 м³ кузов", "5 920 кг грузоподъёмность", "156 л.с."], u: "/catalog/jac/musorovoz-s-zadnej-zagruzkoj-emi-8-na-shassi-jac-n90/" },
  { id: 34, task: "util", b: "jac", n: "JAC N200, мусоровоз EMI-15S", gvw: 19980, f: ["15 м³ кузов", "19 980 кг полная масса", "245 л.с."], u: "/catalog/jac/musorovoz-s-zadnej-zagruzkoj-emi-15s-na-shassi-jac-n200/" },
  { id: 49, task: "util", b: "dongfeng", n: "DongFeng C120, вакуумная машина", gvw: 11900, f: ["11 900 кг полная масса", "9 015 кг грузоподъёмность шасси"], u: "/catalog/avtomobili-dongfeng/dongfeng-c120-vakuumnaya-mashina/" },
  { id: 76, task: "util", b: "daewoo", n: "Daewoo CC4CT, автовышка Hansin 45 м", gvw: 12000, f: ["45 м рабочая высота", "300 кг в люльке", "270 л.с."], u: "/catalog/Daewoo/avtovyshka-cc4ct-hansin-45m/" },
  { id: 69, task: "util", b: "ambertruck", n: "Ambertruck JM93, эвакуатор", gvw: null, f: ["156 л.с.", "эвакуаторная платформа"], u: "/catalog/ambertruck/evakuator-ambertruck-jm93/" }
];
