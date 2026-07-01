/* ============================================================
   assets.js — logical name -> file path, + stress-reactive bg
   Paths are relative to game/index.html
   ============================================================ */
const A = 'assets/';

/* Character portraits by speaker + emotion key (spec §4: 1–11).
   Default emotion per speaker used when a beat omits `emotion`. */
export const CHAR = {
  michal: { calm:A+'chars/michal_calm.webp', worried:A+'chars/michal_worried.webp', warm:A+'chars/michal_warm.webp' },
  dana:   { neutral:A+'chars/dana_neutral.webp', excited:A+'chars/dana_excited.webp', grin:A+'chars/dana_grin.webp' },
  yoav:   { neutral:A+'chars/yoav_neutral.webp', overwhelmed:A+'chars/yoav_overwhelmed.webp', relief:A+'chars/yoav_relief.webp' },
  bot:    { friendly:A+'chars/bot_friendly.webp', thinking:A+'chars/bot_thinking.webp' },
};
export const CHAR_DEFAULT = { michal:'calm', dana:'neutral', yoav:'neutral', bot:'friendly' };

/* Backgrounds (12–21) */
export const BG = {
  home_calm:A+'bg/home_calm.webp', home_late:A+'bg/home_late.webp',
  class_calm:A+'bg/class_calm.webp', class_stressed:A+'bg/class_stressed.webp',
  tasks_screen:A+'bg/tasks_screen.webp',
  hall_calm:A+'bg/hall_calm.webp', hall_busy:A+'bg/hall_busy.webp',
  court:A+'bg/court.webp', mentor_corner:A+'bg/mentor_corner.webp',
  exit_ticket:A+'bg/exit_ticket.webp',
};

/* Moment close-ups (22–25) */
export const MOMENT = {
  stuck:A+'moments/stuck.webp', phone_temptation:A+'moments/phone_temptation.webp',
  solo_win:A+'moments/solo_win.webp', yoav_needs_help:A+'moments/yoav_needs_help.webp',
};

/* Ending screens (26–27) */
export const ENDING = {
  balanced:A+'endings/ending_balanced.webp', timeout:A+'endings/ending_timeout.webp',
};

/* Above this stress level, "place" scenes switch to their tense variant. */
export const STRESS_BG_THRESHOLD = 7;

/* Stress-reactive place backgrounds. base in {home, class, hall}. */
const PLACE = {
  home:  { calm:'home_calm',  stressed:'home_late'    },
  class: { calm:'class_calm', stressed:'class_stressed' },
  hall:  { calm:'hall_calm',  stressed:'hall_busy'    },
};
export function bgVariant(base, stress){
  const p = PLACE[base];
  if (!p) return BG[base] || null;            // non-reactive bg passed by name
  return BG[stress >= STRESS_BG_THRESHOLD ? p.stressed : p.calm];
}

/* Resolve a character portrait path from speaker + optional emotion key. */
export function charImage(speaker, emotion){
  const set = CHAR[speaker];
  if (!set) return null;
  return set[emotion] || set[CHAR_DEFAULT[speaker]] || Object.values(set)[0];
}

/* Preload a list of image paths (fire-and-forget). */
export function preload(paths){
  for (const p of paths){ const im = new Image(); im.src = p; }
}
