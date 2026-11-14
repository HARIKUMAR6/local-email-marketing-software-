// Login portal entry. No public header or footer on this page.
import { initTheme } from './core/theme.js';
import { initDirection } from './core/direction.js';
import { hydrateIcons } from './components/icons.js';
import { initAuth } from './auth/auth.js';

hydrateIcons();
initAuth();
initTheme();
initDirection();
