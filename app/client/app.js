'use strict';
/**
 * app.js — Workforce Management SPA
 * SEC-04: ALL dynamic content rendered with textContent (never innerHTML for data)
 */

const API = 'http://localhost:3000/api';

// ── DOM References ────────────────────────────────────────────────────────────
const workerGrid       = document.getElementById('worker-grid');
const workerCount      = document.getElementById('worker-count');
const emptyMsg         = document.getElementById('empty-msg');
const addForm          = document.getElementById('add-worker-form');
const formBanner       = document.getElementById('form-banner');
const listBanner       = document.getElementById('list-banner');
const scheduleDialog   = document.getElementById('schedule-dialog');
const scheduleForm     = document.getElementById('schedule-form');
const dialogBanner     = document.getElementById('dialog-banner');
const dialogWorkerName = document.getElementById('dialog-worker-name');
const scheduleWorkerId = document.getElementById('schedule-worker-id');
const btnCloseDialog   = document.getElementById('btn-close-dialog');
const btnCancelSched   = document.getElementById('btn-cancel-schedule');
const cardTemplate     = document.getElementById('worker-card-tpl');

// Input fields for add worker form
const inputId        = document.getElementById('worker-id');
const inputName      = document.getElementById('worker-name');
const inputCompany   = document.getElementById('worker-company');
const inputDept      = document.getElementById('worker-dept');

const SCHEDULE_DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

// Auth / Navbar elements
const navUserSpan    = document.getElementById('nav-user');
const btnNavLogout   = document.getElementById('btn-nav-logout');
const loginForm      = document.getElementById('login-form');
const loginAlert     = document.getElementById('login-alert');
const registerForm   = document.getElementById('register-form');
const registerAlert  = document.getElementById('register-alert');
const appContainer   = document.getElementById('app-container');
const landingPage    = document.getElementById('landing-page');
const companyBadge   = document.getElementById('nav-company-badge');

// Initialize Dialogs
const vacDialog = document.getElementById('vacation-dialog');
const hoursDialog = document.getElementById('hours-dialog');

// ── Auth Logic ──────────────────────────────────────────────────────────────
function getToken() {
  return sessionStorage.getItem('wf_token');
}

function setToken(token) {
  sessionStorage.setItem('wf_token', token);
  updateNavUI();
}

function removeToken() {
  sessionStorage.removeItem('wf_token');
  sessionStorage.removeItem('wf_company');
  sessionStorage.removeItem('wf_user');
  updateNavUI();
}

function updateNavUI() {
  const token = getToken();
  const company = sessionStorage.getItem('wf_company');
  const user = sessionStorage.getItem('wf_user');
  
  if (token) {
    appContainer.classList.remove('hidden');
    landingPage.classList.add('hidden');
    if (company) {
      companyBadge.textContent = company;
      const hiddenCompanyInput = document.getElementById('worker-company');
      const companyDisplay = document.getElementById('worker-company-display');
      if (hiddenCompanyInput) hiddenCompanyInput.value = company;
      if (companyDisplay) companyDisplay.textContent = company;
    }
    
    if (user) {
      navUserSpan.classList.remove('hidden');
      navUserSpan.innerHTML = `Hola, <strong class="text-neutral-100 font-semibold italic">${user}</strong> <span class="text-xs text-neutral-500">(Operador)</span>`;
    }
    
    loadWorkers();
  } else {
    appContainer.classList.add('hidden');
    landingPage.classList.remove('hidden');
    navUserSpan.classList.add('hidden');
    navUserSpan.textContent = '';
    companyBadge.textContent = '';
  }
}


// Interceptor helper para inyectar token y cazar 401s
async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, { ...options, headers });
  
  if (res.status === 401) {
    removeToken();
    throw new Error('Sesión expirada o no autorizada. Por favor, inicie sesión.');
  }
  return res;
}


// Register Submit
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerAlert.classList.add('hidden');
    
    const companyId = document.getElementById('reg-company').value;
    const username = document.getElementById('reg-user').value;
    const password = document.getElementById('reg-pass').value;
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, companyId })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Error al registrarse');
      
      registerAlert.className = 'p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl';
      registerAlert.textContent = 'Registro exitoso. Por favor inicie sesión.';
      registerAlert.classList.remove('hidden');
      registerForm.reset();
      
      if (typeof switchTab === 'function') switchTab('login');

    } catch (err) {
      registerAlert.className = 'p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl';
      registerAlert.textContent = err.message;
      registerAlert.classList.remove('hidden');
    }
  });
}

