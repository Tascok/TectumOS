// TectumOS TopBar Component

const sunIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
const moonIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>`;
const bellIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`;

export function createTopBar(title, hostname) {
  const topbar = document.createElement('header');
  topbar.className = 'topbar';

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

  topbar.innerHTML = `
    <div class="topbar-left">
      <h1 class="topbar-title">${title}</h1>
      <span class="text-sm text-tertiary text-mono">${hostname || ''}</span>
    </div>
    <div class="topbar-right">
      <div class="system-status-dot" title="Sistema operacional"></div>
      <button class="topbar-btn" id="btn-notifications" title="Notificações">
        ${bellIcon}
      </button>
      <button class="topbar-btn" id="btn-theme-toggle" title="Alternar tema">
        ${isDark ? sunIcon : moonIcon}
      </button>
    </div>
  `;

  // Theme toggle
  const themeBtn = topbar.querySelector('#btn-theme-toggle');
  themeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('tectum_theme', next);
    themeBtn.innerHTML = next === 'dark' ? sunIcon : moonIcon;
  });

  return topbar;
}

// Restore saved theme
export function restoreTheme() {
  const saved = localStorage.getItem('tectum_theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }
}
