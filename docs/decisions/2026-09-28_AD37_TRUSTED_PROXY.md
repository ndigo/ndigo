# AD-37: Trusted proxy client-IP resolution

**Date:** 2026-09-28
**Status:** Ratified — implementation in
[`docs/plans/2026-09-28_TRUSTED_PROXY.md`](../plans/2026-09-28_TRUSTED_PROXY.md)
**Closes:** the "Trusted-proxy / client-IP handling" Tier-2 gap in
[`docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md`](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md)
§2.2 and the SEC-6 rate-limit keying caveat (limiter keys on the socket
address; proxy deployments share one bucket).

## Background

`NodeRequest.remoteAddress` carried the raw socket address only
(`req.socket.remoteAddress`); `X-Forwarded-For` was deliberately never
consulted because trusting it unconditionally is a spoofing hole. The
industry question — is XFF still the standard answer, or is something
better? — was researched against primary sources before this AD:

- **X-Forwarded-For is the de facto standard**, predating the frameworks that standardised it (Squid 1998) and emitted by every proxy/CDN/load balancer. MDN documents it as
  the reference implementation of client-IP propagation, including the
  security rules ([MDN X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For)).
- **RFC 7239 `Forwarded` is the IETF-standardized successor** (2014;
  `for=` node identifiers, obfuscated identifiers, ports) but is "much
  less frequently used" (MDN) — nginx needs an optional module and most
  infrastructure emits XFF.
- **The ecosystem algorithm is a chain walk**: Rails
  `ActionDispatch::RemoteIp` ([source](https://github.com/rails/rails/blob/main/actionpack/lib/action_dispatch/middleware/remote_ip.rb))
  "remove[s] known and trusted proxies, then take[s] the last address
  left". MDN's "trusted proxy list" method is the same walk. Fastify
  **v5 deprecated hop-count trust** ("cannot validate the immediate peer
  and lets direct clients spoof `X-Forwarded-*` values. Use an IP/CIDR
  string, array, or custom function that validates the proxy address
  instead" — [Fastify server docs](https://fastify.dev/docs/latest/Reference/Server/#trustproxy)).

This AD adopts exactly that: an explicit allowlist of trusted proxy
addresses, and the header honored only when the **direct socket peer**
belongs to it.

## Decisions

### D-1 — Explicit allowlist, empty by default: trust nobody

`trustedProxies` (IP literal or CIDR prefix, IPv4/IPv6) on
`NodeHTTPServerAdapterOptions` / `HTTPServerOptions`, plus the
`NDIGO_TRUSTED_PROXIES` env var (comma-separated) for deploy-time config.
Empty default: the socket address stands and the header is never read.

Deliberate deviation from Rails, whose default trusts private ranges
(`127.0.0.0/8`, `10.0.0.0/8`, …) and documents the spoofing hazard when
no proxy is present. Naming the proxies is explicit deploy knowledge; a
default that silently trusts any direct loopback/private client is a
misconfiguration-shaped spoofing hole. No `*` wildcard (trust everyone)
for the same reason.

Malformed entries (hostnames, ports, out-of-range prefixes, ambiguous
leading-zero octets) fail **loud at construction** — a typo must never
silently narrow the trusted set.

### D-2 — Peer-gated rightmost-first chain walk (the MDN/Rails algorithm)

1. No trusted proxies configured → peer.
2. Direct peer **not** in the set → peer (the header is attacker input;
   MDN: if the server can be reached directly, no part of XFF is
   trustworthy).
3. Peer trusted → walk the header **rightmost-first** (the proxy closest
   to the server appends last), skipping entries that match the trusted
   set; the first remaining entry that is a **valid IP literal** is the
   client.
    - Malformed entries are skipped, never attributed (Rails sanitizes
      before walking; MDN: spoofed values may not be real addresses).
    - Empty, missing, or all-trusted chains fall back to the peer.
    - Leftmost client-supplied values can never win: they are only reached
      after every entry right of them proved to be a trusted hop.

Deliberately **not** using trusted-proxy _count_ (hop-count) trust:
Fastify v5 removed it because it cannot validate the immediate peer.

### D-3 — `X-Forwarded-For` only; no RFC 7239 `Forwarded`, no `Client-Ip`

XFF is what nginx/HAProxy/CDNs emit; `Forwarded` is standardized but
rarely produced, and `Client-Ip` is a Rails/Rack-ism. `Forwarded` is a
documented extension path: the same walk over `for=` node identifiers
(observing ports, obfuscated `_` identifiers, and `unknown` per RFC 7239
§6), when a real deployment needs it. `X-Forwarded-Proto`/`-Host`
rewriting remains out of scope (see the SECURITY_HEADERS plan notes).

### D-4 — Header read through `@ndigo/http`'s headers module

Resolution uses the repo's own headers module (`HTTPHeader` /
`X_FORWARDED_FOR.getJoined`), which joins repeated header lines into one
chain — MDN's required parsing rule; Node surfaces repeated lines as
`string[]` record values. The resolver's contract is the node
`IncomingMessage` record shape (`NodeRequest['headers']`).

### D-5 — Type: `TrustedProxySet implements Matchable<string>`

The set implements `@ndigo/core`'s `Matchable<TValue>` (`matches(value):
boolean`) — the value-matching half of the core matcher family. It does
**not** implement `PatternMatcher` / `PathMatcher` / `URLMatcher`: those
match a caller-supplied pattern against a value, while the set _owns_ its
entries (patterns are constructor state). Forces a useless pattern
parameter and implies polymorphic pattern matching that no consumer
performs.

### D-6 — Resolution replaces the socket address in `NodeRequest.remoteAddress`

The adapter resolves once per request; the rate limiter (SEC-6 Wave 3
keying), session/auth work, and any handler reading `remoteAddress`
inherit the real client IP. IPv4-mapped IPv6 spellings (`::ffff:a.b.c.d`)
normalize — Node reports dual-stack IPv4 peers in mapped form.

## Security posture

- **Spoofing**: a direct client cannot influence the resolved address —
  the header is only read from a trusted peer, and the trusted peer is
  the one that appended the rightmost entry.
- **Bounded work**: the header is parsed only after the peer proves
  trusted, and total header size is already capped by
  `HTTPRequestLimits.maxHeaderBytes` (16 KiB default) — the MDN memory-
  exhaustion concern is bounded by the request pipeline.
- **Fail-closed**: unknowns (no config, untrusted peer, empty chain,
  all-trusted chain, malformed entries) never fabricate an address — the
  peer stands.
- **Operational**: `NDIGO_TRUSTED_PROXIES` lets DevOps configure the trust
  boundary without app code changes; the option wins over the env when an
  app pins its own topology.

## References

- MDN — [`X-Forwarded-For`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For)
  (de facto standard; security rules; parsing and selection algorithms)
- [RFC 7239](https://www.rfc-editor.org/rfc/rfc7239.txt) — Forwarded HTTP
  Extension (IETF Standards Track, 2014)
- Rails — [`ActionDispatch::RemoteIp`](https://github.com/rails/rails/blob/main/actionpack/lib/action_dispatch/middleware/remote_ip.rb)
  (chain-walk precedent; spoofing-check rationale)
- Fastify — [server `trustProxy`](https://fastify.dev/docs/latest/Reference/Server/#trustproxy)
  (v5 hop-count deprecation; IP/CIDR validation mandate)
