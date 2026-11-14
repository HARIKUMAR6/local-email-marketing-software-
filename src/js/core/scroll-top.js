// Floating scroll-to-top button (injected once per page).
import { icon } from '../components/icons.js';

export const initScrollTop = ({ threshold = 400 } = {}) => {
  if (document.querySelector('.scroll-top')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'scroll-top';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = icon('arrowUp');
  document.body.append(btn);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false;
  const update = () => {
    const show = window.scrollY > threshold;
    btn.classList.toggle('is-visible', show);
    btn.tabIndex = show ? 0 : -1;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' }));
  update();
};
