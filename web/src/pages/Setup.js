// TectumOS Setup Wizard Page

import { api, setToken } from '../api.js';
import { navigate } from '../router.js';

export async function renderSetup(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <img src="/logo.png" alt="TectumOS Logo" style="width: 72px; height: 72px; border-radius: var(--radius-lg); margin-bottom: var(--space-4);" />
          <h1 class="auth-title">Bem-vindo ao TectumOS</h1>
          <p class="auth-subtitle">Configure sua conta de administrador para começar</p>
        </div>

        <div class="setup-steps">
          <div class="setup-step active" id="step-1">1</div>
          <div class="setup-step-line" id="line-1"></div>
          <div class="setup-step" id="step-2">2</div>
          <div class="setup-step-line" id="line-2"></div>
          <div class="setup-step" id="step-3">✓</div>
        </div>

        <div class="setup-container" style="position: relative; min-height: 280px;">
          <!-- Step 1: Welcome -->
          <div id="setup-step-1" class="setup-content">
            <div class="text-center mb-4">
              <p class="text-sm text-secondary" style="line-height: 1.7;">
                O TectumOS é o seu painel de controle para homelab.<br/>
                Gerencie apps, storage e IA — tudo em um só lugar.
              </p>
            </div>
            <button class="btn btn-primary btn-lg w-full" id="btn-next-1">
              Começar configuração
            </button>
          </div>

          <!-- Step 2: Create Account -->
          <div id="setup-step-2" class="setup-content hidden">
            <form class="auth-form" id="setup-form">
              <div class="auth-error" id="setup-error"></div>
              <div class="input-group">
                <label class="input-label" for="setup-username">Nome de usuário</label>
                <input class="input" type="text" id="setup-username" 
                  placeholder="admin" minlength="3" required autocomplete="username" />
              </div>
              <div class="input-group">
                <label class="input-label" for="setup-password">Senha</label>
                <input class="input" type="password" id="setup-password" 
                  placeholder="Mínimo 6 caracteres" minlength="6" required autocomplete="new-password" />
              </div>
              <div class="input-group">
                <label class="input-label" for="setup-password-confirm">Confirmar senha</label>
                <input class="input" type="password" id="setup-password-confirm" 
                  placeholder="Repita a senha" minlength="6" required autocomplete="new-password" />
              </div>
              <button class="btn btn-primary btn-lg w-full" type="submit" id="btn-create">
                Criar conta
              </button>
            </form>
          </div>

          <!-- Step 3: Done -->
          <div id="setup-step-3" class="setup-content hidden">
            <div class="text-center">
              <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
              <h2 style="font-size: var(--text-xl); font-weight: 600; margin-bottom: 8px;">Tudo pronto!</h2>
              <p class="text-sm text-secondary">Sua conta foi criada com sucesso.</p>
            </div>
            <button class="btn btn-primary btn-lg w-full mt-6" id="btn-go-dashboard">
              Ir para o Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  let currentStep = 1;
  let isTransitioning = false;

  function goToStep(step) {
    if (isTransitioning || currentStep === step) return;
    isTransitioning = true;

    const oldStepEl = container.querySelector(`#setup-step-${currentStep}`);
    const newStepEl = container.querySelector(`#setup-step-${step}`);

    // Update step indicators
    for (let i = 1; i <= 3; i++) {
      const stepEl = container.querySelector(`#step-${i}`);
      stepEl.classList.remove('active', 'done');
      if (i < step) stepEl.classList.add('done');
      else if (i === step) stepEl.classList.add('active');
    }

    // Update lines
    for (let i = 1; i <= 2; i++) {
      const line = container.querySelector(`#line-${i}`);
      line.classList.toggle('done', i < step);
    }

    if (oldStepEl && newStepEl) {
      oldStepEl.classList.remove('slide-in-up');
      oldStepEl.classList.add('slide-out-up');
      
      newStepEl.classList.remove('hidden');
      newStepEl.classList.add('slide-in-up');

      setTimeout(() => {
        oldStepEl.classList.add('hidden');
        oldStepEl.classList.remove('slide-out-up');
        currentStep = step;
        isTransitioning = false;
      }, 400);
    } else {
      if (newStepEl) newStepEl.classList.remove('hidden');
      currentStep = step;
      isTransitioning = false;
    }
  }

  // Step 1: Next
  container.querySelector('#btn-next-1').addEventListener('click', () => {
    goToStep(2);
    setTimeout(() => container.querySelector('#setup-username').focus(), 100);
  });

  // Step 2: Create account
  container.querySelector('#setup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = container.querySelector('#setup-error');
    const btn = container.querySelector('#btn-create');

    const username = container.querySelector('#setup-username').value.trim();
    const password = container.querySelector('#setup-password').value;
    const confirm = container.querySelector('#setup-password-confirm').value;

    if (password !== confirm) {
      errorEl.textContent = 'As senhas não conferem';
      errorEl.classList.add('visible');
      return;
    }

    errorEl.classList.remove('visible');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Criando...';

    try {
      const result = await api.setup(username, password);
      setToken(result.token);
      goToStep(3);
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add('visible');
      btn.disabled = false;
      btn.textContent = 'Criar conta';
    }
  });

  // Step 3: Go to dashboard
  container.querySelector('#btn-go-dashboard').addEventListener('click', () => {
    navigate('/dashboard');
  });
}
