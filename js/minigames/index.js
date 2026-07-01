/* ============================================================
   minigames/index.js — random distraction game with a real,
   live timer drain, temptation buttons, and duration-scaled
   consequences (mirrors prototype showMinigameResult).
   ============================================================ */
import * as E from '../engine.js';
import { renderBars, renderTimer } from '../hud.js';
import { breakout } from './breakout.js';
import { snake } from './snake.js';
import { blocks } from './blocks.js';
const GAMES = [breakout, snake, blocks];

/* avoid repeating the same game twice in a row, for a sense of variety */
let lastPick = -1;
function pickGame(){
  if(GAMES.length === 1) return 0;
  let i; do { i = Math.floor(Math.random()*GAMES.length); } while(i === lastPick);
  lastPick = i; return i;
}

const DRAIN_PER_SEC = 0.7;   // lesson-minutes consumed per real second

const overlay = document.getElementById('mgOverlay');
const canvas  = document.getElementById('mgCanvas');
const ctx     = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const el = id => document.getElementById(id);

let game=null, raf=null, clock=null, score=0, timeSpent=0, pendingTo=null;
const api = { W, H, ctx, canvas, addScore:(n)=>{ score+=n; }, get score(){ return score; } };

export function openMinigame(to){
  pendingTo = to; score=0; timeSpent=0;
  game = GAMES[pickGame()];
  el('mgTitle').textContent = game.title;
  el('mgSub').textContent   = game.sub;
  el('mgScore').textContent = 'ניקוד: 0';
  el('mgTimeLoss').textContent = "⏳ −0 דק'";
  overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false');
  game.init(api);
  clock = setInterval(tick, 1000);
  loop();
}

function tick(){
  timeSpent += 1;
  E.consumeTime(DRAIN_PER_SEC);
  el('mgTimeLoss').textContent = '⏳ −' + (timeSpent*DRAIN_PER_SEC).toFixed(1) + " דק'";
  renderTimer();
  if(E.state.timeLeft <= 0) close(true);
}

function loop(){
  if(!game) return;
  game.step(api); game.draw(api);
  el('mgScore').textContent = 'ניקוד: ' + score;
  raf = requestAnimationFrame(loop);
}

function close(timeUp){
  cancelAnimationFrame(raf); clearInterval(clock);
  if(game && game.cleanup) game.cleanup(api);
  game=null; overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true');

  const spentMin   = timeSpent * DRAIN_PER_SEC;
  const funGain    = Math.min(3, 1 + Math.floor(timeSpent/4));
  const stressGain = Math.floor(timeSpent/4);
  const energyLoss = Math.floor(timeSpent/5);
  const d = { fun:+funGain, control:-1 };
  if(stressGain>0) d.stress = +stressGain;
  if(energyLoss>0) d.energy = -energyLoss;
  const changed = E.applyDelta(d);
  renderBars(changed.map(c=>c.key));

  showResult({ spentMin, funGain, stressGain, energyLoss, timeUp }, pendingTo);
}

function showResult(res, to){
  let line;
  if(res.timeUp)            line = 'שיחקת… ושיחקת. וכשהרמת את הראש — הצלצול כבר צלצל.';
  else if(res.spentMin>=6)  line = "'רק סיבוב אחד' הפך להרבה סיבובים. היה כיף אמיתי — אבל גם המון זמן שלא יחזור, וקצת לחץ שנדבק.";
  else if(res.spentMin>=2)  line = 'נהנית קצת, ואז הצלחת לעצור בעצמך. לא רע בכלל — הסחה קטנה שלא יצאה משליטה.';
  else                      line = 'נגעת שנייה, ומיד סגרת. כל הכבוד על העצירה המהירה — זה החלק הכי קשה.';

  // keep whatever location we were in (home in the morning, class later) —
  // the minigame overlay covered it, so the underlying art is still correct.
  el('sceneTag').textContent = 'אחרי ההסחה';

  let chips = `<span class="fb fun-up">😊 סיפוק +${res.funGain}</span>`+
              `<span class="fb control-down">🎯 שליטה −1</span>`;
  if(res.stressGain>0) chips += `<span class="fb stress-up">🔥 לחץ +${res.stressGain}</span>`;
  if(res.energyLoss>0) chips += `<span class="fb energy-down">⚡ אנרגיה −${res.energyLoss}</span>`;
  chips += `<span class="fb time">⏳ −${res.spentMin.toFixed(1)} דק'</span>`;

  const fail = E.checkFail();
  const dlg = document.getElementById('dialogue');
  dlg.onclick = null;
  dlg.innerHTML =
    `<div class="fade-in">`+
      `<span class="speaker inner">מחשבה</span>`+
      `<div class="line"><em>${E.resolveText(line)}</em></div>`+
      `<div class="fb-row">${chips}</div>`+
      (fail?`<div class="warn-text">${fail==='stress'?'🔥 הלחץ הגיע לשיא…':fail==='energy'?'⚡ האנרגיה נגמרה…':'⏳ הזמן אזל…'}</div>`:'')+
      `<button class="continue-btn" id="mgContBtn">המשך ←</button>`+
    `</div>`;
  document.getElementById('mgContBtn').onclick = ()=>{
    if(fail) E.emit('fail', fail); else E.goTo(to);
  };
}

export function initMinigames(){
  el('mgStop').onclick = ()=> close(false);
  el('mgStay').onclick = ()=>{ /* keep playing — the temptation itself */ };
  E.on('minigame', ({to}) => openMinigame(to));
}
