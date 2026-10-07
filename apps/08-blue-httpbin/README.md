# @blue/httpbin — Blue HTTPBin

> HTTP semantics playground: echo what you sent, shape the response back.

A [httpbin](https://github.com/postmanlabs/httpbin)-style probe server built on
`@blue/platform-node`. Every endpoint reports exactly what the dispatcher saw —
method, path, URL, query args, headers, parsed body (JSON/form/multipart) and
client origin — and the response probes exercise redirects, status codes,
response headers, cookies, auth challenges, delays, binary bodies, compression
and rate limiting.

## Run

```bash
cd apps/08-blue-httpbin && pnpm start
# listening on http://127.0.0.1:3020
```

Override the port with `PORT=<n> pnpm start`.

## Endpoints

```text
GET    /get                            echo a bodyless request
POST   /post                           echo a JSON / urlencoded / multipart body (files: name + size)
*      /anything                       echo any verb
*      /anything/{*rest}               echo any verb at any sub-path
GET    /headers                        echo the request headers
GET    /ip                             echo the client origin
GET    /status/{code}                  return that status (`/status/` → 200)
GET    /redirect/{n}                   `302` chain down to `/get`
GET    /relative-redirect/{n}          same chain with a relative `Location`
GET    /redirect-to?url=               `302` to `url`
GET    /response-headers?k=v           set the query pairs as response headers and echo them
GET    /cookies                        echo the cookie jar
GET    /cookies/set?k=v                `302` to /cookies with `Set-Cookie`
GET    /cookies/delete?k=              `302` to /cookies expiring the named cookies
GET    /basic-auth/{user}/{passwd}     401 + `WWW-Authenticate` unless the Basic credentials match
GET    /bearer                         401 + `WWW-Authenticate: Bearer` unless a token is present
GET    /delay/{n}                      wait n seconds (clamped 0–10, non-blocking)
GET    /bytes/{n}                      n deterministic pseudo-random bytes
GET    /stream/{n}                     n newline-delimited JSON records
GET    /gzip, /deflate                 negotiated compressed JSON when `Accept-Encoding` allows
GET    /uuid                           a fresh UUID
GET    /json, /html, /xml              fixed sample documents
GET    /robots.txt                     a fixed robots policy
GET    /matrix/{id};color={color}      matrix-parameter binding (+ plain `/matrix/{id}` fallback)
GET    /limit                          3 requests/minute per client (429 + Retry-After)
```

### curl examples

| Request                                                                                    | Result                                                 |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| `curl -s localhost:3020/get?a=1`                                                           | `{ method, path, url, args, headers, origin, … }`      |
| `curl -s -X POST localhost:3020/anything -H 'content-type: application/json' -d '{"x":1}'` | echo with `json: { x: 1 }`                             |
| `curl -s -X POST localhost:3020/post -F file=@README.md`                                   | echo with `files: { file: { filename, size } }`        |
| `curl -si localhost:3020/status/418`                                                       | `418 I'm a teapot`                                     |
| `curl -si localhost:3020/redirect/2`                                                       | `302` + `Location: /redirect/1`                        |
| `curl -si 'localhost:3020/response-headers?X-Test=1'`                                      | `X-Test: 1` header + JSON echo                         |
| `curl -si -c jar.txt 'localhost:3020/cookies/set?foo=bar'`                                 | `302` + `Set-Cookie: foo=bar; Path=/`                  |
| `curl -s -b jar.txt localhost:3020/cookies`                                                | `{ "cookies": { "foo": "bar" } }`                      |
| `curl -si -u me:secret localhost:3020/basic-auth/me/secret`                                | `200` + `{ "authenticated": true, "user": "me" }`      |
| `curl -si localhost:3020/basic-auth/me/secret`                                             | `401` + `WWW-Authenticate: Basic realm="blue-httpbin"` |
| `curl -s localhost:3020/bytes/16                                                           | wc -c`                                                 | `16` |
| `curl -s localhost:3020/stream/3`                                                          | three JSON lines                                       |
| `curl -si -H 'Accept-Encoding: gzip' localhost:3020/gzip`                                  | `Content-Encoding: gzip`                               |
| `curl -s 'localhost:3020/matrix/42;color=red'`                                             | `{ "id": "42", "color": "red" }`                       |
| `curl -si localhost:3020/limit` (×4)                                                       | 4th is `429` + `Retry-After`                           |
| `curl -si localhost:3020/nope`                                                             | `404` problem+json                                     |
| `curl -si -X POST localhost:3020/get`                                                      | `405` + `Allow: GET`                                   |

## Demonstrates

- `@requestMapping` / `@getMapping` / `@postMapping` controllers with
  `@parameters` across every source — `routeValue()`, `queryValue()`,
  `pathVariable()`, `matrixValue()`, `headerValue()`, `cookieValue()`,
  `bodyValue()` and multipart parts (`@blue/dispatcher`).
- Method-less mappings (`@requestMapping({ value })`) matching any verb, and the
  greedy `{*rest}` wildcard segment.
- Matrix-parameter routing via `matrixParamCondition` with a fallback mapping.
- `ResponseEntity` status/header control and raw (`Buffer` / string) bodies
  (`@blue/platform-node`).
- Redirects, `Set-Cookie` round-trips, `WWW-Authenticate` challenges and
  negotiated `gzip`/`deflate` bodies.
- `@rateLimit` enforcement — `429` + `Retry-After` (`@blue/platform-node`).
- RFC 9457 problem+json error envelopes and `405` + `Allow` method semantics.
- Async handlers yielding the event loop for `/delay`.

## Tests

```bash
pnpm --filter @blue/httpbin test
```

The `@blue/test` `MockHTTP` lane boots the real application context and drives
the whole pipeline in-process: echo payloads, urlencoded and multipart bodies,
status codes, the redirect chain, cookie round-trips, Basic/Bearer auth,
deterministic bytes, compression negotiation, matrix binding, the rate-limit
denial, and the `404`/`405` error contract.

## See Also

- [apps/README](../README.md) — the applications progression
- [04-blue-api](../04-blue-api/README.md) — the canonical Node app reference
- [postmanlabs/httpbin](https://github.com/postmanlabs/httpbin) — the service this demo is modelled on

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
