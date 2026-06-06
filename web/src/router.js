// TectumOS SPA Router

const routes = {};
let currentCleanup = null;

export function route(path, handler) {
  routes[path] = handler;
}

export function navigate(path) {
  window.location.hash = `#${path}`;
}

export function getCurrentPath() {
  return window.location.hash.slice(1) || '/';
}

async function handleRoute() {
  const path = getCurrentPath();
  const app = document.getElementById('app');

  // Cleanup previous page
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  // Find matching route safely
  let handler;
  if (Object.prototype.hasOwnProperty.call(routes, path)) {
    handler = routes[path];
  } else {
    handler = routes['/404'];
  }

  if (!handler) {
    app.innerHTML = '<div class="auth-page"><p>Page not found</p></div>';
    return;
  }

  // Render page
  const result = await handler(app);
  if (typeof result === 'function') {
    currentCleanup = result;
  }

  // Animate page entry
  const content = app.querySelector('.page-enter');
  if (content) {
    content.style.animationPlayState = 'running';
  }
}

export function startRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
