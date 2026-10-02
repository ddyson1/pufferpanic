// Renders the reef music track offline with the game's own synth, for the trailer. Usage: node tools/trailermusic.cjs out.wav seconds
const {JSDOM} = require('jsdom'); const fs = require('fs'); const path = require('path'); const WA = require('node-web-audio-api');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const out = process.argv[2], secs = Math.ceil(+process.argv[3] || 40), SR = 44100;
const dom = new JSDOM(html, {runScripts: 'dangerously', pretendToBeVisual: true, beforeParse(w) {
  w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {get: (t, k) => k.startsWith('create') ? () => ({addColorStop() {}}) : (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; }});
}});
setTimeout(async () => {
  const G = dom.window.__pp;
  const c = new WA.OfflineAudioContext(2, SR * secs, SR);
  G.setMode('play'); G.audioTest(c, secs); G.applyTrack && G.applyTrack('reef'); G.scheduleMusic();
  const b = await c.startRendering();
  const L = b.getChannelData(0), R = b.getChannelData(1), N = L.length, buf = Buffer.alloc(44 + N * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  const g = 1.6; // the track sits well under the effects in the game; lift it a little for the video
  for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * g * 32767))), 44 + i * 4); buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[i] * g * 32767))), 46 + i * 4); }
  fs.writeFileSync(out, buf); let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i])); console.log('music', secs + 's', 'peak', (pk * g).toFixed(2));
  process.exit(0);
}, 400);
