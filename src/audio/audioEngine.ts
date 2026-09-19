import { MusicItem, PlaybackSettings } from '../types';
import { calculateItemNotes } from './solfegeHelper';

export interface SalamanderAnchor {
  note: string;
  midi: number;
  url: string;
}

// 13 Salamander Grand piano anchors
export const SALAMANDER_ANCHORS: SalamanderAnchor[] = [
  { note: 'C2', midi: 36, url: 'https://tonejs.github.io/audio/salamander/C2.mp3' },
  { note: 'D#2', midi: 39, url: 'https://tonejs.github.io/audio/salamander/D%232.mp3' },
  { note: 'F#2', midi: 42, url: 'https://tonejs.github.io/audio/salamander/F%232.mp3' },
  { note: 'A2', midi: 45, url: 'https://tonejs.github.io/audio/salamander/A2.mp3' },
  { note: 'C3', midi: 48, url: 'https://tonejs.github.io/audio/salamander/C3.mp3' },
  { note: 'D#3', midi: 51, url: 'https://tonejs.github.io/audio/salamander/D%233.mp3' },
  { note: 'F#3', midi: 54, url: 'https://tonejs.github.io/audio/salamander/F%233.mp3' },
  { note: 'A3', midi: 57, url: 'https://tonejs.github.io/audio/salamander/A3.mp3' },
  { note: 'C4', midi: 60, url: 'https://tonejs.github.io/audio/salamander/C4.mp3' },
  { note: 'D#4', midi: 63, url: 'https://tonejs.github.io/audio/salamander/D%234.mp3' },
  { note: 'F#4', midi: 66, url: 'https://tonejs.github.io/audio/salamander/F%234.mp3' },
  { note: 'A4', midi: 69, url: 'https://tonejs.github.io/audio/salamander/A4.mp3' },
  { note: 'C5', midi: 72, url: 'https://tonejs.github.io/audio/salamander/C5.mp3' },
];

