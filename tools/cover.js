// Store cover: the whole cast around the title on the paper reef, drawn from the game itself
// so it always matches the build. Writes marketing/cast-cover-1260x1000.png (itch.io size at 2x) and
// marketing/cast-cover-630x500.png. The store cover itself (marketing/cover-*.png) is the key art cut from marketing/keyart.png. The title font is bundled in tools/fonts/ (Grandstander, OFL) because the
// game loads it from Google Fonts, which node cannot.
const {JSDOM} = require('jsdom'); const fs = require('fs'); const path = require('path');
const {createCanvas, GlobalFonts} = require('@napi-rs/canvas');
const ROOT = path.join(__dirname, '..');
GlobalFonts.registerFromPath(path.join(__dirname, 'fonts', 'grandstander-latin-900-normal.woff2'), 'Grandstander');
GlobalFonts.registerFromPath(path.join(__dirname, 'fonts', 'grandstander-latin-800-normal.woff2'), 'Grandstander');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
function boot(dprv, cb) { const dom = new JSDOM(html, {url: 'https://example.com/', runScripts: 'dangerously', pretendToBeVisual: true, beforeParse(w) {
  const P = w.HTMLCanvasElement.prototype; const B = new WeakMap();
  const back = el => { let b = B.get(el); if (!b) { b = {cv: createCanvas(300, 150)}; B.set(el, b); } return b; };
  Object.defineProperty(P, 'width', {get() { return back(this).cv.width; }, set(v) { back(this).cv.width = Math.max(1, v | 0); }});
  Object.defineProperty(P, 'height', {get() { return back(this).cv.height; }, set(v) { back(this).cv.height = Math.max(1, v | 0); }});
  P.getContext = function () { const b = back(this); if (b.px) return b.px; const real = () => b.cv.getContext('2d');
    b.px = new Proxy({}, {get(t, k) { const r = real(); if (k === 'drawImage') return (img, ...a) => r.drawImage(img instanceof w.HTMLCanvasElement ? back(img).cv : img, ...a);
      const v = r[k]; return typeof v === 'function' ? v.bind(r) : v; }, set(t, k, v) { real()[k] = v; return true; }}); return b.px; };
  P.__cv = function () { return back(this).cv; };
  w.localStorage.setItem('puffer-panic-v2', JSON.stringify({unlocked: 18, best: {}, seenIntro: true, seenStory: {bruiser: true, queen: true}}));
  w.matchMedia = () => ({matches: false, addEventListener() {}}); w.innerHeight = 900; w.devicePixelRatio = dprv;
  Object.defineProperty(w.HTMLElement.prototype, 'clientWidth', {get() { return 780; }});
}}); setTimeout(() => cb(dom.window), 400); }

