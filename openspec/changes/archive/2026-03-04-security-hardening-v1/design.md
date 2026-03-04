# Diseño Técnico: Security Hardening v1

## Arquitectura de la Solución

El hardening se organiza en 4 capas de defensa independientes que se aplican de forma secuencial durante la request lifecycle:

```
Request → [1. Auth Middleware] → [2. Joi Validation] → [3. Business Logic] → [4. Error Boundary]
```

---

## Capa 1: Gestión de Secretos (requireAuth.js + .env)

**Problema**: `JWT_SECRET = 'supersecreto-...'` hardcodeado en código fuente. Si el repo es comprometido, todos los tokens firmados son falsificables indefinidamente.

**Solución**:

- Mover `JWT_SECRET` a `.env` como `JWT_SECRET=<valor generado con openssl rand -base64 64>`.
- Añadir `.env` al `.gitignore` si no estuviera.
- El servidor falla al arrancar si `JWT_SECRET` no está definido (fail-fast).

```js
// requireAuth.js — DESPUÉS
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("FATAL: JWT_SECRET no definido en .env");
```

---

## Capa 2: Validación de Entradas con Joi (Schemas por ruta)

**Problema**: `POST /worker/login` recibe `email`, `password`, `companyId` sin validación de tipo ni formato. Un atacante puede enviar un objeto o un array en lugar de un string.

**Solución**: Añadir schema Joi homogéneo a todas las rutas de auth:

```js
// Schema NUEVO para worker/login
const workerLoginSchema = Joi.object({
  email: Joi.string().email().max(100).required(),
  password: Joi.string().min(6).max(200).required(),
  companyId: Joi.string().alphanum().max(50).required(),
});
```

**Validaciones adicionales**:

- Vacaciones: `startDate < endDate` (Joi `.custom()` o validación manual post-parse).
- Horas extra: `endTime > startTime`, `type` debe ser enum `['Extra', 'Nocturna', 'Festiva']`.

---

## Capa 3: Gestión de Errores (Error Boundary)

**Problema**: `routes/hourRequests.js` línea 34 devuelve `err.message` directamente al cliente:

```js
res.status(500).json({ error: "Error en base de datos: " + err.message }); // ❌ EXPONE SCHEMA INTERNO
```

**Solución**: Todos los bloques `catch` de rutas devuelven un mensaje genérico. El stack trace completo se loguea solo en servidor:

```js
} catch (err) {
  console.error('[ERROR]', { route: 'POST /hour-requests', message: err.message, stack: err.stack });
  res.status(500).json({ error: 'Error interno del servidor. Por favor contacta con soporte.' });
}
```

---

## Capa 4: Limpieza de Logs de Producción

**Problema**: Los `console.log('[DEBUG] Admin Login Attempt:', { username, companyId })` en `auth.js` son útiles en desarrollo pero peligrosos en producción: revelan patrones de autenticación a un atacante con acceso a logs.

**Solución**: Usar una constante `IS_DEV` y anular los logs de debugg en producción:

```js
const IS_DEV = process.env.NODE_ENV !== "production";
if (IS_DEV) console.log("[DEBUG] Admin Login:", { username, companyId });
```

---

## Archivos Afectados

| Archivo                                 | Tipo de cambio                                            |
| --------------------------------------- | --------------------------------------------------------- |
| `app/server/middleware/requireAuth.js`  | Leer `JWT_SECRET` desde `process.env`                     |
| `app/server/routes/auth.js`             | Añadir Joi a `worker/login`; condicionar `console.log`    |
| `app/server/routes/hourRequests.js`     | Sanitizar mensajes de error; añadir validación fecha/hora |
| `app/server/routes/vacationRequests.js` | Añadir validación `startDate < endDate`                   |
| `.env` (nuevo/actualizar)               | Añadir `JWT_SECRET` y `NODE_ENV`                          |