export type NoteEventCallback = (activeMidis: number[]) => void;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private sampleBuffers: Map<number, AudioBuffer> = new Map();
  private isSamplesLoaded = false;
  private isLoadingSamples = false;
  private loadProgress = 0;
  private onNoteCallback: NoteEventCallback | null = null;
  private scheduledStopTimeout: number | null = null;
  private activeTimeouts: number[] = [];
  private activeSourceNodes: { stop: () => void }[] = [];
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setNoteCallback(cb: NoteEventCallback | null) {
    this.onNoteCallback = cb;
  }

  public getSampleStatus(): { isLoaded: boolean; isLoading: boolean; progress: number } {
    return {
      isLoaded: this.isSamplesLoaded,
      isLoading: this.isLoadingSamples,
      progress: this.loadProgress,
    };
  }

  public async preloadSalamander(onProgress?: (progress: number) => void): Promise<boolean> {
    if (this.isSamplesLoaded) return true;
    if (this.isLoadingSamples) return false;

    this.isLoadingSamples = true;
    const ctx = this.getContext();
    let loadedCount = 0;

    try {
      await Promise.all(
        SALAMANDER_ANCHORS.map(async (anchor) => {
          try {
            const resp = await fetch(anchor.url, { mode: 'cors' });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const arrayBuffer = await resp.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            this.sampleBuffers.set(anchor.midi, audioBuffer);
            loadedCount++;
            this.loadProgress = Math.round((loadedCount / SALAMANDER_ANCHORS.length) * 100);
            if (onProgress) onProgress(this.loadProgress);
          } catch (err) {
            console.warn(`Could not load sample ${anchor.note}:`, err);
          }
        })
      );
      this.isSamplesLoaded = this.sampleBuffers.size > 0;
      this.isLoadingSamples = false;
      return this.isSamplesLoaded;
    } catch (e) {
      console.warn('Salamander samples loading error:', e);
      this.isLoadingSamples = false;
      return false;
    }
  }

  private scheduleTimeout(fn: () => void, delayMs: number): number {
    const id = window.setTimeout(() => {
      this.activeTimeouts = this.activeTimeouts.filter((t) => t !== id);
      fn();
    }, delayMs);
    this.activeTimeouts.push(id);
    return id;
  }

  public stopAll() {
    this.stopDrone();
    for (const tid of this.activeTimeouts) {
      window.clearTimeout(tid);
    }
    this.activeTimeouts = [];
    if (this.scheduledStopTimeout) {
      window.clearTimeout(this.scheduledStopTimeout);
      this.scheduledStopTimeout = null;
    }
    for (const node of this.activeSourceNodes) {
      try {
        node.stop();
      } catch {
        // already stopped
      }
    }
    this.activeSourceNodes = [];
    if (this.onNoteCallback) {
      this.onNoteCallback([]);
    }
  }

  private midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  private getClosestSample(midi: number): { buffer: AudioBuffer; rate: number } | null {
    if (this.sampleBuffers.size === 0) return null;
    let closestMidi = -1;
    let minDiff = 999;
    for (const anchorMidi of this.sampleBuffers.keys()) {
      const diff = Math.abs(midi - anchorMidi);
      if (diff < minDiff) {
        minDiff = diff;
        closestMidi = anchorMidi;
      }
    }
    const buffer = this.sampleBuffers.get(closestMidi);
    if (!buffer) return null;
    const rate = Math.pow(2, (midi - closestMidi) / 12);
    return { buffer, rate };
  }

  /**
   * Play single synthesized piano note (Triangle with rich harmonics & hammer dispersion)
   */
  private playTriangleSynthNote(
    midi: number,
    startTime: number,
    duration: number,
    gainBoost: number,
    settings: PlaybackSettings,
    isLegato: boolean = false,
    isLastNote: boolean = false
  ) {
    const ctx = this.getContext();
    const freq = this.midiToFreq(midi);

    // Fundamental Triangle
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Soft Sine 2nd harmonic (adds round body)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    // Soft 3rd harmonic
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3, startTime);

    // Low-pass filter simulating piano soundboard dampening
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const baseCutoff = Math.min(6000, Math.max(1400, freq * 4.5));

    // Gain Envelopes
    const noteGain = ctx.createGain();
    const decayFactor = settings.decay || 1.0;
    const totalVolume = Math.min(1.0, 0.45 * settings.volume * gainBoost);

    let stopTime = startTime + duration * decayFactor + 0.05;

    if (isLegato) {
      // TRUE PIANO LEGATO:
      // The note sustains singing body until the exact onset of the next note,
      // with a slight 18% micro-overlap (35-50ms) to ensure absolute continuity without acoustic gaps.
      const overlap = Math.min(0.065, duration * 0.18);

      if (isLastNote) {
        // Final note of the scale/mode: sings longer and resolves with natural decay
        const lastDur = duration * 1.8 * decayFactor;
        filter.frequency.setValueAtTime(baseCutoff, startTime);
        filter.frequency.exponentialRampToValueAtTime(
          Math.max(300, freq * 1.4),
          startTime + lastDur
        );

        noteGain.gain.setValueAtTime(0.0001, startTime);
        noteGain.gain.exponentialRampToValueAtTime(totalVolume, startTime + 0.012);
        noteGain.gain.exponentialRampToValueAtTime(
          Math.max(0.0001, totalVolume * 0.75),
          startTime + duration
        );
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + lastDur);

        stopTime = startTime + lastDur + 0.05;
      } else {
        // Continuous cantabile connection for intermediate scale notes
        filter.frequency.setValueAtTime(baseCutoff, startTime);
        filter.frequency.setValueAtTime(baseCutoff * 0.88, startTime + duration);

        noteGain.gain.setValueAtTime(0.0001, startTime);
        noteGain.gain.exponentialRampToValueAtTime(totalVolume, startTime + 0.008);
        // Holds 85% full volume up to the start of the next note
        noteGain.gain.exponentialRampToValueAtTime(
          Math.max(0.0001, totalVolume * 0.85),
          startTime + duration
        );
        // Smooth legato release during overlap with next note
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + overlap);

        stopTime = startTime + duration + overlap + 0.02;
      }
    } else {
      filter.frequency.setValueAtTime(baseCutoff, startTime);
      filter.frequency.exponentialRampToValueAtTime(
        Math.max(300, freq * 1.2),
        startTime + Math.max(0.2, duration * 0.8)
      );

      // Instant attack, smooth exponential decay
      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(totalVolume, startTime + 0.006);
      noteGain.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, totalVolume * 0.6),
        startTime + 0.12 * decayFactor
      );
      noteGain.gain.exponentialRampToValueAtTime(
        0.0001,
        startTime + duration * decayFactor
      );
    }

    // Subtle gain scaling for upper harmonics
    const osc2Gain = ctx.createGain();
    osc2Gain.gain.value = 0.28;
    const osc3Gain = ctx.createGain();
    osc3Gain.gain.value = 0.12;

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    osc3.connect(osc3Gain);
    osc3Gain.connect(filter);

    filter.connect(noteGain);
    noteGain.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);

    osc1.stop(stopTime);
    osc2.stop(stopTime);
    osc3.stop(stopTime);

    this.activeSourceNodes.push({
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
          osc3.stop();
          noteGain.disconnect();
        } catch {
          // ignore
        }
      },
    });
  }

  /**
   * Play sample-based note (Salamander Grand) with pitch shift
   */
  private playSampleNote(
    midi: number,
    startTime: number,
    duration: number,
    gainBoost: number,
    settings: PlaybackSettings,
    isLegato: boolean = false,
    isLastNote: boolean = false
  ) {
    const sample = this.getClosestSample(midi);
    if (!sample) {
      // Fallback to triangle synth if sample not available
      this.playTriangleSynthNote(midi, startTime, duration, gainBoost, settings, isLegato, isLastNote);
      return;
    }

    const ctx = this.getContext();
    const source = ctx.createBufferSource();
    source.buffer = sample.buffer;
    source.playbackRate.setValueAtTime(sample.rate, startTime);

    const gainNode = ctx.createGain();
    const decayFactor = settings.decay || 1.0;
    const totalVolume = Math.min(1.0, 0.65 * settings.volume * gainBoost);

    let stopTime = startTime + duration * decayFactor + 0.05;

    if (isLegato) {
      const overlap = Math.min(0.065, duration * 0.18);
      if (isLastNote) {
        const lastDur = duration * 1.8 * decayFactor;
        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.exponentialRampToValueAtTime(totalVolume, startTime + 0.01);
        gainNode.gain.setValueAtTime(totalVolume * 0.8, startTime + duration);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + lastDur);
        stopTime = startTime + lastDur + 0.05;
      } else {
        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.exponentialRampToValueAtTime(totalVolume, startTime + 0.008);
        gainNode.gain.setValueAtTime(totalVolume * 0.88, startTime + duration);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + overlap);
        stopTime = startTime + duration + overlap + 0.02;
      }
    } else {
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(totalVolume, startTime + 0.005);
      gainNode.gain.setValueAtTime(totalVolume, startTime + duration * 0.6);
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        startTime + duration * decayFactor
      );
    }

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(startTime);
    source.stop(stopTime);

    this.activeSourceNodes.push({
      stop: () => {
        try {
          source.stop();
          gainNode.disconnect();
        } catch {
          // ignore
        }
      },
    });
  }

  private playSingleNote(
    midi: number,
    startTime: number,
    duration: number,
    gainBoost: number,
    settings: PlaybackSettings,
    isLegato: boolean = false,
    isLastNote: boolean = false
  ) {
    if (settings.timbre === 'salamander' && this.isSamplesLoaded) {
      this.playSampleNote(midi, startTime, duration, gainBoost, settings, isLegato, isLastNote);
    } else {
      this.playTriangleSynthNote(midi, startTime, duration, gainBoost, settings, isLegato, isLastNote);
    }
  }

  /**
   * Continuous sustained reference tone (non-decaying organ pedal tone for construction mode)
   */
  public startContinuousDrone(midi: number, volume: number = 0.8) {
    this.stopDrone();
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const freq = this.midiToFreq(midi);

    // Warm, singing continuous tone (triangle + gentle harmonic)
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(2200, freq * 3.5), now);

    const gainNode = ctx.createGain();
    const targetVol = Math.min(0.35, 0.22 * volume);
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(targetVol, now + 0.08);

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.3, now);

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);

    this.droneOsc1 = osc1;
    this.droneOsc2 = osc2;
    this.droneGain = gainNode;

    if (this.onNoteCallback) {
      this.onNoteCallback([midi]);
    }
  }

  public stopDrone() {
    if (this.droneGain && this.ctx) {
      const now = this.ctx.currentTime;
      try {
        this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
        this.droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      } catch {}
    }
    const o1 = this.droneOsc1;
    const o2 = this.droneOsc2;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneGain = null;
    if (o1 || o2) {
      setTimeout(() => {
        try { o1?.stop(); o1?.disconnect(); } catch {}
        try { o2?.stop(); o2?.disconnect(); } catch {}
      }, 100);
    }
    if (this.onNoteCallback) {
      this.onNoteCallback([]);
    }
  }

  public isDroneActive(): boolean {
    return Boolean(this.droneGain);
  }

  /**
   * Play only the root / tonic reference note (for construction / ear-singing mode)
   */
  public playRootOnly(
    rootMidi: number,
    settings: PlaybackSettings,
    onVisualNotes?: (midis: number[]) => void,
    sustainDrone: boolean = false
  ) {
    this.stopAll();
    if (sustainDrone) {
      this.startContinuousDrone(rootMidi, settings.volume);
      if (onVisualNotes) {
        onVisualNotes([rootMidi]);
      }
      return;
    }
    const ctx = this.getContext();
    const now = ctx.currentTime + 0.02;
    const dur = Math.max(1.2, 1.8 / settings.tempo);
    this.playSingleNote(rootMidi, now, dur, 1.3, settings);
    if (onVisualNotes) {
      onVisualNotes([rootMidi]);
    }
    this.scheduleTimeout(() => {
      if (onVisualNotes) onVisualNotes([]);
    }, dur * 1000);
  }

  /**
   * Play a single individual note (e.g. when tapping a piano key)
   */
  public playNote(midi: number, duration: number = 1.0) {
    const ctx = this.getContext();
    const now = ctx.currentTime + 0.01;
    const defaultSettings: PlaybackSettings = {
      timbre: 'salamander',
      tempo: 0.5,
      resonance: 2.0,
      decay: 2.5,
      volume: 0.85,
      style: 'arpeggio',
      direction: 'up',
      rootNote: 'random',
    };
    this.playSingleNote(midi, now, duration, 1.2, defaultSettings);
  }

  /**
   * Main playback router taking item, rootMidi and all settings into account
   */
  public playItem(
    item: MusicItem,
    rootMidi: number,
    settings: PlaybackSettings,
    onVisualNotes?: (midis: number[]) => void,
    forceDirection?: 'up' | 'down',
    invertPlayOrder?: boolean
  ) {
    this.stopAll();
    const ctx = this.getContext();
    const now = ctx.currentTime + 0.03; // tiny buffer

    const isScaleOrMode = item.category === 'scales' || item.category === 'modes';
    const isCharacteristic = item.category === 'characteristic_intervals';

    // Determine direction
    const configuredDirection = forceDirection || settings.direction;
    let effectiveDirection: 'up' | 'down' = 'up';
    if (item.forceAscendingOnly) {
      effectiveDirection = 'up';
    } else if (configuredDirection === 'random') {
      effectiveDirection = Math.random() > 0.5 ? 'up' : 'down';
    } else {
      effectiveDirection = configuredDirection === 'down' ? 'down' : 'up';
    }

    // Calculate note sequence in playback order:
    // If invertPlayOrder is requested (Oral mode downward replay of the same sound),
    // preserve the exact upward notes and simply play them in reverse (highest to lowest).
    let noteMidis: number[];
    if (invertPlayOrder && effectiveDirection === 'down') {
      const baseUpMidis = calculateItemNotes(item, rootMidi, 'up');
      noteMidis = [...baseUpMidis].reverse();
    } else {
      noteMidis = calculateItemNotes(item, rootMidi, effectiveDirection);
    }
    const bassMidi = Math.min(...noteMidis);

    // Calculate Psychoacoustic Gain Boost per note:
    const getPsychoacousticGain = (midi: number): number => {
      if (isScaleOrMode) return 1.0;
      if (midi === bassMidi) return 1.22; // Bass boost +22%
      const diffFromBass = Math.abs((midi - bassMidi) % 12);
      if (diffFromBass === 3 || diffFromBass === 4) {
        return 1.30; // 30% boost for 3rd (modal color)
      }
      if (diffFromBass === 5) {
        return 1.25; // 25% boost for 4th (characteristic inversion tone)
      }
      return 1.0;
    };

    // 1. CHARACTERISTIC INTERVALS:
    // 4 sounds total. First 2 sounds are Interval 1 (in arpeggio they sound sequentially,
    // layering onto each other). Then Interval 2 (resolution) sounds.
    if (isCharacteristic) {
      const resSemitones = item.resolutionSemitones || [0, 5];
      let firstMidis: number[];
      let resMidis: number[];

      if (invertPlayOrder && effectiveDirection === 'down') {
        // Same sounds in descending sequence
        firstMidis = [rootMidi + item.semitones[1], rootMidi + item.semitones[0]];
        resMidis = [rootMidi + resSemitones[1], rootMidi + resSemitones[0]];
      } else if (effectiveDirection === 'down') {
        const span = item.semitones[1] - item.semitones[0];
        firstMidis = [rootMidi, rootMidi - span];
        resMidis = [rootMidi + (resSemitones[1] - item.semitones[1]), (rootMidi - span) + resSemitones[0]];
      } else {
        firstMidis = [rootMidi + item.semitones[0], rootMidi + item.semitones[1]];
        resMidis = [rootMidi + resSemitones[0], rootMidi + resSemitones[1]];
      }

      if (settings.style === 'arpeggio') {
        const stepDur = 0.23 / settings.tempo; // slightly faster than simple intervals
        const noteDur = stepDur * (1.2 + settings.resonance * 1.5);
        const gap = 0.16 / settings.tempo;

        // Interval 1: 2 sounds sequentially, layering on each other
        this.playSingleNote(firstMidis[0], now, noteDur, getPsychoacousticGain(firstMidis[0]), settings);
        this.playSingleNote(firstMidis[1], now + stepDur, noteDur, getPsychoacousticGain(firstMidis[1]), settings);

        if (onVisualNotes) {
          onVisualNotes([firstMidis[0]]);
          this.scheduleTimeout(() => {
            if (onVisualNotes) onVisualNotes([firstMidis[0], firstMidis[1]]);
          }, stepDur * 1000);
        }

        // Interval 2 (Resolution): 2 sounds sequentially, layering on each other
        const resStart = now + 2 * stepDur + gap;
        const resNoteDur = noteDur * 1.25;

        this.playSingleNote(resMidis[0], resStart, resNoteDur, getPsychoacousticGain(resMidis[0]), settings);
        this.playSingleNote(resMidis[1], resStart + stepDur, resNoteDur, getPsychoacousticGain(resMidis[1]), settings);

        this.scheduleTimeout(() => {
          if (onVisualNotes) onVisualNotes([resMidis[0]]);
        }, (2 * stepDur + gap) * 1000);

        this.scheduleTimeout(() => {
          if (onVisualNotes) onVisualNotes([resMidis[0], resMidis[1]]);
        }, (3 * stepDur + gap) * 1000);

        const totalTime = resStart + 2 * stepDur + resNoteDur * (settings.decay || 1.0);
        this.scheduleTimeout(() => {
          if (onVisualNotes) onVisualNotes([]);
        }, totalTime * 1000);

        return;
      } else {
        // Harmonic: first 2 notes together, then resolution 2 notes together
        const chordDur = 0.85 / settings.tempo;
        const resDur = 1.05 / settings.tempo;
        const gap = 0.06;

        for (const m of firstMidis) {
          this.playSingleNote(m, now, chordDur, getPsychoacousticGain(m), settings);
        }
        if (onVisualNotes) {
          onVisualNotes(firstMidis);
        }

        const resStart = now + chordDur + gap;
        for (const m of resMidis) {
          this.playSingleNote(m, resStart, resDur, getPsychoacousticGain(m), settings);
        }

        this.scheduleTimeout(() => {
          if (onVisualNotes) onVisualNotes(resMidis);
        }, (chordDur + gap) * 1000);

        this.scheduleTimeout(() => {
          if (onVisualNotes) onVisualNotes([]);
        }, (chordDur + gap + resDur) * 1000);

        return;
      }
    }

    // 2. SCALES & MODES:
    // True Piano Legato for scales and modes
    if (isScaleOrMode) {
      const stepDuration = 0.38 / settings.tempo;

      noteMidis.forEach((midi, idx) => {
        const noteStart = now + idx * stepDuration;
        const isLast = idx === noteMidis.length - 1;
        this.playSingleNote(midi, noteStart, stepDuration, 1.0, settings, true, isLast);

        // Visualizer per step
        this.scheduleTimeout(() => {
          if (onVisualNotes) onVisualNotes([midi]);
        }, idx * stepDuration * 1000);
      });

      const totalTime = (noteMidis.length - 1) * stepDuration + stepDuration * 1.8 + 0.15;
      this.scheduleTimeout(() => {
        if (onVisualNotes) onVisualNotes([]);
      }, totalTime * 1000);
      return;
    }

    // 3. REGULAR INTERVALS, CHORDS, INVERSIONS
    if (settings.style === 'harmonic') {
      // Harmonic playback: all notes simultaneously
      const chordDuration = 1.3 / settings.tempo;
      for (const m of noteMidis) {
        const gain = getPsychoacousticGain(m);
        this.playSingleNote(m, now, chordDuration, gain, settings);
      }
      if (onVisualNotes) {
        onVisualNotes(noteMidis);
      }
      this.scheduleTimeout(() => {
        if (onVisualNotes) onVisualNotes([]);
      }, chordDuration * 1000);
    } else {
      // Arpeggio playback
      const stepDuration = 0.32 / settings.tempo;
      const noteDuration = stepDuration * (1.2 + settings.resonance * 1.5);

      const activeCumulative: number[] = [];

      noteMidis.forEach((midi, idx) => {
        const noteStart = now + idx * stepDuration;
        const gain = getPsychoacousticGain(midi);
        this.playSingleNote(midi, noteStart, noteDuration, gain, settings);

        this.scheduleTimeout(() => {
          activeCumulative.push(midi);
          if (onVisualNotes) onVisualNotes([...activeCumulative]);
        }, idx * stepDuration * 1000);
      });

      const totalTime = noteMidis.length * stepDuration + noteDuration * (settings.decay || 1.0);
      this.scheduleTimeout(() => {
        if (onVisualNotes) onVisualNotes([]);
      }, totalTime * 1000);
    }
  }
}

export const audioEngine = new AudioEngine();
