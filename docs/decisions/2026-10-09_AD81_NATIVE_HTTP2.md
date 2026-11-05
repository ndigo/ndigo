# AD-81: Native HTTP/2 origin — opt-in TLS (`allowHTTP1` + ALPN)

**Date:** 2026-10-09
**Status:** Accepted, executed 2026-10-09 (see the
[companion plan](../plans/2026-10-09_NATIVE_HTTP2.md); guide 01 §8 and the
`HTTPServer`/adapter TSDoc updated at execution) — executes the optioned
Scope B recorded in AD-80 D-3, closing the native-origin half of GAP-12
**Deciders:** Framework owner

---

## Context

AD-80 (2026-10-09) recorded the edge-termination decision for HTTP/2–3 and
left native origin h2 optioned: _"if a consumer later needs h2 to the
origin … the work is a separate ADR-scoped effort with four known pieces —
TLS surface first, `http2.createSecureServer({ allowHTTP1: true })`, the
WebSocket h1.1 fallback, and outbound h2."_ The framework owner decided to
build it: HTTP/2 is a baseline expectation of modern HTTP frameworks, and
operators should not need an edge just to serve h2 to direct clients.

What was verified before commitment (probes 2026-10-09, Node v22.22.2):

- **The compat layer is pipeline-transparent.** `http2.createSecureServer`
  with `allowHTTP1: true` delivers BOTH h2 and h1.1 requests through the
  same `request` event with the `http.Server`-shaped surface:
  `req.httpVersion` reads `'2.0'`, `url`/`method`/`headers` parse
  identically, `res.writeHead`/`write`/`end` behave the same, and timed
  (SSE-style) chunked writes arrive intact. The platform pipeline
  (`NodeRequest`, limits, dispatcher) needed no changes.
- **WebSockets stay on h1.1.** `ws` attaches cleanly to the secure server —
  the `upgrade` event fires for h1.1 TLS clients and the RFC 6455
  handshake completes. No RFC 8441 anywhere (neither `ws` nor browsers),
  so an h2 client can never upgrade; `allowHTTP1` is therefore mandatory,
  not cosmetic.
- **The h2/tls server has no `closeAllConnections`** (checked at runtime —
  neither `Http2SecureServer` nor `tls.Server.prototype` exposes it), so
  the adapter's drain deadline needed its own force-close path.
- **`alpnProtocol` is populated only after the session is established** —
  null before the first exchange (probe), which matters for assertions,
  not for the server.
- **Client-side h2 remains a separate effort**: bundled fetch negotiates
  h1.1 even when h2 is offered; external undici (`Agent({ connect: {
  allowH2: true } })`) negotiates h2, but undici's h2 surface is still
  maturing (serialization and abort bugs fixed in recent releases). Not
  in scope here.

## Evidence

- Peer expectations: browsers negotiate h2 at the TLS terminator by
  default; Node's `node:http2` is the only first-class h2 server in the
  ecosystem, and the ALPN-with-fallback shape (`h2` + `http/1.1` on one
  port) is the standard single-listener topology (nginx/Express/Fastify
  all use it).
- The repo's own probe first (AD-80, Scope B) confirmed the compat claim
  before any code: h2 status/body/streaming, h1.1 fallback, ws upgrade,
  and `fetch → 1.1` were all observed against a throwaway server.
- HTTP/3 remains impossible in-process: no QUIC listener in Node core, and
  the available bindings (`quiche`, `node-quic`, `@matrixai/quic`) are
  native/experimental — edge termination stays the h3 story (AD-80).

## Decision

### D-1 — TLS material is an opt-in server option; the default stays plaintext h1.1

`HTTPServerOptions.tls` / `NodeHTTPServerAdapterOptions.tls`
(`TLSServerOptions`: `key`, `cert`, `ca?`, `minVersion?`, `ciphers?`)
switches the default adapter to `http2.createSecureServer` with
`allowHTTP1: true` and `ALPNProtocols: ['h2', 'http/1.1']`. Absent the
option, the origin is unchanged — plaintext `node:http`, the AD-80
edge-terminated topology. The adapter decides at `listen()` time; the
existing request pipeline is untouched (probe-verified compat layer).

### D-2 — Env wiring is all-or-nothing

`NDIGO_TLS_KEY` + `NDIGO_TLS_CERT` (both required together) and optional
`NDIGO_TLS_CA` configure TLS without code. One key without the other
throws a `RangeError` at construction — a half-configured listener must
fail loud rather than silently serve plaintext (the fail-open trap that
SEC posture rejects).

### D-3 — PEM entries are inline-or-path, resolved at bind time

