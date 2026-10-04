// Assembles one submission folder and zip for a portal: the portal build, the covers, the screenshots, the video and
// the filled-in form text from marketing/portals/<portal>-submission.md. Usage: node tools/portalbundle.js crazygames|poki
const fs = require('fs'); const path = require('path'); const {execFileSync} = require('child_process');
const ROOT = path.join(__dirname, '..'), which = process.argv[2];
if (!['crazygames', 'poki'].includes(which)) { console.error('usage: node tools/portalbundle.js crazygames|poki'); process.exit(1); }
execFileSync('node', [path.join(ROOT, 'tools', 'portal.js'), which], {stdio: 'inherit'});
const B = path.join(ROOT, 'dist', `${which}-submission`), P = path.join(ROOT, 'marketing', 'portals');
fs.rmSync(B, {recursive: true, force: true}); fs.mkdirSync(path.join(B, 'covers'), {recursive: true}); fs.mkdirSync(path.join(B, 'screenshots')); if (which === 'poki') fs.mkdirSync(path.join(B, 'thumbnails'));
fs.copyFileSync(path.join(ROOT, 'dist', `killi-and-milli-${which}.zip`), path.join(B, `killi-and-milli-${which}.zip`));
for (const f of fs.readdirSync(P)) { if (f.startsWith('cover-') || f.startsWith('icon-') || (f.startsWith(which + '-') && f.endsWith('.png'))) fs.copyFileSync(path.join(P, f), path.join(B, which === 'poki' && f.startsWith('poki-') ? 'thumbnails' : 'covers', f)); if (f.startsWith(which + '-') && f.endsWith('.mp4')) fs.copyFileSync(path.join(P, f), path.join(B, f)); if (f.startsWith('shot-')) fs.copyFileSync(path.join(P, f), path.join(B, 'screenshots', f)); }
fs.copyFileSync(path.join(ROOT, 'marketing', 'gameplay.mp4'), path.join(B, 'gameplay-video.mp4'));
const form = path.join(P, `${which}-submission.md`);
if (fs.existsSync(form)) fs.copyFileSync(form, path.join(B, 'SUBMISSION.md')); else console.warn('no form text at', form);
const zip = path.join(ROOT, 'dist', `${which}-submission.zip`); fs.rmSync(zip, {force: true});
execFileSync('zip', ['-qr', zip, `${which}-submission`], {cwd: path.join(ROOT, 'dist')});
console.log('bundle', zip, (fs.statSync(zip).size / 1e6).toFixed(1) + ' MB');
