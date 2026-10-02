const IMG = require('path').join(__dirname, 'img'); require('fs').mkdirSync(IMG, {recursive: true});
const {JSDOM}=require('jsdom');const fs=require('fs');const {createCanvas}=require('@napi-rs/canvas');
const html=fs.readFileSync(require('path').join(__dirname, '..', '..', 'index.html'),'utf8');const errs=[];
const dom=new JSDOM(html,{url:'https://example.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  const P=w.HTMLCanvasElement.prototype; const B=new WeakMap();
  const back=el=>{let b=B.get(el); if(!b){b={cv:createCanvas(300,150)};B.set(el,b);} return b;};
  Object.defineProperty(P,'width',{get(){return back(this).cv.width},set(v){back(this).cv.width=Math.max(1,v|0)}});
  Object.defineProperty(P,'height',{get(){return back(this).cv.height},set(v){back(this).cv.height=Math.max(1,v|0)}});
  P.getContext=function(){const b=back(this); if(b.px) return b.px; const real=()=>b.cv.getContext('2d');
    b.px=new Proxy({}, {get(t,k){const r=real(); if(k==='drawImage') return (img,...a)=>r.drawImage(img instanceof w.HTMLCanvasElement?back(img).cv:img,...a);
      const v=r[k]; return typeof v==='function'?v.bind(r):v;}, set(t,k,v){real()[k]=v; return true;}}); return b.px;};
  P.__cv=function(){return back(this).cv;};
  w.localStorage.setItem('puffer-panic-v2', JSON.stringify({unlocked:18,best:{},seenIntro:true}));
  w.addEventListener('error',e=>errs.push(e.message+' '+(e.error&&e.error.stack)));
  w.matchMedia=()=>({matches:false,addEventListener(){}}); w.innerHeight=900; w.devicePixelRatio=2;
  Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 780}});
}});
const w=dom.window;
setTimeout(()=>{
  const G=w.__pp; const cv=w.document.querySelector('#c').__cv(); const T=cv.width/15;
  const R={x:0,y:-1},Dn={x:0,y:1};
  const RIGHT={x:1,y:0},LEFT={x:-1,y:0},UP={x:0,y:-1};
  const crop=(name,x0,y0,tw,th,outW)=>{ G.draw(); const c=createCanvas(Math.round(tw*T),Math.round(th*T)); c.getContext('2d').drawImage(cv,x0*T,y0*T,tw*T,th*T,0,0,tw*T,th*T);
    const o=createCanvas(outW,Math.round(outW*th/tw)); o.getContext('2d').drawImage(c,0,0,o.width,o.height); fs.writeFileSync(`${IMG}/${name}.png`,o.toBuffer('image/png')); };
  const base=(center,extra={})=>{ const rows=[]; for(let y=0;y<13;y++){ let r=''; for(let x=0;x<15;x++){ r+= (x===0||y===0||x===14||y===12)?'#':'.'; } rows.push(r);} 
    const set=(x,y,c)=>{rows[y]=rows[y].slice(0,x)+c+rows[y].slice(x+1);}; set(7,6,center); set(1,11,'P'); set(13,11,'Q'); set(13,1,'1'); for(const [k,v] of Object.entries(extra)) { const [x,y]=k.split(',').map(Number); set(x,y,v); } return rows; };
  const custom=(L)=>{ G.LEVELS.push(L); const i=G.LEVELS.length-1; G.loadLevel(i); G.tick(.3); return G.S; };
  const enemyShot=(ch,name,setup,box=[6.45,5.3,2.1,2.1])=>{ const S=custom({name:'x',hint:'',waves:['krill'],map:base(ch)}); const e=S.enemies[0]; if(setup) setup(e,S); G.tick(.05); crop(name,...box,240); };
  enemyShot('C','crab',e=>{e.dir=LEFT;});
  enemyShot('J','jellyfish');
  enemyShot('E','eel',e=>{e.dir=RIGHT; e.trail=Array.from({length:9},(_,i)=>({x:7-i*.14,y:6+Math.sin(i*.8)*.08}));},[5.7,5.2,3,2.2]);
  enemyShot('O','octopus',e=>{e.dir=Dn;});
  enemyShot('S','swordfish',e=>{e.dir=RIGHT;});
  enemyShot('M','mantis',e=>{e.dir=RIGHT; e.punchFx=.2;});
  enemyShot('A','manta',e=>{e.dir=UP;});
  enemyShot('Y','stingray',e=>{e.state='hunt'; e.dir=UP;});
  enemyShot('F','lionfish',e=>{e.ph='flare'; e.dir=RIGHT;},[5.6,4.6,3.8,3.8]);
  // shark boss
  { const S=custom({name:'x',hint:'',boss:'shark',waves:[],map:base('B')}); const e=S.boss.e; e.dir=RIGHT; G.tick(.05); crop('bruiser',5.9,5.2,3.2,2.3,300); }
  // queen boss
  { const m=base('.'); m[1]='#.....BBB.....#'; m[2]='#.....BBB.....#'; const S=custom({name:'x',hint:'',boss:'queen',waves:[],map:m}); G.tick(.05); crop('queen',3.5,0,8,4.6,360); }
  // nori
  { const S=custom({name:'x',hint:'',waves:['krill'],map:base('N')}); S.friends[0].dir=RIGHT; S.friends[0].shieldCd=0; G.tick(.05); crop('nori',6.3,5.2,2.4,2.2,240); }
  // fish
  G.setTwoP(true);
  { const S=custom({name:'x',hint:'',waves:['krill'],map:base('.',{'1,11':'.','13,11':'.','6,6':'P','8,6':'Q'})}); S.players[0].face=RIGHT; S.players[1].face=LEFT; G.tick(.05); crop('killi_milli',5.4,5.0,4.2,2.3,360);
    crop('killi',5.55,5.0,1.9,1.9,200); crop('milli',7.55,5.0,1.9,1.9,200);
    S.players[0].puff=.65; G.draw(); crop('killi_puffed',5.45,4.95,2.1,2.1,200);
    S.players[0].puff=0; S.players[1].shield=true; crop('milli_shield',7.45,4.95,2.1,2.1,200); }
  G.setTwoP(false);
  // snacks
  for(const t of ['krill','pearl','grape','star','shrimp','moon','clam']){ const m=base('1'); m[1]='#.............#'; const S=custom({name:'x',hint:'',waves:[t],map:m});
    const s=S.snacks[0]; s.born=-9; if(t==='clam'){s.lid=1;s.open=true;} if(t==='moon') s.t=9; if(t==='shrimp') s.dir=RIGHT; G.tick(.05); crop('snack_'+t,6.65,5.55,1.7,1.7,150); }
  // terrain tiles
  const tile=(ch,name,extra={})=>{ const m=base(ch,extra); const S=custom({name:'x',hint:'',waves:['krill'],map:m}); G.tick(.4); crop(name,6.55,5.55,1.9,1.9,150); };
  tile('c','tile_coral'); tile('#','tile_rock'); tile('h','tile_vent'); tile('R','tile_current'); tile('x','tile_urchin'); tile('k','tile_kelp');
  // level thumbnails (2P so both fish show)
  G.setTwoP(true);
  for(let i=0;i<18;i++){ G.loadLevel(i); G.tick(.6); G.draw(); const o=createCanvas(600,520); o.getContext('2d').drawImage(cv,0,0,o.width,o.height); fs.writeFileSync(`${IMG}/level${i+1}.png`,o.toBuffer('image/png')); }
  // dump level data
  fs.writeFileSync(require('path').join(__dirname, 'levels.json'), JSON.stringify(G.LEVELS.slice(0,18)));
  console.log('errors:',errs.length?errs.slice(0,3):'none'); process.exit(0);
},400);
