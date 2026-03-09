# Guía Completa de OpenSpec en Antigravity

Esta documentación detalla el framework **OpenSpec**, un sistema de ingeniería dirigido por especificaciones (Specs-Driven Development) diseñado para trabajar con el agente **Antigravity** y la orquestación **Open Agent Manager (OAM)**.

---

## 1. Introducción y Visión General

### ¿Qué es OpenSpec?

OpenSpec es un framework de metodología y herramientas que resuelve el problema de la "deriva de código" y la falta de contexto en proyectos de software escalables. A diferencia del desarrollo tradicional donde se escribe código directamente, OpenSpec impone un ciclo de vida donde **la intención se captura antes que la implementación**.

**Ventajas clave:**

- **Trazabilidad Total**: Cada línea de código está vinculada a una tarea, un diseño y un requisito.
- **Calidad Predictible**: Las validaciones se definen en las "Delta Specs" antes de programar.
- **Colaboración Multi-Agente**: Permite que varios agentes (Antigravity y OAM) trabajen en armonía sin pisarse.

### Requisitos Previos

- Entorno de ejecución compatible con **Open Agent Manager**.
- CLI de `openspec` instalado y en el PATH.
- Acceso al agente **Antigravity**.

---

## 2. Primeros Pasos (Tutoriales)

### Tu primer cambio en 5 minutos

Si quieres añadir una funcionalidad (ej: un nuevo botón), el flujo es:

1. **Proponer**: `/opsx:propose "nombre-del-cambio"`
   - Antigravity creará el plan, el diseño y las tareas.
2. **Implementar**: `/opsx:apply`
   - El agente leerá las tareas y escribirá el código por ti.
3. **Archivar**: `/opsx:archive`
   - El cambio se guarda en el historial y se limpian las carpetas de trabajo.

### Configuración de la Estructura

Al iniciar un proyecto con OpenSpec, verás esta jerarquía esencial:

- `openspec/specs/`: Requisitos base del sistema.
- `openspec/changes/`: Donde ocurre la magia actual.
- `openspec/archive/`: El museo de tus hitos logrados.

---

## 3. Guías Prácticas (How-To)

### Cómo manejar la Seguridad (Double Shield)

OpenSpec requiere que las reglas de seguridad se definan primero en `specs/`.

1. Crea una Delta Spec sobre seguridad.
2. Define los controles (ej: sanitización, sanitización, pooling).
3. Implementa los middlewares solo después de que el diseño sea aprobado.

### Manejo de Base de Datos

Para migraciones de datos (ej: de JSON a MariaDB):

1. Usa `/opsx:explore` para comparar opciones.
2. Documenta el nuevo esquema en `design.md` dentro de la carpeta del cambio.
3. El `PROJECT_LOG.md` registrará automáticamente la decisión técnica.

---

## 4. Referencia de la API y CLI

### Comandos de Línea de Comandos (CLI)

| Comando                             | Descripción                                                     |
| ----------------------------------- | --------------------------------------------------------------- |
| `openspec new change "<name>"`      | Inicia una nueva iteración de cambio.                           |
| `openspec status --change "<name>"` | Muestra el progreso de artefactos y tareas.                     |
| `openspec list`                     | Lista todos los cambios activos y archivados.                   |
| `openspec instructions <type>`      | Genera guías dinámicas para el agente según el contexto actual. |

### Habilidades (Skills) de Antigravity

- **openspec-propose**: Generador automático de propuestas y tareas.
- **openspec-apply-change**: El motor de ejecución que escribe código.
- **openspec-explore**: El "Modo Pensamiento" para diseño sin implementación.
- **openspec-archive-change**: El sistema de gestión documental y cierre.

---

## 5. Conceptos Clave (Explicaciones)

### Ciclo de Vida: Spec-Driven Development

OpenSpec no permite "código huérfano". El flujo es:
`Propuesta` → `Especificación (Specs)` → `Diseño` → `Tareas` → `Implementación`.

### Filosofía de Diseño

Buscamos la **Inmutabilidad de la Intención**. Si un diseño cambia durante la implementación, el agente debe pausar, reportar y actualizar los artefactos antes de seguir. Esto evita que la documentación sea "papel mojado".

---

## 6. Comunidad y Mantenimiento

### Registro de Cambios (PROJECT_LOG.md)

Es el corazón narrativo del proyecto. Cada vez que inicias o terminas una funcionalidad mayor, el `PROJECT_LOG.md` se actualiza con una "vX" (versión del proyecto) para mantener a todos los desarrolladores alineados con la evolución del software.

### Reporte de Errores

Usa `/opsx:explore` para investigar errores complejos. Si el error requiere un cambio estructural, conviértelo en una propuesta formal con `opsx:propose`.

---

_Documentación generada por Antigravity - Ingeniería de Precisión._
