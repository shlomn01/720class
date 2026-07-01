/* ============================================================
   breathing.js — guided breathing exercise (inhale/hold/exhale)
   with an animated circle + on-screen countdown. Calms the
   player: applies the node's `calm` deltas on completion.
   ============================================================ */
import * as E from './engine.js';
import { renderBars } from './hud.js';
import { playConfirm } from './audio.js';

const el = id => document.getElementById(id);

const PHASES = [
  { label:'שאיפה',  secs:4, scale:1.35 },
  { label:'החזיקו', secs:2, scale:1.35 },
  { label:'נשיפה',  secs:6, scale:0.72 },
];
const CYCLES = 3;

let overlay, circle, phaseEl, countEl, cyclesEl;
let seq=[], idx=0, secLeft=0, ticker=null, pendingTo=null, calm=null, running=false;

export function initBreathing(){
  overlay=el('brOverlay'); circle=el('brCircle'); phaseEl=el('brPhase'); countEl=el('brCount'); cyclesEl=el('brCycles');
  el('brSkip').onclick = ()=>{ playConfirm(); finish(); };
  E.on('breathing', start);
}

function renderCycles(){
  let s=''; const done = Math.floor(idx / PHASES.length);
  for(let i=0;i<CYCLES;i++) s += `<span class="br-dot${i<done?' done':''}"></span>`;
  cyclesEl.innerHTML = s;
}

function start({ to, calm:cc }){
  pendingTo = to; calm = cc || { stress:-2 }; running = true;
  seq = [];
  for(let c=0;c<CYCLES;c++) for(const p of PHASES) seq.push(p);
  idx = 0;
  overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false');
  circle.style.transitionDuration = '0.4s'; circle.style.transform = 'scale(1)';
  phaseEl.textContent = 'היכונו…'; countEl.textContent = '';
  renderCycles();
  clearInterval(ticker);
  setTimeout(()=>{ if(running) nextPhase(); }, 800);
}

function nextPhase(){
  if(!running) return;
  if(idx >= seq.length){ finish(); return; }
  const p = seq[idx];
  phaseEl.textContent = p.label;
  circle.style.transitionDuration = p.secs + 's';
  circle.style.transform = 'scale(' + p.scale + ')';
  secLeft = p.secs; countEl.textContent = secLeft;
  renderCycles();
  clearInterval(ticker);
  ticker = setInterval(()=>{
    secLeft--;
    if(secLeft <= 0){ clearInterval(ticker); idx++; nextPhase(); }
    else countEl.textContent = secLeft;
  }, 1000);
}

function finish(){
  if(!running) return; running = false;
  clearInterval(ticker);
  overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true');
  const changed = E.applyDelta(calm);
  renderBars(changed.map(c=>c.key));
  showNote();
}

function showNote(){
  let chips = '';
  if(calm && calm.stress) chips += `<span class="fb stress-down">🔥 לחץ ${calm.stress}</span>`;
  if(calm && calm.energy) chips += `<span class="fb energy-up">⚡ אנרגיה +${calm.energy}</span>`;
  const fail = E.checkFail();
  const dlg = document.getElementById('dialogue'); dlg.onclick = null;
  dlg.innerHTML =
    `<div class="fade-in">`+
      `<span class="speaker inner">מחשבה</span>`+
      `<div class="line"><em>כמה נשימות, והכתפיים ירדו קצת. הראש צלול יותר עכשיו.</em></div>`+
      (chips?`<div class="fb-row">${chips}</div>`:'')+
      `<button class="continue-btn" id="brContBtn">המשך <span class="btn-arrow">←</span></button>`+
    `</div>`;
  document.getElementById('brContBtn').onclick = ()=>{
    playConfirm();
    if(fail) E.emit('fail', fail); else E.goTo(pendingTo);
  };
}
