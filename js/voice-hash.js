/* ============================================================
   voice-hash.js — shared, sync clip-id used by BOTH the Node
   generation pipeline and the browser runtime. Must stay pure
   (no crypto, no DOM, no Node APIs) so both sides agree exactly.
   ============================================================ */

/* strip <em> markup and normalize whitespace — the text that is spoken */
export function normalizeSpeech(text){
  return String(text == null ? '' : text)
    .replace(/<\/?em>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Eleven v3 accepts inline IPA. Force an Israeli uvular resh (/ʁ/) only in
   words that repeatedly came back with an alveolar/rolled r. This text is
   used for synthesis and clip identity, never for what the player sees. */
export function prepareTtsInput(text){
  const replacements = [
    [/אחרי/g, '/aχaˈʁej/'],
    [/בקצרה/g, '/bektsaˈʁa/'],
    [/עזרה/g, '/ezˈʁa/'],
    [/יורדים/g, '/joˈʁdim/'],
    [/ולקרוא/g, '/velikˈʁo/'],
    [/לקרוא/g, '/likˈʁo/'],
    [/לסגור/g, '/lisˈɡoʁ/'],
    [/לרגע/g, '/leˈʁeɡa/'],
  ];
  return replacements.reduce((value, [pattern, ipa]) => value.replace(pattern, ipa), normalizeSpeech(text));
}

/* FNV-1a 32-bit → 8 hex chars. charCodeAt is UTF-16 in both Node & browser. */
export function hashId(str){
  let h = 0x811c9dc5;
  for(let i = 0; i < str.length; i++){
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return ('0000000' + h.toString(16)).slice(-8);
}

/* manifest key / mp3 basename for one spoken clip */
export function clipId(speaker, resolvedText){
  return hashId(speaker + '|' + prepareTtsInput(resolvedText));
}
