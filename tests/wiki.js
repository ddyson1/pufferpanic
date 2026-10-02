const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname, '..', 'wiki', 'index.html'),'utf8');const errs=[];
const dom=new JSDOM(html,{url:'https://example.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.addEventListener('error',e=>errs.push(e.message));}});
const w=dom.window,D=w.document;
setTimeout(()=>{
  for(const i of [5,7,8,14]){ const s=D.querySelector('#level-'+i); console.log('L'+i+':', [...s.querySelectorAll('h3,p')].map(p=>p.textContent.trim()).join(' | ')); }
  const q=D.querySelector('#q'); const t=(v)=>{q.value=v; q.dispatchEvent(new w.Event('input')); return [...D.querySelectorAll('#results a')].map(a=>a.textContent+' -> '+a.getAttribute('href'));};
  console.log('search "manta":', t('manta').slice(0,3)); console.log('search "kelp":', t('kelp').slice(0,3)); t('zzz'); console.log('search "zzz":', D.querySelector('#results').textContent); console.log('search "urchin":', t('urchin').slice(0,2));
  const ids=new Set([...D.querySelectorAll('[id]')].map(e=>e.id)); const broken=[...D.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href').slice(1)).filter(h=>h&&!ids.has(h));
  console.log('broken anchors:', broken.length?[...new Set(broken)]:'none'); console.log('images:', D.querySelectorAll('img').length, 'missing alt:', [...D.querySelectorAll('img')].filter(i=>!i.alt).length);
  console.log('errors:', errs.length?errs:'none'); process.exit(0);
},300);
