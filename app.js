(() => {
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

  /* ================= page ================= */
  const stops = S.stops;
  const N = stops.length;
  const ext = 'target="_blank" rel="noopener"';
  const cells = (fill, of) => '<div class="cells" style="grid-template-columns:repeat(' + of + ',1fr)">' +
    Array.from({ length: of }, (_, i) => '<i' + (i < fill ? ' class="on"' : '') + '></i>').join('') + '</div>';
  const short = u => u.replace(/^https?:\/\/(www\.)?/, '');

  (function render() {
    const h = [];
    h.push('<section class="stop hero" data-i="-1"><div class="plate">' +
      '<div class="bar px"><span class="glyph"></span><span>' + esc(S.hero.place) + '</span><span class="co">' + esc(S.hero.coords) + '</span></div>' +
      '<div class="body"><h1 data-morph="pointer">' + esc(S.name) + '</h1><p class="lede">' + esc(S.hero.lede) + '</p><p>' + esc(S.hero.intro) + '</p>' +
      '<div class="actions"><a class="btn" href="#' + esc(stops[0].id) + '"><span class="glyph"></span>Start the walk</a>' +
      '<a class="btn tri-first" href="' + esc(S.resume) + '" ' + ext + '><span class="glyph tri"></span>Read my resume</a></div>' +
      '<p class="hint">' + esc(S.hero.hint) + '</p></div></div></section>');
    stops.forEach((s, i) => {
      let b = '<p class="kind">' + esc(s.kind) + '</p><h2 data-morph>' + esc(s.title) + '</h2>';
      if (s.meta) b += '<p class="meta">' + esc(s.meta) + '</p>';
      (s.paragraphs || []).forEach(p => { b += '<p>' + esc(p) + '</p>'; });
      if (s.stats) b += '<dl class="stats">' + s.stats.map(x => '<div class="stat"><dd>' + esc(x.value) + '</dd><dt>' + esc(x.label) + '</dt>' + (x.fill != null ? cells(x.fill, x.of || 20) : '') + '</div>').join('') + '</dl>';
      if (s.groups) b += '<dl class="kit">' + s.groups.map(g => '<div><dt>' + esc(g.group) + '</dt><dd>' + esc(g.items) + '</dd></div>').join('') + '</dl>';
      if (s.items) b += '<ul class="rows">' + s.items.map(m => '<li>' + (m.url ? '<a class="row" href="' + esc(m.url) + '" ' + ext + '>' : '<div class="row">') +
        '<span class="glyph' + (m.url ? '' : ' tri') + '"></span><span class="name">' + esc(m.name) + '</span><span class="what">' + esc(m.what) + '</span>' + (m.url ? '</a>' : '</div>') + '</li>').join('') + '</ul>';
      if (s.footnote) b += '<p class="meta"><span class="glyph tri" style="margin-right:.6rem;color:var(--accent)"></span>' + esc(s.footnote) + '</p>';
      if (s.stack) b += '<p class="stack">' + esc(s.stack) + '</p>';
      if (s.link) b += '<a href="' + esc(s.link.url) + '" ' + ext + '>' + esc(s.link.label) + '</a>';
      if (s.contact) b += '<div class="links">' +
        '<a href="mailto:' + esc(S.email) + '"><span class="glyph"></span>' + esc(S.email) + '</a>' +
        '<a href="' + esc(S.linkedin) + '" ' + ext + '><span class="glyph"></span>LinkedIn<small>' + esc(short(S.linkedin)) + '</small></a>' +
        '<a href="' + esc(S.github) + '" ' + ext + '><span class="glyph"></span>GitHub<small>' + esc(short(S.github)) + '</small></a>' +
        '<a href="' + esc(S.resume) + '" ' + ext + '><span class="glyph"></span>Resume<small>PDF</small></a></div>';
      h.push('<section class="stop" id="' + esc(s.id) + '" data-i="' + i + '" style="--accent:var(--' + esc(s.accent) + ')"><div class="plate">' +
        '<div class="bar px"><span class="glyph"></span><span>Stop ' + String(i + 1).padStart(2, '0') + ' of ' + String(N).padStart(2, '0') + '</span><span>' + esc(s.place) + '</span><span class="co">' + esc(s.coords) + '</span></div>' +
        '<div class="body">' + b + '</div></div></section>');
    });
    document.getElementById('top').innerHTML = h.join('');
    document.getElementById('me-name').textContent = S.name;
    document.getElementById('foot').textContent = S.name + ', ' + new Date().getFullYear();
    document.getElementById('rail').innerHTML = stops.map((s, i) => '<li><button type="button" data-go="' + esc(s.id) + '" style="--accent:var(--' + esc(s.accent) + ')" aria-label="' + esc(s.place) + '"><span class="glyph"></span><span class="lbl">' + esc(s.place) + '</span></button></li>').join('');
  })();
  const sections = [...document.querySelectorAll('.stop')];
  const railBtns = [...document.querySelectorAll('#rail button')];
  const goTo = id => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: innerWidth < 860 ? 'end' : 'center' }); };
  railBtns.forEach(b => b.addEventListener('click', () => goTo(b.dataset.go)));

  /* ================= world ================= */
  const GW = 44, GH = 46;
  const ll = (lat, lon) => [(lon + 122.52) / 0.165 * GW, (37.84 - lat) / 0.14 * GH];
  const P = a => a.map(p => ll(p[0], p[1]));
  const inPoly = (x, y, p) => {
    let c = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c;
    }
    return c;
  };
  const LAND = P([[37.700, -122.502], [37.735, -122.507], [37.775, -122.512], [37.787, -122.509], [37.790, -122.493], [37.793, -122.484],
    [37.8107, -122.4772], [37.806, -122.460], [37.807, -122.440], [37.808, -122.422], [37.810, -122.410], [37.806, -122.402],
    [37.797, -122.394], [37.788, -122.388], [37.776, -122.387], [37.765, -122.385], [37.760, -122.380], [37.748, -122.378],
    [37.730, -122.362], [37.722, -122.372], [37.710, -122.381], [37.700, -122.390]]);
  const MARIN = P([[37.846, -122.53], [37.846, -122.452], [37.833, -122.463], [37.8272, -122.4792], [37.823, -122.492], [37.827, -122.506], [37.822, -122.53]]);
  const YBI = P([[37.813, -122.372], [37.812, -122.362], [37.807, -122.360], [37.806, -122.369]]);
  const TI = P([[37.832, -122.378], [37.832, -122.364], [37.815, -122.362], [37.814, -122.374]]);
  const ALC = P([[37.8285, -122.4255], [37.8280, -122.4205], [37.8252, -122.4205], [37.8256, -122.4250]]);
  const PARKS = [
    P([[37.7742, -122.511], [37.7742, -122.4545], [37.7645, -122.4545], [37.7645, -122.5105]]),
    P([[37.8095, -122.478], [37.8052, -122.449], [37.789, -122.448], [37.788, -122.484], [37.7935, -122.484]]),
    P([[37.7615, -122.4285], [37.7615, -122.4255], [37.7580, -122.4255], [37.7580, -122.4285]]),
    P([[37.724, -122.428], [37.724, -122.412], [37.713, -122.412], [37.713, -122.428]]),
    P([[37.787, -122.509], [37.787, -122.495], [37.779, -122.496], [37.779, -122.511]])
  ];
  const LAKE = P([[37.729, -122.499], [37.729, -122.489], [37.714, -122.486], [37.714, -122.497]]);
  const HILLS = [[37.7552, -122.4528, 2.0, 2.3], [37.793, -122.416, .9, 1.3], [37.8024, -122.4058, .8, .9], [37.792, -122.437, .6, 1.5], [37.743, -122.414, .9, 1.2], [37.738, -122.455, 1.3, 1.6]]
    .map(h => { const p = ll(h[0], h[1]); return [p[0], p[1], h[2], h[3]]; });
  const elev = (x, y) => {
    let e = 0;
    for (const h of HILLS) { const dx = x - h[0], dy = y - h[1]; e += h[2] * Math.exp(-(dx * dx + dy * dy) / (2 * h[3] * h[3])); }
    return Math.round(e * 4) / 4;
  };
  const DT = ll(37.7925, -122.3995), MK0 = ll(37.7955, -122.3937), MK1 = ll(37.7626, -122.435);
  const segDist = (x, y, a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const h = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy), 0, 1);
    return Math.hypot(x - a[0] - dx * h, y - a[1] - dy * h);
  };

  stops.forEach((s, i) => {
    const p = ll(s.at[0], s.at[1]);
    s.i = i; s.wx = p[0]; s.wy = p[1]; s.cx = Math.floor(p[0]) + .5; s.cy = Math.floor(p[1]) + .5;
    s.a = 0; s.top = 1.2; s.e = elev(s.cx, s.cy); s.sx = 0; s.sy = 0;
  });
  const byScene = n => stops.find(s => s.scene === n);
  const sRoute = byScene('route'), sBeam = byScene('beam');

  /* cells kept clear of ordinary buildings */
  const reserved = new Set();
  const reserve = (cx, cy, rx, ry) => { for (let i = -rx; i <= rx; i++) for (let j = -ry; j <= ry; j++) reserved.add((Math.floor(cx) + i) + ',' + (Math.floor(cy) + j)); };
  const RES = { ferry: [0, 1], cranes: [1, 1], agents: [0, 0], route: [-1, -1], beam: [0, 0], ladies: [2, 1], rings: [1, 1], park: [0, 0], beach: [0, 0], bridge: [0, 0], tower: [0, 0] };
  stops.forEach(s => { const r = RES[s.scene] || [0, 0]; if (r[0] >= 0) reserve(s.cx, s.cy, r[0], r[1]); });
  const TA = ll(37.7952, -122.4028); reserve(TA[0], TA[1], 0, 0);
  const sAg = byScene('agents');
  const AG = [[-2, 1, 3.4], [2, 2, 2.8], [-1, -2, 4.0]];
  if (sAg) AG.forEach(o => reserve(sAg.cx + o[0], sAg.cy + o[1], 0, 0));

  const HOT = [[-2, 1], [0, -1], [1, 1], [2, -1]];
  const ROUTE = [[-3, 3], [-3, 0], [-1, 0], [-1, -2], [3, -2], [3, -3]];

  /* ---------- static items, sorted back to front ---------- */
  const items = [];
  const builds = [];
  for (let j = -2; j < GH + 2; j++) for (let i = -2; i < GW + 2; i++) {
    const x = i + .5, y = j + .5;
    if (!inPoly(x, y, LAND)) continue;
    const e = elev(x, y);
    if (e > 0) items.push({ t: 0, key: x + y - .01, x0: i, y0: j, x1: i + 1, y1: j + 1, e });
    if (reserved.has(i + ',' + j)) continue;
    if (PARKS.some(p => inPoly(x, y, p)) || inPoly(x, y, LAKE)) continue;
    if (segDist(x, y, MK0, MK1) < .5) continue;
    const r1 = hash(i, j), r2 = hash(i + 91, j + 17), r3 = hash(i + 7, j + 131);
    if (r1 < .07) continue;
    const dd = Math.hypot(x - DT[0], y - DT[1]);
    let h = .26 + r2 * .3 + 5.4 * Math.exp(-dd * dd / (2 * 2.3 * 2.3)) * (.3 + .7 * r3);
    if (sRoute && Math.hypot(x - sRoute.cx, y - sRoute.cy) < 3.6) h = Math.min(h, .34 + r2 * .2);
    if (sBeam && Math.hypot(x - sBeam.cx, y - sBeam.cy) < 4.6) h = Math.min(h, .5 + r2 * .5);
    const m = .13 + r3 * .06;
    const b = { t: 1, key: x + y, x0: i + m, y0: j + m, x1: i + 1 - m, y1: j + 1 - m, z0: e, h, sh: Math.floor(r1 * 5), i, j, r: r2, hot: 0, mcp: 0 };
    builds.push(b); items.push(b);
  }
  if (sRoute) {
    const bx = Math.floor(sRoute.cx), by = Math.floor(sRoute.cy);
    builds.forEach(b => { if (HOT.some(o => b.i === bx + o[0] && b.j === by + o[1])) b.hot = 1; });
  }
  if (sBeam) {
    const near = builds.filter(b => { const d = Math.hypot(b.i + .5 - sBeam.cx, b.j + .5 - sBeam.cy); return d > 1.4 && d < 4.3; })
      .sort((a, b) => hash(a.i, a.j + 500) - hash(b.i, b.j + 500)).slice(0, 16);
    near.forEach((b, k) => { b.mcp = (k === 5 || k === 11) ? 2 : 1; b.ang = Math.atan2(b.j + .5 - sBeam.cy, b.i + .5 - sBeam.cx); });
  }
  /* trees */
  const treeZones = [[PARKS[0], 150], [PARKS[1], 120], [PARKS[2], 8], [PARKS[3], 46], [PARKS[4], 26], [MARIN, 90], [YBI, 12]];
  treeZones.forEach(z => {
    const xs = z[0].map(p => p[0]), ys = z[0].map(p => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    let n = 0, guard = 0;
    while (n < z[1] && guard++ < 4000) {
      const x = lerp(x0, x1, rnd()), y = lerp(y0, y1, rnd());
      if (!inPoly(x, y, z[0])) continue;
      items.push({ t: 2, key: x + y, x, y, s: .7 + rnd() * .7, v: rnd() < .5 ? 0 : 1, ph: rnd() * TAU }); n++;
    }
  });
  /* scene statics join the same depth list */
  stops.forEach(s => items.push({ t: 3, key: s.cx + s.cy + .2, s }));
  if (sAg) AG.forEach((o, k) => items.push({ t: 4, key: sAg.cx + o[0] + sAg.cy + o[1], s: sAg, o, k }));
  items.push({ t: 5, key: Math.floor(TA[0]) + Math.floor(TA[1]) + 1 });
  items.push({ t: 6, key: 30.6 });
  items.sort((a, b) => a.key - b.key);

  const ticks = [];
  for (let k = 0; k < 520; k++) {
    const x = -14 + rnd() * 74, y = -14 + rnd() * 76;
    if (inPoly(x, y, LAND) || inPoly(x, y, MARIN) || inPoly(x, y, TI)) continue;
    ticks.push([x, y, .3 + rnd() * .6, Math.floor(rnd() * 3)]);
  }
  const boats = [[37.825, -122.44], [37.818, -122.40], [37.832, -122.392], [37.800, -122.376], [37.775, -122.371], [37.742, -122.366], [37.834, -122.432], [37.80, -122.525]].map(p => ll(p[0], p[1]).concat([rnd() * TAU]));
  const fogs = Array.from({ length: 20 }, () => [rnd() * 40, 1 + rnd() * 30, 2.6 + rnd() * 3.4, rnd(), .25 + rnd() * .2]);
  const GA = ll(37.8107, -122.4772), GB = ll(37.8272, -122.4792);
  const BA = ll(37.7886, -122.3880), BB = ll(37.8085, -122.3665);

  /* route between stops, along the street grid */
  const routePts = [];
  stops.forEach((s, i) => {
    const p = [Math.floor(s.cx), Math.floor(s.cy) + 1];
    if (i) {
      const q = routePts[routePts.length - 1];
      const c1 = [p[0], q[1]], c2 = [q[0], p[1]];
      const ok = c => inPoly(c[0] + .01, c[1] - .01, LAND);
      routePts.push(ok(c1) || !ok(c2) ? c1 : c2);
    }
    routePts.push(p); s.ri = routePts.length - 1;
  });
  const routeLen = [0];
  for (let i = 1; i < routePts.length; i++) routeLen.push(routeLen[i - 1] + Math.hypot(routePts[i][0] - routePts[i - 1][0], routePts[i][1] - routePts[i - 1][1]));
  const routeAt = d => {
    d = clamp(d, 0, routeLen[routeLen.length - 1]);
    let i = 1; while (i < routeLen.length - 1 && routeLen[i] < d) i++;
    const f = (d - routeLen[i - 1]) / Math.max(1e-6, routeLen[i] - routeLen[i - 1]);
    return [lerp(routePts[i - 1][0], routePts[i][0], f), lerp(routePts[i - 1][1], routePts[i][1], f), i];
  };

  /* ================= colors ================= */
  const PAL = {
    water: [[207, 224, 234], [10, 15, 29]], tick: [[238, 245, 249], [28, 40, 66]],
    land: [[232, 234, 238], [22, 27, 42]], edge: [[188, 198, 210], [6, 9, 17]],
    park: [[198, 229, 212], [19, 42, 39]], tree0: [[146, 206, 178], [38, 88, 76]], tree1: [[114, 186, 152], [29, 68, 60]],
    bridge: [[238, 158, 136], [222, 140, 120]], steel: [[170, 180, 194], [74, 84, 110]],
    win: [[243, 223, 160], [243, 223, 160]], fog: [[255, 255, 255], [150, 165, 205]], ink: [[20, 22, 28], [233, 234, 240]],
    white: [[252, 252, 253], [196, 202, 220]],
    lilac: [[167, 159, 234], [189, 182, 245]], mint: [[118, 200, 168], [163, 224, 199]], peach: [[238, 160, 124], [246, 194, 166]],
    sky: [[118, 172, 224], [168, 206, 240]], butter: [[224, 196, 92], [238, 221, 154]], rose: [[228, 140, 170], [242, 184, 204]]
  };
  const LADIES = ['rose', 'butter', 'mint', 'sky', 'lilac', 'peach'];
  const C = {}, CS = {};
  let dark = 0, darkT = 0, ready = false;
  const css = c => 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')';
  const rgba = (c, a) => 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a.toFixed(3) + ')';
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const shade = (c, f) => [c[0] * f, c[1] * f, c[2] * f];
  const MONO = [];
  function colors() {
    for (const k in PAL) { C[k] = mix(PAL[k][0], PAL[k][1], dark); CS[k] = css(C[k]); }
    for (let s = 0; s < 5; s++) {
      const lt = 247 - s * 4, ll_ = 221 - s * 5, lr = 199 - s * 5, dt = 44 + s * 4, dl = 29 + s * 3, dr = 19 + s * 2;
      MONO[s] = [mix([lt, lt + 1, lt + 3], [dt, dt + 6, dt + 20], dark), mix([ll_, ll_ + 2, ll_ + 6], [dl, dl + 4, dl + 14], dark), mix([lr, lr + 3, lr + 9], [dr, dr + 3, dr + 10], dark)];
      MONO[s].css = MONO[s].map(css);
    }
  }
  const FS = [1, .88, .76];
  /* three face colors for a mono building tinted toward an accent */
  const tint = (name, m, sh) => { const a = C[name], mo = MONO[sh == null ? 1 : sh]; return [css(mix(mo[0], a, m)), css(mix(mo[1], shade(a, FS[1]), m)), css(mix(mo[2], shade(a, FS[2]), m))]; };

  function isDark() { const a = root.getAttribute('data-theme'); return a ? a === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
  function readTheme() {
    darkT = isDark() ? 1 : 0;
    if (!ready) { dark = darkT; ready = true; }
    document.getElementById('theme-label').textContent = darkT ? 'Day' : 'Night';
    document.querySelector('#theme .glyph').classList.toggle('tri', !!darkT);
    document.getElementById('theme').setAttribute('aria-label', darkT ? 'Switch to the day map' : 'Switch to the night map');
    dirty = true;
  }
  document.getElementById('theme').addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('rd-sf-theme', next); } catch (e) {}
  });
  try { const v = localStorage.getItem('rd-sf-theme'); if (v === 'dark' || v === 'light') root.setAttribute('data-theme', v); } catch (e) {}
  new MutationObserver(readTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readTheme);

  /* ================= canvas ================= */
  const cv = document.getElementById('map'), ctx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1, dirty = true, mobile = false;
  function resize() {
    const w = document.documentElement.clientWidth || innerWidth, h = innerHeight, d = Math.min(2, devicePixelRatio || 1);
    if (w === W && h === H && d === DPR) return;
    W = w; H = h; DPR = d; mobile = W < 860;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    dirty = true;
  }
  addEventListener('resize', resize);
  if (window.visualViewport) visualViewport.addEventListener('resize', resize);
  addEventListener('scroll', () => { dirty = true; }, { passive: true });

  /* projection */
  let zx = 1, zy = .5, zz = .62, ox = 0, oy = 0, X = 0, Y = 0;
  const pj = (x, y, z) => { X = (x - y) * zx + ox; Y = (x + y) * zy - z * zz + oy; };
  const M = (x, y, z) => { pj(x, y, z); ctx.moveTo(X, Y); };
  const L = (x, y, z) => { pj(x, y, z); ctx.lineTo(X, Y); };
  function box(x0, y0, x1, y1, z0, z1, c) {
    const ax = (x0 - y0) * zx + ox, ay = (x0 + y0) * zy + oy, bx = (x1 - y0) * zx + ox, by = (x1 + y0) * zy + oy;
    const cx = (x1 - y1) * zx + ox, cy = (x1 + y1) * zy + oy, dx = (x0 - y1) * zx + ox, dy = (x0 + y1) * zy + oy;
    const t1 = z1 * zz, t0 = z0 * zz;
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.moveTo(dx, dy - t1); ctx.lineTo(cx, cy - t1); ctx.lineTo(cx, cy - t0); ctx.lineTo(dx, dy - t0); ctx.fill();
    ctx.fillStyle = c[2]; ctx.beginPath(); ctx.moveTo(bx, by - t1); ctx.lineTo(cx, cy - t1); ctx.lineTo(cx, cy - t0); ctx.lineTo(bx, by - t0); ctx.fill();
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.moveTo(ax, ay - t1); ctx.lineTo(bx, by - t1); ctx.lineTo(cx, cy - t1); ctx.lineTo(dx, dy - t1); ctx.fill();
  }
  const cbox = (cx, cy, r, z0, z1, c) => box(cx - r, cy - r, cx + r, cy + r, z0, z1, c);
  function ground(p, fill, dz) { ctx.beginPath(); p.forEach((q, i) => { pj(q[0], q[1], dz || 0); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
  function line3(pts, col, w) { ctx.beginPath(); pts.forEach((q, i) => { pj(q[0], q[1], q[2]); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); }
  function ring(cx, cy, z, r, col, w) { ctx.beginPath(); for (let k = 0; k <= 30; k++) { const a = k / 30 * TAU; pj(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z); k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); }
  function sq(x, y, z, r, col) { pj(x, y, z); ctx.fillStyle = col; ctx.fillRect(X - r, Y - r, r * 2, r * 2); }

  /* ================= camera ================= */
  const cam = { x: 21, y: 23, z: 14 };
  let pos = 0, active = -1, lock = 1, fx = 0, fy = 0, tNow = 0;
  const pose = i => {
    if (i < 0) return { x: mobile ? 21 : 19.5, y: mobile ? 21.5 : 24, z: mobile ? Math.min(W / 58, H / 96) : Math.min(W / 92, H / 50) };
    const s = stops[i], base = mobile ? 21 : 30;
    const k = s.zoom || ({ bridge: .8, beach: .8, park: .82, ferry: .95, rings: .9, ladies: 1.3, route: 1.2, beam: 1.05, cranes: 1.1 })[s.scene] || 1;
    return { x: s.cx + (s.scene === 'bridge' ? -.2 : 0), y: s.cy + (s.scene === 'bridge' ? -2.2 : 0), z: base * k };
  };
  function scrollPos() {
    const mid = H * (mobile ? .62 : .5);
    let prev = null, out = N - 1;
    for (let k = 0; k < sections.length; k++) {
      const r = sections[k].getBoundingClientRect();
      const c = mobile ? r.bottom - Math.min(r.height, H) * .5 : (r.top + r.bottom) / 2;
      if (c >= mid) { out = prev == null ? -1 : (k - 2) + sstep(.18, .82, (mid - prev) / (c - prev)); break; }
      prev = c;
    }
    return out;
  }

  /* ================= scenes ================= */
  const SC = {
    tower(s, t) { cbox(s.cx, s.cy, .36, s.e, s.e + 1 + 2.2 * s.a, tint(s.accent, .35 + .65 * s.a)); s.top = s.e + 1 + 2.2 * s.a; },
    ferry(s, t) {
      const c = tint(s.accent, .3 + .7 * s.a), k = .5 + .5 * s.a;
      box(s.cx - .34, s.cy - 1.35, s.cx + .34, s.cy + 1.35, 0, .42, c);
      cbox(s.cx, s.cy, .17, .42, .42 + 1.5 * k, c);
      const z = .42 + 1.5 * k;
      ctx.fillStyle = c[1]; ctx.beginPath(); M(s.cx - .17, s.cy + .17, z); L(s.cx + .17, s.cy + .17, z); L(s.cx, s.cy, z + .45); ctx.fill();
      ctx.fillStyle = c[2]; ctx.beginPath(); M(s.cx + .17, s.cy - .17, z); L(s.cx + .17, s.cy + .17, z); L(s.cx, s.cy, z + .45); ctx.fill();
      s.top = z + .45;
    },
    cranes(s, t) {
      const c = tint(s.accent, .3 + .7 * s.a);
      box(s.cx - 1.3, s.cy - .42, s.cx - .1, s.cy + .42, 0, .5, c);
      box(s.cx - 1.3, s.cy + .7, s.cx - .3, s.cy + 1.3, 0, .36, MONO[2].css);
      const col = css(mix(C.steel, C[s.accent], .3 + .7 * s.a));
      [[.7, -.7, 0], [.7, .8, 2.1]].forEach(m => {
        const mx = s.cx + m[0], my = s.cy + m[1], a = -.5 + m[2] + .7 * Math.sin(t * .35 + m[2]) * (.25 + .75 * s.a);
        const tx = mx + Math.cos(a) * 1.5, ty = my + Math.sin(a) * 1.5, bx = mx - Math.cos(a) * .5, by = my - Math.sin(a) * .5;
        line3([[mx, my, 0], [mx, my, 2.9]], col, 2.4);
        line3([[bx, by, 2.3], [tx, ty, 2.3]], col, 2.4);
        line3([[bx, by, 2.3], [mx, my, 2.9], [tx, ty, 2.3]], col, 1.2);
        line3([[tx, ty, 2.3], [tx, ty, 1.1 + .5 * Math.sin(t * .6 + m[2])]], col, 1);
        sq(tx, ty, 1.1 + .5 * Math.sin(t * .6 + m[2]), 2.5, col);
      });
      s.top = 2.9;
    },
    agents(s, t) {
      const c = tint(s.accent, .4 + .6 * s.a), k = .5 + .5 * s.a;
      cbox(s.cx, s.cy, .4, 0, 5.4 * k, c); cbox(s.cx, s.cy, .33, 5.4 * k, 6.5 * k, c); cbox(s.cx, s.cy, .23, 6.5 * k, 7.1 * k, c);
      s.top = 7.1 * k;
    },
    route(s, t) { s.top = .9; },
    beam(s, t) {
      const c = tint(s.accent, .4 + .6 * s.a), k = .55 + .45 * s.a, z = s.e + 2.3 * k;
      cbox(s.cx, s.cy, .2, s.e, z, c); cbox(s.cx, s.cy, .26, z, z + .16, c); cbox(s.cx, s.cy, .14, z + .16, z + .4, c);
      s.top = z + .4;
    },
    ladies(s, t) {
      const ph = (t * .16) % 1.5;
      for (let i = 0; i < 6; i++) {
        const hx = s.cx - 1.5 + i * .5, x0 = hx + .05, x1 = hx + .45, xm = hx + .25, y0 = s.cy - .1, y1 = s.cy + .5;
        const m = (.3 + .7 * clamp(ph * 8 - i, 0, 1)) * (.3 + .7 * s.a), c = tint(LADIES[i], m, 0);
        box(x0, y0, x1, y1, s.e, s.e + .72, c);
        const z = s.e + .72, zr = z + .34;
        ctx.fillStyle = c[1]; ctx.beginPath(); M(x0, y1, z); L(x1, y1, z); L(xm, y1, zr); ctx.fill();
        ctx.fillStyle = c[0]; ctx.beginPath(); M(x0, y0, z); L(xm, y0, zr); L(xm, y1, zr); L(x0, y1, z); ctx.fill();
        ctx.fillStyle = c[2]; ctx.beginPath(); M(xm, y0, zr); L(x1, y0, z); L(x1, y1, z); L(xm, y1, zr); ctx.fill();
      }
      s.top = s.e + 1.06;
    },
    rings(s, t) {
      const k = .55 + .45 * s.a, e = s.e, col = css(mix(C.bridge, C.white, .15)), wcol = CS.white;
      const B = [[-.5, .32], [.5, .32], [0, -.5]], zs = [e, e + 3.3 * k, e + 5.6 * k, e + 7.2 * k], sc = [1, .3, .5, .46];
      const pt = (i, l) => [s.cx + B[i][0] * sc[l], s.cy + B[i][1] * sc[l], zs[l]];
      for (let i = 0; i < 3; i++) {
        line3([pt(i, 0), pt(i, 1)], col, 3); line3([pt(i, 1), pt(i, 2)], wcol, 3); line3([pt(i, 2), pt(i, 3)], col, 2);
      }
      for (let l = 1; l < 3; l++) line3([pt(0, l), pt(1, l), pt(2, l), pt(0, l)], l === 1 ? col : wcol, 1.6);
      s.top = zs[3]; s.ringZ = zs[2];
    },
    park(s, t) { cbox(s.cx, s.cy, .3, 0, .3 + .4 * s.a, tint(s.accent, .4 + .6 * s.a)); s.top = 1.3; },
    beach(s, t) {
      const col = css(mix(C.ink, C[s.accent], s.a)), x = s.cx + .4, y = s.cy;
      line3([[x - .16, y + .1, 0], [x, y, .55]], col, 1.4); line3([[x + .16, y + .1, 0], [x, y, .55]], col, 1.4); line3([[x, y - .18, 0], [x, y, .55]], col, 1.4);
      cbox(x, y, .1, .55, .72, tint(s.accent, .5 + .5 * s.a));
      s.top = 1.1;
    },
    bridge(s, t) { s.top = 3.4; }
  };

  function suspension(A, B, col, zd, zt, towers, w) {
    const at = u => [lerp(A[0], B[0], u), lerp(A[1], B[1], u)];
    const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy), nx = -dy / len * .1, ny = dx / len * .1;
    ctx.beginPath(); M(A[0] - nx, A[1] - ny, zd); L(B[0] - nx, B[1] - ny, zd); L(B[0] + nx, B[1] + ny, zd); L(A[0] + nx, A[1] + ny, zd); ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); M(A[0] + nx, A[1] + ny, zd); L(B[0] + nx, B[1] + ny, zd); L(B[0] + nx, B[1] + ny, zd - .14); L(A[0] + nx, A[1] + ny, zd - .14); ctx.fillStyle = css(shade(C.bridge === undefined ? [0, 0, 0] : (col === CS.bridge ? C.bridge : C.steel), .8)); ctx.fill();
    for (const side of [-1, 1]) {
      const ox_ = nx * side, oy_ = ny * side, pts = [];
      const ends = [0].concat(towers, [1]);
      for (let e = 0; e < ends.length - 1; e++) {
        const u0 = ends[e], u1 = ends[e + 1], z0 = e === 0 ? zd : zt, z1 = e === ends.length - 2 ? zd : zt, mid = e > 0 && e < ends.length - 2;
        for (let k = 0; k <= 10; k++) {
          const f = k / 10, u = lerp(u0, u1, f), p = at(u);
          const z = mid ? lerp(z0, z1, f) - (zt - zd - .22) * 4 * f * (1 - f) : lerp(z0, z1, f) - (zt - zd) * .18 * 4 * f * (1 - f);
          pts.push([p[0] + ox_, p[1] + oy_, z]);
        }
      }
      line3(pts, col, w);
      ctx.beginPath();
      for (let k = 2; k < pts.length - 2; k += 2) { M(pts[k][0], pts[k][1], pts[k][2]); L(pts[k][0], pts[k][1], zd); }
      ctx.strokeStyle = col; ctx.lineWidth = .6; ctx.stroke();
    }
    towers.forEach(u => {
      const p = at(u);
      for (const side of [-1, 1]) line3([[p[0] + nx * side, p[1] + ny * side, 0], [p[0] + nx * side, p[1] + ny * side, zt + .1]], col, w * 1.9);
      for (const z of [zd + .5, zt - .5, zt]) line3([[p[0] - nx, p[1] - ny, z], [p[0] + nx, p[1] + ny, z]], col, w * 1.4);
    });
  }

  /* ================= frame ================= */
  const morphs = [...document.querySelectorAll('[data-morph]')].map(el => ({ el, v: 25, pointer: el.dataset.morph === 'pointer' }));
  const whereEl = document.getElementById('where'), tip = document.getElementById('tip');
  let mx = -9999, my = -9999, hover = -1, lastActive = -2;
  const t0 = performance.now();

  function frame(now) {
    requestAnimationFrame(frame);
    if (reduce && !dirty) return;
    dirty = false;
    const t = reduce ? 6 : (now - t0) / 1000; tNow = t;
    dark += (darkT - dark) * (reduce ? 1 : .06);
    colors();

    /* camera */
    pos = scrollPos();
    const i0 = Math.floor(pos), f = pos - i0, A = pose(clamp(i0, -1, N - 1)), B = pose(clamp(i0 + 1, -1, N - 1));
    const far = Math.hypot(B.x - A.x, B.y - A.y);
    const tz = Math.exp(lerp(Math.log(A.z), Math.log(B.z), f)) * (1 - Math.min(.34, far * .018) * Math.sin(Math.PI * f));
    const tx = lerp(A.x, B.x, f), ty = lerp(A.y, B.y, f), ks = reduce ? 1 : .09;
    cam.x += (tx - cam.x) * ks; cam.y += (ty - cam.y) * ks; cam.z += (tz - cam.z) * ks;
    const act = Math.round(pos);
    if (act !== active) { active = act; lock = 0; }
    lock = Math.min(1, lock + (reduce ? 1 : .035));
    stops.forEach(s => { s.a += ((s.i === active ? 1 : 0) - s.a) * (reduce ? 1 : .05); });
    const hero = sstep(0, 1, -pos);
    fx = mobile ? W * .5 : lerp(W * .64, W * .6, hero); fy = mobile ? lerp(H * .31, H * .2, hero) : H * .52;
    zx = cam.z; zy = cam.z * .5; zz = cam.z * .62;
    ox = fx - (cam.x - cam.y) * zx; oy = fy - (cam.x + cam.y) * zy;
    const Z = cam.z, lw = clamp(Z / 26, .6, 1.3);

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = CS.water; ctx.fillRect(0, 0, W, H);
    ctx.lineCap = 'butt'; ctx.lineJoin = 'round';

    /* water */
    for (let b = 0; b < 3; b++) {
      ctx.beginPath();
      for (const k of ticks) { if (k[3] !== b) continue; pj(k[0] + Math.sin(t * .15 + k[1]) * .3, k[1], 0); if (X < -20 || X > W + 20 || Y < -10 || Y > H + 10) continue; ctx.moveTo(X, Y); ctx.lineTo(X + k[2] * Z, Y); }
      ctx.strokeStyle = rgba(C.tick, .35 + .3 * Math.sin(t * .7 + b * 2.1)); ctx.lineWidth = Math.max(1, Z * .05); ctx.stroke();
    }
    const sBeach = byScene('beach');
    if (sBeach) {
      const a = sBeach.a, cy = sBeach.cy;
      ctx.beginPath();
      for (let k = 0; k < 26; k++) {
        const d = 1.2 + k * .34, wv = (.9 - k * .02) * (.6 + .4 * Math.sin(t * 1.3 + k * 1.7));
        pj(sBeach.cx - 1.6 - d, cy - wv * .5 + .2, 0); ctx.moveTo(X, Y); pj(sBeach.cx - 1.6 - d, cy + wv * .5 + .2, 0); ctx.lineTo(X, Y);
      }
      ctx.strokeStyle = rgba(C.peach, (.18 + .62 * a) * (dark > .5 ? .7 : 1)); ctx.lineWidth = Math.max(1.5, Z * .11); ctx.stroke();
      for (let k = 0; k < 4; k++) {
        const u = (t * .09 + k / 4) % 1, x = 1.15 - u * 1.5;
        line3([[x + .25 * Math.sin(cy), cy - 7, 0], [x, cy - 2, 0], [x + .12, cy + 3, 0], [x - .1, cy + 8, 0]], rgba(C.white, (1 - u) * (.35 + .5 * a)), Math.max(1, Z * .05));
      }
    }

    /* land */
    ground(LAND, CS.edge, -.22); ground(MARIN, CS.edge, -.22); ground(YBI, CS.edge, -.2); ground(TI, CS.edge, -.2); ground(ALC, CS.edge, -.2);
    ground(LAND, CS.land); ground(MARIN, CS.park); ground(YBI, CS.park); ground(TI, CS.land); ground(ALC, CS.land);
    PARKS.forEach(p => ground(p, CS.park));
    ground(LAKE, CS.water);
    const sLad = byScene('ladies');
    if (sLad) ground([[sLad.cx - 1.5, sLad.cy - 1.5], [sLad.cx + 1.5, sLad.cy - 1.5], [sLad.cx + 1.5, sLad.cy - .3], [sLad.cx - 1.5, sLad.cy - .3]], CS.park);
    line3([[MK0[0], MK0[1], 0], [MK1[0], MK1[1], 0]], rgba(C.white, .9), Math.max(1.5, Z * .16));

    /* ground annotations */
    if (sRoute && sRoute.a > .01) {
      const a = sRoute.a, bx = Math.floor(sRoute.cx), by = Math.floor(sRoute.cy), pu = .5 + .5 * Math.sin(t * 2.4);
      HOT.forEach(o => ground([[bx + o[0] - .5, by + o[1] - .5], [bx + o[0] + 1.5, by + o[1] - .5], [bx + o[0] + 1.5, by + o[1] + 1.5], [bx + o[0] - .5, by + o[1] + 1.5]], rgba(C.rose, a * (.12 + .14 * pu))));
      ctx.setLineDash([Z * .12, Z * .18]);
      line3([[bx + ROUTE[0][0], by + ROUTE[0][1], 0], [bx + ROUTE[5][0], by + ROUTE[5][1], 0]], rgba(C.ink, a * .3), 1.2);
      ctx.setLineDash([Z * .3, Z * .16]); ctx.lineDashOffset = -t * Z * .5;
      line3(ROUTE.map(p => [bx + p[0], by + p[1], 0]), rgba(C[sRoute.accent], a), Math.max(2, Z * .1));
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
    }
    if (sBeam && sBeam.a > .01) {
      const ang = t * .7; ctx.beginPath(); M(sBeam.cx, sBeam.cy, 0);
      for (let k = 0; k <= 8; k++) L(sBeam.cx + Math.cos(ang + k * .07) * 4.4, sBeam.cy + Math.sin(ang + k * .07) * 4.4, 0);
      ctx.fillStyle = rgba(C[sBeam.accent], sBeam.a * .34); ctx.fill();
    }
    /* walking route between stops */
    const head = active < 0 ? 0 : routeLen[stops[clamp(Math.floor(pos), 0, N - 1)].ri] + (pos > 0 && pos < N - 1 ? (routeLen[stops[Math.min(N - 1, Math.floor(pos) + 1)].ri] - routeLen[stops[Math.floor(pos)].ri]) * (pos - Math.floor(pos)) : 0);
    if (pos > -.5) {
      ctx.beginPath();
      for (let i = 0; i < routePts.length; i++) {
        if (routeLen[i] > head) { const h = routeAt(head); L(h[0], h[1], 0); break; }
        i ? L(routePts[i][0], routePts[i][1], 0) : M(routePts[i][0], routePts[i][1], 0);
      }
      ctx.setLineDash([Z * .14, Z * .14]); ctx.strokeStyle = rgba(C.ink, .5 * sstep(-.5, 0, pos)); ctx.lineWidth = Math.max(1.2, Z * .055); ctx.stroke(); ctx.setLineDash([]);
    }

    /* city, back to front */
    const mrg = Z * 9, night = dark, beamAng = ((t * .7 + .28) % TAU + TAU) % TAU;
    for (let n = 0; n < items.length; n++) {
      const it = items[n];
      if (it.t === 1) {
        const px = (it.x0 - it.y0) * zx + ox, py = (it.x0 + it.y0) * zy + oy;
        if (px < -mrg || px > W + mrg || py < -Z || py > H + mrg) continue;
        let c = MONO[it.sh].css;
        if (it.hot && sRoute.a > .01) c = tint('rose', sRoute.a * (.55 + .45 * Math.sin(t * 2.4 + it.i)), it.sh);
        else if (it.mcp === 1 && sBeam.a > .01) { let d = Math.abs(((it.ang - beamAng) % TAU + TAU) % TAU); d = Math.min(d, TAU - d); c = tint(sBeam.accent, sBeam.a * (.5 + .5 * Math.exp(-d * d * 3)), it.sh); }
        box(it.x0, it.y0, it.x1, it.y1, it.z0, it.z0 + it.h, c);
        if (it.mcp === 2 && sBeam.a > .01) {
          ctx.beginPath(); M(it.x0, it.y0, it.z0 + it.h); L(it.x1, it.y0, it.z0 + it.h); L(it.x1, it.y1, it.z0 + it.h); L(it.x0, it.y1, it.z0 + it.h); ctx.closePath();
          ctx.strokeStyle = rgba(C[sBeam.accent], sBeam.a); ctx.lineWidth = 2; ctx.stroke();
        }
        if (night > .03 && Z > 9) {
          ctx.fillStyle = rgba(C.win, night * .9); ctx.beginPath();
          if (it.h > 1.1) {
            const rows = Math.min(9, Math.floor(it.h / .55));
            for (let r = 0; r < rows; r++) for (let q = 0; q < 2; q++) {
              const hv = hash(it.i * 7 + r, it.j * 3 + q);
              if (hv > .55) continue;
              const z = it.z0 + .3 + r * .55, u0 = .14 + q * .46, u1 = u0 + .26;
              if (hv < .3) { M(lerp(it.x0, it.x1, u0), it.y1, z + .24); L(lerp(it.x0, it.x1, u1), it.y1, z + .24); L(lerp(it.x0, it.x1, u1), it.y1, z); L(lerp(it.x0, it.x1, u0), it.y1, z); }
              else { M(it.x1, lerp(it.y0, it.y1, u0), z + .24); L(it.x1, lerp(it.y0, it.y1, u1), z + .24); L(it.x1, lerp(it.y0, it.y1, u1), z); L(it.x1, lerp(it.y0, it.y1, u0), z); }
            }
          } else if (it.r < .34) {
            const z = it.z0 + it.h * .3, u0 = .25 + it.r, u1 = u0 + .22;
            M(lerp(it.x0, it.x1, u0), it.y1, z + .13); L(lerp(it.x0, it.x1, u1), it.y1, z + .13); L(lerp(it.x0, it.x1, u1), it.y1, z); L(lerp(it.x0, it.x1, u0), it.y1, z);
          }
          ctx.fill();
        }
      } else if (it.t === 0) {
        const px = (it.x0 - it.y0) * zx + ox, py = (it.x0 + it.y0) * zy + oy;
        if (px < -mrg || px > W + mrg || py < -Z || py > H + mrg) continue;
        box(it.x0, it.y0, it.x1, it.y1, 0, it.e, [CS.land, MONO[3].css[1], MONO[3].css[2]]);
      } else if (it.t === 2) {
        pj(it.x, it.y, 0);
        if (X < -20 || X > W + 20 || Y < -20 || Y > H + 20) continue;
        const w = it.s * Z * .15, hgt = it.s * Z * .42, sway = Math.sin(t * .9 + it.ph) * Z * .012;
        ctx.fillStyle = it.v ? CS.tree1 : CS.tree0; ctx.beginPath(); ctx.moveTo(X - w, Y); ctx.lineTo(X + w, Y); ctx.lineTo(X + sway, Y - hgt); ctx.fill();
      } else if (it.t === 3) {
        (SC[it.s.scene] || SC.tower)(it.s, t);
      } else if (it.t === 4) {
        const s = it.s, k = .5 + .5 * s.a;
        cbox(s.cx + it.o[0], s.cy + it.o[1], .36, 0, it.o[2] * k, tint(s.accent, .2 + .5 * s.a, 2));
      } else if (it.t === 5) {
        const x = Math.floor(TA[0]) + .5, y = Math.floor(TA[1]) + .5, c = MONO[0].css;
        cbox(x, y, .36, 0, .5, c);
        ctx.fillStyle = c[1]; ctx.beginPath(); M(x - .36, y + .36, .5); L(x + .36, y + .36, .5); L(x, y, 6.2); ctx.fill();
        ctx.fillStyle = c[2]; ctx.beginPath(); M(x + .36, y - .36, .5); L(x + .36, y + .36, .5); L(x, y, 6.2); ctx.fill();
      } else if (it.t === 6) {
        const a = ll(37.8268, -122.4228); cbox(a[0], a[1], .28, 0, .4, MONO[1].css); cbox(a[0] + .3, a[1] - .1, .07, 0, 1.0, MONO[0].css);
      }
    }

    /* bridges */
    suspension(BA, BB, CS.steel, .8, 2.3, [.2, .42, .64, .86], lw);
    suspension(GA, GB, CS.bridge, .9, 3.3, [.2, .8], lw * 1.25);
    const sBr = byScene('bridge');
    if (sBr) for (let k = 0; k < 8; k++) {
      const u = (t * (.05 + .03 * sBr.a) + k / 8) % 1, v = k % 2 ? u : 1 - u, off = k % 2 ? .04 : -.04;
      sq(lerp(GA[0], GB[0], v) + off, lerp(GA[1], GB[1], v), .96, Math.max(1.2, Z * .045), night > .5 ? rgba(C.win, .95) : CS.ink);
    }
    if (night > .03) for (let k = 0; k <= 12; k++) { const u = k / 12; sq(lerp(BA[0], BB[0], u), lerp(BA[1], BB[1], u), .86, Math.max(1, Z * .03), rgba(C.win, night * .8)); }

    /* scene overlays */
    if (sAg && sAg.a > .01) {
      const k = .5 + .5 * sAg.a, tops = [[sAg.cx, sAg.cy, 7.1 * k]].concat(AG.map(o => [sAg.cx + o[0], sAg.cy + o[1], o[2] * k]));
      const loop = [0, 1, 2, 3, 0], col = rgba(C[sAg.accent], sAg.a);
      line3(loop.map(q => tops[q]), rgba(C[sAg.accent], sAg.a * .55), 1.3);
      for (let e = 0; e < 4; e++) for (let m = 0; m < 2; m++) {
        const u = (t * .3 + e * .37 + m * .5) % 1, A_ = tops[loop[e]], B_ = tops[loop[e + 1]];
        sq(lerp(A_[0], B_[0], u), lerp(A_[1], B_[1], u), lerp(A_[2], B_[2], u), Math.max(3, Z * .11), col);
      }
    }
    if (sRoute && sRoute.a > .01) {
      const bx = Math.floor(sRoute.cx), by = Math.floor(sRoute.cy), a = sRoute.a, col = rgba(C[sRoute.accent], a);
      let tot = 0; const seg = [];
      for (let i = 1; i < ROUTE.length; i++) { const l = Math.abs(ROUTE[i][0] - ROUTE[i - 1][0]) + Math.abs(ROUTE[i][1] - ROUTE[i - 1][1]); seg.push(l); tot += l; }
      let d = ((t * .16) % 1.15) * tot, i = 0; d = Math.min(d, tot - .001);
      while (d > seg[i]) { d -= seg[i]; i++; }
      const u = d / seg[i];
      sq(bx + lerp(ROUTE[i][0], ROUTE[i + 1][0], u), by + lerp(ROUTE[i][1], ROUTE[i + 1][1], u), .1 + .12 * Math.abs(Math.sin(t * 6)), Math.max(3.5, Z * .13), rgba(C.ink, a));
      sq(bx + ROUTE[0][0], by + ROUTE[0][1], 0, Math.max(3, Z * .11), col);
      pj(bx + ROUTE[5][0], by + ROUTE[5][1], 0); const r = Math.max(5, Z * .2);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(X - r, Y + r * .5); ctx.lineTo(X + r, Y + r * .5); ctx.lineTo(X, Y - r * 1.2); ctx.fill();
    }
    const sRing = byScene('rings');
    if (sRing && sRing.a > .01) for (let k = 0; k < 3; k++) { const u = (t * .3 + k / 3) % 1; ring(sRing.cx, sRing.cy, sRing.ringZ, .3 + u * 4.6, rgba(C[sRing.accent], (1 - u) * sRing.a), 2); }
    const sPark = byScene('park');
    if (sPark && sPark.a > .01) [-3.2, -1.2, 1.4].forEach((dx, k) => {
      const z = 1 + .16 * Math.sin(t * 1.6 + k * 2), x = sPark.cx + dx, y = sPark.cy + (k - 1) * .5, r = Math.max(4, Z * .15), col = rgba(C[sPark.accent], sPark.a);
      line3([[x, y, 0], [x, y, z]], rgba(C.ink, sPark.a * .4), 1); pj(x, y, z);
      ctx.fillStyle = col; ctx.beginPath();
      if (k === 2) { ctx.moveTo(X - r, Y + r); ctx.lineTo(X + r, Y + r); ctx.lineTo(X, Y - r); } else ctx.rect(X - r, Y - r, r * 2, r * 2);
      ctx.fill();
    });
    const sFer = byScene('ferry');
    {
      const dst = sFer ? [sFer.cx + 1.3, sFer.cy] : [35, 14], src = [dst[0] + 5, dst[1] - 9], u = (t * .035) % 1, e = sstep(0, 1, u);
      const x = lerp(src[0], dst[0], e), y = lerp(src[1], dst[1], e);
      line3([[x + .4, y - .9, 0], [x, y - .1, 0]], rgba(C.white, .7), 1.4); line3([[x + .75, y - .75, 0], [x + .2, y, 0]], rgba(C.white, .45), 1.2);
      box(x - .13, y - .34, x + .13, y + .34, 0, .16, [CS.white, MONO[2].css[1], MONO[2].css[2]]);
      box(x - .09, y - .16, x + .09, y + .14, .16, .3, sFer ? tint(sFer.accent, .5 + .5 * sFer.a) : MONO[1].css);
    }
    boats.forEach(b => {
      pj(b[0] + Math.sin(t * .1 + b[2]) * .6, b[1] + Math.cos(t * .08 + b[2]) * .4, 0);
      if (X < -20 || X > W + 20 || Y < -20 || Y > H + 20) return;
      const r = Math.max(3, Z * .16);
      ctx.fillStyle = CS.white; ctx.beginPath(); ctx.moveTo(X, Y - r * 2); ctx.lineTo(X, Y); ctx.lineTo(X + r, Y); ctx.fill();
      ctx.fillStyle = CS.ink; ctx.fillRect(X - r * .7, Y, r * 1.9, Math.max(1, r * .25));
    });

    /* fog */
    const fogAmt = clamp(.5 + .5 * Math.max(sBeach ? sBeach.a : 0, sBr ? sBr.a : 0) + .25 * hero, 0, 1);
    fogs.forEach(g => {
      const span = 44, u = ((g[0] + t * .35 * (.5 + g[3])) % span) / span, x = -10 + u * span, a = Math.sin(u * Math.PI) * g[4] * fogAmt * (1 - .5 * dark) * (1 - sstep(14, 30, x));
      if (a < .01) return;
      pj(x, g[1], 2.4);
      const r = g[2] * Z * 1.25;
      if (X < -r || X > W + r || Y < -r || Y > H + r) return;
      ctx.save(); ctx.translate(X, Y); ctx.scale(1, .5);
      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      gr.addColorStop(0, rgba(C.fog, a * 1.5)); gr.addColorStop(.55, rgba(C.fog, a * .8)); gr.addColorStop(1, rgba(C.fog, 0));
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.restore();
    });

    /* pins and viewfinder */
    hover = -1; let best = 34 * 34;
    stops.forEach(s => {
      const bob = .14 * Math.sin(t * 1.5 + s.i), z = s.top + .7 + bob;
      pj(s.cx, s.cy, s.top + .05); const bx = X, by = Y; pj(s.cx, s.cy, z);
      s.sx = X; s.sy = Y;
      const dx = mx - X, dy = my - Y, d2 = dx * dx + dy * dy; if (d2 < best) { best = d2; hover = s.i; }
      ctx.strokeStyle = rgba(C.ink, .45); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(X, Y); ctx.stroke();
      const r = 4.5 + 2.5 * s.a + (hover === s.i ? 1.5 : 0);
      ctx.fillStyle = CS[s.accent]; ctx.strokeStyle = CS.ink; ctx.lineWidth = 1.2; ctx.beginPath();
      const m = s.a;
      ctx.moveTo(X - r, Y + r * .9); ctx.lineTo(X + r, Y + r * .9); ctx.lineTo(X + r * (1 - m), Y - r * .9); ctx.lineTo(X - r * (1 - m), Y - r * .9); ctx.closePath();
      ctx.fill(); ctx.stroke();
    });
    if (pos > -.5) {
      const h = routeAt(head), hop = .12 + .16 * Math.abs(Math.sin(t * 5));
      sq(h[0], h[1], 0, Math.max(3, Z * .1), rgba(C.ink, .25)); sq(h[0], h[1], hop, Math.max(3, Z * .1), CS.ink);
    }
    if (active >= 0) {
      const s = stops[active], e = sstep(0, 1, lock), R = Math.min(W, H) * (mobile ? .2 : .19) * (1.4 - .4 * e), arm = R * .28;
      const cx = fx, cy = fy - Z * .5;
      ctx.strokeStyle = rgba(C.ink, .75 * e); ctx.lineWidth = 1.6; ctx.beginPath();
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(q => { ctx.moveTo(cx + q[0] * R, cy + q[1] * R * .8 - q[1] * arm); ctx.lineTo(cx + q[0] * R, cy + q[1] * R * .8); ctx.lineTo(cx + q[0] * R - q[0] * arm, cy + q[1] * R * .8); });
      ctx.stroke();
      ctx.font = '12px "Geist Pixel", monospace'; ctx.fillStyle = rgba(C.ink, .8 * e); ctx.textBaseline = 'top'; ctx.textAlign = 'left';
      ctx.fillText(s.coords, cx - R, cy + R * .8 + 8);
    }

    /* page chrome */
    if (active !== lastActive) {
      lastActive = active;
      whereEl.textContent = active < 0 ? S.hero.place : String(active + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0') + '  ' + stops[active].place;
      railBtns.forEach((b, i) => b.setAttribute('aria-current', i === active ? 'true' : 'false'));
    }
    if (hover >= 0 && mx > -999) { tip.textContent = stops[hover].place; tip.style.left = stops[hover].sx + 'px'; tip.style.top = stops[hover].sy + 'px'; tip.style.opacity = 1; cv.style.cursor = 'pointer'; }
    else { tip.style.opacity = 0; cv.style.cursor = ''; }
    for (const m of morphs) {
      const r = m.el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > H + 50) continue;
      const target = m.pointer ? 25 + 25 * (mx > -999 ? clamp(mx / W, 0, 1) : .5 + .5 * Math.sin(t * .5)) : 25 + 25 * clamp(1 - ((r.top + r.bottom) / 2) / H, 0, 1);
      m.v += (target - m.v) * (reduce ? 1 : .12);
      m.el.style.fontVariationSettings = '"ELSH" ' + m.v.toFixed(2);
    }
  }

  /* map interaction */
  cv.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dirty = true; }, { passive: true });
  cv.addEventListener('pointerleave', () => { mx = my = -9999; dirty = true; });
  addEventListener('pointermove', e => { if (e.target !== cv && e.pointerType === 'mouse') { mx = e.clientX; my = -9999; } }, { passive: true });
  cv.addEventListener('click', e => {
    let best = 40 * 40, hit = -1;
    stops.forEach(s => { const dx = e.clientX - s.sx, dy = e.clientY - s.sy, d = dx * dx + dy * dy; if (d < best) { best = d; hit = s.i; } });
    if (hit >= 0) goTo(stops[hit].id);
  });

  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('i.on').forEach((b, i) => b.animate([{ opacity: .12, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 420, delay: i * 38, easing: 'cubic-bezier(.22,.8,.2,1)', fill: 'backwards' }));
      io.unobserve(e.target);
    }), { threshold: .6 });
    document.querySelectorAll('.cells').forEach(c => io.observe(c));
  }

  readTheme(); resize();
  { const p = pose(-1); cam.x = p.x; cam.y = p.y; cam.z = p.z * .82; }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { dirty = true; });
  requestAnimationFrame(frame);
})();
