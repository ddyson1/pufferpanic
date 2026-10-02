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
  Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 780}});
}});
const w=dom.window, D=w.document;
const shots=[];
setTimeout(()=>{
  const G=w.__pp; let ok=true; const chk=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m); if(!c) ok=false;};
  const tp=(a,x,y)=>{a.x=a.tx=a.fx=x;a.y=a.ty=a.fy=y;a.moving=false;};
  const shot=name=>{G.draw(); fs.writeFileSync(`${require('path').join(__dirname, 'out')}/b_${name}.png`, D.querySelector('#c').__png()); shots.push(name);};
  // ---- intro on first launch
  chk(G.mode==='story' && G.story && G.story.id==='intro','intro story plays on first launch');
  chk(!D.querySelector('#story').hidden,'story caption panel visible');
  let pages=0;
  while(G.mode==='story' && pages<20){ for(let k=0;k<40;k++) G.tick(1/30); if(pages<5) shot('intro'+pages); D.querySelector('#storyNext').click(); D.querySelector('#storyNext').click(); pages++; }
  chk(pages===5 && G.mode==='menu','intro has 5 panels and returns to the menu');
  chk(JSON.parse(w.localStorage.getItem('puffer-panic-v2')).seenIntro===true,'intro is remembered');
  // ---- level select has bosses
  chk(D.querySelectorAll('.lv').length===18,'18 levels in select');
  chk(/Boss: Bruiser/.test(D.querySelector('[data-lv="12"]').textContent),'level 13 is labeled as a boss');
  // ---- boss card before Bruiser
  G.setTwoP(false); G.startLevel(12);
  chk(G.mode==='story' && G.story.id==='bruiser','Bruiser story card plays first time');
  for(let k=0;k<30;k++) G.tick(1/30); shot('card_bruiser');
  D.querySelector('#storyNext').click(); D.querySelector('#storyNext').click();
  chk(G.mode==='play' && G.S.boss && G.S.boss.kind==='shark','then the fight starts');
  G.tick(2.2); let S=G.S, B=S.boss, e=B.e, p=S.players[0];
  chk(G.mode==='play' && S.snacks.length===0 && B.hp===4,'boss level does not auto-win without snacks, Bruiser has 4 HP');
  S.friends.forEach(n=>tp(n,13,11));
  // charge sees through coral
  tp(e,7,5); e.ccd=0; e.charge=false; tp(p,7,10); p.inv=99; S.grid[7][7]='c'; S.born[7][7]=-9;
  for(let k=0;k<4;k++) G.tick(1/60);
  chk(e.charge===true,'Bruiser spots you through coral and winds up a charge');
  let crashed=false; for(let k=0;k<120;k++){ G.tick(1/60); if(e.crash>0){crashed=true;break;} }
  chk(crashed && S.grid[7][7]!=='c','he crashes into the coral, breaking it, and gets dizzy');
  p.inv=0; tp(p,Math.round(e.fx),Math.round(e.fy)); p.fx=e.fx; p.fy=e.fy; G.tick(.02);
  chk(!p.dead,'a dizzy Bruiser is harmless');
  tp(p,Math.round(e.fx)+1,Math.round(e.fy)); G.startPuff(p); G.tick(.02);
  chk(B.hp===3 && e.crash===0,'puffing beside a dizzy Bruiser lands a hit');
  for(let k=0;k<30;k++) G.tick(1/60); shot('bruiser_fight');
  // puff on non-dizzy shark does nothing
  G.tick(1.5); p.puffCd=0; p.puff=0; e.crash=0; const hp0=B.hp; tp(e,5,6); tp(p,6,6); G.startPuff(p); G.tick(.02);
  chk(B.hp===hp0,'puffing at an alert Bruiser does no damage');
  for(let k=0;k<90;k++) G.tick(1/60);
  p.inv=0; p.puff=0; p.shield=false; e.crash=0; e.daze=0; e.windup=0; tp(e,5,6); tp(p,5,6); G.tick(.02);
  chk(p.dead,'touching an alert Bruiser catches you');
  // finish him
  G.loadLevel(12); G.tick(2.2); S=G.S; B=S.boss; e=B.e; p=S.players[0]; p.inv=99;
  let guard=0; while(B.hp>0 && guard++<20){ e.crash=2; B.hitCd=0; tp(p,Math.round(e.fx)+1,Math.round(e.fy)); p.puffCd=0; p.puff=0; G.startPuff(p); G.tick(.02); G.tick(.7); }
  chk(B.dead,'four hits defeat Bruiser');
  for(let k=0;k<20;k++) G.tick(1/30); shot('bruiser_down');
  for(let k=0;k<60;k++) G.tick(1/30);
  chk(G.mode==='won','victory screen after his exit animation');
  // ---- revive on boss hit in 2P
  G.setTwoP(true); G.loadLevel(12); G.tick(2.2); S=G.S; B=S.boss; e=B.e;
  G.killPlayer(S.players[1]); e.crash=2; const k0=S.players[0]; k0.inv=99; tp(k0,Math.round(e.fx)+1,Math.round(e.fy)); G.startPuff(k0); G.tick(.02);
  chk(!S.players[1].dead,'hitting a boss revives a caught partner');
  // ---- Kraken Queen
  G.setTwoP(false); G.startLevel(17);
  chk(G.mode==='story' && G.story.id==='queen','Kraken Queen story card plays first time');
  for(let k=0;k<30;k++) G.tick(1/30); shot('card_queen');
  D.querySelector('#storyNext').click(); D.querySelector('#storyNext').click();
  G.tick(2.2); S=G.S; B=S.boss; p=S.players[0];
  chk(B.kind==='queen' && B.hp===6,'the Queen has 6 HP');
  chk(S.grid[1][7]==='#' && S.grid[2][6]==='#','her body blocks the top of the arena');
  S.enemies.forEach(en=>en.stun=999); S.friends.forEach(n=>tp(n,1,1));
  // lane hit
  tp(p,7,9); p.inv=0; B.tents=[]; B.spawnT=0; G.tick(.02);
  let t=B.tents[0]; chk(!!t && t.state==='warn','a tentacle telegraphs its lane first');
  chk(!p.dead,'the warning itself is harmless');
  for(let k=0;k<12;k++) G.tick(1/30); shot('queen_warn');
  for(let k=0;k<90;k++){ G.tick(1/60); if(p.dead) break; }
  chk(p.dead,'standing in the lane gets you caught');
  // trap: coral in lane -> stuck
  G.loadLevel(17); G.tick(2.2); S=G.S; B=S.boss; p=S.players[0]; S.enemies.forEach(en=>en.stun=999); S.friends.forEach(n=>tp(n,1,1)); p.inv=99;
  tp(p,5,9); B.tents=[]; B.spawnT=0; G.tick(.02); t=B.tents[0];
  const cut=Math.floor(t.cells.length/2); const cc=t.cells[cut]; S.grid[cc.y][cc.x]='c'; S.born[cc.y][cc.x]=-9;
  for(let k=0;k<90;k++){ G.tick(1/60); if(t.state==='stuck') break; }
  chk(t.state==='stuck' && Math.abs(t.len-cut)<.01,'a tentacle that hits coral gets stuck right in front of it');
  for(let k=0;k<10;k++) G.tick(1/30); shot('queen_stuck');
  const tip={x:t.cells[0].x+.5-t.d.x*.5+t.d.x*t.len, y:t.cells[0].y+.5-t.d.y*.5+t.d.y*t.len};
  tp(p,Math.round(tip.x-.5-t.d.y),Math.round(tip.y-.5+t.d.x)); p.puffCd=0; p.puff=0; G.startPuff(p); G.tick(.02);
  chk(B.hp===5 && t.state==='back','puffing next to the stuck tip hurts the Queen');
  // stuck timeout breaks coral
  G.loadLevel(17); G.tick(2.2); S=G.S; B=S.boss; p=S.players[0]; S.enemies.forEach(en=>en.stun=999); p.inv=99; tp(p,5,9); B.tents=[]; B.spawnT=0; G.tick(.02); t=B.tents[0];
  const c2=t.cells[2]; S.grid[c2.y][c2.x]='c'; S.born[c2.y][c2.x]=-9; tp(p,1,1); B.spawnT=99;
  for(let k=0;k<60*4;k++){ G.tick(1/60); B.spawnT=99; }
  chk(S.grid[c2.y][c2.x]!=='c','if you wait too long, she smashes the coral and pulls back');
  // two tentacles at low HP
  B.hp=3; B.tents=[]; B.spawnT=0; G.tick(.02); B.spawnT=0; G.tick(.02);
  chk(B.tents.length===2,'at half health she attacks with two tentacles');
  // defeat -> ending -> win card
  G.loadLevel(17); G.tick(2.2); S=G.S; B=S.boss; B.hp=1; B.hitCd=0; G.bossHit();
  const crab=S.enemies[0]; crab.stun=0; tp(crab,S.players[0].x,S.players[0].y); S.players[0].inv=0; G.tick(.05);
  chk(!S.players[0].dead,'nothing can catch you during the victory sequence');
  for(let k=0;k<30;k++) G.tick(1/30); shot('queen_down');
  for(let k=0;k<60;k++) G.tick(1/30);
  chk(G.mode==='story' && G.story.id==='ending','beating the Queen plays the ending');
  // five panels; each needs one click to finish the text and one to advance, and a few seconds so its animation has arrived
  for(let i=0;i<5;i++){ for(let k=0;k<120;k++) G.tick(1/30); shot('ending'+i); D.querySelector('#storyNext').click(); D.querySelector('#storyNext').click(); }
  chk(G.mode==='won' && /whole reef is clear/.test(D.querySelector('#card').textContent),'then the final victory card');
  // boss card does not repeat
  G.startLevel(12); chk(G.mode==='play','boss story only plays the first time');
  // Story button replays the intro
  D.querySelector('#bMenu').click(); D.querySelector('[data-act="story"]').click(); chk(G.mode==='story'&&G.story.id==='intro','Story button replays the intro');
  w.dispatchEvent(new w.KeyboardEvent('keydown',{code:'Escape'})); chk(G.mode==='menu','Escape skips the story');
  console.log('errors:',errs.length?errs.slice(0,3):'none'); console.log(ok&&!errs.length?'ALL BOSS CHECKS PASSED':'SOME FAILED'); process.exit(0);
},400);
