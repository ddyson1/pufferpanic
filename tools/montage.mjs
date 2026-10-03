// Gameplay montage, recorded from the real game in headless Chromium: short scripted moments (coral, puffing, a
// jellyfish sting, kelp, currents, vents, both bosses, co-op, the fish card) with captions, cut together with the
// reef music rendered offline by tools/trailermusic.cjs. Needs Playwright with its Chromium and ffmpeg on the PATH,
// and the game served at http://localhost:5173 (npm run serve). Writes marketing/gameplay.mp4 (1440x1080 at 30 fps, the frames cropped to the board) and
// marketing/gameplay.gif (a short loop for the store page). Frames are deterministic: the game's
// requestAnimationFrame loop is stepped by hand at exactly 30 fps and the moments are set up with the same hooks
// the tests use.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import {execFileSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'tests', 'out', 'montage');
fs.rmSync(OUT, {recursive: true, force: true}); fs.mkdirSync(OUT, {recursive: true});
const FPS = 30, W = 1280, H = 720, SCALE = 1.5; // 1920x1080 frames

const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: W, height: H}, deviceScaleFactor: SCALE, colorScheme: 'dark'});
const p = await ctx.newPage();
// the frame loop is driven by hand: requestAnimationFrame callbacks are queued and run once per recorded frame
await p.addInitScript(() => { window.__raf = []; window.__now = 1000; window.requestAnimationFrame = cb => { window.__raf.push(cb); return 0; }; window.__step = ms => { window.__now += ms; const cbs = window.__raf.splice(0); for (const cb of cbs) cb(window.__now); }; });
// a save with everything cleared, so the fish card has its outfits to show
await p.addInitScript(() => {
  const best = {}, stars = {}; for (let i = 0; i < 18; i++) { best['1-' + i] = 1; stars['1-' + i] = 3; }
  localStorage.setItem('puffer-panic-v2', JSON.stringify({unlocked: 18, best, stars, seenIntro: true, seenStory: {bruiser: true, queen: true}, muted: true, music: false, stats: {snacks: 600}}));
});
await p.goto('http://localhost:5173/', {waitUntil: 'load'});
await p.waitForTimeout(600); await p.evaluate(() => { for (let i = 0; i < 10; i++) window.__step(16); });
await p.evaluate(() => {
  const G = window.__pp; G.endStory && G.endStory();
  const st = document.createElement('style'); st.textContent = `
    @font-face{font-family:Grandstander;font-weight:900;src:url(tools/fonts/grandstander-latin-900-normal.woff2)}@font-face{font-family:Grandstander;font-weight:800;src:url(tools/fonts/grandstander-latin-800-normal.woff2)}
    .trcap{position:absolute;left:0;right:0;bottom:5%;z-index:40;text-align:center;pointer-events:none;opacity:0;font:900 42px Grandstander,system-ui,sans-serif;color:#f6c445;
      text-shadow:0 3px 0 #a5640f,0 0 2px #05303d,0 0 12px rgba(5,48,61,.9),0 8px 24px rgba(0,0,0,.45);letter-spacing:.01em}
    .trcard{position:fixed;inset:0;background:#07222b;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:50}
    .trcard img{width:min(88vw,calc(88vh * 1.26));border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.6)}
    .trcard p{position:absolute;left:0;right:0;bottom:5%;margin:0;text-align:center;font:800 34px Grandstander,system-ui,sans-serif;color:#e6f6f5;text-shadow:0 2px 10px rgba(0,0,0,.6)}`;
  document.head.appendChild(st);
  const cap = document.createElement('div'); cap.className = 'trcap'; cap.id = 'trcap'; document.getElementById('stage').appendChild(cap);
  const card = document.createElement('div'); card.className = 'trcard'; card.id = 'trcard'; card.innerHTML = '<img src="marketing/cover-1260x1000.png"><p id="trline"></p>'; document.body.appendChild(card);
  const names = {'1,0': 'right', '-1,0': 'left', '0,1': 'down', '0,-1': 'up'};
  const release = pl => { for (const d of ['up', 'down', 'left', 'right']) G.releaseDir(pl.id, d); };
  // the bot: head for the nearest snack, puff when something gets close, wall off hunters that line up
  window.__bot = (opts = {}) => {
    const S = G.S; if (!S || G.mode !== 'play') return;
    for (const pl of S.players) {
      if (pl.dead || (opts.still && opts.still.includes(pl.id))) continue;
      let near = 9, nearE = null;
      for (const e of S.enemies) { const d = Math.hypot(e.fx - pl.fx, e.fy - pl.fy); if (d < near && !(e.kind === 'Y' && e.state === 'buried') && e.stun <= 0) { near = d; nearE = e; } }
      if (!opts.noPuff && near < 1.5 && pl.puffCd <= 0 && pl.puff <= 0) { pl.bufPuff = true; continue; }
      if (nearE && near < 2.2 && pl.puff <= 0) {
        const dx = pl.fx - nearE.fx, dy = pl.fy - nearE.fy, away = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        release(pl); G.pressDir(pl.id, away); continue;
      }
      if (!opts.noCoral && nearE && near < 3.2 && near > 1.6 && Math.random() < .08) {
        const dx = Math.sign(Math.round(nearE.fx - pl.fx)), dy = Math.sign(Math.round(nearE.fy - pl.fy));
        if ((dx && !dy) || (dy && !dx)) { pl.face = {x: dx || 0, y: dy || 0}; pl.bufAct = true; }
      }
      if (!pl.moving && Math.random() < .5) {
        const s = S.snacks.length ? G.bfsStep(pl, false, S.snacks) : null;
        release(pl);
        if (s) G.pressDir(pl.id, names[s.x + ',' + s.y]);
        else G.pressDir(pl.id, ['up', 'down', 'left', 'right'][Math.random() * 4 | 0]);
      }
    }
  };
  // placing things by hand
  window.__tp = (a, x, y) => { a.x = a.tx = x; a.y = a.ty = y; a.fx = x; a.fy = y; a.moving = false; if (a.trail) a.trail = a.trail.map((_, i) => ({x: x - a.dir.x * i * .14, y: y - a.dir.y * i * .14})); };
  window.__release = release;
  window.__find = (ch) => { const S = G.S, out = []; for (let y = 0; y < S.floor.length; y++) for (let x = 0; x < S.floor[y].length; x++) if (S.floor[y][x] === ch && S.grid[y][x] === '.') out.push([x, y]); return out; };
});
let n = 0;
let botOpts = {};
const shot = async () => { await p.screenshot({path: path.join(OUT, `f${String(n++).padStart(5, '0')}.png`)}); };
const frames = async (count, fn) => { for (let i = 0; i < count; i++) { if (fn) await fn(i, count); await p.evaluate(([ms, o]) => { if (window.__pp.mode === 'fail') window.__pp.continueLevel(); window.__bot(o); window.__step(ms); }, [1000 / FPS, botOpts]); await shot(); } };
const fade = (i, count, inF = 10, outF = 10) => Math.min(1, i / inF, (count - 1 - i) / outF);
const setCap = async (o) => p.evaluate(o => { document.getElementById('trcap').style.opacity = o; }, o);
const caption = async (text) => p.evaluate(t => { document.getElementById('trcap').textContent = t; }, text);
const setCard = async (o, line) => p.evaluate(([o, line]) => { const c = document.getElementById('trcard'); c.style.opacity = o; document.getElementById('trline').textContent = line; }, [o, line]);
const play = async (lv, two) => { await p.evaluate(([lv, two]) => { const G = window.__pp; G.setTwoP(two); G.loadLevel(lv); G.setMode('play'); G.S.readyT = .2; for (let i = 0; i < 8; i++) window.__step(33); }, [lv, two]); };
const clip = async (text, secs, opts, setup, actions) => { botOpts = opts || {}; if (setup) await p.evaluate(setup); await caption(text); await frames(Math.round(FPS * secs), async (i, c) => { await setCap(fade(i, c)); if (actions && actions[i]) await p.evaluate(actions[i]); }); };
const ev = (fn) => p.evaluate(fn);

