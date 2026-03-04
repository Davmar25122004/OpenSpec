# Tasks: Advanced Workforce Features v2

## 1. Módulo JWT (Auth) - Prioridad 1

- [ ] 1.1 `server/auth/credentials.json`: Crear JSON simple con `user` y `passwordHash` (p.ej un bcrypt hash para 1234).
- [ ] 1.2 Instalar dependencias backend `jsonwebtoken` y `bcryptjs`.
- [ ] 1.3 `server/routes/auth.js`: Mapear POST `login` validando e inyectando un token con clave y caducidad.
- [ ] 1.4 `server/middleware/auth.js`: Middleware interceptor que analice la cabecera `Authorization`.

## 2. Aplicar Auth y JSDoc Backend

- [ ] 2.1 Anexar Middleware `auth.js` en los POST/DELETE de `routes/workers.js`.
- [ ] 2.2 Probar con invocaciones manuales la denegación sin JWT y la aceptación con él.
- [ ] 2.3 Añadir bloques JSDoc estandar a todos los middlewares y rutas construidas.

## 3. Lógica Backend de Colisión de Vacaciones (Crítico)

- [ ] 3.1 `server/services/vacationCollision.js`: Escribir y documentar `rangosSeSuperponen(s1, e1, s2, e2)`.
- [ ] 3.2 Implementar en el mismo archivo `checkCollision(workerId, requestStart, requestEnd)`.
- [ ] 3.3 Anexar validación de atributos (`startDate` anterior a `endDate` format `YYYY-MM-DD`).

## 4. Endpoints de Vacaciones

- [ ] 4.1 Modificar el endpoint de Creación Worker para reservar espacio `.company` y `.vacations=[]`.
- [ ] 4.2 Completar `GET /api/workers/:id/vacations` para devolver las vacaciones de X trabajador.
- [ ] 4.3 Implementar `POST` guardando tras comprobar el servicio de colisiones si procede.
- [ ] 4.4 Integrar `DELETE` sobre las vacaciones. Todo actualizando atómicamente el JSON.

## 5. UI: Bootstrap 5 y Navbar (Frontend)

- [ ] 5.1 Enlazar BS5 mediante CDN en `index.html`.
- [ ] 5.2 Añadir Navbar que interactúe dinámicamente según si existe token de sesión almacenado. Retocar UI.
- [ ] 5.3 Elaborar un formulario/modal de Login de BS5 y mapearlo al JS Auth. Interceptar clics sin sesión.

## 6. UI: Panel de Vacaciones y Datepicker

- [ ] 6.1 Enlazar jQuery y jQuery UI en `index.html`.
- [ ] 6.2 Construir Sub-panel modal (Modal BS5) para inyectar vacaciones e invocar Datepickers en los inputs.
- [ ] 6.3 Lógica `app.js` de JS: Modificar dinamicamente el minimum-date de `endDate` segun lo elegido en `startDate`.

## 7. Integración, Tests y Logging

- [ ] 7.1 Manual e2e Testing de Solapamiento: Intentar pedir días chocando con compañero.
- [ ] 7.2 Manual e2e JWT: Confirmar la expiración o caída por falta de Login.
- [ ] 7.3 Actualizar `PROJECT_LOG.md` con las actas de lo propuesto y analizado sobre la marcha en /opsx:apply.
