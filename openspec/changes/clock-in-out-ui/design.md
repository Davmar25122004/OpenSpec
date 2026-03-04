# Design: Clock-in-Out UI Implementation

## UI Components

### 1. Clocking Section

We will add a new `glass-card` in the worker view (`#worker-view`).

- **Title**: "Control de Asistencia"
- **Status Display**: A badge or text showing "Fuera de servicio" or "En jornada".
- **Primary Button**:
  - Text: "Fichar Entrada" (Green/Emerald) or "Fichar Salida" (Red/Rose).
  - Icon: Clock icon or similar.

### 2. Geolocation Handling

We will use `navigator.geolocation.getCurrentPosition()` to capture coordinates.

- If permission is denied, we will show a descriptive error message.
- If GPS is not available, we might allow clocking with a warning (or block it, depending on policy). For now, it will be required as per backend spec.

## Implementation Details

### HTML (`index.html`)

Insert the new section before "Actividad Acumulada" in the worker dashboard.

### JavaScript (`app.js`)

- **`loadClockingStatus()`**: Fetches the last event from the backend (requires a new endpoint or reusing an existing one) to set the initial button state.
- **`registerClocking(type)`**:
  1. Requests geolocation.
  2. Sends `POST` to `/api/clocking/entry` or `/api/clocking/exit`.
  3. Updates UI on success.

## Styling (`styles.css` / Tailwind)

Use existing Tailwind classes to maintain consistency with the dark glassmorphism theme.

- Entry button: `bg-emerald-600`
- Exit button: `bg-rose-600`