// Login Submit
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginAlert.classList.add('hidden');
    
    const companyId = document.getElementById('login-company').value;
    const username = document.getElementById('login-user').value;
    const password = document.getElementById('login-pass').value;
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, companyId })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
      
      sessionStorage.setItem('wf_company', data.companyId);
      sessionStorage.setItem('wf_user', data.username);
      
      setToken(data.token);
      loginForm.reset();
      loadWorkers();
    } catch (err) {
      loginAlert.className = 'p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl';
      loginAlert.textContent = err.message;
      loginAlert.classList.remove('hidden');
    }
  });
}

btnNavLogout.addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' }); // Opcional fire-and-forget
  removeToken();
});
// ── Banner Helpers ────────────────────────────────────────────────────────────
function showBanner(el, message, type = 'error') {
  el.classList.remove('hidden');
  const baseClasses = 'mb-6 p-4 rounded-xl text-sm font-medium border animate-in fade-in slide-in-from-top-4 duration-300';
  const types = {
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400'
  };
  el.className = `${baseClasses} ${types[type] || types.error}`;
  el.textContent = message; 
  if (type === 'success') setTimeout(() => hideBanner(el), 3500);
}
function hideBanner(el) {
  el.classList.add('hidden');
  el.textContent = '';
}

// ── Toast System ──────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const typeMap = {
    success: { bg: 'bg-emerald-600', icon: 'check-circle' },
    error: { bg: 'bg-red-600', icon: 'exclamation-circle' },
    warning: { bg: 'bg-amber-500', icon: 'exclamation-triangle' },
    info: { bg: 'bg-brand-600', icon: 'info-circle' }
  };
  const config = typeMap[type] || typeMap.info;

  toast.className = `pointer-events-auto flex items-center px-4 py-3 text-white rounded-2xl shadow-2xl transition-all duration-500 animate-in slide-in-from-right-full ${config.bg}`;
  toast.innerHTML = `
    <div class="flex items-center space-x-3">
      <span class="text-lg font-bold">!</span>
      <p class="text-sm font-semibold">${message}</p>
    </div>
  `;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}


// ── Fetch Workers ─────────────────────────────────────────────────────────────
async function fetchWorkers() {
  try {
    const res  = await fetch(`${API}/workers`);
    const data = await res.json();
    renderWorkerList(data);
  } catch {
    showBanner(listBanner, 'No se puede conectar con el servidor. ¿Está corriendo en :3000?');
  }
}

// ── Fetching Data ────────────────────────────────────────────────────────────
async function loadWorkers() {
  try {
    const res  = await fetchWithAuth(`${API}/workers`);
    const data = await res.json();
    renderWorkers(data);
  } catch (err) {
    showBanner(listBanner, err.message || 'No se puede conectar con el servidor. ¿Está corriendo en :3000?');
  }
}

// ── Render Worker List ────────────────────────────────────────────────────────
function renderWorkerList(workers) {
  // Remove existing cards (not the empty-msg)
  workerGrid.querySelectorAll('.worker-card').forEach(c => c.remove());
  workerCount.textContent = workers.length;

  if (workers.length === 0) {
    emptyMsg.removeAttribute('hidden');
    emptyMsg.textContent = 'No hay trabajadores. ¡Añade el primero!';
    return;
  }

  emptyMsg.setAttribute('hidden', '');

  workers.forEach(worker => {
    const card = createWorkerCard(worker);
    workerGrid.appendChild(card);
  });
}

