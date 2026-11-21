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
  const telemetry=document.createElement('aside');telemetry.className='nrs-telemetry';telemetry.setAttribute('aria-label','NRS 관측 상태 (연출)');
  telemetry.innerHTML='<div class="nrs-telemetry-title">NRS // TELEMETRY FEED <span class="nrs-live-dot">●</span></div><div class="nrs-telemetry-status">수신 상태 양호 <span>RELAY / STABLE</span></div><div class="nrs-telemetry-lines" aria-live="off"><div>SYNC STATUS <b>NOMINAL</b></div><div>ARCHIVE LINK <b>VERIFIED</b></div><div>NOISE LEVEL <b>LOW</b></div></div><div class="nrs-telemetry-last">SYSTEM CHECK / COMPLETE</div>';
  stage.append(telemetry);
  const lines=telemetry.querySelector('.nrs-telemetry-last');
  const log=['RELAY HANDSHAKE / OK','TIMELINE INDEX / SYNC','SIGNAL INTEGRITY / NOMINAL','ARCHIVE LINK / VERIFIED','PACKET CHECK / COMPLETE','CHANNEL STATUS / STABLE'];
  let logIndex=0;
  setInterval(()=>{if(!active())return;lines.textContent=log[logIndex++%log.length];lines.classList.remove('nrs-log-update');void lines.offsetWidth;lines.classList.add('nrs-log-update');},5600);
  // Sync pulse: slow, subtle and not on the message text.
  setInterval(()=>{if(!active()||mobile.matches||!reader.classList.contains('hidden'))return;const el=document.createElement('i');el.className='nrs-sync-pulse';overlay.append(el);setTimeout(()=>el.remove(),2500);},19000);
  // Very rare scan interference; confined to the backdrop, not the reader.
  setInterval(()=>{if(!active()||mobile.matches||!reader.classList.contains('hidden'))return;const el=document.createElement('i');el.className='nrs-interference';overlay.append(el);setTimeout(()=>el.remove(),700);},29000);
  const targetCoords=new WeakMap();
  const cardsObserver=new MutationObserver(()=>{
    records.querySelectorAll('.record').forEach(card=>{
      if(targetCoords.has(card))return;
      const label=document.createElement('span');label.className='nrs-orbit-coordinates';label.setAttribute('aria-hidden','true');card.append(label);
      const enter=()=>{const x=Math.round(parseFloat(card.style.getPropertyValue('--pos-x'))||0),y=Math.round(parseFloat(card.style.getPropertyValue('--pos-y'))||0);label.textContent=`LOC ${x>=0?'+':''}${x} / ${y>=0?'+':''}${y}`;};
      card.addEventListener('pointerenter',enter);card.addEventListener('focus',enter);
      targetCoords.set(card,label);
    });
  });cardsObserver.observe(records,{childList:true});
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
  // Authenticated stamp appears only after the existing decrypt stage finishes.
  const box=reader.querySelector('.reader-box'),messageView=document.getElementById('messageView');
  if(box&&messageView){
    const stamp=document.createElement('div');stamp.className='nrs-verified-stamp';stamp.setAttribute('aria-hidden','true');stamp.textContent='NRS VERIFIED  /  ARCHIVE AUTHENTICATED';box.append(stamp);
    let stampTimer;
    const update=()=>{
      const shown=!reader.classList.contains('hidden')&&!messageView.classList.contains('hidden');
      if(!shown){clearTimeout(stampTimer);stamp.classList.remove('nrs-stamp-show');return;}
      stamp.classList.remove('nrs-stamp-show');void stamp.offsetWidth;
      if(!reduced.matches){stamp.classList.add('nrs-stamp-show');clearTimeout(stampTimer);stampTimer=setTimeout(()=>stamp.classList.remove('nrs-stamp-show'),1500);}
    };
    new MutationObserver(update).observe(messageView,{attributes:true,attributeFilter:['class']});
    new MutationObserver(update).observe(reader,{attributes:true,attributeFilter:['class']});
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
  const coord=document.createElement('div');coord.className='nrs-recalibration';coord.setAttribute('aria-hidden','true');stage.append(coord);
  let triangleTimer,jumpTimer,coordTimer;
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
  let lastAngle='';
  function checkCoordinates(){
    if(!canAnimate()||mobile.matches||!reader.classList.contains('hidden'))return;
    const angle=world.style.getPropertyValue('--scene-angle');
    if(!angle||angle===lastAngle)return;
    lastAngle=angle;
    const number=Number.parseFloat(angle)||0;
    coord.textContent=`COORDINATE RECALIBRATION / ${((number%360)+360)%360 .toFixed?.(1) || (((number%360)+360)%360).toFixed(1)}°`;
    coord.classList.add('active');clearTimeout(coordTimer);
    coordTimer=setTimeout(()=>coord.classList.remove('active'),650);
  }
  // 120ms sampling avoids extra work in the existing orbit animation.
  setInterval(checkCoordinates,120);
})();
