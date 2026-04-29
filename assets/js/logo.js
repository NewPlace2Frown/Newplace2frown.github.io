// Logo wordmark animation:
// 1. Reveal NEW / PLACE / II / FROWN line-by-line at ~70ms intervals.
// 2. Once revealed, FROWN cycles through 4 EB Garamond styles forever.
// 3. After a full FROWN cycle, fade everything out and restart so the
//    whole loop matches the GIF behaviour the wordmark replaces.
//
// Respects prefers-reduced-motion: shows everything statically, no cycling.
(() => {
  const wordmark = document.querySelector('.logo-wordmark');
  if (!wordmark) return;

  const lines = [...wordmark.querySelectorAll('.logo-line')];
  const frown = wordmark.querySelector('.logo-frown');
  if (lines.length === 0 || !frown) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    lines.forEach(l => l.classList.add('is-visible'));
    return;
  }

  // FROWN font cycle within the field-journal type system.
  const frownStyles = [
    { fontWeight: 700, fontStyle: 'normal' },
    { fontWeight: 700, fontStyle: 'italic' },
    { fontWeight: 400, fontStyle: 'normal' },
    { fontWeight: 400, fontStyle: 'italic' }
  ];

  const REVEAL_STEP_MS = 70;
  const FROWN_STEP_MS = 700;
  const FROWN_HOLD_AFTER_CYCLE_MS = 1200;
  const RESET_FADE_MS = 500;

  let cancelled = false;
  let timeouts = [];

  const wait = (ms) => new Promise(resolve => {
    const t = setTimeout(resolve, ms);
    timeouts.push(t);
  });

  const clearAllTimers = () => {
    timeouts.forEach(t => clearTimeout(t));
    timeouts = [];
  };

  const applyFrownStyle = (style) => {
    frown.style.fontWeight = style.fontWeight;
    frown.style.fontStyle = style.fontStyle;
  };

  async function loop() {
    while (!cancelled) {
      // Reset
      lines.forEach(l => l.classList.remove('is-visible'));
      applyFrownStyle(frownStyles[0]);
      await wait(120);

      // Reveal each line
      for (const line of lines) {
        if (cancelled) return;
        line.classList.add('is-visible');
        await wait(REVEAL_STEP_MS);
      }

      // Cycle FROWN through every style
      for (const style of frownStyles) {
        if (cancelled) return;
        applyFrownStyle(style);
        await wait(FROWN_STEP_MS);
      }

      // Hold the final state, then fade out and restart
      await wait(FROWN_HOLD_AFTER_CYCLE_MS);
      lines.forEach(l => l.classList.remove('is-visible'));
      await wait(RESET_FADE_MS);
    }
  }

  loop();

  // Pause the animation when the tab is hidden — saves cycles, also avoids
  // visual jitter when refocusing.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelled = true;
      clearAllTimers();
    } else {
      cancelled = false;
      loop();
    }
  });
})();
