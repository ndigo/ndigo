# AD-80: HTTP/2–3 — edge termination is the supported pattern

**Date:** 2026-10-09
**Status:** Superseded in part by
[AD-81](2026-10-09_AD81_NATIVE_HTTP2.md) — D-3's optioned native-h2 work
was executed the same day as an opt-in TLS mode; D-1/D-2 (edge
termination as the default posture) remain current. Originally: Accepted,
executed 2026-10-09 (guide 01 §8 and the `HTTPServer` TSDoc notes updated
at execution; plan GAP-12 closed) — GAP-12 of
`docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6, Wave-6 watch track
**Deciders:** Framework owner

---

## Context

The 2026-10-07 review lists GAP-12: **HTTP/2–3** — severity low, status
**absent**, recommendation "watch: document edge termination as the
supported pattern". The 2026-10-06 review carries the same item as W2 with
the same prescription.

What the repository actually is at HEAD (verified 2026-10-09):

- **The origin listener is HTTP/1.1 and has no TLS surface at all.**
  `NodeHTTPServerAdapter` wraps `node:http.createServer()`
  (`packages/blue-platform-node/src/node-http-server-adapter.ts:348`);
  `HTTPServerOptions` is port/host/adapter plus socket/limits/authenticate/
  trusted-proxy options (`http-server.ts:36-88`) — there is no `tls:`,
  `ssl:`, or secure-listener option anywhere in the platform.
- **The framework already assumes an edge in front.** AD-37 ships
  `trustedProxies` / `BLUE_TRUSTED_PROXIES` and the `TrustedProxySet`
  with rightmost-first `X-Forwarded-For` walking — the seam exists
  precisely because the platform expects to sit behind a reverse proxy.
- **Node ≥ 22 baseline** (root `package.json` `engines`). `node:http2`
  (secure server with ALPN) is available; **HTTP/3 is not** — there is no
  QUIC listener in Node core, so an in-process h3 origin is impossible at
  the baseline and for the foreseeable future.
- **WebSockets cannot ride h2.** Neither `ws` (the adapter's upgrade
  implementation) nor any browser implements RFC 8441 (WebSocket over
  HTTP/2 extended CONNECT), so even a native-h2 origin would serve socket
  upgrades over h1.1 only — a h2-only listener would break the AD-21/23
  socket and STOMP surface for browsers.
- **The outbound client has no h2 either.** `@blue/http` rides
  fetch/undici; undici's h2 client (`Http2Client`, ALPN connect options)
  is experimental. Client-side h2 would be a separate effort.

## Evidence

- Peer 1.0 expectations: browsers and mobile clients negotiate h2 with the
  TLS terminator, and h3 at CDNs — nobody measures the edge→origin hop,
  which in practice is keep-alive h1.1 or h2 inside a trusted network.
  The frameworks in the review's peer set (Spring Boot, Express, Fastify)
  ship optional `ssl:`/`https:` surfaces, yet their own documentation
  treats TLS termination at a proxy/LB as the normal production topology.
- The only h2/h3 user-visible benefits (multiplexing, HPACK, 0-RTT) are
  realized at the terminator — the origin hop gains nothing from them when
  the origin is one host behind the edge (no connection-fan-out to amortize).
- RFC 8441 has no implementation in `ws` or any browser engine (checked
  2026-10-09), so "h2 end-to-end including sockets" is not achievable from
  this framework's dependency set regardless of server changes.

## Decision

### D-1 — The origin stays HTTP/1.1; TLS, HTTP/2 and HTTP/3 terminate at the edge

For 1.0 the supported topology is: **browser/client → edge (TLS, h2, h3) →
origin (plain h1.1 keep-alive)**, with the edge included in the trusted-proxy
allowlist (AD-37) so client identity survives the hop. The framework does
not terminate TLS in-process; the default `127.0.0.1` bind makes
accidental public exposure of the plaintext origin a misconfiguration, not
a default.

### D-2 — The posture is a documented contract, not an accident

Guide 01 gains a deployment section stating the topology, the identity
mechanism, and the socket caveat; `HTTPServer`'s TSDoc states the origin
serves HTTP/1.1 and is meant to sit behind the terminator. The 2026-10-07
plan's GAP-12 row flips to resolved with this record as the evidence.

### D-3 — Native origin h2 was optioned, then executed by AD-81

This decision shipped no code: native h2 stayed optioned behind a
consumer. The option was exercised the same day —
[AD-81](2026-10-09_AD81_NATIVE_HTTP2.md) lands the four pieces below as
an opt-in TLS mode (`TLSServerOptions` + `BLUE_TLS_*` env); the
edge-terminated plaintext default is unchanged.

1. **TLS surface first** — `tls?: { key, cert, ca?, minVersion, ciphers }`
   on `HTTPServerOptions`; nothing listens securely today.
2. **`http2.createSecureServer({ allowHTTP1: true })`** — ALPN negotiates
   h2/h1.1 on one port; Node's compatibility layer presents h2 streams
   through the same `req`/`res` shape, so `NodeRequest`, request limits and
   the dispatcher pipeline are expected to survive unchanged (verified by
   probe before any commitment).
3. **WebSockets fall back to h1.1** — no RFC 8441 in `ws`/browsers; socket
   endpoints require the h1.1 ALPN path, so `allowHTTP1` is mandatory, not
   cosmetic.
4. **Outbound h2 is out of scope** until undici's client h2 stabilizes.

HTTP/3 in-process is never contemplated: Node core has no QUIC listener;
h3 belongs to the edge/CDN by construction.

## Alternatives considered

- **Build native h2 now (Scope B)**: no consumer exists; requires the TLS
  surface (cert/key management, audited cipher/min-version policy —
  security surface the framework does not currently own), the ws
  fallback complexity, and delivers no user-visible benefit behind an
  edge that already terminates h2. Rejected — matches the review's "watch"
  rating; recorded as D-3 so the option costs nothing to revisit.
- **Declare HTTP/3 supported**: impossible in-process (no QUIC in Node).
  Rejected — would be false documentation.
- **Hairpin TLS at the app (self-signed/cert-bundling guidance)**: doubles
  the security surface (cert rotation, revocation) for zero benefit over
  the edge and fights the AD-37 posture. Rejected.

## Consequences

- Deployments must place a TLS-terminating proxy/LB/CDN in front of the
  origin; `trustedProxies`/`BLUE_TRUSTED_PROXIES` becomes a required
  production configuration (it was already the documented mechanism).
- No API change; no new dependency; `pnpm build/test/lint` unaffected —
  this is a decision-and-documentation change only.
- Socket/STOMP endpoints keep working through the edge as long as the
  proxy passes `Upgrade` through (nginx/caddy/haproxy do); an h2-only edge
  config that refuses h1.1 fallback will break upgrades — documented in
  guide 01 §8.
- WebSocket-free h2-only clients (browser pages) never notice the origin
  hop: they see h2 to the edge either way.

## Risks

- **Plaintext origin exposed**: if an operator binds the origin to a public
  interface without the edge, traffic is unencrypted. Mitigated by the
  loopback default and the guide's explicit "bind loopback, put the edge
  in front" instruction.
- **Trusted-proxy misconfiguration** (inherited from AD-37): if an attacker
  can inject `X-Forwarded-For` and the origin trusts it, identity-based
  limits (rate limiting, auth) are spoofable. The AD-37 allowlist rules
  apply unchanged; the new section does not widen them.
- **SSE over the hop**: long-lived streams must survive proxy idle timeouts;
  that is an edge configuration concern, called out in guide 01 §8.

## References

- `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6 GAP-12 row
  ("watch: document edge termination as the supported pattern"), §8
  Wave-6 deferral, the 2026-10-06 review's W2 (same wording).
- AD-37 (`docs/decisions/2026-09-28_AD37_TRUSTED_PROXY.md`) — the
  identity-across-the-edge seam this posture relies on.
- Node.js docs: `node:http2` `createSecureServer` + `allowHTTP1` ALPN
  behavior; `ws` upgrade support is h1.1-only (no RFC 8441).
- Applied at: `docs/guides/01-building-a-node-api.md` §8,
  `packages/blue-platform-node/src/http-server.ts` module TSDoc.
