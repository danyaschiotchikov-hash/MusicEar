import React, { useEffect, useRef } from 'react';
import { Trophy, Sparkles, Flame, Award, X } from 'lucide-react';

interface CelebrationEffectsProps {
  active: boolean;
  type: 'level_up' | 'new_record' | 'milestone';
  levelNumber?: number;
  levelTitle?: string;
  streakCount?: number;
  onClose: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: 'rect' | 'circle' | 'note' | 'star';
  char?: string;
  alpha: number;
  decay: number;
}

const NOTE_CHARS = ['♪', '♫', '♬', '♩', '★', '✨'];
const CELEBRATION_COLORS = [
  '#f59e0b', // Amber / Gold
  '#fbbf24', // Warm Gold
  '#10b981', // Emerald
  '#38bdf8', // Sky Blue
  '#818cf8', // Indigo
  '#f43f5e', // Rose
  '#c084fc', // Purple
  '#ffffff', // Sparkle white
];

export const CelebrationEffects: React.FC<CelebrationEffectsProps> = ({
  active,
  type,
  levelNumber,
  levelTitle,
  streakCount,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Spawn 100-140 festive particles
    const particleCount = 120;
    const newParticles: Particle[] = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.45;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      const shapes: ('rect' | 'circle' | 'note' | 'star')[] = ['rect', 'circle', 'note', 'star'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const char = shape === 'note' || shape === 'star'
        ? NOTE_CHARS[Math.floor(Math.random() * NOTE_CHARS.length)]
        : undefined;

      newParticles.push({
        x: centerX + (Math.random() - 0.5) * 80,
        y: centerY + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.4),
        vy: Math.sin(angle) * speed - (Math.random() * 5 + 3), // upward explosion
        size: Math.random() * 12 + 6,
        color: CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        shape,
        char,
        alpha: 1.0,
        decay: Math.random() * 0.008 + 0.006,
      });
    }

    particlesRef.current = newParticles;

    let lastTime = performance.now();
    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let aliveCount = 0;
      const gravity = 180; // px/s^2

      for (const p of particlesRef.current) {
        if (p.alpha <= 0.01) continue;
        aliveCount++;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += gravity * dt * 0.06;
        p.rotation += p.vRot;
        p.alpha = Math.max(0, p.alpha - p.decay);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;

        if (p.char) {
          ctx.font = `bold ${p.size * 1.5}px sans-serif`;
          ctx.fillStyle = p.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.char, 0, 0);
        } else if (p.shape === 'rect') {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }

        ctx.restore();
      }

      if (aliveCount > 0) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    // Auto-dismiss after 4.5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => {
      clearTimeout(timer);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [active, onClose]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
      {/* Canvas for particle burst */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Floating Triumph Banner with pointer-events-auto */}
      <div className="relative pointer-events-auto bg-slate-900/95 border-2 border-amber-400/90 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-amber-500/30 text-center max-w-sm w-full mx-auto flex flex-col items-center gap-3 animate-in zoom-in-95 fade-in duration-300 backdrop-blur-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Glow */}
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/50 animate-bounce">
            {type === 'new_record' ? (
              <Trophy className="w-9 h-9 sm:w-11 sm:h-11 text-slate-950 fill-slate-950" />
            ) : type === 'level_up' ? (
              <Award className="w-9 h-9 sm:w-11 sm:h-11 text-slate-950" />
            ) : (
              <Flame className="w-9 h-9 sm:w-11 sm:h-11 text-slate-950 fill-slate-950" />
            )}
          </div>
          <Sparkles className="w-6 h-6 text-amber-300 absolute -top-2 -right-2 animate-spin" />
        </div>

        {/* Header Text */}
        <div>
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-400 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30 inline-block mb-1">
            {type === 'new_record'
              ? 'Новый рекорд марафона!'
              : type === 'level_up'
              ? 'Повышение ранга!'
              : 'Юбилейная серия!'}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {type === 'level_up' && levelTitle
              ? `Ранг: ${levelTitle}`
              : type === 'new_record'
              ? `Серия ${streakCount} подряд!`
              : `Серия ${streakCount} ответов!`}
          </h3>
          {levelNumber && type === 'level_up' && (
            <p className="text-xs sm:text-sm text-indigo-300 font-semibold mt-0.5">
              Уровень {levelNumber} достигнут
            </p>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed px-2">
          {type === 'new_record'
            ? 'Превосходная концентрация и абсолютная точность слуха!'
            : type === 'level_up'
            ? 'Ваш гармонический слух перешел на новую академическую ступень.'
            : 'Отличный ритм! Продолжайте держать фокус.'}
        </p>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="mt-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-md transition transform active:scale-95 cursor-pointer"
        >
          Продолжить марафон ✨
        </button>
      </div>
    </div>
  );
};
