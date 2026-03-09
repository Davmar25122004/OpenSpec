# PROJECT_LOG.md — manage-workforce-v1

> Registro técnico del cambio completado el 03/03/2026.

---

## 1.# Registro del Proyecto (Workforce Management)

## Archivo Reciente: enterprise-workforce-v3-full (2026-03-03)

- **Estado:** Completado y Archivado en `openspec/changes/archive/2026-03-03-enterprise-workforce-v3-full`
- **Resumen de Cierre:**
  - Se ha solucionado el problema crítico de interfaz (pantalla en negro) separando correctamente el contenedor de autenticación del contenedor principal de la SPA.
  - Se reconstruyó el backend en Node/Express implementando una base de datos atómica segura con aislamiento estricto por `companyId` (Multi-tenant).
  - Se restauraron satisfactoriamente la funcionalidad de `Vacaciones` (incluyendo la prevención de solapamientos / colisiones entre empleados de la misma empresa empleando Datepicker UI) y la gestión de `Horas Complementarias`.
  - El flujo de registro fue modificado para requerir un inicio de sesión manual obligatorio, tal como se solicitó.

---

### Prompt inicial (propuesta)

> _"Usar la habilidad OpenSpec para crear una propuesta de: añadir o eliminar trabajadores y poder añadir su horario. Quiero que el frontend sea en HTML5 estándar, y quiero un backend en el que se puedan almacenar los trabajadores, poder modificar su horario y que sea persistente. Quiero que añada seguridad a la hora de añadir trabajadores."_

### Prompt de especificación (apply)

> _"Arquitectura: Crea un sistema de gestión de empleados con persistencia real (JSON local o SQLite). Frontend Moderno: Usa HTML5 semántico y CSS moderno (Custom Properties, CSS Grid y un layout responsivo elegante). Seguridad Estricta: No permitas la creación de trabajadores si no pasan una validación de seguridad (sanitización de inputs y verificación de ID único). Lógica de Horarios: El sistema debe permitir asignar y modificar horarios, asegurando que los cambios se guarden en el backend. Restricción de Proceso: Sigue estrictamente el flujo de artefactos de OpenSpec: la seguridad debe definirse primero en las Delta Specs y en el design.md antes de generar cualquier tarea de interfaz."_

---

## Funcionalidad v2: Características Avanzadas y Gestión de Vacaciones

### Registro de Prompts

> "Nuevos Requisitos (Añadir a la base existente): Framework UI: Incorporar Bootstrap 5 (versión moderna) para mejorar los componentes visuales sin eliminar el CSS moderno ya existente. Servicio de Login: Implementar un sistema de autenticación básico para proteger las rutas de gestión. Gestión de Vacaciones: Crear un módulo de vacaciones usando jQuery y Datepicker para la selección de fechas. Lógica de Negocio (Crítica): Si dos trabajadores pertenecen a una misma empresa, un trabajador ya tiene vacaciones asignadas en un rango de fechas, si el sistema debe bloquear e impedir que otro trabajador de la misma empresa reserve en esos mismos días. Persistencia y Seguridad: Mantener la persistencia en db.json. Asegurar que la lógica de colisión de fechas se valide en el backend antes de guardar. Calidad: Mantener estándares JSDoc en todos los nuevos métodos y actualizar el PROJECT_LOG.md con este nuevo prompt y su análisis."

### Análisis de Resultado

1. **Framework UI (Bootstrap 5)**: Se integró vía CDN en `index.html`. La Navbar y los Modales (Login y Vacaciones) pasaron a usar clases de BS5 puras interactuando con JavaScript nativo (`app.js`). El antiguo diseño CSS Custom Properties de v1 sigue dominando las _cards_ de trabajadores y el layout principal (Grid).
2. **Servicio de Login (JWT Auth)**: Se crearon endpoints `/api/auth/login` emitiendo un token JWT firmado. Todas las mutaciones (POST, PUT, DELETE) están interceptadas por la _middleware_ `requireAuth.js`. El estado se almacena en el `sessionStorage` y se inyecta pasivamente en cada petición Fetch.
3. **Gestión de Vacaciones (jQuery + Datepicker)**: Para las fechas se inyectó la dependencia clásica de jQuery UI y se instanció dinámicamente el `minDate` interactivo para que "Fecha Fin" no pueda ser menor a "Fecha Inicio", bloqueando absurdos en el FrontEnd.
4. **Lógica de Colisión (Matemática)**: Se creó un módulo dedicado `services/vacationCollision.js`. Aplica la fórmula `A_start <= B_end AND A_end >= B_start` sobre la colección JSON buscando coincidencias entre los `workers` filtrando por el _case-insensitive_ `company`. Valida siempre a nivel Backend antes del commit JSON.

### Justificación Técnica

- **Bcrypt**: El archivo `credentials.json` almacena el usuario `admin` de forma segura. Se usó `bcryptjs` con salt de `12` para encriptar la firma evitando exponer texto plano incluso en sistemas de juguete.
- **MergeParams en Express Router**: Las rutas de vacaciones fueron abstraídas a `/routes/vacations.js` usando `{ mergeParams: true }` y siendo referenciadas en `index.js` desde `/api/workers/:id/vacations`. Esto permite a Express encapsular las sub-rutas anidadas con lógica limpia.
- **Datepicker Dinámico**: El plugin inicializa el _minDate_ a `0` (hoy). Cuando un empleado elige `Fecha Inicio`, un evento intercepta este cambio y configura el nuevo `minDate` del calendario `Fecha Fin` a ese mismo instante temporal, previniendo viajes cíclicos o errores lógicos que el backend también previene.

### Lecciones Aprendidas (v2)

- **Desincronización Vanilla + Framework**: Mezclar Bootstrap JS Forms con lógica Vanilla Strict a veces complica el ciclo de vida del DOM (por ejemplo, el reinicio de los formularios vs el estado visual de jQuery).
- **Hibridación del CSS**: Incluir `.btn-primary` de BS5 chocó un poco semánticamente con `.btn--primary` de la v1 (BEM). Mantener una estructura agnóstica fue clave limitando TS5 al Modal y Navbar.
- **Seguridad Hash**: Los utilitarios automáticos a veces generan hashes truncados o rotos que Express + Bcryptjs falla al auditar (ocurrió durante la validación `compareSync('1234', hash)` que derivó en recálculos en vivo usando Node Exec).

---

