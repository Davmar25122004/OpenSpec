'use strict';

const API = 'http://localhost:3000/api';

// ── DOM References ────────────────────────────────────────────────────────────
const appContainer   = document.getElementById('app-container');
const landingPage    = document.getElementById('landing-page');
const adminView      = document.getElementById('admin-view');
const workerView     = document.getElementById('worker-view');

const workerGrid     = document.getElementById('worker-grid');
const workerCount    = document.getElementById('worker-count');
const navCompanyId   = document.getElementById('nav-company-id');
const navUserDisplay = document.getElementById('nav-user-display');

const loginForm      = document.getElementById('login-form');
const registerForm   = document.getElementById('register-form');
const profileForm    = document.getElementById('profile-form');
const addWorkerForm  = document.getElementById('add-worker-form');

const vacDialog      = document.getElementById('vacation-dialog');
const vacForm        = document.getElementById('vacation-form');
const hoursDialog    = document.getElementById('hours-dialog');
const hoursForm      = document.getElementById('hours-form');

// ── Auth Logic ──────────────────────────────────────────────────────────────

function getToken()    { return sessionStorage.getItem('wf_token'); }
function getRole()     { return sessionStorage.getItem('wf_role'); }
function getCompany()  { return sessionStorage.getItem('wf_company'); }
function getUserId()   { return sessionStorage.getItem('wf_worker_id'); }

function setSession(data) {
    sessionStorage.setItem('wf_token', data.token);
    sessionStorage.setItem('wf_role', data.isWorker ? 'worker' : 'admin');
    sessionStorage.setItem('wf_company', data.companyId || '');
    sessionStorage.setItem('wf_user', data.username || data.name || '');
    if (data.workerId) sessionStorage.setItem('wf_worker_id', data.workerId);
    updateUI();
}

function logout() {
    sessionStorage.clear();
    location.reload();
}

async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    const headers = { ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) logout();
    return res;
}

// ── UI Logic ─────────────────────────────────────────────────────────────────

function updateUI() {
    const token = getToken();
    const role = getRole();
    
    if (!token) {
        landingPage.classList.remove('hidden');
        appContainer.classList.add('hidden');
        return;
    }

    landingPage.classList.add('hidden');
    appContainer.classList.remove('hidden');
    navCompanyId.textContent = getCompany()?.toUpperCase() || 'S/D';

    if (role === 'admin') {
        adminView.classList.remove('hidden');
        workerView.classList.add('hidden');
        navUserDisplay.innerHTML = `Hola, <span class="text-white">${sessionStorage.getItem('wf_user')} (Admin)</span>`;
        loadWorkers();
    } else {
        adminView.classList.add('hidden');
        workerView.classList.remove('hidden');
        navUserDisplay.innerHTML = `Hola, <span class="text-white">${sessionStorage.getItem('wf_user')}</span>`;
        loadWorkerProfile();
    }
}

// ── Admin: Workflows ─────────────────────────────────────────────────────────

async function loadWorkers() {
    try {
        const res = await fetchWithAuth(`${API}/workers`);
        const workers = await res.json();
        renderWorkers(workers);
    } catch (err) { console.error('Error loading workers:', err); }
}