function renderWorkers(workers) {
  workerGrid.innerHTML = '';
  
  if (!Array.isArray(workers) || workers.length === 0) {
    emptyMsg.style.display = 'block';
    emptyMsg.textContent = 'No hay trabajadores. Añade el primero.';
    workerGrid.appendChild(emptyMsg);
    workerCount.textContent = '0';
    return;
  }

  const activeWorkers = workers.filter(w => w.status !== 'despedido');
  workerCount.textContent = String(activeWorkers.length);

  workers.forEach(worker => {
    const isDespedido = worker.status === 'despedido';
    const clone = cardTemplate.content.cloneNode(true);
    const article = clone.querySelector('article');
    
    article.dataset.id = worker.id;
    if (isDespedido) article.classList.add('worker-despedido');

    clone.querySelector('.worker-card__id').textContent = worker.id;
    clone.querySelector('.worker-card__name').textContent = worker.name;
    
    const contextStr = [worker.company, worker.department].filter(Boolean).join(' - ');
    clone.querySelector('.worker-card__dept').textContent = contextStr || 'Sin def.';
    
    const initials = worker.name.split(' ').map(p => p[0] || '').slice(0, 2).join('').toUpperCase();
    clone.querySelector('.worker-card__avatar').textContent = initials;

    // Add DESPEDIDO badge
    if (isDespedido) {
      const badge = document.createElement('span');
      badge.className = 'ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20';
      badge.textContent = 'DESPEDIDO';
      const nameEl = clone.querySelector('.worker-card__name');
      nameEl.parentElement.appendChild(badge);
    }

    const removeBtn = clone.querySelector('.btn-remove');
    if (isDespedido) {
      removeBtn.style.display = 'none'; 
    } else {
      removeBtn.addEventListener('click', () => deleteWorker(worker.id, article));
    }
    // Note: .btn-schedule was removed from the template; schedule is now inline.
    
    const btnVacations = clone.querySelector('.btn-vacations');
    if (btnVacations) {
      if (isDespedido) { btnVacations.disabled = true; btnVacations.classList.add('opacity-30', 'cursor-not-allowed'); }
      else btnVacations.addEventListener('click', () => { if (typeof openVacations === 'function') openVacations(worker); });
    }

    const btnHours = clone.querySelector('.btn-hours');
    if (btnHours) {
      if (isDespedido) { btnHours.disabled = true; btnHours.classList.add('opacity-30', 'cursor-not-allowed'); }
      else btnHours.addEventListener('click', () => { if (typeof openHours === 'function') openHours(worker); });
    }

    // Populate counters (Feature 4.1)
    clone.querySelector('.counter-vac').textContent = `${worker.vacationDays || 0}d`;
    clone.querySelector('.counter-hrs').textContent = `${worker.overtimeHours || 0}h`;
    
    // Wire inline schedule BEFORE appending (article is still in the DocumentFragment)
    if (!isDespedido) wireInlineSchedule(worker.id, article);
    
    workerGrid.appendChild(clone);
  });
}