## 2. Análisis de Resultado — Los 4 Pilares

### Pilar 1 — HTML5 Estándar ✅

Se entregó una única página (`client/index.html`) que usa **exclusivamente etiquetas semánticas de HTML5**:

| Elemento                | Uso                                                         |
| ----------------------- | ----------------------------------------------------------- |
| `<header>`              | Cabecera de la aplicación con marca y tagline               |
| `<main>`                | Contenedor principal de la interfaz                         |
| `<section>` / `<aside>` | Panel de lista de trabajadores / panel de formulario        |
| `<article>`             | Tarjeta individual de cada trabajador                       |
| `<dialog>`              | Modal nativo del navegador para el editor de horarios       |
| `<template>`            | Plantilla reutilizable de tarjeta de trabajador             |
| `<form>`                | Formularios semánticos con atributos `required` y `pattern` |

No se utilizó ningún framework de JS (React, Vue, etc.) ni librería de UI externa.

---

### Pilar 2 — Backend Persistente ✅

El servidor (Node.js + Express) mantiene todos los datos en `server/data/db.json`, que persiste entre reinicios del proceso. La capa de persistencia (`server/db.js`) expone dos funciones:

```
readDB()  → lee db.json desde disco (o devuelve { workers: [] } si no existe)
writeDB() → escribe de forma atómica (ver Pilar 3)
```

Todos los endpoints (`GET`, `POST`, `DELETE` en trabajadores; `GET`, `PUT` en horarios) leen y escriben siempre sobre este archivo, garantizando que **cualquier cambio en la UI queda inmediatamente persistido**.

---

### Pilar 3 — Seguridad Estricta ✅

Se definieron **5 controles de seguridad (SEC-01 a SEC-05)** en la delta spec `specs/security-controls.md` **antes** de escribir ninguna tarea de interfaz, siguiendo la restricción de proceso OpenSpec.

| ID     | Control                                           | Dónde aplica                                 |
| ------ | ------------------------------------------------- | -------------------------------------------- |
| SEC-01 | Sanitización con `validator.escape()`             | `middleware/validate.js` → `sanitizeInput()` |
| SEC-02 | Rechazo de ID duplicado → HTTP 400                | `validateWorker()` middleware                |
| SEC-03 | Campos obligatorios vacíos → HTTP 422             | `validateWorker()` middleware                |
| SEC-04 | Renderizado con `textContent` (nunca `innerHTML`) | `client/app.js`                              |
| SEC-05 | Escritura atómica en `db.json`                    | `server/db.js` → `writeDB()`                 |

Todos los controles fueron **verificados en el navegador** durante el paso `/opsx:apply` y pasaron sin fallo.

---

### Pilar 4 — CSS Moderno ✅

`client/styles.css` implementa un sistema de diseño completo usando:

- **CSS Custom Properties** — toda la paleta de colores, espaciado, radios y duraciones de animación definidos en `:root { ... }` para fácil personalización.
- **CSS Grid** — layout principal de dos columnas (`340px 1fr`) con `auto-fill` + `minmax(240px, 1fr)` para las tarjetas (1 → 2 → 3 columnas según el ancho disponible).
- **`@media`** — breakpoint en 900px para colapsar a columna única en móvil.
- **Animaciones** — `@keyframes card-in` (entrada de tarjetas), `card-out` (eliminación animada), `banner-in` (mensajes de error/éxito), transiciones `cubic-bezier` en hover de tarjetas y botones.
- **`<dialog>` nativo** — con `::backdrop` personalizado y `backdrop-filter: blur`.

---

## 3. Justificación Técnica

### ¿Por qué escritura atómica para `db.json`?

Un proceso Node.js puede interrumpirse en cualquier momento (corte de luz, `Ctrl+C`, excepción no capturada). Si en ese momento `fs.writeFileSync` ya había comenzado a escribir `db.json` pero no había terminado, el archivo quedaría **parcialmente escrito y corrompido** — JSON inválido que rompería cualquier lectura posterior.

La solución atómica en `server/db.js`:

```js
// 1. Escribir en un archivo temporal
fs.writeFileSync(TMP_PATH, json, "utf8"); // db.json.tmp

// 2. Renombrar atómicamente (operación indivisible en el SO)
fs.renameSync(TMP_PATH, DB_PATH); // db.json.tmp → db.json
```

`rename` a nivel del sistema operativo es una **operación atómica**: o la ruta `db.json` apunta al nuevo contenido completo, o sigue apuntando al anterior. Nunca puede quedar en un estado intermedio. Esto garantiza que `db.json` siempre contiene JSON válido.

---

### ¿Cómo funciona el middleware de validación?

El middleware de Express (`server/middleware/validate.js`) actúa como una **barrera de seguridad** que se ejecuta **antes** de que la petición llegue al handler de la ruta. El flujo es:

```
POST /api/workers
    │
    ▼
validateWorker(req, res, next)
    ├── ¿Falta 'id' o 'name'?  → res.status(422).json({ error: ... })  [BLOQUEA]
    ├── ¿'id' ya existe en DB? → res.status(400).json({ error: ... })  [BLOQUEA]
    ├── Sanitizar strings      → validator.escape()                     [TRANSFORMA]
    └── next()                 → continúa al handler                    [PERMITE]
    │
    ▼
Handler: guarda el trabajador y devuelve 201
```

Gracias a este diseño, el handler de la ruta **nunca recibe datos inválidos o duplicados**. Si el middleware llama a `res.status(...).json(...)` sin llamar a `next()`, la cadena de middleware se corta y el handler nunca se ejecuta.

El mismo patrón se aplica en `validateSchedule` para las rutas de horarios: comprueba que cada clave sea un día válido de la semana y que el valor tenga el formato `HH:MM-HH:MM`.

---

## 4. Lecciones Aprendidas — Ajustes durante `/opsx:apply`

### Ajuste 1 — Captura del output de `openspec instructions` vía redirección a fichero

Durante el proceso de propuesta, el output del comando `openspec instructions <artifact> --json` aparecía truncado y mezclado en el terminal de PowerShell. La solución fue redirigir el resultado a un fichero temporal:

```powershell
node ".../openspec.js" instructions proposal --change "..." --json 2>$null `
  | Set-Content -Encoding utf8 C:\tmp\instr.txt
