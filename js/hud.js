/* ============================================================
   hud.js — comic meters + countdown timer + reactive animations.
   Reads engine.state; re-renders on the 'bars' event.
   ============================================================ */
import * as E from './engine.js';

const KEYS = ['control','energy','stress','fun'];
const timerEl = document.getElementById('timer');

export function fmtTime(){
  const t = Math.max(0, E.state.timeLeft);
  const m = Math.floor(t);
  const s = Math.round((t - m) * 60);
  const mm = s===60 ? m+1 : m;
  const ss = s===60 ? 0 : s;
  return `${mm}:${String(ss).padStart(2,'0')}`;
}

export function renderTimer(){
  if(!timerEl) return;
  timerEl.textContent = '⏳ ' + fmtTime();
  timerEl.classList.toggle('low', E.state.timeLeft <= 8);
}

export function renderBars(flash=[]){
  for(const k of KEYS){
    const v = E.state[k];
    const fill = document.getElementById('bar-'+k);
    const val  = document.getElementById('val-'+k);
    const row  = document.getElementById('row-'+k);
    if(fill) fill.style.width = (v / E.MAX * 100) + '%';
    if(val)  val.textContent = v;
    if(row){
      const danger = (k==='stress' && v>=8) || (k==='energy' && v<=2);
      row.classList.toggle('danger', danger);
      if(flash.includes(k)){ row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash'); }
    }
  }
  renderTimer();
  if(flash.includes('time') && timerEl){ timerEl.classList.remove('flash'); void timerEl.offsetWidth; timerEl.classList.add('flash'); }
}

export function initHud(){
  E.on('bars', ({flash=[]}={}) => renderBars(flash));
  renderBars();
}
