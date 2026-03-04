# Proposal: Clock-in-Out System (Fichaje)

## Goal

Implement a robust and secure clock-in/out (fichaje) system to track employee work sessions.

## Problem Statement

The current system lacks a unified way to record when workers start and end their shifts, which is essential for payroll, compliance, and resource management.

## Solution Overview

We will implement a "Fichaje" module that allows users to record their entry and exit times. The system will enforce a state-based workflow to ensure data integrity.

## Requirements

- **Data Capture**: Every record must include:
  - `user_id`: Unique identifier of the worker.
  - `timestamp_entry`: Date and time of the event.
  - `device_id`: Identifier of the device used for clocking.
  - `location_coords`: GPS coordinates (latitude/longitude) at the time of clocking.
- **State Logic**: A user cannot perform an "entry" (clock-in) if their last recorded state is also an "entry". They must clock out (exit) before clocking in again.
- **Aud itability**: Records must be immutable once created.

## Success Criteria

- Workers can successfully clock in and out.
- The system correctly blocks double entries or double exits.
- All required fields are captured and persisted correctly.