```

Esto permitió leer el JSON limpio con `Get-Content -Raw`.

### Ajuste 2 — Rutas de schedules con `mergeParams: true`

Al crear el router de horarios en `server/routes/schedules.js`, el parámetro `:id` definido en el router padre (`/api/workers/:id/schedule`) no era visible dentro del sub-router sin la opción `mergeParams`:

```js
// Correcto
const router = express.Router({ mergeParams: true });
```

Sin esta opción, `req.params.id` habría sido `undefined` en los handlers de horarios.

### Ajuste 3 — `<dialog>` nativo y el evento `click` en backdrop

El elemento `<dialog>` de HTML5 no cierra automáticamente al hacer clic en el fondo (`backdrop`). Se añadió un listener explicit en `app.js`:

```js
scheduleDialog.addEventListener("click", (e) => {
  if (e.target === scheduleDialog) scheduleDialog.close();
});
```

Cuando el usuario hace clic en el backdrop, el evento dispara sobre el propio elemento `<dialog>` (no sobre su contenido), por lo que `e.target === scheduleDialog` es `true` solo en ese caso.

### Ajuste 4 — Avatar generado con iniciales (sin imágenes externas)

Para que cada tarjeta de trabajador tuviera un avatar visual sin depender de servicios externos ni de imágenes, se generan las iniciales del nombre en JavaScript:

```js
const initials = worker.name
  .split(" ")
  .map((p) => p[0] || "")
  .slice(0, 2)
  .join("")
  .toUpperCase();
