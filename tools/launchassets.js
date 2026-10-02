const {JSDOM}=require('jsdom');const fs=require('fs');const {createCanvas}=require('@napi-rs/canvas');
const html=fs.readFileSync(require('path').join(__dirname, '..', 'index.html'),'utf8');
function boot(dprv,cb){const dom=new JSDOM(html,{url:'https://example.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  const P=w.HTMLCanvasElement.prototype; const B=new WeakMap();
  const back=el=>{let b=B.get(el); if(!b){b={cv:createCanvas(300,150)};B.set(el,b);} return b;};
  Object.defineProperty(P,'width',{get(){return back(this).cv.width},set(v){back(this).cv.width=Math.max(1,v|0)}});
  Object.defineProperty(P,'height',{get(){return back(this).cv.height},set(v){back(this).cv.height=Math.max(1,v|0)}});
  P.getContext=function(){const b=back(this); if(b.px) return b.px; const real=()=>b.cv.getContext('2d');
    b.px=new Proxy({}, {get(t,k){const r=real(); if(k==='drawImage') return (img,...a)=>r.drawImage(img instanceof w.HTMLCanvasElement?back(img).cv:img,...a);
      const v=r[k]; return typeof v==='function'?v.bind(r):v;}, set(t,k,v){real()[k]=v; return true;}}); return b.px;};
  P.__cv=function(){return back(this).cv;};
  w.localStorage.setItem('puffer-panic-v2', JSON.stringify({unlocked:18,best:{},seenIntro:true,seenStory:{bruiser:true,queen:true}}));
  w.matchMedia=()=>({matches:false,addEventListener(){}}); w.innerHeight=900; w.devicePixelRatio=dprv;
  Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 780}});
}}); setTimeout(()=>cb(dom.window),400);}
const tp=(a,x,y)=>{a.x=a.tx=a.fx=x;a.y=a.ty=a.fy=y;a.moving=false;};
// icon: Killi puffed up on a transparent background, drawn through the fish card preview (which has no reef behind it)
boot(4, w=>{ const G=w.__pp; const ICONS=require('path').join(__dirname, '..', 'icons');
  const rows=[]; for(let y=0;y<13;y++){let r='';for(let x=0;x<15;x++) r+=(x===0||y===0||x===14||y===12)?'#':'.'; rows.push(r);}
  const set=(x,y,c)=>{rows[y]=rows[y].slice(0,x)+c+rows[y].slice(x+1);}; set(7,6,'P'); set(13,11,'Q'); set(13,1,'1');
  G.LEVELS.push({name:'x',hint:'',waves:['krill'],map:rows}); G.setTwoP(false); G.loadLevel(G.LEVELS.length-1); G.tick(.5);
  const pc=w.document.createElement('canvas'); pc.dataset.who='killi'; pc.dataset.big='1'; w.document.querySelector('#card').appendChild(pc);
  // the big preview puffs up for the last second of every four; step time until the drawing is that wide
  let box=null; for(let k=0;k<60 && !box;k++){ G.tick(.1); G.drawPreviews(); const c=pc.__cv(), d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; let x0=1e9,y0=1e9,x1=0,y1=0;
    for(let y=0;y<c.height;y++) for(let x=0;x<c.width;x++) if(d[(y*c.width+x)*4+3]>8){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
    if((x1-x0)/c.width>.6) box={c,x0,y0,x1,y1}; }
  const side=Math.max(box.x1-box.x0, box.y1-box.y0)*1.06, cx=(box.x0+box.x1)/2, cy=(box.y0+box.y1)/2;
  const fish=(out,pad)=>{ const c=createCanvas(out,out), x=c.getContext('2d'); const s=out*(1-2*pad); x.drawImage(box.c,cx-side/2,cy-side/2,side,side,(out-s)/2,(out-s)/2,s,s); return c; };
  for(const [n,out] of [['icon-512',512],['icon-192',192],['icon-180',180],['icon-64',64]]) fs.writeFileSync(`${ICONS}/${n}.png`, fish(out,0).toBuffer('image/png'));
  // maskable: reef blue behind, fish inside the safe zone
  { const c=createCanvas(512,512), x=c.getContext('2d'); x.fillStyle='#2b8fa0'; x.fillRect(0,0,512,512); x.drawImage(fish(512,.17),0,0); fs.writeFileSync(`${ICONS}/icon-maskable-512.png`, c.toBuffer('image/png')); }
  // screenshots at 2x
  boot(2, w2=>{ const G2=w2.__pp, cv2=w2.document.querySelector('#c').__cv();
    const save=(name)=>{ G2.draw(); const c=createCanvas(1280,Math.round(1280*cv2.height/cv2.width)); c.getContext('2d').drawImage(cv2,0,0,c.width,c.height); fs.writeFileSync(`${require('path').join(__dirname, '..', 'marketing', 'screenshots')}/${name}.png`,c.toBuffer('image/png')); };
    G2.setTwoP(true);
    for(const [L,n] of [[0,'01-the-shallows'],[6,'02-urchin-garden'],[10,'03-seal-cove'],[14,'04-kelp-maze'],[16,'05-lionfish-lair']]){ G2.loadLevel(L); G2.tick(2.2); for(let k=0;k<60*2.5;k++) G2.tick(1/60); save(n); }
    G2.loadLevel(17); G2.tick(2.2); const S=G2.S, B=S.boss; S.enemies.forEach(e=>e.stun=999); const p0=S.players[0]; p0.inv=99; tp(p0,5,9); B.tents=[]; B.spawnT=0; G2.tick(.02); const t=B.tents[0]; const cc=t.cells[Math.floor(t.cells.length/2)]; S.grid[cc.y][cc.x]='c'; S.born[cc.y][cc.x]=-9; for(let k=0;k<90;k++){G2.tick(1/60); if(t.state==='stuck') break;} tp(p0,3,8); p0.face={x:1,y:0}; for(let k=0;k<8;k++) G2.tick(1/60); save('06-kraken-queen');
    console.log('assets done'); process.exit(0); });
});
