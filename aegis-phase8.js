/* NRS PHASE 8 — visual-only, event-driven. Never modifies archive records. */
(()=>{'use strict';
const app=document.getElementById('mainApp'),stage=app?.querySelector('.archive-stage'),core=stage?.querySelector('.radar-core'),records=document.getElementById('records'),reader=document.getElementById('reader'),box=reader?.querySelector('.reader-box'),message=document.getElementById('messageView');
if(!app||!stage||!core||!records||!reader||!box||!message)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:750px)');
const allowed=k=>window.NRSVisualSettings?.enabled(k)!==false;
const ready=()=>!reduced.matches&&!document.hidden&&!app.classList.contains('hidden');
const make=(parent,cls)=>{const el=document.createElement('div');el.className='nrs-p8 '+cls;el.setAttribute('aria-hidden','true');parent.append(el);return el};
const singularity=make(stage,'nrs-p8-singularity'),overdrive=make(stage,'nrs-p8-overdrive'),fracture=make(stage,'nrs-p8-fracture'),shock=make(stage,'nrs-p8-shock'),cube=make(box,'nrs-p8-cube'),gate=make(box,'nrs-p8-gate');
const all=[singularity,overdrive,fracture,shock,cube,gate];const timers=new Map();
function stop(el){clearTimeout(timers.get(el));timers.delete(el);el.classList.remove('active')}
function play(el,ms){stop(el);void el.offsetWidth;el.classList.add('active');timers.set(el,setTimeout(()=>stop(el),ms))}
function stopAll(){all.forEach(stop)}
const center=(el,x,y)=>{el.style.left=x+'px';el.style.top=y+'px'};
const corePosition=()=>{const a=core.getBoundingClientRect(),b=stage.getBoundingClientRect();return [a.left+a.width/2-b.left,a.top+a.height/2-b.top]};
let lastCoreClick=0;
core.addEventListener('click',()=>{
 if(!ready()||mobile.matches||!reader.classList.contains('hidden'))return;
 const now=performance.now(),p=corePosition();
 if(now-lastCoreClick<450){stop(overdrive);if(allowed('p8-singularity')){center(singularity,...p);play(singularity,2300)}}
 else if(allowed('p8-overdrive')){stop(singularity);center(overdrive,...p);play(overdrive,1550)}
 lastCoreClick=now;
});
records.addEventListener('click',e=>{
 const card=e.target.closest('.record');if(!card||!ready()||!allowed('p8-shock'))return;
 const a=card.getBoundingClientRect(),b=stage.getBoundingClientRect();center(shock,a.left+a.width/2-b.left,a.top+a.height/2-b.top);play(shock,mobile.matches?550:880);
},true);
let wasOpen=!reader.classList.contains('hidden');
new MutationObserver(()=>{
 const open=!reader.classList.contains('hidden');if(open===wasOpen)return;wasOpen=open;
 stop(cube);stop(gate);
 if(!open){stopAll();return}
 if(!ready())return;
 // Gate first, cube after it; never cover the text or authenticated stamp.
 if(allowed('p8-gate'))play(gate,mobile.matches?650:1050);
 if(allowed('p8-cube')&&!mobile.matches){const delay=allowed('p8-gate')?330:0;const id=setTimeout(()=>{if(!reader.classList.contains('hidden')&&ready()&&allowed('p8-cube'))play(cube,1250)},delay);timers.set(cube,id)}
}).observe(reader,{attributes:true,attributeFilter:['class']});
let fractureTimer=0;
function scheduleFracture(){clearTimeout(fractureTimer);fractureTimer=setTimeout(()=>{
 if(ready()&&!mobile.matches&&reader.classList.contains('hidden')&&allowed('p8-fracture')&&!singularity.classList.contains('active'))play(fracture,1700);
 scheduleFracture();
 },26000)}
scheduleFracture();
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAll();clearTimeout(fractureTimer)}else scheduleFracture()});
window.addEventListener('pagehide',()=>{stopAll();clearTimeout(fractureTimer)},{once:true});
})();