avatar.textContent = initials; // SEC-04: textContent, no innerHTML
```

El fondo del avatar usa el gradiente de acento definido en CSS (`--clr-accent` → `--clr-accent-2`), resultando en un diseño coherente sin recursos externos.

---

## Funcionalidad v3: Enterprise Workforce Full

### Registro de Prompts

> "Nuevos Requisitos de Estructura, UI y Gestión de Tiempos:
> Acceso y Multitenencia: Pantalla de Selección de Empresa... Formulario para nuevos usuarios vinculado estrictamente... Aislamiento de Datos...
> Gestión de Vacaciones y Colisiones: Módulo de vacaciones con jQuery Datepicker. Lógica de Negocio bloqueando overlaps en la misma empresa.
> Módulo de Horas Adicionales: Solicitar Horas Extras y Horas Complementarias validando que no haya solape con el horario laboral.
> UI Moderna y Experiencia de Usuario: Bootstrap 5 para el layout responsivo. Animaciones con CSS Transitions (escala, brillo).
> Estándares Técnicos: Node.js con db.json. JSDoc obligatorio. Trazabilidad en PROJECT_LOG.md."

### Análisis de Resultado (Arquitectura Propuesta)

1. **Acceso y Multitenencia**: Se añade un nivel superior de estado a la aplicación: la `companyId`. El frontend exigirá una "Landing Page" de selección que guardará la empresa en sesión. El backend interceptará todas las consultas filtrando por `companyId`.
2. **Gestión de Vacaciones**: Integración del plugin jQuery Datepicker guiado por especificaciones.
3. **Módulo de Horas Adicionales**: Ampliación del esquema `db.json` para manejar peticiones de sobretiempo.
4. **Sistema de Colisiones**: La lógica de prevención de superposición de fechas/horas será validada estrictamente en el backend mediante funciones enriquecidas con JSDoc.
5. **Modernización UI**: Adopción de la grilla de Bootstrap 5 para consistencia responsiva, incorporando animaciones CSS de escala y brillo para un look and feel premium.

---

_Actualizado el 03/03/2026 como parte del flujo OpenSpec enterprise-workforce-v3-full._

---

## Funcionalidad v4: Tailwind Premium & Exclusive Business Rules

- **Estado:** Completado y Archivado en `openspec/changes/archive/2026-03-03-enterprise-workforce-v4-tailwind-rules`

### Registro de Prompts

> "Evolucionar la aplicación hacia una estética de alto nivel minimalista usando Tailwind CSS. Reemplazar tablas por Cards dinámicas. Implementar reglas de negocio exclusivas: no dos empleados de la misma empresa pueden estar de vacaciones el mismo día, ni registrar horas extra el mismo día. Mejorar el feedback al usuario con un sistema de Toasts. Mostrar contadores de días de vacaciones y horas extra en el perfil de cada empleado."

### Análisis de Resultado (Hitos Técnicos)

1.  **Migración a Tailwind CSS**: Se eliminó la dependencia visual de Bootstrap (manteniendo solo utilidades mínimas compatibles) en favor de Tailwind CSS. Se implementó un sistema de diseño basado en `glass-morphism` con la clase personalizada `glass-card` y una paleta de colores coherente con la identidad de marca (`brand`).
2.  **Reglas de Exclusividad (Business Logic)**:
    - **Vacaciones**: Ampliación del motor de colisión para buscar solapamientos en cualquier rango de fechas entre trabajadores de la misma empresa.
    - **Horas Extra (Quota Única)**: Implementación de la regla de "un empleado por día por empresa" para el registro de horas adicionales, validado en el backend con el nuevo servicio `hoursCollision.js`.
3.  **UI de Feedback (Toast System)**: Se desarrolló un sistema nativo de notificaciones `Toast` animadas con Tailwind para errores de validación y éxitos, reemplazando los banners estáticos por una experiencia más dinámica.
4.  **Dashboards Individuales**: Se enriqueció la API de trabajadores para devolver contadores calculados (`vacationDays` y `overtimeHours`) en tiempo real, mostrados en pequeñas etiquetas dinámicas dentro de cada tarjeta de empleado.
5.  **Refactor de Diálogos**: Migración total de Modales de Bootstrap a elementos `<dialog>` nativos de HTML5, estilizados con Tailwind, para mejorar la accesibilidad y el rendimiento.

### Justificación Técnica

- **Aislamiento en Colisiones**: El servidor ahora pre-filtra todos los datos por `companyId` del usuario autenticado (extraído del JWT) antes de realizar cualquier cálculo de colisión, garantizando privacidad y exactitud multitenant.
- **Contadores Agregados**: Para optimizar el rendimiento del frontend, se decidió realizar el cálculo de días y horas en el servidor durante la petición de `GET /workers`, evitando que el cliente tenga que procesar grandes arrays de datos históricos innecesariamente.
- **Tailwind CDN JIT**: Se utilizó la configuración `type="text/tailwindcss"` para permitir el uso de directivas `@apply` y configuraciones de temas personalizadas (`colors.brand`, `animations`) directamente en el navegador sin paso de compilación previo, facilitando el prototipado rápido solicitado.

---

_Actualizado el 03/03/2026 como parte del flujo OpenSpec enterprise-workforce-v4-tailwind-rules._

---

## Funcionalidad v5: MariaDB Persistence Migration (OpenSpec Engine)

## Archivo Reciente: mariadb-persistence-migration (2026-03-03)

- **Estado:** Completado y Archivado en `openspec/changes/archive/2026-03-03-mariadb-persistence-migration`
- **Resumen de Cierre:**
  - Archivo local JSON reemplazado exitosamente por base de datos relacional MariaDB.
  - Generada capa de abstracción (DAO) mediante _Prepared Statements_, solucionando bloqueos multihilo y añadiendo capacidades de auditoría completas.

### Registro de Prompts

> "Migración de persistencia local (JSON/File) a MariaDB para el motor de estados de OpenSpec. Objetivo: Reemplazar el almacenamiento actual basado en archivos locales (.openspec/\*.json) por una base de datos relacional MariaDB. Arquitectura de Datos: Diseña un esquema de tablas... Capa de Abstracción (DAO): No permitas acceso directo a la DB... Compatibilidad y Sincronización: El diseño debe incluir un mecanismo de 'Fall-through' o tarea de migración inicial... Entregables de la Propuesta: Script SQL, Script de Migración, DAO. Restricciones: Mantén el cumplimiento estricto con el estándar de OpenSpec pero adaptado a SQL."

### Análisis de Resultado (Hitos Técnicos)

1. **Diseño de Schema Relacional (`schema.sql`)**:
   - Tablas completamente normalizadas (`changes`, `tasks`, `specs`, `artifacts`) con claves primarias UUID/BIGINT, claves foráneas en cascada y columnas de auditoría (`created_at`, `updated_at`, `executor`).
   - Se recurrió a columnas del tipo `JSON` para campos metafísicos y datos de extensión no estructurados (`meta`).
2. **Capa Data-Access-Object (DAO)**:
   - Se crearon Repositorios dedicados (`ChangesRepository`, `TasksRepository`, etc.) para abstraer las sentencias CRUD usando _Prepared Statements_ de forma estricta (no hay interpolación SQL ni dependencias ORM restrictivas).
   - Implementado un `pool.js` como Singleton de la conexión a MariaDB, utilizando parámetros ambientales y configurando retries y limits asíncronos para proteger entornos multi-agente.
3. **Script Idempotente de Migración (`scripts/migrate.js`)**:
   - Herramienta inteligente (opcional: `--dry-run`) diseñada para recorrer recursivamente `.openspec/changes/`, leer los `.yaml` y procesar tareas mediante regex directo a la nueva base de datos.
   - Operaciones aseguradas con `INSERT ... ON DUPLICATE KEY UPDATE` lo que permite reinicios seguros durante fallos o despliegues parciales sin duplicidades de registros.

### Justificación Técnica

- **Limitaciones del FileSystem Subsanadas**: Las escrituras locales a archivos paralelos fallaban o se corrumpían a escala en arquitecturas multihilo/multiagente. MariaDB con bloqueo a nivel de fila y _ACID compliance_ elimina las _Race Conditions_ silenciosas.
- **Preparación Transaccional**: El modelo DAO expuesto no solo simplifica la inyección / testing unitario mediante mock del `pool`, sino que también garantiza que todos los comandos del motor fluyan de manera síncrona, controlable e instrumentada a través del sistema.

---

_Actualizado el 03/03/2026 como parte del flujo OpenSpec mariadb-persistence-migration._

---

## Funcionalidad v6: Docker Infrastructure (OpenSpec DB)

### Registro de Prompts

> "Implementación de MariaDB mediante Docker para estandarizar el entorno de desarrollo. Crear configuración de Docker Compose, asegurar la persistencia de datos mediante volúmenes y automatizar la inicialización del esquema de la base de datos."

### Análisis de Resultado (Infraestructura)

1. **Dockerización de MariaDB**:
   - Se creó un archivo `docker-compose.yml` que define un servicio de base de datos usando la imagen oficial de `mariadb:11.4`.
   - **Aislamiento de Puerto**: Mapeo del puerto `3306:3306` para mantener compatibilidad con el adaptador de MariaDB existente.
2. **Persistencia y Volúmenes**:
   - Implementación de un volumen nombrado (`mariadb_data`) para garantizar que los datos persistan incluso si los contenedores se eliminan o reinician.
3. **Automatización de Inicialización**:
   - Configuración de un Bind Mount que vincula `schema.sql` con `/docker-entrypoint-initdb.d/`. Esto asegura que la base de datos y sus tablas se creen automáticamente al iniciar el contenedor por primera vez.
4. **Validación de Entorno**:
   - Verificación exitosa del estado del contenedor y de la estructura de tablas interna (`artifacts`, `changes`, `specs`, `tasks`) mediante comandos `docker exec`.

### Justificación Técnica

- **Estandarización**: El uso de Docker elimina problemas de "funciona en mi máquina" relacionados con diferentes versiones de MariaDB instaladas localmente en Windows.
- **Ciclo de Vida**: La configuración `restart: always` asegura que la base de datos esté siempre disponible para los agentes de OpenSpec, simplificando la orquestación del motor de persistencia.

---

_Actualizado el 03/03/2026 - Dockerización del motor de persistencia completada._

---

### Implicaciones Prácticas y Estado Actual (Post-Dockerización)

**¿Qué ha cambiado con MariaDB y Docker?**

1.  **Aislamiento y Modernización**: La base de datos ya no depende de la instalación local de MariaDB en Windows. Ahora reside en un **contenedor de Docker**, lo que garantiza un entorno idéntico para cualquier desarrollador o agente que trabaje en el proyecto.
2.  **Infraestructura como Código**: Toda la configuración (puertos, volúmenes, contraseñas) está definida en `docker-compose.yml`, permitiendo recrear el entorno en segundos.
3.  **Encendido Automático**: Configurado con `restart: always`, asegurando disponibilidad constante del motor de persistencia.

**¿Cómo acceder ahora?**

- **Desde la Aplicación**: Sin cambios. Sigue apuntando a `127.0.0.1:3306`.
- **Desde la Terminal (Monitor)**: El acceso debe realizarce a través del contenedor:
  ```powershell
  docker exec -it openspec-db mariadb -u root -p1234
  ```

### 🛡️ Metodología de Verificación: Prevención de Inyección SQL (SQLi)

Para comprobar la resiliencia de la base de datos y la aplicación frente a ataques de Inyección SQL, se establecieron los siguientes vectores de prueba manuales a ejecutar directamente sobre los formularios de login o creación de usuarios:

1.  **Bypass Clásico (Siempre Verdadero)**:
    - **Input Malicioso**: `admin' OR '1'='1`
    - **Objetivo**: Forzar que la consulta SQL evalúe la condición como verdadera y permita el acceso sin conocer la contraseña real.
2.  **Anulación por Comentarios (Comment Bypass)**:
    - **Input Malicioso**: `admin' --`
    - **Objetivo**: Inyectar el símbolo de comentario (`--`) en SQL para anular la comprobación del campo de contraseña en la consulta del backend.

