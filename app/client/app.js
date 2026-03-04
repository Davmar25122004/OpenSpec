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
        loadPendingRequests();
    } else {
        adminView.classList.add('hidden');
        workerView.classList.remove('hidden');
        navUserDisplay.innerHTML = `Hola, <span class="text-white">${sessionStorage.getItem('wf_user')}</span>`;
        loadWorkerProfile();
        loadClockingStatus();
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

async function loadPendingRequests() {
    const list = document.getElementById('pending-vacations-list');
    const countBadge = document.getElementById('pending-vac-badge');
    try {
        const res = await fetchWithAuth(`${API}/requests/pending`);
        const requests = await res.json();
        
        list.innerHTML = '';
        if (!requests || requests.length === 0) {
            countBadge.classList.add('hidden');
            list.innerHTML = '<p class="text-neutral-500 italic text-sm text-center py-2">No hay peticiones pendientes.</p>';
            return;
        }
        
        countBadge.textContent = requests.length;
        countBadge.classList.remove('hidden');
        
        requests.forEach(r => {
            const isVac = r.type === 'vacation';
            const icon = isVac ? '🏖' : '⏱';
            const label = isVac ? 'Vacaciones' : 'Horas Extra';
            const color = isVac ? 'text-brand-400' : 'text-amber-500';
            
            let details = '';
            if (isVac) {
                details = `${new Date(r.start_date).toLocaleDateString()} a ${new Date(r.end_date).toLocaleDateString()}`;
            } else {
                details = `${new Date(r.date).toLocaleDateString()} (${r.start_time}-${r.end_time}) [${r.type_name || r.type}]`;
            }
            
            const div = document.createElement('div');
            div.className = 'flex flex-col bg-neutral-900 border border-neutral-800 p-4 rounded-xl mb-3 last:mb-0 shadow-sm';
            div.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="font-black text-white text-sm block">${r.worker_name}</span>
                        <span class="text-[9px] font-bold uppercase ${color} tracking-widest">${icon} ${label}</span>
                    </div>
                    <span class="text-[10px] text-neutral-500 font-mono">${details}</span>
                </div>
                <div class="flex space-x-2 mt-2">
                    <button class="flex-1 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[10px] font-black uppercase rounded-lg transition-all border border-emerald-500/30" onclick="handleRequest('${r.id}', 'approved', '${r.type}')">Aprobar</button>
                    <button class="flex-1 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-[10px] font-black uppercase rounded-lg transition-all border border-red-500/30" onclick="handleRequest('${r.id}', 'rejected', '${r.type}')">Rechazar</button>
                </div>
            `;
            list.appendChild(div);
        });
    } catch (err) { console.error('Error loadPending:', err); }
}

async function handleRequest(id, status, type) {
    try {
        const endpoint = type === 'vacation' ? 'vacation-requests' : 'hour-requests';
        const res = await fetchWithAuth(`${API}/${endpoint}/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.details || data.error || 'Error');
        }
        loadPendingRequests();
        if (status === 'approved') loadWorkers();
    } catch (err) { alert(err.message); }
}

window.handleVacRequest = async (id, status) => {
    try {
        const res = await fetchWithAuth(`${API}/vacation-requests/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error interno');
        
        // Reload list
        loadPendingRequests();
        // If approved, it might affect workers list, reload workers to see UI update
        if (status === 'approved') loadWorkers();
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

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
        
        if (w.onVacationNow) {
            clone.querySelector('.vacation-badge').classList.remove('hidden');
        }
        
        clone.querySelector('.btn-remove').onclick = () => deleteWorker(w.id);
        clone.querySelector('.btn-vacations').onclick = () => openVacations(w);
        clone.querySelector('.btn-hours').onclick = () => openHours(w);
        clone.querySelector('.btn-clocking-history').onclick = () => openClockingHistory(w);
        
        const toggleBtn = clone.querySelector('.btn-toggle-schedule');
        const section = clone.querySelector('.schedule-inline-section');
        toggleBtn.onclick = () => section.classList.toggle('hidden');

        // Inline Schedule Logic
        const saveBtn = clone.querySelector('.btn-save-inline-sched');
        const inputs = clone.querySelectorAll('.inline-sched-input');
        const status = clone.querySelector('.inline-sched-status');
        
        // Fetch existing schedule
        fetchWithAuth(`${API}/workers/${w.id}/schedule`).then(r => r.json()).then(s => {
            inputs.forEach(inp => {
                const day = inp.getAttribute('data-day');
                inp.value = s[day] || '';
            });
        }).catch(() => {});

        saveBtn.onclick = async () => {
            const scheduleData = {};
            inputs.forEach(inp => {
                const val = inp.value.trim();
                if (val) scheduleData[inp.getAttribute('data-day')] = val;
            });
            
            status.classList.remove('hidden'); status.textContent = 'Guardando...';
            try {
                const res = await fetchWithAuth(`${API}/workers/${w.id}/schedule`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(scheduleData)
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
    
    // Hide form if worker
    const form = document.getElementById('vacation-form');
    if (getRole() === 'worker') {
        form.classList.add('hidden');
    } else {
        form.classList.remove('hidden');
    }

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
    const isWorker = getRole() === 'worker';
    body.innerHTML = '';
    
    // Header adjustments
    const headerRow = document.querySelector('#vacation-dialog thead tr');
    if (headerRow) {
        headerRow.innerHTML = `<th class="p-4">Periodo</th><th class="p-4 text-center">Días</th>${isWorker ? '' : '<th class="p-4 text-right">Acción</th>'}`;
    }

    if (vacs.length === 0) {
        body.innerHTML = `<tr><td colspan="${isWorker ? 2 : 3}" class="p-8 text-center text-neutral-500 italic">Sin registros.</td></tr>`;
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
            ${isWorker ? '' : `
            <td class="p-4 text-right">
                <button class="text-red-500 hover:text-red-400 transition-colors" onclick="deleteVacation('${workerId}', '${v.id}')">Eliminar</button>
            </td>`}
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

    const startVal = document.getElementById('vac-start').value;
    const endVal   = document.getElementById('vac-end').value;

    // ── Client-side validation ────────────────────────────────────────────────
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(startVal);
    const end   = new Date(endVal);

    if (!startVal || !endVal) {
        alert.textContent = '⚠️ Las fechas son obligatorias.';
        alert.className = 'p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm rounded-xl mb-4';
        alert.classList.remove('hidden');
        return;
    }
    if (start < today || end < today) {
        alert.textContent = 'Vacaciones imposibles — no puedes solicitar vacaciones en el pasado.';
        alert.className = 'p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl mb-4';
        alert.classList.remove('hidden');
        return;
    }
    if (start >= end) {
        alert.textContent = 'Vacaciones imposibles — la fecha de inicio debe ser anterior a la de fin.';
        alert.className = 'p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl mb-4';
        alert.classList.remove('hidden');
        return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    const body = { startDate: startVal, endDate: endVal };
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
    
    // Hide form if worker
    const form = document.getElementById('hours-form');
    if (getRole() === 'worker') {
        form.classList.add('hidden');
    } else {
        form.classList.remove('hidden');
    }

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
    const isWorker = getRole() === 'worker';
    body.innerHTML = '';
    
    // Header adjustments
    const headerRow = document.querySelector('#hours-dialog thead tr');
    if (headerRow) {
        headerRow.innerHTML = `<th class="p-4">Fecha</th><th class="p-4 text-center">Horario</th><th class="p-4 text-center">Tipo</th>${isWorker ? '' : '<th class="p-4 text-right">Acción</th>'}`;
    }

    if (hours.length === 0) {
        body.innerHTML = `<tr><td colspan="${isWorker ? 3 : 4}" class="p-8 text-center text-neutral-500 italic">Sin registros.</td></tr>`;
        return;
    }
    hours.forEach(h => {
        const tr = document.createElement('tr');
        tr.className = 'group hover:bg-neutral-800/30 transition-colors';
        tr.innerHTML = `
            <td class="p-4 text-neutral-300 font-mono text-xs">${h.date}</td>
            <td class="p-4 text-center text-neutral-400 text-xs">${h.startTime} - ${h.endTime}</td>
            <td class="p-4 text-center"><span class="px-2 py-0.5 rounded-full bg-neutral-800 text-[10px] uppercase font-bold text-neutral-400">${h.type}</span></td>
            ${isWorker ? '' : `
            <td class="p-4 text-right">
                <button class="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all font-bold text-lg" onclick="deleteHour('${workerId}', '${h.id}')">&times;</button>
            </td>`}
        `;
        body.appendChild(tr);
    });
}

async function deleteHour(wId, hId) {
    if (!confirm('¿Eliminar este registro?')) return;
    const res = await fetchWithAuth(`${API}/workers/${wId}/hours/${hId}`, { method: 'DELETE' });
    if (res.ok) fetchHours(wId);
}

// ── Clocking History logic ────────────────────────────────────────────────────────

async function openClockingHistory(worker) {
    const dialog = document.getElementById('clocking-history-dialog');
    const nameEl = document.getElementById('clock-history-worker-name');
    const content = document.getElementById('clocking-history-content');
    
    if (!dialog || !content) return;

    nameEl.textContent = worker.name;
    content.innerHTML = '<div class="text-center py-10 text-neutral-500 italic">Cargando registros...</div>';
    dialog.showModal();
    
    try {
        const res = await fetchWithAuth(`${API}/clocking/worker/${worker.id}/history`);
        const events = await res.json();
        
        if (!events || events.length === 0) {
            content.innerHTML = '<div class="text-center py-10 text-neutral-500 italic">No hay registros de fichaje para este trabajador.</div>';
            return;
        }
        
        // Group into sessions (Entry + Exit)
        // Events are ordered DESC by timestamp
        const sessions = [];
        let currentSession = null;
        
        // Processing from oldest to newest to pair them
        const sortedEvents = [...events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        sortedEvents.forEach(ev => {
            if (ev.event_type === 'ENTRY') {
                if (currentSession) sessions.push(currentSession); // entry without exit
                currentSession = { entry: ev, exit: null };
            } else if (ev.event_type === 'EXIT') {
                if (currentSession) {
                    currentSession.exit = ev;
                    sessions.push(currentSession);
                    currentSession = null;
                } else {
                    // Out without In?
                    sessions.push({ entry: null, exit: ev });
                }
            }
        });
        if (currentSession) sessions.push(currentSession);
        
        // Sort sessions by date DESC for display
        sessions.sort((a, b) => {
            const dateA = new Date(a.entry ? a.entry.timestamp : a.exit.timestamp);
            const dateB = new Date(b.entry ? b.entry.timestamp : b.exit.timestamp);
            return dateB - dateA;
        });

        // Group by weeks and filter by day (keep only last session per day)
        const weeks = {};
        const seenDays = new Set();
        
        sessions.forEach(s => {
            const date = new Date(s.entry ? s.entry.timestamp : s.exit.timestamp);
            const dayKey = date.toLocaleDateString();
            
            // Because sessions are already sorted by date DESC, the first one we see for a day is the last one
            if (seenDays.has(dayKey)) return;
            seenDays.add(dayKey);

            // Get start of week (Monday)
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            const startOfWeek = new Date(d.setDate(diff));
            startOfWeek.setHours(0,0,0,0);
            
            const weekKey = startOfWeek.toLocaleDateString();
            if (!weeks[weekKey]) {
                weeks[weekKey] = {
                    start: startOfWeek,
                    items: []
                };
            }
            weeks[weekKey].items.push(s);
        });
        
        renderClockingHistory(weeks, content);
        
    } catch (err) {
        console.error('Error loading clocking history:', err);
        content.innerHTML = '<div class="text-center py-10 text-red-500 font-bold uppercase">Error al cargar el historial</div>';
    }
}

function renderClockingHistory(weeks, container) {
    container.innerHTML = '';
    
    // Sort week keys DESC
    const sortedKeys = Object.keys(weeks).sort((a, b) => {
        const [d1, m1, y1] = a.split('/').map(Number);
        const [d2, m2, y2] = b.split('/').map(Number);
        return new Date(y2, m2-1, d2) - new Date(y1, m1-1, d1);
    });

    sortedKeys.forEach(weekKey => {
        const week = weeks[weekKey];
        const weekSection = document.createElement('div');
        weekSection.className = 'bg-neutral-900/50 rounded-3xl border border-white/5 overflow-hidden';
        
        const header = `
            <div class="px-6 py-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <h5 class="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Semana del ${weekKey}</h5>
                <span class="text-[9px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">${week.items.length} jornadas</span>
            </div>
            <div class="p-6 space-y-4">
        `;
        
        let itemsHtml = '';
        week.items.forEach(s => {
            const mainDate = s.entry ? new Date(s.entry.timestamp) : new Date(s.exit.timestamp);
            const entryTime = s.entry ? new Date(s.entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---';
            const exitTime = s.exit ? new Date(s.exit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (s.entry ? '<span class="text-amber-500 animate-pulse uppercase">En curso</span>' : '---');
            const dayLabel = mainDate.toLocaleDateString([], { weekday: 'long', day: '2-digit', month: 'short' });
            
            itemsHtml += `
                <div class="flex items-center justify-between pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <div class="flex flex-col">
                        <span class="text-xs font-bold text-white capitalize">${dayLabel}</span>
                    </div>
                    <div class="flex items-center space-x-8">
                        <div class="text-right">
                            <p class="text-[7px] text-neutral-600 font-black uppercase mb-0.5">Entrada</p>
                            <p class="text-xs font-mono text-emerald-400 font-bold">${entryTime}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-[7px] text-neutral-600 font-black uppercase mb-0.5">Salida</p>
                            <p class="text-xs font-mono text-neutral-500 font-bold">${exitTime}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        weekSection.innerHTML = header + itemsHtml + '</div>';
        container.appendChild(weekSection);
    });
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
        
        // Fix S/D in header if missing from session
        if (profile.company_id && !sessionStorage.getItem('wf_company')) {
            sessionStorage.setItem('wf_company', profile.company_id);
            navCompanyId.textContent = profile.company_id.toUpperCase();
        }
        
        document.getElementById('my-name-title').textContent = profile.name;
        document.getElementById('my-id-badge').textContent = `ID: ${profile.id}`;
        document.getElementById('my-avatar').textContent = profile.name[0].toUpperCase();
        
        document.getElementById('my-name').value = profile.name;
        const deptInput = document.getElementById('my-dept');
        deptInput.value = profile.department || '';
        deptInput.placeholder = 'Sin asignar';
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
        loadMyVacationRequests(profile.id);
        loadMyHourRequests(profile.id);
    } catch (err) { console.error('Error profile:', err); }
}

