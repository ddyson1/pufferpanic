// Makes the itch.io page background from a reef picture: the picture at 1920 wide, and a second copy with a grainy
// white paper sheet 1300 px wide down the middle for the page column. Usage: node tools/itchpaper.js <image> <name>
// writes marketing/itch/background-<name>-1920.png and background-<name>-paper-1920.png.
const {createCanvas, loadImage} = require('@napi-rs/canvas'); const fs = require('fs'); const path = require('path');
const [src, name] = process.argv.slice(2); const OUT = path.join(__dirname, '..', 'marketing', 'itch');
(async () => {
  const im = await loadImage(fs.readFileSync(src)); const W = 1920, H = Math.round(im.height * W / im.width);
  const c0 = createCanvas(W, H); c0.getContext('2d').drawImage(im, 0, 0, W, H); fs.writeFileSync(path.join(OUT, `background-${name}-1920.png`), c0.toBuffer('image/png'));
  const c = createCanvas(W, H), x = c.getContext('2d'); x.drawImage(im, 0, 0, W, H);
  const pw = 1300, px = (W - pw) / 2; let seed = 3; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const edge = side => { const pts = []; for (let y = 0; y <= H; y += 24) pts.push([px + (side ? pw : 0) + (rnd() - .5) * 10, y]); return pts; };
  const L = edge(0), R = edge(1);
  const sheet = () => { x.beginPath(); x.moveTo(L[0][0], -10); for (const [a, b] of L) x.lineTo(a, b); x.lineTo(L[L.length - 1][0], H + 10); x.lineTo(R[R.length - 1][0], H + 10); for (let i = R.length - 1; i >= 0; i--) x.lineTo(R[i][0], R[i][1]); x.lineTo(R[0][0], -10); x.closePath(); };
  x.save(); x.translate(8, 10); x.fillStyle = 'rgba(2,20,28,0.35)'; sheet(); x.fill(); x.restore();
  x.fillStyle = '#f6f1e6'; sheet(); x.fill();
  x.save(); sheet(); x.clip();
  for (let i = 0; i < 140000; i++) { x.fillStyle = rnd() < .5 ? 'rgba(120,100,70,0.08)' : 'rgba(255,255,255,0.5)'; x.fillRect(px + rnd() * pw, rnd() * H, rnd() * 2 + 1, 1); }
  for (let i = 0; i < 900; i++) { x.fillStyle = 'rgba(150,130,100,0.10)'; x.beginPath(); x.ellipse(px + rnd() * pw, rnd() * H, rnd() * 6 + 2, rnd() * 1.5 + .5, rnd() * 3, 0, Math.PI * 2); x.fill(); }
  x.restore();
  fs.writeFileSync(path.join(OUT, `background-${name}-paper-1920.png`), c.toBuffer('image/png')); console.log('ok', W, H);
})();
