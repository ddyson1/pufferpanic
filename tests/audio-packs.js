require('fs').mkdirSync(require('path').join(__dirname, 'out'), {recursive: true});
const {JSDOM}=require('jsdom');const fs=require('fs');const WA=require('node-web-audio-api');
const html=fs.readFileSync(require('path').join(__dirname, '..', 'index.html'),'utf8');const errs=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({}, {get:(t,k)=>k.startsWith('create')?()=>({addColorStop(){}}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
  w.addEventListener('error',e=>errs.push(e.message));}});
const w=dom.window;
const peak=b=>{let pk=0;for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++){const a=Math.abs(d[i]);if(a>pk)pk=a;}}return pk;};
setTimeout(async()=>{
  const G=w.__pp; const names=['grow','break','bonk','get','wave','puff','stun','die','win','charge','thud','punch','blink','revive','click'];
  console.log('effect'.padEnd(9),...Object.keys(G.packs).map(p=>p.padEnd(9)));
  const quiet=[];
  for(const n of names){ const row=[n.padEnd(9)];
    for(const pk of Object.keys(G.packs)){ G.applyPack(pk); const c=new WA.OfflineAudioContext(2,44100*2,44100); G.setMode('paused'); G.audioTest(c,.0001); G.sfx(n,{x:7,n:5}); const b=await c.startRendering(); const v=peak(b); if(v<.08) quiet.push(pk+'/'+n+' '+v.toFixed(2)); if(v>.98) quiet.push('CLIP '+pk+'/'+n); row.push(v.toFixed(2).padEnd(9)); }
    console.log(...row); }
  console.log('below 0.08 (ambient bed alone is ~0.04):',quiet.length?quiet:'none');
  for(const tr of Object.keys(G.tracks)){ G.applyTrack(tr); G.setMode('play'); const c=new WA.OfflineAudioContext(2,44100*12,44100); G.audioTest(c,12); G.scheduleMusic(); const b=await c.startRendering();
    const l=b.getChannelData(0); let on=0,prev=0; const win=4410; for(let i=0;i<l.length;i+=win){let e=0;for(let j=i;j<i+win&&j<l.length;j++)e+=l[j]*l[j]; if(e>prev*1.5&&e>2e-4)on++; prev=e;}
    console.log(`music ${tr.padEnd(7)} peak ${peak(b).toFixed(2)}  note onsets in 12s: ${on}`); }
  console.log('errors:',errs.length?errs:'none'); process.exit(0);
},300);
