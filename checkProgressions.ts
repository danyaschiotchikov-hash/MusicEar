import { RAW_ENCYCLOPEDIA_PROGRESSIONS } from './src/audio/encyclopediaData';
import { checkVoiceLeading } from './src/audio/harmonicProgressions';

interface RealizedStep {
  midisSATB: [number, number, number, number];
}

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
  } else if (
    note.toLowerCase().startsWith('es') || 
    note.toLowerCase().startsWith('as') || 
    note.toLowerCase().startsWith('des') || 
    note.toLowerCase().startsWith('ges') || 
    note.toLowerCase().startsWith('ces') || 
    note.toLowerCase().startsWith('fes') || 
    rest.startsWith('b') || 
    rest.startsWith('♭')
  ) {
    alteration = -1;
    if (note.toLowerCase().startsWith('des') || note.toLowerCase().startsWith('ges') || note.toLowerCase().startsWith('ces') || note.toLowerCase().startsWith('fes')) {
      rest = note.slice(3);
    } else if (note.toLowerCase().startsWith('es') || note.toLowerCase().startsWith('as')) {
      rest = note.slice(2);
    } else {
      rest = rest.startsWith('b') || rest.startsWith('♭') ? rest.slice(1) : rest;
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

function runAudit() {
  console.log("=== STARTING ACADEMIC PROGRESSIONS AUDIT ===");
  let warningsCount = 0;
  let auditedCount = 0;

  for (const prog of RAW_ENCYCLOPEDIA_PROGRESSIONS) {
    auditedCount++;
    const realizedSteps: RealizedStep[] = [];
    const len = prog.chords.length;

    for (let i = 0; i < len; i++) {
      const bOffset = parseNoteToOffset(prog.bass[i]);
      const tOffset = parseNoteToOffset(prog.tenor[i]);
      const aOffset = parseNoteToOffset(prog.alto[i]);
      const sOffset = parseNoteToOffset(prog.sop[i]);

      // Convert offsets to absolute MIDIs (C1 offset 0 = MIDI 60)
      const bMidi = 60 + bOffset;
      const tMidi = 60 + tOffset;
      const aMidi = 60 + aOffset;
      const sMidi = 60 + sOffset;

      realizedSteps.push({
        midisSATB: [bMidi, tMidi, aMidi, sMidi]
      });
    }

    const validation = checkVoiceLeading(realizedSteps);
    if (!validation.isValid) {
      console.log(`\n❌ Error in Progression [${prog.id}] - "${prog.name}":`);
      for (const warning of validation.warnings) {
        console.log(`   - ${warning}`);
        warningsCount++;
      }
      console.log(`   Bass : [${prog.bass.join(', ')}]`);
      console.log(`   Tenor: [${prog.tenor.join(', ')}]`);
      console.log(`   Alto : [${prog.alto.join(', ')}]`);
      console.log(`   Sop  : [${prog.sop.join(', ')}]`);
    }
  }

  console.log(`\n=== AUDIT FINISHED: Audited ${auditedCount} progressions, found ${warningsCount} warning(s) ===`);
}

runAudit();
