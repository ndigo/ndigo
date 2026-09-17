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
WS   /stomp/chat?token=<token> STOMP 1.2 chat (@authenticated — SEC-3)
WS   /ws/chat                  raw socket chat (public contrast)
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
- Scheduled heartbeat task (`@scheduled`, auto-discovered and auto-started —
  AD-20, [scheduling guide](../../docs/guides/05-scheduling.md))

## Socket authentication (SEC-3)

The app wires socket identity declaratively: `NodeAppConfiguration`'s
`socketRequestAuthenticator` bean resolves a demo token from `?token=` on the
upgrade URL (the only channel a WHATWG `WebSocket` client has) or an
`Authorization: Bearer …` header, through the same `lookupPrincipal` the HTTP
side uses. It returns `{ principal, user }` — which also makes the STOMP
broker's `/user/*` scope real.

`StompChatController.chat` is marked `@authenticated`, and HTTP interceptors
do not run on sockets: the platform adapter enforces that metadata at
dispatch, closing an upgrade without a principal with `1008`. Log in first,
then connect:

```bash
TOKEN=$(curl -s -X POST localhost:3000/auth/login \
  -H 'content-type: application/json' \
  -d '{"username":"admin","password":"demo"}' | jq -r .token)
# ws://localhost:3000/stomp/chat?token=$TOKEN
```

The raw `/ws/chat` socket endpoint is deliberately left unauthenticated — the
public-socket contrast documented in `@blue/platform-node`'s README. A token
that does not resolve is a failed authentication (the upgrade is refused with
`1008`), not anonymity.

## Development

```bash
cd apps/blue-api && pnpm test
```

## See Also

- [apps/README](../README.md) — the applications progression
- [@blue/platform-node](../../packages/blue-platform-node/README.md) — the
  Node platform foundation