// 1. title card
await frames(FPS * 2.2, async (i, c) => setCard(fade(i, c, 8, 12), ''));
await setCard(0, '');

// 2. coral: The Shallows, a crab walks the row, the fish walls it off
await play(0, false);
await clip('Grow coral to wall them off', 4.5, {noPuff: true, noCoral: true, still: [0]}, () => {
  const G = window.__pp, S = G.S, pl = S.players[0]; window.__tp(pl, 7, 6); pl.face = {x: 1, y: 0};
  const crab = S.enemies.find(e => e.kind === 'C'); if (crab) { window.__tp(crab, 12, 6); crab.dir = {x: -1, y: 0}; crab.stun = 0; }
  for (const e of S.enemies) if (e !== crab) e.stun = 99;
}, {30: () => { const pl = window.__pp.S.players[0]; pl.face = {x: 1, y: 0}; pl.bufAct = true; }, 75: () => { const pl = window.__pp.S.players[0]; pl.face = {x: 0, y: -1}; pl.bufAct = true; }});

// 3. puff: Eel Reef, the eel closes in, the fish puffs and stuns it
await play(3, false);
await clip('Puff up when they get close', 4.5, {noCoral: true, still: [0]}, () => {
  const G = window.__pp, S = G.S, pl = S.players[0]; window.__tp(pl, 7, 6); pl.face = {x: 1, y: 0}; pl.puffCd = 0;
  const eel = S.enemies.find(e => e.kind === 'E'); if (eel) { window.__tp(eel, 11, 6); eel.dir = {x: -1, y: 0}; eel.stun = 0; }
  for (const e of S.enemies) if (e !== eel) e.stun = 99;
});

