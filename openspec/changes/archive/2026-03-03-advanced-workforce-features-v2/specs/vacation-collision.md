# Spec: Lógica de Colisión Crítica (v2)

## Resumen

Lógica backend (middleware / service) implementada antes del almacenamiento (writeDB) que imposibilita la intercepción temporal de dos calendarios vacacionales para empleados de una misma `company`.

---

## Condiciones de Colisión (Matemática)

Para dos lapsos A `(A_start, A_end)` y B `(B_start, B_end)`:
Existe choque sí y solo sí `(A_start <= B_end) AND (A_end >= B_start)`.

### Casos Límite:

| Relación                                 | ¿Hay choque? |
| ---------------------------------------- | ------------ |
| Ambas idénticas                          | Sí ✅        |
| A comienza antes, termina dentro de B    | Sí ✅        |
| B envuelve totalmente a A                | Sí ✅        |
| A termina el día anterior al inicio de B | No ✖️        |

---

## Requisitos Funcionales Críticos

### Requisito: Filtro Empresarial

- **DADO** una solicitud entrante para `trabajadorA` que pertenece a `EmpresaX`
- **CUANDO** se analiza el solapamiento de fechas
- **ENTONCES** solo se comparan las vacaciones de otros trabajadores donde su `company` conste ser `EmpresaX`.
- Excepción: Si el trabajador carece de campo `company`, se aprueba la vacación sin filtro (no produce choques con él ni él con otros).

### Requisito: Aborto Pre-Persistencia y Códigos HTTP

- **DADO** una solicitud generadora de colisión con un compañero `trabajadorB`
- **CUANDO** el middleware lo detecta
- **ENTONCES** el backend NO escribe en `db.json`.
- Devuelve un **HTTP 409 Conflict** con cuerpo:

```json
{
  "error": "Choque de vacaciones.",
  "collision": {
    "workerId": "B_ID",
    "name": "B_NAME",
    "startDate": "B_START",
    "endDate": "B_END"
  }
}
```

---

## Criterios de Calidad de Implementación

- Todas las funciones comparadoras en el backend tendrán que documentarse con **JSDoc** de alto nivel.
