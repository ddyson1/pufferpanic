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
  P.__cv=function(){return back(this).cv;};
  const best={},stars={}; for(let i=0;i<18;i++){best['1-'+i]=30;stars['1-'+i]=3;} w.localStorage.setItem('puffer-panic-v2', JSON.stringify({unlocked:18,best,stars,stats:{snacks:600},seenIntro:true}));
  w.addEventListener('error',e=>errs.push(e.message+' '+(e.error&&e.error.stack)));
  w.matchMedia=()=>({matches:false,addEventListener(){}}); w.innerHeight=900; w.devicePixelRatio=2;
  Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 780}});
}});
const w=dom.window,D=w.document; const $=q=>D.querySelector(q);
const frames=n=>new Promise(r=>{let k=0;const f=()=>{if(++k>=n)r();else w.requestAnimationFrame(f);};w.requestAnimationFrame(f);});
setTimeout(async()=>{
  const G=w.__pp; let ok=true; const chk=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m); if(!c) ok=false;};
  const saved=()=>JSON.parse(w.localStorage.getItem('puffer-panic-v2'));
  G.setTwoP(false); $('#bMenu').click(); await frames(2);
  chk(!!$('.fishrow canvas[data-who="killi"]'),'title screen shows your fish (Killi by default)');
  $('[data-act="fish"]').click(); await frames(2);
  chk(G.mode==='fish' && D.querySelectorAll('.pick').length===2,'fish screen offers Killi and Milli');
  $('[data-pick="milli"]').click(); await frames(2);
  chk(saved().pick==='milli' && $('[data-pick="milli"]').getAttribute('aria-pressed')==='true','choosing Milli is saved and highlighted');
  $('[data-fcolor="lavender"]').click(); $('[data-fpattern="stripes"]').click(); $('[data-facc="flower"]').click(); await frames(3);
  const m=saved().fish.milli; chk(m.color==='lavender'&&m.pattern==='stripes'&&m.acc==='flower','color, pattern and accessory are saved: '+JSON.stringify(m));
  const big=$('canvas.bigprev').__cv(); const px=big.getContext('2d').getImageData(0,0,big.width,big.height).data; let painted=0; for(let i=3;i<px.length;i+=4) if(px[i]>0) painted++;
  chk(painted>2000,'the live preview draws the fish ('+painted+' painted pixels)');
  fs.writeFileSync(require('path').join(__dirname, 'out', 'f_preview.png'), big.toBuffer('image/png'));
  $('[data-act="fishdone"]').click(); await frames(2);
  chk(G.mode==='menu' && $('.fishrow canvas[data-who="milli"]') && /Milli/.test($('.fishrow').textContent),'back on the title, Milli is shown as your fish');
  // play as Milli in 1P
  $('[data-lv="0"]').click(); G.tick(2.2); const p=G.S.players[0];
  chk(p.fish.name==='Milli' && p.fish.c2===('#bba3f0') && p.fish.acc==='flower' && p.fish.pattern==='stripes','1P game uses customized Milli');
  chk(/Milli/.test($('#hPlayers').textContent),'HUD names Milli');
  // reset
  $('#bMenu').click(); $('[data-act="fish"]').click(); $('[data-act="fishreset"]').click(); await frames(2);
  chk(!saved().fish.milli && $('[data-fcolor="sky"]').getAttribute('aria-pressed')==='true','reset restores Milli\'s default look');
  // 2P customize both
  $('[data-act="fishdone"]').click(); $('[data-mode="2"]').click(); await frames(2);
  chk(D.querySelectorAll('.fishrow canvas').length===2,'2P title shows both fish');
  $('[data-act="fish"]').click(); $('[data-edit="killi"]').click(); $('[data-fcolor="midnight"]').click(); $('[data-facc="cap"]').click();
  $('[data-edit="milli"]').click(); $('[data-fcolor="coral"]').click(); $('[data-facc="bow"]').click(); $('[data-fpattern="freckles"]').click();
  $('[data-act="fishdone"]').click(); $('[data-lv="0"]').click(); G.tick(2.2);
  const [k,mm]=G.S.players; chk(k.fish.c2==='#3e4f86'&&k.fish.acc==='cap'&&mm.fish.c2==='#ff8fa3'&&mm.fish.acc==='bow'&&mm.fish.pattern==='freckles','2P game uses both customized fish');
  chk(k.id===0 && mm.id===1,'controls still map Killi to player 1 and Milli to player 2');
  // gallery render of every option via the real draw code
  const cols=6, cell=180, rows=5; const sheet=createCanvas(cols*cell, rows*cell), sc=sheet.getContext('2d'); sc.fillStyle='#2f7f92'; sc.fillRect(0,0,sheet.width,sheet.height);
  const combos=[]; for(const c of Object.keys({sunny:1,sky:1,coral:1,mint:1,lavender:1,tangerine:1,midnight:1})) combos.push({color:c,pattern:'spots',acc:'none'});
  for(const pt of ['stripes','freckles','plain','hearts']) combos.push({color:'mint',pattern:pt,acc:'none'});
  for(const a of ['bow','flower','cap','glasses','star','fin','crown','pearls']) combos.push({color:'sunny',pattern:'spots',acc:a});
  combos.push({color:'gold',pattern:'spots',acc:'crown'},{color:'midnight',pattern:'stripes',acc:'glasses'},{color:'coral',pattern:'freckles',acc:'bow'},{color:'lavender',pattern:'plain',acc:'flower'},{color:'tangerine',pattern:'stripes',acc:'cap'},{color:'sky',pattern:'freckles',acc:'star'},{color:'sunny',pattern:'plain',acc:'glasses'},{color:'mint',pattern:'spots',acc:'bow'},{color:'lavender',pattern:'hearts',acc:'pearls'},{color:'sky',pattern:'stripes',acc:'fin'});
  for(let i=0;i<Math.min(combos.length,cols*rows);i++){ const s=JSON.parse(w.localStorage.getItem('puffer-panic-v2')); s.fish={killi:combos[i]}; w.localStorage.setItem('puffer-panic-v2',JSON.stringify(s));
    // reload save object in page by re-reading via a fresh customize: easiest is to set through UI
    G.setTwoP(true); $('#bMenu').click(); $('[data-act="fish"]').click(); $('[data-edit="killi"]').click();
    $(`[data-fcolor="${combos[i].color}"]`).click(); $(`[data-fpattern="${combos[i].pattern}"]`).click(); $(`[data-facc="${combos[i].acc}"]`).click(); await frames(2);
    sc.drawImage($('canvas.bigprev').__cv(), (i%cols)*cell, Math.floor(i/cols)*cell, cell, cell); }
  fs.writeFileSync(require('path').join(__dirname, 'out', 'f_gallery.png'), sheet.toBuffer('image/png'));
  console.log('errors:',errs.length?errs.slice(0,3):'none'); console.log(ok&&!errs.length?'ALL FISH CHECKS PASSED':'SOME FAILED'); process.exit(0);
},400);
