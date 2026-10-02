require('fs').mkdirSync(require('path').join(__dirname, 'out'), {recursive: true});
const {JSDOM}=require('jsdom');const fs=require('fs');const WA=require('node-web-audio-api');
const html=fs.readFileSync(require('path').join(__dirname, '..', 'index.html'),'utf8');
const errs=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({}, {get:(t,k)=>k.startsWith('create')?()=>({addColorStop(){}}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
  w.addEventListener('error',e=>errs.push(e.message));
}});
const w=dom.window;
const stats=(b)=>{const l=b.getChannelData(0),r=b.getChannelData(1);let pk=0,L=0,R=0,first=-1,lastI=0;
  for(let i=0;i<l.length;i++){const a=Math.max(Math.abs(l[i]),Math.abs(r[i]));if(a>pk)pk=a;if(a>.03){L+=l[i]*l[i];R+=r[i]*r[i];if(first<0)first=i;lastI=i;}}
  return {peak:pk.toFixed(2),audibleSec:((lastI-first)/44100).toFixed(2),pan:((R-L)/(R+L+1e-12)).toFixed(2)};};
const statsOld=b=>{let pk=0,ss=0,n=0,L=0,R=0,first=-1,lastI=0;const l=b.getChannelData(0),r=b.getChannelData(1);
  for(let i=0;i<l.length;i++){const a=Math.max(Math.abs(l[i]),Math.abs(r[i]));if(a>pk)pk=a;ss+=l[i]*l[i]+r[i]*r[i];L+=l[i]*l[i];R+=r[i]*r[i];if(a>.002){if(first<0)first=i;lastI=i;}}
  return {peak:pk.toFixed(2),rmsDb:(10*Math.log10(ss/(2*l.length)+1e-12)).toFixed(1),len:((lastI-first)/44100).toFixed(2),pan:((R-L)/(R+L+1e-12)).toFixed(2)};};
setTimeout(async()=>{
  const G=w.__pp;
  const names=['grow','break','bonk','get','wave','puff','stun','die','win','charge','thud','punch','blink','revive','click'];
  const rows=[];
  for(const n of names){
    const c=new WA.OfflineAudioContext(2,44100*2.5,44100); G.setMode('paused');
    G.audioTest(c,.0001); // music bus starts at 0 gain; tiny lookahead
    G.sfx(n,{x:n==='bonk'?0:n==='blink'?14:7,p:0,n:5});
    const b=await c.startRendering(); rows.push([n,stats(b)]);
  }
  // amb only baseline
  {const c=new WA.OfflineAudioContext(2,44100*2,44100); G.setMode('paused'); G.audioTest(c,.0001); const b=await c.startRendering(); rows.push(['ambient bed',stats(b)]);}
  // music 10s
  {const c=new WA.OfflineAudioContext(2,44100*10,44100); G.setMode('play'); G.audioTest(c,10); G.scheduleMusic(); const b=await c.startRendering(); rows.push(['music 10s',stats(b)]);
   // check it is not one long drone: energy per 0.15s step varies
   const l=b.getChannelData(0); let onsets=0, prev=0; for(let i=0;i<l.length;i+=6615){let e=0;for(let j=i;j<i+6615&&j<l.length;j++)e+=l[j]*l[j]; if(e>prev*1.6&&e>1e-4)onsets++; prev=e;} rows.push(['music note onsets',{count:onsets}]);}
  // combo climb: frequency rises across quick pickups
  {const freqs=[]; for(let k=0;k<5;k++){const c=new WA.OfflineAudioContext(1,8820,44100); G.setMode('paused'); G.audioTest(c,.0001); G.tick(.1); G.sfx('get',{x:7}); const b=await c.startRendering(); const d=b.getChannelData(0); let z=0; for(let i=200;i<1500;i++) if(d[i-1]<0&&d[i]>=0) z++; freqs.push(Math.round(z/(1300/44100)));}
   rows.push(['pickup combo pitch (Hz approx)',freqs.join(' -> ')]);}
  // Milli higher than Killi
  {const f=[];for(const pid of [0,1]){const c=new WA.OfflineAudioContext(1,8820,44100); G.audioTest(c,.0001); G.tick(2); G.setMode('paused'); G.sfx('die',{x:7,p:pid}); const b=await c.startRendering(); const d=b.getChannelData(0); let z=0; for(let i=100;i<4400;i++) if(d[i-1]<0&&d[i]>=0) z++; f.push(z);} rows.push(['death wobble crossings Killi vs Milli',f.join(' vs ')]);}
  for(const [n,s] of rows) console.log(n.padEnd(34),JSON.stringify(s));
  console.log('errors:',errs.length?errs:'none'); process.exit(0);
},300);
