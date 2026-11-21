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
function init(){const admin=document.getElementById('adminComposer');if(!admin)return;
const wrap=document.createElement('section');wrap.className='nrs-visual-settings';
wrap.innerHTML='<button type="button" class="nrs-settings-heading" aria-expanded="false" aria-controls="nrsSettingsBody">✦ 시각 효과 설정 <span>▾</span></button><div id="nrsSettingsBody" class="nrs-settings-body" hidden><p>이 브라우저에 설정이 저장됩니다. 다른 기기에는 적용되지 않아요.</p><div class="nrs-settings-actions"><button type="button" data-all="on">전체 ON</button><button type="button" data-all="off">전체 OFF</button><button type="button" data-all="reset">기본값 복원</button></div><div class="nrs-settings-grid"></div></div>';
admin.prepend(wrap);
const heading=wrap.querySelector('.nrs-settings-heading'),body=wrap.querySelector('.nrs-settings-body'),grid=wrap.querySelector('.nrs-settings-grid');
heading.addEventListener('click',()=>{body.hidden=!body.hidden;heading.setAttribute('aria-expanded',String(!body.hidden));});
for(const [key,label] of entries){const row=document.createElement('label');row.className='nrs-setting';const input=document.createElement('input');input.type='checkbox';input.checked=enabled(key);input.dataset.effect=key;row.append(input,document.createTextNode(' '+label));grid.append(row);}
const sync=()=>grid.querySelectorAll('input').forEach(input=>input.checked=enabled(input.dataset.effect));
grid.addEventListener('change',event=>{const input=event.target;if(input.matches('input[data-effect]')){values[input.dataset.effect]=input.checked;save();}});
wrap.querySelector('.nrs-settings-actions').addEventListener('click',event=>{const action=event.target.dataset.all;if(!action)return;for(const [key] of entries)values[key]=action!=='off';save();sync();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
