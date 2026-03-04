# Proposal: Clock-in-Out UI Implementation

## Goal

Add a user-friendly interface to the worker dashboard for registering work sessions (fichaje).

## Problem Statement

The backend for clock-in/out is ready, but workers currently have no way to use it through the web application.

## Solution Overview

We will add a new "Control de Asistencia" section to the worker dashboard. This section will feature a dynamic button that changes state based on whether the worker is currently clocked in or out. It will also capture the user's geolocation and device information automatically.

## Requirements

- **Dynamic Button**: Shows "Registrar Entrada" if the user is clocked out, and "Registrar Salida" if they are clocked in.
- **Geolocation**: Automatically capture latitude and longitude using the browser's Geolocation API.
- **Feedback**: Provide clear visual confirmation (success/error messages) after clocking.
- **Responsive Design**: Ensure the new section fits seamlessly into the existing dashboard layout.

## Success Criteria

- Workers can see their current clocking status.
- Clicking the button successfully calls the backend and updates the status.
- Errors (e.g., location denied) are handled gracefully.
