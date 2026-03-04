# Spec: Integración UI Boostrap 5 y Calidad JSDoc (v2)

## Resumen

Integración UI visual Bootstrap 5 (Navbar, Buttons, Alert, Modal) conservando la estética actual v1. Además del requisito de que TODO lo programado se anote con etiquetas de bloque JSDoc.

---

## Requisitos de Framework UI

### Requisito: Navbar y Sesión (Bootstrap 5)

- **DADO** el index.html
- **CUANDO** se integra el CDN de BS5 en cabecera
- **ENTONCES** se dispondrá una Navbar estilizada de color sólido u oscuro encima, mostrando el estado de login.

### Requisito: Manejo Coexistente de CSS

- **DADO** los Custom Properties prexistentes (`styles.css`)
- **CUANDO** una clase de BS diverge de un panel layout
- **ENTONCES** el layout v1 Grid permanece sin tocas en los wrappers grandes, mientras la interfaz de Modales y Inputs nuevos asumen las clases form-control, btn, modal de Bootstrap.

---

## Requisitos de Calidad de Código (JSDoc + Logs)

### Requisito: Anotación Completa en Lógica Backend

- **DADO** que se añade un servicio tipo `vacationCollision.js`
- **CUANDO** un programador/sub-agente define los algoritmos
- **ENTONCES** debe incluirse un JSDoc:

* `@param {string} dateA` - Explicación
* `@returns {boolean} ...`
* `@example` -> Código sugerido para previsualizar uso

### Requisito: Registro en PROJECT_LOG.md

- **DADO** la proposición inicial requerida
- **CUANDO** se complete el comando `/opsx:apply` de v2
- **ENTONCES** se deberá concatenar obligatoriamente la traza (prompt + análisis) a `PROJECT_LOG.md`.
