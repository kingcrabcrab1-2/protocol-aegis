/* NRS visual settings: local to this browser; does not modify archive data. */
(()=>{'use strict';
const entries=[["radar", "레이더 탐지"], ["trails", "시공간 잔상"], ["target", "메시지 타겟팅"], ["decrypt", "해독 강조"], ["sync", "시간선 동기화 펄스"], ["interference", "신호 간섭"], ["iris", "관측 장치 조리개"], ["relay", "데이터 전송 라인"], ["particles", "데이터 입자 흡수"], ["stamp", "ARCHIVE AUTHENTICATED 도장"], ["parallax", "홀로그램 깊이감"], ["packets", "데이터 패킷 유영"], ["sheen", "홀로그램 유리 반사"], ["ring", "복호화 진행 링"], ["triangle", "시간선 삼각측량"], ["jump", "시간선 이동 전환"], ["materialize", "기록 실체화"], ["echo", "잔류 신호 에코"], ["clearance", "보안 등급 스캔"], ["beacon", "신호 비콘"], ["grid", "공간 격자 재구성"], ["reconstruct", "제목 데이터 복구"], ["optical", "수직 광학 스캔"], ["circuit", "테두리 회로 점등"], ["reactive", "광원 반응형 홀로그램"], ["expansion", "관측 시야 확장"], ["reconnect", "터미널 재접속"]];
const KEY='nrs_visual_settings_v1';
let stored={};try{stored=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
const values={};for(const [key] of entries)values[key]=stored[key]!==false;
function enabled(key){return values[key]!==false}
function apply(){for(const [key] of entries)document.documentElement.classList.toggle('nrs-off-'+key,!enabled(key));}
function save(){try{localStorage.setItem(KEY,JSON.stringify(values))}catch{}apply();}
window.NRSVisualSettings={enabled,values};apply();
 const groups=[
  ['레이더 · 공간',['radar','trails','target','sync','iris','triangle','jump','expansion','grid']],
  ['메시지 · 인증',['decrypt','stamp','ring','materialize','clearance','reconstruct','optical','circuit']],
  ['홀로그램 · 데이터',['relay','particles','parallax','packets','sheen','echo','beacon','reactive']],
  ['시스템 · 환경',['interference','reconnect']]
 ];
 function init(){
  const admin=document.getElementById('adminComposer');if(!admin)return;
  const wrap=document.createElement('section');wrap.className='nrs-visual-settings';
  const heading=document.createElement('button');heading.type='button';heading.className='nrs-settings-heading';heading.setAttribute('aria-haspopup','dialog');heading.setAttribute('aria-expanded','false');heading.textContent='✦ 시각 효과 설정  ▣';wrap.append(heading);admin.prepend(wrap);
  const backdrop=document.createElement('div');backdrop.className='nrs-settings-backdrop';backdrop.hidden=true;
  backdrop.innerHTML='<section class="nrs-settings-dialog" role="dialog" aria-modal="true" aria-label="시각 효과 설정"><header class="nrs-settings-top"><strong class="nrs-settings-title">✦ 시각 효과 설정</strong><button class="nrs-settings-close" type="button" aria-label="닫기">×</button></header><div class="nrs-settings-body"><p>이 브라우저에만 설정이 저장됩니다. 다른 기기에는 적용되지 않아요.</p><div class="nrs-settings-actions"><button type="button" data-all="on">전체 ON</button><button type="button" data-all="off">전체 OFF</button><button type="button" data-all="reset">기본값 복원</button></div><div class="nrs-settings-groups"></div></div></section>';
  document.body.append(backdrop);
  const groupsEl=backdrop.querySelector('.nrs-settings-groups');
  const labels=new Map(entries);
  for(const [title,keys] of groups){
   const section=document.createElement('section');section.className='nrs-settings-group';
   const h=document.createElement('h3');h.className='nrs-settings-group-title';h.textContent=title;section.append(h);
   const grid=document.createElement('div');grid.className='nrs-settings-grid';
   for(const key of keys){if(!labels.has(key))continue;
    const row=document.createElement('label');row.className='nrs-setting';
    const name=document.createElement('span');name.className='nrs-setting-name';name.textContent=labels.get(key);
    const input=document.createElement('input');input.type='checkbox';input.checked=enabled(key);input.dataset.effect=key;
    row.append(name,input);grid.append(row);
   }section.append(grid);groupsEl.append(section);
  }
  const sync=()=>backdrop.querySelectorAll('input[data-effect]').forEach(input=>input.checked=enabled(input.dataset.effect));
  let previousFocus=null;
  const close=()=>{backdrop.hidden=true;heading.setAttribute('aria-expanded','false');document.body.style.overflow='';(previousFocus||heading).focus?.();};
  heading.addEventListener('click',()=>{previousFocus=document.activeElement;sync();backdrop.hidden=false;heading.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';backdrop.querySelector('.nrs-settings-close').focus();});
  backdrop.querySelector('.nrs-settings-close').addEventListener('click',close);
  backdrop.addEventListener('click',e=>{if(e.target===backdrop)close();});
  backdrop.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab'){const focusable=[...backdrop.querySelectorAll('button,input')];const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  groupsEl.addEventListener('change',event=>{const input=event.target;if(input.matches('input[data-effect]')){values[input.dataset.effect]=input.checked;save();}});
  backdrop.querySelector('.nrs-settings-actions').addEventListener('click',event=>{const action=event.target.closest('button[data-all]')?.dataset.all;if(!action)return;for(const [key] of entries)values[key]=action!=='off';save();sync();});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
