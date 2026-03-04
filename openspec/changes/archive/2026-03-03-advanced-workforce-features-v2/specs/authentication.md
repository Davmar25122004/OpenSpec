# Spec: Autenticación y Control de Acceso (v2)

## Resumen

Define los requisitos de seguridad para proteger las rutas de administración de trabajadores y vacaciones con JSON Web Tokens (JWT). El frontend tendrá una vista de Login.

---

## Requisitos Funcionales

### Requisito: Login de Operador

- **DADO** que un operador accede a la aplicación
- **CUANDO** introduce usuario/contraseña correctos
- **ENTONCES** recibe un token JWT firmado de sesión con exp=8h y accede al panel

### Requisito: Bloqueo de Peticiones no Autorizadas

- **DADO** que se lanza un `POST`, `PUT` o `DELETE` al API (`/api/workers` / `/api/vacations`)
- **CUANDO** no hay encabezado `Authorization: Bearer <token>` válido
- **ENTONCES** el middleware aborta devolviendo código HTTP `401 Unauthorized` acompañado de un mensaje JSON.

### Requisito: Cierre de Sesión

- **DADO** un operador logueado
- **CUANDO** pulsa el botón en la Navbar "Logout"
- **ENTONCES** el frontend elimina la cookie o `sessionStorage` dejándolo sin token y envía POST al `/api/auth/logout`

---

## Criterios de Aceptación

| ID      | Regla                                                                   |
| ------- | ----------------------------------------------------------------------- |
| AUTH-01 | JWT Secret definido en variables de entorno o un string seguro local    |
| AUTH-02 | Contraseña con hash bcrypt en `/server/auth/credentials.json`           |
| AUTH-03 | Las pruebas manuales sin Bearer Token deben fallar con HTTP 401.        |
| AUTH-04 | Endpoints públicos como el `GET /api/workers` deben seguir disponibles. |
