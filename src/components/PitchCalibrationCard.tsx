import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlaybackSettings } from '../types';
import { audioEngine } from '../audio/audioEngine';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Award,
  Music,
  Target,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trophy,
} from 'lucide-react';

interface PitchCalibrationCardProps {
  settings: PlaybackSettings;
  onSettingsChange?: (updated: Partial<PlaybackSettings>) => void;
}

interface TargetNoteOption {
  id: string;
  nameRu: string;
  midi: number;
  freq: number;
}

const TARGET_NOTE_OPTIONS: TargetNoteOption[] = [
  { id: 'A4', nameRu: 'Ля 1-й (A4 = 440 Гц)', midi: 69, freq: 440.0 },
  { id: 'A5', nameRu: 'Ля 2-й (A5 = 880 Гц)', midi: 81, freq: 880.0 },
  { id: 'C4', nameRu: 'До 1-й (C4 = 261.6 Гц)', midi: 60, freq: 261.63 },
  { id: 'D4', nameRu: 'Ре 1-й (D4 = 293.7 Гц)', midi: 62, freq: 293.66 },
  { id: 'E4', nameRu: 'Ми 1-й (E4 = 329.6 Гц)', midi: 64, freq: 329.63 },
  { id: 'F4', nameRu: 'Фа 1-й (F4 = 349.2 Гц)', midi: 65, freq: 349.23 },
  { id: 'G4', nameRu: 'Соль 1-й (G4 = 392 Гц)', midi: 67, freq: 392.00 },
  { id: 'A3', nameRu: 'Ля малой (A3 = 220 Гц)', midi: 57, freq: 220.00 },
  { id: 'C5', nameRu: 'До 2-й (C5 = 523.3 Гц)', midi: 72, freq: 523.25 },
];

type CalibrationTimbre = 'soft_sine' | 'warm_epiano' | 'flute' | 'cello_bow' | 'chamber_organ';

interface TimbreOption {
  id: CalibrationTimbre;
  labelRu: string;
}

const TIMBRE_OPTIONS: TimbreOption[] = [
  { id: 'cello_bow', labelRu: '🎻 Виолончель' },
  { id: 'warm_epiano', labelRu: '🎹 Электропиано' },
  { id: 'flute', labelRu: '🪈 Флейта' },
  { id: 'chamber_organ', labelRu: '⛪ Камерный орган' },
  { id: 'soft_sine', labelRu: '🌊 Чистый синус' },
];

