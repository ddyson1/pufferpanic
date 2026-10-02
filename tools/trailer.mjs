// Gameplay trailer and extra store screenshots, recorded from the real game in headless Chromium.
// Needs Playwright (npm i -g playwright, with its Chromium) and ffmpeg on the PATH, and the game served at
// http://localhost:5173 (npm run serve). Writes marketing/trailer.mp4 (1080p30, with the reef music rendered
// offline), marketing/trailer.gif (a short loop for the itch.io page) and marketing/screenshots/07.. 10.
// Frames are deterministic: the game's requestAnimationFrame loop is stepped by hand at exactly 30 fps and a small
// bot plays with the same hooks the tests use.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import {execFileSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'tests', 'out', 'trailer');
if (!process.env.SHOTS_ONLY) fs.rmSync(OUT, {recursive: true, force: true}); fs.mkdirSync(OUT, {recursive: true});
const FPS = 30, W = 1280, H = 720, SCALE = 1.5; // 1920x1080 frames

const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: W, height: H}, deviceScaleFactor: SCALE, colorScheme: 'dark'});
const p = await ctx.newPage();
// the game's frame loop is driven by hand: requestAnimationFrame callbacks are queued and run once per recorded frame
await p.addInitScript(() => { window.__raf = []; window.__now = 1000; window.requestAnimationFrame = cb => { window.__raf.push(cb); return 0; }; window.__step = ms => { window.__now += ms; const cbs = window.__raf.splice(0); for (const cb of cbs) cb(window.__now); }; });
await p.addInitScript(() => { localStorage.setItem('puffer-panic-v2', JSON.stringify({unlocked: 18, best: {}, seenIntro: true, seenStory: {bruiser: true, queen: true}, muted: true, music: false, stats: {snacks: 600}})); });
await p.goto('http://localhost:5173/', {waitUntil: 'load'});
await p.waitForTimeout(600); await p.evaluate(() => { for (let i = 0; i < 10; i++) window.__step(16); });
await p.evaluate(() => {
  const G = window.__pp; G.endStory && G.endStory();
  // caption and card overlays, styled like the game's own banner
  const st = document.createElement('style'); st.textContent = `
    @font-face{font-family:Grandstander;font-weight:900;src:url(tools/fonts/grandstander-latin-900-normal.woff2)}@font-face{font-family:Grandstander;font-weight:800;src:url(tools/fonts/grandstander-latin-800-normal.woff2)}
    .trcap{position:absolute;left:0;right:0;bottom:6%;z-index:40;text-align:center;pointer-events:none;opacity:0;font:900 44px Grandstander,system-ui,sans-serif;color:#f6c445;
      -webkit-text-stroke:0;text-shadow:0 3px 0 #a5640f,0 0 2px #05303d,0 0 12px rgba(5,48,61,.9),0 8px 24px rgba(0,0,0,.45);letter-spacing:.01em}
    .trcard{position:fixed;inset:0;background:#07222b;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:50}
    .trcard img{width:min(84vw,calc(84vh * 1.26));border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.6)}
    .trcard p{position:absolute;left:0;right:0;bottom:6%;margin:0;text-align:center;font:800 34px Grandstander,system-ui,sans-serif;color:#e6f6f5;text-shadow:0 2px 10px rgba(0,0,0,.6)}`;
  document.head.appendChild(st);
  const cap = document.createElement('div'); cap.className = 'trcap'; cap.id = 'trcap'; document.getElementById('stage').appendChild(cap);
  const card = document.createElement('div'); card.className = 'trcard'; card.id = 'trcard'; card.innerHTML = '<img src="marketing/cover-1260x1000.png"><p id="trline"></p>'; document.body.appendChild(card);
  // the bot: head for the nearest snack, puff when something gets close, wall off hunters that line up
  window.__bot = () => {
    const S = G.S; if (!S || G.mode !== 'play') return;
    const names = {'1,0': 'right', '-1,0': 'left', '0,1': 'down', '0,-1': 'up'};
    for (const pl of S.players) {
      if (pl.dead) continue;
      let near = 9, nearE = null;
      for (const e of S.enemies) { const d = Math.hypot(e.fx - pl.fx, e.fy - pl.fy); if (d < near && !(e.kind === 'Y' && e.state === 'buried') && e.stun <= 0) { near = d; nearE = e; } }
      if (near < 1.5 && pl.puffCd <= 0 && pl.puff <= 0) { pl.bufPuff = true; continue; }
      if (nearE && near < 2.2 && pl.puff <= 0) { // on cooldown: swim away from it
        const dx = pl.fx - nearE.fx, dy = pl.fy - nearE.fy, away = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        for (const d of ['up', 'down', 'left', 'right']) G.releaseDir(pl.id, d); G.pressDir(pl.id, away); continue;
      }
      if (nearE && near < 3.2 && near > 1.6 && Math.random() < .08) {
        const dx = Math.sign(Math.round(nearE.fx - pl.fx)), dy = Math.sign(Math.round(nearE.fy - pl.fy));
        if ((dx && !dy) || (dy && !dx)) { pl.face = {x: dx || 0, y: dy || 0}; pl.bufAct = true; }
      }
      if (!pl.moving && Math.random() < .5) {
        const snacks = S.snacks;
        const s = snacks.length ? G.bfsStep(pl, false, snacks) : null;
        for (const d of ['up', 'down', 'left', 'right']) G.releaseDir(pl.id, d);
        if (s) G.pressDir(pl.id, names[s.x + ',' + s.y]);
        else G.pressDir(pl.id, ['up', 'down', 'left', 'right'][Math.random() * 4 | 0]);
      }
    }
  };
});
let n = 0;
const shot = async () => { await p.screenshot({path: path.join(OUT, `f${String(n++).padStart(5, '0')}.png`)}); };
const frames = async (count, fn) => { for (let i = 0; i < count; i++) { if (fn) await fn(i, count); await p.evaluate(ms => { if (window.__pp.mode === 'fail') window.__pp.continueLevel(); window.__bot(); window.__step(ms); }, 1000 / FPS); await shot(); } };
const caption = async (text) => p.evaluate(t => { const c = document.getElementById('trcap'); c.textContent = t; }, text);
const fade = (i, count, inF = 12, outF = 12) => Math.min(1, i / inF, (count - 1 - i) / outF);
const setCap = async (o) => p.evaluate(o => { document.getElementById('trcap').style.opacity = o; }, o);
const setCard = async (o, line) => p.evaluate(([o, line]) => { const c = document.getElementById('trcard'); c.style.opacity = o; document.getElementById('trline').textContent = line; }, [o, line]);
const play = async (lv, two) => { await p.evaluate(([lv, two]) => { const G = window.__pp; G.setTwoP(two); G.loadLevel(lv); G.setMode('play'); G.S.readyT = .3; }, [lv, two]); };

