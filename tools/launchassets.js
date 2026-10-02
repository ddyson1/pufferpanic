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
// icon: Killi on the paper reef, cropped tight
boot(4, w=>{ const G=w.__pp, cv=w.document.querySelector('#c').__cv(), T=cv.width/15;
  const rows=[]; for(let y=0;y<13;y++){let r='';for(let x=0;x<15;x++) r+=(x===0||y===0||x===14||y===12)?'#':'.'; rows.push(r);}
  const set=(x,y,c)=>{rows[y]=rows[y].slice(0,x)+c+rows[y].slice(x+1);}; set(7,6,'P'); set(13,11,'Q'); set(13,1,'1');
  G.LEVELS.push({name:'x',hint:'',waves:['krill'],map:rows}); G.setTwoP(false); G.loadLevel(G.LEVELS.length-1); G.tick(.5);
  const p=G.S.players[0]; p.face={x:1,y:0}; G.draw();
  const crop=(x0,y0,s,out,name)=>{ const c=createCanvas(out,out); c.getContext('2d').drawImage(cv,x0*T,y0*T,s*T,s*T,0,0,out,out); fs.writeFileSync(`${require('path').join(__dirname, '..', 'icons')}/${name}.png`,c.toBuffer('image/png')); };
  crop(6.45,5.4,2.2,512,'icon-512'); crop(6.45,5.4,2.2,192,'icon-192'); crop(6.45,5.4,2.2,180,'icon-180'); crop(6.45,5.4,2.2,64,'icon-64');
  // maskable: more padding
  crop(5.95,4.9,3.2,512,'icon-maskable-512');
  // screenshots at 2x
  boot(2, w2=>{ const G2=w2.__pp, cv2=w2.document.querySelector('#c').__cv();
    const save=(name)=>{ G2.draw(); const c=createCanvas(1280,Math.round(1280*cv2.height/cv2.width)); c.getContext('2d').drawImage(cv2,0,0,c.width,c.height); fs.writeFileSync(`${require('path').join(__dirname, '..', 'marketing', 'screenshots')}/${name}.png`,c.toBuffer('image/png')); };
    G2.setTwoP(true);
    for(const [L,n] of [[0,'01-the-shallows'],[6,'02-urchin-garden'],[10,'03-seal-cove'],[13,'04-kelp-maze'],[15,'05-lionfish-lair']]){ G2.loadLevel(L); G2.tick(2.2); for(let k=0;k<60*2.5;k++) G2.tick(1/60); save(n); }
    G2.loadLevel(17); G2.tick(2.2); const S=G2.S, B=S.boss; S.enemies.forEach(e=>e.stun=999); const p0=S.players[0]; p0.inv=99; tp(p0,5,9); B.tents=[]; B.spawnT=0; G2.tick(.02); const t=B.tents[0]; const cc=t.cells[Math.floor(t.cells.length/2)]; S.grid[cc.y][cc.x]='c'; S.born[cc.y][cc.x]=-9; for(let k=0;k<90;k++){G2.tick(1/60); if(t.state==='stuck') break;} tp(p0,3,8); p0.face={x:1,y:0}; for(let k=0;k<8;k++) G2.tick(1/60); save('06-kraken-queen');
    console.log('assets done'); process.exit(0); });
});