**Criterios de Éxito de la Prueba:**

- **Bloqueo por Validación**: El frontend o el middleware (Express Validator/Joi) rechaza la petición devolviendo un error (HTTP 400 Bad Request) por caracteres no permitidos.
- **Neutralización por Prepared Statements**: Si el input llega al DAO, los parámetros `?` deben asegurar que los caracteres `'` y `--` sean tratados estrictamente como literales de cadena, provocando un error de "usuario no encontrado" y evitando la ejecución de comandos SQL.

---

_Actualizado el 04/03/2026 - Documentación de infraestructura y metodología de seguridad sincronizada._

---

## Funcionalidad v7: MariaDB Security Layer (Double Shield)

## Archivo Reciente: mariadb-security-layer (2026-03-04)

- **Estado:** Completado y Archivado en `openspec/changes/archive/2026-03-04-mariadb-security-layer`
- **Resumen de Cierre:**
  - Se implementó una capa de seguridad estricta para prevenir Inyección SQL y ataques de manipulación de datos en el adaptador de MariaDB.

### Registro de Prompts

> "Implementar una capa de seguridad estricta para prevenir la Inyección SQL y ataques de manipulación de datos en el adaptador de MariaDB.
> Requisitos Técnicos Obligatorios:
> Prepared Statements (SQLi Prevention): Auditar y refactorizar todos los Repositorios para asegurar que ninguna consulta utilice interpolación de strings.
> Tipado Estricto a Nivel de DB: Configurar el Pool de conexiones para forzar el modo estricto de SQL.
> Validation Middleware (Double Shield): Implementar un middleware de validación con express-validator o joi que sanitice todos los inputs.
> Escape de Caracteres Especiales: Asegurar que cualquier dato extraído de archivos .yaml o JSON sea escapado.
> Principio de Menor Privilegio: Configurar el usuario de MariaDB en Docker para que solo tenga permisos DML sobre openspec."

### Análisis de Resultado (Implementación del "Double Shield")

1. **Validation Middleware (API Edge con Joi)**:
   - Se integró la librería `joi` e implementó la función `validate(schema)` en `server/middleware/joiValidate.js`.
   - Se crearon rutas dedicadas en `/api/changes` y `/api/tasks` validando todos los inputs (id, name, status, title, etc).
   - El middleware intercepta proactivamente peticiones malformadas y rechaza payloads inesperados (HTTP 400 Bad Request) antes de que la carga alcance la lógica de negocio o la base de datos.
2. **Prepared Statements en Repositorios (SQLi Prevention)**:
   - Se validó y unificó que todos los repositorios del adaptador (`ChangesRepository`, `TasksRepository`, `SpecsRepository`, `ArtifactsRepository`) estuvieran configurados con los Prepared Statements seguros nativos de la librería `mariadb`, utilizando placeholders `?` en lugar de strings inyectables.
3. **Modo Estricto de SQL y Privilegios**:
   - Docker Compose se actualizó inyectando flag `--sql-mode=STRICT_ALL_TABLES` en la imagen de MariaDB.
   - En el `schema.sql`, se reemplazó el uso de `root` creando un usuario de base de datos específico (`openspec_app`) operando exclusivamente con comandos `DML` (SELECT, INSERT, UPDATE, DELETE). Esto aísla a la base de datos de ataques DDL malintencionados (DROP TABLE).

### Justificación Técnica

- **Estrategia "Double Shield"**: Implementar una única capa de defensa es inadecuado. El "Doble Escudo" valida fuertemente la estructura perimetral mediante el enrutado (API Middleware) y luego blinda la ejecución interna de consultas a la base de datos (Prepared Statements).
- **Menor Privilegio (Db-Level Isolation)**: Confinar un usuario al modelo `DML` mitiga el daño en caso extremo de que ocurra una fuga de ejecución. Ningún exploit a la aplicación logrará eliminar tablas o cambiar privilegios de usuarios existentes en MariaDB.

---

_Actualizado el 04/03/2026 - Capa de Seguridad de BD MariaDB completada (Restauración V7)._

---

## Funcionalidad v8: Estabilización de Infraestructura y Control de Versiones

### Registro de Prompts

> "Eliminar todos los cambios del Dual Login (v8 fallida) y volver al estado estable v7. Asegurar que MariaDB funcione exclusivamente en Docker para evitar conflictos de puerto con el sistema local. Cambiar la lógica de borrado a eliminación física definitiva. Inicializar el proyecto en una rama Git denominada main para asegurar la trazabilidad."
> ##ERRORES

### Análisis de Resultado (Hitos de Estabilización)

1. **Rollback Estratégico (Recovery)**:
   - Se revirtieron todas las modificaciones relacionadas con el sistema de roles y login dual, eliminando la deuda técnica y los errores de referencia (`removeBtn is not defined`) introducidos durante la experimentación.
   - Restauración de la arquitectura perimetral estable: Admin Dashboard con persistencia en MariaDB y seguridad "Double Shield".

2. **Dockerización Exclusiva (Infrastructure)**:
   - Se resolvió el conflicto persistente del puerto `3306` desactivando los servicios de MariaDB/MySQL nativos de Windows.
   - El entorno se estandarizó operando únicamente bajo el contenedor `openspec-db`. Se corrigió el error de sintaxis en el comando `mysqld` de `docker-compose.yml` para garantizar un arranque limpio y automático.

3. **Borrado Físico Definitivo (Hard Delete)**:
   - Reemplazo del modelo de "Soft Delete" (marcado como despedido) por una eliminación física integral mediante comandos `DELETE`.
   - Implementado un sistema de limpieza en cascada que borra automáticamente las vacaciones y horas extra asociadas en `db.json` al eliminar un trabajador de MariaDB.

