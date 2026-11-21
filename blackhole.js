/* NRS original procedural accretion-disk background. No external video or network requests. */
(()=>{
 const canvas=document.getElementById('nrsBlackhole');if(!canvas)return;
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let w=0,h=0,dpr=1,raf=0;
 const rand=(n)=>{let x=Math.sin(n*127.1+73.7)*43758.5453;return x-Math.floor(x)};
 const particles=Array.from({length:1050},(_,i)=>({r:.35+rand(i+2)*.9,a:rand(i+9)*Math.PI*2,s:.3+rand(i+12)*.7,z:rand(i+24),size:.3+rand(i+34)*1.65}));
 const stars=Array.from({length:260},(_,i)=>({x:rand(i+400),y:rand(i+700),s:rand(i+900)*1.3+.2,o:rand(i+1000)*.45+.1}));
 function resize(){dpr=Math.min(devicePixelRatio||1,1.5);w=innerWidth;h=innerHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
 function draw(ms){const t=reduce?0:ms*.000065;ctx.fillStyle='#05070b';ctx.fillRect(0,0,w,h);
  for(const star of stars){ctx.fillStyle=`rgba(255,204,153,${star.o})`;ctx.fillRect(star.x*w,star.y*h,star.s,star.s)}
  const cx=w*(w<700?.53:.54),cy=h*.48,rad=Math.min(w*.48,h*.77,760),ry=rad*.37;
  const glow=ctx.createRadialGradient(cx,cy,rad*.09,cx,cy,rad*1.18);glow.addColorStop(0,'rgba(0,0,0,0)');glow.addColorStop(.28,'rgba(240,109,28,.09)');glow.addColorStop(.58,'rgba(175,67,17,.16)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(cx-rad*1.3,cy-rad,rad*2.6,rad*2);
  ctx.save();ctx.translate(cx,cy);ctx.rotate(-.23);
  // A pair of continuous luminous, tilted accretion streams, composed of independently orbiting particles.
  for(let pass=0;pass<2;pass++){
   for(const p of particles){const a=p.a+t*(.8+p.s*.6)+(pass?Math.PI*.93:0),r=rad*p.r;
    const x=Math.cos(a)*r,y=Math.sin(a)*ry*p.r;
    if(pass===0&&Math.sin(a)>0)continue;
    if(pass===1&&Math.sin(a)<=0)continue;
    const hot=Math.max(0,1-Math.abs(p.r-.65)*1.5),alpha=(.08+.52*p.z)*(.45+.55*hot);
    ctx.fillStyle=`rgba(${Math.round(236+19*hot)},${Math.round(94+93*hot)},${Math.round(27+82*hot)},${alpha})`;
    ctx.beginPath();ctx.ellipse(x,y,Math.max(.4,p.size*1.65),Math.max(.3,p.size*.55),a,0,Math.PI*2);ctx.fill();
   }
  }
  const inner=rad*.26;const halo=ctx.createRadialGradient(0,0,inner*.72,0,0,inner*1.75);halo.addColorStop(0,'rgba(0,0,0,1)');halo.addColorStop(.53,'rgba(0,0,0,1)');halo.addColorStop(.66,'rgba(255,190,111,.65)');halo.addColorStop(.76,'rgba(250,121,41,.22)');halo.addColorStop(1,'rgba(255,103,31,0)');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(0,0,inner*1.76,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#010203';ctx.beginPath();ctx.arc(0,0,inner*.97,0,Math.PI*2);ctx.fill();ctx.restore();
  const shade=ctx.createRadialGradient(cx,cy,Math.min(w,h)*.2,cx,cy,Math.max(w,h)*.77);shade.addColorStop(0,'rgba(0,0,0,.03)');shade.addColorStop(1,'rgba(0,0,0,.73)');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
  if(!reduce)raf=requestAnimationFrame(draw);
 }
 addEventListener('resize',resize,{passive:true});resize();raf=requestAnimationFrame(draw);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf)}else{raf=requestAnimationFrame(draw)}});
})();