// ── Create Worker Card (SEC-04: textContent for all data) ─────────────────────
function createWorkerCard(worker) {
  const tpl   = cardTemplate.content.cloneNode(true);
  const card  = tpl.querySelector('.worker-card');
  const avatar = tpl.querySelector('.worker-card__avatar');
  const name   = tpl.querySelector('.worker-card__name');
  const idBadge = tpl.querySelector('.worker-card__id');
  const dept   = tpl.querySelector('.worker-card__dept');
  const btnSch = tpl.querySelector('.btn-schedule');
  const btnRem = tpl.querySelector('.btn-remove');

  // SEC-04: textContent only — never innerHTML with worker data
  const initials = worker.name
    .split(' ')
    .map(p => p[0] || '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
  avatar.textContent  = initials;
  name.textContent    = worker.name;
  idBadge.textContent = worker.id;
  dept.textContent    = worker.department || '—';

  card.dataset.workerId = worker.id;

  btnSch.addEventListener('click', () => openSchedule(worker.id, worker.name));
  btnRem.addEventListener('click', () => removeWorker(worker.id, card));

  return tpl;
}

// ── Add Worker ────────────────────────────────────────────────────────────────
addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideBanner(formBanner);

  const formData = new FormData(addForm);
  const payload  = {
    id:         formData.get('id').trim(),
    name:       formData.get('name').trim(),
    department: formData.get('department').trim(),
  };

  // Client-side pre-validation (server validates too)
  if (!payload.id)   return showBanner(formBanner, 'El ID es obligatorio.');
  if (!payload.name) return showBanner(formBanner, 'El nombre es obligatorio.');

  try {
    const passwordVal = document.getElementById('worker-password')?.value?.trim();
    const emailVal = document.getElementById('worker-email')?.value?.trim();
    const phoneVal = document.getElementById('worker-phone')?.value?.trim();
    const newWorker = {
      id: inputId.value.trim(),
      name: inputName.value.trim(),
      company: inputCompany.value.trim(),
      department: inputDept.value.trim(),
      ...(emailVal ? { email: emailVal } : {}),
      ...(phoneVal ? { phone: phoneVal } : {}),
      ...(passwordVal ? { password: passwordVal } : {}),
    };

    if (!newWorker.id) return showBanner(formBanner, 'El ID es obligatorio.');
    if (!newWorker.name) return showBanner(formBanner, 'El nombre es obligatorio.');

    const res = await fetchWithAuth(`${API}/workers`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(newWorker),
    });
    const data = await res.json();

    if (!res.ok) {
      showBanner(formBanner, data.error || 'Error al añadir trabajador.');
      return;
    }

    // Auto-save schedule if user filled any schedule fields
    const schedDays = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const newSchedule = {};
    const schedRegex = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
    let schedValid = true;
    schedDays.forEach(day => {
      const input = document.getElementById(`new-sched-${day}`);
      if (input && input.value.trim()) {
        if (!schedRegex.test(input.value.trim())) { schedValid = false; }
        else newSchedule[day] = input.value.trim();
      }
    });

    if (Object.keys(newSchedule).length > 0 && schedValid) {
      await fetchWithAuth(`${API}/workers/${encodeURIComponent(data.id)}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule)
      });
    }

    addForm.reset();
    // Collapse schedule form after reset
    const schedFields = document.getElementById('schedule-form-fields');
    const schedChevron = document.getElementById('schedule-form-chevron');
    if (schedFields) schedFields.classList.add('hidden');
    if (schedChevron) schedChevron.style.transform = '';

    showBanner(formBanner, `Trabajador "${data.name}" añadido correctamente.`, 'success');
    loadWorkers();
  } catch (err) {
    showBanner(formBanner, err.message || 'Error de red. Comprueba la conexión con el servidor.');
  }
});

// ── Remove Worker ─────────────────────────────────────────────────────────────
async function removeWorker(id, cardElement) {
  if (!confirm(`¿Eliminar el trabajador con ID "${id}"?`)) return;

  cardElement.classList.add('is-removing');

  try {
    const res  = await fetch(`${API}/workers/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok) {
      cardElement.classList.remove('is-removing');
      showBanner(listBanner, data.error || 'No se pudo eliminar el trabajador.');
      return;
    }

    // Wait for animation before removing from DOM
    setTimeout(() => {
      cardElement.remove();
      const remaining = workerGrid.querySelectorAll('.worker-card').length;
      workerCount.textContent = remaining;
      if (remaining === 0) {
        emptyMsg.removeAttribute('hidden');
        emptyMsg.textContent = 'No hay trabajadores. ¡Añade el primero!';
      }
    }, 250);

    showBanner(listBanner, `Trabajador "${id}" eliminado.`, 'success');
  } catch {
    cardElement.classList.remove('is-removing');
    showBanner(listBanner, 'Error de red al intentar eliminar.');
  }
}

