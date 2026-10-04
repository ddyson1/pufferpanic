// Makes the Poki thumbnails from the chase key art: text-free square stills and a 5 second animated loop (1080 x 1080,
// 60 fps, silent mp4). The reef, Killi and Milli come from marketing/reference/chase-*.png; the jellyfish, moray and
// clam are drawn each frame by the game's own draw functions so they move the way they do in play.
// Usage: node tools/pokithumb.js  (writes marketing/portals/poki-thumb-*.png and poki-animated-thumb-1080.mp4)
const {JSDOM} = require('jsdom'); const fs = require('fs'); const path = require('path'); const {spawn} = require('child_process');
const {createCanvas, loadImage} = require('@napi-rs/canvas');
const ROOT = path.join(__dirname, '..'), REF = path.join(ROOT, 'marketing', 'reference'), OUT = path.join(ROOT, 'marketing', 'portals');
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
// no glow under the snack (it reads as a smudge on the paper art), and a few hooks for drawing outside a level
html = html.replace("g.addColorStop(0, 'rgba(255,250,210,0.26)'); g.addColorStop(1, 'rgba(255,250,210,0)');", "g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0)');");
html = html.replace('window.__pp = {LEVELS,', 'window.__pp = {setCtx(c) { ctx = c; }, setTime(t) { time = t; }, drawEnemy, drawSnack, LEVELS,');
const dom = new JSDOM(html, {url: 'https://example.com/', runScripts: 'dangerously', pretendToBeVisual: true, beforeParse(w) {
  const P = w.HTMLCanvasElement.prototype, B = new WeakMap();
  const back = el => { let b = B.get(el); if (!b) { b = {cv: createCanvas(300, 150)}; B.set(el, b); } return b; };
  Object.defineProperty(P, 'width', {get() { return back(this).cv.width; }, set(v) { back(this).cv.width = Math.max(1, v | 0); }});
  Object.defineProperty(P, 'height', {get() { return back(this).cv.height; }, set(v) { back(this).cv.height = Math.max(1, v | 0); }});
  P.getContext = function () { const b = back(this); if (b.px) return b.px; const real = () => b.cv.getContext('2d');
    b.px = new Proxy({}, {get(t, k) { const r = real(); if (k === 'drawImage') return (img, ...a) => r.drawImage(img instanceof w.HTMLCanvasElement ? back(img).cv : img, ...a); const v = r[k]; return typeof v === 'function' ? v.bind(r) : v; }, set(t, k, v) { real()[k] = v; return true; }}); return b.px; };
  P.__cv = function () { return back(this).cv; };
  w.localStorage.setItem('puffer-panic-v2', JSON.stringify({unlocked: 18, best: {}, seenIntro: true, seenStory: {bruiser: true, queen: true}}));
  w.requestAnimationFrame = () => 0; // the game's own loop stays off so nothing moves the creatures between frames
  w.matchMedia = () => ({matches: false, addEventListener() {}}); w.innerHeight = 900; w.devicePixelRatio = 2;
  Object.defineProperty(w.HTMLElement.prototype, 'clientWidth', {get() { return 780; }});
}});
setTimeout(async () => {
  const w = dom.window, G = w.__pp;
  const rows = []; for (let y = 0; y < 13; y++) { let r = ''; for (let x = 0; x < 15; x++) r += (x === 0 || y === 0 || x === 14 || y === 12) ? '#' : '.'; rows.push(r); }
  const set = (x, y, c) => { rows[y] = rows[y].slice(0, x) + c + rows[y].slice(x + 1); };
  set(3, 3, 'J'); set(9, 5, 'E'); set(13, 1, '1'); set(12, 10, 'P');
  G.LEVELS.push({name: 'thumb', hint: '', waves: ['krill'], map: rows}); G.setTwoP(false); G.loadLevel(G.LEVELS.length - 1); G.tick(.4);
  const J = G.S.enemies.find(e => e.kind === 'J'), E = G.S.enemies.find(e => e.kind === 'E');
  for (const e of [J, E]) { e.stun = 0; e.fx = e.fy = 0; e.moving = true; }
  J.dir = {x: 0, y: 1}; E.dir = E.face = {x: 1, y: 0}; E.trail = Array.from({length: 11}, (_, i) => ({x: -.12 * (i + 1), y: .004 * (i + 1) * (i + 1)}));
  const clam = {type: 'clam', fx: 0, fy: 0, x: 0, y: 0, born: -99, anim: 1, lid: 1, dir: {x: 1, y: 0}};
  // draws one creature with the game's code into its own canvas at T px per tile, with the paper drop shadow, and
  // places the point (ux, uy) of the tile at (px, py) in the scene
  const sprite = (x, T, box, fn, ux, uy, px, py) => {
    const [bx0, by0, bx1, by1] = box, Wp = Math.ceil((bx1 - bx0) * T), Hp = Math.ceil((by1 - by0) * T), ox = -bx0 * T, oy = -by0 * T;
    const el = w.document.createElement('canvas'); el.width = Wp; el.height = Hp; const c = el.getContext('2d');
    c.setTransform(T, 0, 0, T, ox, oy); G.setCtx(c); fn(); const sp = el.__cv();
    const sil = createCanvas(Wp, Hp), sx = sil.getContext('2d'); sx.drawImage(sp, 0, 0); sx.globalCompositeOperation = 'source-in'; sx.fillStyle = '#0a1e3c'; sx.fillRect(0, 0, Wp, Hp);
    const dx = px - (ox + ux * T), dy = py - (oy + uy * T);
    x.globalAlpha = .38; x.drawImage(sil, dx + .03 * T, dy + .06 * T); x.globalAlpha = 1; x.drawImage(sp, dx, dy);
  };
  const bg = await loadImage(fs.readFileSync(path.join(REF, 'chase-background.png')));
  const killi = await loadImage(fs.readFileSync(path.join(REF, 'chase-killi.png'))), milli = await loadImage(fs.readFileSync(path.join(REF, 'chase-milli.png')));
  const KC = [695, 635, 423, 385], MC = [1315, 665, 1025, 403]; // centre and top-left of each cut-out in the scene
  // bubbles rising through the water, each looping exactly once per 5 s
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const bubbles = Array.from({length: 14}, () => ({x: 470 + rnd() * 1080, r: 6 + rnd() * 12, ph: rnd(), sway: rnd() * 6.28}));
  const scene = createCanvas(bg.width, bg.height), sx = scene.getContext('2d');
  const draw = u => { // u runs 0..1 over the loop
    const a = u * Math.PI * 2;
    sx.drawImage(bg, 0, 0);
    G.setTime(a + 10); E.anim = a; J.anim = a;
    sprite(sx, 300, [-1.3, -.2, 1.2, 1.5], () => G.drawEnemy(E), .5, .45, 1395, 300 + Math.sin(a) * 6);
    const fish = (img, C, s, bob) => { sx.save(); sx.translate(C[0], C[1] + bob); sx.scale(s, s); sx.drawImage(img, C[2] - C[0], C[3] - C[1]); sx.restore(); };
    // the fish breathe: they only ever grow past their size in the reef, so the copy baked into it never shows
    fish(milli, MC, 1.022 + .012 * Math.sin(2 * a + 1.3), 3 * Math.sin(2 * a + 1.3));
    sprite(sx, 400, [-.1, -.1, 1.1, 1.0], () => G.drawEnemy(J), .5, .34, 1100, 345 + Math.sin(a + 2) * 10);
    fish(killi, KC, 1.022 + .012 * Math.sin(2 * a), 3 * Math.sin(2 * a));
    sprite(sx, 600, [-.1, -.1, 1.1, 1.1], () => G.drawSnack(clam), .5, .48, 985, 880, );
    for (const b of bubbles) { const p = (u + b.ph) % 1, y = 1130 - p * 1250, x = b.x + Math.sin(a * 2 + b.sway) * 8;
      sx.globalAlpha = Math.min(1, p * 6, (1 - p) * 6); sx.fillStyle = 'rgba(200,236,240,0.35)'; sx.strokeStyle = 'rgba(245,252,252,0.9)'; sx.lineWidth = b.r * .22;
      sx.beginPath(); sx.arc(x, y, b.r, 0, Math.PI * 2); sx.fill(); sx.stroke(); sx.fillStyle = '#fff'; sx.beginPath(); sx.arc(x - b.r * .35, y - b.r * .35, b.r * .22, 0, Math.PI * 2); sx.fill(); sx.globalAlpha = 1; }
  };
  // square camera on the two fish, pushing in a little and back over the loop
  const frame = (u, size) => { const c = createCanvas(size, size), x = c.getContext('2d'); const z = 1.03 - .03 * Math.cos(u * Math.PI * 2), side = bg.height / z;
    x.drawImage(scene, 1003 - side / 2, Math.min(bg.height - side, Math.max(0, 600 - side / 2)), side, side, 0, 0, size, size); return c; };
  draw(0); for (const s of [1024, 628]) fs.writeFileSync(path.join(OUT, `poki-thumb-${s}.png`), frame(0, s).toBuffer('image/png'));
  console.log('stills done');
  const FPS = 60, N = FPS * 5, out = path.join(OUT, 'poki-animated-thumb-1080.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', '1080x1080', '-r', String(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', out], {stdio: ['pipe', 'inherit', 'inherit']});
  for (let i = 0; i < N; i++) { draw(i / N); const buf = frame(i / N, 1080).getContext('2d').getImageData(0, 0, 1080, 1080).data;
    if (!ff.stdin.write(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength))) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); ff.on('close', code => { console.log('video', code === 0 ? 'done' : 'failed', out); process.exit(code); });
}, 500);