async function loadMyVacationRequests(id) {
    const list = document.getElementById('my-vacation-requests-list');
    try {
        const res = await fetchWithAuth(`${API}/vacation-requests/worker/${id}`);
        const requests = await res.json();
        list.innerHTML = '';
        if (requests.length === 0) {
            list.innerHTML = '<p class="text-neutral-500 italic text-xs text-center py-2">Sin peticiones previas.</p>';
            return;
        }
        requests.forEach(r => {
            const start = new Date(r.start_date).toLocaleDateString();
            const end = new Date(r.end_date).toLocaleDateString();
            const statusMap = {
                'pending': '<span class="text-amber-400">Pendiente</span>',
                'approved': '<span class="text-emerald-400">Aprobada</span>',
                'rejected': '<span class="text-red-400">Rechazada</span>'
            };
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-neutral-900 border border-neutral-800 p-2 rounded-lg';
            div.innerHTML = `<span>${start} - ${end}</span> <span class="font-bold">${statusMap[r.status] || r.status}</span>`;
            list.appendChild(div);
        });
    } catch { 
        list.innerHTML = '<p class="text-red-500 text-center text-xs">Error cargando peticiones.</p>'; 
    }
}

const myVacationRequestForm = document.getElementById('my-vacation-request-form');
myVacationRequestForm.onsubmit = async (e) => {
    e.preventDefault();
    const alert = document.getElementById('my-vac-request-alert');
    alert.classList.add('hidden');
    const startVal = document.getElementById('my-vac-req-start').value;
    const endVal   = document.getElementById('my-vac-req-end').value;

    // ── Client-side validation ────────────────────────────────────────────────
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(startVal);
    const end   = new Date(endVal);

    if (!startVal || !endVal) {
        alert.textContent = '⚠️ Las fechas son obligatorias.';
        alert.className = 'p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm rounded-xl mb-2';
        alert.classList.remove('hidden');
        return;
    }
    if (start < today || end < today) {
        alert.textContent = 'Vacaciones imposibles — no puedes solicitar vacaciones en el pasado.';
        alert.className = 'p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl mb-2';
        alert.classList.remove('hidden');
        return;
    }
    if (start >= end) {
        alert.textContent = 'Vacaciones imposibles — la fecha de inicio debe ser anterior a la de fin.';
        alert.className = 'p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl mb-2';
        alert.classList.remove('hidden');
        return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    const body = { startDate: startVal, endDate: endVal };
    try {
        const res = await fetchWithAuth(`${API}/vacation-requests/worker/${getUserId()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error enviando petición');
        
        alert.className = 'p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl mb-2';
        alert.textContent = 'Petición enviada correctamente.';
        alert.classList.remove('hidden');
        myVacationRequestForm.reset();
        loadMyVacationRequests(getUserId());
    } catch (err) {
        alert.className = 'p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl mb-2';
        alert.textContent = err.message; 
        alert.classList.remove('hidden');
    }
};

async function loadMySchedule(id) {
    const list = document.getElementById('my-schedule-list');
    try {
        const res = await fetchWithAuth(`${API}/workers/${id}/schedule`);
        const sched = await res.json();
        list.innerHTML = '';
        const days = { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo' };
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
        department: document.getElementById('my-dept').value,
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
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al actualizar');

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
    const scheduleData = {};
    document.querySelectorAll('.new-sched-input').forEach(inp => {
        const val = inp.value.trim();
        if (val) scheduleData[inp.getAttribute('data-day')] = val;
    });

    const body = {
        id: document.getElementById('w-id').value.trim(),
        name: document.getElementById('w-name').value.trim(),
        department: document.getElementById('w-dept').value.trim(),
        email: document.getElementById('w-email').value.trim(),
        phone: document.getElementById('w-phone').value.trim(),
        password: document.getElementById('w-password').value.trim(),
        schedule: scheduleData,
        company: getCompany()
    };

    if (!body.id || !body.name || !body.email || !body.password) {
        alert.textContent = 'Debes añadir todos los campos obligatorios (ID, Nombre, Email y Contraseña)';
        alert.className = 'p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl mb-4';
        alert.classList.remove('hidden');
        return;
    }
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

async function loadMyHourRequests(id) {
    const list = document.getElementById('my-hour-requests-list');
    try {
        const res = await fetchWithAuth(`${API}/hour-requests/worker/${id}`);
        const requests = await res.json();
        list.innerHTML = '';
        if (!requests || requests.length === 0) {
            list.innerHTML = '<p class="text-neutral-500 italic text-[10px] text-center py-2 uppercase opacity-50">Sin reportes pendientes</p>';
            return;
        }
        requests.forEach(r => {
            const div = document.createElement('div');
            const statusColor = r.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                'bg-red-500/10 text-red-500 border-red-500/20';
            div.className = `flex justify-between items-center p-3 rounded-xl border ${statusColor} text-[10px] font-bold`;
            div.innerHTML = `
                <div>
                   <span class="block">${new Date(r.date).toLocaleDateString()}</span>
                   <span class="opacity-70">${r.start_time}-${r.end_time} (${r.type})</span>
                </div>
                <span class="uppercase tracking-widest">${r.status}</span>
            `;
            list.appendChild(div);
        });
    } catch (err) { console.error('Error loadMyHourReq:', err); }
}

const myHourRequestForm = document.getElementById('my-hour-request-form');
if (myHourRequestForm) {
    myHourRequestForm.onsubmit = async (e) => {
        e.preventDefault();
        const alert = document.getElementById('my-hour-request-alert');
        const body = {
            date: document.getElementById('my-hr-date').value,
            type: document.getElementById('my-hr-type').value,
            startTime: document.getElementById('my-hr-start').value,
            endTime: document.getElementById('my-hr-end').value
        };
        try {
            const res = await fetchWithAuth(`${API}/hour-requests/worker/${getUserId()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al enviar reporte');
            
            alert.className = 'p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-xl mb-2 uppercase text-center';
            alert.textContent = 'Reporte enviado correctamente';
            alert.classList.remove('hidden');
            myHourRequestForm.reset();
            loadMyHourRequests(getUserId());
        } catch (err) {
            alert.className = 'p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-xl mb-2 uppercase text-center';
            alert.textContent = err.message;
            alert.classList.remove('hidden');
        }
    };
}

function togglePendingVacations() {
    const list = document.getElementById('pending-vacations-list');
    const chevron = document.getElementById('pending-vac-chevron');
    if (list.classList.contains('hidden')) {
        list.classList.remove('hidden');
        chevron.style.transform = 'rotate(180deg)';
    } else {
        list.classList.add('hidden');
        chevron.style.transform = 'rotate(0deg)';
    }
}

// Restore schedule toggle listener
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btn-toggle-add-schedule' || (e.target.parentElement && e.target.parentElement.id === 'btn-toggle-add-schedule')) {
        const group = document.getElementById('w-schedule-group');
        const chevron = document.getElementById('add-schedule-chevron');
        if (group && chevron) {
            group.classList.toggle('hidden');
            chevron.style.transform = group.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    }
});

