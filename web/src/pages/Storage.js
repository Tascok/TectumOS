import { api } from '../api.js';
import { createSidebar } from '../components/Sidebar.js';
import { createTopBar, restoreTheme } from '../components/TopBar.js';

export async function renderStorage(container) {
  restoreTheme();
  
  let hostname = 'homelab';
  try {
    const sys = await api.getSystemOverview();
    hostname = sys.host?.hostname || 'homelab';
  } catch(e) {}

  container.innerHTML = '';
  const layout = document.createElement('div');
  layout.className = 'app-layout';

  layout.appendChild(createSidebar('storage'));

  const mainArea = document.createElement('div');
  mainArea.className = 'main-area';
  mainArea.appendChild(createTopBar('Storage', hostname));

  const pageContent = document.createElement('main');
  pageContent.className = 'page-content page-enter';
  pageContent.innerHTML = `
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="page-title">Storage Manager</h1>
          <p class="text-secondary">Gerencie discos físicos e crie pools de armazenamento</p>
        </div>
        <button class="btn" style="background: rgba(255,255,255,0.1);" id="btn-simulate-disks">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Simular Discos
        </button>
      </div>

      <div class="card mb-6" style="padding: 24px;">
        <h3 style="margin-bottom: 16px;">Discos Físicos</h3>
        <div id="disks-list" style="display: flex; flex-direction: column; gap: 12px;">
          <div class="spinner" style="margin: 20px auto;"></div>
        </div>
      </div>
  `;
  mainArea.appendChild(pageContent);
  layout.appendChild(mainArea);
  container.appendChild(layout);

  const btnSimulate = container.querySelector('#btn-simulate-disks');
  btnSimulate.addEventListener('click', async () => {
    btnSimulate.disabled = true;
    btnSimulate.textContent = 'Simulando...';
    try {
      await api.createVirtualDisks();
      alert('Discos virtuais criados com sucesso!');
      await loadDisks(container);
    } catch(e) {
      alert('Erro: ' + e.message);
    } finally {
      btnSimulate.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Simular Discos';
      btnSimulate.disabled = false;
    }
  });

  await loadDisks(container);
}

async function loadDisks(container) {
  const disksList = container.querySelector('#disks-list');
  try {
    const disks = await api.getDisks();
    if (!disks || disks.length === 0) {
      disksList.innerHTML = '<div class="text-secondary">Nenhum disco encontrado.</div>';
      return;
    }

    disksList.innerHTML = disks.map(disk => `
      <div style="background: var(--surface-2); padding: 16px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--border-default);">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="font-size: 24px;">${disk.type === 'loop' ? '💿' : '💽'}</div>
          <div>
            <div style="font-weight: 500; display: flex; align-items: center; gap: 8px;">
              ${disk.name} 
              ${disk.is_system ? '<span class="badge" style="background: rgba(255,255,255,0.1); color: var(--color-warning);">Root OS</span>' : '<span class="badge" style="background: rgba(255,255,255,0.1); color: var(--color-healthy);">Disponível</span>'}
            </div>
            <div class="text-tertiary" style="font-size: var(--text-sm); font-family: var(--font-mono); margin-top: 4px;">
              ${disk.size} • ${disk.path} • ${disk.type} ${disk.mountpoint ? `• Montado em: ${disk.mountpoint}` : ''}
            </div>
          </div>
        </div>
        <div>
          ${disk.is_system ? 
            '<button class="btn" disabled style="opacity: 0.5;">Reservado</button>' : 
            '<button class="btn btn-primary" onclick="alert(\\\'Criação de Pools será implementada a seguir\\\')">Formatar</button>'
          }
        </div>
      </div>
    `).join('');

  } catch(e) {
    disksList.innerHTML = `<div class="text-critical">Erro ao carregar discos: ${e.message}</div>`;
  }
}
