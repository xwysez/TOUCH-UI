/* ══════════════════════════════════════════
   HAND CONTROLLER UI  ·  script.js
   ══════════════════════════════════════════ */

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H;
function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);

const orbParams = [
  {fx:0.00031,fy:0.00019,px:0.0,py:1.1},
  {fx:0.00023,fy:0.00037,px:2.1,py:0.4},
  {fx:0.00017,fy:0.00027,px:4.3,py:3.0},
];
const darkOrbs  = [{color:'#3a3f8f',alpha:0.18,rFrac:0.72},{color:'#5c3f8a',alpha:0.13,rFrac:0.60},{color:'#1a2a6e',alpha:0.12,rFrac:0.80}];
const lightOrbs = [{color:'#7a9e8a',alpha:0.13,rFrac:0.70},{color:'#5a7a8e',alpha:0.10,rFrac:0.62},{color:'#9aaa88',alpha:0.09,rFrac:0.78}];

function hexToRgb(hex){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return{r,g,b};}

let t=0, isDark=true;

function draw(){
  t+=40;
  const orbs=isDark?darkOrbs:lightOrbs;
  ctx.fillStyle=isDark?'#0d0d12':'#f2ede4';
  ctx.fillRect(0,0,W,H);
  orbs.forEach((od,i)=>{
    const op=orbParams[i];
    const cx=W*0.5+W*0.30*Math.sin(op.fx*t+op.px);
    const cy=H*0.5+H*0.28*Math.cos(op.fy*t+op.py);
    const radius=Math.min(W,H)*od.rFrac;
    const rgb=hexToRgb(od.color);
    const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,radius);
    grad.addColorStop(0,`rgba(${rgb.r},${rgb.g},${rgb.b},${od.alpha})`);
    grad.addColorStop(0.55,`rgba(${rgb.r},${rgb.g},${rgb.b},${od.alpha*0.40})`);
    grad.addColorStop(1,`rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
    ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(cx,cy,radius,0,Math.PI*2); ctx.fill();
  });
  const lc=isDark?'98,114,255':'61,122,96', la=isDark?0.030:0.028;
  ctx.strokeStyle=`rgba(${lc},${la})`; ctx.lineWidth=0.5;
  let x=-H;
  while(x<W+H){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+H,H);ctx.stroke();x+=28;}
  x=-H;
  while(x<W+H){ctx.beginPath();ctx.moveTo(x+H,0);ctx.lineTo(x,H);ctx.stroke();x+=28;}
  requestAnimationFrame(draw);
}
draw();

function applyTheme(val){
  const app=document.getElementById('app');
  const mq=window.matchMedia('(prefers-color-scheme: dark)');
  if(val==='Light'){app.classList.add('light');isDark=false;}
  else if(val==='Dark'){app.classList.remove('light');isDark=true;}
  else{isDark=mq.matches;if(mq.matches)app.classList.remove('light');else app.classList.add('light');}
}

const pages=['GENERAL','CAMERA','DISPLAY','KEYBOARD','MOUSE'];
let currentPage='GENERAL';
function setPage(pg){
  currentPage=pg;
  pages.forEach(p=>document.getElementById('page-'+p).classList.toggle('active',p===pg));
  document.querySelectorAll('.nav-btn').forEach((btn,i)=>btn.classList.toggle('active',pages[i]===pg));
}

function toggleSwitch(key){const el=document.getElementById('toggle-'+key);if(el)el.classList.toggle('on');}

let running=false, selectedCam=0;
function onLaunch(){if(running){setRunning(false);}else{document.getElementById('cam-modal').classList.add('open');}}

function setRunning(v){
  running=v;
  const btn=document.getElementById('launch-btn');
  const dot=document.getElementById('status-dot');
  const lbl=document.getElementById('status-label');
  if(v){
    btn.className='pill-btn stop';
    btn.innerHTML=`<span class="pill-icon"><svg viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="2" fill="#ff8888"/></svg></span>STOP`;
    dot.classList.add('running'); lbl.textContent='Running';
  } else {
    btn.className='pill-btn launch';
    btn.innerHTML=`<span class="pill-icon"><svg viewBox="0 0 14 14" fill="none"><polygon points="3,1 3,13 12,7" fill="white"/></svg></span>LAUNCH`;
    dot.classList.remove('running'); lbl.textContent='Idle';
  }
}

function selectCam(idx,el){
  selectedCam=idx;
  document.querySelectorAll('.cam-option').forEach(e=>e.classList.remove('selected'));
  el.classList.add('selected');
  const combo=document.getElementById('combo-camera_source');
  if(combo)combo.value=idx;
}
function confirmLaunch(){closeCamModal();setRunning(true);}
function closeCamModal(){document.getElementById('cam-modal').classList.remove('open');}

function openManual(){document.getElementById('manual-modal').classList.add('open');}
function closeManual(){document.getElementById('manual-modal').classList.remove('open');}
function confirmClose(){document.getElementById('close-modal').classList.add('open');}

function resetDefaults(){
  const defaults={
    'skeleton_thickness':{val:3,fmt:v=>`${v}px`},
    'selfie_size':{val:100,fmt:v=>`${v}%`},
    'tap_sensitivity':{val:30,fmt:v=>`${v}px`},
    'tap_cooldown':{val:300,fmt:v=>`${v} ms`},
    'mouse_sensitivity':{val:100,fmt:v=>`${(v/100).toFixed(2)}x`},
    'mouse_smoothness':{val:50,fmt:v=>`${(v/100).toFixed(2)}`},
    'mouse_dead_zone':{val:30,fmt:v=>`${(v/10).toFixed(1)}px`},
  };
  for(const[k,d]of Object.entries(defaults)){
    const sl=document.getElementById('sl-'+k),vl=document.getElementById('val-'+k);
    if(sl)sl.value=d.val; if(vl)vl.textContent=d.fmt(d.val);
  }
  ['camera_enable','show_hand_skeleton','show_live_selfie','keyboard_enable','show_gesture_command']
    .forEach(k=>{const el=document.getElementById('toggle-'+k);if(el)el.classList.add('on');});
  const minEl=document.getElementById('toggle-minimize_after_launch');
  if(minEl)minEl.classList.remove('on');
  document.getElementById('theme-combo').value='System Default';
  applyTheme('System Default');
}

document.getElementById('manual-modal').addEventListener('click',function(e){if(e.target===this)closeManual();});
document.getElementById('cam-modal').addEventListener('click',function(e){if(e.target===this)closeCamModal();});
document.getElementById('close-modal').addEventListener('click',function(e){if(e.target===this)this.classList.remove('open');});