/* ============================================================
   endings.js — 4 endings + 3 fail screens.
   Ending logic mirrors the prototype (rewards balance).
   ============================================================ */
import * as E from './engine.js';
import { fmtTime } from './hud.js';
import { ENDING, BG } from './assets.js';
import { showScreen } from './ui.js';
import { playConfirm } from './audio.js';

let onRestart = null, onMain = null;

export function initEndings({ restart, toMenu }){
  onRestart = restart; onMain = toMenu;
  E.on('ending', renderEnding);
  E.on('fail', renderFail);
}

function statLine(){
  const s = E.state;
  return `🎯 שליטה ${s.control} · ⚡ אנרגיה ${s.energy} · 🔥 לחץ ${s.stress} · 😊 סיפוק ${s.fun} · ⏳ ${fmtTime()}`;
}
function goalLine(){
  const g = E.state.flags.goal;
  return (g && g !== 'עוד לא ברורה לי') ? `<div class="goal-recall">המטרה שהצבת הבוקר: "${g}"</div>` : '';
}

function screen(badge, color, text, bg){
  showScreen(
    `<div class="ending-badge" style="background:${color}">${badge}</div>`+
    goalLine()+
    `<div class="ending-text">${text}</div>`+
    `<div class="stat-summary">${statLine()}</div>`+
    `<div class="btn-stack">`+
      `<button class="big-btn orange" id="endRestart">לשחק שוב 🔄</button>`+
      `<button class="big-btn ghost" id="endMain">לתפריט הראשי</button>`+
    `</div>`,
    { bg }
  );
  document.getElementById('endRestart').onclick = ()=>{ playConfirm(); onRestart && onRestart(); };
  document.getElementById('endMain').onclick    = ()=>{ playConfirm(); onMain && onMain(); };
}

function renderEnding(){
  const s = E.state;
  const balanced = s.control>=5 && s.fun>=5 && s.stress<=6 && s.energy>=4;
  const allWork  = s.control>=8 && s.fun<=3;
  const allPlay  = s.fun>=8 && s.control<=3;

  if(balanced)
    screen('יום מאוזן', '#3E8F6B',
      'התקדמת במשימות, אבל גם נהנית ונשמת. לא הקרבת צד אחד בשביל השני — וזה בדיוק איך שניהול זמן טוב מרגיש מבפנים. יום ראשון ממש טוב ב-720.',
      ENDING.balanced);
  else if(allWork)
    screen('יעיל, אבל שחוק', '#5B3E96',
      'סיימת הכול, המבחן מוכן — אבל ויתרת כמעט על כל הכיף, ויצאת קצת שרוף. היום זה עבד. אבל יום אחרי יום ככה? שווה לשבץ גם רגע אוויר.',
      BG.exit_ticket);
  else if(allPlay)
    screen('כיף שלא נגמר טוב', '#C64A5C',
      'נהנית בענק — כדורסל, משחקים, חברים. אבל הדחוף נדחק הצידה, והלחץ למחר כבר מחכה. כיף זה חשוב; הטריק הוא לשבץ אותו בלי לוותר על מה שחייב להיעשות.',
      BG.court);
  else
    screen('עוד מחפשים איזון', '#7a6aa0',
      'היום היה מעורבב — קצת עבודה, קצת הסחות, קצת כיף. וזה בדיוק המקום ללמוד ממנו: איפה הזמן ברח, ומה באמת היה שווה אותו.',
      BG.hall_calm);
}

function renderFail(mode){
  if(mode==='stress')
    screen('🔥 הלחץ ניצח', '#7a2b28',
      'הלחץ הצטבר עד שכבר אי אפשר היה להתרכז. קמת ויצאת מהכיתה באמצע. הרגע הזה הוא בדיוק האות ללמוד לבקש עזרה — ולעצור הסחות — מוקדם יותר.',
      BG.class_stressed);
  else if(mode==='energy')
    screen('⚡ נגמרה האנרגיה', '#1f3a44',
      'בין ההסחות, המשחקים והתסכול — נגמר הדלק. הראש כבוי, והיום חלף בלי התקדמות אמיתית. מנוחה נכונה, בזמן הנכון, הייתה משנה את כל התמונה.',
      BG.class_stressed);
  else
    screen('⏳ הזמן אזל', '#3a2b52',
      'הצלצול צלצל, והמשימה הדחופה נשארה פתוחה. ההסחות והמשחקים היו כיפיים — אבל הזמן, בניגוד אליהם, לא מתחדש. מחר: פחות "רק סיבוב אחד".',
      ENDING.timeout);
}
