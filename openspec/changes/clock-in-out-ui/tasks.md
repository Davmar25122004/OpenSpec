# Tasks: Implement Clock-in-Out UI

## 1. Structure & Style

- [ ] Add the "Control de Asistencia" section to `index.html` in the worker view. <!-- id: 101 -->
- [ ] Ensure the layout is responsive and matches the "Workforce" aesthetics. <!-- id: 102 -->

## 2. Logic Implementation

- [ ] Implement `loadClockingStatus()` in `app.js` to fetch and display the current state. <!-- id: 201 -->
- [ ] Implement `handleClockingAction()` in `app.js` to manage geolocation and API calls. <!-- id: 202 -->
- [ ] Update `updateUI()` to call `loadClockingStatus()` when a worker logs in. <!-- id: 203 -->

## 3. Feedback & Errors

- [ ] Add an alert/message area within the clocking card for feedback. <!-- id: 301 -->
- [ ] Test the flow with and without geolocation permissions. <!-- id: 302 -->

## 4. Verification

- [ ] Verify that the button state updates correctly after each action. <!-- id: 401 -->
- [ ] Verify that the correct data (`device_id`, `coords`) is sent to the server. <!-- id: 402 -->
