/* ============================================================
   save.js — single-slot autosave via localStorage.
   Saves on each node entry; cleared on ending/fail.
   ============================================================ */
import * as E from './engine.js';

const KEY = '720_save';

export function save(){
  try{
    const s = E.state;
    localStorage.setItem(KEY, JSON.stringify({
      control:s.control, energy:s.energy, stress:s.stress, fun:s.fun,
      timeLeft:s.timeLeft, gender:s.gender, flags:s.flags, currentId:s.currentId,
    }));
  }catch(e){ /* storage may be blocked in some embeds; ignore */ }
}
export function hasSave(){ try{ return !!localStorage.getItem(KEY); }catch(e){ return false; } }
export function loadData(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } }
export function clearSave(){ try{ localStorage.removeItem(KEY); }catch(e){} }
