require('fs').mkdirSync(require('path').join(__dirname, 'out'), {recursive: true});
const {JSDOM}=require('jsdom');const fs=require('fs');const {createCanvas}=require('@napi-rs/canvas');
const html=fs.readFileSync(require('path').join(__dirname, '..', 'index.html'),'utf8');const errs=[]; const log=[];
const dom=new JSDOM(html,{url:'https://example.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  const P=w.HTMLCanvasElement.prototype; const B=new WeakMap();
  const back=el=>{let b=B.get(el); if(!b){b={cv:createCanvas(300,150)};B.set(el,b);} return b;};
  Object.defineProperty(P,'width',{get(){return back(this).cv.width},set(v){back(this).cv.width=Math.max(1,v|0)}});
  Object.defineProperty(P,'height',{get(){return back(this).cv.height},set(v){back(this).cv.height=Math.max(1,v|0)}});
  P.getContext=function(){const b=back(this); if(b.px) return b.px; const real=()=>b.cv.getContext('2d');
    b.px=new Proxy({}, {get(t,k){const r=real(); if(k==='drawImage') return (img,...a)=>r.drawImage(img instanceof w.HTMLCanvasElement?back(img).cv:img,...a);
      const v=r[k]; return typeof v==='function'?v.bind(r):v;}, set(t,k,v){real()[k]=v; return true;}}); return b.px;};
  w.localStorage.setItem('puffer-panic-v2', JSON.stringify({unlocked:18,best:{},seenIntro:true,seenStory:{bruiser:true,queen:true}}));
  // a fake Poki SDK that records every call
  w.PokiSDK={init:()=>{log.push('init');return Promise.resolve();},gameLoadingFinished:()=>log.push('loaded'),gameplayStart:()=>log.push('start'),gameplayStop:()=>log.push('stop'),
    commercialBreak:(onStart)=>{log.push('break');onStart&&onStart();return Promise.resolve();},rewardedBreak:(onStart)=>{log.push('rewarded');onStart&&onStart();return Promise.resolve(true);}};
  w.addEventListener('error',e=>errs.push(e.message+' '+(e.error&&e.error.stack)));
  w.matchMedia=()=>({matches:false,addEventListener(){}}); w.innerHeight=900;
  Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 780}});
}});
const w=dom.window,D=w.document,$=q=>D.querySelector(q);
const tick=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(async()=>{
  const G=w.__pp; let ok=true; const chk=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m); if(!c) ok=false;};
  await tick(20);
  chk(log[0]==='init' && log.includes('loaded') && G.Ads.ready,'SDK initialized and told the game finished loading');
  chk(D.querySelector('meta[name="theme-color"]') && D.querySelector('link[rel="manifest"]') && D.querySelector('link[rel="apple-touch-icon"]'),'PWA tags present');
  log.length=0; G.setTwoP(false); $('[data-lv="0"]').click(); await tick(10);
  chk(log[0]==='break','starting a level requests an interstitial first');
  G.tick(2.2); chk(log.includes('start'),'gameplayStart fires when the level actually begins (after the intro banner)');
  w.dispatchEvent(new w.KeyboardEvent('keydown',{code:'KeyP'})); chk(log[log.length-1]==='stop','pausing sends gameplayStop');
  $('[data-act="resume"]').click(); chk(log[log.length-1]==='start','resuming sends gameplayStart');
  // continue with a rewarded ad after everyone is caught
  const S=G.S; G.killPlayer(S.players[0]); G.tick(.05); G.tick(1); G.tick(1); 
  chk(G.mode==='fail' && /Watch an ad to continue/.test($('#card').textContent),'with an ad network present, getting caught offers a continue');
  const snacksBefore=S.snacks.length; S.players[0].points=77; log.length=0;
  $('[data-act="continue"]').click(); await tick(10);
  chk(log[0]==='rewarded' && G.mode==='play' && !S.players[0].dead && S.players[0].points===77 && S.snacks.length===snacksBefore,'rewarded ad revives you in place with score and snacks intact');
  chk(G.S===S,'the level was not restarted');
  G.killPlayer(S.players[0]); G.tick(.05); G.tick(1); G.tick(1);
  chk(G.S!==S && G.mode==='play','a second wipe restarts the reef (continue is offered once per attempt)');
  console.log('errors:',errs.length?errs.slice(0,3):'none'); console.log(ok&&!errs.length?'ALL AD CHECKS PASSED':'SOME FAILED'); process.exit(0);
},400);
