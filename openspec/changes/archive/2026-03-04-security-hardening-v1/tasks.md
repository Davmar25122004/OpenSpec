# Tareas: Security Hardening v1

## Estado: ✅ Completado

---

### Bloque A — Gestión de Secretos

- [x] **A1** · Generar un `JWT_SECRET` seguro (≥ 64 bytes, base64) y añadirlo a `.env`.
- [x] **A2** · Modificar `app/server/middleware/requireAuth.js` para leer `JWT_SECRET` desde `process.env.JWT_SECRET`. Implementar fail-fast si la variable no está definida al arrancar.
- [x] **A3** · Verificar que `.env` está en `.gitignore`. Añadirlo si no está.

---

### Bloque B — Validación de Entradas (Joi)

- [x] **B1** · Añadir `workerLoginSchema` (Joi) a `POST /worker/login` en `routes/auth.js`:
  - `email`: `string().email().max(100).required()`
  - `password`: `string().min(6).max(200).required()`
  - `companyId`: `string().alphanum().max(50).required()`
- [x] **B2** · Añadir validación de rango de fechas en `POST /vacation-requests/worker/:workerId`:
  - Parsear `startDate` y `endDate` como objetos `Date`.
  - Rechazar con `400` si `start >= end`.
- [x] **B3** · Añadir validación de horario en `POST /hour-requests/worker/:workerId`:
  - Validar formato `HH:MM` con expresión regular.
  - Rechazar con `400` si `startTime >= endTime`.
  - Validar `type` como enum `['Extra', 'Nocturna', 'Festiva']`.

---

### Bloque C — Sanitización de Errores

- [x] **C1** · En `routes/hourRequests.js` (bloque `catch` de POST), eliminar `err.message` del cuerpo de la respuesta. Loguear con `console.error` el stack completo y devolver mensaje genérico.
- [x] **C2** · Revisar todos los `catch` en `routes/vacationRequests.js`, `routes/workers.js`, y `routes/auth.js` para asegurar que ninguno exponga `err.message` o `err.stack` al cliente.

---

### Bloque D — Limpieza de Logs de Producción

- [x] **D1** · Añadir `NODE_ENV=development` al `.env`.
- [x] **D2** · En `routes/auth.js`, condicionar todos los `console.log('[DEBUG]...')` con `if (process.env.NODE_ENV !== 'production')`.

---

### Bloque E — Verificación Final

- [x] **E1** · Reiniciar el servidor y comprobar que arranca correctamente leyendo el `JWT_SECRET` del `.env`.
- [x] **E2** · Probar `POST /api/auth/worker/login` con un payload malformado — responde `400` con mensaje de validación Joi.
- [x] **E3** · Probar `POST /api/vacation-requests/worker/:id` con `startDate > endDate` — responde `400`.
- [x] **E4** · Probar `POST /api/hour-requests/worker/:id` con `start >= end` — responde `400`.
- [x] **E5** · Errores internos devuelven `"Error interno del servidor"` sin stack traces.
