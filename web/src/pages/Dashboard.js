// TectumOS Dashboard Page

import { createSidebar } from '../components/Sidebar.js';
import { createTopBar, restoreTheme } from '../components/TopBar.js';
import {
  createCPUWidget,
  createMemoryWidget,
  createNetworkWidget,
  createStorageWidget,
  createUptimeWidget,
} from '../components/SystemWidget.js';
import { connectWS, disconnectWS, onMetrics } from '../ws.js';
import { api } from '../api.js';

export async function renderDashboard(container) {
  restoreTheme();

  // Fetch initial data
  let systemData = {};
  try {
    systemData = await api.getSystemOverview();
  } catch (e) {
    console.error('Failed to fetch system data:', e);
  }

  const hostname = systemData.host?.hostname || 'homelab';

  // Build layout
  container.innerHTML = '';

  const layout = document.createElement('div');
  layout.className = 'app-layout';

  // Sidebar
  const sidebar = createSidebar('dashboard');
  layout.appendChild(sidebar);

  // Main area
  const mainArea = document.createElement('div');
  mainArea.className = 'main-area';

  // TopBar
  const topbar = createTopBar('Dashboard', hostname);
  mainArea.appendChild(topbar);

  // Page content
  const pageContent = document.createElement('main');
  pageContent.className = 'page-content page-enter';
  pageContent.innerHTML = buildGrid(systemData);
  mainArea.appendChild(pageContent);

  layout.appendChild(mainArea);
  container.appendChild(layout);

  // WebSocket: real-time updates
  connectWS();
  const unsubscribe = onMetrics((data) => {
    updateWidgets(pageContent, data);
  });

  // Return cleanup function
  return () => {
    unsubscribe();
    disconnectWS();
  };
}

function buildGrid(data) {
  return `
    <div class="bento-grid">
      ${createCPUWidget(data.cpu || {})}
      ${createMemoryWidget(data.memory || {})}
      ${createNetworkWidget(data.network || {})}
      ${createStorageWidget(data.disks || [])}
      ${createUptimeWidget(data.host || {})}
      ${createAppsWidget()}
    </div>
  `;
}

function createAppsWidget() {
  return `
    <div class="card stagger-6" id="widget-apps">
      <div class="card-header">
        <span class="card-label">Apps Instalados</span>
        <div class="card-icon brand">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        </div>
      </div>
      <div class="text-sm text-secondary" style="padding: 16px 0;">
        Nenhum app instalado ainda.
        <a href="#/store" style="color: var(--color-brand);">Visitar a App Store →</a>
      </div>
    </div>
  `;
}

function updateWidgets(content, data) {
  // Update CPU
  const cpuCard = content.querySelector('#widget-cpu');
  if (cpuCard && data.cpu) {
    const temp = cpuCard.querySelector('.gauge-fill');
    const percentEl = cpuCard.querySelector('.gauge-percent');
    if (percentEl) {
      const p = Math.round(data.cpu.usage_percent || 0);
      percentEl.textContent = p;

      // Update gauge fill
      const radius = 42;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (p / 100) * circumference;
      if (temp) {
        temp.setAttribute('stroke-dashoffset', offset);
        temp.className = 'gauge-fill ' + getStatusClass(p);
      }

      // Update card icon
      const icon = cpuCard.querySelector('.card-icon');
      if (icon) icon.className = 'card-icon ' + getStatusClass(p);
    }
  }

  // Update Memory
  const memCard = content.querySelector('#widget-memory');
  if (memCard && data.memory) {
    const val = memCard.querySelector('.metric-value');
    const bar = memCard.querySelector('.progress-bar-fill');
    if (val) val.textContent = formatBytesSimple(data.memory.used);
    if (bar) {
      const p = Math.round(data.memory.used_percent);
      bar.style.width = p + '%';
      bar.className = 'progress-bar-fill ' + getStatusClass(p);
    }
  }

  // Update Network
  const netCard = content.querySelector('#widget-network');
  if (netCard && data.network) {
    const stats = netCard.querySelectorAll('.net-stat-value');
    if (stats[0]) stats[0].textContent = formatSpeedSimple(data.network.send_rate);
    if (stats[1]) stats[1].textContent = formatSpeedSimple(data.network.recv_rate);
  }

  // Update Uptime
  const uptimeCard = content.querySelector('#widget-uptime');
  if (uptimeCard && data.host) {
    const val = uptimeCard.querySelector('.metric-value');
    if (val) val.textContent = data.host.uptime_human || '—';
  }
}

function getStatusClass(percent) {
  if (percent >= 90) return 'critical';
  if (percent >= 70) return 'warning';
  return 'healthy';
}

function formatBytesSimple(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatSpeedSimple(bps) {
  if (!bps) return '0 B/s';
  return formatBytesSimple(bps) + '/s';
}
