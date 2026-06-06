(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))t(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&t(n)}).observe(document,{childList:!0,subtree:!0});function s(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function t(r){if(r.ep)return;r.ep=!0;const i=s(r);fetch(r.href,i)}})();const k={};let x=null;function h(e,a){k[e]=a}function v(e){window.location.hash=`#${e}`}function F(){return window.location.hash.slice(1)||"/"}async function E(){const e=F(),a=document.getElementById("app");x&&(x(),x=null);const s=k[e]||k["/404"];if(!s){a.innerHTML='<div class="auth-page"><p>Page not found</p></div>';return}const t=await s(a);typeof t=="function"&&(x=t);const r=a.querySelector(".page-enter");r&&(r.style.animationPlayState="running")}function U(){window.addEventListener("hashchange",E),E()}const R="/api";function z(){return localStorage.getItem("tectum_token")}function D(e){localStorage.setItem("tectum_token",e)}function V(){localStorage.removeItem("tectum_token")}function q(){return!!z()}async function u(e,a={}){const s=z(),t={"Content-Type":"application/json",...a.headers};s&&(t.Authorization=`Bearer ${s}`);const r=await fetch(`${R}${e}`,{...a,headers:t});if(r.status===401)throw V(),window.location.hash="#/login",new Error("Unauthorized");const i=await r.json();if(!r.ok)throw new Error(i.error||"Request failed");return i}const c={getStatus:()=>u("/auth/status"),setup:(e,a)=>u("/auth/setup",{method:"POST",body:JSON.stringify({username:e,password:a})}),login:(e,a)=>u("/auth/login",{method:"POST",body:JSON.stringify({username:e,password:a})}),me:()=>u("/auth/me"),getSystemOverview:()=>u("/system/overview"),getCatalog:()=>u("/apps/catalog"),uploadTapp:async e=>{const a=localStorage.getItem("tectum_token"),s=await fetch("/api/apps/upload",{method:"POST",headers:{Authorization:`Bearer ${a}`},body:e}),t=await s.json();if(!s.ok)throw new Error(t.error||"Upload falhou");return t},getInstalledApps:()=>u("/apps/installed"),appAction:(e,a)=>u(`/apps/${e}/action`,{method:"POST",body:JSON.stringify({action:a})}),getDisks:()=>u("/storage/disks"),createVirtualDisks:()=>u("/storage/virtual-disks",{method:"POST"})},A='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',B='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>',G='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>';function S(e,a){const s=document.createElement("header");s.className="topbar";const t=document.documentElement.getAttribute("data-theme")!=="light";s.innerHTML=`
    <div class="topbar-left">
      <h1 class="topbar-title">${e}</h1>
      <span class="text-sm text-tertiary text-mono">${a||""}</span>
    </div>
    <div class="topbar-right">
      <div class="system-status-dot" title="Sistema operacional"></div>
      <button class="topbar-btn" id="btn-notifications" title="Notificações">
        ${G}
      </button>
      <button class="topbar-btn" id="btn-theme-toggle" title="Alternar tema">
        ${t?A:B}
      </button>
    </div>
  `;const r=s.querySelector("#btn-theme-toggle");return r.addEventListener("click",()=>{const n=document.documentElement.getAttribute("data-theme")==="light"?"dark":"light";document.documentElement.setAttribute("data-theme",n),localStorage.setItem("tectum_theme",n),r.innerHTML=n==="dark"?A:B}),s}function b(){const e=localStorage.getItem("tectum_theme");e&&document.documentElement.setAttribute("data-theme",e)}async function J(e){e.innerHTML=`
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
  `;let a=1,s=!1;function t(r){if(s||a===r)return;s=!0;const i=e.querySelector(`#setup-step-${a}`),n=e.querySelector(`#setup-step-${r}`);for(let o=1;o<=3;o++){const l=e.querySelector(`#step-${o}`);l.classList.remove("active","done"),o<r?l.classList.add("done"):o===r&&l.classList.add("active")}for(let o=1;o<=2;o++)e.querySelector(`#line-${o}`).classList.toggle("done",o<r);i&&n?(i.classList.remove("slide-in-up"),i.classList.add("slide-out-up"),n.classList.remove("hidden"),n.classList.add("slide-in-up"),setTimeout(()=>{i.classList.add("hidden"),i.classList.remove("slide-out-up"),a=r,s=!1},400)):(n&&n.classList.remove("hidden"),a=r,s=!1)}e.querySelector("#btn-next-1").addEventListener("click",()=>{t(2),setTimeout(()=>e.querySelector("#setup-username").focus(),100)}),e.querySelector("#setup-form").addEventListener("submit",async r=>{r.preventDefault();const i=e.querySelector("#setup-error"),n=e.querySelector("#btn-create"),o=e.querySelector("#setup-username").value.trim(),l=e.querySelector("#setup-password").value,y=e.querySelector("#setup-password-confirm").value;if(l!==y){i.textContent="As senhas não conferem",i.classList.add("visible");return}i.classList.remove("visible"),n.disabled=!0,n.innerHTML='<div class="spinner"></div> Criando...';try{const p=await c.setup(o,l);D(p.token),t(3)}catch(p){i.textContent=p.message,i.classList.add("visible"),n.disabled=!1,n.textContent="Criar conta"}}),e.querySelector("#btn-go-dashboard").addEventListener("click",()=>{v("/dashboard")})}async function K(e){e.innerHTML=`
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
  `,setTimeout(()=>e.querySelector("#login-username").focus(),100),e.querySelector("#login-form").addEventListener("submit",async a=>{a.preventDefault();const s=e.querySelector("#login-error"),t=e.querySelector("#btn-login"),r=e.querySelector("#login-username").value.trim(),i=e.querySelector("#login-password").value;s.classList.remove("visible"),t.disabled=!0,t.innerHTML='<div class="spinner"></div> Entrando...';try{const n=await c.login(r,i);D(n.token),v("/dashboard")}catch{s.textContent="Usuário ou senha incorretos",s.classList.add("visible"),t.disabled=!1,t.textContent="Entrar",e.querySelector("#login-password").value="",e.querySelector("#login-password").focus()}})}const f={dashboard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="4" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="11" width="7" height="10" rx="1"/></svg>',store:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l1-4h16l1 4"/><path d="M3 9v10a1 1 0 001 1h16a1 1 0 001-1V9"/><path d="M9 21V13h6v8"/><path d="M3 9c0 1.1.9 2 2 2s2-.9 2-2"/><path d="M7 9c0 1.1.9 2 2 2s2-.9 2-2"/><path d="M11 9c0 1.1.9 2 2 2s2-.9 2-2"/><path d="M15 9c0 1.1.9 2 2 2s2-.9 2-2"/></svg>',apps:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',storage:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>',hermes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2a8 8 0 018 8v2a8 8 0 01-16 0v-2a8 8 0 018-8z"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><path d="M9 14c.83 1.2 2.17 2 3 2s2.17-.8 3-2"/></svg>',settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'};function M(e){const a=[{id:"dashboard",label:"Dashboard",icon:f.dashboard,path:"/dashboard"},{id:"appstore",label:"App Store",icon:f.store,path:"/store"},{id:"myapps",label:"Meus Apps",icon:f.apps,path:"/apps"},{id:"storage",label:"Storage",icon:f.storage,path:"/storage"},{id:"hermes",label:"Hermes AI",icon:f.hermes,path:"/hermes"}],s=document.createElement("aside");return s.className="sidebar",s.innerHTML=`
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <img src="/logo.png" alt="TectumOS Logo" style="width: 44px; height: 44px; border-radius: var(--radius-sm); filter: drop-shadow(0 0 8px rgba(129, 140, 248, 0.5)); transition: filter 0.3s;" />
        <span>TectumOS</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section-label">Menu</div>
      ${a.map(t=>`
        <a href="#${t.path}" class="nav-item ${e===t.id||e===t.path.substring(1)?"active":""}" data-link>
          ${t.icon}
          <span>${t.label}</span>
        </a>
      `).join("")}
    </nav>
    <div class="sidebar-footer">
      <a href="/settings" class="nav-item" data-link>
        ${f.settings}
        <span>Configurações</span>
      </a>
    </div>
  `,s}function m(e,a=1){if(!e||e===0)return"0 B";const s=1024,t=["B","KB","MB","GB","TB"],r=Math.floor(Math.log(e)/Math.log(s));return parseFloat((e/Math.pow(s,r)).toFixed(a))+" "+t[r]}function H(e){return!e||e===0?"0 B/s":m(e)+"/s"}function T(e){return e>=90?"critical":e>=70?"warning":"healthy"}function Q(e={}){const a=Math.round(e.usage_percent||0),s=42,t=2*Math.PI*s,r=t-a/100*t,i=T(a);return`
    <div class="card stagger-1" id="widget-cpu">
      <div class="card-header">
        <span class="card-label">CPU</span>
        <div class="card-icon ${i}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="4" width="16" height="16" rx="2"/>
            <path d="M9 1v3m6-3v3M9 20v3m6-3v3M1 9h3m-3 6h3M20 9h3m-3 6h3"/>
          </svg>
        </div>
      </div>
      <div class="flex items-center gap-3" style="gap: 24px;">
        <div class="gauge">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle class="gauge-bg" cx="50" cy="50" r="${s}"/>
            <circle class="gauge-fill ${i}" cx="50" cy="50" r="${s}"
              stroke-dasharray="${t}"
              stroke-dashoffset="${r}"/>
          </svg>
          <div class="gauge-text">
            <span class="gauge-percent">${a}</span>
            <span class="gauge-label">%</span>
          </div>
        </div>
        <div class="flex flex-col">
          <span class="text-sm text-secondary">${e.model||"Unknown CPU"}</span>
          <span class="text-xs text-tertiary mt-2">${e.cores||"?"} cores · ${e.threads||"?"} threads</span>
          ${e.temperature?`<span class="text-xs text-tertiary mt-2">${e.temperature.toFixed(0)}°C</span>`:""}
        </div>
      </div>
    </div>
  `}function X(e={}){const a=Math.round(e.used_percent||0),s=T(a),t=m(e.used||0),r=m(e.total||0);return`
    <div class="card stagger-2" id="widget-memory">
      <div class="card-header">
        <span class="card-label">Memória</span>
        <div class="card-icon ${s}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 19v-8a6 6 0 1112 0v8"/><path d="M6 19h12"/><path d="M4 19h16"/>
          </svg>
        </div>
      </div>
      <div class="metric-value">${t}</div>
      <div class="metric-sub">de ${r}</div>
      <div class="progress-bar">
        <div class="progress-bar-fill ${s}" style="width: ${a}%"></div>
      </div>
    </div>
  `}function Y(e={}){const a=H(e.send_rate||0),s=H(e.recv_rate||0);return`
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
          <span class="net-stat-value">${a}</span>
        </div>
        <div class="net-stat">
          <span class="net-stat-arrow down">↓</span>
          <span class="net-stat-value">${s}</span>
        </div>
      </div>
      <div class="text-xs text-tertiary mt-4">
        Total: ↑ ${m(e.total_sent||0)} · ↓ ${m(e.total_recv||0)}
      </div>
    </div>
  `}function Z(e=[]){let a=0,s=0;e.forEach(i=>{a+=i.total||0,s+=i.used||0});const t=a>0?Math.round(s/a*100):0,r=T(t);return`
    <div class="card span-2 stagger-4" id="widget-storage">
      <div class="card-header">
        <span class="card-label">Armazenamento</span>
        <div class="card-icon ${r}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
            <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
          </svg>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <div>
          <div class="metric-value">${m(s)}</div>
          <div class="metric-sub">de ${m(a)}</div>
        </div>
        <div class="metric-value sm text-tertiary">${t}%</div>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill ${r}" style="width: ${t}%"></div>
      </div>
      ${e.length>0?`
        <div class="mt-4 text-xs text-tertiary">
          ${e.map(i=>`${i.mount_point} — ${m(i.used)} / ${m(i.total)}`).join(" · ")}
        </div>
      `:""}
    </div>
  `}function ee(e={}){return`
    <div class="card stagger-5" id="widget-uptime">
      <div class="card-header">
        <span class="card-label">Uptime</span>
        <div class="card-icon healthy">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
        </div>
      </div>
      <div class="metric-value sm">${e.uptime_human||"—"}</div>
      <div class="metric-sub">${e.hostname||"unknown"}</div>
      <div class="text-xs text-tertiary mt-2">${e.platform||""}</div>
    </div>
  `}let d=null,g=null;const C=new Set;function _(){if(d&&d.readyState===WebSocket.OPEN)return;const e=location.protocol==="https:"?"wss:":"ws:",a=location.host;d=new WebSocket(`${e}//${a}/ws`),d.onopen=()=>{console.log("[TectumOS] WebSocket connected"),g&&(clearTimeout(g),g=null)},d.onmessage=s=>{try{const t=JSON.parse(s.data);C.forEach(r=>r(t))}catch(t){console.error("[TectumOS] WebSocket parse error:",t)}},d.onclose=()=>{console.log("[TectumOS] WebSocket disconnected, reconnecting in 3s..."),g=setTimeout(_,3e3)},d.onerror=s=>{console.error("[TectumOS] WebSocket error:",s),d.close()}}function te(){d&&(d.close(),d=null),g&&(clearTimeout(g),g=null)}function se(e){return C.add(e),()=>C.delete(e)}async function O(e){var y;b();let a={};try{a=await c.getSystemOverview()}catch(p){console.error("Failed to fetch system data:",p)}const s=((y=a.host)==null?void 0:y.hostname)||"homelab";e.innerHTML="";const t=document.createElement("div");t.className="app-layout";const r=M("dashboard");t.appendChild(r);const i=document.createElement("div");i.className="main-area";const n=S("Dashboard",s);i.appendChild(n);const o=document.createElement("main");o.className="page-content page-enter",o.innerHTML=ae(a),i.appendChild(o),t.appendChild(i),e.appendChild(t),_();const l=se(p=>{ie(o,p)});return()=>{l(),te()}}function ae(e){return`
    <div class="bento-grid">
      ${Q(e.cpu||{})}
      ${X(e.memory||{})}
      ${Y(e.network||{})}
      ${Z(e.disks||[])}
      ${ee(e.host||{})}
      ${re()}
    </div>
  `}function re(){return`
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
  `}function ie(e,a){const s=e.querySelector("#widget-cpu");if(s&&a.cpu){const n=s.querySelector(".gauge-fill"),o=s.querySelector(".gauge-percent");if(o){const l=Math.round(a.cpu.usage_percent||0);o.textContent=l;const p=2*Math.PI*42,j=p-l/100*p;n&&(n.setAttribute("stroke-dashoffset",j),n.className="gauge-fill "+$(l));const L=s.querySelector(".card-icon");L&&(L.className="card-icon "+$(l))}}const t=e.querySelector("#widget-memory");if(t&&a.memory){const n=t.querySelector(".metric-value"),o=t.querySelector(".progress-bar-fill");if(n&&(n.textContent=P(a.memory.used)),o){const l=Math.round(a.memory.used_percent);o.style.width=l+"%",o.className="progress-bar-fill "+$(l)}}const r=e.querySelector("#widget-network");if(r&&a.network){const n=r.querySelectorAll(".net-stat-value");n[0]&&(n[0].textContent=N(a.network.send_rate)),n[1]&&(n[1].textContent=N(a.network.recv_rate))}const i=e.querySelector("#widget-uptime");if(i&&a.host){const n=i.querySelector(".metric-value");n&&(n.textContent=a.host.uptime_human||"—")}}function $(e){return e>=90?"critical":e>=70?"warning":"healthy"}function P(e){if(!e)return"0 B";const a=1024,s=["B","KB","MB","GB","TB"],t=Math.floor(Math.log(e)/Math.log(a));return parseFloat((e/Math.pow(a,t)).toFixed(1))+" "+s[t]}function N(e){return e?P(e)+"/s":"0 B/s"}async function ne(e){var i;b();let a="homelab";try{a=((i=(await c.getSystemOverview()).host)==null?void 0:i.hostname)||"homelab"}catch{}e.innerHTML="";const s=document.createElement("div");s.className="app-layout",s.appendChild(M("store"));const t=document.createElement("div");t.className="main-area",t.appendChild(S("App Store",a));const r=document.createElement("main");r.className="page-content page-enter",r.innerHTML=`
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
  `,t.appendChild(r),s.appendChild(t),e.appendChild(s),oe(e),await le(e)}function oe(e){const a=e.querySelector("#tapp-upload-input"),s=e.querySelector("#btn-upload-manual");s.addEventListener("click",()=>a.click()),a.addEventListener("change",async t=>{const r=t.target.files[0];if(!r)return;const i=new FormData;i.append("tapp",r);const n=s.innerHTML;s.textContent="Instalando...",s.disabled=!0;try{await c.uploadTapp(i),s.textContent="✨ Instalado!",setTimeout(()=>{s.innerHTML=n,s.disabled=!1,a.value=""},3e3)}catch(o){alert("Erro ao instalar: "+o.message),s.innerHTML=n,s.disabled=!1}})}async function le(e){const a=e.querySelector("#catalog-grid");try{const s=await c.getCatalog();if(!s||s.length===0){a.innerHTML='<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-tertiary);">Nenhum aplicativo encontrado no catálogo.</div>';return}a.innerHTML=s.map((t,r)=>`
      <div class="card stagger-${r%6+1}" style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 16px; align-items: flex-start;">
          <div class="card-icon" style="background: rgba(255,255,255,0.05); color: var(--text-primary); width: 52px; height: 52px; font-size: 26px; flex-shrink: 0;">${t.icon}</div>
          <div style="flex: 1; min-width: 0;">
            <h3 style="font-size: var(--text-lg); margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.name}</h3>
            <div class="badge" style="background: rgba(255,255,255,0.1); color: var(--text-secondary);">${t.category}</div>
          </div>
        </div>
        <p class="text-secondary" style="font-size: var(--text-sm); line-height: 1.5; flex: 1;">${t.description}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <span class="text-tertiary" style="font-size: var(--text-xs); font-family: var(--font-mono);">${t.version}</span>
          <button class="btn" style="background: rgba(255,255,255,0.1); color: var(--text-primary);" onclick="alert('Download dos pacotes oficiais está previsto para uma atualização futura. Para agora, continue usando pacotes manuais (.tapp).')">Baixar App</button>
        </div>
      </div>
    `).join("")}catch(s){a.innerHTML=`<div style="grid-column: 1/-1; color: var(--color-critical); padding: 20px;">Falha ao carregar catálogo: ${s.message}</div>`}}async function ce(e){var i;b();let a="homelab";try{a=((i=(await c.getSystemOverview()).host)==null?void 0:i.hostname)||"homelab"}catch{}e.innerHTML="";const s=document.createElement("div");s.className="app-layout",s.appendChild(M("apps"));const t=document.createElement("div");t.className="main-area",t.appendChild(S("Meus Apps",a));const r=document.createElement("main");r.className="page-content page-enter",r.innerHTML=`
      <div class="page-header">
        <h1 class="page-title">Meus Apps</h1>
        <p class="text-secondary">Gerencie os aplicativos nativos rodando no seu TectumOS</p>
      </div>
      <div id="apps-grid" class="bento-grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
        <div class="spinner" style="margin: 40px auto; grid-column: 1 / -1;"></div>
      </div>
  `,t.appendChild(r),s.appendChild(t),e.appendChild(s),await W(r)}async function W(e){const a=e.querySelector("#apps-grid");try{const s=await c.getInstalledApps();if(!s||s.length===0){a.innerHTML='<p class="text-secondary" style="grid-column: 1/-1; text-align: center; padding: 40px;">Nenhum aplicativo instalado no momento.</p>';return}a.innerHTML=s.map((t,r)=>{const i=t.status==="active";return`
      <div class="card stagger-${r%6+1}">
        <div class="card-header" style="margin-bottom: 12px;">
          <h3 style="font-size: 1.1rem; font-weight: 600;">${t.name} <span class="text-secondary text-sm" style="font-weight: 400;">v${t.version}</span></h3>
          <span class="badge ${i?"healthy":"critical"}">${t.status}</span>
        </div>
        <p class="text-secondary text-sm mb-4" style="min-height: 40px;">Porta: ${t.port}</p>
        
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${i?`<button class="btn btn-sm btn-stop" data-id="${t.id}">Parar</button>`:`<button class="btn btn-sm btn-primary btn-start" data-id="${t.id}">Iniciar</button>`}
          <button class="btn btn-sm btn-restart" data-id="${t.id}">Restart</button>
          <a class="btn btn-sm" href="http://${window.location.hostname}:${t.port}" target="_blank">Abrir</a>
          <button class="btn btn-sm btn-uninstall" data-id="${t.id}" style="margin-left: auto; color: var(--color-critical); border-color: var(--color-critical);">Desinstalar</button>
        </div>
      </div>
    `}).join(""),a.querySelectorAll(".btn-start").forEach(t=>t.addEventListener("click",()=>w(e,t.dataset.id,"start"))),a.querySelectorAll(".btn-stop").forEach(t=>t.addEventListener("click",()=>w(e,t.dataset.id,"stop"))),a.querySelectorAll(".btn-restart").forEach(t=>t.addEventListener("click",()=>w(e,t.dataset.id,"restart"))),a.querySelectorAll(".btn-uninstall").forEach(t=>t.addEventListener("click",()=>{confirm("Tem certeza que deseja desinstalar este aplicativo?")&&w(e,t.dataset.id,"uninstall")}))}catch(s){a.innerHTML=`<p class="text-critical" style="grid-column: 1/-1;">Erro ao carregar apps: ${s.message}</p>`}}async function w(e,a,s){try{await c.appAction(a,s),await W(e)}catch(t){alert("Erro: "+t.message)}}async function de(e){var n;b();let a="homelab";try{a=((n=(await c.getSystemOverview()).host)==null?void 0:n.hostname)||"homelab"}catch{}e.innerHTML="";const s=document.createElement("div");s.className="app-layout",s.appendChild(M("storage"));const t=document.createElement("div");t.className="main-area",t.appendChild(S("Storage",a));const r=document.createElement("main");r.className="page-content page-enter",r.innerHTML=`
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
  `,t.appendChild(r),s.appendChild(t),e.appendChild(s);const i=e.querySelector("#btn-simulate-disks");i.addEventListener("click",async()=>{i.disabled=!0,i.textContent="Simulando...";try{await c.createVirtualDisks(),alert("Discos virtuais criados com sucesso!"),await I(e)}catch(o){alert("Erro: "+o.message)}finally{i.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Simular Discos',i.disabled=!1}}),await I(e)}async function I(e){const a=e.querySelector("#disks-list");try{const s=await c.getDisks();if(!s||s.length===0){a.innerHTML='<div class="text-secondary">Nenhum disco encontrado.</div>';return}a.innerHTML=s.map(t=>`
      <div style="background: var(--surface-2); padding: 16px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--border-default);">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="font-size: 24px;">${t.type==="loop"?"💿":"💽"}</div>
          <div>
            <div style="font-weight: 500; display: flex; align-items: center; gap: 8px;">
              ${t.name} 
              ${t.is_system?'<span class="badge" style="background: rgba(255,255,255,0.1); color: var(--color-warning);">Root OS</span>':'<span class="badge" style="background: rgba(255,255,255,0.1); color: var(--color-healthy);">Disponível</span>'}
            </div>
            <div class="text-tertiary" style="font-size: var(--text-sm); font-family: var(--font-mono); margin-top: 4px;">
              ${t.size} • ${t.path} • ${t.type} ${t.mountpoint?`• Montado em: ${t.mountpoint}`:""}
            </div>
          </div>
        </div>
        <div>
          ${t.is_system?'<button class="btn" disabled style="opacity: 0.5;">Reservado</button>':`<button class="btn btn-primary" onclick="alert(\\'Criação de Pools será implementada a seguir\\')">Formatar</button>`}
        </div>
      </div>
    `).join("")}catch(s){a.innerHTML=`<div class="text-critical">Erro ao carregar discos: ${s.message}</div>`}}async function pe(){b(),h("/setup",J),h("/login",K),h("/",O),h("/dashboard",O),h("/store",ne),h("/apps",ce),h("/storage",de),h("/hermes",async e=>{e.innerHTML=`<div class="app-layout">
      ${ue("Hermes AI","A integração com o Hermes Agent será implementada na Fase 4.")}
    </div>`});try{if((await c.getStatus()).needs_setup)v("/setup");else if(!q())v("/login");else try{await c.me(),(!window.location.hash||window.location.hash==="#/"||window.location.hash==="#")&&v("/dashboard")}catch{v("/login")}}catch(e){console.error("Failed to check system status:",e),q()?v("/dashboard"):v("/login")}U()}function ue(e,a,s){return`
    <div style="flex: 1; display: flex; align-items: center; justify-content: center; min-height: 100vh;">
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;">🚧</div>
        <h2 style="font-size: var(--text-xl); font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">${e}</h2>
        <p style="color: var(--text-secondary); font-size: var(--text-sm);">${a}</p>
        <a href="#/dashboard" class="btn mt-6" style="margin-top: 24px; display: inline-flex;">← Voltar ao Dashboard</a>
      </div>
    </div>
  `}pe();
