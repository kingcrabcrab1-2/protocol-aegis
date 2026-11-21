/* PROTOCOL : AEGIS — Phase 2A: HUMAN RECONSTRUCTION intro (WebGL particles, Canvas2D fallback) */
(() => {
"use strict";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = matchMedia("(max-width:700px)").matches || (navigator.hardwareConcurrency || 4) <= 4;
let seen = false; try { seen = localStorage.getItem("aegis_intro_seen") === "1"; } catch (e) {}
const el = (t, c, p, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; if (p) p.appendChild(e); return e; };
const rnd = Math.random, PI2 = Math.PI * 2;
const frame = () => new Promise(requestAnimationFrame);
let N = small ? 2600 : 7500, dead = false, onDone = null, cancelSleep = [];
const sleep = (ms) => new Promise((r) => { const id = setTimeout(r, ms); cancelSleep.push(() => { clearTimeout(id); r(); }); });
const tick = () => { try { play("clickSound"); } catch (e) {} };

/* ---------- 입자 형상 생성: [x,y,z,tone] * N ---------- */
const dir = () => { const z = rnd() * 2 - 1, t = rnd() * PI2, r = Math.sqrt(1 - z * z); return [r * Math.cos(t), z, r * Math.sin(t)]; };
const sstep = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
const fill = (fn) => { const o = new Float32Array(N * 4); for (let i = 0; i < N; i++) { const p = fn(i); o.set(p, i * 4); } return o; };
const shapes = {};
function build() {
  shapes.noise = fill(() => { const d = dir(), r = 1.6 + rnd() * 1.6; return [d[0] * r, d[1] * r, d[2] * r, .3]; });
  const nz = (x, y, z) => Math.sin(x * 2.1 + Math.sin(y * 1.7 + z)) * Math.sin(y * 2.6 + Math.sin(z * 1.9 + x * .8)) + Math.sin(z * 3.3 + x * 1.3) * .5;
  shapes.earth = fill(() => { for (;;) { const d = dir(), land = nz(d[0] * 1.8, d[1] * 1.8, d[2] * 1.8) > .12; if (land || rnd() < .16) return [d[0], d[1], d[2], land ? .95 : .4]; } });
  /* 손: 캡슐(손가락 3마디, 엄지 3마디) + 손바닥 + 손목 */
  const caps = [];
  [[-.36, .02, .1, [.34, .22, .18], .074], [-.12, .06, .03, [.4, .26, .2], .08], [.12, .06, -.03, [.37, .24, .19], .078], [.34, .0, -.1, [.29, .19, .15], .068], [-.5, -.38, -1.05, [.3, .24, .2], .092]]
    .forEach(([x, y, a, L, r], i) => { let px = x, py = y, pz = 0, cu = 0; L.forEach((l, j) => { cu += .2 + (i === 4 ? 0 : i * .02); const nx = px + Math.sin(a) * l * Math.cos(cu), ny = py + Math.cos(a) * l * Math.cos(cu), nzz = pz + l * Math.sin(cu); caps.push([px, py, pz, nx, ny, nzz, r * (1 - j * .12), r * (1 - (j + 1) * .12), l]); px = nx; py = ny; pz = nzz; }); });
  caps.push([0, -.72, -.02, 0, -1.15, -.02, .27, .25, .43]);
  const wt = caps.map((c) => c[8] * (c[6] + c[7])), tw = wt.reduce((s, v) => s + v, 0) + .35;
  shapes.hand = fill(() => {
    let k = rnd() * tw;
    if (k > tw - .35) { const d = dir(); return [d[0] * .5, d[1] * .46 - .3, d[2] * .14, .8]; }
    let i = 0; while (i < caps.length - 1 && k > wt[i]) { k -= wt[i]; i++; }
    const c = caps[i], t = rnd(), e = Math.min(t, 1 - t);
    if (rnd() < .75 * Math.exp(-Math.pow(e / .05, 2))) return shapes_hand_retry(caps, wt, tw);
    let ax = [c[3] - c[0], c[4] - c[1], c[5] - c[2]]; const L = Math.hypot(...ax); ax = ax.map((v) => v / L);
    let u = [ax[1], -ax[0], 0]; if (Math.hypot(...u) < .1) u = [1, 0, 0]; const ul = Math.hypot(...u); u = u.map((v) => v / ul);
    const v = [ax[1] * u[2] - ax[2] * u[1], ax[2] * u[0] - ax[0] * u[2], ax[0] * u[1] - ax[1] * u[0]];
    const ph = rnd() * PI2, r = (c[6] + (c[7] - c[6]) * t) * (1 + .14 * Math.pow(Math.abs(2 * t - 1), 8)), co = Math.cos(ph) * r, si = Math.sin(ph) * r;
    return [c[0] + (c[3] - c[0]) * t + u[0] * co + v[0] * si, c[1] + (c[4] - c[1]) * t + u[1] * co + v[1] * si + .08, c[2] + (c[5] - c[2]) * t + u[2] * co + v[2] * si, .88];
  });
  function shapes_hand_retry(cs, w, T) { const d = dir(); return [d[0] * .5, d[1] * .46 - .3, d[2] * .14, .8]; }
  /* 얼굴: 타원체 두개골 + 눈·코·입·턱·광대 변위 */
  const B = [[0, .05, .05, .28, .1], [0, -.26, .11, .08, .14], [.1, -.3, .05, .04, .05], [-.1, -.3, .05, .04, .05], [0, -.4, .12, .03, -.04],
    [.3, .2, .16, .08, -.08], [-.3, .2, .16, .08, -.08], [.3, .2, .06, .06, .1], [-.3, .2, .06, .06, .1], [.3, .34, .2, .04, .07], [-.3, .34, .2, .04, .07],
    [.48, -.12, .16, .14, .05], [-.48, -.12, .16, .14, .05], [0, -.5, .17, .035, .05], [0, -.62, .15, .04, .06], [0, -.58, .2, .014, -.06], [0, -.85, .2, .1, .06]];
  const disp = (x, y) => { let s = 0; for (const b of B) s += b[4] * Math.exp(-(((x - b[0]) / b[2]) ** 2 + ((y - b[1]) / b[3]) ** 2)); return s; };
  shapes.face = fill(() => {
    for (;;) {
      const d = dir(), tp = 1 - .3 * sstep(-.1, -1, d[1]); let x = d[0] * .78 * tp, y = d[1], z = d[2] * .9, dz = 0;
      if (d[2] > 0) { dz = disp(x, y) * 1.7 * sstep(0, .3, d[2]); z += dz; }
      const acc = d[2] < .15 ? .3 : Math.min(1, .45 + 5 * Math.abs(dz));
      if (rnd() < acc) return [x, y, z, Math.min(1, Math.max(.08, .5 + dz * 2.6))];
    }
  });
}

/* ---------- 상태 ---------- */
const S = { mix: 0, yaw: 0, pitch: 0, damage: 0, collapse: 0, amp: 0, mx: 0, my: 0, sx: 0, sy: 0, spin: 0 };
let A = null, Bf = null, gl = null, ctx2 = null, cv, prog, U = {}, bufA, bufB;

/* ---------- DOM ---------- */
const root = el("div", "aegis-intro"); root.setAttribute("role", "dialog"); root.setAttribute("aria-label", "PROTOCOL : AEGIS 접속 연출");
cv = el("canvas", "", root);
const phase = el("div", "ai-phase", root), log = el("pre", "ai-log", root), cur = el("i");
const hl = el("div", "ai-hud ai-hl", root), hr = el("div", "ai-hud ai-hr", root), lab = el("div", "ai-hud ai-label", root);
const auth = el("div", "ai-auth", root), rad = el("canvas", "", auth); rad.style.cssText = "position:absolute;inset:0;opacity:.9";
const t1 = el("h2", "", auth, "PROTOCOL : AEGIS"), t2 = el("p", "", auth, "ARCHIVED INTER-TIMELINE RELAY TERMINAL"), t3 = el("p", "", auth), enter = el("button", "ai-enter", auth, "ENTER ARCHIVE");
const skip = el("button", "ai-skip", root, "SKIP ▸▸"); skip.type = "button"; enter.type = "button";
el("div", "ai-sign", root, "written by. hamge");

/* ---------- WebGL ---------- */
const VS = `attribute vec4 aA;attribute vec4 aB;attribute vec4 aR;uniform float uMix,uTime,uAspect,uScale,uSize,uDamage,uCollapse,uYaw,uPitch,uDpr;varying float vA,vT,vG,vC;
void main(){float dl=aR.x*.45;float t=clamp((uMix-dl)/.55,0.,1.);t=t*t*(3.-2.*t);vec3 p=mix(aA.xyz,aB.xyz,t);p+=(aR.xyz-.5)*2.2*sin(3.14159*t);float tone=mix(aA.w,aB.w,t);
float hk=fract(sin((aR.y*91.7+floor(uTime*2.5))*12.9898)*43758.5);float dm=step(1.-uDamage*.22,hk);p+=dm*(aR.xyz-.5)*.7;p.y-=dm*.15;
p.y-=uCollapse*uCollapse*(1.5+aR.w*2.);p.xz+=(aR.xz-.5)*uCollapse*.8;
float cy=cos(uYaw),sy=sin(uYaw);p=vec3(cy*p.x+sy*p.z,p.y,-sy*p.x+cy*p.z);float cp=cos(uPitch),sp=sin(uPitch);p=vec3(p.x,cp*p.y-sp*p.z,sp*p.y+cp*p.z);
float w=3.-p.z;float k=2.6/w;gl_Position=vec4(p.x*k*uScale/uAspect,p.y*k*uScale,0.,1.);vG=step(.78,aR.w);
gl_PointSize=(vG>.5?11.:2.4)*uSize*k*uDpr;vT=tone*(.55+.45*(p.z+1.)*.5);vA=(1.-uCollapse)*(1.-dm*.65);vC=floor(mod(aR.z*8.+floor(uTime*(2.+aR.x*3.)),8.));}`;
const FS = `precision mediump float;uniform sampler2D uAtlas;varying float vA,vT,vG,vC;
void main(){float a;if(vG>.5){vec2 c=vec2(mod(vC,4.),floor(vC/4.));a=texture2D(uAtlas,(c+gl_PointCoord)/vec2(4.,2.)).r;}else{a=smoothstep(.5,.15,length(gl_PointCoord-.5));}
vec3 col=mix(vec3(.9,.32,.08),vec3(1.,.86,.66),vT);gl_FragColor=vec4(col*a*vA*(.35+vT*.9),1.);}`;
function initGL() {
  try { gl = cv.getContext("webgl", { antialias: false, alpha: true }); } catch (e) { gl = null; }
  if (!gl) return false;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw 0; return o; };
  try {
    prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw 0;
  } catch (e) { gl = null; return false; }
  gl.useProgram(prog);
  ["uMix", "uTime", "uAspect", "uScale", "uSize", "uDamage", "uCollapse", "uYaw", "uPitch", "uDpr", "uAtlas"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
  const R = new Float32Array(N * 4); for (let i = 0; i < R.length; i++) R[i] = rnd();
  const mk = (name, data, usage) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, usage); const l = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 4, gl.FLOAT, false, 0, 0); return b; };
  bufA = mk("aA", shapes.noise, gl.DYNAMIC_DRAW); bufB = mk("aB", shapes.noise, gl.DYNAMIC_DRAW); mk("aR", R, gl.STATIC_DRAW);
  const at = document.createElement("canvas"); at.width = 128; at.height = 64; const c = at.getContext("2d");
  c.fillStyle = "#fff"; c.font = "bold 24px monospace"; c.textAlign = "center"; c.textBaseline = "middle";
  "01AF7<#/".split("").forEach((ch, i) => c.fillText(ch, (i % 4) * 32 + 16, Math.floor(i / 4) * 32 + 17));
  const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, at);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(U.uAtlas, 0); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
  cv.addEventListener("webglcontextlost", (e) => { e.preventDefault(); gl = null; ctx2 = cv.getContext("2d"); }, false);
  return true;
}
function setPair(a, b) { A = shapes[a]; Bf = shapes[b]; if (gl) { gl.bindBuffer(gl.ARRAY_BUFFER, bufA); gl.bufferSubData(gl.ARRAY_BUFFER, 0, A); gl.bindBuffer(gl.ARRAY_BUFFER, bufB); gl.bufferSubData(gl.ARRAY_BUFFER, 0, Bf); } }

