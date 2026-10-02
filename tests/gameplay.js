require('fs').mkdirSync(require('path').join(__dirname, 'out'), {recursive: true});
const {JSDOM}=require('jsdom');const fs=require('fs');const {createCanvas}=require('@napi-rs/canvas');
const html=fs.readFileSync(require('path').join(__dirname, '..', 'index.html'),'utf8');
const errs=[];
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
  Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 780}});
}});
const w=dom.window;
const shot=(name)=>{w.__pp.draw(); fs.writeFileSync(require('path').join(__dirname, 'out', name+'.png'), w.document.querySelector('#c').__png());};
setTimeout(()=>{
 const G=w.__pp; let ok=true; const fail=m=>{ok=false;console.log('FAIL',m)};
 // maps
 G.LEVELS.forEach((L,i)=>{
  if(L.map.length!==13) fail(`L${i+1} rows ${L.map.length}`);
  L.map.forEach((r,y)=>{if(r.length!==15) fail(`L${i+1} row ${y} len ${r.length}`)});
  let P,Q;L.map.forEach((r,y)=>[...r].forEach((c,x)=>{if(c==='P')P=[x,y];if(c==='Q')Q=[x,y]}));
  if(!P||!Q) fail(`L${i+1} missing start`);
  const waves=new Set(L.map.join('').match(/[1-4]/g)); if(waves.size!==L.waves.length) fail(`L${i+1} waves ${waves.size} vs ${L.waves.length}`);
  const seen=new Set([P.join()]),q=[P];
  while(q.length){const [x,y]=q.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;const c=L.map[ny]&&L.map[ny][nx];if(!c||c==='#'||c==='x'||seen.has(nx+','+ny))continue;seen.add(nx+','+ny);q.push([nx,ny]);}}
  L.map.forEach((r,y)=>[...r].forEach((c,x)=>{if(/[1-4Q]/.test(c)&&!seen.has(x+','+y))fail(`L${i+1} unreachable ${c} ${x},${y}`)}));
 });
 shot('s_menu');
 const tp=(p,x,y)=>{p.x=p.tx=p.fx=x;p.y=p.ty=p.fy=y;p.moving=false;};
 // 1P basics
 G.setTwoP(false); G.loadLevel(0); G.tick(2.2); let S=G.S;
 if(S.players.length!==1) fail('1p count');
 const p=S.players[0]; p.face={x:0,y:-1}; G.coralAction(p);
 let n=0; for(let y=4;y>=1;y--) if(S.grid[y][6]==='c') n++; console.log('coral up from Killi:',n); if(!n) fail('no coral');
 G.coralAction(p); n=0; for(let y=4;y>=1;y--) if(S.grid[y][6]==='c') n++; if(n) fail('break');
 for(let k=0;k<30;k++) G.tick(1/30); shot('s_level1');
 // 2P + revive
 G.setTwoP(true); G.loadLevel(0); G.tick(2.2); S=G.S;
 if(S.players.length!==2||S.players[1].fish.name!=='Milli') fail('2p setup');
 G.killPlayer(S.players[1]); if(!S.players[1].dead) fail('kill');
 S.enemies.forEach(e=>e.stun=999);
 const K=S.players[0];
 for(const s of [...S.snacks]){tp(K,s.x,s.y);G.tick(.05);}
 G.tick(.1); console.log('wave after clear:',S.wave,'Milli revived:',!S.players[1].dead); if(S.players[1].dead) fail('revive');
 for(let k=0;k<70;k++) G.tick(1/30);
 shot('s_2p_level1');
 // both dead -> restart
 G.killPlayer(S.players[0]); G.killPlayer(S.players[1]); G.tick(.05); G.tick(1); G.tick(1); console.log('restart after wipe:',G.S!==S); if(G.S===S) fail('wipe restart');
 // vents block coral
 G.setTwoP(false); G.loadLevel(4); G.tick(2.2); S=G.S; const pv=S.players[0];
 tp(pv,3,5); pv.face={x:1,y:0}; G.coralAction(pv); console.log('vent at (5,5) blocks coral:',S.grid[5][4]==='c'&&S.grid[5][5]!=='c'); if(S.grid[5][5]==='c') fail('vent');
 // an eruption stuns a crab standing on a vent
 { const c=S.enemies.find(e=>e.kind==='C'); tp(c,5,5); c.stun=0; S.ventT=99; G.tick(1/60); console.log('eruption stuns the crab on the vent:',c.stun>0); if(!(c.stun>0)) fail('vent stun'); }
 // currents redirect: L8 row4 col2 'U'
 G.loadLevel(7); G.tick(2.2); S=G.S; const pc=S.players[0]; S.enemies.forEach(e=>e.stun=999); tp(pc,3,2); pc.face={x:0,y:-1};
 G.coralAction(pc); console.log('current bends coral: (3,1)=',S.grid[1][3],'(4,1)=',S.grid[1][4]); if(!(S.grid[1][3]==='c'&&S.grid[1][4]==='c')) fail('current bend');
 G.coralAction(pc); // clear
 // horizontal line into the D lane at (13,4) turns down it
 tp(pc,11,4); pc.face={x:1,y:0}; G.coralAction(pc);
 console.log('line from (11,4) right: (12,4)',S.grid[4][12],'(13,4) D-tile',S.grid[4][13],'(13,5)',S.grid[5][13]);
 if(S.grid[5][13]!=='c') fail('current redirect down');
 // urchin kill + smother
 G.loadLevel(6); G.tick(2.2); S=G.S; S.enemies.forEach(e=>e.stun=999); const pu=S.players[0];
 tp(pu,3,5); G.tick(.05); console.log('urchin kills:',pu.dead); if(!pu.dead) fail('urchin');
 G.loadLevel(6); G.tick(2.2); S=G.S; S.enemies.forEach(e=>e.stun=999); const pu2=S.players[0];
 tp(pu2,4,5); pu2.face={x:-1,y:0}; G.coralAction(pu2); G.tick(.05); console.log('urchin covered disarms:',S.urchins.get(5*15+3).armed===false);
 G.coralAction(pu2); G.tick(.1); tp(pu2,3,5); G.tick(.05); console.log('safe during rearm:',!pu2.dead); if(pu2.dead) fail('rearm window');
 G.tick(3.2); tp(pu2,4,5); G.tick(.05); tp(pu2,3,5); G.tick(.05); console.log('rearmed kills:',pu2.dead);
 // moon teleport
 G.loadLevel(6); G.tick(2.2); S=G.S; S.enemies.forEach(e=>e.stun=999); const pm=S.players[0];
 for(const s of [...S.snacks]){tp(pm,s.x,s.y);G.tick(.05);} G.tick(.4);
 const moons=S.snacks.filter(s=>s.type==='moon'); const before=moons.map(s=>s.x+','+s.y).join('|'); tp(pm,7,10);
 for(let k=0;k<60*7;k++){G.tick(1/60); S.enemies.forEach(e=>e.stun=999);} const after=moons.map(s=>s.x+','+s.y).join('|');
 console.log('moon pearls moved:',before!==after); if(before===after) fail('moon');
 // shrimp flee
 G.loadLevel(2); G.tick(2.2); S=G.S; S.enemies.forEach(e=>e.stun=999); const ps=S.players[0];
 for(const s of [...S.snacks]){tp(ps,s.x,s.y);G.tick(.05);} G.tick(.4);
 const sh=S.snacks[0]; tp(ps,sh.x-1>0?sh.x-1:sh.x+1,sh.y); const d0=Math.abs(ps.fx-sh.fx)+Math.abs(ps.fy-sh.fy);
 for(let k=0;k<40;k++){G.tick(1/60);} const d1=Math.abs(ps.fx-sh.fx)+Math.abs(ps.fy-sh.fy);
 console.log('shrimp flees: dist',d0,'->',d1.toFixed(2)); if(!(d1>d0)) fail('shrimp');
 shot('s_shrimp');
 // swordfish charge
 G.loadLevel(5); G.tick(2.2); S=G.S; const sw=S.enemies.find(e=>e.kind==='S'); const pw=S.players[0];
 S.enemies.forEach(e=>{if(e!==sw)e.stun=999}); tp(sw,7,9); sw.moving=false; tp(pw,12,9); pw.inv=999;
 let charged=false,maxSpeed=0,lx=sw.fx; for(let k=0;k<60;k++){G.tick(1/60); if(sw.charge&&sw.windup<=0){charged=true; maxSpeed=Math.max(maxSpeed,Math.abs(sw.fx-lx)*60);} lx=sw.fx;}
 console.log('swordfish charged:',charged,'speed',maxSpeed.toFixed(1)); if(!charged) fail('swordfish');
 // mantis punch
 G.loadLevel(8); G.tick(2.2); S=G.S; const m=S.enemies.find(e=>e.kind==='M'); S.enemies.forEach(e=>{if(e!==m)e.stun=999});
 const pmn=S.players[0]; pmn.inv=999; tp(m,7,11); m.moving=false; tp(pmn,7,9);
 S.grid[10][7]='c'; S.born[10][7]=-9;
 let punched=false; for(let k=0;k<120;k++){G.tick(1/60); if(m.punch>0) punched=true; if(S.grid[10][7]!=='c') break;}
 console.log('mantis punched coral:',punched,S.grid[10][7]!=='c'); if(S.grid[10][7]==='c') fail('mantis');
 // puff stun in 2P for Milli
 G.setTwoP(true); G.loadLevel(3); G.tick(2.2); S=G.S; const mi=S.players[1]; const e3=S.enemies[0]; tp(e3,mi.x+1,mi.y); G.startPuff(mi); G.tick(.02);
 console.log('Milli puff stuns:',e3.stun>0,'alive',!mi.dead); if(!(e3.stun>0)) fail('puff2');
 // soak
 for(const tw of [false,true]){ G.setTwoP(tw); for(let L=0;L<16;L++) for(let run=0;run<3;run++){ G.loadLevel(L);
   for(let f=0;f<60*30;f++){ const SS=G.S; if(f%18===0) SS.players.forEach((pp,i)=>{['up','down','left','right'].forEach(d=>G.releaseDir(i,d)); G.pressDir(i,['up','down','left','right'][Math.random()*4|0]);});
     SS.players.forEach(pp=>{if(Math.random()<.02)pp.bufAct=true; if(Math.random()<.004)pp.bufPuff=true;});
     G.tick(1/60); if(f%15===0) G.draw(); if(G.mode==='won') break; } } }
 // final screenshots mid-play
 G.setTwoP(true); G.loadLevel(9); for(let k=0;k<60*4;k++) G.tick(1/60); shot('s_trench_2p');
 G.setTwoP(false); G.loadLevel(6); for(let k=0;k<60*3;k++) G.tick(1/60); shot('s_urchin');
 G.loadLevel(4); for(let k=0;k<60*3;k++) G.tick(1/60); const pp=G.S.players[0]; pp.face={x:0,y:1}; G.coralAction(pp); for(let k=0;k<20;k++) G.tick(1/60); shot('s_vents');
 console.log('runtime errors:',errs.length?errs.slice(0,3):'none');
 console.log(ok&&!errs.length?'ALL CHECKS PASSED':'SOME CHECKS FAILED');
 process.exit(0);
},400);