const shotsOnly = !!process.env.SHOTS_ONLY; // SHOTS_ONLY=1 skips the video and only retakes the store screenshots
if (!shotsOnly) {
// 1. title card
await frames(FPS * 2.6, async (i, c) => setCard(fade(i, c, 10, 14), ''));
await setCard(0, '');
// 2. reefs
const clips = [[0, true, 'Grow coral walls to trap the crabs', 6], [3, true, 'Puff up when they get close', 5.5], [7, false, 'Sixteen reefs, each with a new trick', 5], [14, true, 'Hide in the kelp, ride the currents', 5], [12, true, 'Two boss reefs', 5.5], [17, true, 'Play alone or with a friend on one keyboard', 6]];
for (const [lv, two, text, secs] of clips) {
  await play(lv, two); await caption(text);
  await frames(Math.round(FPS * secs), async (i, c) => setCap(fade(i, c, 10, 10)));
}
// 3. the fish card and the lab
await p.evaluate(() => { const G = window.__pp; G.setTwoP(false); G.showFish(); });
await caption('Dress up your fish');
await frames(FPS * 3, async (i, c) => setCap(fade(i, c, 8, 8)));
await p.evaluate(() => window.__pp.openStyle());
await caption('Four looks, four sound packs, calm music');
await frames(FPS * 3.2, async (i, c) => setCap(fade(i, c, 8, 8)));
await p.click('#styleDone'); await p.evaluate(() => window.__step(33));
// 4. end card
await frames(FPS * 3.4, async (i, c) => setCard(Math.min(1, i / 10), 'Free in your browser. Killi and Milli.'));
}
// extra store screenshots, taken from the same session at 2x
const shots = path.join(ROOT, 'marketing', 'screenshots');
const grab = async (name) => { await p.waitForTimeout(600); await p.evaluate(() => window.__step(33)); await p.screenshot({path: path.join(shots, name)}); };
await setCard(0, ''); await setCap(0);
await play(5, true); await frames(FPS * 3.5); await p.evaluate(() => { const S = window.__pp.S; S.players[0].bufPuff = true; }); await frames(6, null); await grab('07-two-players.png');
await play(12, true); await frames(FPS * 2.5); await grab('08-bruiser.png');
await p.evaluate(() => window.__pp.setMode('menu'));
await p.evaluate(() => { window.__pp.setTwoP(false); window.__pp.showFish(); for (let i = 0; i < 8; i++) window.__step(33); }); await grab('09-choose-your-fish.png');
await p.evaluate(() => { window.__pp.openStyle(); for (let i = 0; i < 8; i++) window.__step(33); }); await grab('10-look-and-sound.png');
await b.close();
if (shotsOnly) process.exit(0);

// music: the reef track rendered offline with the game's own synth
const wav = path.join(OUT, 'music.wav');
execFileSync('node', [path.join(ROOT, 'tools', 'trailermusic.cjs'), wav, String(n / FPS)], {stdio: 'inherit'});
const mp4 = path.join(ROOT, 'marketing', 'trailer.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(OUT, 'f%05d.png'), '-i', wav, '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-af', 'afade=t=out:st=' + (n / FPS - 2).toFixed(1) + ':d=2', '-shortest', '-movflags', '+faststart', mp4]);
// a short loop for the store page: the first reef clip, 640 px wide at 15 fps
const gif = path.join(ROOT, 'marketing', 'trailer.gif');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-start_number', String(Math.round(FPS * 2.6) + 10), '-i', path.join(OUT, 'f%05d.png'), '-t', '5.5', '-vf', 'fps=15,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4', gif]);
console.log('trailer done', n, 'frames', (fs.statSync(mp4).size / 1e6).toFixed(1) + ' MB mp4', (fs.statSync(gif).size / 1e6).toFixed(1) + ' MB gif');
