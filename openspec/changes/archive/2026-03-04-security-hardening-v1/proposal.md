# Propuesta: Security Hardening v1

## ¿Qué?

Realizar un hardening completo de la capa de autenticación, validación de inputs y gestión de errores del servidor Node.js, mitigando vulnerabilidades identificadas mediante revisión de código (SAST).

## ¿Por qué?

La auditoría del código actual reveló los siguientes riesgos:

| Nº  | Severidad  | Vulnerabilidad                                                | Fichero afectado                                       |
| --- | ---------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| 1   | 🔴 Crítica | JWT_SECRET hardcodeado en el código fuente                    | `middleware/requireAuth.js`                            |
| 2   | 🔴 Crítica | Mensajes de error internos expuestos al cliente               | `routes/hourRequests.js`                               |
| 3   | 🟠 Alta    | Ruta `POST /worker/login` sin schema Joi de validación        | `routes/auth.js`                                       |
| 4   | 🟠 Alta    | `console.log` de credenciales en producción                   | `routes/auth.js`                                       |
| 5   | 🟡 Media   | Fecha de inicio de vacaciones no validada contra fecha de fin | `routes/vacationRequests.js`                           |
| 6   | 🟡 Media   | `workerId` comparado como string en JWT (sin parseo numérico) | `routes/hourRequests.js`, `routes/vacationRequests.js` |

## ¿Para quién?

- **Administradores**: Elimina riesgo de exfiltración de secretos de infraestructura.
- **Trabajadores**: Previene manipulación de IDs o inyección de datos malformados en peticiones propias.
- **Operaciones**: Facilita auditoría con logs estructurados sin exponer stack traces.

## Alcance

- Migrar `JWT_SECRET` a variable de entorno `.env`.
- Añadir schema Joi a `POST /worker/login`.
- Sanear mensajes de error: todos los errores internos devuelven `500` con mensaje genérico.
- Eliminar `console.log` con datos sensibles en producción.
- Añadir validación `startDate < endDate` en vacaciones y `date válida + endTime > startTime` en horas.