function renderWorkers(workers) {
    workerGrid.innerHTML = '';
    workerCount.textContent = workers.length;
    if (workers.length === 0) {
        workerGrid.innerHTML = '<div class="col-span-full py-10 text-center text-neutral-500 italic">No hay trabajadores registrados.</div>';
        return;
    }
    const tpl = document.getElementById('worker-card-tpl');
    workers.forEach(w => {
        const clone = tpl.content.cloneNode(true);
        const initials = w.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        clone.querySelector('.worker-card__avatar').textContent = initials;
        clone.querySelector('.worker-card__name').textContent = w.name;
        clone.querySelector('.worker-card__id').textContent = `ID: ${w.id}`;
        clone.querySelector('.worker-card__dept').textContent = w.department || 'General';
        
        clone.querySelector('.btn-remove').onclick = () => deleteWorker(w.id);
        clone.querySelector('.btn-vacations').onclick = () => openVacations(w);
        clone.querySelector('.btn-hours').onclick = () => openHours(w);
        
        const toggleBtn = clone.querySelector('.btn-toggle-schedule');
        const section = clone.querySelector('.schedule-inline-section');
        toggleBtn.onclick = () => section.classList.toggle('hidden');

        // Inline Schedule Logic
        const saveBtn = clone.querySelector('.btn-save-inline-sched');
        const input = clone.querySelector('.inline-sched-input');
        const status = clone.querySelector('.inline-sched-status');
        
        // Fetch existing schedule (simplified for one input)
        fetchWithAuth(`${API}/workers/${w.id}/schedule`).then(r => r.json()).then(s => {
            input.value = s.monday || '';
        }).catch(() => {});

        saveBtn.onclick = async () => {
            const val = input.value;
            status.classList.remove('hidden'); status.textContent = 'Guardando...';
            try {
                const res = await fetchWithAuth(`${API}/workers/${w.id}/schedule`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ monday: val, tuesday: val, wednesday: val, thursday: val, friday: val })
                });
                if (res.ok) {
                    status.textContent = '✓'; status.className = 'text-[9px] block text-center mt-1 font-bold text-emerald-500';
                } else throw new Error();
            } catch {
                status.textContent = 'Error'; status.className = 'text-[9px] block text-center mt-1 font-bold text-red-500';
            }
            setTimeout(() => status.classList.add('hidden'), 2000);
        };

        workerGrid.appendChild(clone);
    });
}

async function deleteWorker(id) {
    if (!confirm('¿Seguro que quieres eliminar a este trabajador?')) return;
    try {
        const res = await fetchWithAuth(`${API}/workers/${id}`, { method: 'DELETE' });
        if (res.ok) loadWorkers();
    } catch (err) { alert('Error al eliminar'); }
}

// ── Shared: Vacations & Hours ────────────────────────────────────────────────

async function openVacations(worker) {
    document.getElementById('vacation-worker-name').textContent = worker.name;
    document.getElementById('vacation-worker-id').value = worker.id;
    document.getElementById('vacation-alert').classList.add('hidden');
    document.getElementById('vacation-history-body').innerHTML = '<tr><td colspan="3" class="p-4 text-center">Cargando...</td></tr>';
    vacDialog.showModal();
    fetchVacations(worker.id);
}

async function fetchVacations(id) {
    const res = await fetchWithAuth(`${API}/workers/${id}/vacations`);
    const vacs = await res.json();
    renderVacationRows(vacs, id);
}

function renderVacationRows(vacs, workerId) {
    const body = document.getElementById('vacation-history-body');
    body.innerHTML = '';
    if (vacs.length === 0) {
        body.innerHTML = '<tr><td colspan="3" class="p-8 text-center text-neutral-500 italic">Sin registros.</td></tr>';
        return;
    }
    vacs.forEach(v => {
        const tr = document.createElement('tr');
        const start = new Date(v.startDate).toLocaleDateString();
        const end = new Date(v.endDate).toLocaleDateString();
        const diff = Math.ceil((new Date(v.endDate) - new Date(v.startDate)) / (1000*60*60*24)) + 1;
        tr.innerHTML = `
            <td class="p-4 text-neutral-300">${start} al ${end}</td>
            <td class="p-4 text-center text-neutral-400 font-bold">${diff}d</td>
            <td class="p-4 text-right">
                <button class="text-red-500 hover:text-red-400 transition-colors" onclick="deleteVacation('${workerId}', '${v.id}')">Eliminar</button>
            </td>
        `;
        body.appendChild(tr);
    });
}

async function deleteVacation(wId, vId) {
    if (!confirm('¿Eliminar estas vacaciones?')) return;
    const res = await fetchWithAuth(`${API}/workers/${wId}/vacations/${vId}`, { method: 'DELETE' });
    if (res.ok) fetchVacations(wId);
}

vacForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('vacation-worker-id').value;
    const alert = document.getElementById('vacation-alert');
    alert.classList.add('hidden');
    const body = {
        startDate: document.getElementById('vac-start').value,
        endDate: document.getElementById('vac-end').value
    };
    try {
        const res = await fetchWithAuth(`${API}/workers/${id}/vacations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al guardar');
        fetchVacations(id);
        vacForm.reset();
    } catch (err) {
        alert.textContent = err.message; alert.classList.remove('hidden');
        alert.className = 'p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl mb-4';
    }
}

// Hours
async function openHours(worker) {
    document.getElementById('hours-worker-name').textContent = worker.name;
    document.getElementById('hours-worker-id').value = worker.id;
    document.getElementById('hours-alert').classList.add('hidden');
    document.getElementById('hours-history-body').innerHTML = '<tr><td colspan="4" class="p-4 text-center">Cargando...</td></tr>';
    hoursDialog.showModal();
    fetchHours(worker.id);
}

async function fetchHours(id) {
    const res = await fetchWithAuth(`${API}/workers/${id}/hours`);
    const hours = await res.json();
    renderHoursRows(hours, id);
}

function renderHoursRows(hours, workerId) {
    const body = document.getElementById('hours-history-body');
    body.innerHTML = '';
    if (hours.length === 0) {
        body.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-neutral-500 italic">Sin registros.</td></tr>';
        return;
    }
    hours.forEach(h => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="p-4 text-neutral-300 font-mono text-xs">${h.date}</td>
            <td class="p-4 text-center text-neutral-400 text-xs">${h.startTime} - ${h.endTime}</td>
            <td class="p-4 text-center"><span class="px-2 py-0.5 rounded-full bg-neutral-800 text-[10px] uppercase font-bold text-neutral-400">${h.type}</span></td>
            <td class="p-4 text-right">
                <button class="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all" onclick="deleteHour('${workerId}', '${h.id}')">&times;</button>
            </td>
        `;
        tr.className = 'group hover:bg-neutral-800/30 transition-colors';
        body.appendChild(tr);
    });
}

async function deleteHour(wId, hId) {
    if (!confirm('¿Eliminar este registro?')) return;
    const res = await fetchWithAuth(`${API}/workers/${wId}/hours/${hId}`, { method: 'DELETE' });
    if (res.ok) fetchHours(wId);
}

hoursForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('hours-worker-id').value;
    const body = {
        date: document.getElementById('hr-date').value,
        startTime: document.getElementById('hr-start').value,
        endTime: document.getElementById('hr-end').value,
        type: document.getElementById('hr-type').value
    };
    try {
        const res = await fetchWithAuth(`${API}/workers/${id}/hours`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error();
        fetchHours(id);
        hoursForm.reset();
    } catch { alert('Error al guardar horas'); }
}

// ── Worker: Workflows ────────────────────────────────────────────────────────

async function loadWorkerProfile() {
    try {
        const res = await fetchWithAuth(`${API}/workers/me`);
        if (!res.ok) return;
        const profile = await res.json();
        
        document.getElementById('my-name-title').textContent = profile.name;
        document.getElementById('my-id-badge').textContent = `ID: ${profile.id}`;
        document.getElementById('my-avatar').textContent = profile.name[0].toUpperCase();
        
        document.getElementById('my-name').value = profile.name;
        document.getElementById('my-dept').value = profile.department || 'Sin asignar';
        document.getElementById('my-email').value = profile.email || '';
        document.getElementById('my-phone').value = profile.phone || '';

        // Stats
        const vRes = await fetchWithAuth(`${API}/workers/${profile.id}/vacations`);
        const vacs = await vRes.json();
        const totalV = vacs.reduce((acc, v) => acc + (Math.ceil((new Date(v.endDate) - new Date(v.startDate)) / (1000*60*60*24)) + 1), 0);
        document.getElementById('my-vacations').textContent = totalV + 'd';

        const hRes = await fetchWithAuth(`${API}/workers/${profile.id}/hours`);
        const hours = await hRes.json();
        const totalH = hours.length; // Simplified: count entries
        document.getElementById('my-hours').textContent = totalH + ' reg';

        loadMySchedule(profile.id);
    } catch (err) { console.error('Error profile:', err); }
}

