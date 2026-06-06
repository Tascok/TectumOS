// TectumOS WebSocket Client

let ws = null;
let reconnectTimer = null;
const listeners = new Set();

export function connectWS() {
  if (ws && ws.readyState === WebSocket.OPEN) return;

  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = location.host;
  ws = new WebSocket(`${protocol}//${host}/ws`);

  ws.onopen = () => {
    console.log('[TectumOS] WebSocket connected');
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      listeners.forEach(fn => fn(data));
    } catch (e) {
      console.error('[TectumOS] WebSocket parse error:', e);
    }
  };

  ws.onclose = () => {
    console.log('[TectumOS] WebSocket disconnected, reconnecting in 3s...');
    reconnectTimer = setTimeout(connectWS, 3000);
  };

  ws.onerror = (err) => {
    console.error('[TectumOS] WebSocket error:', err);
    ws.close();
  };
}

export function disconnectWS() {
  if (ws) {
    ws.close();
    ws = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

export function onMetrics(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
