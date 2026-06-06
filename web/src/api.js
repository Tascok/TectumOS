// TectumOS API Client

const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('tectum_token');
}

export function setToken(token) {
  localStorage.setItem('tectum_token', token);
}

export function clearToken() {
  localStorage.removeItem('tectum_token');
}

export function isAuthenticated() {
  return !!getToken();
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    window.location.hash = '#/login';
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  // Auth
  getStatus: () => request('/auth/status'),
  setup: (username, password) => request('/auth/setup', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  login: (username, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  me: () => request('/auth/me'),

  // System
  getSystemOverview: () => request('/system/overview'),
  
  // Apps
  getCatalog: () => request('/apps/catalog'),
  uploadTapp: async (formData) => {
    const token = localStorage.getItem('tectum_token');
    const res = await fetch('/api/apps/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload falhou');
    return data;
  },
  getInstalledApps: () => request('/apps/installed'),
  appAction: (id, action) => request(`/apps/${id}/action`, {
    method: 'POST',
    body: JSON.stringify({ action })
  }),

  // Storage
  getDisks: () => request('/storage/disks'),
  createVirtualDisks: () => request('/storage/virtual-disks', { method: 'POST' })
};
