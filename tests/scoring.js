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
  w.localStorage.setItem('puffer-panic-v2', JSON.stringify({unlocked:18,best:{},seenIntro:true}));
  w.addEventListener('error',e=>errs.push(e.message+' '+(e.error&&e.error.stack)));
  w.matchMedia=()=>({matches:false,addEventListener(){}}); w.innerHeight=900;
  Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 780}});
}});
const w=dom.window,D=w.document;
setTimeout(()=>{
  const G=w.__pp; let ok=true; const chk=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m); if(!c) ok=false;};
  const tp=(a,x,y)=>{a.x=a.tx=a.fx=x;a.y=a.ty=a.fy=y;a.moving=false;};
  const hudTick=()=>{ w.requestAnimationFrame(()=>{}); };
  chk(D.querySelector('#hTimeChip').hidden && D.querySelector('#hScoreChip').hidden,'scoreboard hidden on the title screen');
  G.setTwoP(false); G.loadLevel(0); G.tick(2.2); let S=G.S, p=S.players[0]; S.enemies.forEach(e=>e.stun=999);
  G.tick(1.0); G.draw();
  // run the real HUD update via a frame
  setTimeout(()=>{
    chk(!D.querySelector('#hTimeChip').hidden,'scoreboard visible during play');
    chk(/^0:0\d\.\d$/.test(D.querySelector('#hTime').textContent) && D.querySelector('#hTime').textContent!=='0:00.0','timer counts up: '+D.querySelector('#hTime').textContent);
    // collect: single krill = 10
    const k1=S.snacks[0]; p.lastGet=-9; tp(p,k1.x,k1.y); G.tick(.02);
    chk(p.points===10,'a krill is worth 10 points ('+p.points+')');
    chk(S.popups.length>=1 && S.popups[S.popups.length-1].text==='+10','a +10 pops up on the board');
    // streak: next two quickly
    const k2=S.snacks[0]; tp(p,k2.x,k2.y); G.tick(.02); const k3=S.snacks[0]; tp(p,k3.x,k3.y); G.tick(.02);
    chk(p.points===10+15+20,'quick pickups add a streak bonus: +15 then +20 ('+p.points+')');
    // break the streak
    G.tick(1.5); const k4=S.snacks[0]; tp(p,k4.x,k4.y); G.tick(.02);
    chk(p.points===45+10,'pausing resets the streak ('+p.points+')');
    // clear level and check card
    let g=0; while(G.mode==='play'&&g++<100){ S.enemies.forEach(e=>e.stun=999); const sn=G.S.snacks[0]; if(!sn){G.tick(.3);continue;} tp(p,sn.x,sn.y); G.tick(.3);}  
    const card=D.querySelector('#card').textContent;
    chk(/Time/.test(card)&&/Score/.test(card)&&/New best/.test(card),'win card shows time and score with new-best markers');
    const saved=JSON.parse(w.localStorage.getItem('puffer-panic-v2'));
    chk(saved.scores['1-0']===p.points && saved.best['1-0']>0,'best score and time are saved ('+saved.scores['1-0']+' pts, '+saved.best['1-0']+'s)');
    D.querySelector('[data-act="menu"]').click();
    chk(/pts/.test(D.querySelector('[data-lv="0"]').textContent),'level select shows best time and points: '+D.querySelector('[data-lv="0"] small').textContent);
    // pearl value & boss points
    G.loadLevel(12); G.tick(2.2); S=G.S; const B=S.boss, e=B.e; p=S.players[0]; p.inv=99; S.friends.forEach(n=>tp(n,13,11));
    e.crash=2; tp(p,Math.round(e.fx)+1,Math.round(e.fy)); G.startPuff(p); G.tick(.02);
    chk(p.points===200,'a boss hit is worth 200 ('+p.points+')');
    let guard=0; while(!B.dead&&guard++<10){ e.crash=2; B.hitCd=0; p.puff=0; p.puffCd=0; tp(p,Math.round(e.fx)+1,Math.round(e.fy)); G.startPuff(p); G.tick(.02); G.tick(.7);} 
    chk(p.points===4*200+1000,'defeating a boss adds 1,000 ('+p.points+')');
    // 2P per-player scores
    G.setTwoP(true); G.loadLevel(0); G.tick(2.2); S=G.S; S.enemies.forEach(e=>e.stun=999); const [k,m]=S.players;
    const a=S.snacks[0]; tp(m,a.x,a.y); G.tick(.02);
    setTimeout(()=>{
      const chips=[...D.querySelectorAll('.pchip .pts')].map(x=>x.textContent);
      chk(chips.length===2 && chips[1]==='10' && D.querySelector('#hScore').textContent==='10','co-op shows each fish\'s points and the team total: '+chips.join(' / '));
      G.draw(); fs.writeFileSync(require('path').join(__dirname, 'out', 'score_play.png'), D.querySelector('#c').__png());
      console.log('errors:',errs.length?errs.slice(0,3):'none'); console.log(ok&&!errs.length?'ALL SCORE CHECKS PASSED':'SOME FAILED'); process.exit(0);
    },120);
  },120);
},400);
