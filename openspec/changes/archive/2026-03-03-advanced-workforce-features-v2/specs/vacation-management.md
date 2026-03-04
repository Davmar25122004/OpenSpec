# Spec: Gestión de Vacaciones (v2)

## Resumen

Define requisitos para visualizar, asignar y cancelar vacaciones usando jQuery y jQuery UI en Frontend para elegir fecha de inicio y fin, reflejándolo al backend.

---

## Modelo de Datos

Añadido `company` (string) y `vacations` a cada objeto trabajador:

```json
{
  "id": "emp-001",
  "name": "Ana García",
  "company": "Acme S.A.",
  "vacations": [
    { "id": "uuid-v1", "startDate": "2026-07-01", "endDate": "2026-07-15" }
  ]
}
```

---

## Requisitos Funcionales

### Requisito: Asignación GUI (Datepicker)

- **DADO** que un operario accede a la pantalla de un trabajador
- **CUANDO** quiere solicitarle vacaciones
- **ENTONCES** abre un Bootstrap Modal y usa el Datepicker (`start` y `end`). El de fecha final está restringido (minDate) por lo escogido en inicio.

### Requisito: API Endpoints (Vacations)

- **DADO** un POST a `/api/workers/:id/vacations`
- **CUANDO** trae `{ startDate, endDate }`
- **ENTONCES** se añade la entrada si es válida (formato `YYYY-MM-DD`, e inicio anterior o igual a fin) y devuelve `201`.

### Requisito: Cancelación de Vacaciones

- **DADO** una vacación existente `vacId`
- **CUANDO** el cliente envía `DELETE /api/workers/:id/vacations/:vacId`
- **ENTONCES** se remueve del array atómicamente y responde `200`.

---

## Reglas de Validación

| ID     | Regla                                         | Error                    |
| ------ | --------------------------------------------- | ------------------------ |
| VAC-01 | `startDate` debe ser formato ISO `YYYY-MM-DD` | HTTP 422                 |
| VAC-02 | `endDate` debe ser $\ge$ `startDate`          | HTTP 422                 |
| VAC-03 | Choques de fecha con la misma empresa         | Tratado en spec separada |