4. **Gobierno de Código (Git Initialization)**:
   - Creación del repositorio Git local utilizando la rama estándar `main`.
   - Implementación de un archivo `.gitignore` profesional para proteger credenciales (`.env`) y evitar el almacenamiento redundante de dependencias o artefactos temporales de OpenSpec.

### Justificación Técnica

- **Aislamiento de Puerto**: El uso simultáneo de DBs locales y contenedores provoca fallos silenciosos de conexión. Centralizar en Docker garantiza que el entorno de desarrollo sea idéntico al de producción/agente.
- **Eficiencia de Datos**: La eliminación física previene la acumulación de datos huérfanos y simplifica la gestión multitenant al no requerir filtros constantes de `status !== 'despedido'`.
- **Integridad Git**: Un repositorio sin `.gitignore` es ruidoso e inseguro. El filtrado de archivos temporales de OpenSpec asegura que los _commits_ sean atómicos y significativos.

### Lecciones Aprendidas

- **Coste de la Complejidad**: Intentar implementar sistemas multi-rol antes de tener una infraestructura de persistencia 100% estable puede comprometer todo el proyecto. El _rollback_ temprano fue la decisión correcta para salvar la integridad.
- **Depuración Multi-Capa**: Un error de "base de datos vacía" puede ser en realidad un conflicto de servicios redirigiendo el tráfico al host local en lugar del contenedor. Siempre verificar el origen del servicio con `netstat` o `tasklist`.

---

_Actualizado el 04/03/2026 - Proyecto estabilizado, dockerizado y bajo control de versiones Git._

---

## Funcionalidad v9: Dual Login System (Admin & Worker)

### Registro de Prompts

> "Implementar un sistema de acceso dual que permita la entrada diferenciada de Administradores y Trabajadores. El sistema debe incluir: 1) Registro y Login para trabajadores mediante email y contraseña (vinculados a MariaDB). 2) Portal de autoservicio para el trabajador donde pueda gestionar su perfil personal (nombre, email, teléfono, contraseña). 3) Visualización del horario asignado por la empresa y consulta de estadísticas acumuladas (vacaciones y horas extra). 4) Interfaz dinámica de 'landing page' con un selector de roles para conmutar entre los flujos de Empresa y Trabajador."

### Entendimiento de Antigravity

Mi entendimiento de la tarea fue la necesidad de transformar la aplicación de una herramienta puramente administrativa a una plataforma de autoservicio colaborativa. Esto implicó:

1.  **Bifurcación de la Seguridad**: Diferenciar sesiones mediante un flag `isWorker` en el JWT para aislar privilegios (permitir el acceso del trabajador a `/workers/me` pero denegar `/workers` general).
2.  **Autenticación en MariaDB**: Transicionar la persistencia de los datos de los trabajadores hacia un modelo que incluya hashes de seguridad (Bcrypt), permitiendo el login directo del empleado.
3.  **Consolidación de Datos**: Unificar la visualización de vacaciones (histórico local JSON) y perfiles (MariaDB) en una misma vista unificada para el trabajador, garantizando una experiencia de usuario (UX) coherente y premium.

### Análisis de Resultado (Hitos Técnicos)

1.  **Landing Page Multi-Rol**: Se rediseñó el portal de entrada con un conmutador dinámico (`switchRole`). El formulario de login adapta sus campos (Usuario/Pass vs Email/Pass) y el endpoint de destino según el rol seleccionado.
2.  **Dashboard del Trabajador**: Implementación de una vista exclusiva (`worker-view`) con componentes de lectura/escritura para el perfil personal y tarjetas de resumen que consultan proactivamente el histórico de vacaciones y horas extra del empleado.
3.  **Endpoints de Autoservicio (`/workers/me`)**: Creación de rutas GET y PUT protegidas que utilizan el ID del trabajador extraído del token JWT, garantizando que un empleado solo pueda manipular sus propios datos.
4.  **Integración MariaDB + Bcrypt**: Actualización de `WorkersRepository` para soportar `password_hash`. El flujo de registro ahora cifra la contraseña antes de persistir, cumpliendo con los estándares de seguridad establecidos en la v7.

_Actualizado el 04/03/2026 - Implementación del Sistema de Login Dual y Portal del Trabajador completada._

---

## Funcionalidad v10: Daily Schedule & UX/UI Updates

### Registro de Prompts

> "Delegar la gestión de solicitudes de vacaciones y horas extra exclusivamente al rol de administrador de la plataforma. Implementar la capacidad de definir un horario base detallado (Lunes a Domingo) durante el alta de un nuevo colaborador, integrando una interfaz desplegable en el formulario de creación para optimizar el espacio. Habilitar la visualización y edición granular de los 7 días de la semana en el perfil de cada empleado. Finalmente, incorporar un indicador de estado dinámico ('Vacaciones') en la vista de tarjetas de la plantilla activa que evalúe y señale en tiempo real si el trabajador se encuentra actualmente en periodo vacacional."

### Análisis de Resultado (Hitos Técnicos de UX/UI)

1. **Gestión Granular de Horarios (7-Day Grid)**:
   - Se reemplazó el input genérico de "L-V" por una cuadrícula dinámica que permite a los administradores asignar horas de entrada y salida específicas para los **7 días de la semana** (incluidos fines de semana).
   - Se actualizó tanto el formulario de "Nuevo Colaborador" como la sección "Horario Base" dentro de la tarjeta de cada empleado activo para usar esta misma cuadrícula.
   - El formulario de creación se mejoró a nivel de experiencia de usuario al convertir la sección del horario en un componente **desplegable (collapsible)**, para no saturar visualmente el alta rápida de trabajadores si no se desea asignar un horario inicialmente.

2. **Indicador Visual Binario de Vacaciones en Tiempo Real**:
   - Se añadió un cálculo integrado en la ruta `GET /workers` del backend. El servidor itera los rangos de fechas (`startDate` a `endDate`) registrados en la persistencia local para cada usuario y compara si la marca temporal del sistema (`new Date()`) intersecta ese intervalo.
   - Si se detecta colisión, el backend inyecta un flag booleano `onVacationNow` en el flujo JSON hacia el frontend.
   - Apoyándose en este metadato, el cliente UI (Vanilla JS + Tailwind) renderiza automáticamente una etiqueta ("Vacaciones" estilizada como badge cyan) contigua al nombre del empleado, proveyendo al administrador de un estado de presencia inequívoco.

