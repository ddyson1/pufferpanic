// Builds the zip a web portal takes: index.html with that portal's SDK script tag at the marked comment, without
// the service worker registration (portals host the files themselves), plus the icons. Usage: node tools/portal.js poki|crazygames
const fs = require('fs'); const path = require('path'); const {execFileSync} = require('child_process');
const ROOT = path.join(__dirname, '..'), which = process.argv[2];
const SDK = {
  poki: '<script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js"></script>',
  crazygames: '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>',
};
if (!SDK[which]) { console.error('usage: node tools/portal.js poki|crazygames'); process.exit(1); }
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const marker = '<!-- Ad portals: load the portal\'s SDK here when submitting (see the Ads adapter below). Nothing is loaded otherwise. -->';
if (!html.includes(marker)) throw new Error('SDK marker comment not found in index.html');
html = html.replace(marker, marker + '\n' + SDK[which]);
const sw = "if ('serviceWorker' in navigator && location.protocol === 'https:') { try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {} }";
if (!html.includes(sw)) throw new Error('service worker registration not found');
html = html.replace(sw, '// service worker left out of the portal build');
html = html.replace('<link rel="manifest" href="manifest.webmanifest">', '');
const out = path.join(ROOT, 'dist', which);
fs.rmSync(out, {recursive: true, force: true}); fs.mkdirSync(out, {recursive: true});
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.cpSync(path.join(ROOT, 'icons'), path.join(out, 'icons'), {recursive: true});
const zip = path.join(ROOT, 'dist', `killi-and-milli-${which}.zip`);
fs.rmSync(zip, {force: true});
execFileSync('zip', ['-qr', zip, 'index.html', 'icons'], {cwd: out});
const ext = [...html.matchAll(/https?:\/\/[^"' )<]+/g)].map(m => m[0]).filter(u => !u.includes('poki.com') && !u.includes('crazygames.com'));
console.log('built', zip, (fs.statSync(zip).size / 1024).toFixed(0) + ' KB;', 'other external urls in the page:', ext.length ? ext.join(' ') : 'none');
