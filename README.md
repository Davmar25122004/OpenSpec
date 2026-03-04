# OpenSpec Workforce Management

Plataforma modular para la administración de recursos humanos y control de presencia, diseñada bajo estándares de ingeniería de software profesional y centrada en la trazabilidad operativa.

## Propósito

Este sistema centraliza la gestión de equipos mediante herramientas de control de tiempos y flujos administrativos, garantizando la integridad de los datos y una experiencia de usuario fluida.

- **Control de Asistencia**: Registro de jornada con validación de estado y geolocalización integrada.
- **Gestión de Equipos**: Administración de departamentos, horarios, vacaciones y horas extra.
- **Seguridad**: Implementación de controles contra acceso no autorizado y ataques de fuerza bruta.

## Stack Tecnológico

Arquitectura moderna basada en micro-servicios y componentes modulares:

- **Backend**: Node.js & Express.js.
- **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism UI) y JavaScript ES6+.
- **Persistencia**: MariaDB (Estructura relacional optimizada).
- **Seguridad**: JWT para sesiones, BCrypt para hashing, y Rate Limiting para protección de API.

## Arquitectura y Monorepo

El proyecto utiliza una estructura de monorepo para facilitar el mantenimiento y la escalabilidad de los adaptadores de datos:

```text
OpennSpec/
├── app/
│   ├── client/      # Interfaz de usuario
│   └── server/      # Core de servicios y API REST
├── packages/
│   └── openspec-mariadb-adapter/ # Adaptador de persistencia segregado
├── tooling/        # Utilidades de desarrollo
└── openspec/       # Documentación técnica y especificaciones
```

## Desarrollo Dirigido por Especificaciones (OpenSpec)

Este proyecto sigue la metodología **OpenSpec**, donde cada funcionalidad nace de una especificación técnica. Esto permite un historial de cambios (`PROJECT_LOG.md`) totalmente auditable y una alineación estricta entre los requisitos del negocio y el código implementado.

---

_Gestión eficiente para equipos modernos._