### Justificación Técnica

- **Estandarización Estructural del Horario**: La asignación de horarios mutó de una cadena de texto a un diccionario de datos JSON tipificado por días de la semana (`monday`, `tuesday`...). Esta abstracción prepara el modelo de datos para futuras implementaciones de validación temporal o consultas complejas en capas relacionales.
- **Offloading Computacional al Backend**: Computar si un empleado se encuentra vacante obliga a ejecutar comprobaciones de rangos fecha-hora iterativamente. La resolución de mantener dicha lógica en Node.js mitiga cuellos de botella en la renderización del DOM del cliente web, entregando propiedades computadas simples (booleanos) consistentes con el patrón MVC.

---

## Funcionalidad v11: Unified Request Management & Dual Login Workflow

### Registro de Prompts

> "Implementar un sistema de autenticación estable para el perfil de trabajador que resuelva cierres de sesión inesperados. Desarrollar un buzón de gestión unificado para el administrador que agrupe solicitudes de vacaciones y reporte de horas extra, integrando contadores de notificaciones y componentes desplegables. Asegurar la integridad de la identidad corporativa en el dashboard del empleado y restringir sus capacidades de edición en los módulos de historial, estableciendo perfiles de consulta de solo lectura para garantizar la transparencia sin comprometer la autoridad administrativa."

### Análisis de Resultado (Hitos de Integración MaríaDB + UX)

1. **Persistencia e Infraestructura (Base de Datos)**:
   - **Schema**: Creación de la tabla `hour_requests` con campos para `worker_id`, `date`, `start_time`, `end_time`, `type` y `status` (enum: pending, approved, rejected).
   - **Adaptador MariaDB**: Implementación del `HourRequestsRepository.js` para centralizar las operaciones CRUD de las nuevas peticiones.

2. **Arquitectura del Servidor (Backend Node.js)**:
   - **Rutas**: Creación de `allRequests.js` para inyectar lógica de agregación de datos (Merge & Sort) de múltiples modelos.
   - **Middleware**: Refactorización de la validación de tokens en `requireAuth.js` para soportar consistentemente los campos `workerId` y `companyId` en la sesión.

3. **Estructura e Interfaz (HTML/CSS)**:
   - **DOM**: Incorporación de IDs únicos para el nuevo formulario de horas extra (`my-hour-request-form`) y el buzón unificado de administración.
   - **Styling (CSS/Tailwind)**: Aplicación de reglas de diseño dinámico para badges de notificación reactivos y micro-interacciones en los componentes colapsables del dashboard.
   - **Componentización**: Implementación de estados visuales condicionales para las modales, eliminando elementos interactivos según el rol del usuario.

4. **Lógica de Cliente (JavaScript)**:
   - **Sincronización de Sesión**: Implementación de `loadWorkerProfile` con capacidad de autorrecuperación de metadatos de empresa.
   - **Control de Flujo**: Desarrollo de la función `handleRequest` para gestionar estados de aprobación bidireccional mediante llamadas asíncronas (`fetchWithAuth`).
   - **Reactividad**: Automatización de la actualización del conteo de pendientes mediante promesas encadenadas tras cada acción administrativa.

### Justificación Técnica

- **Coherencia de Dominio**: Al centralizar las solicitudes en un buzzón único, se reduce la fatiga cognitiva del administrador y se asegura que ninguna petición quede desatendida.
- **Seguridad en la Inyección de Datos**: El flujo de aprobación de horas no es una simple inserción; el backend re-valida la existencia del trabajador y la integridad de los tiempos antes de sumarlos al registro histórico, previniendo discrepancias en la nómina o duplicidad de reportes.

---

## Funcionalidad v12: Security Hardening & Input Integrity

### Registro de Prompts

> "Realizar un proceso de Hardening integral en la capa de datos y lógica de negocio para mitigar vulnerabilidades críticas y asegurar la inexpugnabilidad de la base de datos MariaDB. Implementar la gestión segura de secretos mediante variables de entorno, blindar el sistema contra la exposición de errores internos (Stack Traces) y establecer un motor de validación estricto (Joi) para las peticiones de entrada. Adicionalmente, integrar lógica de integridad temporal en los formularios de vacaciones y horas extras para prevenir la inserción de registros cronológicamente inconsistentes o anacrónicos, garantizando la robustez operativa bajo cualquier circunstancia."

### Análisis de Resultado (Seguridad Proactiva e Integridad)

1. **Infraestructura y Secretos (Security Layer)**:
   - **Gestión de Entorno**: Migración del `JWT_SECRET` a un archivo `.env` externo con implementación de un guard `fail-fast` que previene el arranque del servidor si el secreto está ausente.
   - **Sanitización de Errores**: Refactorización de todos los bloques `catch` en las rutas de la API para interceptar y loguear internamente los errores del motor (stack traces) mientras se retornan mensajes genéricos y seguros al cliente.

2. **Arquitectura del Servidor (Backend Node.js)**:
   - **Validación de Esquemas**: Integración de la librería `Joi` para definir contratos de datos estrictos en las rutas de registro y login de trabajadores.
   - **Lógica de Integridad de Datos**: Implementación de comprobaciones de lógica de negocio para peticiones de vacaciones, asegurando que `startDate < endDate` y que todos los tipos de horas extras correspondan al enumerado definido.

3. **Estructura e Interfaz (JavaScript/Client)**:
   - **Validación Preventiva**: Refactorización de `app.js` para incluir validaciones en el lado del cliente (Client-side validation) que impiden el envío de formularios de vacaciones si las fechas son pasadas o cronológicamente inválidas.
   - **UX de Seguridad**: Implementación de alertas de retroalimentación inmediata (`🚫 Vacaciones imposibles`) para reducir la carga en el servidor y mejorar la experiencia del usuario final.

### Justificación Técnica

- **Defensa en Profundidad**: La combinación de validaciones en frontend, esquemas en backend y el uso estricto de Prepared Statements en la base de datos crea múltiples capas de defensa contra entradas malformadas o malintencionadas.
- **Prevención de Regresión Temporal**: La restricción de fechas pasadas asegura que el historial laboral se mantenga como un registro de eventos reales o futuros, evitando la manipulación de datos históricos que podrían afectar informes de auditoría o nóminas.

