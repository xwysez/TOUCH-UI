/* ══════════════════════════════════════════
   HAND CONTROLLER UI  ·  script.js
   ══════════════════════════════════════════ */

/* ── Animated background ── */
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
function hexToRgb(h){return{r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)};}
let t=0, isDark=true;
function draw(){
  t+=40;
  const orbs=isDark?darkOrbs:lightOrbs;
  ctx.fillStyle=isDark?'#0d0d12':'#f2ede4'; ctx.fillRect(0,0,W,H);
  orbs.forEach((od,i)=>{
    const op=orbParams[i];
    const cx=W*0.5+W*0.30*Math.sin(op.fx*t+op.px), cy=H*0.5+H*0.28*Math.cos(op.fy*t+op.py);
    const radius=Math.min(W,H)*od.rFrac, rgb=hexToRgb(od.color);
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

/* ── Theme ── */
function applyTheme(val){
  const app=document.getElementById('app');
  const mq=window.matchMedia('(prefers-color-scheme: dark)');
  if(val==='Light'){app.classList.add('light');isDark=false;}
  else if(val==='Dark'){app.classList.remove('light');isDark=true;}
  else{isDark=mq.matches;if(mq.matches)app.classList.remove('light');else app.classList.add('light');}
  updateAllSliders();
  syncManualTheme();
}

/* ── Navigation ── */
const pages=['GENERAL','CAMERA','DISPLAY','KEYBOARD','MOUSE'];
function setPage(pg){
  pages.forEach(p=>document.getElementById('page-'+p).classList.toggle('active',p===pg));
  document.querySelectorAll('.nav-btn').forEach((btn,i)=>btn.classList.toggle('active',pages[i]===pg));
}

/* ── Toggles ── */
function toggleSwitch(key){const el=document.getElementById('toggle-'+key);if(el)el.classList.toggle('on');}

/* ── Sliders: update CSS variable for accent-filled track ── */
function updateSlider(el){
  const min=parseFloat(el.min)||0, max=parseFloat(el.max)||100, val=parseFloat(el.value)||0;
  const pct=((val-min)/(max-min))*100;
  el.style.setProperty('--val', pct+'%');
}
function updateAllSliders(){
  document.querySelectorAll('input[type=range]').forEach(updateSlider);
}
document.querySelectorAll('input[type=range]').forEach(el=>{
  updateSlider(el);
  el.addEventListener('input',()=>updateSlider(el));
});

/* ── Launch / Stop ── */
let running=false, selectedCam=0;
function onLaunch(){if(running){setRunning(false);}else{document.getElementById('cam-modal').classList.add('open');}}
function setRunning(v){
  running=v;
  const btn=document.getElementById('launch-btn');
  const dot=document.getElementById('status-dot');
  const lbl=document.getElementById('status-label');
  if(v){
    btn.className='pill-btn stop';
    btn.innerHTML='<span class="pill-icon"><svg viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="2" fill="#ff8888"/></svg></span>STOP';
    dot.classList.add('running'); lbl.textContent='Running';
  } else {
    btn.className='pill-btn launch';
    btn.innerHTML='<span class="pill-icon"><svg viewBox="0 0 14 14" fill="none"><polygon points="3,1 3,13 12,7" fill="white"/></svg></span>LAUNCH';
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

/* ── Reset ── */
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
    if(sl){sl.value=d.val;updateSlider(sl);} if(vl)vl.textContent=d.fmt(d.val);
  }
  ['camera_enable','show_hand_skeleton','show_live_selfie','keyboard_enable','show_gesture_command']
    .forEach(k=>{const el=document.getElementById('toggle-'+k);if(el)el.classList.add('on');});
  const minEl=document.getElementById('toggle-minimize_after_launch');
  if(minEl)minEl.classList.remove('on');
  document.getElementById('theme-combo').value='System Default';
  applyTheme('System Default');
}

/* ── Close modal ── */
function confirmClose(){document.getElementById('close-modal').classList.add('open');}

/* ══════════════════════════════════════════
   USER MANUAL
   ══════════════════════════════════════════

   GESTURE DATA — edit this array to add your gestures.
   Each entry supports:
     group  : nav group heading
     name   : gesture name shown in nav + title
     desc   : description shown below the image
     frames : array of image paths shown as a slideshow.
              Supports .jpg .jpeg .png .webp .gif .mp4 .webm
              Single image  → frames: ['images/move.jpg']
              Multi-frame   → frames: ['images/move_1.jpg', 'images/move_2.jpg']
              Leave as []   → shows placeholder until you add files.

   HOW TO ADD PHOTOS:
     1. Create a folder called 'images' next to your index.html
     2. Place your photos inside it
     3. Fill in the frames array for each gesture, e.g:
          frames: ['images/move_1.jpg', 'images/move_2.jpg']
     4. If more than one frame, the slideshow auto-advances every 1.2 seconds
        and shows dot indicators at the bottom of the image area.
*/
const GESTURES = [
  // Mouse Gestures
  {group:'Mouse Gestures', name:'Move',         desc:'Open your hand fully with fingers spread apart.',                                     frames:['frames/open-palm.png']},
  {group:'Mouse Gestures', name:'Right Click',  desc:'Touch your thumb and middle finger together.',                                        frames:['frames/open-palm.png','frames/right-click.png']},
  {group:'Mouse Gestures', name:'Left Click',   desc:'Touch your thumb and index finger together.',                                         frames:['frames/open-palm.png','frames/left-click.png']},
  {group:'Mouse Gestures', name:'Double Click', desc:'Perform two rapid thumb and index pinches in a row.',                                 frames:['frames/left-click.png','frames/open-palm.png','frames/left-click.png']},
  {group:'Mouse Gestures', name:'Drag',         desc:'Touch and hold your thumb and index finger together.',                                frames:['frames/open-palm.png','frames/left-click.png','frames/left-click.png','frames/open-palm.png']},
  // Keyboard Gestures
  {group:'Keyboard Gestures', name:'Mode Switch', desc:'Touch and hold your thumb and ring finger together.',                               frames:['frames/open-palm.png', 'frames/keyboard.png']},
  {group:'Keyboard Gestures', name:'Press Key',   desc:'Touch your thumb and index finger together.',                                       frames:['frames/open-palm.png','frames/left-click.png','frames/open-palm.png','frames/left-click.png']},
  {group:'Keyboard Gestures', name:'Backspace',   desc:'Touch your thumb and middle finger together.',                                      frames:['frames/open-palm.png','frames/right-click.png']},
];

let currentGestureIdx = 0;
let slideshowTimer    = null;  // setInterval handle for multi-frame gestures
let currentFrameIdx   = 0;    // which frame is currently visible

/* ── Slideshow helpers ── */
function stopSlideshow(){
  if(slideshowTimer){ clearInterval(slideshowTimer); slideshowTimer = null; }
  currentFrameIdx = 0;
}

function renderFrame(wrap, frames, idx){
  const src = frames[idx];
  const ext = src.split('.').pop().toLowerCase();

  if(ext === 'mp4' || ext === 'webm'){
    wrap.innerHTML = `
      <video class="gesture-video" autoplay loop muted playsinline>
        <source src="${src}">
      </video>`;
    wrap.querySelector('video').play().catch(()=>{});
  } else {
    // jpg / jpeg / png / webp / gif — all render as a plain <img>
    wrap.innerHTML = `<img class="gesture-gif" src="${src}" alt="frame ${idx+1}" draggable="false">`;
  }

  updateFrameDots(frames.length, idx);
}

function updateFrameDots(total, active){
  // find or create the dots bar inside .manual-img-area
  const area = document.querySelector('.manual-img-area');
  let dots = document.getElementById('frame-dots');

  if(total <= 1){
    if(dots) dots.style.display = 'none';
    return;
  }

  if(!dots){
    dots = document.createElement('div');
    dots.id = 'frame-dots';
    dots.className = 'frame-dots';
    area.appendChild(dots);
  }

  dots.style.display = 'flex';
  dots.innerHTML = Array.from({length: total}, (_,i) =>
    `<span class="frame-dot${i === active ? ' active' : ''}"></span>`
  ).join('');
}

function startSlideshow(wrap, frames){
  renderFrame(wrap, frames, 0);
  if(frames.length <= 1) return;  // single image, no timer needed

  slideshowTimer = setInterval(()=>{
    currentFrameIdx = (currentFrameIdx + 1) % frames.length;
    renderFrame(wrap, frames, currentFrameIdx);
  }, 1200);  // advance every 1.2 seconds — adjust to taste
}

/* ── Nav builder ── */
function buildManualNav(){
  const nav = document.getElementById('manual-nav');
  nav.innerHTML = '';
  let lastGroup = '';
  GESTURES.forEach((g, i) => {
    if(g.group !== lastGroup){
      const h = document.createElement('div');
      h.className = 'manual-nav-group-title';
      h.textContent = g.group;
      nav.appendChild(h);
      lastGroup = g.group;
    }
    const btn = document.createElement('button');
    btn.className = 'manual-nav-item' + (i===0?' active':'');
    btn.textContent = g.name;
    btn.onclick = () => showGesture(i);
    btn.id = 'manual-nav-' + i;
    nav.appendChild(btn);
  });
}

/* ── Show gesture ── */
function showGesture(idx){
  if(idx < 0 || idx >= GESTURES.length) return;
  stopSlideshow();
  currentGestureIdx = idx;
  const g = GESTURES[idx];

  // Nav highlight
  document.querySelectorAll('.manual-nav-item').forEach((el,i)=>el.classList.toggle('active',i===idx));

  // Badge & counter
  document.getElementById('manual-badge').textContent = g.group.toUpperCase();
  const groupItems = GESTURES.filter(x=>x.group===g.group);
  const posInGroup = groupItems.findIndex(x=>x.name===g.name)+1;
  document.getElementById('manual-counter').textContent =
    String(posInGroup).padStart(2,'0') + ' / ' + String(groupItems.length).padStart(2,'0');

  // Remove any leftover dot bar from the previous gesture
  const oldDots = document.getElementById('frame-dots');
  if(oldDots) oldDots.remove();

  // Media area
  const wrap  = document.getElementById('gesture-img-wrap');
  const frames = g.frames || [];

  if(frames.length > 0){
    startSlideshow(wrap, frames);
  } else {
    wrap.innerHTML = `
      <div class="gesture-placeholder">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="28" width="24" height="20" rx="5" fill="white" opacity="0.7"/>
          <rect x="20" y="14" width="5"  height="18" rx="2.5" fill="white" opacity="0.7"/>
          <rect x="27" y="11" width="5"  height="20" rx="2.5" fill="white" opacity="0.7"/>
          <rect x="34" y="12" width="5"  height="19" rx="2.5" fill="white" opacity="0.7"/>
          <rect x="41" y="16" width="5"  height="15" rx="2.5" fill="white" opacity="0.7"/>
          <rect x="11" y="28" width="11" height="5"  rx="2.5" fill="white" opacity="0.7"/>
        </svg>
        <span>ADD IMAGE</span>
      </div>`;
  }

  // Name + desc
  document.getElementById('manual-gesture-name').textContent = g.name;
  document.getElementById('manual-gesture-desc').textContent = g.desc;

  // Arrows
  document.getElementById('manual-prev').disabled = (idx === 0);
  document.getElementById('manual-next').disabled = (idx === GESTURES.length - 1);
}

/* apply dark/light theme to manual shell */
function syncManualTheme(){
  const shell = document.getElementById('manual-shell');
  if(!shell) return;
  if(isDark) shell.classList.remove('manual-light');
  else       shell.classList.add('manual-light');
}

/* ── Island active states ── */
function setIslandActive(id, on){
  const btn = document.getElementById(id);
  if(btn) btn.classList.toggle('active', on);
}

function openManual(){
  buildManualNav();
  showGesture(currentGestureIdx);
  syncManualTheme();
  document.getElementById('manual-modal').classList.add('open');
  setIslandActive('island-manual-btn', true);
}
function closeManual(){
  stopSlideshow();
  document.getElementById('manual-modal').classList.remove('open');
  setIslandActive('island-manual-btn', false);
}

function toggleCamera(){
  const w = document.getElementById('cam-widget');
  const isOpen = w.classList.toggle('open');
  setIslandActive('island-camera-btn', isOpen);
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('manual-modal').addEventListener('click',function(e){if(e.target===this)closeManual();});
  document.getElementById('cam-modal').addEventListener('click',function(e){if(e.target===this)closeCamModal();});
  document.getElementById('close-modal').addEventListener('click',function(e){if(e.target===this)this.classList.remove('open');});
});