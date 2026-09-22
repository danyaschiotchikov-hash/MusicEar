import { RAW_ENCYCLOPEDIA_PROGRESSIONS } from './src/audio/encyclopediaData';

function parseNoteToOffset(note: string): number {
  const noteMap: Record<string, number> = {
    'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'h': 11, 'b': 10
  };
  
  const isUpper = note[0] === note[0].toUpperCase();
  const baseChar = note[0].toLowerCase();
  
  let pitch = noteMap[baseChar] ?? 0;
  let rest = note.slice(1);
  let alteration = 0;
  
  if (rest.startsWith('is') || rest.startsWith('#')) {
    alteration = 1;
    rest = rest.startsWith('is') ? rest.slice(2) : rest.slice(1);
  } else if (rest.startsWith('es') || rest.startsWith('as') || rest.startsWith('b') || rest.startsWith('♭') || rest.startsWith('des') || rest.startsWith('ges') || rest.startsWith('ces') || rest.startsWith('fes')) {
    if (baseChar === 'a' && note.startsWith('as')) {
      alteration = -1;
      rest = note.slice(2);
    } else if (baseChar === 'e' && note.startsWith('es')) {
      alteration = -1;
      rest = note.slice(2);
    } else if (baseChar === 'd' && note.startsWith('des')) {
      alteration = -1;
      rest = note.slice(3);
    } else if (baseChar === 'g' && note.startsWith('ges')) {
      alteration = -1;
      rest = note.slice(3);
    } else if (baseChar === 'c' && note.startsWith('ces')) {
      alteration = -1;
      rest = note.slice(3);
    } else {
      alteration = -1;
      rest = rest.startsWith('es') ? rest.slice(2) : rest.slice(1);
    }
  }
  
  let octave = 4; // default is small octave
  if (isUpper) {
    octave = 3; // Great octave
  }
  
  if (rest.includes('1')) octave = 5; // First octave
  else if (rest.includes('2')) octave = 6; // Second octave
  else if (rest.includes('3')) octave = 7; // Third octave
  
  const absoluteMidi = octave * 12 + pitch + alteration;
  return absoluteMidi - 60; // offset relative to C1 (midi 60)
}

console.log("=== CHECKING VOICE CROSSINGS ===");
RAW_ENCYCLOPEDIA_PROGRESSIONS.forEach((prog) => {
  const len = Math.min(prog.bass.length, prog.tenor.length, prog.alto.length, prog.sop.length);
  for (let i = 0; i < len; i++) {
    const b = parseNoteToOffset(prog.bass[i]);
    const t = parseNoteToOffset(prog.tenor[i]);
    const a = parseNoteToOffset(prog.alto[i]);
    const s = parseNoteToOffset(prog.sop[i]);
    
    if (b > t) {
      console.log(`Crossing: ${prog.id} (${prog.name}) step ${i + 1}: Bass (${prog.bass[i]}: ${b}) > Tenor (${prog.tenor[i]}: ${t})`);
    }
    if (t > a) {
      console.log(`Crossing: ${prog.id} (${prog.name}) step ${i + 1}: Tenor (${prog.tenor[i]}: ${t}) > Alto (${prog.alto[i]}: ${a})`);
    }
    if (a > s) {
      console.log(`Crossing: ${prog.id} (${prog.name}) step ${i + 1}: Alto (${prog.alto[i]}: ${a}) > Soprano (${prog.sop[i]}: ${s})`);
    }
  }
});
console.log("=== CHECK COMPLETE ===");
