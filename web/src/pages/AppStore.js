import { api } from '../api.js';
import { escapeHTML } from '../utils.js';
import { createSidebar } from '../components/Sidebar.js';
import { createTopBar, restoreTheme } from '../components/TopBar.js';

export async function renderAppStore(container) {
  restoreTheme();
  
  let hostname = 'homelab';
  try {
    const sys = await api.getSystemOverview();
    hostname = sys.host?.hostname || 'homelab';
  } catch(e) {}

  container.innerHTML = '';
  const layout = document.createElement('div');
  layout.className = 'app-layout';

  layout.appendChild(createSidebar('store'));

  const mainArea = document.createElement('div');
  mainArea.className = 'main-area';
  mainArea.appendChild(createTopBar('App Store', hostname));

  const pageContent = document.createElement('main');
  pageContent.className = 'page-content page-enter';
  pageContent.innerHTML = `
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="page-title">App Store</h1>
          <p class="text-secondary">Explore e instale aplicativos oficiais no seu TectumOS</p>
        </div>
        <button class="btn btn-primary" id="btn-upload-manual">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Instalar via .tapp
        </button>
      </div>

      <input type="file" id="tapp-upload-input" accept=".tapp,.tar.gz" style="display: none;" />
      
      <div id="catalog-grid" class="bento-grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
        <div class="spinner" style="margin: 40px auto; grid-column: 1 / -1;"></div>
      </div>
  `;
  mainArea.appendChild(pageContent);
  layout.appendChild(mainArea);
  container.appendChild(layout);

  setupUpload(container);
  await loadCatalog(container);
}

function setupUpload(container) {
  const fileInput = container.querySelector('#tapp-upload-input');
  const btnUpload = container.querySelector('#btn-upload-manual');
  
  btnUpload.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('tapp', file);

    const originalText = btnUpload.innerHTML;
    btnUpload.textContent = 'Instalando...';
    btnUpload.disabled = true;

    try {
      await api.uploadTapp(formData);
      btnUpload.textContent = '✨ Instalado!';
      setTimeout(() => {
        btnUpload.innerHTML = originalText;
        btnUpload.disabled = false;
        fileInput.value = '';
      }, 3000);
    } catch (err) {
      alert('Erro ao instalar: ' + err.message);
      btnUpload.innerHTML = originalText;
      btnUpload.disabled = false;
    }
  });
}

async function loadCatalog(container) {
  const grid = container.querySelector('#catalog-grid');
  try {
    const catalog = await api.getCatalog();
    
    if (!catalog || catalog.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-tertiary);">Nenhum aplicativo encontrado no catálogo.</div>';
      return;
    }

    grid.innerHTML = catalog.map((app, index) => `
      <div class="card stagger-${(index % 6) + 1}" style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 16px; align-items: flex-start;">
          <div class="card-icon" style="background: rgba(255,255,255,0.05); color: var(--text-primary); width: 52px; height: 52px; font-size: 26px; flex-shrink: 0;">${app.icon}</div>
          <div style="flex: 1; min-width: 0;">
            <h3 style="font-size: var(--text-lg); margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(app.name)}</h3>
            <div class="badge" style="background: rgba(255,255,255,0.1); color: var(--text-secondary);">${escapeHTML(app.category)}</div>
          </div>
        </div>
        <p class="text-secondary" style="font-size: var(--text-sm); line-height: 1.5; flex: 1;">${escapeHTML(app.description)}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <span class="text-tertiary" style="font-size: var(--text-xs); font-family: var(--font-mono);">${escapeHTML(app.version)}</span>
          <button class="btn" style="background: rgba(255,255,255,0.1); color: var(--text-primary);" onclick="alert('Download dos pacotes oficiais está previsto para uma atualização futura. Para agora, continue usando pacotes manuais (.tapp).')">Baixar App</button>
        </div>
      </div>
    `).join('');

  } catch (err) {
    grid.innerHTML = `<div style="grid-column: 1/-1; color: var(--color-critical); padding: 20px;">Falha ao carregar catálogo: ${escapeHTML(err.message)}</div>`;
  }
}
