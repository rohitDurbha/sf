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
     WORLD. One unit is about 110 metres, laid out from real coordinates.
     ===================================================================== */
  const GW = 132, GH = 141, ZK = .8, FY = .4972;
  const ll = (lat, lon) => [(lon + 122.52) / 0.165 * GW, (37.84 - lat) / 0.14 * GH];
  const toLL = (x, y) => [37.84 - y / GH * 0.14, x / GW * 0.165 - 122.52];
  const P = a => a.map(p => ll(p[0], p[1]));
  const inPoly = (x, y, p) => {
    let c = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c;
    }
    return c;
  };
  const circ = (lat, lon, r, n) => { const c = ll(lat, lon); return Array.from({ length: n || 14 }, (_, i) => [c[0] + Math.cos(i / (n || 14) * TAU) * r, c[1] + Math.sin(i / (n || 14) * TAU) * r * .8]); };

  const LAND = P([[37.7080, -122.5020], [37.7200, -122.5055], [37.7350, -122.5075], [37.7500, -122.5090], [37.7650, -122.5110], [37.7750, -122.5130],
    [37.7800, -122.5140], [37.7850, -122.5100], [37.7880, -122.5050], [37.7870, -122.4950], [37.7900, -122.4870], [37.7960, -122.4830], [37.8030, -122.4790], [37.8105, -122.4772],
    [37.8080, -122.4720], [37.8060, -122.4650], [37.8055, -122.4520], [37.8075, -122.4480], [37.8070, -122.4360], [37.8060, -122.4310], [37.8085, -122.4290], [37.8065, -122.4240],
    [37.8090, -122.4170], [37.8105, -122.4105], [37.8075, -122.4055], [37.8040, -122.4010], [37.7990, -122.3970], [37.7950, -122.3930], [37.7900, -122.3885], [37.7860, -122.3875],
    [37.7810, -122.3880], [37.7775, -122.3885], [37.7745, -122.3870], [37.7680, -122.3855], [37.7620, -122.3810], [37.7560, -122.3800], [37.7500, -122.3790], [37.7470, -122.3760],
    [37.7420, -122.3740], [37.7390, -122.3680], [37.7300, -122.3560], [37.7230, -122.3600], [37.7220, -122.3700], [37.7170, -122.3780], [37.7120, -122.3790], [37.7085, -122.3850], [37.7080, -122.3930]]);
  const SOUTH = P([[37.7082, -122.5020], [37.7082, -122.3930], [37.6900, -122.3890], [37.6900, -122.4990]]);
  const MARIN = P([[37.8460, -122.5000], [37.8460, -122.4660], [37.8330, -122.4720], [37.8272, -122.4792], [37.8250, -122.4880], [37.8300, -122.5000]]);
  const YBI = P([[37.8130, -122.3720], [37.8120, -122.3620], [37.8070, -122.3600], [37.8060, -122.3690]]);
  const TI = P([[37.8320, -122.3780], [37.8320, -122.3640], [37.8150, -122.3620], [37.8140, -122.3740]]);
  const ALC = P([[37.8285, -122.4255], [37.8280, -122.4205], [37.8252, -122.4205], [37.8256, -122.4250]]);
  const SAND = P([[37.7790, -122.5136], [37.7790, -122.5108], [37.7350, -122.5052], [37.7090, -122.5005], [37.7090, -122.5022], [37.7350, -122.5075], [37.7650, -122.5110]]);
  const PARKS = [
    [[37.7742, -122.5110], [37.7742, -122.4545], [37.7655, -122.4545], [37.7645, -122.5105]],
    [[37.7733, -122.4545], [37.7733, -122.4410], [37.7712, -122.4410], [37.7712, -122.4545]],
    [[37.8090, -122.4770], [37.8060, -122.4650], [37.8050, -122.4480], [37.7990, -122.4470], [37.7880, -122.4470], [37.7870, -122.4830], [37.7900, -122.4860], [37.7960, -122.4825], [37.8030, -122.4785]],
    [[37.7872, -122.5100], [37.7880, -122.4950], [37.7800, -122.4930], [37.7790, -122.5135], [37.7850, -122.5100]],
    [[37.7330, -122.5060], [37.7330, -122.4840], [37.7090, -122.4830], [37.7090, -122.5020]],
    [[37.7370, -122.4950], [37.7370, -122.4740], [37.7345, -122.4740], [37.7345, -122.4950]],
    [[37.7250, -122.4280], [37.7260, -122.4100], [37.7120, -122.4100], [37.7130, -122.4270]],
    [[37.7460, -122.4440], [37.7450, -122.4390], [37.7360, -122.4380], [37.7370, -122.4440]],
    [[37.7610, -122.4620], [37.7610, -122.4430], [37.7480, -122.4430], [37.7480, -122.4600]],
    [[37.7410, -122.4590], [37.7410, -122.4500], [37.7355, -122.4500], [37.7355, -122.4590]],
    [[37.7705, -122.4440], [37.7705, -122.4385], [37.7660, -122.4385], [37.7660, -122.4440]],
    [[37.7775, -122.4365], [37.7775, -122.4332], [37.7752, -122.4332], [37.7752, -122.4365]],
    [[37.7615, -122.4285], [37.7615, -122.4255], [37.7582, -122.4255], [37.7582, -122.4285]],
    [[37.7455, -122.4185], [37.7455, -122.4100], [37.7405, -122.4100], [37.7405, -122.4185]],
    [[37.8072, -122.4440], [37.8068, -122.4360], [37.8055, -122.4360], [37.8058, -122.4440]],
    [[37.7160, -122.3880], [37.7150, -122.3790], [37.7095, -122.3800], [37.7095, -122.3880]],
    [[37.8013, -122.4107], [37.8013, -122.4090], [37.8000, -122.4090], [37.8000, -122.4107]],
    [[37.7922, -122.4290], [37.7922, -122.4262], [37.7905, -122.4262], [37.7905, -122.4290]],
    [[37.8040, -122.4070], [37.8040, -122.4040], [37.8010, -122.4040], [37.8010, -122.4070]]
  ].map(P);
  const LAKES = [P([[37.7280, -122.5000], [37.7290, -122.4920], [37.7200, -122.4880], [37.7120, -122.4900], [37.7120, -122.4960], [37.7210, -122.4990]]),
    circ(37.7686, -122.4750, 1.3), circ(37.7882, -122.4690, .7), circ(37.8025, -122.4484, .8), circ(37.7700, -122.5020, .7)];
  /* hills drawn as stepped green mounds: lat, lon, height, radius */
  const HILLS = [[37.7544, -122.4477, 2.4, 4.6], [37.7582, -122.4545, 2.2, 3.8], [37.7383, -122.4545, 2.4, 3.2], [37.7432, -122.4142, 1.4, 2.8],
    [37.7682, -122.4412, 1.3, 2.2], [37.8024, -122.4058, 1.0, 1.5], [37.7185, -122.4190, 1.2, 4.6], [37.7840, -122.5040, .8, 2.6], [37.7975, -122.4680, .9, 5]]
    .map(h => { const p = ll(h[0], h[1]); return { x: p[0], y: p[1], h: h[2], r: h[3] }; });
  const hillAt = (x, y) => { for (const h of HILLS) if (Math.hypot(x - h.x, (y - h.y) / .8) < h.r * .86) return h; return null; };

  const segDist = (x, y, a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const h = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy), 0, 1);
    return Math.hypot(x - a[0] - dx * h, y - a[1] - dy * h);
  };
  /* wide streets that cut through the grid: points, half width, name */
  const ROADS = [
    [[[37.7947, -122.3948], [37.7626, -122.4350]], .34, 'Market St'],
    [[[37.8060, -122.4245], [37.7745, -122.4192]], .3, 'Van Ness Ave'],
    [[[37.7795, -122.5090], [37.7815, -122.4590], [37.7872, -122.4040]], .28, 'Geary Blvd'],
    [[[37.7650, -122.4770], [37.7110, -122.4745]], .3, '19th Ave'],
    [[[37.7890, -122.4725], [37.7745, -122.4720]], .28, ''],
    [[[37.7995, -122.4470], [37.8010, -122.4245]], .28, 'Lombard St'],
    [[[37.7958, -122.4032], [37.8062, -122.4190]], .26, 'Columbus Ave'],
    [[[37.7760, -122.3900], [37.7300, -122.3920]], .28, '3rd St'],
    [[[37.7740, -122.5100], [37.7355, -122.5065]], .22, 'Great Hwy'],
    [[[37.7652, -122.4545], [37.7652, -122.5080]], .24, 'Lincoln Way'],
    [[[37.7745, -122.4545], [37.7745, -122.5090]], .24, 'Fulton St'],
    [[[37.7710, -122.4230], [37.7260, -122.4340]], .0, 'Mission St']
  ].map(r => ({ p: P(r[0]), w: r[1], name: r[2] }));
  const FREEWAYS = [
    [[37.7705, -122.4062], [37.7860, -122.3925], [37.7886, -122.3880]],
    [[37.7705, -122.4062], [37.7640, -122.4050], [37.7520, -122.4035], [37.7400, -122.4075], [37.7320, -122.4050], [37.7090, -122.3990]],
    [[37.7745, -122.3975], [37.7600, -122.3925], [37.7480, -122.3930], [37.7340, -122.4060], [37.7300, -122.4350], [37.7200, -122.4480], [37.7090, -122.4580]],
    [[37.7705, -122.4062], [37.7718, -122.4180], [37.7745, -122.4232]]
  ].map(P);
  const nearRoad = (x, y) => {
    for (const r of ROADS) for (let i = 0; i < r.p.length - 1; i++) if (r.w && segDist(x, y, r.p[i], r.p[i + 1]) < r.w + .32) return true;
    for (const f of FREEWAYS) for (let i = 0; i < f.length - 1; i++) if (segDist(x, y, f[i], f[i + 1]) < .5) return true;
    return false;
  };

  const SOMA = P([[37.7947, -122.3948], [37.7735, -122.4215], [37.7685, -122.4120], [37.7700, -122.4020], [37.7745, -122.3920], [37.7800, -122.3880], [37.7890, -122.3880]]);
  const REGIONS = [
    { t: (la, lo, x, y) => inPoly(x, y, SOMA), rot: 45, px: 2.3, py: 1.5, g: .26 },
    { t: (la, lo) => la < 37.748 && lo > -122.405, rot: 42, px: 1.0, py: 2.3 },
    { t: (la, lo) => lo > -122.4035 && la < 37.768, rot: -8, px: 1.05, py: 2.2 },
    { t: (la, lo) => la < 37.731 && lo > -122.447 && lo <= -122.405, rot: 38, px: .9, py: 2.2 },
    { t: (la, lo) => la < 37.752 && la >= 37.722 && lo < -122.445 && lo > -122.474, rot: 18, px: 1.3, py: 1.6, sparse: 1 },
    { t: (la, lo) => lo <= -122.4545, rot: 0, px: 1.0, py: 1.85 },
    { t: (la, lo) => la < 37.731, rot: 8, px: 1.0, py: 2.0 },
    { t: (la, lo) => la < 37.7705, rot: -8, px: 1.5, py: 1.45 },
    { t: () => true, rot: -8, px: 1.14, py: .78 }
  ];
  const regionOf = (x, y) => { const g = toLL(x, y); for (let k = 0; k < REGIONS.length; k++) if (REGIONS[k].t(g[0], g[1], x, y)) return k; return REGIONS.length - 1; };
  const DC = [[37.7915, -122.3990, 1, 5.4], [37.7885, -122.3950, .8, 4], [37.7790, -122.4190, .34, 4], [37.7700, -122.3900, .3, 3.2], [37.7870, -122.4100, .3, 4.5]]
    .map(d => { const p = ll(d[0], d[1]); return [p[0], p[1], d[2], d[3]]; });
  const dens = (x, y) => { let v = 0; for (const d of DC) { const dx = x - d[0], dy = y - d[1]; v += d[2] * Math.exp(-(dx * dx + dy * dy) / (2 * d[3] * d[3])); } return Math.min(1, v); };

  /* stops and reserved ground */
  const RES = { ferry: 2.6, cranes: 3.2, agents: 1.2, ladies: 2.0, tower: 1.1, park: .8 };
  const reserved = [];
  stops.forEach((s, i) => {
    const p = ll(s.at[0], s.at[1]);
    s.i = i; s.cx = p[0]; s.cy = p[1]; s.a = 0; s.top = 1.5; s.sx = 0; s.sy = 0;
    const h = hillAt(p[0], p[1]); s.e = h ? h.h : 0;
    if (RES[s.scene]) reserved.push([p[0], p[1], RES[s.scene]]);
  });
  const byScene = n => stops.find(s => s.scene === n);
  const sAg = byScene('agents'), sRoute = byScene('route'), sBeam = byScene('beam'), sRing = byScene('rings'), sPark = byScene('park'),
    sBeach = byScene('beach'), sBr = byScene('bridge'), sFer = byScene('ferry'), sLad = byScene('ladies');
  const AG = [[-2.6, 1.4, 3.0], [2.4, 2.2, 2.5], [-.9, -2.8, 3.4]];
  if (sAg) AG.forEach(o => reserved.push([sAg.cx + o[0], sAg.cy + o[1], .75]));
  const MARKS = {
    pyramid: ll(37.7952, -122.4028), boa: ll(37.7920, -122.4038), hall: ll(37.7793, -122.4193), palace: ll(37.8029, -122.4484),
    oracle: ll(37.7786, -122.3893), chase: ll(37.7680, -122.3877), mary: ll(37.7843, -122.4253), mill: ll(37.7705, -122.5093),
    young: ll(37.7715, -122.4687), emb: ll(37.7948, -122.3985)
  };
  [['pyramid', .8], ['boa', .8], ['hall', 1.7], ['palace', 1.2], ['oracle', 2.3], ['chase', 1.7], ['mary', 1], ['emb', 1.6]].forEach(m => reserved.push([MARKS[m[0]][0], MARKS[m[0]][1], m[1]]));
  const isReserved = (x, y) => { for (const r of reserved) if (Math.hypot(x - r[0], y - r[1]) < r[2]) return true; return false; };

  /* ---------- the illustrated strip ----------
     Isometric artwork by Justin Chavez (github.com/JustinChavez/sf-isometric-demo), downsampled.
     Each source quadrant maps to the ground with a straight linear fit. */
  const tY = u => .90643 * (u - .5) + 19.6896, tX = v => 128.9118 - 1.82294 * (v - .3);
  const STRIP = { y0: tY(26), y1: tY(125), xE: tX(20), xW: tX(33) };
  const inStrip = (x, y, m) => { m = m || 0; return y > STRIP.y0 - m && y < STRIP.y1 + m && x < STRIP.xE + m && x > STRIP.xW - m; };
  /* the camera looks east, so a wall is visible when it faces west */
  const facesFor = (cs, sn) => { const f = []; [[sn, -cs], [cs, sn], [-sn, cs], [-cs, -sn]].forEach((n, i) => { if (n[0] < -1e-6) f.push(i, Math.abs(n[0]) >= Math.abs(n[1]) ? 1 : 2); }); return f; };

  /* ---------- buildings ---------- */
  const mk = (R, lx0, ly0, lx1, ly1, z0, h, pal, c, win) => {
    const cs = R.cs, sn = R.sn, q = new Float32Array(8), L = [lx0, ly0, lx1, ly0, lx1, ly1, lx0, ly1];
    for (let i = 0; i < 4; i++) { q[i * 2] = L[i * 2] * cs - L[i * 2 + 1] * sn; q[i * 2 + 1] = L[i * 2] * sn + L[i * 2 + 1] * cs; }
    return { q, z0, h, pal, c, f: R.faces, key: -(q[0] + q[4]) / 2 + (q[1] + q[5]) * 1e-4, win: win || 0, sd: hash(lx0 * 37 + R.rot, ly0 * 53) };
  };
  REGIONS.forEach(R => {
    const a = R.rot * Math.PI / 180; R.cs = Math.cos(a); R.sn = Math.sin(a); R.g = R.g || .2;
    R.faces = facesFor(R.cs, R.sn);
  });
  const R0 = REGIONS[REGIONS.length - 1];
  const builds = [], slabs = [], pads = [];
  REGIONS.forEach((R, k) => {
    const inv = (x, y) => [x * R.cs + y * R.sn, -x * R.sn + y * R.cs];
    const cr = [inv(-2, -2), inv(GW + 2, -2), inv(GW + 2, GH + 2), inv(-2, GH + 2)];
    const i0 = Math.floor(Math.min(...cr.map(c => c[0])) / R.px), i1 = Math.ceil(Math.max(...cr.map(c => c[0])) / R.px);
    const j0 = Math.floor(Math.min(...cr.map(c => c[1])) / R.py), j1 = Math.ceil(Math.max(...cr.map(c => c[1])) / R.py);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const lcx = (i + .5) * R.px, lcy = (j + .5) * R.py, x = lcx * R.cs - lcy * R.sn, y = lcx * R.sn + lcy * R.cs;
      if (x < 0 || y < 0 || x > GW || y > GH || !inPoly(x, y, LAND) || regionOf(x, y) !== k) continue;
      if (inStrip(x, y, .35) || PARKS.some(p => inPoly(x, y, p)) || LAKES.some(p => inPoly(x, y, p)) || hillAt(x, y) || isReserved(x, y) || nearRoad(x, y)) continue;
      const g = R.g, x0 = i * R.px + g / 2, y0 = j * R.py + g / 2, x1 = x0 + R.px - g, y1 = y0 + R.py - g, w = x1 - x0, h = y1 - y0;
      const r1 = hash(i + k * 97, j), r2 = hash(i + 31, j + k * 59), d = dens(x, y), g2 = toLL(x, y);
      if (R.sparse && r1 < .2) continue;
      const ind = (g2[1] > -122.3975 && g2[0] < 37.766) || (k === 1 && g2[1] > -122.392);
      const pad = mk(R, x0 - .04, y0 - .04, x1 + .04, y1 + .04, 0, 0, 0, 0); pad.res = 0; pad.bc = Math.floor(r1 * 9);
      pads.push(pad);
      const first = builds.length;
      if (d > .42) {
        const n = 1 + (r1 < .55 ? 1 : 0) + (Math.max(w, h) > 1.6 ? 1 : 0), alongX = w >= h;
        for (let m = 0; m < n; m++) {
          const rr = hash(i * 7 + m, j * 13 + k), hh = .5 + 3.1 * d * Math.pow(.25 + .75 * rr, 1.3), a0 = m / n, a1 = (m + 1) / n, s = .05;
          builds.push(alongX ? mk(R, lerp(x0, x1, a0) + s, y0 + s, lerp(x0, x1, a1) - s, y1 - s, 0, hh, 1, Math.floor(rr * 5), 1)
            : mk(R, x0 + s, lerp(y0, y1, a0) + s, x1 - s, lerp(y0, y1, a1) - s, 0, hh, 1, Math.floor(rr * 5), 1));
        }
        for (let m = first; m < builds.length; m++) slabs.push(builds[m]);
      } else if (ind) {
        const n = r1 < .5 ? 1 : 2;
        for (let m = 0; m < n; m++) builds.push(mk(R, x0 + .06, lerp(y0, y1, m / n) + .06, x1 - .06, lerp(y0, y1, (m + 1) / n) - .06, 0, .13 + .12 * hash(i + m, j), 1, (m + i & 1) ? 3 : 0, 0));
        for (let m = first; m < builds.length; m++) slabs.push(builds[m]);
      } else {
        const mid = d > .15, lot = mid ? .46 : .34, alongX = w >= h, len = alongX ? w : h, dep = alongX ? h : w, n = Math.max(1, Math.round(len / lot));
        pad.res = mid ? 0 : 1;
        for (let row = 0; row < 2; row++) {
          const d0 = row ? dep * (mid ? .52 : .6) : 0, d1 = row ? dep : dep * (mid ? .48 : .4);
          let hs = 0;
          for (let m = 0; m < n; m++) {
            const rr = hash(i * 11 + m + row * 131, j * 17 + k), a0 = m / n * len + .012, a1 = (m + 1) / n * len - .012;
            if (R.sparse && rr < .12) continue;
            const hh = mid ? .22 + 1.2 * d * (.4 + .6 * rr) + rr * .1 : .13 + rr * .1; hs += hh;
            const pal = mid && rr > .5 ? 1 : 0, c = pal ? Math.floor(rr * 5) : Math.floor(hash(i + m * 3, j + row) * 9);
            builds.push(alongX ? mk(R, x0 + a0, y0 + d0, x0 + a1, y0 + d1, 0, hh, pal, c, mid ? 1 : 0) : mk(R, x0 + d0, y0 + a0, x0 + d1, y0 + a1, 0, hh, pal, c, mid ? 1 : 0));
          }
          const sl = alongX ? mk(R, x0, y0 + d0, x1, y0 + d1, 0, hs / n || .15, 0, pad.bc, 0) : mk(R, x0 + d0, y0, x0 + d1, y1, 0, hs / n || .15, 0, pad.bc, 0);
          sl.soft = 1; slabs.push(sl);
        }
      }
    }
  });
  /* piers along the Embarcadero */
  const piers = [];
  { const a = ll(37.8098, -122.4120), pts = [a, ll(37.8075, -122.4055), ll(37.8040, -122.4010), ll(37.7990, -122.3970), ll(37.7950, -122.3930), ll(37.7900, -122.3885), ll(37.7830, -122.3878)];
    const RP = { rot: -45, faces: [], g: 0 }; const an = -Math.PI / 4; RP.cs = Math.cos(an); RP.sn = Math.sin(an);
    RP.faces = facesFor(RP.cs, RP.sn);
    for (let s = 0; s < pts.length - 1; s++) { const n = Math.max(2, Math.round(Math.hypot(pts[s + 1][0] - pts[s][0], pts[s + 1][1] - pts[s][1]) / 1.15));
      for (let m = 0; m < n; m++) { if (s === 3 && m === n - 1) continue; const u = (m + .5) / n, x = lerp(pts[s][0], pts[s + 1][0], u) + .25, y = lerp(pts[s][1], pts[s + 1][1], u) - .25;
        if (inStrip(x, y, .5)) continue; const lx = x * RP.cs + y * RP.sn, ly = -x * RP.sn + y * RP.cs, len = 1.7 + hash(s, m) * .9;
        piers.push(mk(RP, lx - .1, ly - .3, lx + len, ly + .3, 0, .13, 1, 3, 0)); } } }
  const byKey = (a, b) => a.key - b.key;
  builds.sort(byKey); slabs.sort(byKey); pads.sort(byKey);
  const BS = 8, BW = Math.ceil((GW + 4) / BS) + 1;
  const bucketize = arr => { const m = new Map(); arr.forEach((b, i) => { const k = Math.floor((b.q[0] + 2) / BS) + Math.floor((b.q[1] + 2) / BS) * BW; let l = m.get(k); if (!l) m.set(k, l = []); l.push(i); }); return m; };
  const bkB = bucketize(builds), bkS = bucketize(slabs), bkP = bucketize(pads);

  const trees = [];
  [[0, 300], [1, 26], [2, 300], [3, 60], [4, 130], [5, 26], [6, 90], [7, 26], [8, 110], [9, 30], [10, 26], [11, 10], [12, 8], [13, 22], [15, 14], [17, 6], [18, 12]].forEach(z => {
    const p = PARKS[z[0]], xs = p.map(q => q[0]), ys = p.map(q => q[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    let n = 0, guard = 0;
    while (n < z[1] && guard++ < 6000) { const x = lerp(x0, x1, rnd()), y = lerp(y0, y1, rnd()); if (!inPoly(x, y, p) || inStrip(x, y, .2) || LAKES.some(l => inPoly(x, y, l))) continue; const h = hillAt(x, y);
      trees.push({ x, y, z: h ? h.h * Math.max(0, Math.ceil((1 - Math.hypot(x - h.x, (y - h.y) / .8) / h.r) * 4) / 4) : 0, s: .7 + rnd() * .7, v: rnd() < .5 ? 0 : 1, key: -x }); n++; }
  });
  [[MARIN, 60], [YBI, 16]].forEach(z => { let n = 0, g = 0; while (n < z[1] && g++ < 3000) { const x = lerp(20, 130, rnd()), y = lerp(-8, 40, rnd()); if (inPoly(x, y, z[0])) { trees.push({ x, y, z: 0, s: .8 + rnd() * .6, v: n & 1, key: -x }); n++; } } });
  trees.sort(byKey);

  const ticks = [];
  for (let k = 0; k < 900; k++) { const x = -70 + rnd() * 270, y = -70 + rnd() * 290; if (inPoly(x, y, LAND) || inPoly(x, y, SOUTH) || inPoly(x, y, TI)) continue; ticks.push([x, y, .6 + rnd() * 1.6, Math.floor(rnd() * 3)]); }
  const boats = [[37.825, -122.44], [37.818, -122.40], [37.832, -122.392], [37.800, -122.376], [37.775, -122.371], [37.742, -122.362], [37.834, -122.432], [37.79, -122.528], [37.75, -122.522], [37.815, -122.455]].map(p => ll(p[0], p[1]).concat([rnd() * TAU]));
  const fogs = Array.from({ length: 22 }, () => [rnd() * 120, rnd() * 141, 7 + rnd() * 10, rnd(), .22 + rnd() * .2]);
  const GA = ll(37.8107, -122.4772), GB = ll(37.8272, -122.4792), BA = ll(37.7886, -122.3880), BB = ll(37.8085, -122.3665);

  const LABELS = [];
  const lab = (lat, lon, text, kind, min, max) => { const p = ll(lat, lon); LABELS.push({ x: p[0], y: p[1], text, kind, min: min || 0, max: max || 999 }); };
  [[37.7946, -122.3999, 'Financial District'], [37.7941, -122.4078, 'Chinatown'], [37.8005, -122.4105, 'North Beach'], [37.8011, -122.4194, 'Russian Hill'], [37.7928, -122.4165, 'Nob Hill'],
    [37.8022, -122.4370, 'Marina'], [37.7918, -122.4382, 'Pacific Heights'], [37.7945, -122.4662, 'Presidio'], [37.7795, -122.4860, 'Richmond'], [37.7545, -122.4900, 'Sunset'],
    [37.7692, -122.4481, 'Haight-Ashbury'], [37.7812, -122.4330, 'Western Addition'], [37.7836, -122.4145, 'Tenderloin'], [37.7775, -122.4060, 'SoMa'], [37.7706, -122.3920, 'Mission Bay'],
    [37.7585, -122.3890, 'Dogpatch'], [37.7590, -122.4005, 'Potrero Hill'], [37.7570, -122.4150, 'Mission'], [37.7625, -122.4350, 'Castro'], [37.7502, -122.4337, 'Noe Valley'],
    [37.7385, -122.4180, 'Bernal Heights'], [37.7330, -122.4330, 'Glen Park'], [37.7400, -122.4680, 'West Portal'], [37.7420, -122.4900, 'Parkside'], [37.7230, -122.4370, 'Excelsior'],
    [37.7310, -122.3890, 'Bayview'], [37.7275, -122.3700, 'Hunters Point'], [37.7150, -122.4040, 'Visitacion Valley'], [37.7760, -122.4235, 'Hayes Valley'], [37.7858, -122.4294, 'Japantown'],
    [37.7600, -122.4690, 'Inner Sunset'], [37.7230, -122.4600, 'Ingleside']].forEach(l => lab(l[0], l[1], l[2], 'hood', 10.5));
  [[37.7694, -122.4862, 'Golden Gate Park'], [37.7544, -122.4477, 'Twin Peaks'], [37.7230, -122.4940, 'Lake Merced'], [37.7190, -122.4190, 'McLaren Park'], [37.7835, -122.5060, 'Lands End']].forEach(l => lab(l[0], l[1], l[2], 'park', 8.5));
  [[37.8350, -122.4400, 'San Francisco Bay'], [37.7600, -122.5400, 'Pacific Ocean'], [37.8210, -122.5000, 'Golden Gate'], [37.7400, -122.3450, 'San Francisco Bay']].forEach(l => lab(l[0], l[1], l[2], 'water', 0));
  [[37.7952, -122.4028, 'Transamerica Pyramid'], [37.7793, -122.4193, 'City Hall'], [37.8029, -122.4484, 'Palace of Fine Arts'], [37.7786, -122.3893, 'Oracle Park'], [37.7680, -122.3877, 'Chase Center'],
    [37.8267, -122.4230, 'Alcatraz'], [37.8087, -122.4098, 'Pier 39'], [37.8080, -122.4177, "Fisherman's Wharf"], [37.8021, -122.4187, 'Lombard Street'], [37.7880, -122.4075, 'Union Square'],
    [37.7705, -122.5093, 'Dutch Windmill'], [37.7715, -122.4687, 'de Young Museum'], [37.7596, -122.4269, 'Dolores Park'], [37.8105, -122.4772, 'Fort Point'], [37.7325, -122.5030, 'San Francisco Zoo'],
    [37.7765, -122.3943, 'Caltrain'], [37.8235, -122.3705, 'Treasure Island'], [37.7620, -122.4350, 'Castro Theatre'], [37.8040, -122.4590, 'Crissy Field'], [37.7230, -122.4790, 'SF State']].forEach(l => lab(l[0], l[1], l[2], 'mark', 21));

  /* =====================================================================
     COLORS
     ===================================================================== */
  const PAL = {
    water: [[201, 220, 232], [10, 15, 29]], tick: [[232, 242, 248], [26, 38, 64]],
    road: [[178, 186, 198], [12, 16, 27]], pad: [[226, 228, 232], [24, 29, 45]], out: [[214, 219, 226], [15, 19, 31]], edge: [[176, 188, 202], [5, 8, 15]],
    park: [[193, 226, 206], [18, 41, 38]], park2: [[174, 214, 190], [23, 52, 47]], yard: [[203, 229, 211], [21, 39, 40]], sand: [[240, 230, 204], [44, 44, 52]],
    tree0: [[136, 200, 170], [36, 86, 74]], tree1: [[104, 178, 144], [27, 66, 58]],
    bridge: [[232, 142, 118], [222, 134, 112]], steel: [[160, 170, 186], [70, 80, 106]], fwy: [[184, 190, 200], [36, 42, 60]],
    win: [[243, 223, 160], [243, 223, 160]], glass: [[150, 164, 184], [16, 20, 34]], fog: [[255, 255, 255], [150, 165, 205]], ink: [[20, 22, 28], [233, 234, 240]],
    white: [[252, 252, 253], [200, 206, 224]],
    lilac: [[167, 159, 234], [189, 182, 245]], mint: [[118, 200, 168], [163, 224, 199]], peach: [[238, 160, 124], [246, 194, 166]],
    sky: [[118, 172, 224], [168, 206, 240]], butter: [[224, 196, 92], [238, 221, 154]], rose: [[228, 140, 170], [242, 184, 204]]
  };
  const HOUSE = [[248, 240, 226], [244, 212, 210], [208, 226, 244], [210, 236, 220], [228, 218, 246], [248, 234, 184], [242, 242, 244], [246, 218, 196], [206, 215, 228]];
  const TOWER = [[229, 233, 239], [205, 214, 227], [186, 197, 213], [236, 235, 230], [168, 179, 196]];
  const LADIES = ['rose', 'butter', 'mint', 'sky', 'lilac', 'peach'];
  const C = {}, CS = {}, PALC = [[], []];
  let dark = 0, darkT = 0, ready = false;
  const css = c => 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')';
  const rgba = (c, a) => 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + clamp(a, 0, 1).toFixed(3) + ')';
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const shade = (c, f) => [c[0] * f, c[1] * f, c[2] * f];
  const NIGHT = [30, 36, 58];
  function colors(d) {
    for (const k in PAL) { C[k] = mix(PAL[k][0], PAL[k][1], d); CS[k] = css(C[k]); }
    [HOUSE, TOWER].forEach((src, p) => src.forEach((c, i) => {
      const top = mix(c, mix(NIGHT, c, p ? .1 : .16), d), f1 = lerp(.82, .74, d), f2 = lerp(.66, .54, d);
      PALC[p][i] = [css(top), css(shade(top, f1)), css(shade(top, f2)), top];
    }));
  }
  const tint = (name, m, base) => { const a = C[name], t = PALC[1][base == null ? 0 : base][3], f1 = lerp(.82, .76, dark), f2 = lerp(.66, .58, dark), c = mix(t, a, m); return [css(c), css(shade(c, f1)), css(shade(c, f2))]; };

  /* =====================================================================
     DRAWING PRIMITIVES
     ===================================================================== */
  const cv = document.getElementById('map');
  let ctx = cv.getContext('2d');
  const mainCtx = ctx;
  let zx = 1, zy = .5, zz = .62, ox = 0, oy = 0, X = 0, Y = 0, Z = 10;
  const setProj = (z, x0, y0) => { Z = z; zx = z; zy = z * FY; zz = z * ZK; ox = x0; oy = y0; };
  const pj = (x, y, z) => { X = y * zx + ox; Y = -x * zy - z * zz + oy; };
  const M = (x, y, z) => { pj(x, y, z); ctx.moveTo(X, Y); };
  const L = (x, y, z) => { pj(x, y, z); ctx.lineTo(X, Y); };
  const sxs = [0, 0, 0, 0], sys = [0, 0, 0, 0];
  function prism(q, z0, z1, f, c) {
    for (let i = 0; i < 4; i++) { sxs[i] = q[i * 2 + 1] * zx + ox; sys[i] = -q[i * 2] * zy + oy; }
    const t1 = z1 * zz, t0 = z0 * zz;
    for (let k = 0; k < f.length; k += 2) { const i = f[k], j = (i + 1) & 3; ctx.fillStyle = c[f[k + 1]]; ctx.beginPath(); ctx.moveTo(sxs[i], sys[i] - t1); ctx.lineTo(sxs[j], sys[j] - t1); ctx.lineTo(sxs[j], sys[j] - t0); ctx.lineTo(sxs[i], sys[i] - t0); ctx.fill(); }
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.moveTo(sxs[0], sys[0] - t1); ctx.lineTo(sxs[1], sys[1] - t1); ctx.lineTo(sxs[2], sys[2] - t1); ctx.lineTo(sxs[3], sys[3] - t1); ctx.fill();
  }
  const F0 = facesFor(1, 0), qb = new Float32Array(8);
  function box(x0, y0, x1, y1, z0, z1, c) { qb[0] = x0; qb[1] = y0; qb[2] = x1; qb[3] = y0; qb[4] = x1; qb[5] = y1; qb[6] = x0; qb[7] = y1; prism(qb, z0, z1, F0, c); }
  const cbox = (cx, cy, r, z0, z1, c) => box(cx - r, cy - r, cx + r, cy + r, z0, z1, c);
  /* a round tower or dome ring, drawn as a many-sided prism */
  function cyl(cx, cy, r, z0, z1, c, n) {
    n = n || 12; const t1 = z1 * zz, t0 = z0 * zz;
    for (let k = 0; k < n; k++) { const a0 = k / n * TAU, a1 = (k + 1) / n * TAU, am = (a0 + a1) / 2, nx = Math.cos(am), ny = Math.sin(am);
      if (nx >= 0) continue;
      const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r, x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
      ctx.fillStyle = ny > 0 ? c[2] : c[1]; ctx.beginPath();
      ctx.moveTo(y0 * zx + ox, -x0 * zy + oy - t1); ctx.lineTo(y1 * zx + ox, -x1 * zy + oy - t1); ctx.lineTo(y1 * zx + ox, -x1 * zy + oy - t0); ctx.lineTo(y0 * zx + ox, -x0 * zy + oy - t0); ctx.fill(); }
    ctx.fillStyle = c[0]; ctx.beginPath();
    for (let k = 0; k < n; k++) { const a = k / n * TAU; pj(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z1); k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
    ctx.fill();
  }
  function ground(p, fill, dz) { ctx.beginPath(); for (let i = 0; i < p.length; i++) { pj(p[i][0], p[i][1], dz || 0); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
  function line3(pts, col, w) { ctx.beginPath(); for (let i = 0; i < pts.length; i++) { pj(pts[i][0], pts[i][1], pts[i][2] || 0); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); }
  function ring(cx, cy, z, r, col, w) { ctx.beginPath(); for (let k = 0; k <= 30; k++) { const a = k / 30 * TAU; pj(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z); k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); }
  function sq(x, y, z, r, col) { pj(x, y, z); ctx.fillStyle = col; ctx.fillRect(X - r, Y - r, r * 2, r * 2); }
  function pyr(cx, cy, r, z0, z1, c) {
    ctx.fillStyle = c[2]; ctx.beginPath(); M(cx - r, cy - r, z0); L(cx + r, cy - r, z0); L(cx, cy, z1); ctx.fill();
    ctx.beginPath(); M(cx - r, cy + r, z0); L(cx + r, cy + r, z0); L(cx, cy, z1); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); M(cx - r, cy - r, z0); L(cx - r, cy + r, z0); L(cx, cy, z1); ctx.fill();
  }

  function suspension(A, B, col, base, zd, zt, towers, w, wd) {
    const at = u => [lerp(A[0], B[0], u), lerp(A[1], B[1], u)];
    const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy), nx = -dy / len * wd, ny = dx / len * wd;
    ctx.beginPath(); M(A[0] - nx, A[1] - ny, zd); L(B[0] - nx, B[1] - ny, zd); L(B[0] + nx, B[1] + ny, zd); L(A[0] + nx, A[1] + ny, zd); ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); M(A[0] + nx, A[1] + ny, zd); L(B[0] + nx, B[1] + ny, zd); L(B[0] + nx, B[1] + ny, zd - .16); L(A[0] + nx, A[1] + ny, zd - .16); ctx.fillStyle = css(shade(base, .78)); ctx.fill();
    for (const side of [-1, 1]) {
      const o1 = nx * side, o2 = ny * side, pts = [], ends = [0].concat(towers, [1]);
      for (let e = 0; e < ends.length - 1; e++) {
        const z0 = e === 0 ? zd : zt, z1 = e === ends.length - 2 ? zd : zt, mid = e > 0 && e < ends.length - 2;
        for (let k = 0; k <= 10; k++) { const f = k / 10, p = at(lerp(ends[e], ends[e + 1], f));
          pts.push([p[0] + o1, p[1] + o2, mid ? lerp(z0, z1, f) - (zt - zd - .2) * 4 * f * (1 - f) : lerp(z0, z1, f) - (zt - zd) * .16 * 4 * f * (1 - f)]); }
      }
      line3(pts, col, w);
      if (Z > 8) { ctx.beginPath(); for (let k = 1; k < pts.length - 1; k++) { M(pts[k][0], pts[k][1], pts[k][2]); L(pts[k][0], pts[k][1], zd); } ctx.strokeStyle = col; ctx.lineWidth = Math.max(.5, w * .35); ctx.stroke(); }
    }
    towers.forEach(u => { const p = at(u);
      for (const side of [-1, 1]) line3([[p[0] + nx * side, p[1] + ny * side, 0], [p[0] + nx * side, p[1] + ny * side, zt + .12]], col, w * 2.1);
      for (const z of [zd + .5, (zd + zt) / 2 + .3, zt - .2]) line3([[p[0] - nx, p[1] - ny, z], [p[0] + nx, p[1] + ny, z]], col, w * 1.5); });
  }
  function ribbon(pts, zd, col, colSide, wd) {
    for (let i = 0; i < pts.length - 1; i++) { const A = pts[i], B = pts[i + 1]; if (inStrip((A[0] + B[0]) / 2, (A[1] + B[1]) / 2) || inStrip(A[0], A[1]) && inStrip(B[0], B[1])) continue; const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy), nx = -dy / len * wd, ny = dx / len * wd;
      ctx.beginPath(); M(A[0] + nx, A[1] + ny, zd); L(B[0] + nx, B[1] + ny, zd); L(B[0] + nx, B[1] + ny, 0); L(A[0] + nx, A[1] + ny, 0); ctx.fillStyle = colSide; ctx.globalAlpha = .35; ctx.fill(); ctx.globalAlpha = 1;
      ctx.beginPath(); M(A[0] - nx, A[1] - ny, zd); L(B[0] - nx, B[1] - ny, zd); L(B[0] + nx, B[1] + ny, zd); L(A[0] + nx, A[1] + ny, zd); ctx.fillStyle = col; ctx.fill(); }
  }

  /* =====================================================================
     THE CITY LAYER. lod 0 draws block rows, lod 1 draws every building.
     ===================================================================== */
  const idx = [];
  function gather(bk, x0, y0, x1, y1) {
    idx.length = 0;
    const i0 = Math.floor((x0 + 2) / BS), i1 = Math.floor((x1 + 2) / BS), j0 = Math.floor((y0 + 2) / BS), j1 = Math.floor((y1 + 2) / BS);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const l = bk.get(i + j * BW); if (l) for (let k = 0; k < l.length; k++) idx.push(l[k]); }
    idx.sort((a, b) => a - b);
    return idx;
  }
  function windows(b, c, night) {
    const q = b.q, f = b.f, rows = Math.max(1, Math.min(14, Math.floor(b.h / .24)));
    ctx.beginPath();
    for (let k = 0; k < f.length; k += 2) { const i = f[k], j = (i + 1) & 3, ax = q[i * 2], ay = q[i * 2 + 1], bx = q[j * 2], by = q[j * 2 + 1], len = Math.hypot(bx - ax, by - ay);
      if (night > .5) { const cols = Math.max(1, Math.round(len / .2));
        for (let r = 0; r < rows; r++) for (let m = 0; m < cols; m++) { if (hash(b.sd * 9973 + r * 31 + m, k + 7) > (b.win ? .42 : .3)) continue;
          const u0 = (m + .22) / cols, u1 = (m + .78) / cols, z = b.z0 + (r + .35) * (b.h / rows), zt = z + Math.min(.12, b.h / rows * .5);
          M(lerp(ax, bx, u0), lerp(ay, by, u0), zt); L(lerp(ax, bx, u1), lerp(ay, by, u1), zt); L(lerp(ax, bx, u1), lerp(ay, by, u1), z); L(lerp(ax, bx, u0), lerp(ay, by, u0), z); }
      } else for (let r = 0; r < rows; r++) { const z = b.z0 + (r + .42) * (b.h / rows), zt = z + Math.min(.05, b.h / rows * .22);
        M(lerp(ax, bx, .08), lerp(ay, by, .08), zt); L(lerp(ax, bx, .92), lerp(ay, by, .92), zt); L(lerp(ax, bx, .92), lerp(ay, by, .92), z); L(lerp(ax, bx, .08), lerp(ay, by, .08), z); }
    }
    ctx.fillStyle = c; ctx.fill();
  }
  function hillDraw(h) {
    for (let s = 0; s < 4; s++) { const r = h.r * (1 - s * .23), z0 = h.h * s / 4, z1 = h.h * (s + 1) / 4, n = 16, t1 = z1 * zz, t0 = z0 * zz;
      ctx.fillStyle = s & 1 ? CS.tree0 : CS.park2; ctx.beginPath();
      for (let k = 0; k <= n; k++) { const a = Math.PI * .5 + k / n * Math.PI, x = h.x + Math.cos(a) * r, y = h.y + Math.sin(a) * r * .8; ctx.lineTo(y * zx + ox, -x * zy + oy - t1); }
      for (let k = n; k >= 0; k--) { const a = Math.PI * .5 + k / n * Math.PI, x = h.x + Math.cos(a) * r, y = h.y + Math.sin(a) * r * .8; ctx.lineTo(y * zx + ox, -x * zy + oy - t0); }
      ctx.fill();
      ctx.fillStyle = s & 1 ? CS.park : CS.park2; ctx.beginPath();
      for (let k = 0; k < 24; k++) { const a = k / 24 * TAU; pj(h.x + Math.cos(a) * r, h.y + Math.sin(a) * r * .8, z1); k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
      ctx.fill(); }
  }
  function staticMarks(night) {
    const T = PALC[1], m = MARKS;
    { const p = m.pyramid; cbox(p[0], p[1], .42, 0, .5, T[0]); pyr(p[0], p[1], .42, .5, 5.6, T[0]); }
    if (!inStrip(m.boa[0], m.boa[1])) { const p = m.boa; cbox(p[0], p[1], .5, 0, 3.9, T[4]); }
    { const p = m.emb; for (let k = 0; k < 4; k++) box(p[0] - 1.3 + k * .75, p[1] - .15 + k * .5, p[0] - 1.05 + k * .75, p[1] + .75 + k * .5, 0, 2 + k * .22, T[2]); }
    if (!inStrip(m.hall[0], m.hall[1])) { const p = m.hall; box(p[0] - 1.1, p[1] - .6, p[0] + 1.1, p[1] + .6, 0, .5, T[3]); cyl(p[0], p[1], .42, .5, 1.1, T[3]); cyl(p[0], p[1], .34, 1.1, 1.45, T[0]); cyl(p[0], p[1], .2, 1.45, 1.7, T[0]); cyl(p[0], p[1], .05, 1.7, 2.1, T[3], 6); }
    { const p = m.palace, c = tint('peach', .3, 3); cyl(p[0] - .9, p[1] - .2, .46, 0, .75, c); cyl(p[0] - .9, p[1] - .2, .36, .75, 1.0, c); cyl(p[0] - .9, p[1] - .2, .2, 1.0, 1.2, c); }
    { const p = m.oracle, c = T[3]; for (let k = 0; k < 14; k++) { const a = Math.PI * .1 + k / 14 * Math.PI * 1.45; cbox(p[0] + Math.cos(a) * 1.25, p[1] + Math.sin(a) * 1.25, .26, 0, .55 + .25 * Math.sin(k * .5), c); } ground(circ(37.7786, -122.3893, .95, 16), CS.park2, .02); }
    { const p = m.chase; cyl(p[0], p[1], 1.0, 0, .55, T[1], 16); cyl(p[0], p[1], .8, .55, .7, T[0], 16); }
    if (!inStrip(m.mary[0], m.mary[1])) { const p = m.mary; cbox(p[0], p[1], .5, 0, .3, T[0]); pyr(p[0], p[1], .45, .3, 1.9, T[0]); }
    { const p = m.mill; cyl(p[0], p[1], .14, 0, .7, T[3], 6); line3([[p[0] - .45, p[1], .5], [p[0] + .45, p[1], 1.1]], CS.ink, 1.2); line3([[p[0], p[1] - .45, 1.1], [p[0], p[1] + .45, .5]], CS.ink, 1.2); }
    { const p = m.young; box(p[0] - .7, p[1] - .3, p[0] + .7, p[1] + .3, 0, .22, T[4]); cbox(p[0] + .6, p[1] - .2, .16, 0, 1.3, T[4]); }
    { const a = ll(37.8268, -122.4228); box(a[0] - .7, a[1] - .25, a[0] + .5, a[1] + .25, 0, .3, T[3]); cyl(a[0] + .7, a[1] - .1, .09, 0, .95, T[0], 6); }
    { const a = ll(37.8087, -122.4098); box(a[0] - .1, a[1] - 1.5, a[0] + .5, a[1] - .1, 0, .2, tint('butter', .25, 3)); }
    FREEWAYS.forEach(f => ribbon(f, .34, CS.fwy, CS.edge, .2));
    suspension(BA, BB, CS.steel, C.steel, .75, 2.3, [.2, .42, .64, .86], clamp(Z / 22, .7, 1.6), .2);
    suspension(GA, GB, CS.bridge, C.bridge, .8, 3.1, [.22, .78], clamp(Z / 18, .8, 2.2), .22);
    if (night > .5) for (let k = 0; k <= 16; k++) { const u = k / 16; sq(lerp(BA[0], BB[0], u), lerp(BA[1], BB[1], u), .82, Math.max(1, Z * .03), rgba(C.win, .85)); sq(lerp(GA[0], GB[0], u), lerp(GA[1], GB[1], u), .86, Math.max(1, Z * .03), rgba(C.win, .85)); }
  }
  function drawCity(lod, vw, vh, night) {
    /* visible world box */
    const inv = (sx, sy) => [-(sy - oy) / zy, (sx - ox) / zx];
    const cs = [inv(0, 0), inv(vw, 0), inv(vw, vh + 6 * zz), inv(0, vh + 6 * zz)];
    const wx0 = Math.min(...cs.map(c => c[0])) - 2, wx1 = Math.max(...cs.map(c => c[0])) + 2, wy0 = Math.min(...cs.map(c => c[1])) - 2, wy1 = Math.max(...cs.map(c => c[1])) + 2;
    const vis = (x, y, m) => { const px = y * zx + ox, py = -x * zy + oy; return px > -m && px < vw + m && py > -m && py < vh + m + 5 * zz; };
    ctx.lineJoin = 'round';
    ground(SOUTH, CS.out);
    ground(LAND, CS.edge, -.5); ground(MARIN, CS.edge, -.5); ground(YBI, CS.edge, -.4); ground(TI, CS.edge, -.4); ground(ALC, CS.edge, -.4);
    ground(LAND, CS.road); ground(SAND, CS.sand); ground(MARIN, CS.park2); ground(YBI, CS.park); ground(TI, CS.pad); ground(ALC, CS.pad);
    PARKS.forEach(p => ground(p, CS.park)); LAKES.forEach(p => ground(p, CS.water));
    ground(circ(37.7880, -122.4075, .55, 4), CS.pad);
    /* block pads and back yards */
    const pv = gather(bkP, wx0, wy0, wx1, wy1), m = Z * 3;
    ctx.fillStyle = CS.pad; ctx.beginPath();
    for (let n = 0; n < pv.length; n++) { const q = pads[pv[n]].q; if (!vis(q[0], q[1], m)) continue; M(q[0], q[1], 0); L(q[2], q[3], 0); L(q[4], q[5], 0); L(q[6], q[7], 0); ctx.closePath(); }
    ctx.fill();
    if (lod) { ctx.fillStyle = CS.yard; ctx.beginPath();
      for (let n = 0; n < pv.length; n++) { const p = pads[pv[n]], q = p.q; if (!p.res || !vis(q[0], q[1], m)) continue;
        const ax = lerp(q[0], q[2], .5), ay = lerp(q[1], q[3], .5), bx = lerp(q[6], q[4], .5), by = lerp(q[7], q[5], .5), cx = lerp(q[0], q[6], .5), cy = lerp(q[1], q[7], .5), dx = lerp(q[2], q[4], .5), dy = lerp(q[3], q[5], .5);
        const lx = Math.hypot(q[2] - q[0], q[3] - q[1]), ly = Math.hypot(q[6] - q[0], q[7] - q[1]);
        if (lx >= ly) { M(lerp(q[0], q[6], .41), lerp(q[1], q[7], .41), 0); L(lerp(q[2], q[4], .41), lerp(q[3], q[5], .41), 0); L(lerp(q[2], q[4], .59), lerp(q[3], q[5], .59), 0); L(lerp(q[0], q[6], .59), lerp(q[1], q[7], .59), 0); }
        else { M(lerp(q[0], q[2], .41), lerp(q[1], q[3], .41), 0); L(lerp(q[0], q[2], .59), lerp(q[1], q[3], .59), 0); L(lerp(q[6], q[4], .59), lerp(q[7], q[5], .59), 0); L(lerp(q[6], q[4], .41), lerp(q[7], q[5], .41), 0); }
        ctx.closePath(); }
      ctx.fill(); }
    /* Market Street and other named avenues get a pale centre line */
    ROADS.forEach(r => { if (r.w) line3(r.p, rgba(C.white, .55), Math.max(1, Z * .05)); });
    piers.forEach(b => prism(b.q, 0, b.h, b.f, PALC[1][3]));
    HILLS.forEach(h => { if (!inStrip(h.x, h.y) && vis(h.x, h.y, Z * 8)) hillDraw(h); });
    for (let pass = 0; pass < 2; pass++) { ctx.fillStyle = pass ? CS.tree1 : CS.tree0; ctx.beginPath();
      for (let n = 0; n < trees.length; n++) { const t = trees[n]; if (t.v !== pass) continue; pj(t.x, t.y, t.z); if (X < -20 || X > vw + 20 || Y < -20 || Y > vh + 40) continue;
        const w = t.s * Z * .2, hgt = t.s * Z * .62; ctx.moveTo(X - w, Y); ctx.lineTo(X + w, Y); ctx.lineTo(X, Y - hgt); ctx.closePath(); }
      ctx.fill(); }
    drawStrip(Z >= 24, vw, vh, night);
    /* buildings */
    const arr = lod ? builds : slabs, list = gather(lod ? bkB : bkS, wx0, wy0, wx1, wy1), wz = lod && Z >= 40;
    const glass = rgba(C.glass, .2), lit = rgba(C.win, .95);
    for (let n = 0; n < list.length; n++) {
      const b = arr[list[n]], q = b.q;
      if (!vis(q[0], q[1], m)) continue;
      prism(q, b.z0, b.z0 + b.h, b.f, PALC[b.pal][b.c]);
      if (night > .5) { if (b.win || (lod && Z >= 36 && b.sd < .45) || (!lod && b.sd < .3)) windows(b, lit, 1); }
      else if (wz && (b.win || Z >= 60)) windows(b, glass, 0);
    }
    staticMarks(night);
  }

  const ovImg = new Image(), tileImg = new Map();
  ovImg.onload = () => { bmp = [null, null]; crispCam = null; dirty = true; };
  ovImg.src = 'tiles/overview.webp';
  function drawStrip(hi, vw, vh, night) {
    const X0 = STRIP.y0 * zx + ox, X1 = STRIP.y1 * zx + ox, Y0 = -STRIP.xE * zy + oy, Y1 = -STRIP.xW * zy + oy;
    if (X1 < 0 || X0 > vw || Y1 < 0 || Y0 > vh) return;
    if (ovImg.complete && ovImg.naturalWidth) ctx.drawImage(ovImg, X0, Y0, X1 - X0, Y1 - Y0);
    if (hi) for (let i = 0; i < 25; i++) { const a = tY(26 + 4 * i) * zx + ox, b = tY(30 + 4 * i) * zx + ox; if (b < 0 || a > vw) continue;
      for (let j = 0; j < 4; j++) { const c = -tX(20 + 4 * j) * zy + oy, d = -tX(24 + 4 * j) * zy + oy; if (d < 0 || c > vh) continue;
        const k = i + '_' + j; let im = tileImg.get(k);
        if (!im) { im = new Image(); im.onload = () => { crispCam = null; lastMove = performance.now(); dirty = true; }; im.src = 'tiles/t_' + k + '.webp'; tileImg.set(k, im); }
        if (im.complete && im.naturalWidth) ctx.drawImage(im, a, c, b - a + .5, d - c + .5); } }
    if (night > .01) { ctx.fillStyle = 'rgba(7,11,24,' + (.72 * night).toFixed(3) + ')'; ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0); }
    else { ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0); }
    /* feather the four edges into the drawn city */
    const fw = Math.max(6, Z * 1.6), c0 = rgba(C.road, 1), c1 = rgba(C.road, 0);
    [[X0, Y0, X0 + fw, Y0, X0, Y0, fw, Y1 - Y0], [X1, Y0, X1 - fw, Y0, X1 - fw, Y0, fw, Y1 - Y0], [X0, Y0, X0, Y0 + fw * .6, X0, Y0, X1 - X0, fw * .6], [X0, Y1, X0, Y1 - fw * .6, X0, Y1 - fw * .6, X1 - X0, fw * .6]].forEach(e => {
      const g = ctx.createLinearGradient(e[0], e[1], e[2], e[3]); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(e[4] - .5, e[5] - .5, e[6] + 1, e[7] + 1); });
  }

  /* overview bitmaps, one for day and one for night */
  const BX0 = -16, BX1 = GW + 20, BY0 = -24, BY1 = GH + 20;
  let ZC = 12, bmp = [null, null], crisp = null, crispCam = null, crispCtx = null;
  function buildBitmap(d) {
    const c = document.createElement('canvas'), top = 6 * ZK * ZC;
    c.width = Math.ceil((BY1 - BY0) * ZC); c.height = Math.ceil((BX1 - BX0) * ZC * FY + top);
    const save = [Z, ox, oy];
    ctx = c.getContext('2d'); colors(d); setProj(ZC, -BY0 * ZC, BX1 * ZC * FY + top);
    drawCity(0, c.width, c.height, d);
    ctx = mainCtx; colors(dark); setProj(save[0], save[1], save[2]);
    c.top = top; bmp[d] = c;
  }

  /* =====================================================================
     STOP SCENES. These are drawn live so they can rise and animate.
     ===================================================================== */
  const R45 = { cs: Math.cos(-Math.PI / 4), sn: Math.sin(-Math.PI / 4), faces: [] };
  R45.faces = facesFor(R45.cs, R45.sn);
  const rbox = (cx, cy, hx, hy) => { const lx = cx * R45.cs + cy * R45.sn, ly = -cx * R45.sn + cy * R45.cs; return mk(R45, lx - hx, ly - hy, lx + hx, ly + hy, 0, 0, 0, 0); };
  const SC = {
    tower(s) { const h = 1 + 2.4 * s.a; cbox(s.cx, s.cy, .6, s.e, s.e + h, tint(s.accent, .35 + .65 * s.a)); s.top = s.e + h; },
    ferry(s, t) {
      if (!s.g) s.g = [rbox(s.cx, s.cy, .5, 1.5), rbox(s.cx, s.cy, .26, .26)];
      const c = tint(s.accent, .3 + .7 * s.a, 3), k = .55 + .45 * s.a, z = .5 + 1.25 * k;
      prism(s.g[0].q, 0, .5, R45.faces, c); prism(s.g[1].q, .5, z, R45.faces, c); pyr(s.cx, s.cy, .34, z, z + .6, c);
      s.top = z + .6;
    },
    cranes(s, t) {
      const c = tint(s.accent, .3 + .7 * s.a, 3);
      box(s.cx - 2.6, s.cy - .8, s.cx - .3, s.cy + .8, 0, .55, c); box(s.cx - 2.6, s.cy + 1.2, s.cx - .8, s.cy + 2.4, 0, .4, PALC[1][3]);
      const col = css(mix(C.steel, C[s.accent], .3 + .7 * s.a)), w = clamp(Z / 16, 1, 3);
      [[1.2, -1.3, 0], [1.2, 1.5, 2.1]].forEach(m => {
        const mx = s.cx + m[0], my = s.cy + m[1], a = -.5 + m[2] + .7 * Math.sin(t * .35 + m[2]) * (.25 + .75 * s.a);
        const tx = mx + Math.cos(a) * 2.6, ty = my + Math.sin(a) * 2.6, bx = mx - Math.cos(a) * .9, by = my - Math.sin(a) * .9, hz = 1.3 + .7 * Math.sin(t * .6 + m[2]);
        line3([[mx, my, 0], [mx, my, 3.9]], col, w); line3([[bx, by, 3], [tx, ty, 3]], col, w); line3([[bx, by, 3], [mx, my, 3.9], [tx, ty, 3]], col, w * .5);
        line3([[tx, ty, 3], [tx, ty, hz]], col, w * .4); sq(tx, ty, hz, Math.max(2, Z * .1), col);
      });
      s.top = 3.9;
    },
    agents(s) {
      const c = tint(s.accent, .4 + .6 * s.a, 1), k = .55 + .45 * s.a;
      cyl(s.cx, s.cy, .62, 0, 3.5 * k, c, 14); cyl(s.cx, s.cy, .54, 3.5 * k, 4.1 * k, c, 14); cyl(s.cx, s.cy, .4, 4.1 * k, 4.45 * k, c, 14);
      s.top = 4.45 * k;
    },
    route(s) { s.top = 1.3; },
    beam(s) {
      const c = tint(s.accent, .4 + .6 * s.a, 0), k = .6 + .4 * s.a, z = s.e + 1.9 * k;
      cyl(s.cx, s.cy, .3, s.e, z, c, 10); cyl(s.cx, s.cy, .36, z, z + .14, c, 10); cyl(s.cx, s.cy, .24, z + .14, z + .4, c, 10);
      s.top = z + .4;
    },
    ladies(s, t) {
      const ph = (t * .16) % 1.5;
      for (let i = 0; i < 6; i++) {
        const y0 = s.cy - 1.65 + i * .55 + .04, y1 = y0 + .47, ym = (y0 + y1) / 2, x0 = s.cx - .2, x1 = s.cx + .55;
        const c = tint(LADIES[i], (.3 + .7 * clamp(ph * 8 - i, 0, 1)) * (.35 + .65 * s.a), 3), z = .62, zr = .98;
        box(x0, y0, x1, y1, 0, z, c);
        ctx.fillStyle = c[0]; ctx.beginPath(); M(x0, y0, z); L(x0, ym, zr); L(x1, ym, zr); L(x1, y0, z); ctx.fill();
        ctx.fillStyle = c[2]; ctx.beginPath(); M(x0, ym, zr); L(x0, y1, z); L(x1, y1, z); L(x1, ym, zr); ctx.fill();
        ctx.fillStyle = c[1]; ctx.beginPath(); M(x0, y0, z); L(x0, y1, z); L(x0, ym, zr); ctx.fill();
      }
      s.top = 1.0;
    },
    rings(s) {
      const k = .6 + .4 * s.a, e = s.e, col = css(mix(C.bridge, C.white, .1)), wc = CS.white, w = clamp(Z / 14, 1.2, 3.4);
      const B = [[-.6, .4], [.6, .4], [0, -.62]], zs = [e, e + 3.0 * k, e + 5.0 * k, e + 6.4 * k], sc = [1, .3, .52, .46];
      const pt = (i, l) => [s.cx + B[i][0] * sc[l], s.cy + B[i][1] * sc[l], zs[l]];
      for (let i = 0; i < 3; i++) { line3([pt(i, 0), pt(i, 1)], col, w); line3([pt(i, 1), pt(i, 2)], wc, w); line3([pt(i, 2), pt(i, 3)], col, w * .7); }
      for (let l = 1; l < 3; l++) line3([pt(0, l), pt(1, l), pt(2, l), pt(0, l)], l === 1 ? col : wc, w * .7);
      s.top = zs[3]; s.ringZ = zs[2];
    },
    park(s) { cyl(s.cx, s.cy, .5, 0, .35 + .5 * s.a, tint(s.accent, .4 + .6 * s.a, 0), 12); s.top = 1.6; },
    beach(s) {
      const col = css(mix(C.ink, C[s.accent], s.a)), x = s.cx + .6, y = s.cy, w = clamp(Z / 20, 1, 2.4);
      line3([[x - .3, y + .2, 0], [x, y, 1]], col, w); line3([[x + .3, y + .2, 0], [x, y, 1]], col, w); line3([[x, y - .34, 0], [x, y, 1]], col, w);
      cbox(x, y, .2, 1, 1.3, tint(s.accent, .5 + .5 * s.a, 0));
      s.top = 1.8;
    },
    bridge(s) { s.top = 3.4; }
  };
  const BEAMPTS = Array.from({ length: 16 }, (_, k) => { const a = hash(k, 77) * TAU, r = 2.6 + hash(k, 191) * 5.6; return [Math.cos(a) * r, Math.sin(a) * r * .9, a]; });
  const HOT = [[-2, 1], [0, -1], [1, 1], [2, -1]], ROUTE = [[-3, 3], [-3, 0], [-1, 0], [-1, -2], [3, -2], [3, -3]];

  /* =====================================================================
     CAMERA AND STATE
     ===================================================================== */
  let W = 0, H = 0, DPR = 1, mobile = false, dirty = true;
  const cam = { x: 62, y: 66, z: 6 };
  let fly = null, vx = 0, vy = 0, fx = 0, fy = 0, lastMove = 0, moving = false;
  let cur = -1, plateOpen = true, lock = 1;
  const fitZ = () => mobile ? Math.min(W / 96, H / 150) : Math.min(W / 192, H / 86);
  const focus = () => [mobile ? W * .5 : (plateOpen ? W * .64 : W * .5), mobile ? (plateOpen ? H * .27 : H * .46) : H * .52];
  const pose = i => {
    if (i < 0) return mobile ? { x: 78, y: 66, z: fitZ() } : { x: 60, y: 76, z: fitZ() };
    const s = stops[i], base = mobile ? 34 : 44;
    const k = s.zoom || ({ bridge: .55, beach: .6, park: .55, ferry: .85, rings: .62, ladies: 1.5, route: 1.25, beam: .78, cranes: .9, agents: .8 })[s.scene] || 1;
    return { x: s.cx + (s.scene === 'bridge' ? 3 : 0), y: s.cy + (s.scene === 'bridge' ? -1.5 : 0), z: base * k };
  };
  function clampCam() {
    const zmin = fitZ() * .85; cam.z = clamp(cam.z, zmin, 110);
    cam.x = clamp(cam.x, 2, GW - 2); cam.y = clamp(cam.y, 2, GH - 1);
  }
  function flyTo(p, dur) {
    const d = Math.hypot(p.x - cam.x, p.y - cam.y);
    fly = { x0: cam.x, y0: cam.y, z0: cam.z, x1: p.x, y1: p.y, z1: p.z, t0: performance.now(), dur: reduce ? 1 : (dur || clamp(900 + d * 22, 900, 2600)), d };
    vx = vy = 0; dirty = true;
  }

  function resize() {
    const w = document.documentElement.clientWidth || innerWidth, h = innerHeight, d = Math.min(2, devicePixelRatio || 1);
    if (w === W && h === H && d === DPR) return;
    const first = !W;
    W = w; H = h; DPR = d; mobile = W < 860;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    crisp = null; crispCam = null;
    if (first) { ZC = mobile ? 11 : 18; const p = pose(-1); cam.x = p.x; cam.y = p.y; cam.z = p.z * .8; const f = focus(); fx = f[0]; fy = f[1]; flyTo(p, 1800); }
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
  const zoomBy = (f, sx, sy) => { fly = null; const wx = -(sy - oy) / zy, wy = (sx - ox) / zx, z1 = clamp(cam.z * f, fitZ() * .85, 110), k = cam.z / z1;
    cam.x = wx + (cam.x - wx) * k; cam.y = wy + (cam.y - wy) * k; cam.z = z1; clampCam(); lastMove = performance.now(); dirty = true; };
  let zoomAnim = null;
  const zoomStep = f => { zoomAnim = { z1: clamp(cam.z * f, fitZ() * .85, 110) }; fly = null; dirty = true; };
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
  function label(x, y, z, text, font, col, halo, alignC, min) {
    pj(x, y, z || 0);
    if (X < -80 || X > W + 80 || Y < 50 || Y > H + 20) return;
    ctx.font = font; const w = ctx.measureText(text).width, bx = alignC ? X - w / 2 : X + 8, by = Y - 8;
    for (const p of placed) if (bx < p[2] && bx + w > p[0] && by < p[3] && by + 16 > p[1]) return;
    placed.push([bx - 6, by - 4, bx + w + 6, by + 20]);
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineWidth = 3.5; ctx.strokeStyle = halo; ctx.strokeText(text, bx, Y); ctx.fillStyle = col; ctx.fillText(text, bx, Y);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const t = reduce ? 6 : (now - t0) / 1000;
    /* camera motion */
    let anim = false;
    if (fly) { const u = clamp((now - fly.t0) / fly.dur, 0, 1), e = sstep(0, 1, u);
      cam.x = lerp(fly.x0, fly.x1, e); cam.y = lerp(fly.y0, fly.y1, e);
      cam.z = Math.exp(lerp(Math.log(fly.z0), Math.log(fly.z1), e)) * (1 - Math.min(.5, fly.d * .012) * Math.sin(Math.PI * e));
      anim = true; if (u >= 1) fly = null; }
    else if (zoomAnim) { const f = Math.exp((Math.log(zoomAnim.z1) - Math.log(cam.z)) * (reduce ? 1 : .18)); zoomBy(f, fx, fy); anim = true; if (Math.abs(cam.z - zoomAnim.z1) < .02) zoomAnim = null; }
    else if (!ptrs.size && (Math.abs(vx) > .002 || Math.abs(vy) > .002)) { cam.x += vx; cam.y += vy; vx *= .9; vy *= .9; clampCam(); anim = true; }
    const f = focus(); if (Math.abs(f[0] - fx) > .5 || Math.abs(f[1] - fy) > .5) { fx += (f[0] - fx) * (reduce ? 1 : .12); fy += (f[1] - fy) * (reduce ? 1 : .12); anim = true; }
    if (anim || ptrs.size) lastMove = now;
    const themeMove = Math.abs(darkT - dark) > .004;
    dark = themeMove ? dark + (darkT - dark) * (reduce ? 1 : .07) : darkT;
    if (reduce && !dirty && !anim && !themeMove) return;
    dirty = false;
    colors(dark);
    stops.forEach(s => { s.a += ((s.i === cur && plateOpen ? 1 : 0) - s.a) * (reduce ? 1 : .05); });
    lock = Math.min(1, lock + (reduce ? 1 : .03));

    setProj(cam.z, fx - cam.y * cam.z, fy + cam.x * cam.z * FY);
    ctx = mainCtx; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = CS.water; ctx.fillRect(0, 0, W, H);
    ctx.lineCap = 'butt';
    for (let b = 0; b < 3; b++) { ctx.beginPath();
      for (const k of ticks) { if (k[3] !== b) continue; pj(k[0] + Math.sin(t * .15 + k[1]) * .8, k[1], 0); if (X < -40 || X > W + 40 || Y < -10 || Y > H + 10) continue; ctx.moveTo(X, Y); ctx.lineTo(X + k[2] * Z, Y); }
      ctx.strokeStyle = rgba(C.tick, .4 + .3 * Math.sin(t * .7 + b * 2.1)); ctx.lineWidth = Math.max(1, Z * .07); ctx.stroke(); }
    if (sBeach) { const a = sBeach.a, cy = sBeach.cy, x0 = sBeach.cx - 3;
      ctx.beginPath();
      for (let k = 0; k < 26; k++) { const d = 3 + k * .9, wv = (2.4 - k * .05) * (.6 + .4 * Math.sin(t * 1.3 + k * 1.7)); pj(x0 - d, cy - wv * .5, 0); ctx.moveTo(X, Y); pj(x0 - d, cy + wv * .5, 0); ctx.lineTo(X, Y); }
      ctx.strokeStyle = rgba(C.peach, (.15 + .65 * a) * (dark > .5 ? .7 : 1)); ctx.lineWidth = Math.max(1.5, Z * .3); ctx.stroke();
      for (let k = 0; k < 4; k++) { const u = (t * .09 + k / 4) % 1, a0 = ll(37.7790, -122.5140), a1 = ll(37.7090, -122.5030), off = -.3 - (1 - u) * 2.6;
        line3([[a0[0] + off, a0[1]], [lerp(a0[0], a1[0], .5) + off - .2, lerp(a0[1], a1[1], .5)], [a1[0] + off, a1[1]]], rgba(C.white, u * (1 - u) * 3 * (.4 + .5 * a)), Math.max(1, Z * .09)); } }

    /* city layer */
    const settled = now - lastMove > 160 && !themeMove, useBmp = Z <= ZC * 1.22, wantCrisp = !useBmp && Z >= 36;
    if (useBmp) {
      const sc = Z / ZC;
      for (let d = 0; d < 2; d++) { const a = d ? dark : 1 - dark; if (a < .004) continue; if (!bmp[d]) buildBitmap(d);
        ctx.globalAlpha = d && dark < .996 ? a : 1; if (!d && dark > .996) continue;
        ctx.drawImage(bmp[d], ox + BY0 * Z, oy - BX1 * Z * FY - bmp[d].top * sc, bmp[d].width * sc, bmp[d].height * sc); }
      ctx.globalAlpha = 1;
    } else if (wantCrisp && settled) {
      if (!crispCam || crispCam[0] !== cam.x || crispCam[1] !== cam.y || crispCam[2] !== cam.z || crispCam[3] !== darkT || crispCam[4] !== fx || crispCam[5] !== fy) {
        if (!crisp) { crisp = document.createElement('canvas'); crisp.width = cv.width; crisp.height = cv.height; crispCtx = crisp.getContext('2d'); }
        ctx = crispCtx; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
        drawCity(1, W, H, darkT); ctx = mainCtx;
        crispCam = [cam.x, cam.y, cam.z, darkT, fx, fy];
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(crisp, 0, 0); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    } else { drawCity(0, W, H, dark); if (wantCrisp) dirty = true; }

    /* live stop scenes */
    const night = dark;
    if (sRoute && sRoute.a > .01) { const s = sRoute, a = s.a, bx = Math.round(s.cx / 1.14) * 1.14 - 1.14, by = Math.round(s.cy / .78) * .78 - 2.34, wp = p => [bx + p[0] * 1.14, by + p[1] * .78, .02], pu = .5 + .5 * Math.sin(t * 2.4);
      HOT.forEach((o, k) => { const x0 = bx + o[0] * 1.14 + .1, y0 = by + o[1] * .78 + .1, x1 = x0 + .94, y1 = y0 + .58, al = a * (.5 + .4 * Math.sin(t * 2.4 + k));
        box(x0, y0, x1, y1, 0, .34 + .12 * pu, [rgba(C.rose, al), rgba(shade(C.rose, .86), al), rgba(shade(C.rose, .74), al)]); });
      ctx.setLineDash([Z * .1, Z * .14]); line3([wp(ROUTE[0]), wp(ROUTE[5])], rgba(C.ink, a * .35), 1.2);
      ctx.setLineDash([Z * .22, Z * .12]); ctx.lineDashOffset = -t * Z * .4; line3(ROUTE.map(wp), rgba(C.ink, a * .9), Math.max(2, Z * .09)); ctx.setLineDash([]); ctx.lineDashOffset = 0;
      let tot = 0; const seg = []; for (let i = 1; i < ROUTE.length; i++) { const l = Math.abs(ROUTE[i][0] - ROUTE[i - 1][0]) * 1.14 + Math.abs(ROUTE[i][1] - ROUTE[i - 1][1]) * .78; seg.push(l); tot += l; }
      let d = Math.min(((t * .16) % 1.15) * tot, tot - .001), i = 0; while (d > seg[i]) { d -= seg[i]; i++; }
      const u = d / seg[i], A = wp(ROUTE[i]), B = wp(ROUTE[i + 1]);
      sq(lerp(A[0], B[0], u), lerp(A[1], B[1], u), .08 + .1 * Math.abs(Math.sin(t * 6)), Math.max(3.5, Z * .12), rgba(C[s.accent], a));
      sq(A[0] * 0 + wp(ROUTE[0])[0], wp(ROUTE[0])[1], 0, Math.max(3, Z * .1), rgba(C.ink, a));
      const E = wp(ROUTE[5]); pj(E[0], E[1], 0); const r = Math.max(5, Z * .18); ctx.fillStyle = rgba(C[s.accent], a); ctx.beginPath(); ctx.moveTo(X - r, Y + r * .5); ctx.lineTo(X + r, Y + r * .5); ctx.lineTo(X, Y - r * 1.2); ctx.fill(); }
    if (sBeam && sBeam.a > .01) { const s = sBeam, ang = t * .7, zb = s.e + .15;
      ctx.beginPath(); M(s.cx, s.cy, s.top - .2); for (let k = 0; k <= 8; k++) L(s.cx + Math.cos(ang + k * .06) * 9, s.cy + Math.sin(ang + k * .06) * 9 * .9, .5); ctx.fillStyle = rgba(C[s.accent], s.a * .3); ctx.fill();
      BEAMPTS.forEach((p, k) => { let d = Math.abs(((p[2] - ang - .24) % TAU + TAU) % TAU); d = Math.min(d, TAU - d); const hit = Math.exp(-d * d * 3), x = s.cx + p[0], y = s.cy + p[1], r = Math.max(3, Z * .16), z = 1 + .25 * hit;
        line3([[x, y, 0], [x, y, z]], rgba(C.ink, s.a * .35), 1); pj(x, y, z);
        if (k === 5 || k === 11) { ctx.strokeStyle = rgba(C[s.accent], s.a); ctx.lineWidth = 2; ctx.strokeRect(X - r, Y - r, r * 2, r * 2); }
        else { ctx.fillStyle = rgba(mix(C[s.accent], C.white, hit * .5), s.a * (.6 + .4 * hit)); ctx.fillRect(X - r, Y - r, r * 2, r * 2); } }); }
    stops.slice().sort((a, b) => b.cx - a.cx).forEach(s => {
      if (s === sAg) AG.forEach((o, k) => cbox(s.cx + o[0], s.cy + o[1], .5, 0, o[2] * (.55 + .45 * s.a), tint(s.accent, .2 + .5 * s.a, 2)));
      (SC[s.scene] || SC.tower)(s, t);
    });
    if (sBr) for (let k = 0; k < 10; k++) { const u = (t * (.04 + .03 * sBr.a) + k / 10) % 1, v = k % 2 ? u : 1 - u, off = k % 2 ? .1 : -.1;
      sq(lerp(GA[0], GB[0], v) + off, lerp(GA[1], GB[1], v), .88, Math.max(1.2, Z * .07), night > .5 ? rgba(C.win, .95) : CS.ink); }
    if (sAg && sAg.a > .01) { const s = sAg, k = .55 + .45 * s.a, tops = [[s.cx, s.cy, 4.45 * k]].concat(AG.map(o => [s.cx + o[0], s.cy + o[1], o[2] * k])), loop = [0, 1, 2, 3, 0];
      line3(loop.map(q => tops[q]), rgba(C[s.accent], s.a * .6), 1.4);
      for (let e = 0; e < 4; e++) for (let m = 0; m < 2; m++) { const u = (t * .3 + e * .37 + m * .5) % 1, A = tops[loop[e]], B = tops[loop[e + 1]];
        sq(lerp(A[0], B[0], u), lerp(A[1], B[1], u), lerp(A[2], B[2], u), Math.max(3, Z * .16), rgba(mix(C[s.accent], C.ink, .25), s.a)); } }
    if (sRing && sRing.a > .01) for (let k = 0; k < 3; k++) { const u = (t * .3 + k / 3) % 1; ring(sRing.cx, sRing.cy, sRing.ringZ, .5 + u * 9, rgba(C[sRing.accent], (1 - u) * sRing.a), 2.2); }
    if (sPark && sPark.a > .01) [-9, -3.5, 4].forEach((dx, k) => { const z = 1.6 + .3 * Math.sin(t * 1.6 + k * 2), x = sPark.cx + dx, y = sPark.cy + (k - 1) * 1.2, r = Math.max(4, Z * .26), col = rgba(C[sPark.accent], sPark.a);
      line3([[x, y, 0], [x, y, z]], rgba(C.ink, sPark.a * .4), 1); pj(x, y, z); ctx.fillStyle = col; ctx.strokeStyle = rgba(C.ink, sPark.a); ctx.lineWidth = 1.2; ctx.beginPath();
      if (k === 2) { ctx.moveTo(X - r, Y + r); ctx.lineTo(X + r, Y + r); ctx.lineTo(X, Y - r); ctx.closePath(); } else ctx.rect(X - r, Y - r, r * 2, r * 2);
      ctx.fill(); ctx.stroke(); });

    /* boats and the ferry */
    { const dst = sFer ? [sFer.cx + 3, sFer.cy - 1.4] : [100, 44], src = [dst[0] + 16, dst[1] - 26], u = (t * .03) % 1, e = sstep(0, 1, u), x = lerp(src[0], dst[0], e), y = lerp(src[1], dst[1], e);
      line3([[x + 1.3, y - 2.6], [x, y - .4]], rgba(C.white, .7), 1.4); line3([[x + 2.2, y - 2.2], [x + .6, y]], rgba(C.white, .45), 1.2);
      box(x - .28, y - .7, x + .28, y + .7, 0, .28, [CS.white, PALC[1][2][1], PALC[1][2][2]]); box(x - .2, y - .35, x + .2, y + .3, .28, .52, sFer ? tint(sFer.accent, .5 + .5 * sFer.a, 0) : PALC[1][1]); }
    boats.forEach(b => { pj(b[0] + Math.sin(t * .1 + b[2]) * 1.6, b[1] + Math.cos(t * .08 + b[2]) * 1.1, 0); if (X < -20 || X > W + 20 || Y < -20 || Y > H + 20) return;
      const r = Math.max(3, Z * .42); ctx.fillStyle = CS.white; ctx.beginPath(); ctx.moveTo(X, Y - r * 2); ctx.lineTo(X, Y); ctx.lineTo(X + r, Y); ctx.fill(); ctx.fillStyle = CS.ink; ctx.fillRect(X - r * .7, Y, r * 1.9, Math.max(1, r * .22)); });

    /* fog */
    const fogStop = Math.max(sBeach ? sBeach.a : 0, sBr ? sBr.a : 0), fogAmt = clamp(.3 * (1 - sstep(14, 30, Z)) + .6 * fogStop, 0, 1);
    fogs.forEach(g => { const span = 130, u = ((g[0] + t * .9 * (.5 + g[3])) % span) / span, x = -28 + u * span, a = Math.sin(u * Math.PI) * g[4] * fogAmt * (1 - .45 * dark) * (1 - sstep(44, 88, x));
      if (a < .01) return; pj(x, g[1], 5); const r = g[2] * Z * 1.2; if (X < -r || X > W + r || Y < -r || Y > H + r) return;
      ctx.save(); ctx.translate(X, Y); ctx.scale(1, .5); const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      gr.addColorStop(0, rgba(C.fog, a * 1.5)); gr.addColorStop(.55, rgba(C.fog, a * .8)); gr.addColorStop(1, rgba(C.fog, 0)); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.restore(); });

    /* labels */
    placed.length = 0;
    const halo = rgba(dark > .5 ? PAL.water[1] : [255, 255, 255], .75), inkA = rgba(C.ink, .78), sub = rgba(C.ink, .55);
    hover = -1; let best = 30 * 30;
    stops.forEach(s => { const bob = .18 * Math.sin(t * 1.5 + s.i), z = s.top + 1.1 + bob; pj(s.cx, s.cy, s.top + .05); const bx = X, by = Y; pj(s.cx, s.cy, z); s.sx = X; s.sy = Y;
      const dx = mx - X, dy = my - Y, d2 = dx * dx + dy * dy; if (d2 < best) { best = d2; hover = s.i; } s.bx = bx; s.by = by; });
    stops.forEach(s => { ctx.strokeStyle = rgba(C.ink, .5); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(s.bx, s.by); ctx.lineTo(s.sx, s.sy); ctx.stroke();
      const r = 5 + 2.5 * s.a + (hover === s.i ? 1.5 : 0), m = s.a, x = s.sx, y = s.sy; ctx.fillStyle = CS[s.accent]; ctx.strokeStyle = CS.ink; ctx.lineWidth = 1.3; ctx.beginPath();
      ctx.moveTo(x - r, y + r * .9); ctx.lineTo(x + r, y + r * .9); ctx.lineTo(x + r * (1 - m), y - r * .9); ctx.lineTo(x - r * (1 - m), y - r * .9); ctx.closePath(); ctx.fill(); ctx.stroke();
      placed.push([x - 12, y - 12, x + 12, y + 12]);
      if (Z >= 12.5 || s.a > .3) { ctx.font = '13px "Geist Serif", Georgia, serif'; const tx = (s.title.length > 26 ? s.place : s.title), w = ctx.measureText(tx).width;
        let clash = false; for (const p of placed) if (x + 12 < p[2] && x + 16 + w > p[0] && y - 9 < p[3] && y + 9 > p[1] && p[0] !== x - 12) clash = true;
        if (!clash) { placed.push([x + 10, y - 10, x + 20 + w, y + 10]); ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineWidth = 3.5; ctx.strokeStyle = halo; ctx.strokeText(tx, x + 13, y); ctx.fillStyle = CS.ink; ctx.fillText(tx, x + 13, y); } } });
    for (const l of LABELS) { if (Z < l.min) continue;
      if (l.kind === 'water') label(l.x, l.y, 0, l.text, (Z > 17 ? 17 : 14) + 'px "Geist Serif", Georgia, serif', sub, rgba(C.water, .0), true);
      else if (l.kind === 'park') label(l.x, l.y, 0, l.text, '13px "Geist Serif", Georgia, serif', rgba(mix(C.tree1, C.ink, .55), .95), halo, true);
      else if (l.kind === 'hood') label(l.x, l.y, 0, l.text, (Z > 28 ? 15 : 13) + 'px "Geist Serif", Georgia, serif', inkA, halo, true);
      else { pj(l.x, l.y, 0); const px = X, py = Y; label(l.x, l.y, 0, l.text, '11px "Geist Pixel", monospace', inkA, halo, false); if (placed.length && placed[placed.length - 1][0] === px + 2) { ctx.fillStyle = CS.ink; ctx.fillRect(px - 2.5, py - 2.5, 5, 5); } } }
    if (Z >= 21) ROADS.forEach(r => { if (!r.name) return; const a = r.p[0], b = r.p[r.p.length - 1], u = .42, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u); pj(a[0], a[1], 0); const ax = X, ay = Y; pj(b[0], b[1], 0); let ang = Math.atan2(Y - ay, X - ax); if (ang > Math.PI / 2 || ang < -Math.PI / 2) ang += Math.PI;
      pj(x, y, 0); if (X < 0 || X > W || Y < 60 || Y > H) return; ctx.save(); ctx.translate(X, Y); ctx.rotate(ang); ctx.font = '11px "Geist Pixel", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 3; ctx.strokeStyle = halo; ctx.strokeText(r.name, 0, 0); ctx.fillStyle = sub; ctx.fillText(r.name, 0, 0); ctx.restore(); });

    /* viewfinder on the current stop */
    if (cur >= 0 && plateOpen) { const s = stops[cur], e = sstep(0, 1, lock); pj(s.cx, s.cy, s.top * .5); const cx = X, cy = Y;
      if (cx > 0 && cx < W && cy > 0 && cy < H) { const R = Math.min(W, H) * (mobile ? .2 : .17) * (1.45 - .45 * e), arm = R * .28;
        ctx.strokeStyle = rgba(C.ink, .8 * e); ctx.lineWidth = 1.6; ctx.beginPath();
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(q => { ctx.moveTo(cx + q[0] * R, cy + q[1] * R * .8 - q[1] * arm); ctx.lineTo(cx + q[0] * R, cy + q[1] * R * .8); ctx.lineTo(cx + q[0] * R - q[0] * arm, cy + q[1] * R * .8); }); ctx.stroke();
        ctx.font = '12px "Geist Pixel", monospace'; ctx.textBaseline = 'top'; ctx.textAlign = 'left'; ctx.lineWidth = 3; ctx.strokeStyle = halo; ctx.strokeText(s.coords, cx - R, cy + R * .8 + 8); ctx.fillStyle = rgba(C.ink, .85 * e); ctx.fillText(s.coords, cx - R, cy + R * .8 + 8); } }

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