// 4. jellyfish: Kelp Forest, one drifts over the coral and stings
await play(1, false);
await clip('Mind the jellyfish', 3.0, {noPuff: true, noCoral: true, still: [0]}, () => {
  const G = window.__pp, S = G.S, pl = S.players[0]; window.__tp(pl, 7, 6); pl.face = {x: 1, y: 0}; pl.puffCd = 9;
  const js = S.enemies.filter(e => e.kind === 'J'); js.forEach((j, i) => { window.__tp(j, 10 + i * 2, 6); j.dir = {x: -1, y: 0}; j.stun = 0; j.t = 9; });
  for (const e of S.enemies) if (e.kind !== 'J') e.stun = 99;
});
await ev(() => { const G = window.__pp; if (G.mode === 'fail') G.continueLevel(); });

// 5. kelp: Kelp Maze, the fish ducks into the kelp and the eel loses it
await play(14, false);
await clip('Hide in the kelp', 4, {noPuff: true, noCoral: true, still: [0]}, () => {
  const G = window.__pp, S = G.S, pl = S.players[0]; const ks = window.__find('k'); const k = ks[Math.floor(ks.length / 2)] || [7, 6];
  window.__tp(pl, k[0], k[1]); pl.puffCd = 9;
  // the eel starts a few tiles away on another row, so it is hunting but cannot see into the kelp
  const eel = S.enemies.find(e => e.kind === 'E'); if (eel) { const spots = window.__find('').filter(([x, y]) => Math.abs(x - k[0]) + Math.abs(y - k[1]) >= 4 && Math.abs(x - k[0]) + Math.abs(y - k[1]) <= 6 && y !== k[1] && x !== k[0]); const sp = spots[Math.floor(spots.length / 2)] || [Math.min(13, k[0] + 4), k[1] + 2]; window.__tp(eel, sp[0], sp[1]); eel.dir = {x: Math.sign(k[0] - sp[0]) || 1, y: 0}; eel.stun = 0; }
  for (const e of S.enemies) if (e !== eel) e.stun = 99;
});

// 6. currents: Current Canyon, let go and the current carries you
await play(7, false);
await clip('Ride the currents', 4.5, {noPuff: true, noCoral: true, still: [0]}, () => {
  const G = window.__pp, S = G.S, pl = S.players[0]; const rs = window.__find('R'); const r = rs[0] || [4, 1];
  window.__tp(pl, r[0], r[1]); window.__release(pl); pl.face = {x: 1, y: 0};
  for (const e of S.enemies) e.stun = 99;
});

