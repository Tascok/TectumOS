// TectumOS Login Page

import { api, setToken } from '../api.js';
import { navigate } from '../router.js';

export async function renderLogin(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <img src="/logo.png" alt="TectumOS Logo" style="width: 72px; height: 72px; border-radius: var(--radius-lg); margin-bottom: var(--space-4);" />
          <h1 class="auth-title">TectumOS</h1>
          <p class="auth-subtitle">Entre para acessar seu homelab</p>
        </div>

        <form class="auth-form" id="login-form">
          <div class="auth-error" id="login-error"></div>
          <div class="input-group">
            <label class="input-label" for="login-username">Usuário</label>
            <input class="input" type="text" id="login-username" 
              placeholder="admin" required autocomplete="username" />
          </div>
          <div class="input-group">
            <label class="input-label" for="login-password">Senha</label>
            <input class="input" type="password" id="login-password" 
              placeholder="Sua senha" required autocomplete="current-password" />
          </div>
          <button class="btn btn-primary btn-lg w-full" type="submit" id="btn-login">
            Entrar
          </button>
        </form>
      </div>
    </div>
  `;

  // Focus username
  setTimeout(() => container.querySelector('#login-username').focus(), 100);

  container.querySelector('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = container.querySelector('#login-error');
    const btn = container.querySelector('#btn-login');

    const username = container.querySelector('#login-username').value.trim();
    const password = container.querySelector('#login-password').value;

    errorEl.classList.remove('visible');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Entrando...';

    try {
      const result = await api.login(username, password);
      setToken(result.token);
      navigate('/dashboard');
    } catch (err) {
      errorEl.textContent = 'Usuário ou senha incorretos';
      errorEl.classList.add('visible');
      btn.disabled = false;
      btn.textContent = 'Entrar';
      container.querySelector('#login-password').value = '';
      container.querySelector('#login-password').focus();
    }
  });
}
