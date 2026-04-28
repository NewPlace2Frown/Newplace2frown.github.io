// Cross-fades hero frames at a fixed interval. Pure JS, no deps.
(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const frames = [...hero.querySelectorAll('.hero-frame')];
  if (frames.length < 2) return;
  const interval = parseInt(hero.dataset.interval, 10) || 9000;
  let i = 0;
  setInterval(() => {
    frames[i].classList.remove('is-active');
    i = (i + 1) % frames.length;
    frames[i].classList.add('is-active');
  }, interval);
})();
