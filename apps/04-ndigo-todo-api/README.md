# @ndigo/todo-api — Ndigo Todo-Backend

> Implementation of the [Todo-Backend](https://www.todobackend.com/specs/index.html) REST spec: five JSON operations, verified by the project's public browser spec runner.

A Node server built on `@ndigo/platform-node` that implements the Todo-Backend
API — the shared, executable spec for "a simple web API for managing a todo
list". It is deliberately the smallest honest Ndigo HTTP app: one controller,
one in-memory store, JSON in and JSON out, plus the protocol details the public
runner actually exercises (CORS preflight, `HEAD`, `OPTIONS`, exact statuses).

## Run

```bash
cd apps/04-ndigo-todo-api && pnpm start
# listening on http://localhost:3030
```

Override the port with `PORT=<n> pnpm start`, or point todo urls at a public
host with `TODO_BASE_URL=https://api.example.com` (only used when a request
carries no `Host` header).

## Endpoints

```text
GET    /todos           200  list every todo (insertion order)
POST   /todos           201  create, `Location: <todo url>`
DELETE /todos           204  delete every todo (the spec's collection reset)
OPTIONS /todos          204  Allow: GET, HEAD, POST, DELETE, OPTIONS
GET    /todos/{id}      200/404
PUT    /todos/{id}      200/404  update title / order / completed
PATCH  /todos/{id}      200/404  partial update
DELETE /todos/{id}      204/404
OPTIONS /todos/{id}     204  Allow: GET, HEAD, PUT, PATCH, DELETE, OPTIONS
```

Every todo is the five-field Todo-Backend object:

```json
{ "id": 1, "title": "walk the dog", "order": 1, "completed": false, "url": "http://localhost:3030/todos/1" }
```

Grammar and defaults:

- `title` is the only required field; an empty or missing title fails schema
  validation (`422`).
- `order` is client-owned. A create without one appends (one past the highest
  `order` in the store), so the list stays stable and `order` is always a number.
- `completed` defaults to `false`.
- `url` is built per request from the request's `Host` (honouring
  `X-Forwarded-Proto`), so it always names the host the client reached. A
  client-supplied `url`/`id` is stored and returned verbatim (round-trip).
- `PUT` and `PATCH` both apply the fields the body carries; the spec never
  defines an absent-field contract for `PUT`, and the official runner only
  PATCHes.
- `HEAD` works on every `GET`-able route (the dispatcher falls back from `HEAD`
  to the `GET` handler; Node suppresses the body, keeping the headers).
- Bodies are JSON in and JSON out: a `POST`/`PUT`/`PATCH` whose `Content-Type`
  is not `application/json` is `415` (enforced by a pipeline interceptor, so the
  check runs _before_ body validation), an unparseable JSON body is the
  platform's `400` `urn:ndigo:malformed-body` problem, a body that parses but
  violates the schema (missing or empty `title`, non-boolean `completed`) is
  `422`, and every `4xx` is an RFC 9457 `application/problem+json` document.
- Cross-origin requests are allowed for any origin (`Access-Control-Allow-Origin: *`,
  no credentials — the public spec runner is a browser client on another
  origin); preflights short-circuit with `204` and the allow-methods/
  allow-headers lists; `Location` is exposed.

## Storage

`@ndigo/orm` — an entity (`Todo`, column metadata as the validation source) over
`InMemoryDataSource` + `InMemoryEntityManager`, wrapped by a `TodoStore`
(`src/todo-store.ts`) that is the app's only persistence seam. The ORM earns
its place here because the whole resource is one entity with a generated key and
derived Zod validation; swapping in a durable data source (the Drizzle/SQLite
one `05-ndigo-api` uses) changes only the store's constructor. Generated ids keep
counting up across `DELETE /todos`, so a url handed out earlier is never
silently recycled.

## Demonstrates

- `@requestMapping` / `@getMapping` / `@postMapping` / `@putMapping` /
  `@patchMapping` / `@deleteMapping` controllers with `@parameters`
  (path variable, header, whole body)
- Zod request validation through `validatedBody` (AD-07) — schema failures are `422`
- `ResponseEntity` for exact statuses and the `Location`/`Allow` headers
- RFC 9457 problem+json error envelopes for `400`/`404`/`405`/`415`/`422`
- `HEAD` → `GET` fallback and explicit `OPTIONS` mappings
- The platform's `CORSInterceptor` plus an app-side `JSONBodyInterceptor`
  (media-type gate), wired into `HANDLER_MAPPING.interceptors` in
  `src/todo-http-interceptors.ts` — see the framework-gap note below
- `@ndigo/test` MockHTTP coverage of the public spec runner's checklist

## Tests

```bash
pnpm --filter @ndigo/todo-api test
```