boot(4, w => {
  const G = w.__pp, cv = w.document.querySelector('#c').__cv(), T = cv.width / 15;
  const tp = (a, x, y) => { a.x = a.tx = a.fx = x; a.y = a.ty = a.fy = y; a.moving = false; if (a.trail) a.trail = a.trail.map((_, i) => ({x: x - a.dir.x * i * .14, y: y - a.dir.y * i * .14})); };
  // the whole cast around the title: a level with one of everything, then everyone is placed by hand
  const map = ['###############', '#.............#', '#.C.J.E.S.Y.F.#', '#...k......k..#', '#..c........c.#', '#.C.J.......B.#', '#.....P.Q.....#',
    '#.............#', '#......N......#', '#....c...c....#', '#1.1.1.1.1.1.1#', '#.............#', '###############'];
  G.LEVELS.push({name: 'cast', boss: 'shark', hint: '', waves: ['krill'], map});
  G.setTwoP(true); G.loadLevel(G.LEVELS.length - 1); G.tick(.4); G.setTwoP(false); // one player hides the fish name tags
  const S = G.S, P = S.players, E = S.enemies, L = {x: -1, y: 0}, R = {x: 1, y: 0};
  tp(P[0], 5.9, 5.9); P[0].face = R; P[0].puff = .6; tp(P[1], 8.5, 5.95); P[1].face = L;
  const niko = S.friends[0]; tp(niko, 7.1, 7.9); niko.dir = R;
  const by = k => E.filter(e => e.kind === k);
  const [c1, c2] = by('C'), [j1, j2] = by('J'), [eel] = by('E'), [sw] = by('S'), [ray] = by('Y'), [lion] = by('F'), [shark] = by('K');
  tp(c1, 4.0, 7.5); c1.dir = R; tp(c2, 10.9, 7.6); c2.dir = L; tp(j1, 4.1, 5.0); tp(j2, 11.3, 6.4);
  tp(eel, 4.9, 9.0); eel.dir = R; tp(sw, 10.2, 9.0); sw.dir = L; tp(ray, 7.6, 9.25); ray.state = 'hunt'; ray.dir = L;
  tp(lion, 3.6, 6.3); lion.ph = 'fan'; lion.ft = 1; tp(shark, 10.5, 5.1); shark.dir = L; shark.charge = true; shark.windup = 0; shark.crash = 0;
  for (const e of E) e.stun = 0;
  const types = ['krill', 'pearl', 'grape', 'star', 'clam', 'shrimp', 'moon'], pos = [[5.3, 7.4], [9.6, 7.4], [6.0, 8.5], [8.6, 8.8], [3.4, 8.5], [11.6, 8.6], [7.4, 5.0]];
  S.snacks.forEach((s, i) => { if (i < pos.length) { tp(s, pos[i][0], pos[i][1]); s.type = types[i]; s.born = -9; s.wait = 0; s.open = true; } else tp(s, -5, -5); });
  // Niko's name tag is drawn above him; render once without him and paste his body back in from a frame with him
  G.draw(); const withNiko = createCanvas(cv.width, cv.height); withNiko.getContext('2d').drawImage(cv, 0, 0);
  S.friends.length = 0; G.draw();
  const pc = cv.getContext('2d'); pc.save(); pc.setTransform(1, 0, 0, 1, 0, 0); pc.drawImage(withNiko, (niko.fx - .4) * T, (niko.fy + .06) * T, 1.8 * T, 1.0 * T, (niko.fx - .4) * T, (niko.fy + .06) * T, 1.8 * T, 1.0 * T); pc.restore();
  const W = 1260, H = 1000, c = createCanvas(W, H), x = c.getContext('2d');
  const tw = 9.2, th = tw * H / W, x0 = 7.5 - tw / 2, y0 = 6.45 - th / 2;
  x.drawImage(cv, x0 * T, y0 * T, tw * T, th * T, 0, 0, W, H);
  // title in the game's font, gold with a paper drop like the in-game cards
  const title = 'Killi and Milli', tx = W / 2, ty = 215;
  x.textAlign = 'center'; x.lineJoin = 'round'; x.font = '900 150px Grandstander';
  x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 30; x.shadowOffsetY = 14; x.lineWidth = 28; x.strokeStyle = '#05303d'; x.strokeText(title, tx, ty); x.shadowColor = 'transparent';
  x.fillStyle = '#a5640f'; x.fillText(title, tx, ty + 8); x.fillStyle = '#f6c445'; x.fillText(title, tx, ty);
  x.font = '800 44px Grandstander'; x.lineWidth = 12; x.strokeText('a co-op reef maze', tx, ty + 70); x.fillStyle = '#e6f6f5'; x.fillText('a co-op reef maze', tx, ty + 70);
  fs.writeFileSync(path.join(ROOT, 'marketing', 'cast-cover-1260x1000.png'), c.toBuffer('image/png'));
  const half = createCanvas(630, 500); half.getContext('2d').drawImage(c, 0, 0, 630, 500);
  fs.writeFileSync(path.join(ROOT, 'marketing', 'cast-cover-630x500.png'), half.toBuffer('image/png'));
  console.log('cover done'); process.exit(0);
});
