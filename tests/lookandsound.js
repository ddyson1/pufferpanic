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
  w.addEventListener('error',e=>errs.push(e.message+' '+(e.error&&e.error.stack)));
  w.matchMedia=()=>({matches:false,addEventListener(){}}); w.innerHeight=900;
  Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 600}});
}});
const w=dom.window;
setTimeout(()=>{
  const G=w.__pp; G.openStyle();
  console.log('mode:',G.mode,'panel visible:',!w.document.querySelector('#stylePanel').hidden,
   'theme opts:',w.document.querySelectorAll('#optTheme .opt').length,'pack opts:',w.document.querySelectorAll('#optPack .opt').length,
   'track opts:',w.document.querySelectorAll('#optTrack .opt').length,'preview buttons:',w.document.querySelectorAll('#previews button').length);
  // swim with arrows in demo, nothing kills you
  G.pressDir(0,'left'); for(let k=0;k<60*6;k++) G.tick(1/60); G.releaseDir(0,'left');
  console.log('demo fish alive after 6s among enemies:',!G.S.players.some(p=>p.dead));
  // click previews through the real UI for each pack
  for(const id of Object.keys(G.packs)){ w.document.querySelector(`[data-pack="${id}"]`).click(); for(const b of w.document.querySelectorAll('#previews [data-pv]')) b.click(); }
  // themes via the UI, screenshot each
  for(const id of ['reef','twilight','lagoon']){ w.document.querySelector(`[data-theme="${id}"]`).click();
    w.document.querySelector('[data-pv="grow"]').click(); for(let k=0;k<30;k++) G.tick(1/60); G.draw();
    fs.writeFileSync(`${require('path').join(__dirname, 'out')}/theme_${id}.png`, w.document.querySelector('#c').__png()); }
  w.document.querySelector('[data-track="off"]').click(); w.document.querySelector('[data-track="deep"]').click();
  w.document.querySelector('#styleDone').click();
  console.log('after Done mode:',G.mode,'panel hidden:',w.document.querySelector('#stylePanel').hidden);
  console.log('errors:',errs.length?errs.slice(0,3):'none'); process.exit(0);
},400);