async function deleteWorker(id, articleElement) {
  const btn = articleElement.querySelector('.btn-remove');
  
  // Inline double-click confirmation (avoid confirm() which can block/fail)
  if (!btn.dataset.confirming) {
    btn.dataset.confirming = '1';
    btn.title = 'Haz clic de nuevo para confirmar el despido';
    btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>`;
    btn.classList.add('text-red-400', 'bg-red-500/15', 'scale-110');
    setTimeout(() => {
      if (btn.dataset.confirming) {
        delete btn.dataset.confirming;
        btn.classList.remove('text-red-400', 'bg-red-500/15', 'scale-110');
        btn.title = '';
        btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>`;
      }
    }, 3500);
    return;
  }

  delete btn.dataset.confirming;
  btn.disabled = true;

  try {
    const res = await fetchWithAuth(`${API}/workers/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok) {
      btn.disabled = false;
      showBanner(listBanner, data.error || 'No se pudo despedir al trabajador.');
      return;
    }

    // Removal from DOM
    articleElement.classList.add('is-removing');
    setTimeout(() => {
      articleElement.remove();
      // Update active worker count
      const activeCards = workerGrid.querySelectorAll('article:not(.worker-despedido)').length;
      workerCount.textContent = String(activeCards);
    }, 500);

    showBanner(listBanner, `Trabajador "${id}" eliminado permanentemente.`, 'success');
  } catch (err) {
    btn.disabled = false;
    showBanner(listBanner, err.message || 'Error de red al intentar despedir.');
  }
}


// ── Open Schedule Dialog ──────────────────────────────────────────────────────
async function openSchedule(worker) {
  hideBanner(dialogBanner);
  dialogWorkerName.textContent = worker.name; // SEC-04
  scheduleWorkerId.value = worker.id;

  // Clear all inputs first
  SCHEDULE_DAYS.forEach(day => {
    const input = document.getElementById(`sched-${day}`);
    if (input) input.value = '';
  });

  try {
    const res      = await fetchWithAuth(`${API}/workers/${encodeURIComponent(worker.id)}/schedule`);
    const schedule = await res.json();

    if (!res.ok) {
      showBanner(dialogBanner, schedule.error || 'No se pudo cargar el horario.');
    } else {
      SCHEDULE_DAYS.forEach(day => {
        const input = document.getElementById(`sched-${day}`);
        if (input && schedule[day]) input.value = schedule[day];
      });
    }
  } catch (err) {
    showBanner(dialogBanner, err.message || 'Error de red al cargar horario.');
  }

  scheduleDialog.showModal();
}

// ── Save Schedule ─────────────────────────────────────────────────────────────
scheduleForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideBanner(dialogBanner);

  const id       = scheduleWorkerId.value;
  const schedule = {};

  SCHEDULE_DAYS.forEach(day => {
    const val = document.getElementById(`sched-${day}`).value.trim();
    if (val) schedule[day] = val;
  });

  try {
    const res  = await fetchWithAuth(`${API}/workers/${encodeURIComponent(id)}/schedule`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(schedule),
    });
    const data = await res.json();

    if (!res.ok) {
      showBanner(dialogBanner, data.error || 'Error al guardar horario.');
      return;
    }

    showBanner(dialogBanner, 'Horario guardado correctamente.', 'success');
    setTimeout(() => scheduleDialog.close(), 1800);
  } catch (err) {
    showBanner(dialogBanner, err.message || 'Error de red al guardar horario.');
  }
});

// ── Dialog Close ──────────────────────────────────────────────────────────────
btnCloseDialog.addEventListener('click', () => scheduleDialog.close());
btnCancelSched.addEventListener('click', () => scheduleDialog.close());

scheduleDialog.addEventListener('click', (e) => {
  if (e.target === scheduleDialog) scheduleDialog.close();
});

// ── Vacations Logic ───────────────────────────────────────────────────────────
const vacStartInput = document.getElementById('vac-start');
const vacEndInput   = document.getElementById('vac-end');
const vacForm       = document.getElementById('vacation-form');
const vacWorkerName = document.getElementById('vacation-worker-name');
const vacWorkerId   = document.getElementById('vacation-worker-id');
const vacAlert      = document.getElementById('vacation-alert');
const vacBody       = document.getElementById('vacation-history-body');

let companyVacations = [];

/**
 * Carga todas las vacaciones de la empresa para bloquearlas en el calendario
 */
async function loadCompanyVacations() {
  try {
    const res = await fetchWithAuth(`${API}/workers/company/vacations`);
    if (res.ok) {
      companyVacations = await res.json();
    }
  } catch (err) {
    console.error('Error cargando vacaciones de la empresa', err);
  }
}

function isDateBlocked(date, excludeWorkerId) {
  const dateStr = date.toISOString().split('T')[0];
  return companyVacations.some(v => {
    if (v.workerId === excludeWorkerId) return false;
    return dateStr >= v.startDate && dateStr <= v.endDate;
  });
}

// Datepickers are initialized lazily inside openVacations() to avoid
// stacking-context issues with the native <dialog> element (top-layer).

function showVacAlert(msg, type = 'danger') {
  const color = type === 'success' ? 'emerald' : 'red';
  vacAlert.className = `mb-6 p-4 bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 text-sm rounded-xl animate-in fade-in slide-in-from-top-2`;
  vacAlert.textContent = msg;
  vacAlert.classList.remove('hidden');
}

function hideVacAlert() {
  vacAlert.classList.add('hidden');
  vacAlert.textContent = '';
}

async function fetchVacations(id) {
  try {
    const res = await fetchWithAuth(`${API}/workers/${encodeURIComponent(id)}/vacations`);
    const data = await res.json();
    return res.ok ? data : [];
  } catch {
    return [];
  }
}

function calcDays(startDate, endDate) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

function renderVacationRows(vacations, workerId) {
  vacBody.innerHTML = '';
  if (!vacations || vacations.length === 0) {
    vacBody.innerHTML = '<tr><td colspan="3" class="px-6 py-8 text-center text-neutral-500 italic">No hay vacaciones registradas.</td></tr>';
    return;
  }
  
  vacations.forEach(v => {
    const days = calcDays(v.startDate, v.endDate);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="px-6 py-4 text-sm text-neutral-300 font-medium">${v.startDate} &rarr; ${v.endDate}</td>
      <td class="px-6 py-4 text-sm text-neutral-400 text-center font-mono">${days} día${days !== 1 ? 's' : ''}</td>
      <td class="px-6 py-4 text-right">
        <button class="p-2 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all delete-vac-btn" data-id="${v.id}">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </td>
    `;
    const delBtn = tr.querySelector('.delete-vac-btn');
    delBtn.addEventListener('click', () => deleteVacation(workerId, v.id, tr));
    vacBody.appendChild(tr);
  });
}

