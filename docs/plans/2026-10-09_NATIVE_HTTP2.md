# Native HTTP/2 origin — TLS opt-in (companion plan to AD-81)

**Date:** 2026-10-09
**ADR:** [AD-81](../decisions/2026-10-09_AD81_NATIVE_HTTP2.md) — executes the
optioned Scope B of [AD-80](../decisions/2026-10-09_AD80_HTTP23_EDGE_TERMINATION.md),
closing the native-origin half of GAP-12
(`docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6).

## Goal

Let the default origin listener terminate TLS and negotiate HTTP/2 without
breaking the existing plaintext edge-terminated topology or the WebSocket
surface.

## Changes

| Area                                                 | Change                                                                                                                                                                                                                               |
| :--------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HTTPServerOptions` / `NodeHTTPServerAdapterOptions` | New `tls?: TLSServerOptions` (`key`, `cert`, `ca?`, `minVersion?`, `ciphers?`); PEM entries are inline-or-path, resolved at `listen()`                                                                                               |
| Env                                                  | `NDIGO_TLS_KEY` + `NDIGO_TLS_CERT` (both required — half-configured throws) + optional `NDIGO_TLS_CA`                                                                                                                                |
| Adapter                                              | `listen()` branches: plain `node:http` (unchanged) vs `http2.createSecureServer({ allowHTTP1: true, ALPNProtocols: ['h2','http/1.1'] })`; h2 requests flow through the same `request` event + pipeline (probe-verified compat layer) |
| Timeouts                                             | `requestTimeout`/`headersTimeout` honored on both flavors; `keepAliveTimeout`/`maxRequestsPerSocket` stay h1.1-only                                                                                                                  |
| Shutdown                                             | Secure flavor force-closes tracked `connection` sockets at the drain deadline (`closeAllConnections` does not exist on tls/h2 servers — runtime-verified)                                                                            |
| WebSockets                                           | Unchanged behavior: upgrades ride the h1.1 ALPN fallback (no RFC 8441 in `ws`/browsers — contract, not workaround)                                                                                                                   |
| HTTP/3                                               | Edge-only (no QUIC in Node core); AD-80 posture unchanged                                                                                                                                                                            |

## Acceptance

- `test/tls-http2.spec.ts` (openssl-gated, 9 tests): h2 client → 200 via the
  dispatcher; h1.1 TLS fallback; POST body binding over h2; 405 + `Allow`
  over h2; ws upgrade + echo over TLS; inline PEM accepted; unreadable key
  path rejects `listen()`; half-configured env pair throws; drain deadline
  force-closes an open TLS connection in < 2 s.
- Existing package lane green (46 files / 505 tests at execution).
- Guide 01 §8 documents the opt-in; ADR-80 marked superseded in part.

## Execution log (2026-10-09)

Landed with the ADR: `TLSServerOptions` + `tls` on both option surfaces,
the env reader (all-or-nothing), the adapter's secure branch with inline-
or-path PEM resolution, the per-flavor timeout handling, and the socket-
tracking force-close. The nine-test spec passes; the full `@ndigo/platform-node`
lane stays green; `pnpm typecheck` (build + spec lanes) is clean.
