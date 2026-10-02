require('fs').mkdirSync(require('path').join(__dirname, 'out'), {recursive: true});
const {JSDOM}=require('jsdom');const fs=require('fs');const {createCanvas}=require('@napi-rs/canvas');
const html=fs.readFileSync(require('path').join(__dirname, '..', 'index.html'),'utf8');const errs=[];
const SEED=process.argv[2]||'fresh';
const dom=new JSDOM(html,{url:'https://example.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  const P=w.HTMLCanvasElement.prototype; const B=new WeakMap();
  const back=el=>{let b=B.get(el); if(!b){b={cv:createCanvas(300,150)};B.set(el,b);} return b;};
  Object.defineProperty(P,'width',{get(){return back(this).cv.width},set(v){back(this).cv.width=Math.max(1,v|0)}});
  Object.defineProperty(P,'height',{get(){return back(this).cv.height},set(v){back(this).cv.height=Math.max(1,v|0)}});
  P.getContext=function(){const b=back(this); if(b.px) return b.px; const real=()=>b.cv.getContext('2d');
    b.px=new Proxy({}, {get(t,k){const r=real(); if(k==='drawImage') return (img,...a)=>r.drawImage(img instanceof w.HTMLCanvasElement?back(img).cv:img,...a);
      const v=r[k]; return typeof v==='function'?v.bind(r):v;}, set(t,k,v){real()[k]=v; return true;}}); return b.px;};
  w.localStorage.setItem('puffer-panic-v2', JSON.stringify({unlocked:18,best:{},seenIntro:true,fish:{killi:{color:'gold',pattern:'hearts',acc:'crown'}}}));
  w.addEventListener('error',e=>errs.push(e.message+' '+(e.error&&e.error.stack)));
  w.matchMedia=()=>({matches:false,addEventListener(){}}); w.innerHeight=900;
  Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 780}});
}});
const w=dom.window,D=w.document,$=q=>D.querySelector(q);
setTimeout(()=>{
  const G=w.__pp; let ok=true; const chk=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m); if(!c) ok=false;};
  const tp=(a,x,y)=>{a.x=a.tx=a.fx=x;a.y=a.ty=a.fy=y;a.moving=false;};
  const clear=(L)=>{ G.loadLevel(L); G.tick(2.2); const S=G.S, p=S.players[0]; p.inv=999; let g=0;
    if(S.boss){ S.boss.hp=1; S.boss.hitCd=0; G.bossHit(p); for(let k=0;k<90;k++) G.tick(1/30); if(G.mode==='story'){ $('#storyNext').click(); $('#storyNext').click(); $('#storyNext').click(); $('#storyNext').click(); } return; }
    while(G.mode==='play'&&g++<200){ S.enemies.forEach(e=>e.stun=999); const sn=G.S.snacks[0]; if(!sn){G.tick(.3);continue;} if(sn.type==='clam'){sn.open=true;sn.lid=1;sn.ct=99;} tp(p,sn.x,sn.y); G.tick(.3);} };
  G.setTwoP(false);
  chk(G.getFish('killi').color===undefined || G.getFish('killi').name==='Killi','game loads');
  const kf=G.getFish('killi'); chk(kf.c2==='#f2b632' && kf.pattern==='spots' && kf.acc==='none','a saved look using locked pieces falls back to defaults');
  chk(G.unlockedSet().length===0,'a new player starts with 0 earned pieces');
  $('#bMenu').click(); $('[data-act="fish"]').click();
  chk($('[data-fpattern="stripes"]')===null && /Clear level 5/.test(D.querySelector('.fopt.locked').parentElement.textContent),'locked pieces are disabled and show how to earn them');
  chk(/0 of 13 unlockable pieces earned/.test($('#card').textContent),'progress shows 0 of 13');
  $('[data-act="fishdone"]').click();
  clear(0); clear(1); clear(2);
  chk(/New for your fish/.test($('#card').textContent) && /Lavender color/.test($('#card').textContent),'clearing level 3 announces the Lavender color on the clear screen');
  $('#card [data-act="fish"]').click();
  chk(G.isUnlocked('color','lavender') && !!$('[data-fcolor="lavender"]'),'"Try it on" opens the fish screen with Lavender selectable');
  $('[data-fcolor="lavender"]').click(); chk(G.getFish('killi').c2==='#bba3f0','and it can be worn');
  for(let L=3;L<17;L++) clear(L); // Bruiser's Reef is level 13 (index 12) now, cleared along the way
  const got=G.unlockedSet(); chk(['pattern:stripes','acc:glasses','color:tangerine','acc:cap','pattern:freckles','acc:star','color:midnight'].every(x=>got.includes(x)),'level clears unlock stripes, glasses, tangerine, cap, freckles, starfish and midnight');
  chk(G.isUnlocked('acc','fin'),'defeating Bruiser unlocks the shark fin hat');
  clear(17); chk(G.isUnlocked('acc','crown') && G.isUnlocked('pattern','hearts'),'beating the Kraken Queen unlocks the crown and hearts');
  chk(/Royal crown/.test($('#card').textContent),'the final clear screen (after the ending) announces the crown');
  const snacks=JSON.parse(w.localStorage.getItem('puffer-panic-v2')).stats.snacks; chk(snacks>0 && snacks<500 && !G.isUnlocked('acc','pearls'),`lifetime snacks are counted and saved (${snacks}); pearls still locked under 500`);
  const s2=JSON.parse(w.localStorage.getItem('puffer-panic-v2'));
  // gold: needs 3 stars everywhere
  chk(!G.isUnlocked('color','gold') || Object.keys(s2.stars).length>=18,'gold requires 3 stars on every level');
  chk(G.isUnlocked('color','gold'),'3 stars on all 18 levels unlocked gold');
  let reps=0, sawCard=false; while(!G.isUnlocked('acc','pearls') && reps<60){ clear(reps%16); if(/Pearl necklace/.test($('#card').textContent)) sawCard=true; reps++; }
  const n=JSON.parse(w.localStorage.getItem('puffer-panic-v2')).stats.snacks;
  chk(G.isUnlocked('acc','pearls') && sawCard && n>=500,`crossing 500 lifetime snacks (${n}) unlocks and announces the pearl necklace`);
  console.log('earned:',G.unlockedSet().length,'of 13');
  console.log('errors:',errs.length?errs.slice(0,3):'none'); console.log(ok&&!errs.length?'ALL UNLOCK CHECKS PASSED':'SOME FAILED'); process.exit(0);
},400);
