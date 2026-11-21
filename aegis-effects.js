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
  const wave = document.createElementNS('http://www.w3.org/2000/svg','svg');
  wave.setAttribute('id','nrsSignalWave');
  wave.setAttribute('viewBox','0 0 156 32');
  wave.setAttribute('aria-hidden','true');
  const path = document.createElementNS('http://www.w3.org/2000/svg','path');
  wave.append(path);app.append(wave);
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
    // Independent low-amplitude telemetry waveform.
    if(frameNo%2===0){
      let d='';for(let x=0;x<=156;x+=3){
        const envelope=Math.pow(Math.sin(Math.PI*x/156),2);
        const y=16+envelope*(3*Math.sin(x*.26+time*.002)+2*Math.sin(x*.52-time*.003));
        d+=`${x?'L':'M'}${x} ${y.toFixed(2)} `;
      }path.setAttribute('d',d);
    }
  }
  requestAnimationFrame(draw);
})();
