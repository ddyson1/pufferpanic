// Store cover: Killi, Milli and a crab on the paper reef with the title on top, drawn from the game itself
// so it always matches the build. Writes marketing/cover-1260x1000.png (itch.io, 2x of its 630x500) and
// marketing/cover-630x500.png. The title font is bundled in tools/fonts/ (Grandstander, OFL) because the
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
  const rows = []; for (let y = 0; y < 13; y++) { let r = ''; for (let x = 0; x < 15; x++) r += (x === 0 || y === 0 || x === 14 || y === 12) ? '#' : '.'; rows.push(r); }
  const set = (x, y, c) => { rows[y] = rows[y].slice(0, x) + c + rows[y].slice(x + 1); };
  set(7, 7, 'P'); set(8, 7, 'Q'); set(9, 8, 'C'); set(6, 8, 'c'); set(10, 9, 'k'); set(5, 9, 'k'); set(13, 1, '1');
  G.LEVELS.push({name: 'x', hint: '', waves: ['krill'], map: rows});
  G.setTwoP(true); G.loadLevel(G.LEVELS.length - 1); G.tick(.3);
  const S = G.S; S.players[0].face = {x: 1, y: 0}; S.players[1].face = {x: -1, y: 0};
  G.setTwoP(false); // hides the name tags
  G.draw();
  const W = 1260, H = 1000, c = createCanvas(W, H), x = c.getContext('2d');
  const tw = 4.8, th = tw * H / W, x0 = 8 - tw / 2, y0 = 7.7 - th / 2;
  x.drawImage(cv, x0 * T, y0 * T, tw * T, th * T, 0, 0, W, H);
  // title in the game's font, gold with a paper drop like the in-game cards
  const title = 'Killi and Milli', tx = W / 2, ty = 215;
  x.textAlign = 'center'; x.lineJoin = 'round'; x.font = '900 150px Grandstander';
  x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 30; x.shadowOffsetY = 14; x.lineWidth = 28; x.strokeStyle = '#05303d'; x.strokeText(title, tx, ty); x.shadowColor = 'transparent';
  x.fillStyle = '#a5640f'; x.fillText(title, tx, ty + 8); x.fillStyle = '#f6c445'; x.fillText(title, tx, ty);
  x.font = '800 44px Grandstander'; x.lineWidth = 12; x.strokeText('a co-op reef maze', tx, ty + 70); x.fillStyle = '#e6f6f5'; x.fillText('a co-op reef maze', tx, ty + 70);
  fs.writeFileSync(path.join(ROOT, 'marketing', 'cover-1260x1000.png'), c.toBuffer('image/png'));
  const half = createCanvas(630, 500); half.getContext('2d').drawImage(c, 0, 0, 630, 500);
  fs.writeFileSync(path.join(ROOT, 'marketing', 'cover-630x500.png'), half.toBuffer('image/png'));
  console.log('cover done'); process.exit(0);
});
