// TectumOS Sidebar Component
import { escapeHTML } from '../utils.js';

// SVG icons (inline, no dependencies)
const icons = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="4" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="11" width="7" height="10" rx="1"/></svg>`,
  store: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l1-4h16l1 4"/><path d="M3 9v10a1 1 0 001 1h16a1 1 0 001-1V9"/><path d="M9 21V13h6v8"/><path d="M3 9c0 1.1.9 2 2 2s2-.9 2-2"/><path d="M7 9c0 1.1.9 2 2 2s2-.9 2-2"/><path d="M11 9c0 1.1.9 2 2 2s2-.9 2-2"/><path d="M15 9c0 1.1.9 2 2 2s2-.9 2-2"/></svg>`,
  apps: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  storage: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>`,
  hermes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2a8 8 0 018 8v2a8 8 0 01-16 0v-2a8 8 0 018-8z"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><path d="M9 14c.83 1.2 2.17 2 3 2s2.17-.8 3-2"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
};

export function createSidebar(activePage) {
  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard, path: '/dashboard' },
    { id: 'appstore', label: 'App Store', icon: icons.store, path: '/store' },
    { id: 'myapps', label: 'Meus Apps', icon: icons.apps, path: '/apps' },
    { id: 'storage', label: 'Storage', icon: icons.storage, path: '/storage' },
    { id: 'hermes', label: 'Hermes AI', icon: icons.hermes, path: '/hermes' },
  ];

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <img src="/logo.png" alt="TectumOS Logo" style="width: 44px; height: 44px; border-radius: var(--radius-sm); filter: drop-shadow(0 0 8px rgba(129, 140, 248, 0.5)); transition: filter 0.3s;" />
        <span>TectumOS</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section-label">Menu</div>
      ${nav.map(item => `
        <a href="#${item.path}" class="nav-item ${activePage === item.id || activePage === item.path.substring(1) ? 'active' : ''}" data-link>
          ${item.icon}
          <span>${escapeHTML(item.label)}</span>
        </a>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <a href="/settings" class="nav-item" data-link>
        ${icons.settings}
        <span>Configurações</span>
      </a>
    </div>
  `;

  return sidebar;
}
