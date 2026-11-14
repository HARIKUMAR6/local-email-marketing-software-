// Dashboard application entry. Frontend only: data and actions are simulated in the browser.
import { initTheme } from './core/theme.js';
import { initDirection } from './core/direction.js';
import { hydrateIcons } from './components/icons.js';
import { initDropdowns } from './components/dropdown.js';
import { initSidebar } from './dashboard/sidebar.js';
import { initTopbar } from './dashboard/topbar.js';
import { initRouter, go } from './dashboard/router.js';
import { initTabs } from './dashboard/ui.js';

initSidebar();
initTopbar({ go });
initTabs(document.getElementById('view'));
initRouter();
initTheme();
initDirection();
initDropdowns();
hydrateIcons();
