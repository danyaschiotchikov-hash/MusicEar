import { checkVoiceLeading } from '../audio/harmonicProgressions';

export interface CompactProg {
  id: string;
  name: string;
  formula: string;
  cat: string;
  mode: string;
  bass: string[];
  tenor: string[];
  alto: string[];
  sop: string[];
  chords: string[];
  degrees: string[];
  desc: string;
}

// Map note names to MIDI offsets (relative to C4 = 60)
export function parseNoteToOffset(note: string): number {
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
  return absoluteMidi - 60; // offset relative to C4 (midi 60)
}

function formatNoteForMidi(originalNote: string, targetMidi: number): string {
  const noteMap: Record<string, number> = {
    'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'h': 11, 'b': 10
  };
  const baseChar = originalNote[0].toLowerCase();
  const pitch = noteMap[baseChar] ?? 0;
  let alteration = 0;
  let altStr = '';

  const lower = originalNote.toLowerCase();
  if (lower.includes('is') || lower.includes('#')) {
    alteration = 1;
    altStr = 'is';
  } else if (lower.startsWith('des') || lower.startsWith('ges') || lower.startsWith('ces') || lower.startsWith('fes')) {
    alteration = -1;
    altStr = 'es';
  } else if (lower.startsWith('es') || lower.startsWith('as')) {
    alteration = -1;
    altStr = 's';
  } else if (lower.startsWith('b') && !lower.startsWith('b1') && !lower.startsWith('b2') && !lower.startsWith('b3')) {
    alteration = 0;
    altStr = '';
  }

  const octave = Math.round((targetMidi - (pitch + alteration)) / 12);
  let letter = baseChar;
  let octaveSuffix = '';

  if (octave <= 3) {
    letter = letter.toUpperCase();
  } else if (octave === 5) {
    octaveSuffix = '1';
  } else if (octave === 6) {
    octaveSuffix = '2';
  } else if (octave >= 7) {
    octaveSuffix = '3';
  }

  return letter + altStr + octaveSuffix;
}

function getNoteSpellingForPitchClass(originalNotes: string[], targetMidi: number): string {
  const targetPC = ((targetMidi % 12) + 12) % 12;
  for (const note of originalNotes) {
    const offset = parseNoteToOffset(note);
    const pc = (((offset + 60) % 12) + 12) % 12;
    if (pc === targetPC) {
      return note;
    }
  }
  const pitchClasses = ['c', 'cis', 'd', 'dis', 'e', 'f', 'fis', 'g', 'gis', 'a', 'b', 'h'];
  return pitchClasses[targetPC];
}

export function solveProgression(prog: CompactProg): CompactProg | null {
  const stepsCount = prog.bass.length;
  if (stepsCount === 0) return prog;

  // Convert all steps to absolute MIDI notes
  const originalMidis: [number, number, number, number][] = [];
  for (let i = 0; i < stepsCount; i++) {
    const b = parseNoteToOffset(prog.bass[i]) + 60;
    const t = parseNoteToOffset(prog.tenor[i]) + 60;
    const a = parseNoteToOffset(prog.alto[i]) + 60;
    const s = parseNoteToOffset(prog.sop[i]) + 60;
    originalMidis.push([b, t, a, s]);
  }

  // Pre-generate valid voicings for each step
  const validVoicingsPerStep: [number, number, number, number][][] = [];

  for (let i = 0; i < stepsCount; i++) {
    const orig = originalMidis[i];
    const [B, T, A, S] = orig;
    const originalPCs = new Set(orig.map(m => m % 12));

    const options: [number, number, number, number][] = [];

    // Bass is fixed to maintain inversion
    const bMidi = B;

    // Generate Tenor, Alto, Soprano within sensible ranges
    const tenorMin = 48; // c
    const tenorMax = 69; // a1
    const altoMin = 55;  // g
    const altoMax = 76;  // e2
    const sopMin = 60;   // c1
    const sopMax = 88;   // e3

    const tOptions: number[] = [];
    const aOptions: number[] = [];
    const sOptions: number[] = [];

    for (let m = tenorMin; m <= tenorMax; m++) {
      if (originalPCs.has(m % 12)) tOptions.push(m);
    }
    for (let m = altoMin; m <= altoMax; m++) {
      if (originalPCs.has(m % 12)) aOptions.push(m);
    }
    for (let m = sopMin; m <= sopMax; m++) {
      if (originalPCs.has(m % 12)) sOptions.push(m);
    }

    for (const t of tOptions) {
      if (t < bMidi) continue;
      if (t - bMidi > 24) continue; // Spacing limit: bass and tenor up to 2 octaves

      for (const a of aOptions) {
        if (a < t) continue;
        if (a - t > 12) continue; // Spacing limit: tenor and alto up to 1 octave

        for (const s of sOptions) {
          if (s < a) continue;
          if (s - a > 12) continue; // Spacing limit: alto and soprano up to 1 octave

          // Must represent ALL original pitch classes in the chord
          const pcs = new Set([bMidi % 12, t % 12, a % 12, s % 12]);
          if (pcs.size === originalPCs.size) {
            options.push([bMidi, t, a, s]);
          }
        }
      }
    }

    // Sort options by distance from original voicing to stay as close as possible
    options.sort((v1, v2) => {
      const dist1 = Math.abs(v1[1] - T) + Math.abs(v1[2] - A) + Math.abs(v1[3] - S);
      const dist2 = Math.abs(v2[1] - T) + Math.abs(v2[2] - A) + Math.abs(v2[3] - S);
      return dist1 - dist2;
    });

    validVoicingsPerStep.push(options);
  }

  // Backtracking solver
  const path: [number, number, number, number][] = [];

  function search(stepIdx: number): boolean {
    if (stepIdx === stepsCount) {
      // Validate full path
      const result = checkVoiceLeading(path.map(m => ({ midisSATB: m })));
      return result.isValid;
    }

    const options = validVoicingsPerStep[stepIdx];
    for (const opt of options) {
      // Early pruning: check transition if not the first step
      if (path.length > 0) {
        const prev = path[path.length - 1];
        const transitionResult = checkVoiceLeading([
          { midisSATB: prev },
          { midisSATB: opt }
        ]);
        if (!transitionResult.isValid) {
          continue; // Prune branch early
        }
      }

      path.push(opt);
      if (search(stepIdx + 1)) return true;
      path.pop();
    }

    return false;
  }

  const success = search(0);
  if (!success || path.length === 0) {
    return null; // Could not solve within constraints
  }

  // Map absolute MIDI paths back to the CompactProg note strings
  const solvedProg: CompactProg = {
    ...prog,
    bass: [],
    tenor: [],
    alto: [],
    sop: []
  };

  const originalAllNotes = [
    ...prog.bass,
    ...prog.tenor,
    ...prog.alto,
    ...prog.sop
  ];

  for (let i = 0; i < stepsCount; i++) {
    const [b, t, a, s] = path[i];
    
    const bSpelling = getNoteSpellingForPitchClass(originalAllNotes, b);
    const tSpelling = getNoteSpellingForPitchClass(originalAllNotes, t);
    const aSpelling = getNoteSpellingForPitchClass(originalAllNotes, a);
    const sSpelling = getNoteSpellingForPitchClass(originalAllNotes, s);

    solvedProg.bass.push(formatNoteForMidi(bSpelling, b));
    solvedProg.tenor.push(formatNoteForMidi(tSpelling, t));
    solvedProg.alto.push(formatNoteForMidi(aSpelling, a));
    solvedProg.sop.push(formatNoteForMidi(sSpelling, s));
  }

  return solvedProg;
}
