require('fs').mkdirSync(require('path').join(__dirname, 'out'), {recursive: true});
const {createCanvas} = require('@napi-rs/canvas');
const fs = require('fs');
const W = 800, H = 560, INK = '#1d2a33';

// deterministic randomness so every style gets the same "random" details
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const lighten = (h, k) => toHex(hex(h).map(v => v + (255 - v) * k));
const darken = (h, k) => toHex(hex(h).map(v => v * (1 - k)));
const rgba = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a})`; };

// ---------------- path helpers ----------------
const P = {
  circle: (x, y, r) => c => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); },
  ell: (x, y, rx, ry, rot = 0) => c => { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); },
  rrect: (x, y, w, h, r) => c => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); },
  poly: pts => c => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); },
};

// ---------------- the four styles ----------------
const STYLES = {
  ink: {
    name: 'Ink and flat color',
    bg(c) {
      c.fillStyle = '#5cc0c6'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#67c9ce';
      for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(0, 60 + i * 90); for (let x = 0; x <= W; x += 40) c.lineTo(x, 60 + i * 90 + Math.sin(x / 70 + i) * 8); c.lineTo(W, 90 + i * 90); c.lineTo(0, 90 + i * 90); c.fill(); }
    },
    sand(c, path) { path(c); c.fillStyle = '#f0dfa8'; c.fill(); c.lineWidth = 4; c.strokeStyle = INK; c.stroke(); },
    shape(c, path, color, b, o = {}) {
      path(c); c.fillStyle = color; c.fill();
      if (!o.noLine) { c.lineWidth = o.detail ? 2.5 : 4; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); }
    },
    line(c, path, color, w) { c.lineCap = 'round'; c.lineJoin = 'round'; path(c); c.strokeStyle = INK; c.lineWidth = w + 6; c.stroke(); path(c); c.strokeStyle = color; c.lineWidth = w; c.stroke(); },
    shadow(c, x, y, rx) { c.fillStyle = 'rgba(15,60,70,0.28)'; P.ell(x, y, rx, rx * .26)(c); c.fill(); },
    post() {},
  },
  water: {
    name: 'Watercolor storybook',
    bg(c) {
      c.fillStyle = '#f4efe2'; c.fillRect(0, 0, W, H);
      const r = rng(7);
      c.save(); c.filter = 'blur(18px)';
      for (let i = 0; i < 26; i++) { c.fillStyle = rgba(i % 3 ? '#6fbfc4' : '#4aa3b3', .32); P.ell(r() * W, r() * H * .85, 90 + r() * 120, 60 + r() * 80, r() * 3)(c); c.fill(); }
      c.restore();
      c.save(); c.filter = 'blur(3px)'; c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 6;
      for (let i = 0; i < 9; i++) { c.beginPath(); const y = 40 + i * 50; c.moveTo(-10, y); c.bezierCurveTo(200, y - 20, 500, y + 25, 820, y - 10); c.stroke(); }
      c.restore();
    },
    sand(c, path) { c.save(); c.filter = 'blur(2px)'; for (let k = 0; k < 3; k++) { c.save(); c.translate(k * 2 - 2, k - 1); c.globalAlpha = .5; path(c); c.fillStyle = '#e6cf98'; c.fill(); c.restore(); } c.filter = 'none'; c.globalAlpha = .4; path(c); c.strokeStyle = '#b89a5c'; c.lineWidth = 2; c.stroke(); c.restore(); },
    shape(c, path, color, b, o = {}) {
      c.save();
      if (o.detail) { c.globalAlpha = .85; path(c); c.fillStyle = color; c.fill(); c.restore(); return; }
      const r = rng(Math.round(b.x * 7 + b.y * 13));
      c.filter = 'blur(1.4px)';
      for (let k = 0; k < 3; k++) { c.save(); c.translate((r() - .5) * 5, (r() - .5) * 5); c.globalAlpha = .45; path(c); c.fillStyle = color; c.fill(); c.restore(); }
      c.filter = 'blur(0.6px)'; c.globalAlpha = .55; path(c); c.strokeStyle = darken(color, .3); c.lineWidth = 2.5; c.stroke();
      c.filter = 'none'; c.globalAlpha = .45; c.translate(1.5, 1); path(c); c.strokeStyle = '#4a3d33'; c.lineWidth = 1.1; c.stroke();
      c.restore();
    },
    line(c, path, color, w) { c.save(); c.lineCap = 'round'; c.filter = 'blur(1px)'; c.globalAlpha = .7; path(c); c.strokeStyle = color; c.lineWidth = w; c.stroke(); c.globalAlpha = .35; path(c); c.strokeStyle = darken(color, .35); c.lineWidth = 1.5; c.stroke(); c.restore(); },
    shadow(c, x, y, rx) { c.save(); c.filter = 'blur(5px)'; c.fillStyle = 'rgba(60,90,100,0.22)'; P.ell(x, y, rx, rx * .28)(c); c.fill(); c.restore(); },
    post(c) {
      const r = rng(3), img = c.getImageData(0, 0, W, H), d = img.data;
      for (let i = 0; i < d.length; i += 4) { const n = (r() - .5) * 22; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
      c.putImageData(img, 0, 0);
    },
  },
  paper: {
    name: 'Cut-paper diorama',
    bg(c) {
      c.fillStyle = '#2f7f92'; c.fillRect(0, 0, W, H);
      const layers = ['#3a8fa1', '#47a0b0', '#55b0bd'];
      layers.forEach((col, i) => {
        c.save(); c.shadowColor = 'rgba(5,30,40,0.35)'; c.shadowBlur = 14; c.shadowOffsetY = 6;
        c.beginPath(); const y0 = 70 + i * 120; c.moveTo(0, y0);
        for (let x = 0; x <= W; x += 20) c.lineTo(x, y0 + Math.sin(x / 90 + i * 1.7) * 18 + Math.sin(x / 31 + i) * 4);
        c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fillStyle = col; c.fill(); c.restore();
      });
    },
    sand(c, path) { c.save(); c.shadowColor = 'rgba(5,30,40,0.4)'; c.shadowBlur = 14; c.shadowOffsetY = -2; path(c); c.fillStyle = '#ead6a0'; c.fill(); c.restore(); this.grain(c, path); },
    grain(c, path) {
      c.save(); path(c); c.clip(); const r = rng(11);
      c.strokeStyle = 'rgba(255,255,255,0.10)'; c.lineWidth = 1;
      for (let i = 0; i < 160; i++) { const x = r() * W, y = r() * H; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 14, y + (r() - .5) * 6); c.stroke(); }
      c.restore();
    },
    shape(c, path, color, b, o = {}) {
      c.save();
      if (!o.detail) { c.shadowColor = 'rgba(5,25,35,0.38)'; c.shadowBlur = 9; c.shadowOffsetX = 3; c.shadowOffsetY = 5; }
      path(c); c.fillStyle = color; c.fill(); c.restore();
      if (!o.detail) {
        c.save(); path(c); c.clip(); c.globalAlpha = .9;
        c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 3; c.translate(-1.5, -1.5); path(c); c.stroke();
        c.restore();
        this.grain(c, path);
      }
    },
    line(c, path, color, w) { c.save(); c.lineCap = 'round'; c.shadowColor = 'rgba(5,25,35,0.35)'; c.shadowBlur = 7; c.shadowOffsetX = 2; c.shadowOffsetY = 4; path(c); c.strokeStyle = color; c.lineWidth = w; c.stroke(); c.restore(); },
    shadow() {},
    post() {},
  },
  clay: {
    name: 'Soft clay 3D',
    bg(c) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2f98aa'); g.addColorStop(1, '#0f4558');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.save(); c.globalCompositeOperation = 'lighter'; const r = rng(5);
      for (let i = 0; i < 10; i++) { const x = r() * W, y = r() * H * .8, rr = 80 + r() * 90; const gg = c.createRadialGradient(x, y, 0, x, y, rr); gg.addColorStop(0, 'rgba(160,240,240,0.10)'); gg.addColorStop(1, 'rgba(160,240,240,0)'); c.fillStyle = gg; c.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
      c.restore();
    },
    sand(c, path) { const g = c.createLinearGradient(0, 460, 0, H); g.addColorStop(0, '#f1dfae'); g.addColorStop(1, '#c9ad6e'); path(c); c.fillStyle = g; c.fill(); },
    shape(c, path, color, b, o = {}) {
      if (o.detail) {
        path(c); c.fillStyle = color; c.fill();
        if (o.gloss) { c.save(); path(c); c.clip(); c.fillStyle = 'rgba(255,255,255,0.7)'; P.ell(b.x - b.r * .35, b.y - b.r * .4, b.r * .35, b.r * .22)(c); c.fill(); c.restore(); }
        return;
      }
      const g = c.createRadialGradient(b.x - b.r * .35, b.y - b.r * .45, b.r * .08, b.x, b.y, b.r * 1.2);
      g.addColorStop(0, lighten(color, .45)); g.addColorStop(.55, color); g.addColorStop(1, darken(color, .4));
      path(c); c.fillStyle = g; c.fill();
      c.save(); path(c); c.clip();
      c.filter = 'blur(5px)'; c.fillStyle = 'rgba(255,255,255,0.55)'; P.ell(b.x - b.r * .32, b.y - b.r * .5, b.r * .38, b.r * .2, -.4)(c); c.fill();
      c.filter = 'blur(6px)'; c.strokeStyle = rgba(lighten(color, .6), .5); c.lineWidth = 6; c.translate(2, 3); path(c); c.stroke();
      c.restore();
    },
    line(c, path, color, w) {
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
      c.shadowColor = 'rgba(0,20,30,0.35)'; c.shadowBlur = 8; c.shadowOffsetY = 4; path(c); c.strokeStyle = darken(color, .25); c.lineWidth = w; c.stroke();
      c.shadowColor = 'transparent'; c.translate(-1, -2); path(c); c.strokeStyle = color; c.lineWidth = w * .7; c.stroke();
      c.translate(-1, -1); path(c); c.strokeStyle = rgba(lighten(color, .6), .6); c.lineWidth = w * .22; c.stroke();
      c.restore();
    },
    shadow(c, x, y, rx) { c.save(); c.filter = 'blur(7px)'; c.fillStyle = 'rgba(0,15,25,0.5)'; P.ell(x, y, rx, rx * .3)(c); c.fill(); c.restore(); },
    post(c) { const g = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,10,20,0.35)'); c.fillStyle = g; c.fillRect(0, 0, W, H); },
  },
};

// ---------------- scene pieces ----------------
function rock(c, S, x, y, w, h) {
  S.shape(c, P.rrect(x + 4, y + 4, w - 8, h - 8, 18), '#6f9fa3', {x: x + w / 2, y: y + h / 2, r: Math.max(w, h) / 2});
  S.shape(c, P.ell(x + w * .35, y + h * .3, w * .18, h * .1), '#8cc79c', {x: x + w * .35, y: y + h * .3, r: w * .18}, {detail: true, noLine: true});
}
function coral(c, S, x, y, s = 80) {
  S.shape(c, P.rrect(x + 4, y + 4, s - 8, s - 8, 16), '#f07a83', {x: x + s / 2, y: y + s / 2, r: s / 2});
  c.save(); P.rrect(x + 4, y + 4, s - 8, s - 8, 16)(c); c.clip();
  c.strokeStyle = 'rgba(255,214,208,0.85)'; c.lineWidth = 4; c.lineCap = 'round';
  for (let i = 0; i < 3; i++) { c.beginPath(); for (let k = 0; k <= 10; k++) { const xx = x + 10 + k * 6, yy = y + 22 + i * 18 + Math.sin(k * 1.3 + i) * 4; k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); }
  c.restore();
}
function kelp(c, S, x, y, h) {
  S.line(c, cc => { cc.beginPath(); cc.moveTo(x, y); cc.bezierCurveTo(x - 25, y - h * .35, x + 25, y - h * .65, x + 4, y - h); }, '#4fa865', 12);
  S.line(c, cc => { cc.beginPath(); cc.moveTo(x + 18, y); cc.bezierCurveTo(x + 40, y - h * .3, x + 6, y - h * .55, x + 30, y - h * .82); }, '#6cbd73', 10);
}
function bubble(c, x, y, r) {
  c.save(); c.strokeStyle = 'rgba(235,252,255,0.85)'; c.lineWidth = 2.5; P.circle(x, y, r)(c); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.9)'; P.circle(x - r * .35, y - r * .35, r * .25)(c); c.fill(); c.restore();
}
function pearl(c, S, x, y) {
  S.shape(c, P.ell(x, y + 10, 22, 9), '#d87aa8', {x, y: y + 10, r: 22});
  S.shape(c, P.circle(x, y, 13), '#f2f0fb', {x, y, r: 13});
  c.fillStyle = '#ffffff'; P.circle(x - 4, y - 5, 4)(c); c.fill();
}
function krill(c, S, x, y) {
  S.line(c, cc => { cc.beginPath(); cc.arc(x, y + 8, 18, Math.PI * 1.05, Math.PI * 1.95); }, '#ff8c42', 11);
  c.fillStyle = INK; P.circle(x + 13, y - 1, 2.6)(c); c.fill();
}
function crab(c, S, x, y) {
  S.shadow(c, x, y + 30, 40);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) S.line(c, cc => { cc.beginPath(); cc.moveTo(x + s * 22, y + i * 7); cc.lineTo(x + s * 38, y + 6 + i * 7); cc.lineTo(x + s * 44, y + 20 + i * 6); }, '#c9473a', 5);
  for (const s of [-1, 1]) {
    S.line(c, cc => { cc.beginPath(); cc.moveTo(x + s * 18, y - 8); cc.lineTo(x + s * 30, y - 22); }, '#c9473a', 6);
    S.shape(c, P.circle(x + s * 34, y - 28, 11), '#f0604a', {x: x + s * 34, y: y - 28, r: 11});
  }
  S.shape(c, P.ell(x, y, 30, 21), '#f0604a', {x, y, r: 30});
  for (const s of [-1, 1]) {
    S.line(c, cc => { cc.beginPath(); cc.moveTo(x + s * 8, y - 14); cc.lineTo(x + s * 10, y - 26); }, '#c9473a', 4);
    S.shape(c, P.circle(x + s * 10, y - 29, 6), '#ffffff', {x: x + s * 10, y: y - 29, r: 6}, {detail: true});
    c.fillStyle = INK; P.circle(x + s * 10 - 2, y - 29, 3)(c); c.fill();
  }
}
function puffer(c, S, x, y, r, who, facing, mood) {
  const C = who === 'milli'
    ? {body: '#9fd3f2', belly: '#ffffff', spot: '#2f6fb4', fin: '#74b6e3'}
    : {body: '#f4bb3a', belly: '#fff4cc', spot: '#a8740f', fin: '#e9a92a'};
  S.shadow(c, x, y + r * 1.08, r * .85);
  c.save(); c.translate(x, y); if (facing < 0) c.scale(-1, 1);
  S.shape(c, P.poly([[-r * .8, 0], [-r - 28, -22], [-r - 18, 0], [-r - 28, 22]]), C.fin, {x: -r - 14, y: 0, r: 24});
  S.shape(c, P.poly([[-r * .15, -r * .95], [-r * .45, -r * 1.32], [-r * .66, -r * .74]]), C.fin, {x: -r * .4, y: -r, r: 20});
  S.shape(c, P.circle(0, 0, r), C.body, {x: 0, y: 0, r});
  S.shape(c, P.ell(r * .06, r * .45, r * .72, r * .38), C.belly, {x: r * .06, y: r * .45, r: r * .72}, {noLine: true});
  for (const [sx, sy, sr] of [[-.48, -.36, .1], [-.12, -.64, .075], [-.64, .04, .075], [.1, -.32, .055], [-.3, -.1, .05]])
    S.shape(c, P.circle(sx * r, sy * r, sr * r), C.spot, {x: sx * r, y: sy * r, r: sr * r}, {detail: true, noLine: true});
  S.shape(c, P.ell(-r * .42, r * .32, 13, 7, .5), C.fin, {x: -r * .42, y: r * .32, r: 13});
  const ex = r * .42, ey = -r * .22, er = r * .3;
  if (mood === 'happy') {
    c.save(); c.strokeStyle = INK; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(ex - er * .75, ey + 4); c.quadraticCurveTo(ex, ey - er * .95, ex + er * .75, ey + 4); c.stroke(); c.restore();
  } else {
    S.shape(c, P.circle(ex, ey, er), '#ffffff', {x: ex, y: ey, r: er}, {detail: true, gloss: true});
    c.fillStyle = INK; P.circle(ex + er * .22, ey + er * .06, er * .5)(c); c.fill();
    c.fillStyle = '#ffffff'; P.circle(ex + er * .35, ey - er * .2, er * .17)(c); c.fill();
  }
  if (who === 'milli') { c.save(); c.strokeStyle = '#1d4f86'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(ex - er * .2, ey - er); c.lineTo(ex + er * .55, ey - er * 1.45); c.stroke(); c.restore(); }
  c.fillStyle = 'rgba(255,143,163,0.75)'; P.ell(r * .5, r * .16, 12, 6)(c); c.fill();
  c.save(); c.strokeStyle = INK; c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(r * .9 - 14, r * .14 - 3); c.quadraticCurveTo(r * .9 - 6, r * .14 + 8, r * .9 + 2, r * .14 - 2); c.stroke(); c.restore();
  c.restore();
}

function scene(S) {
  const cv = createCanvas(W, H), c = cv.getContext('2d');
  S.bg(c);
  S.sand(c, cc => { cc.beginPath(); cc.moveTo(0, 470); for (let x = 0; x <= W; x += 20) cc.lineTo(x, 470 + Math.sin(x / 80) * 10 - Math.sin(x / 33) * 3); cc.lineTo(W, H); cc.lineTo(0, H); cc.closePath(); });
  for (const [x, y] of [[0, 0], [80, 0], [0, 80], [720, 0], [640, 0], [720, 80]]) rock(c, S, x, y, 80, 80);
  rock(c, S, 0, 400, 80, 80); rock(c, S, 720, 400, 80, 80);
  kelp(c, S, 108, 500, 170); kelp(c, S, 690, 500, 140);
  for (const y of [160, 240, 320]) coral(c, S, 500, y);
  crab(c, S, 640, 330);
  krill(c, S, 220, 150); pearl(c, S, 300, 430); pearl(c, S, 650, 190);
  puffer(c, S, 250, 300, 62, 'killi', 1, 'open');
  puffer(c, S, 405, 300, 58, 'milli', -1, 'happy');
  bubble(c, 330, 200, 9); bubble(c, 344, 170, 6); bubble(c, 336, 146, 4); bubble(c, 590, 120, 7); bubble(c, 160, 90, 6);
  S.post(c);
  return cv;
}

const out = {};
for (const [k, S] of Object.entries(STYLES)) {
  const cv = scene(S);
  fs.writeFileSync(`${require('path').join(__dirname, 'out')}/style-${k}.png`, cv.toBuffer('image/png'));
  out[k] = cv;
}
// comparison sheet
const pad = 24, lab = 46, sw = W / 2, sh = H / 2;
const sheet = createCanvas(pad * 3 + sw * 2, pad * 3 + (sh + lab) * 2), s = sheet.getContext('2d');
s.fillStyle = '#fdf8ec'; s.fillRect(0, 0, sheet.width, sheet.height);
Object.entries(STYLES).forEach(([k, S], i) => {
  const x = pad + (i % 2) * (sw + pad), y = pad + Math.floor(i / 2) * (sh + lab + pad);
  s.fillStyle = INK; s.font = 'bold 22px sans-serif'; s.fillText(`${i + 1}. ${S.name}`, x, y + 28);
  s.drawImage(out[k], x, y + lab, sw, sh);
});
fs.writeFileSync(require('path').join(__dirname, 'out', 'style-comparison.png'), sheet.toBuffer('image/png'));
console.log('done');
