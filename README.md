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

_Gestión eficiente para equipos modernos._
