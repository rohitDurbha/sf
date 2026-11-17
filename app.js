(() => {
  'use strict';
  const S = window.SITE, root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const sstep = (a, b, x) => { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const hash = (x, y) => {
    let n = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };
  let seed = 11;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
  const stops = S.stops, N = stops.length;


  /* =====================================================================
     WORLD. One unit is about 110 metres. The camera looks east, so north
     is on the left of the screen and the bay runs along the top.
     ===================================================================== */
  const GW = 132, GH = 141, FY = .4972, ZK = .8594, ZMAX = 520;
  const ll = (lat, lon) => [(lon + 122.52) / 0.165 * GW, (37.84 - lat) / 0.14 * GH];
  const toLL = (x, y) => [37.84 - y / GH * 0.14, x / GW * 0.165 - 122.52];

  /* ---------- map tiles ----------
     Isometric artwork (c) Justin Chavez, isometricsf.com, reused under CC BY-NC 4.0.
     A tile at zoom 10 is one cell of his grid, and each cell maps to the ground linearly. */
  const TILES = S.tiles || 'https://tiles.isometricsf.com/v1/art/{z}/{x}/{y}.webp';
  const T = { col0: -160, row0: -512, zmax: 10, size: 512, c0: -16, c1: 130, r0: -10, r1: 76 };
  const cellY = c => .90643 * c + 19.2364, cellX = r => 129.8229 - 1.82292 * r;

  const HEIGHT = { ferry: [3, 75], cranes: [3, 30], agents: [5, 326], route: [12, 30], beam: [74, 64], ladies: [70, 18], rings: [254, 298], park: [75, 25], beach: [5, 12], bridge: [67, 60], tower: [10, 40] };
  stops.forEach((s, i) => {
    const p = ll(s.at[0], s.at[1]), h = HEIGHT[s.scene] || HEIGHT.tower;
    s.i = i; s.cx = p[0]; s.cy = p[1]; s.a = 0; s.sx = 0; s.sy = 0;
    s.e = (s.elevation != null ? s.elevation : h[0]) / 110; s.top = s.e + (s.height != null ? s.height : h[1]) / 110;
  });
  const byScene = n => stops.find(s => s.scene === n);
  const sAg = byScene('agents'), sRoute = byScene('route'), sBeam = byScene('beam'), sRing = byScene('rings'), sPark = byScene('park'), sLad = byScene('ladies');
  const AGT = [[37.7897, -122.3972, 326], [37.7896, -122.3953, 245], [37.7906, -122.3961, 197], [37.7952, -122.4028, 260]].map(a => { const p = ll(a[0], a[1]); return [p[0], p[1], a[2] / 110]; });
  const BEAMPTS = Array.from({ length: 16 }, (_, k) => { const a = hash(k, 77) * TAU, r = 2.2 + hash(k, 191) * 4.2; return [Math.cos(a) * r, Math.sin(a) * r * .9, a]; });
  const HOT = [[-2, 1], [0, -1], [1, 1], [2, -1]], ROUTE = [[-3, 3], [-3, 0], [-1, 0], [-1, -2], [3, -2], [3, -3]];
  const LADIES = ['rose', 'butter', 'mint', 'sky', 'lilac', 'peach'];

  const LABELS = [];
  const lab = (lat, lon, text, kind, min, elev) => { const p = ll(lat, lon); LABELS.push({ x: p[0], y: p[1], z: (elev || 0) / 110, text, kind, min: min || 0 }); };
  [[37.7946, -122.3999, 'Financial District'], [37.7941, -122.4078, 'Chinatown'], [37.8005, -122.4105, 'North Beach'], [37.8011, -122.4194, 'Russian Hill'], [37.7928, -122.4165, 'Nob Hill'],
    [37.8022, -122.4370, 'Marina'], [37.7918, -122.4382, 'Pacific Heights'], [37.7945, -122.4662, 'Presidio'], [37.7795, -122.4860, 'Richmond'], [37.7545, -122.4900, 'Sunset'],
    [37.7692, -122.4481, 'Haight-Ashbury'], [37.7812, -122.4330, 'Western Addition'], [37.7836, -122.4145, 'Tenderloin'], [37.7775, -122.4060, 'SoMa'], [37.7706, -122.3920, 'Mission Bay'],
    [37.7585, -122.3890, 'Dogpatch'], [37.7590, -122.4005, 'Potrero Hill'], [37.7570, -122.4150, 'Mission'], [37.7625, -122.4350, 'Castro'], [37.7502, -122.4337, 'Noe Valley'],
    [37.7385, -122.4180, 'Bernal Heights'], [37.7330, -122.4330, 'Glen Park'], [37.7400, -122.4680, 'West Portal'], [37.7420, -122.4900, 'Parkside'], [37.7230, -122.4370, 'Excelsior'],
    [37.7310, -122.3890, 'Bayview'], [37.7275, -122.3700, 'Hunters Point'], [37.7150, -122.4040, 'Visitacion Valley'], [37.7760, -122.4235, 'Hayes Valley'], [37.7858, -122.4294, 'Japantown'],
    [37.7600, -122.4690, 'Inner Sunset'], [37.7230, -122.4600, 'Ingleside']].forEach(l => lab(l[0], l[1], l[2], 'hood', 13));
  [[37.7694, -122.4862, 'Golden Gate Park'], [37.7544, -122.4477, 'Twin Peaks', 270], [37.7230, -122.4940, 'Lake Merced'], [37.7190, -122.4190, 'McLaren Park', 100], [37.7835, -122.5060, 'Lands End', 60]].forEach(l => lab(l[0], l[1], l[2], 'park', 0, l[3]));
  [[37.8300, -122.4450, 'San Francisco Bay'], [37.7600, -122.5330, 'Pacific Ocean'], [37.8180, -122.4990, 'Golden Gate'], [37.7450, -122.3530, 'San Francisco Bay']].forEach(l => lab(l[0], l[1], l[2], 'water', 0));
  [[37.7952, -122.4028, 'Transamerica Pyramid'], [37.7793, -122.4193, 'City Hall'], [37.8029, -122.4484, 'Palace of Fine Arts'], [37.7786, -122.3893, 'Oracle Park'], [37.7680, -122.3877, 'Chase Center'],
    [37.8267, -122.4230, 'Alcatraz'], [37.8087, -122.4098, 'Pier 39'], [37.8080, -122.4177, "Fisherman's Wharf"], [37.8021, -122.4187, 'Lombard Street'], [37.7880, -122.4075, 'Union Square'],
    [37.7705, -122.5093, 'Dutch Windmill'], [37.7715, -122.4687, 'de Young Museum'], [37.7596, -122.4269, 'Dolores Park'], [37.8105, -122.4772, 'Fort Point'], [37.7325, -122.5030, 'San Francisco Zoo'],
    [37.7765, -122.3943, 'Caltrain'], [37.7620, -122.4350, 'Castro Theatre'], [37.8040, -122.4590, 'Crissy Field'], [37.7230, -122.4790, 'SF State'], [37.7699, -122.4661, 'Academy of Sciences'],
    [37.7858, -122.4010, 'SFMOMA']].forEach(l => lab(l[0], l[1], l[2], 'mark', 42, l[2] === 'Lombard Street' ? 60 : l[2] === 'Alcatraz' ? 30 : 0));

  /* =====================================================================
     COLORS
     ===================================================================== */
  const PAL = {
    water: [[45, 100, 117], [45, 100, 117]], tick: [[96, 158, 172], [22, 46, 64]], ink: [[20, 22, 28], [233, 234, 240]], white: [[255, 255, 255], [10, 14, 26]],
    lilac: [[167, 159, 234], [189, 182, 245]], mint: [[118, 200, 168], [163, 224, 199]], peach: [[238, 160, 124], [246, 194, 166]],
    sky: [[118, 172, 224], [168, 206, 240]], butter: [[236, 208, 100], [238, 221, 154]], rose: [[236, 140, 174], [242, 184, 204]]
  };
  const C = {}, CS = {};
  let dark = 0, darkT = 0, ready = false;
  const css = c => 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')';
  const rgba = (c, a) => 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + clamp(a, 0, 1).toFixed(3) + ')';
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const shade = (c, f) => [c[0] * f, c[1] * f, c[2] * f];
  function colors(d) { for (const k in PAL) { C[k] = mix(PAL[k][0], PAL[k][1], d); CS[k] = css(C[k]); } }

  /* =====================================================================
     DRAWING
     ===================================================================== */
  const cv = document.getElementById('map'), ctx = cv.getContext('2d');
  let zx = 1, zy = .5, zz = .62, ox = 0, oy = 0, X = 0, Y = 0, Z = 10;
  const setProj = (z, x0, y0) => { Z = z; zx = z; zy = z * FY; zz = z * ZK; ox = x0; oy = y0; };
  const pj = (x, y, z) => { X = y * zx + ox; Y = -x * zy - z * zz + oy; };
  const M = (x, y, z) => { pj(x, y, z); ctx.moveTo(X, Y); };
  const L = (x, y, z) => { pj(x, y, z); ctx.lineTo(X, Y); };
  function line3(pts, col, w) { ctx.beginPath(); for (let i = 0; i < pts.length; i++) { pj(pts[i][0], pts[i][1], pts[i][2] || 0); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); }
  function ring(cx, cy, z, r, col, w) { ctx.beginPath(); for (let k = 0; k <= 30; k++) { const a = k / 30 * TAU; pj(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z); k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); }
  function sq(x, y, z, r, col, edge) { pj(x, y, z); ctx.fillStyle = col; ctx.fillRect(X - r, Y - r, r * 2, r * 2); if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = 1.2; ctx.strokeRect(X - r, Y - r, r * 2, r * 2); } }
  /* a translucent block standing on the ground, with its corners given in world units */
  function block(q, z0, z1, col, a) {
    const top = rgba(col, a), side = rgba(shade(col, .78), a);
    ctx.fillStyle = side; ctx.beginPath(); M(q[3][0], q[3][1], z1); L(q[0][0], q[0][1], z1); L(q[0][0], q[0][1], z0); L(q[3][0], q[3][1], z0); ctx.fill();
    ctx.fillStyle = top; ctx.beginPath(); q.forEach((p, i) => i ? L(p[0], p[1], z1) : M(p[0], p[1], z1)); ctx.fill();
  }

  /* ---------- tile loading ---------- */
  const cache = new Map();
  function tile(z, x, y, want) {
    const k = z + '/' + x + '/' + y; let t = cache.get(k);
    if (!t && want) {
      t = { img: new Image(), ok: false, bad: false, used: 0 };
      t.img.decoding = 'async';
      t.img.onload = () => { t.ok = true; dirty = true; };
      t.img.onerror = () => { t.bad = true; };
      t.img.src = TILES.replace('{z}', z).replace('{x}', x).replace('{y}', y);
      cache.set(k, t);
      if (cache.size > 700) { let n = 0; for (const [kk, v] of cache) { if (v.used < frameNo - 240) { v.img.onload = v.img.onerror = null; v.img.src = ''; cache.delete(kk); if (++n > 200) break; } } }
    }
    return t;
  }
  let frameNo = 0;
  function drawTiles() {
    /* pick the tile level whose pixels are just at or above screen resolution */
    const cellPx = .90643 * Z * DPR, zt = clamp(Math.ceil(T.zmax + Math.log2(cellPx / T.size) - .2), 2, T.zmax);
    const vc0 = (-ox / zx - 19.2364) / .90643, vc1 = ((W - ox) / zx - 19.2364) / .90643;
    const xTop = oy / zy, xBot = (oy - H) / zy, vr0 = (129.8229 - xTop) / 1.82292, vr1 = (129.8229 - xBot) / 1.82292 + 6 * ZK / (1.82292 * FY);
    const c0 = Math.max(T.c0, vc0), c1 = Math.min(T.c1, vc1), r0 = Math.max(T.r0, vr0), r1 = Math.min(T.r1, vr1);
    if (c1 <= c0 || r1 <= r0) return;
    for (let z = Math.max(2, zt - 3); z <= zt; z++) {
      const n = Math.pow(2, T.zmax - z), want = z === zt || z === zt - 2 || z === Math.max(2, zt - 3);
      const x0 = Math.floor((c0 - T.col0) / n), x1 = Math.floor((c1 - T.col0) / n), y0 = Math.floor((r0 - T.row0) / n), y1 = Math.floor((r1 - T.row0) / n);
      for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
        const t = tile(z, tx, ty, want); if (!t) continue; t.used = frameNo; if (!t.ok) continue;
        const ca = T.col0 + tx * n, ra = T.row0 + ty * n;
        const sx = cellY(ca) * zx + ox, sy = -cellX(ra) * zy + oy, ex = cellY(ca + n) * zx + ox, ey = -cellX(ra + n) * zy + oy;
        ctx.drawImage(t.img, sx, sy, ex - sx + .6, ey - sy + .6);
      }
    }
  }

  /* =====================================================================
     CAMERA AND STATE
     ===================================================================== */
  let W = 0, H = 0, DPR = 1, mobile = false, dirty = true;
  const cam = { x: 62, y: 76, z: 10 };
  let fly = null, vx = 0, vy = 0, fx = 0, fy = 0, lastMove = 0;
  let cur = -1, plateOpen = true, lock = 1;
  const fitZ = () => mobile ? Math.min(W / 64, H / 96) : Math.min(W / 128, H / 76);
  const focus = () => [mobile ? W * .5 : (plateOpen ? W * .64 : W * .5), mobile ? (plateOpen ? H * .27 : H * .46) : H * .52];
  const pose = i => {
    if (i < 0) return mobile ? { x: 82, y: 62, z: fitZ() } : { x: 62, y: 78, z: fitZ() };
    const s = stops[i], base = mobile ? 105 : 150;
    const k = s.zoom || ({ bridge: .32, beach: .45, park: .4, ferry: .9, rings: .6, ladies: 1.7, route: 1, beam: .85, cranes: .7, agents: .62 })[s.scene] || 1;
    return { x: s.cx, y: s.cy + (s.scene === 'bridge' ? -6 : 0), z: base * k };
  };
  function clampCam() {
    cam.z = clamp(cam.z, fitZ() * .85, ZMAX);
    cam.x = clamp(cam.x, 3, GW - 3); cam.y = clamp(cam.y, 16, GH - 6);
  }
  function flyTo(p, dur) {
    const d = Math.hypot(p.x - cam.x, p.y - cam.y);
    fly = { x0: cam.x, y0: cam.y, z0: cam.z, x1: p.x, y1: p.y, z1: p.z, t0: performance.now(), dur: reduce ? 1 : (dur || clamp(1000 + d * 22, 1000, 2800)), d };
    vx = vy = 0; dirty = true;
  }
  function resize() {
    const w = document.documentElement.clientWidth || innerWidth, h = innerHeight, d = Math.min(2, devicePixelRatio || 1);
    if (w === W && h === H && d === DPR) return;
    const first = !W;
    W = w; H = h; DPR = d; mobile = W < 860;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    if (first) { const p = pose(-1); cam.x = p.x; cam.y = p.y; cam.z = p.z * .82; const f = focus(); fx = f[0]; fy = f[1]; flyTo(p, 1800); }
    dirty = true;
  }
  addEventListener('resize', resize);
  if (window.visualViewport) visualViewport.addEventListener('resize', resize);

  function isDark() { const a = root.getAttribute('data-theme'); return a ? a === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
  function readTheme() {
    darkT = isDark() ? 1 : 0;
    if (!ready) { dark = darkT; ready = true; }
    document.getElementById('theme-label').textContent = darkT ? 'Day' : 'Night';
    document.querySelector('#theme .glyph').classList.toggle('tri', !!darkT);
    document.getElementById('theme').setAttribute('aria-label', darkT ? 'Switch to the day map' : 'Switch to the night map');
    dirty = true;
  }
  document.getElementById('theme').addEventListener('click', () => { const next = isDark() ? 'light' : 'dark'; root.setAttribute('data-theme', next); try { localStorage.setItem('rd-sf-theme', next); } catch (e) {} });
  try { const v = localStorage.getItem('rd-sf-theme'); if (v === 'dark' || v === 'light') root.setAttribute('data-theme', v); } catch (e) {}
  new MutationObserver(readTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readTheme);


  /* =====================================================================
     PLATE
     ===================================================================== */
  const plate = document.getElementById('plate'), card = document.getElementById('card'), rail = document.getElementById('rail');
  const ext = 'target="_blank" rel="noopener"';
  const cells = (fill, of) => '<div class="cells" style="grid-template-columns:repeat(' + of + ',1fr)">' + Array.from({ length: of }, (_, i) => '<i' + (i < fill ? ' class="on"' : '') + '></i>').join('') + '</div>';
  const short = u => u.replace(/^https?:\/\/(www\.)?/, '');
  function cardHTML(i) {
    if (i < 0) return '<div class="bar px"><span class="glyph"></span><span>' + esc(S.hero.place) + '</span><span class="co">' + esc(S.hero.coords) + '</span><button type="button" data-act="close" aria-label="Hide this panel and roam the map">&times;</button></div>' +
      '<div class="body"><h1>' + esc(S.name) + '</h1><p class="lede">' + esc(S.hero.lede) + '</p><p>' + esc(S.hero.intro) + '</p>' +
      '<div class="actions"><button class="btn" type="button" data-act="next"><span class="glyph"></span>Start the walk</button>' +
      '<button class="btn" type="button" data-act="close"><span class="glyph"></span>Roam freely</button>' +
      '<a class="btn tri-first" href="' + esc(S.resume) + '" ' + ext + '><span class="glyph tri"></span>Read my resume</a></div><p class="hint">' + esc(S.hero.hint) + '</p></div>';
    const s = stops[i];
    let b = '<p class="kind">' + esc(s.kind) + '</p><h2>' + esc(s.title) + '</h2>';
    if (s.meta) b += '<p class="meta">' + esc(s.meta) + '</p>';
    (s.paragraphs || []).forEach(p => { b += '<p>' + esc(p) + '</p>'; });
    if (s.stats) b += '<dl class="stats">' + s.stats.map(x => '<div class="stat"><dd>' + esc(x.value) + '</dd><dt>' + esc(x.label) + '</dt>' + (x.fill != null ? cells(x.fill, x.of || 20) : '') + '</div>').join('') + '</dl>';
    if (s.groups) b += '<dl class="kit">' + s.groups.map(g => '<div><dt>' + esc(g.group) + '</dt><dd>' + esc(g.items) + '</dd></div>').join('') + '</dl>';
    if (s.items) b += '<ul class="rows">' + s.items.map(m => '<li>' + (m.url ? '<a class="row" href="' + esc(m.url) + '" ' + ext + '>' : '<div class="row">') + '<span class="glyph' + (m.url ? '' : ' tri') + '"></span><span class="name">' + esc(m.name) + '</span><span class="what">' + esc(m.what) + '</span>' + (m.url ? '</a>' : '</div>') + '</li>').join('') + '</ul>';
    if (s.footnote) b += '<p class="meta"><span class="glyph tri" style="margin-right:.6rem;color:var(--accent)"></span>' + esc(s.footnote) + '</p>';
    if (s.stack) b += '<p class="stack">' + esc(s.stack) + '</p>';
    if (s.link) b += '<a href="' + esc(s.link.url) + '" ' + ext + '>' + esc(s.link.label) + '</a>';
    if (s.contact) b += '<div class="links"><a href="mailto:' + esc(S.email) + '"><span class="glyph"></span>' + esc(S.email) + '</a>' +
      '<a href="' + esc(S.linkedin) + '" ' + ext + '><span class="glyph"></span>LinkedIn<small>' + esc(short(S.linkedin)) + '</small></a>' +
      '<a href="' + esc(S.github) + '" ' + ext + '><span class="glyph"></span>GitHub<small>' + esc(short(S.github)) + '</small></a>' +
      '<a href="' + esc(S.resume) + '" ' + ext + '><span class="glyph"></span>Resume<small>PDF</small></a></div>';
    return '<div class="bar px"><span class="glyph"></span><span>Stop ' + String(i + 1).padStart(2, '0') + ' of ' + String(N).padStart(2, '0') + '</span><span>' + esc(s.place) + '</span><span class="co">' + esc(s.coords) + '</span><button type="button" data-act="close" aria-label="Hide this panel and roam the map">&times;</button></div>' +
      '<div class="body">' + b + '</div><div class="nav"><button class="btn" type="button" data-act="prev"><span class="glyph tri" style="transform:rotate(-90deg)"></span>Back</button>' +
      (i < N - 1 ? '<button class="btn" type="button" data-act="next">Next stop<span class="glyph tri" style="transform:rotate(90deg)"></span></button>' : '<button class="btn" type="button" data-act="home">Back to the start</button>') +
      '</div>';
  }
  let swapT = 0;
  function show(i, opts) {
    opts = opts || {};
    const same = i === cur && plateOpen;
    cur = i; plateOpen = true; lock = 0;
    plate.classList.remove('closed', 'folded');
    clearTimeout(swapT);
    const put = () => { card.innerHTML = cardHTML(i); card.style.setProperty('--accent', i < 0 ? 'var(--ink)' : 'var(--' + stops[i].accent + ')'); card.classList.remove('out');
      const bd = card.querySelector('.body'); if (bd) bd.scrollTop = 0;
      if (!reduce) card.querySelectorAll('.cells i.on').forEach((b, k) => b.animate([{ opacity: .12, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 420, delay: 250 + k * 38, easing: 'cubic-bezier(.22,.8,.2,1)', fill: 'backwards' }));
      morph = 25; };
    if (same || !card.innerHTML || reduce) put(); else { card.classList.add('out'); swapT = setTimeout(put, 260); }
    [...rail.children].forEach((li, k) => li.firstChild.setAttribute('aria-current', k === i ? 'true' : 'false'));
    document.querySelector('#stops-btn').lastChild.textContent = i < 0 ? 'Start the walk' : 'Stop ' + (i + 1) + ' of ' + N;
    if (!opts.stay) flyTo(pose(i));
    try { history.replaceState(null, '', i < 0 ? location.pathname + location.search : '#' + stops[i].id); } catch (e) {}
    dirty = true;
  }
  function closePlate() { plateOpen = false; plate.classList.add('closed'); document.querySelector('#stops-btn').lastChild.textContent = cur < 0 ? 'Start the walk' : 'Show stop ' + (cur + 1); dirty = true; }
  card.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) { if (mobile && e.target.closest('.bar')) plate.classList.toggle('folded'); return; }
    const a = b.dataset.act;
    if (a === 'close') closePlate(); else if (a === 'next') show(Math.min(N - 1, cur + 1)); else if (a === 'prev') show(cur - 1); else if (a === 'home') show(-1);
  });
  rail.innerHTML = stops.map(s => '<li><button type="button" style="--accent:var(--' + esc(s.accent) + ')" aria-label="' + esc(s.place) + '"><span class="glyph"></span><span class="lbl chip">' + esc(s.place) + '</span></button></li>').join('');
  [...rail.children].forEach((li, k) => li.firstChild.addEventListener('click', () => show(k)));
  document.getElementById('me-name').textContent = S.name;
  document.getElementById('home').addEventListener('click', () => show(-1));
  document.getElementById('stops-btn').addEventListener('click', () => { if (!plateOpen) show(cur); else show(cur < 0 ? 0 : cur); });
  const zoomBy = (f, sx, sy) => { fly = null; const wx = -(sy - oy) / zy, wy = (sx - ox) / zx, z1 = clamp(cam.z * f, fitZ() * .85, ZMAX), k = cam.z / z1;
    cam.x = wx + (cam.x - wx) * k; cam.y = wy + (cam.y - wy) * k; cam.z = z1; clampCam(); lastMove = performance.now(); dirty = true; };
  let zoomAnim = null;
  const zoomStep = f => { zoomAnim = { z1: clamp(cam.z * f, fitZ() * .85, ZMAX) }; fly = null; dirty = true; };
  document.getElementById('z-in').addEventListener('click', () => zoomStep(1.7));
  document.getElementById('z-out').addEventListener('click', () => zoomStep(1 / 1.7));
  document.getElementById('z-fit').addEventListener('click', () => flyTo(pose(-1)));
  addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('input,textarea')) return;
    const step = 90 / cam.z;
    if (e.key === 'ArrowRight' && e.shiftKey || e.key === ']') show(Math.min(N - 1, cur + 1));
    else if (e.key === 'ArrowLeft' && e.shiftKey || e.key === '[') show(Math.max(-1, cur - 1));
    else if (e.key === 'Escape') closePlate();
    else if (e.key === 'ArrowLeft') { fly = null; cam.y -= step; }
    else if (e.key === 'ArrowRight') { fly = null; cam.y += step; }
    else if (e.key === 'ArrowUp') { fly = null; cam.x += step / FY; }
    else if (e.key === 'ArrowDown') { fly = null; cam.x -= step / FY; }
    else if (e.key === '+' || e.key === '=') zoomStep(1.5); else if (e.key === '-') zoomStep(1 / 1.5); else return;
    clampCam(); lastMove = performance.now(); dirty = true;
  });

  /* =====================================================================
     ROAMING: drag, wheel and pinch
     ===================================================================== */
  const ptrs = new Map();
  let mx = -9999, my = -9999, hover = -1, downAt = null, dragged = false, pinch = 0;
  cv.addEventListener('pointerdown', e => {
    cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptrs.size === 1) { downAt = [e.clientX, e.clientY]; dragged = false; vx = vy = 0; }
    if (ptrs.size === 2) { const p = [...ptrs.values()]; pinch = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); dragged = true; }
    fly = null; zoomAnim = null;
  });
  cv.addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    const p = ptrs.get(e.pointerId);
    if (!p) { dirty = true; return; }
    const dx = e.clientX - p[0], dy = e.clientY - p[1]; p[0] = e.clientX; p[1] = e.clientY;
    if (ptrs.size === 2) {
      const q = [...ptrs.values()], d = Math.hypot(q[0][0] - q[1][0], q[0][1] - q[1][1]);
      if (pinch > 0) zoomBy(d / pinch, (q[0][0] + q[1][0]) / 2, (q[0][1] + q[1][1]) / 2);
      pinch = d; return;
    }
    if (!dragged && downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 5) return;
    dragged = true; cv.classList.add('drag');
    const wx = -dy / zy, wy = dx / zx;
    cam.x -= wx; cam.y -= wy; vx = lerp(vx, -wx, .5); vy = lerp(vy, -wy, .5);
    clampCam(); lastMove = performance.now(); dirty = true;
  });
  const up = e => {
    ptrs.delete(e.pointerId); cv.classList.remove('drag'); pinch = 0;
    if (!dragged && downAt && e.type === 'pointerup') {
      let best = 30 * 30, hit = -1;
      stops.forEach(s => { const dx = e.clientX - s.sx, dy = e.clientY - s.sy, d = dx * dx + dy * dy; if (d < best) { best = d; hit = s.i; } });
      if (hit >= 0) show(hit);
    }
    if (e.pointerType !== 'mouse') { mx = my = -9999; }
    downAt = null; dirty = true;
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('pointerleave', () => { mx = my = -9999; dirty = true; });
  cv.addEventListener('wheel', e => { e.preventDefault(); zoomAnim = null; zoomBy(Math.exp(-e.deltaY * (e.ctrlKey ? .012 : .0016)), e.clientX, e.clientY); }, { passive: false });
  cv.addEventListener('dblclick', e => { zoomBy(1.8, e.clientX, e.clientY); });


  /* =====================================================================
     FRAME
     ===================================================================== */
  const tip = document.getElementById('tip'), hereEl = document.getElementById('here');
  let morph = 25, lastHere = '';
  const t0 = performance.now();
  const placed = [];
  function label(x, y, z, text, font, col, halo, centre) {
    pj(x, y, z || 0);
    if (X < -80 || X > W + 80 || Y < 56 || Y > H - 24) return false;
    ctx.font = font; const w = ctx.measureText(text).width, bx = centre ? X - w / 2 : X + 8, by = Y - 9;
    for (const p of placed) if (bx < p[2] && bx + w > p[0] && by < p[3] && by + 18 > p[1]) return false;
    placed.push([bx - 6, by - 4, bx + w + 6, by + 22]);
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = halo; ctx.strokeText(text, bx, Y); ctx.fillStyle = col; ctx.fillText(text, bx, Y);
    return true;
  }
  const ROT = -8 * Math.PI / 180, RC = Math.cos(ROT), RS = Math.sin(ROT);

  function frame(now) {
    requestAnimationFrame(frame);
    frameNo++;
    const t = reduce ? 6 : (now - t0) / 1000;
    let anim = false;
    if (fly) { const u = clamp((now - fly.t0) / fly.dur, 0, 1), e = sstep(0, 1, u);
      cam.x = lerp(fly.x0, fly.x1, e); cam.y = lerp(fly.y0, fly.y1, e);
      cam.z = Math.exp(lerp(Math.log(fly.z0), Math.log(fly.z1), e)) * (1 - Math.min(.55, fly.d * .014) * Math.sin(Math.PI * e));
      anim = true; if (u >= 1) fly = null; }
    else if (zoomAnim) { const f = Math.exp((Math.log(zoomAnim.z1) - Math.log(cam.z)) * (reduce ? 1 : .18)); zoomBy(f, fx, fy); anim = true; if (Math.abs(Math.log(cam.z / zoomAnim.z1)) < .004) zoomAnim = null; }
    else if (!ptrs.size && (Math.abs(vx) > .0004 || Math.abs(vy) > .0004)) { cam.x += vx; cam.y += vy; vx *= .9; vy *= .9; clampCam(); anim = true; }
    const f = focus(); if (Math.abs(f[0] - fx) > .5 || Math.abs(f[1] - fy) > .5) { fx += (f[0] - fx) * (reduce ? 1 : .12); fy += (f[1] - fy) * (reduce ? 1 : .12); anim = true; }
    const themeMove = Math.abs(darkT - dark) > .004;
    dark = themeMove ? dark + (darkT - dark) * (reduce ? 1 : .07) : darkT;
    if (reduce && !dirty && !anim && !themeMove) return;
    dirty = false;
    colors(dark);
    stops.forEach(s => { s.a += ((s.i === cur && plateOpen ? 1 : 0) - s.a) * (reduce ? 1 : .05); });
    lock = Math.min(1, lock + (reduce ? 1 : .03));

    setProj(cam.z, fx - cam.y * cam.z, fy + cam.x * cam.z * FY);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = CS.water; ctx.fillRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    drawTiles();
    if (dark > .01) { ctx.fillStyle = 'rgba(6,10,24,' + (.6 * dark).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
    ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
    const ui = clamp(Z / 150, .55, 1.5);

    /* live overlays for the stops */
    if (sRoute && sRoute.a > .01) { const s = sRoute, a = s.a, e = s.e, wp = p => { const lx = p[0] * 1.14, ly = p[1] * .78 - 1.2; return [s.cx + lx * RC - ly * RS, s.cy + lx * RS + ly * RC, e]; };
      HOT.forEach((o, k) => { const q = [[o[0] + .1, o[1] + .12], [o[0] + .9, o[1] + .12], [o[0] + .9, o[1] + .88], [o[0] + .1, o[1] + .88]].map(wp); block(q, e, e + .3 + .1 * Math.sin(t * 2.4 + k), C.rose, a * (.45 + .25 * Math.sin(t * 2.4 + k))); });
      ctx.setLineDash([Z * .05, Z * .07]); line3([wp(ROUTE[0]), wp(ROUTE[5])], rgba(C.white, a * .7), 1.5);
      ctx.setLineDash([Z * .11, Z * .06]); ctx.lineDashOffset = -t * Z * .2; line3(ROUTE.map(wp), rgba(C.white, a), Math.max(4, Z * .045) + 3); line3(ROUTE.map(wp), rgba(C.ink, a), Math.max(4, Z * .045)); ctx.setLineDash([]); ctx.lineDashOffset = 0;
      let tot = 0; const seg = []; for (let i = 1; i < ROUTE.length; i++) { const l = Math.abs(ROUTE[i][0] - ROUTE[i - 1][0]) * 1.14 + Math.abs(ROUTE[i][1] - ROUTE[i - 1][1]) * .78; seg.push(l); tot += l; }
      let d = Math.min(((t * .16) % 1.15) * tot, tot - .001), i = 0; while (d > seg[i]) { d -= seg[i]; i++; }
      const u = d / seg[i], A = wp(ROUTE[i]), B = wp(ROUTE[i + 1]);
      sq(lerp(A[0], B[0], u), lerp(A[1], B[1], u), e + .05 + .06 * Math.abs(Math.sin(t * 6)), 7 * ui, rgba(C[s.accent], a), rgba(C.ink, a));
      const S0 = wp(ROUTE[0]); sq(S0[0], S0[1], e, 6 * ui, rgba(C.ink, a), rgba(C.white, a));
      const E = wp(ROUTE[5]); pj(E[0], E[1], e); const r = 9 * ui; ctx.fillStyle = rgba(C[s.accent], a); ctx.strokeStyle = rgba(C.ink, a); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X - r, Y + r * .5); ctx.lineTo(X + r, Y + r * .5); ctx.lineTo(X, Y - r * 1.2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    if (sBeam && sBeam.a > .01) { const s = sBeam, ang = t * .7;
      ctx.beginPath(); M(s.cx, s.cy, s.top); for (let k = 0; k <= 8; k++) L(s.cx + Math.cos(ang + k * .06) * 6.4, s.cy + Math.sin(ang + k * .06) * 6.4 * .9, .3); ctx.fillStyle = rgba(C[s.accent], s.a * .42); ctx.fill();
      BEAMPTS.forEach((p, k) => { let d = Math.abs(((p[2] - ang - .24) % TAU + TAU) % TAU); d = Math.min(d, TAU - d); const hit = Math.exp(-d * d * 3), x = s.cx + p[0], y = s.cy + p[1], r = 6.5 * ui, z = .5 + .15 * hit;
        line3([[x, y, 0], [x, y, z]], rgba(C.white, s.a * .7), 1.2); pj(x, y, z);
        if (k === 5 || k === 11) { ctx.strokeStyle = rgba(C.white, s.a); ctx.lineWidth = 4; ctx.strokeRect(X - r, Y - r, r * 2, r * 2); ctx.strokeStyle = rgba(C[s.accent], s.a); ctx.lineWidth = 2; ctx.strokeRect(X - r, Y - r, r * 2, r * 2); }
        else { ctx.fillStyle = rgba(mix(C[s.accent], C.white, hit * .5), s.a * (.75 + .25 * hit)); ctx.fillRect(X - r, Y - r, r * 2, r * 2); ctx.strokeStyle = rgba(C.ink, s.a * .8); ctx.lineWidth = 1; ctx.strokeRect(X - r, Y - r, r * 2, r * 2); } }); }
    if (sAg && sAg.a > .01) { const s = sAg, loop = [0, 1, 2, 3, 0];
      line3(loop.map(q => AGT[q]), rgba(C.white, s.a * .8), 3.5); line3(loop.map(q => AGT[q]), rgba(C[s.accent], s.a), 1.8);
      for (let e = 0; e < 4; e++) for (let m = 0; m < 2; m++) { const u = (t * .3 + e * .37 + m * .5) % 1, A = AGT[loop[e]], B = AGT[loop[e + 1]];
        sq(lerp(A[0], B[0], u), lerp(A[1], B[1], u), lerp(A[2], B[2], u), 6 * ui, rgba(C[s.accent], s.a), rgba(C.ink, s.a)); } }
    if (sRing && sRing.a > .01) for (let k = 0; k < 3; k++) { const u = (t * .3 + k / 3) % 1; ring(sRing.cx, sRing.cy, sRing.top, .3 + u * 7, rgba(C.white, (1 - u) * sRing.a * .7), 4); ring(sRing.cx, sRing.cy, sRing.top, .3 + u * 7, rgba(C[sRing.accent], (1 - u) * sRing.a), 2.2); }
    if (sLad && sLad.a > .01) { const s = sLad, ph = (t * .16) % 1.5;
      for (let i = 0; i < 6; i++) { const on = clamp(ph * 8 - i, 0, 1), y = s.cy - .2 + i * .085, r = 6 * ui; pj(s.cx + .12, y, s.top + .06 + .05 * on);
        ctx.fillStyle = rgba(C[LADIES[i]], s.a * (.35 + .65 * on)); ctx.strokeStyle = rgba(C.ink, s.a); ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(X - r, Y + r); ctx.lineTo(X + r, Y + r); ctx.lineTo(X, Y - r); ctx.closePath(); ctx.fill(); ctx.stroke(); } }
    if (sPark && sPark.a > .01) [-9, -3.5, 4].forEach((dy, k) => { const z = sPark.e + .5 + .12 * Math.sin(t * 1.6 + k * 2), x = sPark.cx + (k - 1) * .8, y = sPark.cy + dy, r = 7 * ui;
      line3([[x, y, sPark.e], [x, y, z]], rgba(C.white, sPark.a * .8), 1.4); pj(x, y, z); ctx.fillStyle = rgba(C[sPark.accent], sPark.a); ctx.strokeStyle = rgba(C.ink, sPark.a); ctx.lineWidth = 1.2; ctx.beginPath();
      if (k === 2) { ctx.moveTo(X - r, Y + r); ctx.lineTo(X + r, Y + r); ctx.lineTo(X, Y - r); ctx.closePath(); } else ctx.rect(X - r, Y - r, r * 2, r * 2);
      ctx.fill(); ctx.stroke(); });

    /* pins */
    placed.length = 0;
    const halo = dark > .5 ? 'rgba(6,10,22,.85)' : 'rgba(255,255,255,.9)', inkA = rgba(C.ink, .95), sub = rgba(C.ink, .8);
    hover = -1; let best = 30 * 30;
    stops.forEach(s => { const bob = (8 + 3 * Math.sin(t * 1.5 + s.i)) / zz, z = s.top + 22 / zz + bob; pj(s.cx, s.cy, s.top); s.bx = X; s.by = Y; pj(s.cx, s.cy, z); s.sx = X; s.sy = Y;
      const dx = mx - X, dy = my - Y, d2 = dx * dx + dy * dy; if (d2 < best) { best = d2; hover = s.i; } });
    stops.forEach(s => { ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(s.bx, s.by); ctx.lineTo(s.sx, s.sy); ctx.stroke(); ctx.strokeStyle = 'rgba(20,22,28,.9)'; ctx.lineWidth = 1.2; ctx.stroke();
      const r = 6.5 + 2.5 * s.a + (hover === s.i ? 1.5 : 0), m = s.a, x = s.sx, y = s.sy; ctx.fillStyle = css(PAL[s.accent][0]); ctx.beginPath();
      ctx.moveTo(x - r, y + r * .9); ctx.lineTo(x + r, y + r * .9); ctx.lineTo(x + r * (1 - m), y - r * .9); ctx.lineTo(x - r * (1 - m), y - r * .9); ctx.closePath();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke(); ctx.fill(); ctx.strokeStyle = '#14161C'; ctx.lineWidth = 1.4; ctx.stroke();
      placed.push([x - 13, y - 13, x + 13, y + 13]); });
    stops.forEach(s => { if (Z < 15 && s.a < .3) return; const tx = s.title.length > 26 ? s.place : s.title; ctx.font = '14px "Geist Serif", Georgia, serif';
      const w = ctx.measureText(tx).width, x = s.sx, y = s.sy; let clash = false; for (const p of placed) if (x + 12 < p[2] && x + 18 + w > p[0] && y - 10 < p[3] && y + 10 > p[1] && p[0] !== x - 13) clash = true;
      if (clash && s.a < .3) return; placed.push([x + 10, y - 11, x + 22 + w, y + 11]); ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineWidth = 4.5; ctx.strokeStyle = halo; ctx.strokeText(tx, x + 14, y); ctx.fillStyle = CS.ink; ctx.fillText(tx, x + 14, y); });

    /* labels */
    for (const l of LABELS) { if (Z < l.min) continue;
      if (l.kind === 'water') label(l.x, l.y, l.z, l.text, (Z > 30 ? 18 : 15) + 'px "Geist Serif", Georgia, serif', 'rgba(255,255,255,.88)', 'rgba(0,0,0,0)', true);
      else if (l.kind === 'park') label(l.x, l.y, l.z, l.text, '14px "Geist Serif", Georgia, serif', inkA, halo, true);
      else if (l.kind === 'hood') label(l.x, l.y, l.z, l.text, (Z > 50 ? 16 : 14) + 'px "Geist Serif", Georgia, serif', inkA, halo, true);
      else { pj(l.x, l.y, l.z); const px = X, py = Y; if (label(l.x, l.y, l.z, l.text, '12px "Geist Pixel", monospace', inkA, halo, false)) { ctx.fillStyle = '#fff'; ctx.fillRect(px - 4, py - 4, 8, 8); ctx.fillStyle = '#14161C'; ctx.fillRect(px - 2.5, py - 2.5, 5, 5); } } }

    /* viewfinder on the current stop */
    if (cur >= 0 && plateOpen) { const s = stops[cur], e = sstep(0, 1, lock); pj(s.cx, s.cy, (s.e + s.top) / 2); const cx = X, cy = Y;
      if (cx > 0 && cx < W && cy > 0 && cy < H) { const R = Math.min(W, H) * (mobile ? .2 : .17) * (1.45 - .45 * e), arm = R * .28;
        const path = () => { ctx.beginPath(); [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(q => { ctx.moveTo(cx + q[0] * R, cy + q[1] * R * .8 - q[1] * arm); ctx.lineTo(cx + q[0] * R, cy + q[1] * R * .8); ctx.lineTo(cx + q[0] * R - q[0] * arm, cy + q[1] * R * .8); }); };
        path(); ctx.strokeStyle = rgba([20, 22, 28], .7 * e); ctx.lineWidth = 4.5; ctx.stroke(); path(); ctx.strokeStyle = rgba([255, 255, 255], .95 * e); ctx.lineWidth = 2; ctx.stroke();
        ctx.font = '12px "Geist Pixel", monospace'; ctx.textBaseline = 'top'; ctx.textAlign = 'left'; ctx.lineWidth = 4; ctx.strokeStyle = rgba([20, 22, 28], .8 * e); ctx.strokeText(s.coords, cx - R, cy + R * .8 + 9); ctx.fillStyle = rgba([255, 255, 255], e); ctx.fillText(s.coords, cx - R, cy + R * .8 + 9); } }

    /* chrome */
    if (hover >= 0 && mx > -999 && !ptrs.size) { tip.textContent = stops[hover].place; tip.style.left = stops[hover].sx + 'px'; tip.style.top = stops[hover].sy + 'px'; tip.style.opacity = 1; cv.style.cursor = 'pointer'; }
    else { tip.style.opacity = 0; cv.style.cursor = ''; }
    const g = toLL(cam.x, cam.y), here = Math.abs(g[0]).toFixed(4) + '° N, ' + Math.abs(g[1]).toFixed(4) + '° W';
    if (here !== lastHere) { hereEl.textContent = here; lastHere = here; }
    const hd = card.querySelector('h1,h2');
    if (hd) { const target = mx > -999 ? 25 + 25 * clamp(mx / W, 0, 1) : 37.5 + 12.5 * Math.sin(t * .5); morph += (target - morph) * (reduce ? 1 : .08); hd.style.fontVariationSettings = '"ELSH" ' + morph.toFixed(2); }
  }

  readTheme(); resize();
  const startId = (location.hash || '').slice(1), startAt = stops.findIndex(s => s.id === startId);
  card.innerHTML = ''; show(startAt, { stay: startAt < 0 });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { dirty = true; });
  requestAnimationFrame(frame);
})();