// 7. vents: Vent Field, an eel on a vent when it erupts
await play(4, false);
await clip('Vents erupt', 3.5, {noPuff: true, noCoral: true, still: [0]}, () => {
  const G = window.__pp, S = G.S, pl = S.players[0]; const vs = window.__find('h'); const v = vs[Math.floor(vs.length / 2)] || [5, 5];
  // the fish watches from two tiles away on open floor
  const open = window.__find('').filter(([x, y]) => Math.abs(x - v[0]) + Math.abs(y - v[1]) === 2 && y === v[1]); const o = open[0] || [v[0] - 2, v[1]]; window.__tp(pl, o[0], o[1]); pl.face = {x: Math.sign(v[0] - o[0]) || 1, y: 0};
  const eel = S.enemies.find(e => e.kind === 'E'); if (eel) { window.__tp(eel, v[0], v[1]); eel.stun = 0; }
  for (const e of S.enemies) if (e !== eel) e.stun = 99;
  S.ventT = 4.5 - 1.3; // erupts in 1.3 s
  window.__eel = eel;
});

// 8. bosses
await play(12, true);
await clip('Bruiser charges', 5, {}, () => { const G = window.__pp; G.S.players.forEach((pl, i) => window.__tp(pl, 6 + i * 3, 9)); });
await play(17, true);
await clip('The Kraken Queen', 5, {}, null);

// 9. co-op
await play(5, true);
await clip('Two players, one keyboard', 4.5, {}, null);

// 10. the fish card: cycle a few outfits
await ev(() => { const G = window.__pp; G.setMode('menu'); G.setTwoP(false); G.showFish(); for (let i = 0; i < 6; i++) window.__step(33); });
botOpts = {};
await caption('Dress up your fish');
const picks = ['[data-fcolor="coral"]', '[data-fpattern="stripes"]', '[data-facc="bow"]', '[data-fcolor="mint"]', '[data-facc="glasses"]', '[data-fcolor="lavender"]', '[data-fpattern="freckles"]', '[data-facc="cap"]', '[data-fcolor="tangerine"]', '[data-facc="crown"]'];
let pi = 0;
await frames(Math.round(FPS * 5.5), async (i, c) => { await setCap(fade(i, c)); if (i > 10 && (i - 10) % 14 === 0 && pi < picks.length) { const sel = picks[pi++]; const el = await p.$(sel); if (el) await el.click(); } });
await ev(() => { const G = window.__pp; const d = document.querySelector('[data-act="fishreset"]'); if (d) d.click(); });

// 11. end card
await frames(Math.round(FPS * 3.2), async (i, c) => setCard(Math.min(1, i / 10), 'Free in your browser. Killi and Milli.'));
await b.close();

// music: the reef track rendered offline with the game's own synth
const wav = path.join(OUT, 'music.wav');
execFileSync('node', [path.join(ROOT, 'tools', 'trailermusic.cjs'), wav, String(n / FPS)], {stdio: 'inherit'});
const mp4 = path.join(ROOT, 'marketing', 'gameplay.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(OUT, 'f%05d.png'), '-i', wav, '-vf', 'crop=1440:1080', '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-af', 'afade=t=out:st=' + (n / FPS - 2).toFixed(1) + ':d=2', '-shortest', '-movflags', '+faststart', mp4]);
const gif = path.join(ROOT, 'marketing', 'gameplay.gif');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-start_number', String(Math.round(FPS * 2.2) + 8), '-i', path.join(OUT, 'f%05d.png'), '-t', '9', '-vf', 'crop=1440:1080,fps=15,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4', gif]);
console.log('montage done', n, 'frames', (n / FPS).toFixed(1) + 's', (fs.statSync(mp4).size / 1e6).toFixed(1) + ' MB mp4', (fs.statSync(gif).size / 1e6).toFixed(1) + ' MB gif');