// ── Clocking Logic (Fichaje) ────────────────────────────────────────────────

async function loadClockingStatus() {
    console.log('[DEBUG] Loading clocking status...');
    const statusText = document.getElementById('clocking-status-text');
    const lastEventText = document.getElementById('clocking-last-event');
    const actionBtn = document.getElementById('btn-clocking-action');
    const statusIcon = document.getElementById('clocking-status-icon');
    
    if (!statusText || !actionBtn) {
        console.warn('[DEBUG] Missing DOM elements for clocking');
        return;
    }
    
    try {
        const url = `${API}/clocking/status`;
        console.log('[DEBUG] Fetching status from:', url);
        const res = await fetchWithAuth(url);
        if (!res.ok) {
            console.error('[DEBUG] Status fetch failed with status:', res.status);
            throw new Error();
        }
        
        const data = await res.json();
        console.log('[DEBUG] Clocking data:', data);
        const lastEvent = data.lastEvent;
        const history = data.history || [];
        const state = lastEvent?.event_type || 'EXIT';
        
        // UI Elements for session details
        const sessionDetails = document.getElementById('clocking-session-details');
        const entryTimeEl = document.getElementById('session-entry-time');
        const exitTimeEl = document.getElementById('session-exit-time');
        
        if (state === 'ENTRY') {
            statusText.innerHTML = 'Estado: <span class="text-emerald-500">En Jornada</span>';
            actionBtn.textContent = 'Fichar Salida';
            actionBtn.className = 'btn-primary-tw w-full sm:w-auto px-10 py-4 shadow-xl bg-rose-600 hover:bg-rose-700 shadow-rose-900/20';
            statusIcon.textContent = '🚀';
            statusIcon.className = 'w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl border border-emerald-500/20';
            
            // Current session details
            if (sessionDetails) sessionDetails.classList.remove('hidden');
            const entryTime = new Date(lastEvent.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (entryTimeEl) entryTimeEl.textContent = entryTime;
            if (exitTimeEl) {
                exitTimeEl.textContent = 'EN CURSO';
                exitTimeEl.className = 'text-sm font-mono text-amber-400 animate-pulse';
            }
        } else {
            statusText.innerHTML = 'Estado: <span class="text-neutral-500">Fuera de Servicio</span>';
            actionBtn.textContent = 'Fichar Entrada';
            actionBtn.className = 'btn-primary-tw w-full sm:w-auto px-10 py-4 shadow-xl bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20';
            statusIcon.textContent = '🏠';
            statusIcon.className = 'w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-2xl';
            
            // Last session details
            const lastEntry = history.find(h => h.event_type === 'ENTRY');
            if (lastEntry && lastEvent && lastEvent.event_type === 'EXIT') {
                if (sessionDetails) sessionDetails.classList.remove('hidden');
                const entryT = new Date(lastEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const exitT = new Date(lastEvent.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                if (entryTimeEl) entryTimeEl.textContent = entryT;
                if (exitTimeEl) {
                    exitTimeEl.textContent = exitT;
                    exitTimeEl.className = 'text-sm font-mono text-neutral-400';
                }
            } else if (sessionDetails) {
                sessionDetails.classList.add('hidden');
            }
        }
        
        if (lastEvent && lastEvent.timestamp) {
            const date = new Date(lastEvent.timestamp).toLocaleString();
            lastEventText.textContent = `Último registro: ${date} (${lastEvent.event_type})`;
        } else {
            lastEventText.textContent = 'Sin registros previos';
        }
        
        actionBtn.disabled = false;
        window.currentClockingState = state;
    } catch (err) {
        console.error('[DEBUG] Clocking status fetch error:', err);
        statusText.textContent = 'Error al cargar estado';
        actionBtn.disabled = true;
    }
}

async function handleClockingAction() {
    const alert = document.getElementById('clocking-alert');
    const actionBtn = document.getElementById('btn-clocking-action');
    
    alert.classList.add('hidden');
    actionBtn.disabled = true;
    const originalText = actionBtn.textContent;
    actionBtn.textContent = 'Localizando...';
    
    const type = window.currentClockingState === 'ENTRY' ? 'exit' : 'entry';
    
    try {
        // 1. Get Geolocation
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
        
        actionBtn.textContent = 'Registrando...';
        
        // 2. Call API
        const res = await fetchWithAuth(`${API}/clocking/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                device_id: 'Web Browser (' + navigator.userAgent.slice(0, 30) + ')',
                location_coords: {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                }
            })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al fichar');
        
        // 3. Success
        loadClockingStatus();
        loadWorkerProfile(); // Refresh reg count
        
    } catch (err) {
        alert.textContent = err.code === 1 ? 'Error: Debes permitir la ubicación para fichar' : (err.message || 'Error técnico');
        alert.classList.remove('hidden');
        actionBtn.disabled = false;
        actionBtn.textContent = originalText;
    }
}
