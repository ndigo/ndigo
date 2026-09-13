# @blue/api — Blue API

Node server showcase built on `@blue/platform-node`: controllers, JWT auth,
ORM-backed notes (+Drizzle), content negotiation, RFC 9457 problem+json
errors, and actuator-style management endpoints.

## Run

```bash
cd apps/blue-api && pnpm start
```

## Endpoints

```text
GET  /api/hello?name=Alice     greeting (JSON)
GET  /api/greet/:name          path-parameter binding
GET  /api/report               negotiated JSON view (JSONView)
GET  /api/report.csv           CSV representation (CSVView)
POST /auth/login               {"username":"admin","password":"demo"} → JWT
GET  /notes                    (Authorization: Bearer <token>) ORM-backed notes
     /drizzle/notes/*          Drizzle-backed notes (SQL)
GET  /health                   liveness/readiness (management)
GET  /metrics                  live telemetry counters (management)
```

## Demonstrates

- `@requestMapping` / `@getMapping` controllers with `@parameters`
  (path/query/body/attribute binding)
- Content negotiation by path extension and `Accept` header
- `ResponseEntity` for status/header control and static file serving
- JWT auth (`@blue/auth-server`) and profile-gated dev beans (`@profile('dev')`)
- In-memory and Drizzle ORM entity managers
- RFC 9457 problem+json error envelope (AD-10)

## Development

```bash
cd apps/blue-api && pnpm test
```

## See Also

- [apps/README](../README.md) — the applications progression
- [@blue/platform-node](../../packages/blue-platform-node/README.md) — the
  Node platform foundation