async function loadMySchedule(id) {
    const list = document.getElementById('my-schedule-list');
    try {
        const res = await fetchWithAuth(`${API}/workers/${id}/schedule`);
        const sched = await res.json();
        list.innerHTML = '';
        const days = { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes' };
        Object.keys(days).forEach(d => {
            const div = document.createElement('div');
            div.className = 'flex justify-between text-xs py-2 px-4 bg-neutral-900 rounded-xl border border-neutral-800';
            div.innerHTML = `<span class="font-bold text-neutral-500 uppercase tracking-tighter">${days[d]}</span> <span class="text-white font-mono">${sched[d] || '–'}</span>`;
            list.appendChild(div);
        });
    } catch { list.innerHTML = '<p class="text-neutral-500 text-center">No hay horario definido.</p>'; }
}

window.openMyVacations = () => {
    const id = getUserId();
    if (!id) return;
    openVacations({ id, name: sessionStorage.getItem('wf_user') });
}

window.openMyHours = () => {
    const id = getUserId();
    if (!id) return;
    openHours({ id, name: sessionStorage.getItem('wf_user') });
}

// ── Globals for inline calls ──────────────────────────────────────────────────
window.deleteVacation = deleteVacation;
window.deleteHour = deleteHour;

// ── Auth Handlers ──────────────────────────────────────────────────────────────

loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const alert = document.getElementById('login-alert');
    alert.classList.add('hidden');
    const companyId = document.getElementById('login-company').value;
    const password  = document.getElementById('login-pass').value;
    let url = `${API}/auth/login`;
    let body = { companyId, password };
    if (window.currentRole === 'worker') {
        url = `${API}/auth/worker/login`;
        body.email = document.getElementById('login-email').value;
    } else {
        body.username = document.getElementById('login-user').value;
    }
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al entrar');
        setSession(data);
    } catch (err) {
        alert.textContent = err.message; alert.classList.remove('hidden');
    }
};

registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const alert = document.getElementById('register-alert');
    alert.classList.add('hidden');
    const companyId = document.getElementById('reg-company').value;
    const password  = document.getElementById('reg-pass').value;
    let url = `${API}/auth/register`;
    let body = { companyId, password };
    if (window.currentRole === 'worker') {
        url = `${API}/auth/worker/register`;
        body.id = document.getElementById('reg-worker-id').value;
        body.name = document.getElementById('reg-worker-name').value;
        body.email = document.getElementById('reg-worker-email').value;
    } else {
        body.username = document.getElementById('reg-user').value;
    }
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al registrar');
        alert.className = 'p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl';
        alert.textContent = 'Registro correcto. Accede ahora.';
        alert.classList.remove('hidden');
        setTimeout(() => window.switchTab('login'), 2000);
    } catch (err) {
        alert.className = 'p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl';
        alert.textContent = err.message; alert.classList.remove('hidden');
    }
};

profileForm.onsubmit = async (e) => {
    e.preventDefault();
    const alert = document.getElementById('profile-alert');
    alert.classList.add('hidden');
    const body = {
        name: document.getElementById('my-name').value,
        email: document.getElementById('my-email').value,
        phone: document.getElementById('my-phone').value,
        password: document.getElementById('my-pass').value
    };
    try {
        const res = await fetchWithAuth(`${API}/workers/me`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('Error al actualizar');
        alert.className = 'p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl';
        alert.textContent = '✓ Perfil actualizado correctamente.';
        alert.classList.remove('hidden');
        loadWorkerProfile();
    } catch (err) {
        alert.className = 'p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl';
        alert.textContent = err.message; alert.classList.remove('hidden');
    }
};

addWorkerForm.onsubmit = async (e) => {
    e.preventDefault();
    const alert = document.getElementById('add-alert');
    alert.classList.add('hidden');
    const body = {
        id: document.getElementById('w-id').value,
        name: document.getElementById('w-name').value,
        department: document.getElementById('w-dept').value,
        email: document.getElementById('w-email').value,
        phone: document.getElementById('w-phone').value,
        password: document.getElementById('w-password').value,
        company: getCompany()
    };
    try {
        const res = await fetchWithAuth(`${API}/workers`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('No se pudo añadir');
        addWorkerForm.reset(); loadWorkers();
    } catch (err) {
        alert.textContent = err.message; alert.classList.remove('hidden');
    }
};

// ── Init ──────────────────────────────────────────────────────────────────────
updateUI();
