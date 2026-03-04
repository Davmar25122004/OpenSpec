# Proposal: Advanced Workforce Features v2

## Resumen

Ampliar el sistema de gestión de empleados `manage-workforce-v1` con cuatro nuevas capacidades críticas:

1. **Autenticación de acceso** básica para proteger las rutas.
2. **Framework UI Bootstrap 5** para enriquecer componentes visuales sin eliminar el CSS moderno actual.
3. **Módulo de vacaciones** gestionado usando jQuery y Datepicker.
4. **Regla de negocio estricta** (Backend): Bloquear e impedir que dos trabajadores de la misma empresa reserven vacaciones en días superpuestos.
5. **Calidad**: Mantener JSDoc en los nuevos métodos y documentar en `PROJECT_LOG.md`.

## Problema

El sistema v1 permite gestión de trabajadores y horarios, pero actualmente:

- Cualquier persona, en cualquier momento, puede acceder y modificar.
- Faltan componentes modernos interactivos (alertas, modales nativos) con un framework sólido.
- No es posible administrar las vacaciones, lo cual es crítico en la gestión de personal.
- Sin validación de negocio, los empleados de una misma empresa podrían coger vacaciones a la vez, dejando el servicio descubierto.

## Cambio Propuesto

Implementar la segunda fase (v2) sobre el código existente `manage-workforce-v1` (en `app/server` y `app/client`):

1. **Login Basico**: Modificar el backend para emitir un JWT o token sencillo (`/api/auth/login`) y proteger las rutas de administración de modo que devuelvan 401 si no hay token.
2. **Bootstrap 5**: Importar Bootstrap por CDN en el `index.html`. Refinar modales y añadir _toast_ o _alerts_ usando las clases de BS5 interaccionando bien con el layout Grid preexistente.
3. **Módulo Vacaciones**:
   - Añadir soporte en el frontend usando jQuery y jQuery UI Datepicker.
   - En backend, ampliar modelo de datos para un array de vacaciones.
4. **Lógica Contra Colisión (Crítica)**:
   - Al recibir un POST para asignar vacaciones en el backend, el código buscará si existen reservas activas en ese mismo rango de fechas `[start, end]` para otros trabajadores donde `workerA.company === workerB.company`.
   - Si se solapan, rechazar la operación con HTTP 409 Conflict.
5. **Persistencia en db.json**: Todas las vacaciones se escribirán atómicamente en el JSON actual.
6. **JSDoc y Registro**: Todo método nuevo llevará JSDoc. El prompt que generó este cambio será añadido a `PROJECT_LOG.md`.

## Metas

1. Prevenir colisiones de vacaciones entre empleados de la misma `company` en el backend antes de guardar.
2. Proveer una UI de calendario atractiva con jQ Datepicker y BS5.
3. Proteger la manipulación de datos con autenticación de sesión.
4. Preservar la persistencia atómica en `db.json`.
5. Promover buenas prácticas con JSDoc en el 100% de nuevas funciones.

## Fuera de Alcance

- Roles complejos o base de datos relacional (mantenemos db.json).
- Recuperación de contraseña por email.

## Impacto

- Modificación de endpoints existentes de trabajadores mediante un middleware auth.
- Nuevos endpoints para Login (`/api/auth/login`) y Vacaciones (`/api/workers/:id/vacations`).
- Inclusión de `<script>` en el front para BS5 y jQuery.
- Modificación del `db.json` para modelar la relación `.company` y array `.vacations`.