async function openVacations(worker) {
  hideVacAlert();
  vacForm.reset();
  vacStartInput.value = '';
  vacEndInput.value = '';
  
  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  vacStartInput.min = today;
  vacEndInput.min = today;

  // Update end min when start changes
  vacStartInput.onchange = () => {
    if (vacStartInput.value) vacEndInput.min = vacStartInput.value;
  };
  
  vacWorkerId.value = worker.id;
  vacWorkerName.textContent = worker.name;
  
  await loadCompanyVacations();

  vacBody.innerHTML = '<tr><td colspan="3" class="px-6 py-8 text-center"><span class="animate-spin inline-block w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full" role="status"></span></td></tr>';
  if (vacDialog) vacDialog.showModal();
  
  const vactList = await fetchVacations(worker.id);
  renderVacationRows(vactList, worker.id);
}

// Enviar solicitud de vacaciones (con checkCollision backend)
vacForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideVacAlert();
  
  const workerId  = vacWorkerId.value;
  const startDate = vacStartInput.value;
  const endDate   = vacEndInput.value;
  
  if (!startDate || !endDate) {
    return showVacAlert('Debe seleccionar inicio y fin.');
  }
  if (endDate < startDate) {
    return showVacAlert('La fecha de fin no puede ser anterior al inicio.');
  }
  
  const btn = vacForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  
  try {
    const res = await fetchWithAuth(`${API}/workers/${encodeURIComponent(workerId)}/vacations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate })
    });
    
    const data = await res.json();
    
    if (res.status === 409) {
      let msg = data.error || 'Conflicto.';
      if (data.collision) {
        msg += ` Choca con ${data.collision.name}`;
      }
      showToast(msg, 'error');
      showVacAlert(msg, 'danger');
    } else if (!res.ok) {
      showVacAlert(data.error || 'Error al guardar vacaciones.', 'danger');
    } else {
      showVacAlert('Vacaciones guardadas correctamente.', 'success');
      vacForm.reset();
      const list = await fetchVacations(workerId);
      renderVacationRows(list, workerId);
    }
  } catch (err) {
    showVacAlert(err.message || 'Error de red.', 'danger');
  } finally {
    btn.disabled = false;
  }
});

async function deleteVacation(workerId, vacId, trElement) {
  // Inline confirmation to avoid confirm() issues inside <dialog>
  const btn = trElement.querySelector('.delete-vac-btn');
  if (!btn.dataset.confirming) {
    btn.dataset.confirming = '1';
    btn.title = 'Haz clic de nuevo para confirmar la eliminación';
    btn.classList.add('text-red-400', 'bg-red-500/10');
    setTimeout(() => {
      delete btn.dataset.confirming;
      btn.classList.remove('text-red-400', 'bg-red-500/10');
      btn.title = '';
    }, 3000);
    return;
  }
  
  btn.disabled = true;
  
  try {
    const res = await fetchWithAuth(`${API}/workers/${encodeURIComponent(workerId)}/vacations/${encodeURIComponent(vacId)}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      trElement.classList.add('opacity-0', 'transition-opacity');
      setTimeout(() => {
        trElement.remove();
        if (vacBody.querySelectorAll('tr').length === 0) renderVacationRows([], workerId);
      }, 300);
    } else {
      const data = await res.json();
      showVacAlert(data.error || 'Error al eliminar', 'danger');
      btn.disabled = false;
    }
  } catch (err) {
    showVacAlert('Error de red al eliminar.', 'danger');
    btn.disabled = false;
  }
}

