# OpenSpec Workforce Management

Plataforma para la gestión táctica de recursos humanos, control de asistencia y administración de flujos de trabajo corporativos. Este sistema ha sido diseñado y ejecutado íntegramente bajo el ecosistema **OpenSpec** mediante la inyección de especificaciones, utilizando el agente de ingeniería **Antigravity** y la orquestación multi-agente de **Open Agent Manager (OAM)**.

## Arquitectura de Ingeniería

A diferencia de los desarrollos convencionales, este repositorio es el resultado de un ciclo de vida dirigido por especificaciones (Specs-Driven Development). Cada componente, desde el esquema de MariaDB hasta las reglas de colisión de fechas, ha sido validado mediante el motor de estados de OpenSpec antes de su implementación.

### Workflow y Tooling (opsx)

El desarrollo se ha gestionado mediante comandos del OpenSpec especializos que garantizan la trazabilidad total:

- `opsx-propose`: Generación de propuestas técnicas y análisis de impacto.
- `opsx-apply`: Implementación automatizada basada en artefactos de diseño y especificación.
- `opsx-archive`: Cierre y documentación histórica de cada iteración del software.

## Hitos de Implementación (Evolución del Proyecto)

El sistema ha evolucionado a través de hitos críticos documentados en nuestro log de ingeniería:

1.  **Fundamentos y Estructura**: Creación de la SPA (HTML5/Vanilla JS) y backend en Node.js con persistencia atómica.
2.  **Gestión Laboral Avanzada**: Implementación de cuadrantes de trabajo, gestión de vacaciones con prevención de colisiones (jQuery Datepicker) y seguridad perimetral (JWT).
3.  **Modernización Progresiva**: Migración estética a **Tailwind CSS** (Glassmorphism) y optimización de UX mediante sistemas de notificaciones Toast.
4.  **Infraestructura Relacional**: Migración crítica de JSON a **MariaDB** utilizando patrones DAO y despliegue sobre **Docker** para estandarización de entornos.
5.  **Seguridad Enterprise (Double Shield)**: Blindaje contra Inyección SQL mediante Prepared Statements y validación estricta de esquemas con **Joi**.
6.  **Portal del Trabajador (Self-Service)**: Implementación de acceso dual (Admin/Worker) con privilegios segregados y gestión de perfiles personales.
7.  **Geolocalización y Registro de Jornada**: Sistema de fichaje (Clocking) con captura de coordenadas GPS y motor de reconstrucción de sesiones laborales.
8.  **Higiene Arquitectónica**: Reorganización del proyecto como monorepo modular (`packages/`) y saneamiento de procesos de seguridad (Rate Limiting y ofuscación de errores).

## Stack Tecnológico

- **Ecosistema**: OpenSpec, Antigravity Agent, Open Agent Manager.
- **Core**: Node.js, Express.js, MariaDB (Dockerized).
- **Frontend**: Vanilla JS, Tailwind CSS, HTML5.
- **Seguridad**: JWT, Bcrypt, Joi, Express-Rate-Limit.

## Estructura del Proyecto

```text
OpennSpec/
├── app/
│   ├── client/      # Interfaz de usuario
│   └── server/      # Core de servicios y API REST
├── packages/
│   └── openspec-mariadb-adapter/ # Adaptador de persistencia segregado
├── tooling/        # Utilidades de desarrollo
└── openspec/       # Fuente de verdad: Gestión de cambios y especificaciones
    ├── changes/    # Cambios activos en proceso de implementación
    ├── archive/    # Historial de cambios completados y versionados
    ├── specs/      # Especificaciones técnicas de capacidades (Source of Truth)
    └── PROJECT_LOG.md # Bitácora de ingeniería y evolución del sistema
```

---

## Guía de Inicio Rápido

Para ejecutar este proyecto en tu entorno local:

1.  **Clonar el repositorio**:

    ```bash
    git clone https://github.com/Davmar25122004/OpenSpec.git
    cd OpenSpec
    ```
2.1 **Instalar  npm en el proyecto** 
      ```bash
    npm install
    ```

2.2  **Preparar el entorno (Instalación automática)**:
    Ejecuta el siguiente comando en la raíz para instalar todas las dependencias y configurar los archivos `.env` automáticamente:

    ```bash
    npm run setup
    ```

3.  **Levantar la Infraestructura (Docker)**:
    Asegúrate de tener Docker instalado y ejecuta:

    ```bash
    docker-compose up -d
    ```

    _Esto levantará la base de datos MariaDB con el esquema preconfigurado._

4.  **Arrancar la Aplicación**:
    Desde la carpeta raíz, ejecuta el comando principal:

    ```bash
    node index.js
    ```

5.  **Acceder a la Web**:
    Abre tu navegador en `http://localhost:3000`.

---

## Guía de Pruebas: Probar como Trabajador (Cliente)

El sistema tiene dos vistas principales: Empresa (Administrador) y Trabajador (Empleado). Si quieres probar la vista de un empleado:

### Primera Vez: Crea una Empresa y un Trabajador (Vista Admin)

1. Entra a la web, asegúrate de estar en la pestaña **EMPRESA**.
2. Dale al botón de **Registrar**.
3. Pon el nombre de tu empresa (ej: `mibusiness`), un usuario (ej: `admin`), y una contraseña.
4. Una vez dentro de tu panel de Admin, ve a **"Añadir Trabajador"**.
5. Rellena los datos básicos. Aquí le asignarás un **Email** (ej: `empleado@mibusiness.com`) y una **Contraseña**.
6. Haz clic en "Añadir Trabajador". _¡Ya tienes tu empleado creado!_
7. Cierra sesión dándole al botón superior derecho "Cerrar Sesión".

### Entrar y probar como Trabajador

1. En la pantalla principal de login, cambia el botón superior de Empresa a **TRABAJADOR**.
2. Asegúrate de estar en la pestaña de **Ingresar** (login).
3. Rellena los datos:
   - **EMPRESA**: `mibusiness` (o la que creaste en el paso 3).
   - **CORREO**: `empleado@mibusiness.com` (el email del trabajador).
   - **CONTRASEÑA**: La que le pusiste.
4. Dale a **Entrar al Portal**.
5. ¡Listo! Ahora verás el portal de empleado donde podrás:
   - **Solicitar Vacaciones**.
   - **Registrar Horas extra**.
   - **Fichar la entrada y salida** (Clock-in).
   - Consultar tu propio cuadrante laboral dictado por la administración.

---

_Gestión eficiente para equipos modernos._
