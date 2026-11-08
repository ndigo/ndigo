# @ndigo/api — Ndigo API

> Node server showcase: controllers, opaque session-token auth, ORM-backed notes, content negotiation, and problem+json errors.

Node server showcase built on `@ndigo/platform-node`: controllers, opaque session-token
auth (AD-33), ORM-backed notes (+Drizzle), content negotiation, RFC 9457 problem+json
errors, and actuator-style management endpoints.

## Run

```bash
cd apps/05-ndigo-api && pnpm start
```

## Introspection (`inspect`)

AD-70 ships the manifest generator without a CLI: the demo entry point prints a
deterministic, versioned JSON manifest of this app.

```bash
pnpm --filter @ndigo/api inspect
```

It boots the same assembly as `pnpm start`, enumerates routes, handler mappings
and declared configuration keys through `@ndigo/inspect`, writes the manifest as
pretty JSON to stdout and exits. It **never starts the HTTP server** (no port is
bound) and **never reads or decrypts configuration values** — only key presence
and the winning source name — so secrets are never emitted.

## Endpoints

```text
GET  /api/hello?name=Alice     greeting (JSON)
GET  /api/greet/:name          path-parameter binding
GET  /api/greeting?name=Ada    Accept-Language-aware greeting (JSON)
POST /api/echo                 echo the JSON body back
GET  /api/products/:id;color=red matrix-parameter route (matches only with ;color=<value>)
GET  /api/products/:id         plain fallback without matrix params
GET  /api/report               negotiated JSON view (JSONView)
GET  /api/report.csv           CSV representation (CSVView)
POST /auth/login               {"username":"admin","password":"demo"} → opaque session token + session cookie
POST /auth/logout              terminate session, clear cookie
GET  /auth/me                  resolve session cookie → { name, roles }
GET  /notes                    (Authorization: Bearer <token>) ORM-backed notes
POST /notes                    (Authorization: Bearer <token>) create note (ORM)
GET  /drizzle/notes            (Authorization: Bearer <token>) Drizzle-backed notes (SQL)
GET  /drizzle/notes/:id        (Authorization: Bearer <token>) one Drizzle note (SQL)
POST /drizzle/notes            (Authorization: Bearer <token>) create note (Drizzle)
POST /api/upload               multipart/form-data (file + optional meta)
GET  /api/config.json          self-served remote config document
GET  /api/config/remote        live resolved remote config value
GET  /api/config/secrets       (Authorization: Bearer <token>) decrypted binding
GET  /api/cached-report        60 s cached report (AD-24)
WS   /stomp/chat?token=<token> STOMP 1.2 chat (@authenticated)
WS   /ws/chat                  raw socket chat (public contrast)
GET  /health                   aggregate component health (management)
GET  /metrics                  live telemetry counters (management)
GET  /v3/api-docs              OpenAPI spec (AD-35; Bearer-gated, SEC-4)
GET  /swagger-ui/              Swagger UI (AD-35; Bearer-gated, SEC-4)
```

## Demonstrates

- `@requestMapping` / `@getMapping` controllers with `@parameters`
  (path/query/body/attribute binding)
- Content negotiation by path extension and `Accept` header
- `ResponseEntity` for status/header control and static file serving
- Opaque session-token auth (`@ndigo/auth-server`, AD-33) and profile-gated dev beans (`@whenProfile('dev')`)
- In-memory and Drizzle ORM entity managers
- RFC 9457 problem+json error envelope
- Scheduled heartbeat task (`@scheduled`, auto-discovered and auto-started; see the [scheduling guide](../../docs/guides/23-scheduling.md))

## Socket authentication

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
public-socket contrast documented in `@ndigo/platform-node`'s README. A token
that does not resolve is a failed authentication (the upgrade is refused with
`1008`), not anonymity.

## Development

```bash
cd apps/05-ndigo-api && pnpm test
```

## See Also

- [apps/README](../README.md) — the applications progression
- [@ndigo/platform-node](../../packages/ndigo-platform-node/README.md) — the
  Node platform foundation

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
