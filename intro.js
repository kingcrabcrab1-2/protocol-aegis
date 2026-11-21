/* PROTOCOL : AEGIS — NRS original cinematic signal corridor. No third-party footage/audio. */
(() => {
'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const el=(tag,cls,parent,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;if(parent)parent.appendChild(n);return n;};
const root=el('div','aegis-intro nrs-cinema');root.setAttribute('role','dialog');root.setAttribute('aria-label','NRS 시스템 연결');
const canvas=el('canvas','nrs-cinema-canvas',root),ctx=canvas.getContext('2d',{alpha:false});
const film=el('div','nrs-film',root),sweep=el('div','nrs-sweep',root);
const terminal=el('section','nrs-terminal',root);
el('div','nrs-terminal-head',terminal,'SYSTEM BOOT / ARCHIVED TERMINAL');
const log=el('div','nrs-terminal-log',terminal);log.setAttribute('aria-live','off');
const status=el('div','nrs-status',root,'NRS  //  INTER-TIMELINE RELAY');
const skip=el('button','ai-skip',root,'SKIP ▸▸');skip.type='button';
el('div','ai-sign',root,'written by. hamge');
const gate=el('div','ai-gate',root),gateFrame=el('div','ai-gate-frame',gate),bar=el('div','ai-gate-titlebar',gateFrame);
el('span','',bar,'NRS // ACCESS CONTROL');el('span','',bar,'SYS.WARNING / 001');
const body=el('div','ai-gate-body',gateFrame);
el('div','ai-gate-kicker',body,'N.R.S / 타임라인 간 시스템 연결 시도중 ···');
el('h2','',body,'존재 접근 확인');
el('p','ai-gate-message',body,'존재성을 헌납하였기 때문에\n감각 이상 현상이 일어날 수 있습니다.\n앞으로 나아가시겠습니까?');
const go=el('button','ai-gate-button',body,'앞으로 나아간다.');go.type='button';
const silent=el('button','ai-gate-muted',body,'감각 활성화를 끕니다.');silent.type='button';
el('div','ai-gate-footer',gateFrame,'INTER-TIMELINE RELAY   //   SIGNAL UNSTABLE');
const artifacts=el('div','ai-gate-artifacts',gate);artifacts.setAttribute('aria-hidden','true');
const glyphs=['// 0x00','▒▒ ERROR','NRS_██','[ !! ]','010101','SIGNAL LOST','△ / ∅','ERR_07','⟟ ⟐ ⌁','SYNC ?','▒░▒░','[ RECONNECT ]'];
for(let i=0;i<20;i++){const n=el('span','',artifacts,glyphs[i%glyphs.length]);n.style.left=(3+i*37%92)+'%';n.style.top=(4+i*29%89)+'%';n.style.animationDelay=(-i*.37)+'s';n.style.animationDuration=(2.4+i%6*.65)+'s';}
el('div','ai-gate-flash',gate).setAttribute('aria-hidden','true');
let onDone=null,dead=false,active=false,raf=0,timers=[],audio=null,master=null,startAt=0,w=0,h=0,dpr=1;
const later=(fn,ms)=>{const t=setTimeout(fn,ms);timers.push(t);return t;};
function resize(){dpr=Math.min(devicePixelRatio||1,1.7);w=innerWidth;h=innerHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
function rand(i,s=1){let v=Math.sin(i*127.1+s*311.7)*43758.5453;return v-Math.floor(v);}
/* Original procedural computation-failure artwork: no source footage or sampled artwork. */
const glyphSet='01B8#%/\\|:;<>[]{}=+*?NRS';
function hash(n){const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v);}
function draw(now){
 if(dead)return;raf=requestAnimationFrame(draw);if(!active)return;
 const t=(now-startAt)/1000,phase=Math.min(1,t/8.5),cx=w*.62,cy=h*.52,unit=Math.min(w,h),frame=Math.floor(t*18);
 const pulse=Math.pow(Math.max(0,Math.sin(t*3.4)*Math.sin(t*7.7)),8);
 ctx.fillStyle='#050506';ctx.fillRect(0,0,w,h);
 const halo=ctx.createRadialGradient(cx,cy,unit*.04,cx,cy,unit*.78);
 halo.addColorStop(0,'rgba(68,30,23,.32)');halo.addColorStop(.5,'rgba(18,12,14,.20)');halo.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=halo;ctx.fillRect(0,0,w,h);
 // Precise telemetry scaffold, visibly failing around the central unknown object.
 ctx.save();ctx.lineWidth=.5;
 for(let x=0;x<w;x+=Math.max(24,unit*.052)){ctx.strokeStyle='rgba(214,110,77,.055)';ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
 for(let y=0;y<h;y+=Math.max(24,unit*.052)){ctx.strokeStyle='rgba(214,110,77,.055)';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
 const size=unit*(w<700?.32:.43),stretch=1.12,rows=w<700?72:105,cols=w<700?62:100;
 ctx.font=`${Math.max(7,unit*.0095)}px monospace`;ctx.textBaseline='middle';
 // A volumetric signal apparition made from glyphs; never a particle sphere or tunnel.
 for(let iy=0;iy<rows;iy++){
  const ny=iy/(rows-1)*2-1,y=cy+ny*size*1.17;
  for(let ix=0;ix<cols;ix++){
   const nx=ix/(cols-1)*2-1;
   const shape=(nx*nx/(.66+.08*Math.sin(ny*7+t*.7))**2 + (ny+.06*Math.sin(nx*9+t*.8))**2/.96);
   const seam=.19*Math.sin(nx*12+ny*8+t*1.3)+.09*Math.sin(ny*24-t*2.3);
   if(shape+seam>1.05||hash(ix*41+iy*17)>Math.max(.25,.91-shape*.23))continue;
   const drift=Math.sin(ny*16+t*2.2)*unit*.012+Math.sin(ny*39-t*3.4)*unit*.004;
   const broken=(hash(iy*19+frame*13)>.86)?(hash(iy*7+frame)*2-1)*unit*.13:0;
   const x=cx+nx*size*stretch+drift+broken;
   const shade=Math.max(0,1-shape*.72),random=hash(ix*31+iy*71+frame*3);
   const orange=random>.89,cyan=random<.075;
   ctx.fillStyle=orange?`rgba(255,121,70,${.20+shade*.60})`:cyan?`rgba(109,226,225,${.13+shade*.38})`:`rgba(224,212,196,${.10+shade*.48})`;
   ctx.fillText(glyphSet[(Math.floor(hash(ix*7+iy*11+Math.floor(t*2)*23)*glyphSet.length))],x,y);
  }
 }
 // Glitch panels: sliced data blocks and displaced readout columns.
 const faults=phase<.16?2:phase<.73?9:5;
 for(let j=0;j<faults;j++){
  const seed=j*137+Math.floor(t*(j%3===0?6:2))*31;
  const x=cx+(hash(seed+1)-.5)*size*2.3,y=cy+(hash(seed+2)-.5)*size*2.4;
  const bw=unit*(.035+hash(seed+3)*.19),bh=unit*(.012+hash(seed+4)*.13);
  const a=(.06+hash(seed+5)*.19)*(phase<.12?phase/.12:1);
  ctx.fillStyle=j%4===0?`rgba(106,229,222,${a*.38})`:j%3===0?`rgba(248,238,224,${a*.45})`:`rgba(224,71,49,${a})`;
  ctx.fillRect(x,y,bw,bh);
  ctx.fillStyle=`rgba(255,198,154,${a*2})`;ctx.font=`${Math.max(7,unit*.010)}px monospace`;
  for(let k=0;k<Math.min(13,Math.floor(bh/11));k++){
   const str=Array.from({length:Math.min(23,Math.floor(bw/7))},(_,i)=>glyphSet[Math.floor(hash(seed+i*3+k*9+frame/3)*glyphSet.length)]).join('');
   ctx.fillText(str,x+3,y+9+k*11);
  }
 }
 // Spectral waveform slices; tearing is concentrated in the subject, not the readable log.
 for(let i=0;i<27;i++){
  const q=i/27,y=cy+(q-.5)*size*2.4,amp=Math.sin(q*39+t*2.6)*Math.cos(q*17-t*1.3);
  const length=size*(.20+.85*Math.abs(amp))*(.45+hash(i+frame*.3)*.55);
  const shift=Math.sin(q*47+t*4)*unit*.055;
  ctx.fillStyle=i%9===0?'rgba(104,226,226,.30)':i%4===0?'rgba(255,238,215,.30)':'rgba(238,82,51,.25)';
  ctx.fillRect(cx+shift+(i%2?-.55:.12)*size,y,length,hash(i*9+frame)*2+.5);
 }
 // Oscillating contour and calibration marks, like an unstable scientific observation.
 ctx.strokeStyle='rgba(255,133,83,.26)';ctx.lineWidth=.75;ctx.beginPath();
 for(let i=0;i<170;i++){const a=i/169*Math.PI*2,r=unit*(.29+.022*Math.sin(a*9+t*2)+.016*Math.sin(a*27-t*4));
  const x=cx+Math.cos(a)*r*.94,y=cy+Math.sin(a)*r*1.25;if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
 ctx.stroke();
 for(let k=-4;k<=4;k++){
  const y=cy+k*unit*.084;ctx.strokeStyle='rgba(255,191,143,.18)';ctx.beginPath();ctx.moveTo(cx-unit*.018,y);ctx.lineTo(cx+unit*.018,y);ctx.stroke();
 }
 // Sudden horizontal raster corruption and rare broad overexposure.
 if(!reduce&&pulse>.24){for(let i=0;i<13;i++){const y=hash(i*33+frame)*h;ctx.fillStyle=i%4===0?`rgba(127,245,238,${pulse*.19})`:`rgba(255,113,73,${pulse*.23})`;ctx.fillRect(0,y,w,1+hash(i+frame)*8);}}
 if(!reduce&&hash(frame*19)>.975){const y=hash(frame*71)*h;ctx.fillStyle='rgba(255,232,217,.12)';ctx.fillRect(0,y,w,Math.max(8,h*.09));}
 ctx.restore();
 const vignette=ctx.createRadialGradient(w*.54,h*.5,unit*.13,w*.54,h*.5,Math.max(w,h)*.78);
 vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(0,0,0,.70)');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
}
const lines=[
'NRS / CENTRAL DATA AUTHORITY','GARDINERS ISLAND / ARCHIVED TERMINAL','PROTOCOL : AEGIS',
'BOOT SEQUENCE INITIALIZED...','ACCESSING...','VERIFYING UNKNOWN TIMELINE...',
'SACRIFICE REQUIREMENT : REVOKED','GROUP CONSCIOUSNESS SYNC : STABLE',
'INTER-TIMELINE RELAY : ONLINE','SIGNAL NOISE : ACCEPTABLE',
'MEMORY CHANNELS : ONLINE','TIMELINE BRANCH ???? : FOUND',
'RECONSTRUCTING ARCHIVE INDEX','ARCHIVE FRAGMENT 001 : RESTORED',
'TRANSMISSION RECEIVED','INITIALIZING SENSORY ARRAY',
'CONSCIOUSNESS SYNC : STABLE','NRS AUTHORIZATION CONFIRMED',
'ANOMALY DETECTED / RECHECKING','ACCESS PERMISSION : PENDING',
'CONNECTING INTER-TIMELINE RELAY','LOADING ARCHIVED RECORDS',
'ARCHIVE INTEGRITY : 99.8%','TIMELINE CONVERGENCE DETECTED',
'ACCESS PERMISSION : GRANTED','NRS / ARCHIVE CONNECTION ESTABLISHED'];
function appendLine(i){if(dead)return;const n=el('div','nrs-line',log,lines[i%lines.length]);if(i%7===0)n.classList.add('nrs-line-bright');if(i%11===0)n.classList.add('nrs-line-fault');while(log.children.length>32)log.firstChild.remove();log.scrollTop=log.scrollHeight;}
function audioStart(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=new AC();master=audio.createGain();master.gain.value=.12;const lp=audio.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1100;master.connect(lp);lp.connect(audio.destination);
 const t=audio.currentTime+.05;
 const tone=(freq,delay,dur,gain,detune=0)=>{const osc=audio.createOscillator(),env=audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,t+delay);osc.detune.value=detune;env.gain.setValueAtTime(.0001,t+delay);env.gain.linearRampToValueAtTime(gain,t+delay+Math.min(1.6,dur*.35));env.gain.exponentialRampToValueAtTime(.0001,t+delay+dur);osc.connect(env);env.connect(master);osc.start(t+delay);osc.stop(t+delay+dur+.1);};
 tone(110,0,7,.23);tone(164.81,.3,7,.13);tone(220,1.2,6,.11,3);tone(329.63,2.4,5,.06,-4);tone(440,4.6,3,.045);
 }catch(e){audio=null;}}
function begin(withAudio){if(active||dead)return;active=true;gate.classList.add('hidden');startAt=performance.now();terminal.classList.add('on');status.classList.add('on');if(withAudio)audioStart();
 if(reduce){lines.forEach((_,i)=>appendLine(i));later(()=>finish(),2200);return;}
 let i=0;const pump=()=>{if(dead)return;appendLine(i++);if(i<64)later(pump,i<9?170:i<42?90:65);};pump();
 later(()=>{root.classList.add('nrs-final-flare');status.textContent='NRS // ARCHIVE CONNECTION ESTABLISHED';},7200);
 later(()=>finish(),8500);
}
function finish(){if(dead)return;dead=true;timers.forEach(clearTimeout);cancelAnimationFrame(raf);removeEventListener('resize',resize);try{localStorage.setItem('aegis_intro_seen','1');}catch(e){}if(audio){audio.close().catch(()=>{});audio=null;}root.classList.add('out');later(()=>root.remove(),800);const cb=onDone;onDone=null;if(cb){try{cb();}catch(e){console.error('NRS archive transition failed:',e);document.getElementById('boot')?.classList.add('hidden');document.getElementById('mainApp')?.classList.remove('hidden');}}}
go.addEventListener('click',()=>begin(true));silent.addEventListener('click',finish);skip.addEventListener('click',finish);
addEventListener('keydown',e=>{if(!dead&&e.key==='Escape')finish();});
window.AegisIntro={start(cb){onDone=cb;document.body.appendChild(root);resize();addEventListener('resize',resize);raf=requestAnimationFrame(draw);go.focus({preventScroll:true});}};
})();
