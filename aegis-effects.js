/* PROTOCOL : AEGIS — optional visual effects, no API or archive logic changes. */
(() => {
  'use strict';
  const app = document.getElementById('mainApp');
  const stage = document.querySelector('#mainApp .archive-stage');
  const records = document.getElementById('records');
  const world = document.getElementById('archiveWorld');
  const reader = document.getElementById('reader');
  if (!app || !stage || !records || !world || !reader) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 750px)');
  const canvas = document.createElement('canvas');
  canvas.id = 'nrsEffectsCanvas';
  canvas.setAttribute('aria-hidden', 'true');
  stage.insertBefore(canvas, stage.firstChild);
  const ctx = canvas.getContext('2d');
  let width=0,height=0,dpr=1,prevAngle=null,prevTime=0,lastPulse=0,frameNo=0;
  const trails=[];
  function resize(){
    const r=stage.getBoundingClientRect();width=r.width;height=r.height;
    dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  new ResizeObserver(resize).observe(stage);resize();
  const targets=new WeakSet();
  function enhance(){
    records.querySelectorAll('.record').forEach(card=>{
      if(targets.has(card))return;targets.add(card);
      const mark=document.createElement('span');mark.className='nrs-target';mark.setAttribute('aria-hidden','true');card.append(mark);
    });
  }
  const observer=new MutationObserver(enhance);observer.observe(records,{childList:true});enhance();
  const readerBox=reader.querySelector('.reader-box');
  const decrypt=document.getElementById('decrypt');
  const decryptObserver=new MutationObserver(()=>{
    if(!readerBox||!decrypt)return;
    readerBox.classList.toggle('nrs-decrypting',!reader.classList.contains('hidden')&&!decrypt.classList.contains('hidden'));
  });
  decryptObserver.observe(reader,{attributes:true,attributeFilter:['class']});
  if(decrypt)decryptObserver.observe(decrypt,{attributes:true,attributeFilter:['class']});
  function draw(time){
    requestAnimationFrame(draw);
    if(reduce.matches||mobile.matches||app.classList.contains('hidden')||document.hidden||!ctx)return;
    if(time-prevTime<32)return;
    const dt=Math.min((time-prevTime)||32,80);prevTime=time;frameNo++;
    const angle=parseFloat(world.style.getPropertyValue('--scene-angle'))||0;
    const speed=prevAngle===null?0:Math.min(8,Math.abs(angle-prevAngle));prevAngle=angle;
    ctx.clearRect(0,0,width,height);
    const centerX=width/2,centerY=height/2-34;
    stage.style.setProperty('--nrs-distort-x','50%');
    stage.style.setProperty('--nrs-distort-y',`${100*centerY/Math.max(height,1)}%`);
    // Rotating radar detection: softly illuminate only cards close to the scan direction.
    if(frameNo%4===0){
      const scan=((time/19000*360)%360+360)%360;
      records.querySelectorAll('.record').forEach(card=>{
        const x=parseFloat(card.style.getPropertyValue('--pos-x'))||0;
        const y=parseFloat(card.style.getPropertyValue('--pos-y'))||0;
        const theta=((Math.atan2(y,x)*180/Math.PI+angle+360)%360);
        const delta=Math.abs(((theta-scan+540)%360)-180);
        if(delta<3&&!card.classList.contains('nrs-detected')){
          card.classList.add('nrs-detected');
          card.addEventListener('animationend',()=>card.classList.remove('nrs-detected'),{once:true});
        }
      });
    }
    // Orbital light trails: only a few faint dots, never cover labels.
    if(frameNo%3===0 && speed>.06){
      const radius=Math.min(width*.36,height*.38);
      const a=angle*Math.PI/180;
      trails.push({x:centerX+Math.cos(a)*radius,y:centerY+Math.sin(a)*radius,life:1});
    }
    for(let i=trails.length-1;i>=0;i--){
      const p=trails[i];p.life-=dt/950;
      if(p.life<=0){trails.splice(i,1);continue;}
      ctx.beginPath();ctx.arc(p.x,p.y,1.4*p.life,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,153,85,${.28*p.life})`;ctx.fill();
    }
    if(trails.length>45)trails.splice(0,trails.length-45);

  }
  requestAnimationFrame(draw);
})();

/* NRS observational telemetry extension — presentation only. */
(() => {
  'use strict';
  const app=document.getElementById('mainApp'), stage=app?.querySelector('.archive-stage');
  const reader=document.getElementById('reader'), records=document.getElementById('records');
  if(!app||!stage||!reader||!records)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width: 750px)');
  const active=()=>!app.classList.contains('hidden')&&!reduced.matches&&!document.hidden;
  const overlay=document.createElement('div');overlay.className='nrs-observation-overlay';overlay.setAttribute('aria-hidden','true');stage.append(overlay);
  const iris=document.createElement('div');iris.className='nrs-observatory-iris';iris.setAttribute('aria-hidden','true');stage.append(iris);
  // Telemetry status panel and rotating system log removed at user request.
  // Sync pulse: slow, subtle and not on the message text.
  setInterval(()=>{if(!active()||mobile.matches||!reader.classList.contains('hidden'))return;const el=document.createElement('i');el.className='nrs-sync-pulse';overlay.append(el);setTimeout(()=>el.remove(),2500);},19000);
  // Very rare scan interference; confined to the backdrop, not the reader.
  setInterval(()=>{if(!active()||mobile.matches||!reader.classList.contains('hidden'))return;const el=document.createElement('i');el.className='nrs-interference';overlay.append(el);setTimeout(()=>el.remove(),700);},29000);
  // Per-record coordinate readouts removed at user request.
  function burst(x,y){if(!active()||mobile.matches)return;
    for(let i=0;i<11;i++){const p=document.createElement('i');p.className='nrs-data-particle';p.style.left=x+'px';p.style.top=y+'px';p.style.setProperty('--dx',`${(Math.random()-.5)*130}px`);p.style.setProperty('--dy',`${(Math.random()-.5)*110}px`);overlay.append(p);setTimeout(()=>p.remove(),850);}
  }
  // Link from the clicked record to the core, then absorb small particles.
  records.addEventListener('click',e=>{
    const card=e.target.closest('.record');if(!card||!active()||mobile.matches)return;
    const r=card.getBoundingClientRect(),s=stage.getBoundingClientRect();
    const x=r.left+r.width/2-s.left,y=r.top+r.height/2-s.top;
    const destX=s.width/2,destY=s.height/2;
    const line=document.createElement('i');line.className='nrs-data-relay-line';
    const len=Math.hypot(destX-x,destY-y),ang=Math.atan2(destY-y,destX-x);
    line.style.left=x+'px';line.style.top=y+'px';line.style.width=len+'px';line.style.transform=`rotate(${ang}rad)`;overlay.append(line);
    setTimeout(()=>line.remove(),900);burst(x,y);
  });
  // Display authentication after the message text has finished rendering.
  const messageView=document.getElementById('messageView');
  const messageText=document.getElementById('viewMessage');
  if(messageView&&messageText){
    const stamp=document.createElement('div');
    stamp.className='nrs-verified-stamp';
    stamp.setAttribute('aria-hidden','true');
    stamp.textContent='ARCHIVE AUTHENTICATED';
    messageText.insertAdjacentElement('afterend',stamp);
    let finishTimer=0;
    const hide=()=>{clearTimeout(finishTimer);stamp.classList.remove('nrs-stamp-show');};
    const schedule=()=>{
      hide();
      if(reader.classList.contains('hidden')||messageView.classList.contains('hidden'))return;
      finishTimer=setTimeout(()=>{
        if(!reader.classList.contains('hidden')&&!messageView.classList.contains('hidden')&&messageText.textContent.trim())
          stamp.classList.add('nrs-stamp-show');
      },850);
    };
    new MutationObserver(schedule).observe(messageText,{childList:true,characterData:true,subtree:true});
    new MutationObserver(schedule).observe(messageView,{attributes:true,attributeFilter:['class']});
    new MutationObserver(schedule).observe(reader,{attributes:true,attributeFilter:['class']});
    schedule();
  }
})();

/* Phase 4 — eight optional visual upgrades. Never changes records, API, or archive navigation. */
(() => {
  'use strict';
  const app=document.getElementById('mainApp'),stage=app?.querySelector('.archive-stage');
  const records=document.getElementById('records'),reader=document.getElementById('reader');
  const world=document.getElementById('archiveWorld'),decrypt=document.getElementById('decrypt');
  if(!app||!stage||!records||!reader||!world)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:750px)');
  const canAnimate=()=>!reduced.matches&&!document.hidden&&!app.classList.contains('hidden');
  const depth=document.createElement('div');depth.className='nrs-depth-field';depth.setAttribute('aria-hidden','true');
  stage.insertBefore(depth,stage.firstChild);
  // Ambient packets: fixed low count, CSS animations, no per-frame DOM writes.
  for(let i=0;i<19;i++){
    const packet=document.createElement('i');packet.className='nrs-packet';
    packet.style.left=`${(i*37.1+13)%100}%`;packet.style.top=`${(i*23.7+11)%100}%`;
    packet.style.setProperty('--packet-w',`${5+i%5*2}px`);
    packet.style.setProperty('--packet-time',`${15+i%8*2}s`);
    packet.style.setProperty('--packet-delay',`${-i*1.4}s`);
    packet.style.setProperty('--packet-dx',`${45+i%5*19}px`);
    packet.style.setProperty('--packet-dy',`${-55-i%7*16}px`);
    depth.append(packet);
  }
  stage.addEventListener('pointermove',event=>{
    if(!canAnimate()||mobile.matches||event.pointerType==='touch')return;
    const rect=stage.getBoundingClientRect();
    const x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;
    depth.style.setProperty('--nrs-parallax-x',`${(x*13).toFixed(1)}px`);
    depth.style.setProperty('--nrs-parallax-y',`${(y*9).toFixed(1)}px`);
  },{passive:true});
  stage.addEventListener('pointerleave',()=>{depth.style.setProperty('--nrs-parallax-x','0px');depth.style.setProperty('--nrs-parallax-y','0px');});
  const decorated=new WeakSet();
  function decorateCards(){records.querySelectorAll('.record').forEach(card=>{
    if(decorated.has(card))return;decorated.add(card);
    const sheen=document.createElement('i');sheen.className='nrs-glass-sheen';sheen.setAttribute('aria-hidden','true');card.append(sheen);
  });}
  new MutationObserver(decorateCards).observe(records,{childList:true});decorateCards();
  const box=reader.querySelector('.reader-box');
  if(box){
    const ring=document.createElement('i');ring.className='nrs-decrypt-ring';ring.setAttribute('aria-hidden','true');box.append(ring);
    let openTimer;
    new MutationObserver(()=>{
      if(reader.classList.contains('hidden')){clearTimeout(openTimer);box.classList.remove('nrs-materializing');return;}
      if(!canAnimate())return;
      box.classList.remove('nrs-materializing');void box.offsetWidth;box.classList.add('nrs-materializing');
      clearTimeout(openTimer);openTimer=setTimeout(()=>box.classList.remove('nrs-materializing'),470);
    }).observe(reader,{attributes:true,attributeFilter:['class']});
  }
  const triangle=document.createElementNS('http://www.w3.org/2000/svg','svg');
  triangle.setAttribute('class','nrs-triangulation');triangle.setAttribute('aria-hidden','true');stage.append(triangle);
  const jump=document.createElement('div');jump.className='nrs-sector-jump';jump.setAttribute('aria-hidden','true');stage.append(jump);
  let triangleTimer,jumpTimer;
  records.addEventListener('click',event=>{
    const card=event.target.closest('.record');
    if(!card||!canAnimate()||mobile.matches)return;
    const candidates=[...records.querySelectorAll('.record')].filter(node=>node!==card);
    if(candidates.length<2)return;
    const sr=stage.getBoundingClientRect();
    const point=node=>{const r=node.getBoundingClientRect();return [r.left+r.width/2-sr.left,r.top+r.height/2-sr.top];};
    const p=[point(card),point(candidates[Math.floor(candidates.length/3)]),point(candidates[Math.floor(candidates.length*2/3)])];
    triangle.replaceChildren();triangle.setAttribute('viewBox',`0 0 ${sr.width} ${sr.height}`);
    for(let i=0;i<3;i++){
      const line=document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1',p[i][0]);line.setAttribute('y1',p[i][1]);
      line.setAttribute('x2',p[(i+1)%3][0]);line.setAttribute('y2',p[(i+1)%3][1]);triangle.append(line);
    }
    clearTimeout(triangleTimer);triangleTimer=setTimeout(()=>triangle.replaceChildren(),1050);
  });
  // Existing pager is created dynamically by script.js. Observe clicks without intercepting them.
  document.addEventListener('click',event=>{
    const button=event.target.closest('#nrsArchivePager button');
    if(!button||button.disabled||!canAnimate())return;
    jump.classList.remove('active');void jump.offsetWidth;jump.classList.add('active');
    clearTimeout(jumpTimer);jumpTimer=setTimeout(()=>jump.classList.remove('active'),680);
  },true);
})();


/* PHASE 5 — additive effects. No archive data, pager or admin mutations. */
(() => {
  'use strict';
  const app=document.getElementById('mainApp'),stage=app?.querySelector('.archive-stage');
  const records=document.getElementById('records'),reader=document.getElementById('reader');
  const decrypt=document.getElementById('decrypt'),messageView=document.getElementById('messageView');
  const title=document.getElementById('viewTitle'),search=document.getElementById('searchInput');
  if(!app||!stage||!records||!reader)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:750px)');
  const enabled=()=>!reduced.matches&&!document.hidden&&!app.classList.contains('hidden');
  const timers=new Set();
  const later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);return id;};
  const layer=document.createElement('div');layer.className='nrs-p5-layer';layer.setAttribute('aria-hidden','true');stage.append(layer);
  const grid=document.createElement('div');grid.className='nrs-p5-grid';grid.setAttribute('aria-hidden','true');layer.append(grid);
  let gridTimer;
  function reconstruct(){
    if(!enabled()||mobile.matches)return;
    grid.classList.remove('nrs-p5-rebuild');void grid.offsetWidth;grid.classList.add('nrs-p5-rebuild');
    clearTimeout(gridTimer);gridTimer=later(()=>grid.classList.remove('nrs-p5-rebuild'),750);
  }
  document.addEventListener('click',e=>{
    if(e.target.closest('#nrsArchivePager button:not(:disabled)'))reconstruct();
  },true);
  let searchTimer;
  search?.addEventListener('input',()=>{
    clearTimeout(searchTimer);searchTimer=later(reconstruct,280);
  },{passive:true});
  // Beacon is attached only to already flagged records; it never modifies their data.
  const marked=new WeakSet();
  function decorate(){
    records.querySelectorAll('.record').forEach(card=>{
      if(marked.has(card))return;marked.add(card);
      if(card.classList.contains('pinned')||card.querySelector('.pin-label')){
        const beacon=document.createElement('i');beacon.className='nrs-p5-beacon';
        beacon.setAttribute('aria-hidden','true');card.append(beacon);
      }
    });
  }
  new MutationObserver(decorate).observe(records,{childList:true});decorate();
  // Echo: short, bounded, only on actual scene rotation. Canvas overlay, no cloned cards.
  const echo=document.createElement('canvas');echo.className='nrs-p5-echo';echo.setAttribute('aria-hidden','true');layer.append(echo);
  const context=echo.getContext('2d');let cw=0,ch=0,scale=1,previousAngle=null,lastEcho=0;
  function resize(){if(!context)return;const r=stage.getBoundingClientRect();cw=r.width;ch=r.height;scale=Math.min(devicePixelRatio||1,1.5);echo.width=Math.max(1,Math.round(cw*scale));echo.height=Math.max(1,Math.round(ch*scale));context.setTransform(scale,0,0,scale,0,0);}
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(resize).observe(stage);resize();
  function drawEcho(now){
    requestAnimationFrame(drawEcho);
    if(!context||!enabled()||mobile.matches||!reader.classList.contains('hidden'))return;
    if(now-lastEcho<90)return;lastEcho=now;
    const world=document.getElementById('archiveWorld');
    const angle=parseFloat(world?.style.getPropertyValue('--scene-angle'))||0;
    context.clearRect(0,0,cw,ch);
    if(previousAngle===null){previousAngle=angle;return;}
    const moving=Math.abs(angle-previousAngle)>.13;previousAngle=angle;
    if(!moving)return;
    const stageRect=stage.getBoundingClientRect();
    const cards=records.querySelectorAll('.record');
    let shown=0;
    for(const card of cards){
      if(shown>=9)break;
      const r=card.getBoundingClientRect();
      if(r.right<stageRect.left||r.left>stageRect.right||r.bottom<stageRect.top||r.top>stageRect.bottom)continue;
      const x=r.left-stageRect.left,y=r.top-stageRect.top;
      context.strokeStyle='rgba(255,157,88,.16)';context.lineWidth=.8;
      context.strokeRect(x-3,y+2,r.width,r.height);shown++;
    }
    later(()=>{if(context)context.clearRect(0,0,cw,ch);},220);
  }
  if(context)requestAnimationFrame(drawEcho);
  // Clearance text is decorative; no real authorization or access check is implied.
  const box=reader.querySelector('.reader-box');
  if(!box||!decrypt||!messageView||!title)return;
  const clearance=document.createElement('div');clearance.className='nrs-p5-clearance';
  clearance.setAttribute('aria-hidden','true');clearance.textContent='NRS // CLEARANCE SCAN  ·  ARCHIVE ACCESS VERIFIED';box.append(clearance);
  let clearanceTimer=0,decodeTimer=0,token=0;
  function restoreTitle(){
    const original=title.dataset.nrsP5Original;
    if(original!==undefined){title.textContent=original;delete title.dataset.nrsP5Original;}
  }
  function onReaderState(){
    if(reader.classList.contains('hidden')){
      token++;clearTimeout(clearanceTimer);clearTimeout(decodeTimer);clearance.classList.remove('active');restoreTitle();return;
    }
    if(!enabled())return;
    if(!messageView.classList.contains('hidden'))return;
    clearance.classList.remove('active');void clearance.offsetWidth;clearance.classList.add('active');
    clearTimeout(clearanceTimer);clearanceTimer=later(()=>clearance.classList.remove('active'),1050);
  }
  new MutationObserver(onReaderState).observe(reader,{attributes:true,attributeFilter:['class']});
  function onMessageState(){
    if(messageView.classList.contains('hidden')||reader.classList.contains('hidden')){
      token++;clearTimeout(decodeTimer);restoreTitle();return;
    }
    if(!enabled())return;
    restoreTitle();
    const original=title.textContent||'';
    if(!original)return;
    title.dataset.nrsP5Original=original;
    const run=++token,chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%';
    const steps=mobile.matches?3:7;
    let step=0;
    const render=()=>{
      if(run!==token||reader.classList.contains('hidden'))return;
      if(step>=steps){restoreTitle();return;}
      const visible=Math.floor(original.length*(step+1)/steps);
      title.textContent=[...original].map((ch,i)=>i<visible||/\s/.test(ch)?ch:chars[(i*13+step*7)%chars.length]).join('');
      step++;decodeTimer=later(render,mobile.matches?42:48);
    };
    render();
  }
  new MutationObserver(onMessageState).observe(messageView,{attributes:true,attributeFilter:['class']});
})();


/* PHASE 6 — additive optical effects, no changes to archive state or navigation. */
(() => {
  'use strict';
  const app=document.getElementById('mainApp');
  const stage=app?.querySelector('.archive-stage');
  const records=document.getElementById('records');
  const reader=document.getElementById('reader');
  const box=reader?.querySelector('.reader-box');
  const core=stage?.querySelector('.radar-core');
  if(!app||!stage||!records||!reader||!box||!core)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width: 750px)');
  const running=()=>!reduced.matches&&!document.hidden&&!app.classList.contains('hidden');
  const optical=document.createElement('i');optical.className='nrs-p6-optical';optical.setAttribute('aria-hidden','true');box.append(optical);
  const circuit=document.createElement('i');circuit.className='nrs-p6-circuit';circuit.setAttribute('aria-hidden','true');box.append(circuit);
  const expansion=document.createElement('i');expansion.className='nrs-p6-expansion';expansion.setAttribute('aria-hidden','true');stage.append(expansion);
  let readerTimer=0,expansionTimer=0,reconnectTimer=0,lastInteraction=performance.now(),idle=false;
  const replay=(el,cls)=>{el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);};
  const clearReader=()=>{clearTimeout(readerTimer);optical.classList.remove('active');circuit.classList.remove('active');};
  // Observe only open/close class transitions; leave decryption and authentication stamp untouched.
  let wasOpen=!reader.classList.contains('hidden');
  new MutationObserver(()=>{
    const open=!reader.classList.contains('hidden');
    if(open===wasOpen)return;wasOpen=open;
    clearReader();
    if(open&&running()){
      replay(optical,'active');replay(circuit,'active');
      readerTimer=setTimeout(clearReader,1250);
    }
  }).observe(reader,{attributes:true,attributeFilter:['class']});
  // Single delegated listener supports cards added by search, pagination, and live data updates.
  let hoverCard=null,hoverPending=false,hoverX=50,hoverY=50;
  records.addEventListener('pointermove',event=>{
    if(!running()||mobile.matches||event.pointerType==='touch')return;
    const card=event.target.closest('.record');if(!card)return;
    const rect=card.getBoundingClientRect();hoverCard=card;
    hoverX=Math.max(0,Math.min(100,(event.clientX-rect.left)/Math.max(1,rect.width)*100));
    hoverY=Math.max(0,Math.min(100,(event.clientY-rect.top)/Math.max(1,rect.height)*100));
    if(hoverPending)return;hoverPending=true;
    requestAnimationFrame(()=>{hoverPending=false;if(!hoverCard?.isConnected)return;
      hoverCard.style.setProperty('--nrs-p6-x',hoverX+'%');hoverCard.style.setProperty('--nrs-p6-y',hoverY+'%');
    });
  },{passive:true});
  records.addEventListener('pointerout',event=>{
    const card=event.target.closest('.record');
    if(card&&!card.contains(event.relatedTarget)){card.style.removeProperty('--nrs-p6-x');card.style.removeProperty('--nrs-p6-y');if(hoverCard===card)hoverCard=null;}
  },{passive:true});
  // The core is already present. No pointer blocking and no alteration of its normal behavior.
  core.addEventListener('click',()=>{
    if(!running()||mobile.matches||!reader.classList.contains('hidden'))return;
    replay(expansion,'active');clearTimeout(expansionTimer);
    expansionTimer=setTimeout(()=>expansion.classList.remove('active'),1100);
  });
  // Reconnect after genuine idle time, not on every movement. Ignore mobile and reader state.
  const reconnect=()=>{
    const now=performance.now();
    if(!idle&&now-lastInteraction>60000)idle=true;
    if(idle&&running()&&!mobile.matches&&reader.classList.contains('hidden')){
      replay(core,'nrs-p6-reconnect');clearTimeout(reconnectTimer);
      reconnectTimer=setTimeout(()=>core.classList.remove('nrs-p6-reconnect'),950);
    }
    idle=false;lastInteraction=now;
  };
  ['pointerdown','keydown','wheel'].forEach(type=>document.addEventListener(type,reconnect,{passive:true}));
  // Throttle pointer movement to avoid per-frame work while still detecting resumed activity.
  let lastPointer=0;
  document.addEventListener('pointermove',()=>{
    const now=performance.now();if(now-lastPointer<800)return;lastPointer=now;reconnect();
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{lastInteraction=performance.now();idle=false;});
})();
