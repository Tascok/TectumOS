import { api } from '../api.js';
import { escapeHTML } from '../utils.js';
import { createSidebar } from '../components/Sidebar.js';
import { createTopBar, restoreTheme } from '../components/TopBar.js';

export async function renderMyApps(container) {
  restoreTheme();
  
  let hostname = 'homelab';
  try {
    const sys = await api.getSystemOverview();
    hostname = sys.host?.hostname || 'homelab';
  } catch(e) {}

  container.innerHTML = '';
  const layout = document.createElement('div');
  layout.className = 'app-layout';

  layout.appendChild(createSidebar('apps'));

  const mainArea = document.createElement('div');
  mainArea.className = 'main-area';
  mainArea.appendChild(createTopBar('Meus Apps', hostname));

  const pageContent = document.createElement('main');
  pageContent.className = 'page-content page-enter';
  pageContent.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Meus Apps</h1>
        <p class="text-secondary">Gerencie os aplicativos nativos rodando no seu TectumOS</p>
      </div>
      <div id="apps-grid" class="bento-grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
        <div class="spinner" style="margin: 40px auto; grid-column: 1 / -1;"></div>
      </div>
  `;
  mainArea.appendChild(pageContent);
  layout.appendChild(mainArea);
  container.appendChild(layout);

  await loadApps(pageContent);
}

async function loadApps(container) {
  const grid = container.querySelector('#apps-grid');
  try {
    const apps = await api.getInstalledApps();
    if (!apps || apps.length === 0) {
      grid.innerHTML = '<p class="text-secondary" style="grid-column: 1/-1; text-align: center; padding: 40px;">Nenhum aplicativo instalado no momento.</p>';
      return;
    }

    grid.innerHTML = apps.map((app, index) => {
      const isActive = app.status === 'active';
      return `
      <div class="card stagger-${(index % 6) + 1}">
        <div class="card-header" style="margin-bottom: 12px;">
          <h3 style="font-size: 1.1rem; font-weight: 600;">${escapeHTML(app.name)} <span class="text-secondary text-sm" style="font-weight: 400;">v${escapeHTML(app.version)}</span></h3>
          <span class="badge ${isActive ? 'healthy' : 'critical'}">${escapeHTML(app.status)}</span>
        </div>
        <p class="text-secondary text-sm mb-4" style="min-height: 40px;">Porta: ${escapeHTML(app.port)}</p>
        
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${isActive 
            ? `<button class="btn btn-sm btn-stop" data-id="${escapeHTML(app.id)}">Parar</button>` 
            : `<button class="btn btn-sm btn-primary btn-start" data-id="${escapeHTML(app.id)}">Iniciar</button>`}
          <button class="btn btn-sm btn-restart" data-id="${escapeHTML(app.id)}">Restart</button>
          <a class="btn btn-sm" href="http://${window.location.hostname}:${escapeHTML(app.port)}" target="_blank">Abrir</a>
          <button class="btn btn-sm btn-uninstall" data-id="${escapeHTML(app.id)}" style="margin-left: auto; color: var(--color-critical); border-color: var(--color-critical);">Desinstalar</button>
        </div>
      </div>
    `}).join('');

    // Eventos
    grid.querySelectorAll('.btn-start').forEach(b => b.addEventListener('click', () => handleAction(container, b.dataset.id, 'start')));
    grid.querySelectorAll('.btn-stop').forEach(b => b.addEventListener('click', () => handleAction(container, b.dataset.id, 'stop')));
    grid.querySelectorAll('.btn-restart').forEach(b => b.addEventListener('click', () => handleAction(container, b.dataset.id, 'restart')));
    grid.querySelectorAll('.btn-uninstall').forEach(b => b.addEventListener('click', () => {
      if(confirm('Tem certeza que deseja desinstalar este aplicativo?')) {
        handleAction(container, b.dataset.id, 'uninstall');
      }
    }));
  } catch (e) {
    grid.innerHTML = `<p class="text-critical" style="grid-column: 1/-1;">Erro ao carregar apps: ${escapeHTML(e.message)}</p>`;
  }
}

async function handleAction(container, id, action) {
  try {
    await api.appAction(id, action);
    await loadApps(container); // recarrega a lista
  } catch (e) {
    alert('Erro: ' + e.message);
  }
}