## Funcionalidad v13: Advanced Clocking Management, Geolocation & Weekly History

### Registro de Prompts

> "Implementar un sistema de fichaje (Entrada/Salida) que registre la ubicación exacta y el dispositivo. El sistema debe impedir fichar dos veces el mismo estado y permitir ver el histórico de jornadas agrupado por semanas desde el panel de administrador. Refinar la visualización para mostrar solo la última sesión completa de cada día en el historial, eliminando redundancias de metadatos de dispositivo para una interfaz limpia y profesional."

### Análisis de Resultado (Trazabilidad y Control de Jornada)

1. **Persistencia e Infraestructura (MariaDB Layer)**:
   - **Esquema de Datos**: Creación de la tabla `clock_events` para el registro atómico de eventos `ENTRY`/`EXIT`.
   - **Optimización de Consultas**: Implementación de lógica de filtrado por IDs únicos y timestamps descendentes en `ClockEventsRepository.js` para asegurar la integridad del estado actual del trabajador.

2. **Arquitectura del Servidor (Backend Node.js)**:
   - **Servicio de Fichaje**: Desarrollo de `ClockingService.js` para gestionar la lógica de "Sesión en Curso" y validaciones de estado cruzadas.
   - **Core de Historial**: Implementación de endpoints específicos (`/worker/:id/history`) con capacidad de streaming de eventos históricos para auditoría administrativa.

3. **Estructura e Interfaz (Dashboard & UX)**:
   - **Dashboard Dinámico**: Integración del componente "Control de Jornada" en el panel del trabajador, con estados visuales reactivos ("En Jornada" 🚀 / "Fuera de Servicio" 🏠).
   - **Detalle de Sesión**: Implementación de micro-detalles en el dashboard que muestran la hora de entrada y el estado "En curso" mediante animaciones síncronas.
   - **Administración Detallada**: Creación de una modal de historial estructurada por semanas, utilizando algoritmos de agrupación temporal en el cliente.

4. **Lógica de Cliente (JavaScript/Geolocation)**:
   - **Geoposicionamiento**: Integración estricta con la API de Geolocation del navegador para el registro de coordenadas en tiempo real.
   - **Motor de Emparejamiento**: Desarrollo de lógica en `app.js` para reconstruir sesiones laborales (Entrada + Salida) a partir de una lista lineal de eventos, filtrando duplicidades diarias para mantener la simplicidad operativa.

### Justificación Técnica

- **Integridad de Estado**: La persistencia atómica de eventos (en lugar de actualizar una sesión abierta) garantiza que el historial sea inmutable y auditable, permitiendo la reconstrucción de cualquier jornada incluso ante fallos de red o cierres de sesión inesperados.
- **Eficiencia en el Procesamiento de Datos**: Delegar la agrupación semanal y el emparejamiento de sesiones al cliente web reduce la latencia del servidor y permite una renderización por demanda (`Lazy Loading` conceptual), optimizando el rendimiento de la base de datos MariaDB.

## Funcionalidad v14: Project Architecture Reorganization

### Registro de Prompts

> "Organiza las carpetas del proyecto, eliminando alguna innecesaria y agrupando cosas que estén sueltas, sin borrar nada importante."

### Análisis de Resultado (Higiene y Arquitectura)

1. **Estructura de Paquetes (Modularization)**:
   - **Workspace de Paquetes**: Creación del directorio `packages/` para centralizar dependencias internas.
   - **Migración del Adaptador**: Reubicación de `openspec-mariadb-adapter` a `packages/`, estableciendo una separación clara entre la infraestructura de datos y la aplicación principal.

2. **Limpieza de la Raíz (Root Sanitization)**:
   - **Módulo Tooling**: Consolidación de todos los scripts de utilidad (`get_proposal.js`, etc.) en el directorio `tooling/`.

3. **Integridad de Referencias (Backend Pathing)**:
   - **Refactorización de Rutas**: Actualización masiva de todos los puntos de entrada de la API y servicios para reflejar la nueva jerarquía de archivos, asegurando la continuidad operativa del servidor Node.js.

### Justificación Técnica

- **Escalabilidad**: Segregar el adaptador de base de datos en un paquete propio facilita su mantenimiento independiente y su posible reutilización en otros servicios o micro-servicios futuros.
- **Mantenibilidad**: Reducir el ruido visual en la raíz del proyecto permite a los desarrolladores identificar rápidamente los componentes principales del sistema, siguiendo estándares de la industria para monorepos o proyectos de gran escala.

## Funcionalidad v15: Security Hardening & Rate Limiting

### Registro de Prompts

> "Retoques de seguridad: No dejes las api keys expuestas, delegar autentificación y haz rate limit a mis rutas de la API."

### Análisis de Resultado (Blindaje de Infraestructura)

1. **Control de Abuso (Rate Limiting)**:
   - **Capa de Protección Global**: Implementación de `express-rate-limit` con una cuota de 100 peticiones cada 15 minutos para evitar saturación.
   - **Blindaje de Autenticación**: Restricción agresiva de 10 intentos de login por hora para mitigar ataques de fuerza bruta.

2. **Privacidad y Ofuscación (Generic Errors)**:
   - **Login Hardening**: Refactorización de las respuestas de error en los endpoints `/login` y `/worker/login` para utilizar mensajes genéricos ("Credenciales inválidas"), eliminando la capacidad de un atacante para enumerar cuentas existentes.
   - **Middleware Auditado**: Actualización de `requireAuth.js` para registrar intentos de acceso fallidos mediante logs de advertencia.

3. **Gestión de Secretos (Configuration Isolation)**:
   - **Cero Hardcoding**: Verificación y limpieza de claves maestras. Uso estricto de `process.env` para la carga de `JWT_SECRET` y configuraciones sensibles desde archivos `.env` (excluidos del repositorio).

### Justificación Técnica

- **Resiliencia ante Ataques**: El rate limiting es la primera línea de defensa contra scrapers y bots, asegurando que la disponibilidad del servicio se mantenga para usuarios legítimos.
- **Defensa Pasiva**: Al no revelar si un correo electrónico o usuario existe en el sistema durante el login, se reduce drásticamente el éxito de campañas de phishing o robo de cuentas dirigidas.

---

_Actualizado el 05/03/2026 - Implementación de capas de seguridad contra fuerza bruta, ofuscación de errores de acceso y gestión segura de secretos de entorno._
