// OpenStreetMap embed with loading and error states.
// <div class="map-frame" data-map data-src="…embed url…"> with a .map-status child and an <iframe loading="lazy">.
// The iframe is natively lazy, so the third-party map is only fetched when it nears the viewport.
import { $, $$ } from '../core/dom.js';

const TIMEOUT_MS = 15000;

const initMap = (box) => {
  const frame = $('iframe', box);
  const text = $('.map-status [data-map-text]', box);
  box.dataset.state = 'loading';

  const fail = () => {
    if (box.dataset.state === 'ready') return;
    box.dataset.state = 'error';
    if (text) text.textContent = 'The map could not be loaded. Use “Open larger map” to view it in a new tab.';
  };

  frame.addEventListener('load', () => { box.dataset.state = 'ready'; });
  frame.addEventListener('error', fail);
  frame.src = box.dataset.src;
  setTimeout(fail, TIMEOUT_MS);
};

export const initMaps = () => $$('[data-map]').forEach(initMap);