/* ---------- 렌더 ---------- */
let dpr = 1, W = 0, H = 0;
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2); W = root.clientWidth; H = root.clientHeight;
  for (const c of [cv, rad]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
  if (gl) gl.viewport(0, 0, cv.width, cv.height);
}
const hash = (n) => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };
function drawGL(time) {
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  const asp = W / H, sc = asp < 1 ? .42 * asp * 1.15 : .42;
  gl.uniform1f(U.uMix, S.mix); gl.uniform1f(U.uTime, time); gl.uniform1f(U.uAspect, asp); gl.uniform1f(U.uScale, sc);
  gl.uniform1f(U.uSize, 1); gl.uniform1f(U.uDamage, S.damage); gl.uniform1f(U.uCollapse, S.collapse);
  gl.uniform1f(U.uYaw, S.yaw); gl.uniform1f(U.uPitch, S.pitch); gl.uniform1f(U.uDpr, dpr);
  gl.drawArrays(gl.POINTS, 0, N);
}
function drawCPU(time) {
  const c = ctx2 || (ctx2 = cv.getContext("2d")); if (!c || !A) return;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); c.scale(dpr, dpr);
  const n = Math.min(N, 1700), sc = Math.min(H * .42, W * .42 * 1.15), cx = W / 2, cy = H / 2;
  const cyw = Math.cos(S.yaw), syw = Math.sin(S.yaw), cp = Math.cos(S.pitch), sp = Math.sin(S.pitch);
  c.font = "10px monospace";
  for (let i = 0; i < n; i++) {
    const o = i * 4, r1 = hash(i + 1), r2 = hash(i + 7.3), r3 = hash(i + 19.1);
    const dl = r1 * .45; let t = Math.min(1, Math.max(0, (S.mix - dl) / .55)); t = t * t * (3 - 2 * t);
    const sc2 = Math.sin(Math.PI * t) * 2.2;
    let x = A[o] + (Bf[o] - A[o]) * t + (r1 - .5) * sc2, y = A[o + 1] + (Bf[o + 1] - A[o + 1]) * t + (r2 - .5) * sc2, z = A[o + 2] + (Bf[o + 2] - A[o + 2]) * t + (r3 - .5) * sc2;
    const tone = A[o + 3] + (Bf[o + 3] - A[o + 3]) * t;
    y -= S.collapse * S.collapse * (1.5 + r2 * 2);
    let x2 = cyw * x + syw * z, z2 = -syw * x + cyw * z, y2 = cp * y - sp * z2, z3 = sp * y + cp * z2;
    const k = 2.6 / (3 - z3), a = (1 - S.collapse) * (.3 + tone * .6);
    if (a <= .02) continue;
    c.fillStyle = tone > .7 ? `rgba(255,214,160,${a})` : `rgba(255,100,31,${a})`;
    const px = cx + x2 * k * sc, py = cy - y2 * k * sc;
    if (r3 > .8) c.fillText("01AF7<#/"[(i + Math.floor(time * 2)) % 8], px, py); else c.fillRect(px, py, 1.8, 1.8);
  }
}
function radar(time) {
  const c = rad.getContext("2d"); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, rad.width, rad.height); c.scale(dpr, dpr);
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) * .4; c.strokeStyle = "rgba(255,100,31,.55)"; c.fillStyle = "rgba(255,178,95,.75)"; c.lineWidth = 1; c.font = "10px monospace"; c.textAlign = "center";
  [1, .82, .6, .38].forEach((f, i) => { c.beginPath(); c.setLineDash(i === 1 ? [3, 7] : i === 3 ? [1, 4] : []); c.arc(cx, cy, R * f, 0, PI2); c.stroke(); }); c.setLineDash([]);
  for (let d = 0; d < 360; d += 10) { const a = (d - 90) * Math.PI / 180, l = d % 30 ? 5 : 11; c.beginPath(); c.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.lineTo(cx + Math.cos(a) * (R + l), cy + Math.sin(a) * (R + l)); c.stroke(); if (!(d % 30)) c.fillText(String(d).padStart(3, "0"), cx + Math.cos(a) * (R + 24), cy + Math.sin(a) * (R + 24) + 3); }
  c.beginPath(); c.moveTo(cx - R, cy); c.lineTo(cx + R, cy); c.moveTo(cx, cy - R); c.lineTo(cx, cy + R); c.strokeStyle = "rgba(255,100,31,.22)"; c.stroke();
  const sw = (time * .9) % PI2; for (let i = 0; i < 28; i++) { const a = sw - i * .028; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R * .98, a - .03, a); c.closePath(); c.fillStyle = `rgba(255,100,31,${.2 * (1 - i / 28)})`; c.fill(); }
  c.fillStyle = "rgba(255,210,150,.9)";
  for (let i = 0; i < 9; i++) { const a = hash(i + 3) * PI2, r = R * (.2 + hash(i + 11) * .75), vis = 1 - ((sw - a + PI2 * 4) % PI2) / PI2; c.globalAlpha = Math.max(.15, vis); c.fillRect(cx + Math.cos(a) * r - 2, cy + Math.sin(a) * r - 2, 4, 4); } c.globalAlpha = 1;
}

