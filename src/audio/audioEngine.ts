import { MusicItem, PlaybackSettings } from '../types';
import { calculateItemNotes } from './solfegeHelper';
import { RealizedProgression } from './harmonicProgressions';
import { getSampleFromDB, saveSampleToDB } from '../utils/sampleCache';

export interface SalamanderAnchor {
  note: string;
  midi: number;
  url: string;
}

// 17 Salamander Grand piano anchors (spanning full practical ear-training range up to C6)
export const SALAMANDER_ANCHORS: SalamanderAnchor[] = [
  { note: 'C2', midi: 36, url: 'https://tonejs.github.io/audio/salamander/C2.mp3' },
  { note: 'D#2', midi: 39, url: 'https://tonejs.github.io/audio/salamander/Ds2.mp3' },
  { note: 'F#2', midi: 42, url: 'https://tonejs.github.io/audio/salamander/Fs2.mp3' },
  { note: 'A2', midi: 45, url: 'https://tonejs.github.io/audio/salamander/A2.mp3' },
  { note: 'C3', midi: 48, url: 'https://tonejs.github.io/audio/salamander/C3.mp3' },
  { note: 'D#3', midi: 51, url: 'https://tonejs.github.io/audio/salamander/Ds3.mp3' },
  { note: 'F#3', midi: 54, url: 'https://tonejs.github.io/audio/salamander/Fs3.mp3' },
  { note: 'A3', midi: 57, url: 'https://tonejs.github.io/audio/salamander/A3.mp3' },
  { note: 'C4', midi: 60, url: 'https://tonejs.github.io/audio/salamander/C4.mp3' },
  { note: 'D#4', midi: 63, url: 'https://tonejs.github.io/audio/salamander/Ds4.mp3' },
  { note: 'F#4', midi: 66, url: 'https://tonejs.github.io/audio/salamander/Fs4.mp3' },
  { note: 'A4', midi: 69, url: 'https://tonejs.github.io/audio/salamander/A4.mp3' },
  { note: 'C5', midi: 72, url: 'https://tonejs.github.io/audio/salamander/C5.mp3' },
  { note: 'D#5', midi: 75, url: 'https://tonejs.github.io/audio/salamander/Ds5.mp3' },
  { note: 'F#5', midi: 78, url: 'https://tonejs.github.io/audio/salamander/Fs5.mp3' },
  { note: 'A5', midi: 81, url: 'https://tonejs.github.io/audio/salamander/A5.mp3' },
  { note: 'C6', midi: 84, url: 'https://tonejs.github.io/audio/salamander/C6.mp3' },
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
  private calibrationOscs: { osc: OscillatorNode; multiplier: number }[] = [];
  private calibrationGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;

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

  public getMasterDestination(): AudioNode {
    const ctx = this.getContext();
    if (!this.masterCompressor || !this.masterGain) {
      // Studio transparent limiter/compressor preventing digital distortion on loud chords
      this.masterCompressor = ctx.createDynamicsCompressor();
      this.masterCompressor.threshold.setValueAtTime(-6, ctx.currentTime);
      this.masterCompressor.knee.setValueAtTime(12, ctx.currentTime);
      this.masterCompressor.ratio.setValueAtTime(4, ctx.currentTime);
      this.masterCompressor.attack.setValueAtTime(0.003, ctx.currentTime);
      this.masterCompressor.release.setValueAtTime(0.15, ctx.currentTime);

      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.95, ctx.currentTime);

      this.masterCompressor.connect(this.masterGain);
      this.masterGain.connect(ctx.destination);
    }
    return this.masterCompressor;
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

    // Try to open CacheStorage for audio sample persistence across sessions/offline
    let cache: Cache | null = null;
    try {
      if (typeof caches !== 'undefined') {
        cache = await caches.open('salamander-piano-samples-v2');
      }
    } catch {
      cache = null;
    }

    try {
      await Promise.all(
        SALAMANDER_ANCHORS.map(async (anchor) => {
          try {
            let arrayBuffer: ArrayBuffer | null = null;

            // 1. Try high-performance IndexedDB first
            try {
              arrayBuffer = await getSampleFromDB(`sample_${anchor.midi}`);
            } catch {
              arrayBuffer = null;
            }

            // 2. Try CacheStorage if not in IndexedDB
            if (!arrayBuffer && cache) {
              try {
                const cachedResp = await cache.match(anchor.url);
                if (cachedResp) {
                  arrayBuffer = await cachedResp.arrayBuffer();
                  // Backfill to IndexedDB
                  if (arrayBuffer) {
                    saveSampleToDB(`sample_${anchor.midi}`, arrayBuffer.slice(0));
                  }
                }
              } catch {
                // Ignore cache read errors
              }
            }

            // 3. Fetch from network if not cached
            if (!arrayBuffer) {
              const resp = await fetch(anchor.url, { mode: 'cors' });
              if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
              if (cache) {
                try {
                  await cache.put(anchor.url, resp.clone());
                } catch {}
              }
              arrayBuffer = await resp.arrayBuffer();
              // Persist to IndexedDB for instant offline starts
              if (arrayBuffer) {
                saveSampleToDB(`sample_${anchor.midi}`, arrayBuffer.slice(0));
              }
            }

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
    this.stopCalibrationTone();
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
    noteGain.connect(this.getMasterDestination());

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);

    osc1.stop(stopTime);
    osc2.stop(stopTime);
    osc3.stop(stopTime);

    const activeNodeRef = {
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
    };
    this.activeSourceNodes.push(activeNodeRef);

    // Auto garbage cleanup when note completes
    const cleanupMs = Math.max(100, Math.ceil((stopTime - ctx.currentTime) * 1000) + 100);
    window.setTimeout(() => {
      this.activeSourceNodes = this.activeSourceNodes.filter((n) => n !== activeNodeRef);
    }, cleanupMs);
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
    gainNode.connect(this.getMasterDestination());

    source.start(startTime);
    source.stop(stopTime);

    const activeNodeRef = {
      stop: () => {
        try {
          source.stop();
          gainNode.disconnect();
        } catch {
          // ignore
        }
      },
    };
    this.activeSourceNodes.push(activeNodeRef);

    // Auto garbage cleanup when note completes
    const cleanupMs = Math.max(100, Math.ceil((stopTime - ctx.currentTime) * 1000) + 100);
    window.setTimeout(() => {
      this.activeSourceNodes = this.activeSourceNodes.filter((n) => n !== activeNodeRef);
    }, cleanupMs);
  }

  public playSingleNote(
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

  public playChord(
    midis: number[],
    startTime: number,
    duration: number,
    gainBoost: number,
    settings: PlaybackSettings
  ) {
    for (const m of midis) {
      this.playSingleNote(m, startTime, duration, gainBoost, settings);
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
    gainNode.connect(this.getMasterDestination());

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
   * Starts a continuous, real-time responsive tuning oscillator for "Pitch Calibration" with multiple pleasant timbres.
   */
  public startCalibrationTone(
    initialFreq: number = 440,
    timbre: 'soft_sine' | 'warm_epiano' | 'flute' | 'cello_bow' | 'chamber_organ' = 'soft_sine',
    volume: number = 0.8
  ) {
    this.stopCalibrationTone();
    const ctx = this.getContext();
    const now = ctx.currentTime;

    this.calibrationGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';

    // Configure timbre harmonics & filter
    let setup: { type: OscillatorType; multiplier: number; gain: number }[] = [];

    switch (timbre) {
      case 'warm_epiano':
        filter.frequency.setValueAtTime(1800, now);
        setup = [
          { type: 'triangle', multiplier: 1.0, gain: 0.7 },
          { type: 'sine', multiplier: 2.0, gain: 0.2 },
        ];
        break;
      case 'flute':
        filter.frequency.setValueAtTime(1300, now);
        setup = [
          { type: 'triangle', multiplier: 1.0, gain: 0.6 },
          { type: 'sine', multiplier: 1.0, gain: 0.35 },
        ];
        break;
      case 'cello_bow':
        filter.frequency.setValueAtTime(750, now); // Lowpass removes harshness, leaves warm bowed tone
        setup = [{ type: 'sawtooth', multiplier: 1.0, gain: 0.65 }];
        break;
      case 'chamber_organ':
        filter.frequency.setValueAtTime(2200, now);
        setup = [
          { type: 'triangle', multiplier: 1.0, gain: 0.5 },
          { type: 'sine', multiplier: 0.5, gain: 0.3 },
          { type: 'triangle', multiplier: 2.0, gain: 0.15 },
        ];
        break;
      case 'soft_sine':
      default:
        filter.frequency.setValueAtTime(1200, now);
        setup = [{ type: 'sine', multiplier: 1.0, gain: 0.8 }];
        break;
    }

    const targetVol = Math.min(0.35, 0.22 * volume);
    this.calibrationGain.gain.setValueAtTime(0.0001, now);
    this.calibrationGain.gain.linearRampToValueAtTime(targetVol, now + 0.05);

    filter.connect(this.calibrationGain);
    this.calibrationGain.connect(this.getMasterDestination());

    this.calibrationOscs = setup.map((item) => {
      const osc = ctx.createOscillator();
      const subGain = ctx.createGain();

      osc.type = item.type;
      osc.frequency.setValueAtTime(initialFreq * item.multiplier, now);
      subGain.gain.setValueAtTime(item.gain, now);

      osc.connect(subGain);
      subGain.connect(filter);
      osc.start(now);

      return { osc, multiplier: item.multiplier };
    });
  }

  /**
   * Instantly updates calibration frequency in real time as the slider moves
   */
  public updateCalibrationFrequency(freq: number) {
    if (this.calibrationOscs.length > 0 && this.ctx) {
      const now = this.ctx.currentTime;
      for (const item of this.calibrationOscs) {
        item.osc.frequency.setTargetAtTime(freq * item.multiplier, now, 0.005);
      }
    }
  }

  /**
   * Stops the calibration tone
   */
  public stopCalibrationTone() {
    if (this.calibrationGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.calibrationGain.gain.setValueAtTime(this.calibrationGain.gain.value, now);
        this.calibrationGain.gain.linearRampToValueAtTime(0.0001, now + 0.05);
      } catch {}
    }

    const currentOscs = [...this.calibrationOscs];
    this.calibrationOscs = [];
    this.calibrationGain = null;

    if (currentOscs.length > 0) {
      setTimeout(() => {
        for (const item of currentOscs) {
          try {
            item.osc.stop();
            item.osc.disconnect();
          } catch {}
        }
      }, 60);
    }
  }

  public isCalibrationToneActive(): boolean {
    return this.calibrationOscs.length > 0;
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

    // 1. CHARACTERISTIC INTERVALS & D7 INVERSIONS RESOLUTIONS:
    const hasResolution =
      item.category === 'characteristic_intervals' ||
      item.category === 'd7_inversions' ||
      item.id === 'seventh_mb7';

    if (hasResolution) {
      const resSemitones = item.resolutionSemitones || (item.category === 'seventh_chords' ? [5, 5, 5, 9] : [0, 5]);
      let firstMidis: number[];
      let resMidis: number[];

      if (invertPlayOrder && effectiveDirection === 'down') {
        firstMidis = item.semitones.map((s) => rootMidi + s).reverse();
        resMidis = resSemitones.map((s) => rootMidi + s).reverse();
      } else if (effectiveDirection === 'down') {
        // Downward construction / playback: rootMidi is the highest note.
        // Calculate notes descending from rootMidi:
        firstMidis = calculateItemNotes(item, rootMidi, 'down');
        const bassMidi = Math.min(...firstMidis);
        resMidis = resSemitones.map((s) => bassMidi + s).reverse();
      } else {
        firstMidis = calculateItemNotes(item, rootMidi, 'up');
        resMidis = resSemitones.map((s) => rootMidi + s);
      }

      if (settings.style === 'arpeggio') {
        const stepDur = (item.semitones.length > 2 ? 0.20 : 0.24) / settings.tempo;
        const noteDur = stepDur * (1.2 + settings.resonance * 1.5);
        const gap = 0.18 / settings.tempo;

        // Play chord/interval sequentially (arpeggio)
        const activeFirst: number[] = [];
        firstMidis.forEach((m, idx) => {
          this.playSingleNote(m, now + idx * stepDur, noteDur, getPsychoacousticGain(m), settings);
          this.scheduleTimeout(() => {
            activeFirst.push(m);
            if (onVisualNotes) onVisualNotes([...activeFirst]);
          }, idx * stepDur * 1000);
        });

        // Resolution playback in arpeggio style as well
        const resStart = now + firstMidis.length * stepDur + gap;
        const resStepDur = (resMidis.length > 2 ? 0.22 : 0.26) / settings.tempo;
        const resNoteDur = resStepDur * (1.3 + settings.resonance * 1.5);

        const activeRes: number[] = [];
        resMidis.forEach((m, idx) => {
          this.playSingleNote(m, resStart + idx * resStepDur, resNoteDur, getPsychoacousticGain(m), settings);
          this.scheduleTimeout(() => {
            activeRes.push(m);
            if (onVisualNotes) onVisualNotes([...activeRes]);
          }, (firstMidis.length * stepDur + gap + idx * resStepDur) * 1000);
        });

        const totalTime = resStart + resMidis.length * resStepDur + resNoteDur * (settings.decay || 1.0);
        this.scheduleTimeout(() => {
          if (onVisualNotes) onVisualNotes([]);
        }, totalTime * 1000);

        return;
      } else {
        // Harmonic: first chord together, then resolution chord together
        const chordDur = 0.9 / settings.tempo;
        const resDur = 1.2 / settings.tempo;
        const gap = 0.10;

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

  /**
   * Plays a Tonal Ear Training task with base note and smart-voiced target chord.
   * Supports timing parameter (negative for overlap, positive for memory pause).
   */
  public playTonalTask(
    baseMidi: number,
    chordMidis: number[],
    timingSeconds: number,
    settings: PlaybackSettings,
    onVisualNotes?: (midis: number[]) => void
  ) {
    this.stopAll();
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const baseDur = 1.0 / settings.tempo;
    const chordDur = 1.8 / settings.tempo;

    // 1. Play base note
    this.playSingleNote(baseMidi, now, baseDur, 1.25, settings);
    if (onVisualNotes) {
      onVisualNotes([baseMidi]);
    }

    // 2. Chord start time
    // If timingSeconds < 0: overlap while base is still sounding
    // If timingSeconds > 0: silence pause after base note finishes
    let chordStartTime = now + baseDur;
    if (timingSeconds < 0) {
      const overlapOffset = Math.max(0.25, baseDur + timingSeconds);
      chordStartTime = now + overlapOffset;
    } else {
      chordStartTime = now + baseDur + timingSeconds;
    }

    const chordDelayMs = Math.max(0, (chordStartTime - now) * 1000);

    // 3. Play chord
    const bassMidi = Math.min(...chordMidis);
    if (settings.style === 'arpeggio') {
      const stepDur = 0.22 / settings.tempo;
      const noteDur = stepDur * (1.2 + settings.resonance * 1.5);

      this.scheduleTimeout(() => {
        const activeChord: number[] = [];
        chordMidis.forEach((m, idx) => {
          const gain = m === bassMidi ? 1.25 : (m === baseMidi ? 1.20 : 1.0);
          this.playSingleNote(m, chordStartTime + idx * stepDur, noteDur, gain, settings);
          this.scheduleTimeout(() => {
            activeChord.push(m);
            if (onVisualNotes) onVisualNotes([baseMidi, ...activeChord]);
          }, idx * stepDur * 1000);
        });
      }, chordDelayMs);

      const totalEndMs = (chordStartTime + chordMidis.length * stepDur + noteDur * (settings.decay || 1.0) - now) * 1000;
      this.scheduleTimeout(() => {
        if (onVisualNotes) onVisualNotes([]);
      }, totalEndMs);
    } else {
      // Harmonic
      this.scheduleTimeout(() => {
        for (const m of chordMidis) {
          const gain = m === bassMidi ? 1.25 : (m === baseMidi ? 1.20 : 1.0);
          this.playSingleNote(m, chordStartTime, chordDur, gain, settings);
        }
        if (onVisualNotes) {
          onVisualNotes([baseMidi, ...chordMidis]);
        }
      }, chordDelayMs);

      const totalEndMs = (chordStartTime + chordDur * (settings.decay || 1.0) - now) * 1000;
      this.scheduleTimeout(() => {
        if (onVisualNotes) onVisualNotes([]);
      }, totalEndMs);
    }
  }

  /**
   * Replay only the chord part of a tonal task, respecting arpeggio / harmonic style
   */
  public playTonalChordOnly(
    chordMidis: number[],
    baseMidi: number,
    settings: PlaybackSettings,
    onVisualNotes?: (midis: number[]) => void,
    onFinish?: () => void
  ) {
    this.stopAll();
    const ctx = this.getContext();
    const now = ctx.currentTime + 0.01;
    const bassMidi = Math.min(...chordMidis);

    if (settings.style === 'arpeggio') {
      const stepDur = 0.22 / settings.tempo;
      const noteDur = stepDur * (1.2 + settings.resonance * 1.5);
      const activeChord: number[] = [];

      chordMidis.forEach((m, idx) => {
        const gain = m === bassMidi ? 1.25 : (m === baseMidi ? 1.20 : 1.0);
        this.playSingleNote(m, now + idx * stepDur, noteDur, gain, settings);
        this.scheduleTimeout(() => {
          activeChord.push(m);
          if (onVisualNotes) onVisualNotes([...activeChord]);
        }, idx * stepDur * 1000);
      });

      const totalEndMs = (chordMidis.length * stepDur + noteDur * (settings.decay || 1.0)) * 1000;
      this.scheduleTimeout(() => {
        if (onVisualNotes) onVisualNotes([]);
        if (onFinish) onFinish();
      }, totalEndMs);
    } else {
      const chordDur = 1.8 / settings.tempo;
      for (const m of chordMidis) {
        const gain = m === bassMidi ? 1.25 : (m === baseMidi ? 1.20 : 1.0);
        this.playSingleNote(m, now, chordDur, gain, settings);
      }
      if (onVisualNotes) {
        onVisualNotes(chordMidis);
      }
      const totalEndMs = chordDur * (settings.decay || 1.0) * 1000;
      this.scheduleTimeout(() => {
        if (onVisualNotes) onVisualNotes([]);
        if (onFinish) onFinish();
      }, totalEndMs);
    }
  }

  /**
   * Authentic Dominant Seventh to Tonic Cadence (D7 -> T / D7 -> t):
   * Provides immediate, decisive tonal orientation through dominant tension resolving to tonic.
   */
  public playKeyCadence(
    tonicPitch: number,
    scaleMode: 'major' | 'minor',
    settings: PlaybackSettings,
    onVisualNotes?: (midis: number[]) => void,
    onFinish?: () => void
  ) {
    this.stopAll();
    const ctx = this.getContext();
    const now = ctx.currentTime + 0.01;

    // Pick comfortable tonic in middle register (MIDI 52..63, E3..Eb4)
    let t = 48 + (((tonicPitch % 12) + 12) % 12);
    if (t < 52) t += 12;
    if (t > 63) t -= 12;

    const isMaj = scaleMode === 'major';
    const third = isMaj ? 4 : 3;
    const d7Bass = (t + 7) >= 65 ? (t + 7 - 12) : ((t + 7 - 12 >= 48) ? (t + 7 - 12) : (t + 7));

    // 1. Dominant Seventh (D7):
    // Bass on V (d7Bass), Tenor on IV (t + 5), Alto on VII leading tone (t + 11), Soprano on II (t + 14)
    // 2. Tonic Resolution (T / t):
    // Bass on I (t), Tenor on III (t + third), Alto on V (t + 7), Soprano on I (t + 12)
    const chords: { midis: number[]; dur: number; gain: number }[] = [
      {
        midis: [d7Bass, t + 5, t + 11, t + 14], // Bass V, IV, VII (leading tone), II
        dur: 0.55,
        gain: 1.25,
      },
      {
        midis: [t, t + third, t + 7, t + 12], // Pure resolved tonic in middle register
        dur: 1.1,
        gain: 1.35,
      },
    ];

    let currentOffset = 0;
    chords.forEach((chord, idx) => {
      const startTime = now + currentOffset;
      const delayMs = currentOffset * 1000;

      this.scheduleTimeout(() => {
        chord.midis.forEach((m, i) => {
          this.playSingleNote(m, startTime, chord.dur, i === 0 ? chord.gain * 1.1 : chord.gain, settings);
        });
        if (onVisualNotes) onVisualNotes(chord.midis);
      }, delayMs);

      currentOffset += (idx === chords.length - 1 ? chord.dur : 0.52);
    });

    const totalEndMs = (currentOffset + 0.2) * 1000;
    this.scheduleTimeout(() => {
      if (onVisualNotes) onVisualNotes([]);
      if (onFinish) onFinish();
    }, totalEndMs);
  }

  /**
   * Plays a 4-part SATB harmonic progression sequentially with classical voice leading.
   */
  public playProgressionTask(
    progression: RealizedProgression,
    settings: PlaybackSettings,
    onStepChange?: (stepIndex: number, midis: number[]) => void,
    onFinish?: () => void
  ) {
    this.stopAll();
    const ctx = this.getContext();
    const now = ctx.currentTime + 0.02;

    const tempoMod = Math.max(0.4, Math.min(2.0, settings.tempo));
    const isArp = settings.style === 'arpeggio';
    const stepDuration = (isArp ? 1.5 : 1.25) / tempoMod;

    let currentOffset = 0;
    progression.steps.forEach((step, idx) => {
      const startTime = now + currentOffset;
      const delayMs = currentOffset * 1000;
      const dur = idx === progression.steps.length - 1 ? stepDuration * 1.35 : stepDuration;

      this.scheduleTimeout(() => {
        if (isArp) {
          const arpSubStep = 0.18 / tempoMod;
          step.midisSATB.forEach((m, voiceIdx) => {
            const voiceGain = voiceIdx === 0 ? 1.25 : voiceIdx === 3 ? 1.15 : 1.0;
            this.playSingleNote(m, startTime + voiceIdx * arpSubStep, dur, voiceGain, settings);
          });
        } else {
          step.midisSATB.forEach((m, voiceIdx) => {
            const voiceGain = voiceIdx === 0 ? 1.25 : voiceIdx === 3 ? 1.15 : 1.0;
            this.playSingleNote(m, startTime, dur, voiceGain, settings);
          });
        }

        if (onStepChange) {
          onStepChange(idx, [...step.midisSATB]);
        }
      }, delayMs);

      currentOffset += stepDuration;
    });

    const totalEndMs = (currentOffset + 0.3) * 1000;
    this.scheduleTimeout(() => {
      if (onStepChange) onStepChange(-1, []);
      if (onFinish) onFinish();
    }, totalEndMs);
  }

  /**
   * Plays a single SATB chord step from a harmonic progression.
   */
  public playProgressionStep(
    midisSATB: [number, number, number, number],
    settings: PlaybackSettings,
    onFinish?: () => void
  ) {
    this.stopAll();
    const ctx = this.getContext();
    const now = ctx.currentTime + 0.01;
    const tempoMod = Math.max(0.5, Math.min(2.0, settings.tempo));
    const dur = 1.6 / tempoMod;

    if (settings.style === 'arpeggio') {
      const arpSubStep = 0.22 / tempoMod;
      midisSATB.forEach((m, voiceIdx) => {
        const voiceGain = voiceIdx === 0 ? 1.25 : voiceIdx === 3 ? 1.15 : 1.0;
        this.playSingleNote(m, now + voiceIdx * arpSubStep, dur, voiceGain, settings);
      });

      const totalEndMs = (midisSATB.length * arpSubStep + dur) * 1000;
      this.scheduleTimeout(() => {
        if (onFinish) onFinish();
      }, totalEndMs);
    } else {
      midisSATB.forEach((m, voiceIdx) => {
        const voiceGain = voiceIdx === 0 ? 1.25 : voiceIdx === 3 ? 1.15 : 1.0;
        this.playSingleNote(m, now, dur, voiceGain, settings);
      });

      const totalEndMs = dur * 1000;
      this.scheduleTimeout(() => {
        if (onFinish) onFinish();
      }, totalEndMs);
    }
  }

  /**
   * Plays a single isolated voice line (Bass, Tenor, Alto, or Soprano) across the progression.
   */
  public playProgressionVoice(
    progression: RealizedProgression,
    voiceIndex: 0 | 1 | 2 | 3,
    settings: PlaybackSettings,
    onStepChange?: (stepIndex: number, midi: number) => void,
    onFinish?: () => void
  ) {
    this.stopAll();
    const ctx = this.getContext();
    const now = ctx.currentTime + 0.02;

    const tempoMod = Math.max(0.4, Math.min(2.0, settings.tempo));
    const stepDuration = 0.52 / tempoMod;

    let currentOffset = 0;
    progression.steps.forEach((step, idx) => {
      const startTime = now + currentOffset;
      const delayMs = currentOffset * 1000;
      const dur = idx === progression.steps.length - 1 ? stepDuration * 1.35 : stepDuration;
      const m = step.midisSATB[voiceIndex];

      this.scheduleTimeout(() => {
        this.playSingleNote(m, startTime, dur, 1.25, settings, true, idx === progression.steps.length - 1);
        if (onStepChange) {
          onStepChange(idx, m);
        }
      }, delayMs);

      currentOffset += stepDuration;
    });

    const totalEndMs = (currentOffset + 0.3) * 1000;
    this.scheduleTimeout(() => {
      if (onStepChange) onStepChange(-1, -1);
      if (onFinish) onFinish();
    }, totalEndMs);
  }

  /**
   * Plays a single voice note for a specific step voice.
   */
  public playSingleVoiceNote(
    midi: number,
    settings: PlaybackSettings,
    onFinish?: () => void
  ) {
    this.stopAll();
    const ctx = this.getContext();
    const now = ctx.currentTime + 0.01;
    const dur = 1.2;
    this.playSingleNote(midi, now, dur, 1.25, settings);
    this.scheduleTimeout(() => {
      if (onFinish) onFinish();
    }, dur * 1000);
  }

  /**
   * Plays a melody sequence of raw MIDI numbers
   */
  public playMidiSequence(
    midis: number[],
    stepDuration: number,
    settings: PlaybackSettings,
    onFinish?: () => void
  ) {
    this.stopAll();
    const ctx = this.getContext();
    const now = ctx.currentTime + 0.02;

    midis.forEach((m, idx) => {
      const startTime = now + idx * stepDuration;
      const isLast = idx === midis.length - 1;
      const dur = isLast ? stepDuration * 1.4 : stepDuration;
      this.playSingleNote(m, startTime, dur, 1.2, settings, true, isLast);
    });

    const totalMs = (midis.length * stepDuration + 0.3) * 1000;
    this.scheduleTimeout(() => {
      if (onFinish) onFinish();
    }, totalMs);
  }

  /**
   * Plays a warm harmonic celebration fanfare when leveling up or setting a new record
   */
  public playCelebrationFanfare(settings: PlaybackSettings, onFinish?: () => void) {
    this.stopAll();
    const ctx = this.getContext();
    const now = ctx.currentTime + 0.02;
    // C Major triumph sequence: C5, E5, G5, C6 (sparkling arpeggio + sustained shimmer)
    const fanfareMidis = [72, 76, 79, 84];
    const stepDuration = 0.12;

    fanfareMidis.forEach((m, idx) => {
      const startTime = now + idx * stepDuration;
      const isLast = idx === fanfareMidis.length - 1;
      const dur = isLast ? 1.6 : 0.8;
      this.playSingleNote(m, startTime, dur, 1.25, settings, true, isLast);
    });

    const totalMs = (fanfareMidis.length * stepDuration + 1.2) * 1000;
    this.scheduleTimeout(() => {
      if (onFinish) onFinish();
    }, totalMs);
  }

  /**
   * Plays chosen item followed by target item with a clear gap for ear-to-ear A/B comparison
   */
  public playComparisonSequence(
    chosenItem: MusicItem,
    targetItem: MusicItem,
    rootMidi: number,
    settings: PlaybackSettings,
    onVisualNotes?: (midis: number[]) => void,
    onFinish?: () => void
  ) {
    this.stopAll();
    // 1. Play chosen item
    this.playItem(chosenItem, rootMidi, settings, onVisualNotes);

    // Calculate approximate duration of chosen item playback
    const isArp = settings.style === 'arpeggio';
    const notesCount = Math.max(2, chosenItem.semitones ? chosenItem.semitones.length : 3);
    const itemDurSec = isArp ? (notesCount * 0.45) / Math.max(0.3, settings.tempo) : 1.4;
    const gapMs = (itemDurSec + 0.5) * 1000;

    this.scheduleTimeout(() => {
      // 2. Play target (correct) item
      this.playItem(targetItem, rootMidi, settings, onVisualNotes);
      const targetDurSec = isArp ? (notesCount * 0.45) / Math.max(0.3, settings.tempo) : 1.4;
      this.scheduleTimeout(() => {
        if (onFinish) onFinish();
      }, targetDurSec * 1000);
    }, gapMs);
  }
}

export const audioEngine = new AudioEngine();
