// Cuts the portal submission images from the key art and captures four wide gameplay screenshots.
// Writes marketing/portals/. Usage: node tools/portalassets.js (needs the game served at http://localhost:5173 for the screenshots).
const {createCanvas, loadImage} = require('@napi-rs/canvas'); const fs = require('fs'); const path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'marketing', 'portals');
fs.mkdirSync(OUT, {recursive: true});
(async () => {
  const im = await loadImage(fs.readFileSync(path.join(ROOT, 'marketing', 'keyart.png')));
  // crop the key art to a size, keeping the title and the two fish: the focus sits a little above centre
  const cut = (w, h, name, fy = .46) => {
    const s = Math.max(w / im.width, h / im.height), sw = w / s, sh = h / s, sx = (im.width - sw) / 2, sy = Math.max(0, Math.min(im.height - sh, im.height * fy - sh / 2));
    const c = createCanvas(w, h); c.getContext('2d').drawImage(im, sx, sy, sw, sh, 0, 0, w, h);
    fs.writeFileSync(path.join(OUT, name), c.toBuffer('image/png'));
  };
  cut(1920, 1080, 'cover-16x9-1920x1080.png', .3); cut(1280, 720, 'cover-16x9-1280x720.png', .3); // wide cuts start at the top so the title stays in
  cut(1600, 1200, 'cover-4x3-1600x1200.png'); cut(1024, 1024, 'icon-1x1-1024.png', .5); cut(512, 512, 'icon-1x1-512.png', .5); cut(628, 628, 'icon-1x1-628.png', .5);
  cut(1000, 1500, 'cover-2x3-1000x1500.png', .5);
  console.log('covers done');
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
