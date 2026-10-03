// Draws the itch.io page background: layered cut paper coral along the left and right edges of a dark teal paper
// field, with the centre left empty for the page column. Writes marketing/itch/background-1920x1200.png.
const {createCanvas} = require('@napi-rs/canvas'); const fs = require('fs'); const path = require('path');
const W = 1920, H = 1200, c = createCanvas(W, H), x = c.getContext('2d');
let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const rr = (a, b) => a + rnd() * (b - a);
// paper field with a faint grain
x.fillStyle = '#0e5a68'; x.fillRect(0, 0, W, H);
for (let i = 0; i < 26000; i++) { x.fillStyle = rnd() < .5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.05)'; const px = rnd() * W, py = rnd() * H; x.fillRect(px, py, rr(1, 3), 1); }
const piece = (draw, col, sh = 10) => { x.save(); x.translate(sh * .5, sh); x.fillStyle = 'rgba(2,20,28,0.42)'; x.beginPath(); draw(); x.fill(); x.restore(); x.fillStyle = col; x.beginPath(); draw(); x.fill(); };
const PAL = ['#f08aa0', '#ff9f8a', '#f6c445', '#8fd3c8', '#c9a6ec', '#ffd1a8', '#e86f8a', '#6fb7c9'];
// branching coral: a trunk that forks, drawn as fat rounded strokes, each branch a separate piece
const branch = (bx, by, ang, len, w, col, depth) => {
  const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len;
  piece(() => { x.moveTo(bx, by); x.lineTo(ex, ey); }, col, 8);
  x.save(); x.lineCap = 'round'; x.lineWidth = w; x.strokeStyle = 'rgba(2,20,28,0.42)'; x.beginPath(); x.moveTo(bx + 4, by + 8); x.lineTo(ex + 4, ey + 8); x.stroke(); x.strokeStyle = col; x.beginPath(); x.moveTo(bx, by); x.lineTo(ex, ey); x.stroke(); x.restore();
  if (depth > 0) { const n = rnd() < .6 ? 2 : 3; for (let i = 0; i < n; i++) branch(ex, ey, ang + rr(-.8, .8), len * rr(.55, .8), w * .75, col, depth - 1); }
  else piece(() => { x.arc(ex, ey, w * .8, 0, Math.PI * 2); }, col, 6); // a round lobe at every tip
};
const tube = (tx, ty, h, w, col) => { for (let i = 0; i < 3; i++) { const hh = h * rr(.6, 1), xx = tx + i * w * .9; piece(() => { x.roundRect(xx, ty - hh, w, hh, w / 2); }, col); piece(() => { x.ellipse(xx + w / 2, ty - hh, w * .42, w * .22, 0, 0, Math.PI * 2); }, '#0e5a68'); } };
const fan = (fx, fy, r, col, flip) => { piece(() => { x.moveTo(fx, fy); x.arc(fx, fy, r, Math.PI + (flip ? .2 : -.2), 2 * Math.PI + (flip ? .2 : -.2)); x.closePath(); }, col); x.strokeStyle = 'rgba(2,20,28,0.25)'; x.lineWidth = 3; for (let i = 1; i < 6; i++) { const a = Math.PI + (flip ? .2 : -.2) + i * Math.PI / 6; x.beginPath(); x.moveTo(fx, fy); x.lineTo(fx + Math.cos(a) * r * .95, fy + Math.sin(a) * r * .95); x.stroke(); } };
const kelp = (kx, ky, h, col) => { x.save(); x.lineCap = 'round'; for (const [dx, w] of [[6, 18], [0, 18]]) { x.strokeStyle = dx ? 'rgba(2,20,28,0.42)' : col; x.lineWidth = w; x.beginPath(); x.moveTo(kx + dx, ky + dx); for (let i = 1; i <= 6; i++) x.lineTo(kx + dx + Math.sin(i * 1.3 + kx) * 14, ky + dx - i * h / 6); x.stroke(); } x.restore(); };
const pebble = (px, py, r, col) => piece(() => { x.ellipse(px, py, r, r * .7, rr(-.4, .4), 0, Math.PI * 2); }, col, 6);
const bubble = (bx, by, r) => { x.strokeStyle = 'rgba(230,246,245,0.55)'; x.lineWidth = 3; x.beginPath(); x.arc(bx, by, r, 0, Math.PI * 2); x.stroke(); };
// one side: a sandy paper shelf at the bottom, then corals of three kinds up the edge
const side = (left) => {
  const sx = v => left ? v : W - v;
  piece(() => { x.moveTo(sx(0), H); x.lineTo(sx(0), H - 150); x.quadraticCurveTo(sx(140), H - 190, sx(300), H - 120); x.quadraticCurveTo(sx(380), H - 90, sx(420), H); x.closePath(); }, '#e7c99a', 12);
  for (let i = 0; i < 7; i++) pebble(sx(rr(30, 380)), H - rr(20, 110), rr(10, 22), ['#d9b58a', '#c4a07a', '#efd8b3'][i % 3]);
  const spots = [[60, H - 130, 150, 2], [200, H - 150, 120, 2], [40, 760, 110, 1], [160, 520, 100, 2], [60, 300, 120, 2], [220, 120, 90, 1]];
  spots.forEach(([bx, by, len, d], i) => { const col = PAL[(i * 3 + (left ? 0 : 1)) % PAL.length]; branch(sx(bx), by, -Math.PI / 2 + rr(-.3, .3), len, 36, col, d); });
  tube(sx(120), 980, 170, 34, PAL[2]); tube(sx(250), 640, 120, 28, PAL[6]);
  fan(sx(40), 980, 120, PAL[3], !left); fan(sx(300), 420, 90, PAL[0], left);
  kelp(sx(330), H - 140, 420, '#5c9f6a'); kelp(sx(10), 900, 520, '#4f8f5f'); kelp(sx(260), 300, 300, '#6aae78');
  for (let i = 0; i < 9; i++) bubble(sx(rr(20, 380)), rr(60, 1000), rr(5, 14));
};
side(true); side(false);
// footer: a sand shelf across the whole width with pebbles, shells and small corals
piece(() => { x.moveTo(0, H); x.lineTo(0, H - 70); for (let i = 0; i <= 12; i++) x.quadraticCurveTo(i * W / 12 + W / 24, H - 70 + (i % 2 ? 30 : -20), (i + 1) * W / 12, H - 70); x.lineTo(W, H); x.closePath(); }, '#e7c99a', 12);
for (let i = 0; i < 40; i++) pebble(rr(0, W), H - rr(8, 60), rr(8, 20), ['#d9b58a', '#c4a07a', '#efd8b3'][i % 3]);
for (let i = 0; i < 9; i++) { const bx = 450 + i * 130 + rr(-30, 30); branch(bx, H - 60, -Math.PI / 2 + rr(-.4, .4), rr(50, 90), 24, PAL[(i * 5) % PAL.length], 1); }
for (let i = 0; i < 5; i++) { const bx = 500 + i * 230; piece(() => { x.moveTo(bx, H - 40); x.arc(bx, H - 40, 26, Math.PI, 2 * Math.PI); x.closePath(); }, '#fff1dc', 6); x.strokeStyle = 'rgba(2,20,28,0.25)'; x.lineWidth = 2; for (let k = 1; k < 5; k++) { const a = Math.PI + k * Math.PI / 5; x.beginPath(); x.moveTo(bx, H - 40); x.lineTo(bx + Math.cos(a) * 24, H - 40 + Math.sin(a) * 24); x.stroke(); } }
const out = path.join(__dirname, '..', 'marketing', 'itch', 'background-1920x1200.png');
fs.writeFileSync(out, c.toBuffer('image/png')); console.log('wrote', out);
