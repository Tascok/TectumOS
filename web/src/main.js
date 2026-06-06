// TectumOS — Main Application Entry Point

import { route, startRouter, navigate } from './router.js';
import { api, isAuthenticated } from './api.js';
import { restoreTheme } from './components/TopBar.js';
import { renderSetup } from './pages/Setup.js';
import { renderLogin } from './pages/Login.js';
import { renderDashboard } from './pages/Dashboard.js';
import { renderAppStore } from './pages/AppStore.js';
import { renderMyApps } from './pages/MyApps.js';
import { renderStorage } from './pages/Storage.js';

async function init() {
  restoreTheme();

  // Register routes
  route('/setup', renderSetup);
  route('/login', renderLogin);
  route('/', renderDashboard);
  route('/dashboard', renderDashboard);
  route('/store', renderAppStore);
  route('/apps', renderMyApps);
  route('/storage', renderStorage);

  route('/hermes', async (container) => {
    container.innerHTML = `<div class="app-layout">
      ${createPlaceholderPage('Hermes AI', 'A integração com o Hermes Agent será implementada na Fase 4.', 'hermes')}
    </div>`;
  });

  // Determine initial route
  try {
    const status = await api.getStatus();
    
    if (status.needs_setup) {
      navigate('/setup');
    } else if (!isAuthenticated()) {
      navigate('/login');
    } else {
      // Verify token is still valid
      try {
        await api.me();
        if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#') {
          navigate('/dashboard');
        }
      } catch {
        navigate('/login');
      }
    }
  } catch (err) {
    console.error('Failed to check system status:', err);
    // If backend is down, still try to show something
    if (isAuthenticated()) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }

  startRouter();
}

function createPlaceholderPage(title, description, id) {
  return `
    <div style="flex: 1; display: flex; align-items: center; justify-content: center; min-height: 100vh;">
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;">🚧</div>
        <h2 style="font-size: var(--text-xl); font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">${title}</h2>
        <p style="color: var(--text-secondary); font-size: var(--text-sm);">${description}</p>
        <a href="#/dashboard" class="btn mt-6" style="margin-top: 24px; display: inline-flex;">← Voltar ao Dashboard</a>
      </div>
    </div>
  `;
}

// Start the app
init();
