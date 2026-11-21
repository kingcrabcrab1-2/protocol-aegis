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
/* An original, animated inter-timeline corridor: warped concentric light ribbons, magnetic filaments and signal faults. */
function draw(now){if(dead)return;raf=requestAnimationFrame(draw);if(!active)return;
 const t=(now-startAt)/1000,cx=w*.56,cy=h*.51,scale=Math.min(w,h),glitch=!reduce&&Math.sin(t*12.1)*Math.sin(t*7.8)>.93;
 ctx.fillStyle='#050302';ctx.fillRect(0,0,w,h);
 const glow=ctx.createRadialGradient(cx,cy,scale*.04,cx,cy,scale*.77);glow.addColorStop(0,'#a64215');glow.addColorStop(.19,'#37170c');glow.addColorStop(.57,'#110907');glow.addColorStop(1,'#030202');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let j=0;j<58;j++){
  const depth=(j/58+t*.27)%1,near=1-depth,r=scale*(.025+Math.pow(near,1.75)*.86);
  const alpha=(.03+.24*Math.pow(near,.7))*(1-Math.pow(depth,6));
  ctx.beginPath();for(let k=0;k<=150;k++){
   const a=k/150*Math.PI*2,warp=1+.14*Math.sin(a*5+t*.57+j*.27)+.07*Math.cos(a*11-t*.32+j);
   const x=cx+Math.cos(a+t*.055)*r*warp*1.35,y=cy+Math.sin(a+t*.055)*r*warp*.78;
   if(k===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }ctx.closePath();ctx.strokeStyle=`rgba(${j%4===0?'255,178,106':'241,92,35'},${alpha})`;ctx.lineWidth=j%7===0?1.6:.65;ctx.stroke();
 }
 for(let j=0;j<110;j++){
  const a=rand(j)*Math.PI*2,offset=rand(j,4)*6.28,inner=.035+rand(j,2)*.11;
  ctx.beginPath();for(let k=0;k<40;k++){
   const z=k/39,depth=(z+t*.065+rand(j,3))%1,r=scale*(inner+Math.pow(depth,2.2)*.95);
   const angle=a+.28*Math.sin(z*8+t*.37+offset)+z*.35;
   const x=cx+Math.cos(angle)*r*1.25,y=cy+Math.sin(angle)*r*.75;
   if(k===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }ctx.strokeStyle=`rgba(255,${80+Math.floor(rand(j,5)*90)},47,${.035+rand(j,6)*.11})`;ctx.lineWidth=.55;ctx.stroke();
 }
 for(let i=0;i<(w<700?190:460);i++){
  const a=rand(i,11)*Math.PI*2,z=(rand(i,12)+t*(.04+rand(i,13)*.11))%1,r=scale*(.025+z*z*.9);
  const x=cx+Math.cos(a+t*.06)*r*1.35,y=cy+Math.sin(a+t*.06)*r*.78;
  ctx.fillStyle=`rgba(255,${105+Math.floor(rand(i,14)*100)},${40+Math.floor(rand(i,15)*55)},${.09+z*.55})`;
  ctx.fillRect(x,y,z> .7?1.5:1,z>.7?1.5:1);
 }
 ctx.restore();
 if(glitch){ctx.fillStyle='rgba(255,110,48,.065)';for(let k=0;k<4;k++)ctx.fillRect(0,rand(k,Math.floor(t*10))*h,w,1+rand(k,31)*5);}
 const vignette=ctx.createRadialGradient(w*.5,h*.5,scale*.1,w*.5,h*.5,Math.max(w,h)*.74);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(0,0,0,.75)');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
}
const lines=[
'NRS / CENTRAL DATA AUTHORITY','GARDINERS ISLAND / ARCHIVED TERMINAL','PROTOCOL : AEGIS',
'BOOT SEQUENCE INITIALIZED...','ACCESSING...','VERIFYING UNKNOWN TIMELINE...',
'SACRIFICE REQUIREMENT : REVOKED','GROUP CONSCIOUSNESS SYNC : STABLE',
'INTER-TIMELINE RELAY : ONLINE','SIGNAL NOISE : ACCEPTABLE',
'MEMORY CHANNELS : ONLINE','TIMELINE BRANCH 008 : FOUND',
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
