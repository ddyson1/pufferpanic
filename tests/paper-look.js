require('fs').mkdirSync(require('path').join(__dirname, 'out'), {recursive: true});
const {JSDOM}=require('jsdom');const fs=require('fs');const {createCanvas}=require('@napi-rs/canvas');
const html=fs.readFileSync(require('path').join(__dirname, '..', 'index.html'),'utf8');const errs=[];
const dom=new JSDOM(html,{url:'https://example.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  const P=w.HTMLCanvasElement.prototype; const B=new WeakMap();
  const back=el=>{let b=B.get(el); if(!b){b={cv:createCanvas(300,150)};B.set(el,b);} return b;};
  Object.defineProperty(P,'width',{get(){return back(this).cv.width},set(v){back(this).cv.width=Math.max(1,v|0)}});
  Object.defineProperty(P,'height',{get(){return back(this).cv.height},set(v){back(this).cv.height=Math.max(1,v|0)}});
  P.getContext=function(){const b=back(this); if(b.px) return b.px; const real=()=>b.cv.getContext('2d');
    b.px=new Proxy({}, {get(t,k){const r=real(); if(k==='drawImage') return (img,...a)=>r.drawImage(img instanceof w.HTMLCanvasElement?back(img).cv:img,...a);
      const v=r[k]; return typeof v==='function'?v.bind(r):v;}, set(t,k,v){real()[k]=v; return true;}}); return b.px;};
  P.__png=function(){return back(this).cv.toBuffer('image/png');};
  w.localStorage.setItem('puffer-panic-v2', JSON.stringify({unlocked:18,best:{},seenIntro:true,theme:'lagoon'}));
  w.addEventListener('error',e=>errs.push(e.message+' '+(e.error&&e.error.stack)));
  w.matchMedia=()=>({matches:false,addEventListener(){}}); w.innerHeight=900; w.devicePixelRatio=2;
  Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 780}});
}});
const w=dom.window,D=w.document;
setTimeout(()=>{
  const G=w.__pp; const shot=n=>{G.draw(); fs.writeFileSync(require('path').join(__dirname, 'out', 'p_'+n+'.png'), D.querySelector('#c').__png());};
  const saved=JSON.parse(w.localStorage.getItem('puffer-panic-v2'));
  console.log('existing player with a saved look switched to Cut paper once:', saved.theme, saved.paperDefault);
  G.setTwoP(true);
  for(const [L,n] of [[0,'shallows'],[14,'kelp'],[16,'lion'],[17,'queen']]){ G.loadLevel(L); G.tick(2.2); for(let k=0;k<60*2;k++) G.tick(1/60); if(L===17){ const B=G.S.boss; B.spawnT=0; G.tick(.02); for(let k=0;k<70;k++) G.tick(1/60);} shot(n); }
  // timing: paper vs reef, same scene
  G.loadLevel(16); G.tick(2.2); for(let k=0;k<60;k++) G.tick(1/60);
  const time=()=>{const t0=process.hrtime.bigint(); for(let i=0;i<40;i++) G.draw(); return Number(process.hrtime.bigint()-t0)/1e6/40;};
  const paperMs=time(); G.setTheme('reef'); const reefMs=time(); G.setTheme('paper');
  console.log(`avg frame draw at 2x resolution: cut paper ${paperMs.toFixed(1)} ms, reef ${reefMs.toFixed(1)} ms`);
  G.playStory('intro',()=>{}); for(let k=0;k<30;k++) G.tick(1/30); shot('story'); G.endStory();
  console.log('errors:',errs.length?errs.slice(0,3):'none'); process.exit(0);
},400);
