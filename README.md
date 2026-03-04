# OpenSpec Workforce Management System 🚀

Este proyecto es una plataforma integral para la gestión de recursos humanos y control de presencia, **desarrollado bajo la metodología y ecosistema de OpenSpec**, garantizando una trazabilidad total desde la especificación hasta la implementación final.

## 📋 Propósito del Proyecto

Optimizar y profesionalizar la gestión operativa de empresas mediante:

- **Control de Presencia**: Fichaje inteligente con validaciones de estado y geolocalización.
- **Gestión Administrativa**: Panel para el control de departamentos, horarios, vacaciones y horas extra.
- **Seguridad Avanzada**: Protección de datos y prevención de ataques automatizados.

## 🛠️ Tecnologías y Herramientas (Ecosistema OpenSpec)

El proyecto utiliza un stack moderno y modular, gestionado íntegramente mediante **OpenSpec**:

### Frameworks & Lenguajes

- **Backend**: Node.js v24+ & Express.js (Arquitectura de Servicios y Repositorios).
- **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism UI) y JavaScript ES6+.
- **Base de Datos**: MariaDB (Persistencia robusta y escalable).

### Seguridad & Calidad

- **Autenticación**: JWT (JSON Web Tokens) con gestión segura de secretos vía `.env`.
- **Protección**: `express-rate-limit` para prevención de fuerza bruta y ataques DDoS.
- **Validación**: `Joi` y `Validator` para asegurar la integridad de los esquemas de datos.
- **Arquitectura**: Estructura de **Monorepo** con adaptadores segregados en `packages/`.

### Desarrollo Specs-Driven

Toda la evolución del proyecto está documentada en el `PROJECT_LOG.md` y gestionada a través del sistema de **Cambios y Especificaciones de OpenSpec**, permitiendo un seguimiento histórico versionado de cada funcionalidad.

## 📁 Estructura del Monorepo

```text
OpennSpec/
├── app/
│   ├── client/      # Interfaz de usuario dinámica
│   └── server/      # Logic de negocio y API REST
├── packages/
│   └── openspec-mariadb-adapter/ # Adaptador de persistencia
├── tooling/        # Scripts de utilidad y mantenimiento
└── openspec/       # Registros de arquitectura y especificaciones
```

---

_Desarrollado con ❤️ y OpenSpec para un control total del ciclo de vida del software._
