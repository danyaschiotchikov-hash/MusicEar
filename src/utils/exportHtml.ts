import { ALL_ITEMS, CATEGORIES } from '../data/musicData';

export function generateStandaloneHtml(): string {
  const itemsJson = JSON.stringify(ALL_ITEMS, null, 2);
  const categoriesJson = JSON.stringify(CATEGORIES, null, 2);

  return `<!DOCTYPE html>
<html lang="ru" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Тренажер музыкального слуха — Автономная версия</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.6); }
    ::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.4); border-radius: 9999px; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen antialiased p-3 sm:p-5 lg:p-6 select-none">
  <div id="app" class="max-w-6xl mx-auto space-y-4">
    <!-- Header -->
    <header class="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-xl">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 text-xl font-bold">🎵</div>
        <div>
          <h1 class="text-base sm:text-lg font-extrabold tracking-tight text-white">Тренажер музыкального слуха</h1>
          <p class="text-[11px] sm:text-xs text-slate-400">Интервалы, аккорды, гаммы и народные лады с психоакустическим движком</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span id="score-badge" class="font-mono text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
          Точность: 0% (0/0)
        </span>
      </div>
    </header>

    <!-- Top Settings -->
    <section class="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-3 shadow-lg">
      <div class="flex flex-wrap items-center justify-between gap-2.5">
        <span class="text-xs uppercase tracking-wider font-semibold text-slate-400">Параметры звучания:</span>
        <div class="flex items-center gap-2 flex-wrap">
          <select id="ctrl-style" class="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 cursor-pointer">
            <option value="arpeggio">🎶 Арпеджио</option>
            <option value="harmonic">🎹 Гармонически</option>
          </select>
          <select id="ctrl-direction" class="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 cursor-pointer">
            <option value="up">⬆️ Снизу вверх</option>
            <option value="down">⬇️ Сверху вниз</option>
            <option value="random">🔀 Случайно</option>
          </select>
          <select id="ctrl-root" class="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 cursor-pointer">
            <option value="random">🎲 Случайный тон</option>
            <option value="C">C (До)</option>
            <option value="D">D (Ре)</option>
            <option value="E">E (Ми)</option>
            <option value="F">F (Фа)</option>
            <option value="G">G (Соль)</option>
            <option value="A">A (Ля)</option>
            <option value="B">B (Си)</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-800/80">
        <div>
          <div class="flex justify-between text-slate-300 mb-1"><span>⏱️ Темп</span><span id="val-tempo" class="font-mono text-indigo-400">1.00x</span></div>
          <input id="slider-tempo" type="range" min="0.3" max="1.8" step="0.05" value="1.0" class="w-full accent-indigo-500 cursor-pointer">
        </div>
        <div>
          <div class="flex justify-between text-slate-300 mb-1"><span>🌊 Наслоение</span><span id="val-resonance" class="font-mono text-cyan-400">0.80</span></div>
          <input id="slider-resonance" type="range" min="0.0" max="2.0" step="0.05" value="0.8" class="w-full accent-cyan-500 cursor-pointer">
        </div>
        <div>
          <div class="flex justify-between text-slate-300 mb-1"><span>📉 Затухание</span><span id="val-decay" class="font-mono text-violet-400">1.00s</span></div>
          <input id="slider-decay" type="range" min="0.2" max="3.0" step="0.05" value="1.0" class="w-full accent-violet-500 cursor-pointer">
        </div>
        <div>
          <div class="flex justify-between text-slate-300 mb-1"><span>🔊 Громкость</span><span id="val-volume" class="font-mono text-emerald-400">80%</span></div>
          <input id="slider-volume" type="range" min="0.0" max="1.0" step="0.05" value="0.8" class="w-full accent-emerald-500 cursor-pointer">
        </div>
      </div>
    </section>

    <!-- Quick Presets -->
    <div class="bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="text-slate-400 uppercase font-semibold text-[11px] mr-1">Наборы:</span>
        <button onclick="setFilterCategory('all')" class="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-semibold cursor-pointer">Все категории</button>
        <button onclick="setFilterCategory('simple_intervals')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer">Интервалы</button>
        <button onclick="setFilterCategory('triads')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer">Трезвучия</button>
        <button onclick="setFilterCategory('seventh_chords')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer">Септаккорды</button>
        <button onclick="setFilterCategory('scales')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer">Гаммы</button>
        <button onclick="setFilterCategory('modes')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer">Лады</button>
      </div>
    </div>

    <!-- Main Training Stage -->
    <main class="space-y-4">
      <div class="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-3.5 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div id="status-badge" class="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/60 text-slate-300 font-semibold text-xs sm:text-sm border border-slate-800">
          🎵 Нажмите «▶️ Новый вопрос» или Пробел
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-new" class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-950 flex items-center gap-1.5 cursor-pointer">
            ▶️ Новый
          </button>
          <button id="btn-replay" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer" disabled>
            🔁 Повтор
          </button>
        </div>
      </div>

      <!-- Categorized Answer Container -->
      <div id="categories-container" class="space-y-4"></div>
    </main>
  </div>

  <script>
    const ALL_ITEMS = ${itemsJson};
    const CATEGORIES = ${categoriesJson};

    const state = {
      currentTask: null,
      filterCategory: 'all',
      settings: {
        timbre: 'triangle',
        tempo: 1.2,
        resonance: 2.0,
        decay: 2.5,
        volume: 0.85,
        style: 'arpeggio',
        direction: 'up',
        rootNote: 'random'
      },
      stats: { totalTested: 0, totalCorrect: 0 }
    };

    let audioCtx = null;
    function getAudioCtx() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    }

    function midiToFreq(m) {
      return 440 * Math.pow(2, (m - 69) / 12);
    }

    // Playback with true legato for scales & modes
    function playItem(item, rootMidi) {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      let semitones = [...item.semitones];

      if (state.settings.direction === 'random') {
        if (Math.random() > 0.5) semitones.reverse();
      } else if (state.settings.direction === 'down') {
        semitones.reverse();
      }

      const isScale = item.category === 'scales' || item.category === 'modes';
      const isChar = item.category === 'characteristic_intervals';

      if (isChar) {
        const charTempo = Math.max(0.3, state.settings.tempo * 1.25);
        const pairStep = 0.28 / charTempo;
        const dur = (0.28 / charTempo) * (1.2 + state.settings.resonance * 1.5);
        // First pair: characteristic interval (2 notes with layering)
        playSynthNote(rootMidi + (item.semitones[0] || 0), now, dur, 1.2, false, false);
        playSynthNote(rootMidi + (item.semitones[1] || 6), now + pairStep, dur, 1.2, false, false);

        // Gap between interval and resolution
        const resOffset = pairStep * 2 + 0.12;
        const resSemitones = item.resolutionSemitones || [0, 5];
        playSynthNote(rootMidi + (resSemitones[0] || 0), now + resOffset, dur, 1.1, false, false);
        playSynthNote(rootMidi + (resSemitones[1] || 5), now + resOffset + pairStep, dur, 1.1, false, false);
        return;
      }

      // True legato playback for scales and modes
      if (isScale) {
        const step = 0.38 / state.settings.tempo;
        semitones.forEach((s, idx) => {
          const isLast = idx === semitones.length - 1;
          playSynthNote(rootMidi + s, now + idx * step, step, 1.0, true, isLast);
        });
        return;
      }

      if (state.settings.style === 'harmonic') {
        const dur = 1.3 / state.settings.tempo;
        semitones.forEach(s => playSynthNote(rootMidi + s, now, dur, (s === 3 || s === 4) ? 1.3 : 1.0, false, false));
      } else {
        const step = 0.34 / state.settings.tempo;
        const dur = step * (1.2 + state.settings.resonance * 1.5);
        semitones.forEach((s, idx) => {
          playSynthNote(rootMidi + s, now + idx * step, dur, (s === 3 || s === 4) ? 1.3 : 1.0, false, false);
        });
      }
    }

    // Synthesis engine with piano legato envelope
    function playSynthNote(midi, startTime, duration, boost, isLegato, isLastNote) {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const freq = midiToFreq(midi);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(5000, freq * 4.5), startTime);

      const vol = 0.45 * state.settings.volume * boost;
      let stopTime = startTime + duration * state.settings.decay + 0.05;

      if (isLegato) {
        const overlap = Math.min(0.065, duration * 0.18);
        if (isLastNote) {
          const lastDur = duration * 1.8 * state.settings.decay;
          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.exponentialRampToValueAtTime(vol, startTime + 0.01);
          gain.gain.exponentialRampToValueAtTime(vol * 0.75, startTime + duration);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + lastDur);
          stopTime = startTime + lastDur + 0.05;
        } else {
          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.exponentialRampToValueAtTime(vol, startTime + 0.008);
          gain.gain.exponentialRampToValueAtTime(vol * 0.85, startTime + duration);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + overlap);
          stopTime = startTime + duration + overlap + 0.02;
        }
      } else {
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(vol, startTime + 0.006);
        gain.gain.exponentialRampToValueAtTime(vol * 0.6, startTime + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * state.settings.decay);
      }

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc2.start(startTime);
      osc.stop(stopTime);
      osc2.stop(stopTime);
    }

    // Render answer grid divided into categories
    function renderGrid() {
      const container = document.getElementById('categories-container');
      container.innerHTML = '';

      const catsToDisplay = state.filterCategory === 'all'
        ? CATEGORIES
        : CATEGORIES.filter(c => c.id === state.filterCategory);

      catsToDisplay.forEach(cat => {
        const catItems = ALL_ITEMS.filter(i => i.category === cat.id);
        if (catItems.length === 0) return;

        const section = document.createElement('section');
        section.className = 'bg-slate-900/60 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3';

        // Section header
        const header = document.createElement('div');
        header.className = 'flex items-center justify-between pb-2 border-b border-slate-800/80';
        header.innerHTML = '<div class="flex items-center gap-2"><h3 class="text-xs sm:text-sm font-bold text-slate-200">' + cat.name + '</h3><span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-semibold">' + catItems.length + ' эл.</span></div><span class="text-[11px] text-slate-400">' + cat.shortDesc + '</span>';
        section.appendChild(header);

        // Buttons grid
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5';

        catItems.forEach(item => {
          const btn = document.createElement('button');
          btn.className = 'p-2.5 sm:p-3 rounded-xl border border-slate-800/90 bg-slate-950/70 hover:bg-slate-800/80 text-left transition flex flex-col justify-between min-h-[64px] cursor-pointer';
          btn.id = 'btn-item-' + item.id;

          let hintText = item.hint || '';
          if (!hintText) {
            if (item.category === 'simple_intervals') hintText = item.semitones[item.semitones.length - 1] + ' п/т';
            else if (item.category === 'triads' || item.category === 'seventh_chords') hintText = item.semitones.length + ' зв.';
          }

          btn.innerHTML = '<div class="font-bold text-xs sm:text-sm text-slate-200 leading-tight">' + item.shortName + '</div><div class="flex justify-between items-center mt-2 text-[10px] text-slate-400 gap-1"><span class="truncate">' + item.name.split(' ')[0] + '</span>' + (hintText ? '<span class="px-1.5 py-0.5 bg-slate-900 border border-slate-700/60 font-mono rounded text-[9px] text-slate-300 shrink-0">' + hintText + '</span>' : '') + '</div>';
          btn.onclick = () => handleAnswer(item);
          grid.appendChild(btn);
        });

        section.appendChild(grid);
        container.appendChild(section);
      });
    }

    function setFilterCategory(catId) {
      state.filterCategory = catId;
      renderGrid();
    }

    function handleAnswer(item) {
      if (!state.currentTask || state.currentTask.answered) return;
      state.currentTask.answered = true;
      const isCorrect = state.currentTask.item.id === item.id;
      state.stats.totalTested++;
      if (isCorrect) state.stats.totalCorrect++;

      const pct = Math.round((state.stats.totalCorrect / state.stats.totalTested) * 100);
      document.getElementById('score-badge').textContent = 'Точность: ' + pct + '% (' + state.stats.totalCorrect + '/' + state.stats.totalTested + ')';

      const statusBadge = document.getElementById('status-badge');
      if (isCorrect) {
        statusBadge.className = 'flex-1 px-4 py-2.5 rounded-xl bg-emerald-950/80 text-emerald-200 font-semibold text-xs sm:text-sm border border-emerald-500 shadow-lg shadow-emerald-950/40';
        statusBadge.textContent = '✅ Верно! Это «' + state.currentTask.item.name + '» (тоника: ' + state.currentTask.rootName + ')';
        const el = document.getElementById('btn-item-' + item.id);
        if (el) el.classList.add('bg-emerald-950', 'border-emerald-400', 'ring-2', 'ring-emerald-500');
      } else {
        statusBadge.className = 'flex-1 px-4 py-2.5 rounded-xl bg-rose-950/80 text-rose-200 font-semibold text-xs sm:text-sm border border-rose-500 shadow-lg shadow-rose-950/40';
        statusBadge.textContent = '❌ Ошибка! Правильный ответ: «' + state.currentTask.item.name + '» (тоника: ' + state.currentTask.rootName + ')';
        const el = document.getElementById('btn-item-' + item.id);
        if (el) el.classList.add('bg-rose-950', 'border-rose-400', 'ring-2', 'ring-rose-500');
        const correctEl = document.getElementById('btn-item-' + state.currentTask.item.id);
        if (correctEl) correctEl.classList.add('bg-emerald-950', 'border-emerald-400', 'ring-2', 'ring-emerald-500');
      }
    }

    const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'];

    function startNewQuestion() {
      const idx = Math.floor(Math.random() * ALL_ITEMS.length);
      const item = ALL_ITEMS[idx];

      let rootMidi = 60;
      if (state.settings.rootNote === 'random') {
        rootMidi = 55 + Math.floor(Math.random() * 14);
      } else {
        const offsets = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
        rootMidi = 60 + (offsets[state.settings.rootNote] || 0);
      }

      const rootName = NOTE_NAMES[rootMidi % 12];
      state.currentTask = { item, rootMidi, rootName, answered: false };

      document.getElementById('btn-replay').disabled = false;
      const statusBadge = document.getElementById('status-badge');
      statusBadge.className = 'flex-1 px-4 py-2.5 rounded-xl bg-indigo-950/70 text-indigo-200 font-semibold text-xs sm:text-sm border border-indigo-500/80 animate-pulse';
      statusBadge.textContent = '🎧 Слушайте внимательно...';

      renderGrid();
      playItem(item, rootMidi);
    }

    // Attach listeners
    document.getElementById('btn-new').onclick = startNewQuestion;
    document.getElementById('btn-replay').onclick = () => {
      if (state.currentTask) playItem(state.currentTask.item, state.currentTask.rootMidi);
    };

    // Sliders
    document.getElementById('slider-tempo').oninput = (e) => {
      state.settings.tempo = parseFloat(e.target.value);
      document.getElementById('val-tempo').textContent = state.settings.tempo.toFixed(2) + 'x';
    };
    document.getElementById('slider-resonance').oninput = (e) => {
      state.settings.resonance = parseFloat(e.target.value);
      document.getElementById('val-resonance').textContent = state.settings.resonance.toFixed(2);
    };
    document.getElementById('slider-decay').oninput = (e) => {
      state.settings.decay = parseFloat(e.target.value);
      document.getElementById('val-decay').textContent = state.settings.decay.toFixed(2) + 's';
    };
    document.getElementById('slider-volume').oninput = (e) => {
      state.settings.volume = parseFloat(e.target.value);
      document.getElementById('val-volume').textContent = Math.round(state.settings.volume * 100) + '%';
    };

    // Selects
    document.getElementById('ctrl-style').onchange = (e) => state.settings.style = e.target.value;
    document.getElementById('ctrl-direction').onchange = (e) => state.settings.direction = e.target.value;
    document.getElementById('ctrl-root').onchange = (e) => state.settings.rootNote = e.target.value;

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (state.currentTask) playItem(state.currentTask.item, state.currentTask.rootMidi);
      } else if (e.key === 'n' || e.key === 'N' || e.key === 'т' || e.key === 'Т') {
        startNewQuestion();
      }
    });

    renderGrid();
  <\/script>
</body>
</html>`;
}

export function downloadStandaloneHtmlFile() {
  const html = generateStandaloneHtml();
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ear-trainer-standalone.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

