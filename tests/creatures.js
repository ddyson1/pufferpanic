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
  w.localStorage.setItem('puffer-panic-v2', JSON.stringify({unlocked:10,best:{'1-9':80.2}}));
  w.addEventListener('error',e=>errs.push(e.message+' '+(e.error&&e.error.stack)));
  w.matchMedia=()=>({matches:false,addEventListener(){}}); w.innerHeight=900;
  Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 780}});
}});
const w=dom.window;
setTimeout(()=>{
  const G=w.__pp; let ok=true; const chk=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m); if(!c) ok=false;};
  const tp=(a,x,y)=>{a.x=a.tx=a.fx=x;a.y=a.ty=a.fy=y;a.moving=false;};
  chk(w.document.querySelectorAll('.lv').length===18,'18 levels in select');
  chk(!w.document.querySelector('[data-lv="10"]').disabled,'old save that cleared level 10 unlocks level 11');
  G.setTwoP(false);
  // Seal shield
  G.loadLevel(10); G.tick(2.2); let S=G.S; const n=S.friends[0]; const p=S.players[0]; chk(!!n&&n.name==='Nori','Nori present in Seal Cove');
  S.enemies.forEach(e=>e.stun=999); tp(n,4,9); tp(p,4,9); G.tick(.02); chk(p.shield===true,'touching Nori gives a bubble shield');
  const e0=S.enemies[0]; e0.stun=0; tp(n,13,1); tp(e0,p.x,p.y); G.tick(.02); chk(!p.dead&&!p.shield&&e0.stun>0,'shield absorbs a hit, pops, and stuns the attacker');
  p.inv=0; e0.stun=0; tp(p,1,1); tp(e0,1,1); G.tick(.02); chk(p.dead,'without a shield the next hit catches you');
  // Seal boop
  G.loadLevel(10); G.tick(2.2); S=G.S; const n2=S.friends[0]; const e1=S.enemies.find(e=>e.kind==='E'); tp(n2,5,4); tp(e1,5,4); S.players[0].inv=99; G.tick(.02); chk(e1.stun>0,'Nori boops an eel and stuns it');
  // Seal roams toward players
  G.loadLevel(10); G.tick(2.2); S=G.S; const n3=S.friends[0]; S.enemies.forEach(e=>e.stun=999); const pl=S.players[0]; pl.inv=99; tp(pl,13,11); tp(n3,1,1);
  const d0=Math.abs(n3.fx-pl.fx)+Math.abs(n3.fy-pl.fy); for(let k=0;k<60*5;k++){G.tick(1/60);S.enemies.forEach(e=>e.stun=999);} const d1=Math.abs(n3.fx-pl.fx)+Math.abs(n3.fy-pl.fy);
  chk(d1<d0,`Nori swims over to say hi (distance ${d0} -> ${d1.toFixed(1)})`);
  // Manta over coral
  G.loadLevel(13); G.tick(2.2); S=G.S; const m=S.enemies.find(e=>e.kind==='A'); S.players[0].inv=999; S.enemies.forEach(e=>{if(e!==m)e.stun=999});
  tp(m,6,1); m.dir={x:0,y:1}; S.grid[2][6]='c';
  let overCoral=false; for(let k=0;k<60*8;k++){G.tick(1/60); if(S.grid[Math.round(m.fy)][Math.round(m.fx)]==='c') overCoral=true;} chk(overCoral,'manta glides over coral');
  // Stingray
  G.loadLevel(15); G.tick(2.2); S=G.S; const y=S.enemies.find(e=>e.kind==='Y'); const py=S.players[0]; S.enemies.forEach(e=>{if(e!==y)e.stun=999}); S.friends.forEach(f=>tp(f,13,11));
  tp(py,13,5); y.t=0; G.tick(.1); chk(y.state==='buried','stingray stays buried when you are far');
  tp(py,y.x+1,y.y); py.inv=0; G.tick(.05); chk(y.state==='rising','stingray bursts out when you get close');
  chk(!py.dead,'rising stingray is not yet dangerous');
  G.tick(.6); chk(y.state==='hunt','then hunts');
  tp(py,y.x,y.y); py.fx=y.fx; py.fy=y.fy; G.tick(.02); chk(py.dead,'hunting stingray catches you');
  // Lionfish flare radius
  G.loadLevel(16); G.tick(2.2); S=G.S; const f=S.enemies.find(e=>e.kind==='F'); const pf=S.players[0]; S.enemies.forEach(e=>{if(e!==f)e.stun=999}); S.friends.forEach(nn=>tp(nn,13,11));
  tp(f,7,7); f.ph='calm'; f.ft=99; tp(pf,8,7); pf.fx=8.1; G.tick(.02); chk(!pf.dead,'calm lionfish at 1.1 tiles is safe');
  f.ph='flare'; f.ft=1; f.x=f.tx=7; f.fx=7; G.tick(.02); chk(pf.dead,'flared lionfish at 1.1 tiles catches you');
  // Kelp hides you from eels
  G.loadLevel(14); G.tick(2.2); S=G.S; const ek=S.enemies.find(e=>e.kind==='E'); const pk=S.players[0]; pk.inv=99;
  chk(S.floor[6][6]==='k','kelp tile exists at (6,6)');
  S.enemies.forEach(e=>e.stun=999); ek.stun=0;
  tp(ek,1,4); tp(pk,6,6); const hid=G.bfsStep(ek,false); tp(pk,7,7); const open=G.bfsStep(ek,false);
  chk(hid===null && open!==null, 'eel pathfinding loses you in kelp but finds you in open water');
  tp(pk,6,6); tp(ek,7,6); chk(G.bfsStep(ek,false)!==null,'a hunter right next to you still sees you in kelp');
  // Clams
  G.loadLevel(11); G.tick(2.2); S=G.S; S.enemies.forEach(e=>e.stun=999); S.friends.forEach(nn=>tp(nn,7,9)); const c=S.snacks.find(s=>s.type==='clam'); const pc=S.players[0];
  c.open=false; c.lid=0; c.ct=99; tp(pc,c.x,c.y); G.tick(.02); chk(S.snacks.includes(c),'closed clam cannot be collected');
  c.open=true; c.ct=99; for(let k=0;k<20;k++) G.tick(1/60); chk(!S.snacks.includes(c),'open clam can be collected');
  // Stars
  G.loadLevel(0); G.tick(2.2); S=G.S; S.enemies.forEach(e=>e.stun=999); const ps=S.players[0]; let guard=0;
  while(G.mode==='play' && guard++<200){ S.enemies.forEach(e=>e.stun=999); const sn=G.S.snacks[0]; if(!sn){G.tick(.3);continue;} tp(ps,sn.x,sn.y); G.tick(.3); }
  chk(/★★★/.test(w.document.querySelector('#card').textContent),'clean clear earns 3 stars');
  // Screenshots
  for(const [L,name] of [[10,'seal'],[14,'kelp'],[16,'lion']]){ G.setTwoP(true); G.loadLevel(L); for(let k=0;k<60*3.5;k++) G.tick(1/60); if(name==='lion'){G.S.players[0].shield=true; G.S.players[0].dead=false;} G.draw(); fs.writeFileSync(`${require('path').join(__dirname, 'out')}/new_${name}.png`, w.document.querySelector('#c').__png()); }
  console.log('errors:',errs.length?errs.slice(0,3):'none'); console.log(ok&&!errs.length?'ALL NEW CHECKS PASSED':'SOME FAILED'); process.exit(0);
},400);
