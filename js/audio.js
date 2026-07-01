/* ============================================================
   audio.js — procedural sound via WebAudio. No audio files.
   Soft typewriter ticks + gentle UI clicks. Works on mobile
   (context resumed on first user gesture). Respects mute.
   ============================================================ */
let ctx = null;
let muted = (localStorage.getItem('720_muted') === '1');
let lastTick = 0;

function ac(){
  if(!ctx){
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e){ ctx = null; }
  }
  if(ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/* one short enveloped tone */
function blip({freq=1200, dur=0.03, gain=0.05, type='triangle', detune=0}={}){
  const c = ac(); if(!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g   = c.createGain();
  osc.type = type; osc.frequency.value = freq; osc.detune.value = detune;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(gain, now + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(g); g.connect(c.destination);
  osc.start(now); osc.stop(now + dur + 0.02);
}

/* short noise buffer, built once, reused for the mechanical tick */
let noiseBuf = null;
function noise(){
  const c = ac(); if(!c) return null;
  if(!noiseBuf){
    const n = Math.floor(c.sampleRate * 0.05);
    noiseBuf = c.createBuffer(1, n, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for(let i=0;i<n;i++) d[i] = (Math.random()*2-1) * (1 - i/n); // quick decay
  }
  return noiseBuf;
}

/* soft, slow typewriter tick — a gentle mechanical "tik", constant timbre */
export function playTick(){
  if(muted) return;
  const t = performance.now();
  if(t - lastTick < 90) return;     // slow cadence: real "tik … tik", not a buzz
  lastTick = t;
  const c = ac(); if(!c) return;
  const buf = noise(); if(!buf) return;
  const now = c.currentTime;
  const src = c.createBufferSource(); src.buffer = buf;
  const bp = c.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=1300; bp.Q.value=0.7;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.05, now + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
  src.connect(bp); bp.connect(g); g.connect(c.destination);
  src.start(now); src.stop(now + 0.06);
}

/* UI: hover/select a choice */
export function playSelect(){ if(muted) return; blip({ freq: 520, dur: 0.06, gain: 0.06, type:'square' }); blip({ freq: 780, dur: 0.05, gain: 0.045, type:'triangle' }); }
/* UI: advance / confirm */
export function playConfirm(){ if(muted) return; blip({ freq: 660, dur: 0.05, gain: 0.05, type:'sine' }); }
/* UI: generic soft click (menus) */
export function playClick(){ if(muted) return; blip({ freq: 440, dur: 0.045, gain: 0.05, type:'square' }); }

export function setMuted(m){ muted = !!m; localStorage.setItem('720_muted', muted ? '1' : '0'); if(!muted) ac(); }
export function isMuted(){ return muted; }
/* call on first user gesture to unlock audio on mobile */
export function unlock(){ ac(); }