// ── Hours Logic (BS5 Modals) ──────────────────────────────────────────────────
const hrDateInput   = document.getElementById('hr-date');
const hrStartInput  = document.getElementById('hr-start');
const hrEndInput    = document.getElementById('hr-end');
const hrTypeInput   = document.getElementById('hr-type');
const hrForm        = document.getElementById('hours-form');
const hrWorkerName  = document.getElementById('hours-worker-name');
const hrWorkerId    = document.getElementById('hours-worker-id');
const hrAlert       = document.getElementById('hours-alert');
const hrBody        = document.getElementById('hours-history-body');

function showHrAlert(msg, type = 'danger') {
  const color = type === 'success' ? 'emerald' : (type === 'warning' ? 'amber' : 'red');
  hrAlert.className = `mb-6 p-4 bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 text-sm rounded-xl animate-in fade-in slide-in-from-top-2`;
  hrAlert.textContent = msg;
  hrAlert.classList.remove('hidden');
}

function hideHrAlert() {
  hrAlert.classList.add('hidden');
  hrAlert.textContent = '';
}

async function fetchHours(id) {
  try {
    const res = await fetchWithAuth(`${API}/workers/${encodeURIComponent(id)}/hours`);
    const data = await res.json();
    return res.ok ? data : [];
  } catch {
    return [];
  }
}

function renderHoursRows(hoursList, workerId) {
  hrBody.innerHTML = '';
  if (!hoursList || hoursList.length === 0) {
    hrBody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-neutral-500 italic">No hay horas registradas.</td></tr>';
    return;
  }
  
  hoursList.forEach(h => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="px-6 py-4 text-sm text-neutral-300 font-medium">${h.date}</td>
      <td class="px-6 py-4 text-sm text-neutral-400 text-center">${h.startTime} - ${h.endTime}</td>
      <td class="px-6 py-4 text-sm text-center">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${h.type === 'extra' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-brand-500/10 text-brand-500 border border-brand-500/20'}">
          ${h.type === 'extra' ? 'Extra' : 'Comp.'}
        </span>
      </td>
      <td class="px-6 py-4 text-right">
        <button class="p-2 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all delete-hr-btn" data-id="${h.id}">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </td>
    `;
    const delBtn = tr.querySelector('.delete-hr-btn');
    delBtn.addEventListener('click', () => deleteHour(workerId, h.id, tr));
    hrBody.appendChild(tr);
  });
}

async function openHours(worker) {
  hideHrAlert();
  hrForm.reset();
  
  hrWorkerId.value = worker.id;
  hrWorkerName.textContent = worker.name;
  
  hrBody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center"><span class="animate-spin inline-block w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full" role="status"></span></td></tr>';
  if(hoursDialog) hoursDialog.showModal();
  
  const hList = await fetchHours(worker.id);
  renderHoursRows(hList, worker.id);
}

if(hrForm){
  hrForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideHrAlert();
    
    const workerId  = hrWorkerId.value;
    const date = hrDateInput.value;
    const startTime = hrStartInput.value;
    const endTime = hrEndInput.value;
    const type = hrTypeInput.value;
    
    const btn = hrForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    
    try {
      const res = await fetchWithAuth(`${API}/workers/${encodeURIComponent(workerId)}/hours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, startTime, endTime, type })
      });
      
      const data = await res.json();
      
      if (res.status === 409) {
        const msg = `${data.error} ${data.details || ''}`;
        showToast(msg, 'warning');
        showHrAlert(msg, 'warning');
      } else if (!res.ok) {
        showHrAlert(data.error || 'Error al registrar horas', 'danger');
      } else {
        showHrAlert('Horas registradas correctamente.', 'success');
        hrForm.reset();
        
        const list = await fetchHours(workerId);
        renderHoursRows(list, workerId);
      }
    } catch (err) {
      showHrAlert(err.message || 'Error de red.', 'danger');
    } finally {
      btn.disabled = false;
    }
  });
}

