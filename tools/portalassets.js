// Cuts the store and portal covers from the key art and captures four wide gameplay screenshots.
// Writes marketing/portals/, marketing/cover-*.png and marketing/itch/banner-960x420.png.
// Usage: node tools/portalassets.js [covers]  (`covers` skips the screenshots, which need the game served at http://localhost:5173).
const {createCanvas, loadImage, GlobalFonts} = require('@napi-rs/canvas'); const fs = require('fs'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'marketing', 'portals');
fs.mkdirSync(OUT, {recursive: true});
(async () => {
  // every cover is cut from the untitled key art and gets the title drawn to fit its own width, so the narrow and square
  // sizes keep the whole name instead of cropping it
  GlobalFonts.registerFromPath(path.join(__dirname, 'fonts', 'grandstander-latin-900-normal.woff2'), 'Grandstander');
  const im = await loadImage(fs.readFileSync(path.join(ROOT, 'marketing', 'keyart-notitle.png')));
  const title = (x, w, size, ty) => {
    x.save(); x.textAlign = 'center'; x.lineJoin = 'round'; const t = 'Killi and Milli';
    for (; size > 40; size -= 2) { x.font = `900 ${size}px Grandstander`; if (x.measureText(t).width <= w * .9) break; }
    x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = size * .2; x.shadowOffsetY = size * .1; x.lineWidth = size * .19; x.strokeStyle = '#05303d'; x.strokeText(t, w / 2, ty + size); x.shadowColor = 'transparent';
    x.fillStyle = '#a5640f'; x.fillText(t, w / 2, ty + size + size * .06); x.fillStyle = '#f6c445'; x.fillText(t, w / 2, ty + size); x.restore();
  };
  // crop the art to a size around the two fish (the focus sits at 52% across, 60% down), then put the title in the water above them
  const cut = (w, h, out, size = h * .13, fx = .52, fy = .6, src = im) => {
    const s = Math.max(w / src.width, h / src.height), sw = w / s, sh = h / s;
    const sx = Math.max(0, Math.min(src.width - sw, src.width * fx - sw / 2)), sy = Math.max(0, Math.min(src.height - sh, src.height * fy - sh / 2));
    const c = createCanvas(w, h), x = c.getContext('2d'); x.drawImage(src, sx, sy, sw, sh, 0, 0, w, h);
    title(x, w, size, h * .04);
    fs.mkdirSync(path.dirname(out), {recursive: true}); fs.writeFileSync(out, c.toBuffer('image/png'));
  };
  const P = n => path.join(OUT, n), M = n => path.join(ROOT, 'marketing', n);
  cut(1920, 1080, P('cover-16x9-1920x1080.png')); cut(1280, 720, P('cover-16x9-1280x720.png'));
  cut(1600, 1200, P('cover-4x3-1600x1200.png')); cut(1024, 1024, P('icon-1x1-1024.png'), 118); cut(512, 512, P('icon-1x1-512.png'), 59); cut(628, 628, P('icon-1x1-628.png'), 72);
  cut(1000, 1500, P('cover-2x3-1000x1500.png'), 120);
  cut(1920, 1080, P('crazygames-landscape-1920x1080.png')); cut(800, 1200, P('crazygames-portrait-800x1200.png'), 96); cut(800, 800, P('crazygames-square-800x800.png'), 92);
  cut(1260, 1000, M('cover-1260x1000.png')); cut(630, 500, M('cover-630x500.png')); // the banner is cut from a copy of the art with the clam raised, so the title and the clam both fit its short frame
  const bim = await loadImage(fs.readFileSync(path.join(ROOT, 'marketing', 'reference', 'keyart-banner-notitle.png')));
  cut(960, 420, M(path.join('itch', 'banner-960x420.png')), 64, .52, .4, bim);
  console.log('covers done'); if (process.argv[2] === 'covers') return;
  const {chromium} = await import('/opt/node22/lib/node_modules/playwright/index.mjs');
  const b = await chromium.launch(); const ctx = await b.newContext({viewport: {width: 1920, height: 1080}, deviceScaleFactor: 1, colorScheme: 'dark'});
  const p = await ctx.newPage();
  await p.addInitScript(() => localStorage.setItem('puffer-panic-v2', JSON.stringify({unlocked: 18, best: {}, seenIntro: true, seenStory: {bruiser: true, queen: true}, muted: true, music: false, stats: {snacks: 600}})));
  await p.goto('http://localhost:5173/', {waitUntil: 'load'}); await p.waitForTimeout(600);
  await p.evaluate(() => window.__pp.endStory());
  const shots = [[0, false, 'shot-1-the-shallows.png'], [6, false, 'shot-2-urchin-garden.png'], [12, true, 'shot-3-bruiser-co-op.png'], [17, true, 'shot-4-kraken-queen.png']];
  for (const [lv, two, name] of shots) {
    await p.evaluate(([lv, two]) => { const G = window.__pp; G.setTwoP(two); G.startLevel(lv); }, [lv, two]); await p.waitForTimeout(3200);
    await p.evaluate(() => { const S = window.__pp.S; if (S && S.players[0]) S.players[0].bufPuff = true; }); await p.waitForTimeout(250);
    // the board is nearly square, so the shot is cut to 4:3 around it rather than left with dark margins
    const r = await p.evaluate(() => { const b = document.querySelector('#stage').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
    await p.screenshot({path: path.join(OUT, name), clip: {x: Math.max(0, r[0] - 720), y: Math.max(0, r[1] - 540), width: 1440, height: 1080}});
  }
  await b.close(); console.log('screenshots done');
})();
