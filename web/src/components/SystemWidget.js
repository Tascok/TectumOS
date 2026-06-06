// TectumOS System Widgets

// Format bytes to human-readable
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// Format bytes per second
export function formatSpeed(bytesPerSec) {
  if (!bytesPerSec || bytesPerSec === 0) return '0 B/s';
  return formatBytes(bytesPerSec) + '/s';
}

// Get color class based on percentage
function getStatusClass(percent) {
  if (percent >= 90) return 'critical';
  if (percent >= 70) return 'warning';
  return 'healthy';
}

// CPU Widget with circular gauge
export function createCPUWidget(data = {}) {
  const percent = Math.round(data.usage_percent || 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const statusClass = getStatusClass(percent);

  return `
    <div class="card stagger-1" id="widget-cpu">
      <div class="card-header">
        <span class="card-label">CPU</span>
        <div class="card-icon ${statusClass}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="4" width="16" height="16" rx="2"/>
            <path d="M9 1v3m6-3v3M9 20v3m6-3v3M1 9h3m-3 6h3M20 9h3m-3 6h3"/>
          </svg>
        </div>
      </div>
      <div class="flex items-center gap-3" style="gap: 24px;">
        <div class="gauge">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle class="gauge-bg" cx="50" cy="50" r="${radius}"/>
            <circle class="gauge-fill ${statusClass}" cx="50" cy="50" r="${radius}"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"/>
          </svg>
          <div class="gauge-text">
            <span class="gauge-percent">${percent}</span>
            <span class="gauge-label">%</span>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="text-sm text-secondary">${data.model || 'Unknown CPU'}</span>
          <span class="text-xs text-tertiary mt-2">${data.cores || '?'} cores · ${data.threads || '?'} threads</span>
          ${data.temperature ? `<span class="text-xs text-tertiary mt-2">${data.temperature.toFixed(0)}°C</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

// Memory Widget with progress bar
export function createMemoryWidget(data = {}) {
  const percent = Math.round(data.used_percent || 0);
  const statusClass = getStatusClass(percent);
  const used = formatBytes(data.used || 0);
  const total = formatBytes(data.total || 0);

  return `
    <div class="card stagger-2" id="widget-memory">
      <div class="card-header">
        <span class="card-label">Memória</span>
        <div class="card-icon ${statusClass}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 19v-8a6 6 0 1112 0v8"/><path d="M6 19h12"/><path d="M4 19h16"/>
          </svg>
        </div>
      </div>
      <div class="metric-value">${used}</div>
      <div class="metric-sub">de ${total}</div>
      <div class="progress-bar">
        <div class="progress-bar-fill ${statusClass}" style="width: ${percent}%"></div>
      </div>
    </div>
  `;
}

// Network Widget
export function createNetworkWidget(data = {}) {
  const sendRate = formatSpeed(data.send_rate || 0);
  const recvRate = formatSpeed(data.recv_rate || 0);

  return `
    <div class="card stagger-3" id="widget-network">
      <div class="card-header">
        <span class="card-label">Rede</span>
        <div class="card-icon info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20V4m0 0l-4 4m4-4l4 4"/><path d="M4 12h16"/>
          </svg>
        </div>
      </div>
      <div class="flex flex-col gap-3" style="gap: 12px;">
        <div class="net-stat">
          <span class="net-stat-arrow up">↑</span>
          <span class="net-stat-value">${sendRate}</span>
        </div>
        <div class="net-stat">
          <span class="net-stat-arrow down">↓</span>
          <span class="net-stat-value">${recvRate}</span>
        </div>
      </div>
      <div class="text-xs text-tertiary mt-4">
        Total: ↑ ${formatBytes(data.total_sent || 0)} · ↓ ${formatBytes(data.total_recv || 0)}
      </div>
    </div>
  `;
}

// Storage Widget (overview)
export function createStorageWidget(disks = []) {
  // Aggregate all disks
  let totalSpace = 0;
  let usedSpace = 0;
  disks.forEach(d => {
    totalSpace += d.total || 0;
    usedSpace += d.used || 0;
  });
  const percent = totalSpace > 0 ? Math.round((usedSpace / totalSpace) * 100) : 0;
  const statusClass = getStatusClass(percent);

  return `
    <div class="card span-2 stagger-4" id="widget-storage">
      <div class="card-header">
        <span class="card-label">Armazenamento</span>
        <div class="card-icon ${statusClass}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
            <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
          </svg>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <div>
          <div class="metric-value">${formatBytes(usedSpace)}</div>
          <div class="metric-sub">de ${formatBytes(totalSpace)}</div>
        </div>
        <div class="metric-value sm text-tertiary">${percent}%</div>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill ${statusClass}" style="width: ${percent}%"></div>
      </div>
      ${disks.length > 0 ? `
        <div class="mt-4 text-xs text-tertiary">
          ${disks.map(d => `${d.mount_point} — ${formatBytes(d.used)} / ${formatBytes(d.total)}`).join(' · ')}
        </div>
      ` : ''}
    </div>
  `;
}

// Uptime Widget
export function createUptimeWidget(host = {}) {
  return `
    <div class="card stagger-5" id="widget-uptime">
      <div class="card-header">
        <span class="card-label">Uptime</span>
        <div class="card-icon healthy">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
        </div>
      </div>
      <div class="metric-value sm">${host.uptime_human || '—'}</div>
      <div class="metric-sub">${host.hostname || 'unknown'}</div>
      <div class="text-xs text-tertiary mt-2">${host.platform || ''}</div>
    </div>
  `;
}
