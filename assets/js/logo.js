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

  // FROWN cycle — Bowlby is single-weight, so we vary letter-spacing and
  // periodically swap to alternate faces. CSS handles the transitions.
  const frownStyles = [
    { letterSpacing: '-0.015em', alt: null },        // 1. base Bowlby
    { letterSpacing: '0.02em',   alt: null },        // 2. ease open
    { letterSpacing: '0.08em',   alt: null },        // 3. pulse wide
    { letterSpacing: '-0.025em', alt: 'inter' },     // 4. swap to Inter
    { letterSpacing: '0.02em',   alt: 'inter' },     // 5. Inter wide
    { letterSpacing: '0',        alt: 'serif' },     // 6. swap to serif
    { letterSpacing: '0.04em',   alt: 'serif' },     // 7. serif wide
    { letterSpacing: '-0.015em', alt: null }         // 8. back to base
  ];

  const REVEAL_STEP_MS = 140;            // slower line-by-line reveal
  const FROWN_STEP_MS = 450;             // each FROWN variant beat
  const FROWN_HOLD_AFTER_CYCLE_MS = 350; // brief hold before reset
  const RESET_FADE_MS = 280;             // quicker fade out

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
    frown.style.letterSpacing = style.letterSpacing;
    if (style.alt) {
      frown.dataset.alt = style.alt;
    } else {
      delete frown.dataset.alt;
    }
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