export const PitchCalibrationCard: React.FC<PitchCalibrationCardProps> = ({
  settings,
}) => {
  // Target Note State (default A4 = 440 Hz)
  const [selectedNoteId, setSelectedNoteId] = useState<string>('A4');
  const [selectedTimbre, setSelectedTimbre] = useState<CalibrationTimbre>('flute');
  const activeTargetNote =
    TARGET_NOTE_OPTIONS.find((n) => n.id === selectedNoteId) || TARGET_NOTE_OPTIONS[0];

  // Slider bounds generator
  const generateRandomSliderBounds = (targetFreq: number) => {
    const isLeftZone = Math.random() < 0.5;
    const targetRatio = isLeftZone
      ? 0.18 + Math.random() * 0.18
      : 0.64 + Math.random() * 0.18;

    const rangeWidth = 60 + Math.random() * 40;

    const minF = Math.round((targetFreq - rangeWidth * targetRatio) * 10) / 10;
    const maxF = Math.round((targetFreq + rangeWidth * (1 - targetRatio)) * 10) / 10;
    return { minF, maxF };
  };

  const getRandomStartFreq = (minF: number, maxF: number, targetF: number) => {
    let f = minF + Math.random() * (maxF - minF);
    if (Math.abs(f - targetF) < 4) f += 8;
    return Math.round(f * 10) / 10;
  };

  const [sliderBounds, setSliderBounds] = useState(() =>
    generateRandomSliderBounds(activeTargetNote.freq)
  );
  const [currentFreq, setCurrentFreq] = useState<number>(() =>
    getRandomStartFreq(sliderBounds.minF, sliderBounds.maxF, activeTargetNote.freq)
  );

  const [isActive, setIsActive] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [evaluatedFreq, setEvaluatedFreq] = useState<number | null>(null);

  // Generate unique visual oscilloscope response coefficients for each task/run to avoid visual cheating
  const generateRandomOscCoeffs = () => ({
    ampSeed: 0.5 + Math.random() * 1.5,
    freqSeed: 0.6 + Math.random() * 1.2,
    speedSeed: 0.7 + Math.random() * 0.8,
  });

  const [oscCoeffs, setOscCoeffs] = useState(generateRandomOscCoeffs);

  const [history, setHistory] = useState<
    { noteName: string; freq: number; targetFreq: number; cents: number; scoreText: string }[]
  >([]);

  const animRef = useRef<number | null>(null);
  const delayTimeoutRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentFreqRef = useRef<number>(currentFreq);
  currentFreqRef.current = currentFreq;

  const stopAnimation = () => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    if (delayTimeoutRef.current !== null) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
  };

  const handleNoteSelect = (noteId: string) => {
    stopAnimation();
    setSelectedNoteId(noteId);
    setOscCoeffs(generateRandomOscCoeffs());
    const newNote = TARGET_NOTE_OPTIONS.find((n) => n.id === noteId) || TARGET_NOTE_OPTIONS[0];
    const bounds = generateRandomSliderBounds(newNote.freq);
    const startF = getRandomStartFreq(bounds.minF, bounds.maxF, newNote.freq);

    setSliderBounds(bounds);
    setCurrentFreq(startF);
    setIsRevealed(false);
    setEvaluatedFreq(null);

    if (isActive) {
      audioEngine.updateCalibrationFrequency(startF);
    }
  };

  const handleToggleGenerator = () => {
    if (isActive) {
      audioEngine.stopCalibrationTone();
      setIsActive(false);
    } else {
      audioEngine.startCalibrationTone(currentFreq, selectedTimbre, settings.volume);
      setIsActive(true);
    }
  };

  const handleTimbreSelect = (timbreId: CalibrationTimbre) => {
    setSelectedTimbre(timbreId);
    if (isActive) {
      audioEngine.startCalibrationTone(currentFreq, timbreId, settings.volume);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    stopAnimation();
    const val = parseFloat(e.target.value);
    setCurrentFreq(val);
    if (isActive) {
      audioEngine.updateCalibrationFrequency(val);
    }
  };

  const handleRandomize = () => {
    stopAnimation();
    setOscCoeffs(generateRandomOscCoeffs());
    const bounds = generateRandomSliderBounds(activeTargetNote.freq);
    const newF = getRandomStartFreq(bounds.minF, bounds.maxF, activeTargetNote.freq);
    setSliderBounds(bounds);
    setCurrentFreq(newF);
    setIsRevealed(false);
    setEvaluatedFreq(null);

    if (isActive) {
      audioEngine.updateCalibrationFrequency(newF);
    }
  };

  const handlePlayReferencePiano = () => {
    audioEngine.playNote(activeTargetNote.midi, 1.8);
  };

  const centsDiff = Math.round(
    1200 * Math.log2(currentFreq / activeTargetNote.freq)
  );
  const absCents = Math.abs(centsDiff);

  const isExactHit =
    Math.abs(currentFreq - activeTargetNote.freq) < 0.08 ||
    Math.round(currentFreq * 10) === Math.round(activeTargetNote.freq * 10);

  // Static evaluation values for the user's initial guess so that the results (big numbers & texts)
  // stay static and do not glide/change while the sound & compass glide to unison.
  const staticCentsDiff = evaluatedFreq !== null
    ? Math.round(1200 * Math.log2(evaluatedFreq / activeTargetNote.freq))
    : centsDiff;
  const staticAbsCents = Math.abs(staticCentsDiff);

  const staticIsExactHit = evaluatedFreq !== null
    ? (Math.abs(evaluatedFreq - activeTargetNote.freq) < 0.08 ||
       Math.round(evaluatedFreq * 10) === Math.round(activeTargetNote.freq * 10))
    : isExactHit;

  let statusBadge = {
    title: 'ИДЕАЛЬНО',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 dark:text-emerald-300 dark:border-emerald-500/40',
    icon: Award,
  };

  if (staticIsExactHit) {
    statusBadge = {
      title: 'ЗОЛОТОЕ ПОПАДАНИЕ',
      color: 'bg-amber-500/20 text-amber-500 border-amber-400/50 shadow-xs ring-1 ring-amber-400/40 dark:text-amber-300',
      icon: Trophy,
    };
  } else if (staticAbsCents > 40) {
    statusBadge = {
      title: 'ОТКЛОНЕНИЕ',
      color: 'bg-rose-500/15 text-rose-500 border-rose-500/30 dark:text-rose-400 dark:border-rose-500/40',
      icon: Target,
    };
  } else if (staticAbsCents > 15) {
    statusBadge = {
      title: 'БЛИЗКО К ЦЕЛИ',
      color: 'bg-amber-500/15 text-amber-500 border-amber-500/30 dark:text-amber-400 dark:border-amber-500/40',
      icon: Sparkles,
    };
  }

  const handleEvaluate = () => {
    stopAnimation();
    const userSelectedFreq = currentFreq;
    setEvaluatedFreq(userSelectedFreq);
    setIsRevealed(true);

    const initialCents = Math.round(
      1200 * Math.log2(userSelectedFreq / activeTargetNote.freq)
    );
    const absInitialCents = Math.abs(initialCents);
    const exactMatch =
      Math.abs(userSelectedFreq - activeTargetNote.freq) < 0.08 ||
      Math.round(userSelectedFreq * 10) === Math.round(activeTargetNote.freq * 10);

    let text = 'Идеально';
    if (exactMatch) text = '🥇 100% Золото';
    else if (absInitialCents > 40) text = 'Отклонение';
    else if (absInitialCents > 15) text = 'Близко';

    setHistory((prev) => [
      {
        noteName: activeTargetNote.id,
        freq: userSelectedFreq,
        targetFreq: activeTargetNote.freq,
        cents: initialCents,
        scoreText: text,
      },
      ...prev.slice(0, 4),
    ]);

    // Smoothly glide slider from userSelectedFreq to activeTargetNote.freq over 3800ms
    const startF = userSelectedFreq;
    const targetF = activeTargetNote.freq;
    const duration = 3800;

    // задержание: wait 1.8s (1800ms) before starting the automatic pitch-correction glide
    delayTimeoutRef.current = window.setTimeout(() => {
      const startTime = performance.now();
      const animateGlide = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Ease out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const nextFreq = startF + (targetF - startF) * easeOut;

        setCurrentFreq(nextFreq);
        if (isActive) {
          audioEngine.updateCalibrationFrequency(nextFreq);
        }

        if (progress < 1) {
          animRef.current = requestAnimationFrame(animateGlide);
        } else {
          animRef.current = null;
        }
      };

      animRef.current = requestAnimationFrame(animateGlide);
    }, 1800);
  };

  const handleNudge = (delta: number) => {
    stopAnimation();
    const nextVal = Math.min(
      sliderBounds.maxF,
      Math.max(sliderBounds.minF, Math.round((currentFreq + delta) * 10) / 10)
    );
    setCurrentFreq(nextVal);
    if (isActive) {
      audioEngine.updateCalibrationFrequency(nextVal);
    }
  };

  useEffect(() => {
    return () => {
      stopAnimation();
      audioEngine.stopCalibrationTone();
    };
  }, []);

  // Real-time animated vector Sine wave using requestAnimationFrame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas high-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let animId: number;
    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Base quiet wave resting or vibrating
      ctx.lineWidth = 1.5;

      // Draw horizontal dashed reference line
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(142, 142, 147, 0.15)';
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      ctx.beginPath();
      
      // Amplitude and frequency react directly to slider movement (currentFreq) but are scaled by oscCoeffs to vary uniquely in each task
      let amplitude = 0;
      let waveSpeed = 0.04;
      let frequency = 0.015;

      if (isActive) {
        // Scramble currentFreq to select a pseudo-random seed
        const seed = Math.sin(currentFreq * 131.7 * oscCoeffs.freqSeed) * 43758.5453;
        const rand = seed - Math.floor(seed);
        
        // Both amplitude and frequency are highly responsive to slider adjustments but look completely different in each task
        amplitude = (12 + rand * 16) * oscCoeffs.ampSeed; 
        frequency = (0.011 + (currentFreq % 12) * 0.0008) * oscCoeffs.freqSeed; 
        waveSpeed = (0.035 + rand * 0.035) * oscCoeffs.speedSeed;
      } else {
        // Subtle idle vibration wave
        amplitude = 2.5;
        frequency = 0.01;
        waveSpeed = 0.015;
      }

      // Linear gradients for neon indigo & teal feel
      const grad = ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, '#5856D6');
      grad.addColorStop(0.5, '#5AC8FA');
      grad.addColorStop(1, '#5856D6');
      ctx.strokeStyle = grad;

      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * frequency + phase) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw secondary out-of-phase wave for absolute gorgeous depth if active
      if (isActive) {
        ctx.beginPath();
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(90, 200, 250, 0.3)';
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * (frequency * 1.2) - phase * 0.8) * (amplitude * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      phase += waveSpeed;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isActive, currentFreq, oscCoeffs]);

  // Generate ticks for sliding compass-style tuner ruler (-120 to +120 cents)
  const ticks = [];
  for (let i = -120; i <= 120; i += 2) {
    ticks.push(i);
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* Target Selector Card */}
      <div className="p-3 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
        <div className="flex-1 min-w-0">
          <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 block mb-1">
            Целевой Камертон
          </label>
          <div className="relative">
            <select
              value={selectedNoteId}
              onChange={(e) => handleNoteSelect(e.target.value)}
              className="w-full pl-0 pr-6 py-0.5 bg-transparent border-0 text-sm font-bold text-[#5856D6] dark:text-[#5E5CE6] outline-none cursor-pointer appearance-none"
            >
              {TARGET_NOTE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="text-black dark:text-white bg-white dark:bg-[#1C1C1E]">
                  {opt.nameRu}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

        <div className="flex-1 min-w-0">
          <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 block mb-1">
            Тембр Генератора
          </label>
          <div className="relative">
            <select
              value={selectedTimbre}
              onChange={(e) => handleTimbreSelect(e.target.value as CalibrationTimbre)}
              className="w-full pl-0 pr-6 py-0.5 bg-transparent border-0 text-sm font-bold text-[#5856D6] dark:text-[#5E5CE6] outline-none cursor-pointer appearance-none"
            >
              {TIMBRE_OPTIONS.map((t) => (
                <option key={t.id} value={t.id} className="text-black dark:text-white bg-white dark:bg-[#1C1C1E]">
                  {t.labelRu}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Display: The Tuning Chamber with Oscilloscope Sine Wave */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col items-center justify-between min-h-[224px]">
        {/* Apple-style thin grid circular background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(88,86,214,0.02),transparent)] pointer-events-none" />
        
        {/* Dynamic Vector Oscilloscope Wave inside the Chamber */}
        <div className="absolute inset-0 flex items-center justify-center opacity-65 dark:opacity-85 pointer-events-none">
          <canvas ref={canvasRef} className="w-full h-[140px]" />
        </div>

        <AnimatePresence mode="wait">
          {!isRevealed ? (
            /* TUNING PHASE: Live Target Info with Note Metadata Ring */
            <motion.div
              key="tuning"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="w-full flex flex-col items-center z-10 space-y-2 mt-4"
            >
              <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 text-[#5856D6] dark:text-[#5E5CE6] px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-[#5856D6]/10">
                <Target className="w-3 h-3 text-[#5856D6]" />
                <span>ЭТАЛОН {activeTargetNote.id}</span>
              </div>

              {/* Big note target readout */}
              <div className="text-center">
                <h2 className="text-5xl font-light tracking-tight text-slate-800 dark:text-white leading-none">
                  {activeTargetNote.id}
                </h2>
                <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                  Target: {activeTargetNote.freq.toFixed(1)} Hz
                </p>
              </div>

              {/* Status information */}
              <div className="text-center pt-10">
                <span className="text-[11px] font-semibold text-[#5856D6] dark:text-[#5E5CE6] leading-relaxed block max-w-[280px]">
                  {isActive ? 'Сближайте волну до тихой стабилизации' : 'Включите звук для старта'}
                </span>
              </div>
            </motion.div>
          ) : (
            /* REVEALED PHASE: Compas Tuning HUD & Cent Deviation Meter */
            <motion.div
              key="revealed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full flex flex-col items-center z-10 space-y-4"
            >
              {/* Status Badge */}
              <div className={`px-3 py-1 rounded-full border text-[11px] font-extrabold tracking-wider flex items-center gap-1.5 ${statusBadge.color}`}>
                <statusBadge.icon className="w-3.5 h-3.5 shrink-0" />
                <span>{statusBadge.title}</span>
              </div>

              {/* Cent Deviation Big Number */}
              <div className="text-center space-y-0.5">
                <div className="text-6xl font-light font-sans text-slate-800 dark:text-white flex items-baseline justify-center tracking-tight leading-none">
                  <span>{staticCentsDiff > 0 ? `+${staticCentsDiff}` : staticCentsDiff}</span>
                  <span className="text-base font-bold text-slate-400 dark:text-slate-500 ml-1">cents</span>
                </div>
                <p className="text-xs text-slate-400 font-mono font-medium">
                  {staticIsExactHit
                    ? 'Абсолютный слух! Превосходный результат.'
                    : staticCentsDiff > 0
                    ? `Тон завышен на ${staticAbsCents} центов`
                    : `Тон занижен на ${staticAbsCents} центов`}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tuning Horizon Compass Meter / Exp Slider (Real-time Sliding Tick-marks Ruler) */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-sm space-y-4">
        
        {/* Real-time Dynamic sliding tick-marks ruler (Compensates translation dynamically during tuning!) */}
        <div className="relative h-14 w-full bg-slate-50 dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
          {/* Edge fading gradients */}
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white dark:from-[#1C1C1E] via-white/40 dark:via-[#1C1C1E]/40 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white dark:from-[#1C1C1E] via-white/40 dark:via-[#1C1C1E]/40 to-transparent z-10 pointer-events-none" />

          {/* Central static orange target needle */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-[#FF9500] dark:bg-[#FFD60A] z-20 shadow-xs flex flex-col justify-between items-center">
            <div className="w-1.5 h-1.5 bg-[#FF9500] dark:bg-[#FFD60A] rounded-full" />
            <div className="w-1.5 h-1.5 bg-[#FF9500] dark:bg-[#FFD60A] rounded-full" />
          </div>

          {/* Sliding Tick marks strip - Moves in real-time as user slides! */}
          <motion.div
            animate={{
              x: -centsDiff * 8.0, // Increased step size scale (8.0px per 1 cent)
            }}
            transition={{ type: 'spring', damping: 28, stiffness: 180 }}
            className="absolute px-40 w-max h-full flex items-center justify-center"
          >
            <div className="relative flex items-center h-full gap-0">
              {ticks.map((tick) => {
                const isCenter = tick === 0;
                const isMajor = tick % 10 === 0;
                const isMedium = tick % 5 === 0;

                return (
                  <div key={tick} className="flex flex-col items-center justify-center w-[16px] relative select-none">
                    {isCenter ? (
                      <div className="w-[2px] h-6 bg-[#34C759] dark:bg-[#30D158] rounded-full" />
                    ) : isMajor ? (
                      <div className="w-[1.5px] h-5 bg-slate-400 dark:bg-slate-500 rounded-full" />
                    ) : isMedium ? (
                      <div className="w-[1px] h-3.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                    ) : (
                      <div className="w-[1px] h-2 bg-slate-200 dark:bg-slate-700/60 rounded-full" />
                    )}

                    {isMajor && (
                      <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 absolute top-5 whitespace-nowrap">
                        {isCenter ? '0' : tick > 0 ? `+${tick}` : tick}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* User's choice mark (Ваш выбор): absolute line sliding perfectly with the ruler */}
              {isRevealed && evaluatedFreq !== null && (
                <div
                  className="absolute top-0 bottom-0 w-[2.5px] bg-[#FF2D55] z-15 flex flex-col justify-between items-center"
                  style={{
                    left: `calc(50% + ${staticCentsDiff * 8.0}px)`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-[#FF2D55] rounded-full shadow-xs" />
                  <span className="text-[8px] font-extrabold text-white bg-[#FF2D55] px-1.5 py-0.5 rounded-sm absolute top-[-15px] whitespace-nowrap shadow-md z-20">
                    Ваш выбор ({staticCentsDiff > 0 ? `+${staticCentsDiff}` : staticCentsDiff})
                  </span>
                  <div className="w-1.5 h-1.5 bg-[#FF2D55] rounded-full shadow-xs" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Glassmorphism Frosted Mask (Visible only when NOT revealed) */}
          <AnimatePresence>
            {!isRevealed && (
              <motion.div
                key="frosted-glass"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-0 bg-white/60 dark:bg-black/55 backdrop-blur-[12px] z-30 flex items-center justify-center gap-1.5 pointer-events-none"
              >
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-full border border-black/5 dark:border-white/5 shadow-xs">
                  <div className="w-1.5 h-1.5 bg-[#FF9500] dark:bg-[#FFD60A] rounded-full animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 select-none">
                    Шкала скрыта во время настройки
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Real Range Slider Control */}
        <div className="space-y-1">
          <input
            type="range"
            min={sliderBounds.minF}
            max={sliderBounds.maxF}
            step="0.1"
            value={currentFreq}
            onChange={handleSliderChange}
            className="w-full"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">
            <span>◄ Понизить</span>
            <span className="text-[#5856D6] dark:text-[#5E5CE6] font-semibold font-sans">
              {isRevealed ? `Выбрано: ${currentFreq.toFixed(1)} Гц` : 'Калибровка по слуху'}
            </span>
            <span>Повысить ►</span>
          </div>
        </div>
      </div>

      {/* Tactile Frequency Step Adjusters (Clean Arrows Only) */}
      <div className="p-3 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-2xl shadow-sm space-y-2.5">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
          Шаговая коррекция
        </span>
        <div className="grid grid-cols-6 gap-1.5">
          <button
            type="button"
            onClick={() => handleNudge(-15)}
            className="h-11 bg-slate-50 dark:bg-[#2C2C2E] hover:bg-slate-100 dark:hover:bg-[#3A3A3C] active:scale-95 border border-black/5 dark:border-white/5 rounded-xl transition cursor-pointer flex items-center justify-center shadow-xs"
            title="-15 Hz (Крупный сдвиг)"
          >
            <ChevronsLeft className="w-5 h-5 text-[#FF9500] dark:text-[#FFD60A]" />
          </button>
          <button
            type="button"
            onClick={() => handleNudge(-3)}
            className="h-11 bg-slate-50 dark:bg-[#2C2C2E] hover:bg-slate-100 dark:hover:bg-[#3A3A3C] active:scale-95 border border-black/5 dark:border-white/5 rounded-xl transition cursor-pointer flex items-center justify-center shadow-xs"
            title="-3 Hz (Средний сдвиг)"
          >
            <ChevronLeft className="w-5 h-5 text-[#FF9500] dark:text-[#FFD60A]" />
          </button>
          <button
            type="button"
            onClick={() => handleNudge(-0.5)}
            className="h-11 bg-slate-50 dark:bg-[#2C2C2E] hover:bg-slate-100 dark:hover:bg-[#3A3A3C] active:scale-95 border border-black/5 dark:border-white/5 rounded-xl transition cursor-pointer flex items-center justify-center shadow-xs"
            title="-0.5 Hz (Микрошаг)"
          >
            <ChevronLeft className="w-4 h-4 text-[#34C759] dark:text-[#30D158] opacity-60" />
          </button>
          <button
            type="button"
            onClick={() => handleNudge(0.5)}
            className="h-11 bg-slate-50 dark:bg-[#2C2C2E] hover:bg-slate-100 dark:hover:bg-[#3A3A3C] active:scale-95 border border-black/5 dark:border-white/5 rounded-xl transition cursor-pointer flex items-center justify-center shadow-xs"
            title="+0.5 Hz (Микрошаг)"
          >
            <ChevronRight className="w-4 h-4 text-[#34C759] dark:text-[#30D158] opacity-60" />
          </button>
          <button
            type="button"
            onClick={() => handleNudge(3)}
            className="h-11 bg-slate-50 dark:bg-[#2C2C2E] hover:bg-slate-100 dark:hover:bg-[#3A3A3C] active:scale-95 border border-black/5 dark:border-white/5 rounded-xl transition cursor-pointer flex items-center justify-center shadow-xs"
            title="+3 Hz (Средний сдвиг)"
          >
            <ChevronRight className="w-5 h-5 text-[#FF9500] dark:text-[#FFD60A]" />
          </button>
          <button
            type="button"
            onClick={() => handleNudge(15)}
            className="h-11 bg-slate-50 dark:bg-[#2C2C2E] hover:bg-slate-100 dark:hover:bg-[#3A3A3C] active:scale-95 border border-black/5 dark:border-white/5 rounded-xl transition cursor-pointer flex items-center justify-center shadow-xs"
            title="+15 Hz (Крупный сдвиг)"
          >
            <ChevronsRight className="w-5 h-5 text-[#FF9500] dark:text-[#FFD60A]" />
          </button>
        </div>
      </div>

      {/* Control Action Buttons Bar */}
      <div className="flex items-center gap-2">
        {/* Generator Toggle */}
        <button
          type="button"
          onClick={handleToggleGenerator}
          className={`flex-1 h-12 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-sm ${
            isActive
              ? 'bg-[#FF3B30] dark:bg-[#FF453A] text-white animate-pulse'
              : 'bg-slate-100 dark:bg-[#2C2C2E] text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-[#3A3A3C]'
          }`}
        >
          {isActive ? (
            <>
              <VolumeX className="w-4 h-4 shrink-0" />
              <span>Звук ВКЛ (Выкл)</span>
              <kbd className="hidden sm:inline-block ml-1 text-[9px] px-1.5 py-0.5 rounded bg-black/20 text-white font-mono leading-none">
                Space
              </kbd>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 shrink-0" />
              <span>Включить звук</span>
              <kbd className="hidden sm:inline-block ml-1 text-[9px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400 font-mono leading-none">
                Space
              </kbd>
            </>
          )}
        </button>

        {/* Check or Next Action Button */}
        {!isRevealed ? (
          <button
            type="button"
            onClick={handleEvaluate}
            className="flex-1 h-12 bg-[#5856D6] dark:bg-[#5E5CE6] hover:bg-[#4B49C1] dark:hover:bg-[#4D4AC7] text-white rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Проверить</span>
            <kbd className="hidden sm:inline-block ml-0.5 text-[9px] px-1.5 py-0.5 rounded bg-white/20 text-white font-mono leading-none">
              Enter
            </kbd>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleRandomize}
            className="flex-1 h-12 bg-[#34C759] dark:bg-[#30D158] hover:bg-[#28A745] dark:hover:bg-[#24963E] text-white rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>Дальше</span>
            <kbd className="hidden sm:inline-block ml-0.5 text-[9px] px-1.5 py-0.5 rounded bg-white/20 text-white font-mono leading-none">
              Enter
            </kbd>
          </button>
        )}

        {/* Reference Piano Play Button */}
        <button
          type="button"
          onClick={handlePlayReferencePiano}
          className="h-12 w-12 bg-slate-50 dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-2xl flex items-center justify-center transition cursor-pointer shrink-0 shadow-sm hover:bg-slate-150 dark:hover:bg-[#2C2C2E]"
          title={`Слушать эталон ${activeTargetNote.id} на пианино`}
        >
          <Music className="w-4 h-4 text-[#FF9500] dark:text-[#FFD60A] shrink-0" />
        </button>
      </div>

      {/* Elegant History Attempt Log */}
      {history.length > 0 && (
        <div className="pt-2 space-y-2 border-t border-black/5 dark:border-white/5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            История калибровки (последние попытки)
          </span>
          <div className="space-y-1.5">
            {history.map((item, idx) => {
              const cents = item.cents;
              const isExcellent = Math.abs(cents) <= 15;
              const isVeryClose = Math.abs(cents) <= 40;

              return (
                <div
                  key={idx}
                  className="p-2.5 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-xl text-xs flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#5856D6] dark:text-[#5E5CE6]">{item.noteName}</span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">{item.freq.toFixed(1)} Hz</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-500">
                      {cents > 0 ? `+${cents}` : cents} cents
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isExcellent
                          ? 'bg-[#E8F8EE] text-[#248A3D]'
                          : isVeryClose
                          ? 'bg-[#FFF4E5] text-[#C97800]'
                          : 'bg-[#FDE8E8] text-[#D70015]'
                      }`}
                    >
                      {item.scoreText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