/* ---------- 루프 ---------- */
let t0 = performance.now(), raf = 0, mode = "gl";
addEventListener("pointermove", (e) => { S.mx = e.clientX / innerWidth - .5; S.my = e.clientY / innerHeight - .5; });
function loop() {
  if (dead) return; raf = requestAnimationFrame(loop);
  const time = (performance.now() - t0) / 1000;
  S.sx += (S.mx - S.sx) * .06; S.sy += (S.my - S.sy) * .06;
  S.yaw = (reduce ? 0 : Math.sin(time * .55) * S.amp + S.spin * time * .4) + S.sx * .5; S.pitch = S.sy * .3;
  if (mode === "show") { if (gl) drawGL(time); else drawCPU(time); }
  if (auth.classList.contains("on")) radar(time);
}

/* ---------- 연출 ---------- */
async function type(lines, speed) {
  log.textContent = ""; log.appendChild(cur);
  for (const ln of lines) {
    for (let i = 0; i < ln.length; i++) {
      if (dead) return;
      const bad = ln.length > 12 && rnd() < .07 && !reduce; cur.before(document.createTextNode(bad ? "█▒░▓"[Math.floor(rnd() * 4)] : ln[i]));
      if (bad) { await sleep(speed * 3); cur.previousSibling.nodeValue = ln[i]; }
      if (i % 3 === 0) tick(); await sleep(speed);
    }
    cur.before(document.createTextNode("\n")); await sleep(speed * 9);
  }
}
const hud = (name, sub) => { lab.innerHTML = ""; el("span", "", lab, name); el("em", "", lab, sub); };
let hudT = 0;
function hudStart(label) {
  clearInterval(hudT);
  hl.classList.add("on"); hr.classList.add("on"); lab.classList.add("on");
  hudT = setInterval(() => {
    const f = (v) => (v >= 0 ? "+" : "") + v.toFixed(3);
    hl.innerHTML = `<b>SIMULATED TELEMETRY</b><br>X ${f(Math.sin(performance.now() / 700) * 1.2)}<br>Y ${f(Math.cos(performance.now() / 530))}<br>Z ${f(Math.sin(performance.now() / 910) * .8)}<br>SCAN ${String(Math.floor(rnd() * 512)).padStart(3, "0")}/512`;
    hr.innerHTML = `ID <b>${(0xA000 + Math.floor(rnd() * 0xFFF)).toString(16).toUpperCase()}</b><br>SUBJECT : UNCONFIRMED<br>MATCH ${(S.mix * 100).toFixed(1)}%<br>${label()}`;
  }, 110);
}
async function morph(a, b, ms) {
  setPair(a, b); S.mix = 0; const s = performance.now();
  for (;;) { if (dead) return; const p = Math.min(1, (performance.now() - s) / ms); S.mix = reduce ? 1 : p; if (p >= 1 || reduce) break; await frame(); }
}
async function phase2() {
  mode = "show"; phase.textContent = "PHASE 02 — SYSTEM RECONSTRUCTION"; log.textContent = ""; hudStart(() => "INTEGRITY : " + (S.damage > .2 ? "DEGRADED" : "RESTORING"));
  const f = seen ? [] : ["earth", "hand"];
  if (!seen) {
    S.amp = .3; S.spin = 1; hud("OBJECT 01 / PLANETARY BODY", "RECONSTRUCTING FRAGMENTED MEMORY..."); await morph("noise", "earth", 1500); await sleep(1700); if (dead) return;
    S.spin = 0; S.amp = .25; hud("OBJECT 02 / MANUAL APPENDAGE", "PERSONNEL STATUS : UNCONFIRMED"); await morph("earth", "hand", 1500); await sleep(1500); if (dead) return;
    hud("OBJECT 03 / HUMAN FACIAL STRUCTURE", "BIOMETRIC RECONSTRUCTION"); await morph("hand", "face", 1800);
  } else { hud("OBJECT 03 / HUMAN FACIAL STRUCTURE", "BIOMETRIC RECONSTRUCTION"); await morph("noise", "face", 1400); }
  if (dead) return; S.amp = .55;
  const hold = seen ? 1400 : 3600, s = performance.now();
  while (!dead && performance.now() - s < hold) { const p = (performance.now() - s) / hold; S.damage = reduce ? 0 : (p > .35 && p < .8 ? Math.sin((p - .35) / .45 * Math.PI) : 0); await frame(); }
  if (dead) return; hud("DATA INTEGRITY LOST", "ARCHIVE INTEGRITY : COMPROMISED");
  const c0 = performance.now(), cd = reduce ? 1 : (seen ? 900 : 1500);
  while (!dead) { const p = Math.min(1, (performance.now() - c0) / cd); S.collapse = reduce ? 1 : p; S.damage = .6; if (p >= 1) break; await frame(); }
}
async function phase3() {
  clearInterval(hudT); hl.classList.remove("on"); hr.classList.remove("on"); lab.classList.remove("on"); cv.style.opacity = 0; log.textContent = "";
  phase.textContent = "PHASE 03 — ARCHIVE AUTHORIZATION"; auth.classList.add("on"); mode = "idle";
  let v = 0; const s = performance.now(); t3.textContent = "";
  const ti = setInterval(() => { if (dead) return clearInterval(ti); v = Math.min(98.7, v + 1.9 + rnd()); t3.textContent = `RECONSTRUCTION ${v.toFixed(1)}% (SIMULATED)  /  CHANNELS ${String(7 + Math.floor(rnd() * 3)).padStart(2, "0")}/12`; if (v >= 98.7) clearInterval(ti); }, 90);
  await sleep(seen ? 400 : 1100); if (dead) return; enter.classList.add("on"); enter.focus();
}
async function run() {
  phase.textContent = "PHASE 01 — INITIAL CONNECTION"; hud("", "");
  const L = seen ? ["N.E.R.S.A. CENTRAL ARCHIVE", "REESTABLISHING CONNECTION...", "UNAUTHORIZED TIMELINE DETECTED"] :
    ["N.E.R.S.A. / CENTRAL DATA AUTHORITY", "REESTABLISHING CONNECTION...", "SIGNAL INTERFERENCE : DETECTED", "INTER-TIMELINE COMMUNICATION ARRAY : DEGRADED", "UNAUTHORIZED TIMELINE DETECTED", "DO NOT TERMINATE THIS CONNECTION."];
  await type(L, reduce ? 4 : seen ? 12 : 20); if (dead) return; await sleep(seen ? 200 : 600);
  await phase2(); if (dead) return; await phase3();
}
function finish(fromSkip) {
  if (dead && onDone === null) return; dead = true; cancelSleep.forEach((f) => f()); clearInterval(hudT); cancelAnimationFrame(raf);
  try { localStorage.setItem("aegis_intro_seen", "1"); } catch (e) {}
  const cb = onDone; onDone = null; root.classList.add("out"); tick();
  setTimeout(() => { try { if (gl) gl.getExtension("WEBGL_lose_context")?.loseContext(); } catch (e) {} root.remove(); }, 800);
  if (cb) cb();
}
skip.addEventListener("click", () => finish(true));
enter.addEventListener("click", () => finish(false));
addEventListener("keydown", (e) => { if (!dead && e.key === "Escape") finish(true); });

window.AegisIntro = {
  start(cb) {
    onDone = cb; build(); document.body.appendChild(root); resize(); addEventListener("resize", resize);
    initGL();
    setPair("noise", "noise"); resize(); loop(); skip.focus({ preventScroll: true });
    run().catch(() => finish(true));
  }
};
})();