An entry starting with `-----BEGIN` is PEM content; anything else is a
file path read during `listen()`. Node's tls options accept PEM content
only, so path support is a framework convenience — a missing file rejects
`listen()` with a typed error instead of failing mid-handshake later.
This lets operators mount cert files, keep secrets out of env dumps, or
pass one-line env-injected credentials.

### D-4 — WebSockets keep riding h1.1; h2-only clients cannot upgrade

Documented contract, not a workaround: no RFC 8441 in `ws` or browsers,
so socket/STOMP endpoints require the h1.1 ALPN path. `allowHTTP1` is
hardcoded; a future RFC 8441 implementation would add a second upgrade
path, not replace this one.

### D-5 — The drain deadline force-closes tracked sockets on the secure flavor

The h1.1 flavor keeps `server.closeAllConnections()`; the secure flavor
tracks `connection` sockets at `listen()` and destroys them when the
shutdown deadline wins (covers h2 sessions and h1.1-over-TLS alike —
`closeAllConnections` does not exist there, verified at runtime).

### D-6 — HTTP/3 stays edge-only; client-side h2 stays out of scope

No QUIC in Node core — h3 belongs to the edge/CDN (AD-80 unchanged).
`@ndigo/http` continues on bundled fetch (h1.1); undici's `allowH2` agent
is the recorded path if a client-side consumer appears, and Node 26
fetch-h2 is a watch item.

## Alternatives considered

- **Plaintext h2c (`h2c` upgrade / prior-knowledge)**: Node's `node:http2`
  has no h2c support; implementing it means raw frame parsing. Rejected —
  TLS is the standard h2 carrier and h2c adds attack surface for no
  consumer.
- **`https.createServer` + h1.1 only**: delivers TLS but no h2 — the gap
  stays open. Rejected; ALPN on one port costs nothing.
- **Third-party h2/h3 stacks** (Fastify-style wrappers, quiche bindings,
  `@matrixai/quic`): native-binding maturity and dependency weight with no
  benefit over core `node:http2`. Rejected — h3 specifically remains
  edge-only per D-6.
- **Always-TLS adapter**: forcing certs on every listener would break the
  existing plaintext deployments and the AD-80 posture. Rejected — opt-in
  preserves both topologies.

## Consequences

- `NodeHTTPServerAdapter` now binds either `node:http` (plain) or
  `node:http2` secure (ALPN) servers; `#server` is a union, kept
  runtime-compatible with `ws` via a local cast (probe-verified).
- Public API addition only: `TLSServerOptions` + `tls` on both option
  surfaces, plus the `NDIGO_TLS_*` env family. No existing option changes,
  no breakage.
- The h2 server ignores `keepAliveTimeout`/`maxRequestsPerSocket`
  (h1.1-only semantics); `requestTimeout`/`headersTimeout` are honored on
  both flavors.
- Shutdown: secure adapters force-close via tracked sockets at the drain
  deadline (D-5); `HTTPServer.close()` semantics unchanged.
- Spec coverage: a new `test/tls-http2.spec.ts` (9 tests, openssl-gated —
  skipped without the CLI) exercises h2 + h1.1 fallback + POST binding +
  405 + ws upgrade + inline PEM + unreadable-key rejection + half-configured
  env rejection + drain force-close.

## Risks

- **Cert rotation/ops**: file paths are read once at `listen()` — rotating
  a file requires a restart. Documented; same lifecycle as the process.
- **Fail-open trap**: `NDIGO_TLS_KEY` alone throws (D-2) rather than
  silently listening in plaintext. Operators see the error at boot.
- **`alpnProtocol` timing**: client-side assertions must wait for the
  session (probe); the server itself is unaffected.
- **h1.1-only options on the secure flavor**: `keepAliveTimeout` etc. are
  no-ops there — timeouts that matter (request/headers) are both honored;
  long-lived SSE over h2 is bounded by the stream, not keep-alive.

## References

- AD-80 (`docs/decisions/2026-10-09_AD80_HTTP23_EDGE_TERMINATION.md`) —
  the edge-termination posture this opt-in extends (D-3 there, executed
  here); GAP-12 of `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md`
  §6.
- Node.js docs: `node:http2` `createSecureServer`/`allowHTTP1`/ALPN;
  tls options accept PEM content (paths are this framework's wrapper).
- Applied at: `packages/ndigo-platform-node/src/http-server.ts`
  (`TLSServerOptions`, env reader), `node-http-server-adapter.ts`
  (secure branch, PEM resolution, drain force-close),
  `test/tls-http2.spec.ts`, guide 01 §8.
