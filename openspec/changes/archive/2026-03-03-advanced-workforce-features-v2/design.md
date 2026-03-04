# Design: Advanced Workforce Features v2

## Contexto

El sistema v1 actual maneja CRUD básico y horarios semanales con persistencia en `db.json`. Ahora debemos evolucionar a v2 agregando Autenticación, Frontend mejorado con Bootstrap 5, gestión vacacional vía Datepicker, y prevención de superposición de vacaciones por empresa.

## Objetivos

1. **Auth JWT Stateless**: Proteger endpoints de `server/routes/...`
2. **Bootstrap 5 UI**: Cargar vía CDN; coexistencia con el `styles.css` actual. Modales nativos vs. BS5 Alert / Modal.
3. **Módulo Vacaciones con jQuery**: Renderizar UI para calendarios con `jquery-ui`.
4. **Backend Collision Algorithm**: La lógica crítica que impide colisiones entre trabajadores de la misma `company` se ejecuta **antes** de mutar el JSON.
5. **JSDoc**: Asegurar estándares documentando nuevas lógicas.

---

## Arquitectura

```
[ BS5 + jQ UI ]  ←HTTP/JWT→  [ Express API ]  ←(Middlewares)→  [ db.json ]
```

---

## Módulo 1 — Autenticación

- **Storage Cliente**: Token guardado en `sessionStorage` tras login.
- **Ruta Backend**: `POST /api/auth/login`. Un user hardcodeado (p.e. `admin` / `passwordHash`) bastará para validación básica.
- **Middleware**: `server/middleware/auth.js` que verifica que la cabecera `Authorization: Bearer <token>` esté presente y sea válida con HMAC `jsonwebtoken`.

## Módulo 2 — Bootstrap 5 + jQuery

- CSS Custom (Grid, Colores, Dark Mode) de v1 se mantiene.
- **`<link>` y `<script>`** en `index.html` importando BS5, jQuery, y jQuery UI (Datepicker).
- **Componentes**:
  - Un Navbar estilizadado.
  - Modales o Toasts de BS5 en vez de custom Banners cuando sea necesario para las alertas.

## Módulo 3 — Gestión de Vacaciones

```json
// En db.json, el Worker tendrá:
"id": "sofosol-222",
"company": "Sofosol S.A.", // <-- Novedad
"vacations": [           // <-- Novedad
  { "id": "v-uuid", "startDate": "2026-07-01", "endDate": "2026-07-15" }
]
```

- **Datepicker Client-Side**: El DOM tendrá `$("#start-date").datepicker({ minDate: 0 })`. Al cambiar, se ajusta el `minDate` del end-date.

## Módulo 4 — Lógica de Colisión (Crítica)

Algoritmo en Node.js que procesa el `POST /api/workers/:id/vacations`:

1. Determina la `company` de `worker_id`.
2. Filtra de la BD aquellos workers con la misma empresa y `id !== worker_id`.
3. Para cada compañero de empresa encontrado, itera sobre sus `vacations` y compara `[nueva_start, nueva_end]` vs `[amigo_start, amigo_end]`.
4. Si las rangos de fecha se interceptan `(max(start1, start2) <= min(end1, end2))`, lanza **HTTP 409 Conflict** indicando choque. Bloqueado. De lo contrario, procede y guarda en `db.json`.

## Tecnologías Nuevas a Añadir

- `jsonwebtoken`, `bcryptjs` (Backend npm)
- BS5, jQuery, jQueryUI (Frontend CDN)

## Riesgos

- Alterar los templates Grid de v1 por usar clases genéricas de BS5 (resuelto no alterando clases core o evitando sobreescritura de Reset CSS).
- El JSON persistente (`db.json`) falla al escribir: solucionado con escritura atómica `tmp-rename` de v1 que ya manejamos.