Two lanes, both against the real composition (`bootNodeApp` + the app's
configuration + the CORS wiring the server applies at boot):

- `test/todo-api.spec.ts` — the documented surface: create/read/update/delete
  round-trips, `404`s, `PATCH` partial updates, order preservation, `HEAD`,
  `OPTIONS`, `405`, CORS preflight and actual-request headers, malformed JSON,
  schema violations, and the media-type gate (`415` for every non-JSON write,
  including a rejected cross-origin write that must still carry the allowance).
- `test/conformance-checklist.spec.ts` — every `specify` from the public
  runner's `js/specs.js`, reproduced locally so a regression fails in CI instead
  of only in the manual browser run.

## Conformance

The authoritative check is the project's published runner — a browser page
served from another origin, which is exactly why this app configures CORS:

1. Start the server: `cd apps/04-ndigo-todo-api && pnpm start`
2. Open <https://www.todobackend.com/specs/index.html>
3. Enter `http://localhost:3030/todos` as the **test target root** and run the tests.

Every spec must pass. The runner drives the five operations plus the whole
collection (`GET`, `POST` and `DELETE` on the root — the last one is why
`DELETE /todos` exists), so all of it is covered by the curl sequence below.

```bash
# create → read → update → delete, with the protocol surface around it
curl -si -X DELETE localhost:3030/todos                      # 204 — start empty
curl -s  -X POST localhost:3030/todos \
     -H 'content-type: application/json' -d '{"title":"walk the dog"}'
# HTTP/1.1 201 Created, Location: http://localhost:3030/todos/1
# {"id":1,"title":"walk the dog","order":1,"completed":false,"url":"http://localhost:3030/todos/1"}
curl -s  localhost:3030/todos                                # 200 — the list
curl -s  localhost:3030/todos/1                              # 200 — one todo
curl -s  -X PATCH localhost:3030/todos/1 \
     -H 'content-type: application/json' -d '{"completed":true}'
curl -s  -X PUT localhost:3030/todos/1 \
     -H 'content-type: application/json' -d '{"title":"bathe the cat","order":5,"completed":false}'
curl -si -X DELETE localhost:3030/todos/1                    # 204
curl -si localhost:3030/todos/1                              # 404

# protocol surface
curl -sI localhost:3030/todos                                # 200, application/json, no body
curl -si -X OPTIONS localhost:3030/todos                     # 204 — Allow: GET, HEAD, POST, DELETE, OPTIONS
curl -si -X OPTIONS localhost:3030/todos \
     -H 'Origin: https://www.todobackend.com' \
     -H 'Access-Control-Request-Method: POST' \
     -H 'Access-Control-Request-Headers: content-type'        # 204 + Access-Control-Allow-* headers
curl -si -X POST localhost:3030/todos \
     -H 'content-type: application/json' -d '{"title":'      # 400 malformed-body problem
curl -si -X POST localhost:3030/todos \
     -H 'content-type: text/plain' -d 'title=x'              # 415
```

### Framework gap: CORS is not default-on

`@ndigo/platform-node` ships a complete `CORSInterceptor`
(`packages/ndigo-platform-node/src/cors-interceptor.ts`), but nothing registers
it: `NodeAutoConfiguration.handlerMapping()` wires only the security-headers and
rate-limit interceptors, so every Ndigo server is same-origin by default and a
cross-origin browser client is blocked with no configuration knob. The app-side
seam used here is `HANDLER_MAPPING.interceptors` — the same one
`07-ndigo-island` uses to widen its CSP — in **`src/todo-http-interceptors.ts`** (called
from `src/index.ts` and from the test harness), which is one line the framework
could own instead: a `@configurationProperties('ndigo.cors')`-bound interceptor,
or an `@entry()`-discoverable one, would make `applyHttpInterceptors`
unnecessary.

The same file also carries the app's media-type gate. It is an interceptor
rather than a handler check because argument resolution (and therefore
`validatedBody`) runs _after_ `preHandle`: a handler-level
`Content-Type` test only fires once the body has already been accepted, so
`text/plain` answered `422` while urlencoded answered `415` — the same request
shape producing two different statuses depending on how the body happened to
parse. Interceptors run in order, so CORS is installed first and the allow
headers are on the response even when the gate denies with `415`.

## See Also

- [apps/README](../README.md) — the applications progression
- [05-ndigo-api](../05-ndigo-api/README.md) — the flagship Node app (auth, ORM +
  Drizzle, content negotiation, OpenAPI docs)
- [@ndigo/platform-node](../../packages/ndigo-platform-node/README.md) — HTTP
  server, dispatcher, interceptors, `ResponseEntity`
- [@ndigo/orm](../../packages/ndigo-orm/README.md) — entities, repositories, Zod
  schema derivation
- [Todo-Backend](https://www.todobackend.com/) — the spec and its public runner

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
