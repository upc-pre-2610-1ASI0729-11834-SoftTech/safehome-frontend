# SafeHome Frontend

Angular 20 application for the SafeHome security platform.

## Prerequisites

- Node.js 20+
- Angular CLI 20 (`npm install -g @angular/cli`)
- SafeHome Backend running on `http://localhost:8080`

## Setup & Run

```bash
# Install dependencies
npm install

# Start development server (opens browser automatically)
npm start
```

The app runs on `http://localhost:4200` by default.

## Backend Integration

The frontend connects to the SafeHome Spring Boot backend. Start the backend first:

```bash
# From the safehome-backend directory
./mvnw spring-boot:run
```

The backend must be accessible at `http://localhost:8080`. The API base URL is set in:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

Change `apiBaseUrl` if your backend runs on a different port or host.

## Authentication

- Login via `POST /api/v1/auth/login` — stores JWT in `localStorage`
- Register via `POST /api/v1/auth/register` — auto-logs in after success
- JWT is sent as `Authorization: Bearer <token>` on every HTTP request via `AuthInterceptor`
- Routes under `AppShellComponent` are protected by `AuthGuard`

## Architecture

```
src/app/
  iam/                          # Identity & Access Management
    domain/model/               # Auth DTOs (LoginRequest, LoginResponse…)
    infrastructure/
      services/auth.service.ts  # Calls /api/v1/auth/*
      interceptors/auth.interceptor.ts
      guards/auth.guard.ts
  devices/
    domain/model/device.entity.ts (id: string — UUID from backend)
    infrastructure/
      services/device-api.service.ts     # /api/v1/devices
      assemblers/device.assembler.ts     # Maps backend ↔ frontend
  monitoring/
    domain/model/security-event.entity.ts (id: string)
    infrastructure/
      services/security-event-api.service.ts  # /api/v1/security-events
      services/alert-api.service.ts           # /api/v1/alerts
      assemblers/security-event.assembler.ts
  settings/
    infrastructure/
      services/user-settings-api.service.ts   # /api/v1/user-settings
      assemblers/user-settings.assembler.ts
  support/
    infrastructure/
      services/support-ticket-api.service.ts  # /api/v1/support-tickets
      assemblers/support-ticket.assembler.ts
  shared/
    application/safehome.store.ts   # Angular Signals state — loads from backend
    environments/                   # environment.ts / environment.prod.ts
```

## Key Changes from TB1

| Item | Before | After |
|------|--------|-------|
| `@angular/animations` version | `"0"` (broken) | `"^20.3.0"` |
| Authentication | localStorage only | Real JWT via `/api/v1/auth/login` & `/register` |
| JWT propagation | None | `AuthInterceptor` adds `Authorization: Bearer` header |
| Route protection | None | `AuthGuard` on all dashboard routes |
| Device data | localStorage | `/api/v1/devices` |
| Event data | localStorage | `/api/v1/security-events` |
| Alert data | localStorage | `/api/v1/alerts` |
| Support tickets | localStorage | `/api/v1/support-tickets` |
| Settings | localStorage | `/api/v1/user-settings/{userId}` |
| Model IDs | `id: number` | `id: string` (UUID from backend) |
| Assemblers | Partial | Full backend↔frontend mapping for all entities |

## Production Build

```bash
npm run build
```

Output is in `dist/`. Point your web server to `dist/safe-home-front-end-tb1/browser/`.

## Changes in this version

| Issue | Fix |
|---|---|
| `propertyId` not set after login | `AuthService.login()` now calls `GET /properties/user/{userId}` after login, creates a default property for new users, and saves `propertyId` to localStorage |
| `propertyId` not sent on device create | `addDevice()` in store reads `authService.getPropertyId()` and passes it to `DeviceAssembler.toRequest()` |
| `markEventAttended` used `/alerts/{id}/read` incorrectly | The backend's `/security-events` only has GET + POST. Attend/resolve are local UI state. `markEventAttended` is now clearly documented as local-only |
| Security events mixed with alerts | `SecurityEventApiService` and `AlertApiService` are fully separate; both have comments explaining the difference |
| Settings 404 for new users | `loadSettings()` silently keeps defaults on error. `updateSettings()` tries PUT first, falls back to POST (create) |
| `id: string` type mismatches | All assemblers, resources and entities consistently use `string` for IDs |
| IoT Simulator in production | `environment.enableIotSimulator = false` in `environment.prod.ts`. `IoTSimulatorService.start()` is a no-op when flag is false |
| Zones not loaded from backend | `ZoneApiService` added. `loadZones()` calls `GET /zones/property/{propertyId}`, falls back to device derivation on error |
| Error messages not shown | `SafeHomeStore.error` signal now contains real backend error messages via `friendlyError()` |
| Default language was not English | `app.component.ts` calls `setDefaultLang('en')` and `setFallbackLang('en')` first |
