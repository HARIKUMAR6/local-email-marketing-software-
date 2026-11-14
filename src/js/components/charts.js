// Chart helpers: heatmaps are generated from a deterministic pattern so markup stays small.
import { $$ } from '../core/dom.js';

export const initCharts = () => {
  // [data-heatmap="rows"] → rows × 12 grid; intensity peaks around mid-morning and early evening.
  $$('[data-heatmap]').forEach((el) => {
    const rows = +el.dataset.heatmap || 5;
    let html = '';
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < 12; c += 1) {
        const am = Math.exp(-((c - 3) ** 2) / 4);
        const pm = Math.exp(-((c - 9) ** 2) / 3) * 0.8;
        const day = [0.85, 1, 0.9, 0.7, 0.55, 0.35, 0.25][r % 7];
        const v = Math.min(1, (am + pm) * day + 0.06);
        html += `<i style="opacity:${(0.12 + v * 0.88).toFixed(2)}"></i>`;
      }
    }
    el.innerHTML = html;
    el.setAttribute('aria-hidden', 'true');
  });
};