async function deleteHour(workerId, hrId, trElement) {
  if (!confirm('¿Eliminar este registro de horas?')) return;
  
  const btn = trElement.querySelector('button');
  btn.disabled = true;
  
  try {
    const res = await fetchWithAuth(`${API}/workers/${encodeURIComponent(workerId)}/hours/${encodeURIComponent(hrId)}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      trElement.remove();
      if (hrBody.children.length === 0) renderHoursRows([], workerId);
    } else {
      const data = await res.json();
      showHrAlert(data.error || 'Error al eliminar', 'danger');
      btn.disabled = false;
    }
  } catch (err) {
    showHrAlert('Error de red al eliminar.', 'danger');
    btn.disabled = false;
  }
}


// ── Toggle Schedule Form in Add-Worker Panel ─────────────────────────────
function toggleScheduleForm() {
  const fields = document.getElementById('schedule-form-fields');
  const chevron = document.getElementById('schedule-form-chevron');
  const isHidden = fields.classList.contains('hidden');
  fields.classList.toggle('hidden', !isHidden);
  if (chevron) chevron.style.transform = isHidden ? 'rotate(180deg)' : '';
}

// ── Inline Schedule logic (attached per card in renderWorkers) ────────────
const SCHED_DAYS_ALL = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

async function loadInlineSchedule(workerId, section) {
  try {
    const res = await fetchWithAuth(`${API}/workers/${encodeURIComponent(workerId)}/schedule`);
    if (!res.ok) return;
    const schedule = await res.json();
    section.querySelectorAll('.inline-sched-input').forEach(input => {
      const day = input.dataset.day;
      input.value = schedule[day] || '';
    });
  } catch {/* silently ignore */}
}

async function saveInlineSchedule(workerId, section) {
  const schedule = {};
  const regex = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
  let invalid = false;

  section.querySelectorAll('.inline-sched-input').forEach(input => {
    const val = input.value.trim();
    if (val) {
      if (!regex.test(val)) { invalid = true; return; }
      schedule[input.dataset.day] = val;
    }
  });

  const statusEl = section.querySelector('.inline-sched-status');

  if (invalid) {
    statusEl.textContent = '⚠ Usa HH:MM-HH:MM';
    statusEl.className = 'inline-sched-status text-[11px] font-medium text-amber-400';
    statusEl.classList.remove('hidden');
    setTimeout(() => statusEl.classList.add('hidden'), 3000);
    return;
  }

  try {
    const res = await fetchWithAuth(`${API}/workers/${encodeURIComponent(workerId)}/schedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule)
    });
    if (res.ok) {
      statusEl.textContent = '✓ Guardado';
      statusEl.className = 'inline-sched-status text-[11px] font-medium text-emerald-400';
    } else {
      statusEl.textContent = '✗ Error';
      statusEl.className = 'inline-sched-status text-[11px] font-medium text-red-400';
    }
  } catch {
    statusEl.textContent = '✗ Sin conexión';
    statusEl.className = 'inline-sched-status text-[11px] font-medium text-red-400';
  }
  statusEl.classList.remove('hidden');
  setTimeout(() => statusEl.classList.add('hidden'), 3000);
}

function wireInlineSchedule(workerId, article) {
  const toggleBtn = article.querySelector('.btn-toggle-schedule');
  const section = article.querySelector('.schedule-inline-section');
  const chevron = article.querySelector('.schedule-chevron');
  const saveBtn = article.querySelector('.btn-save-inline-sched');
  if (!toggleBtn || !section) return;

  let loaded = false;
  toggleBtn.addEventListener('click', async () => {
    const isHidden = section.classList.contains('hidden');
    section.classList.toggle('hidden', !isHidden);
    if (chevron) chevron.style.transform = isHidden ? 'rotate(180deg)' : '';
    if (isHidden && !loaded) {
      loaded = true;
      await loadInlineSchedule(workerId, section);
    }
  });

  if (saveBtn) {
    saveBtn.addEventListener('click', () => saveInlineSchedule(workerId, section));
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
updateNavUI();
loadWorkers();
