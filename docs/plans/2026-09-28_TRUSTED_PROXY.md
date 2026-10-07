# Plan — Trusted-proxy client-IP resolution (AD-37)

**Date:** 2026-09-28
**Status:** Landed — implementation complete per this plan
**Decision record:** [`docs/decisions/2026-09-28_AD37_TRUSTED_PROXY.md`](../decisions/2026-09-28_AD37_TRUSTED_PROXY.md)

## Goal

Resolve `NodeRequest.remoteAddress` to the real client when requests
arrive through operators' trusted proxies, without ever trusting
spoofable `X-Forwarded-For` values from direct peers. Closes the
gap-analysis Tier-2 row and removes the SEC-6 rate-limiter keying caveat.

## Rules (from AD-37)

- Empty allowlist = trust nobody; the socket address stands.
- Header read only when the direct socket peer is in the allowlist.
- Rightmost-first walk; skip trusted hops; first non-trusted **valid IP
  literal** is the client; malformed entries skipped; fallback = peer.
- IP literals + CIDR (IPv4/IPv6); IPv4-mapped IPv6 normalizes; malformed
  config fails loud at construction.
- Header parsing via `@blue/http` headers module (`X_FORWARDED_FOR`),
  repeated lines joined.

## Phases

1. **Resolver + unit tests** (`packages/blue-platform-node/src/trusted-proxy.ts`,
   `test/trusted-proxy.spec.ts`) — `TrustedProxySet` (allowlist,
   `implements Matchable<string>`) and `resolveClientAddress(peer,
   headers, set)`. TDD: spoofing matrix first (no config, untrusted peer,
   proxy-appended tail, trusted chains, invalid entries, IPv6/mapped
   forms, repeated header lines, CIDR boundaries).
2. **Wiring** — `NodeHTTPServerAdapterOptions.trustedProxies` +
   constructor validation; `handleRequest` resolves `remoteAddress`;
   `HTTPServerOptions.trustedProxies` + `BLUE_TRUSTED_PROXIES` env
   (comma-separated, option wins); index exports; `NodeRequest`
   JSDoc updated.
3. **Integration tests** — real `node:http` server: default posture
   ignores spoofed headers for rate-limit keying (4 different XFF values
   → 4th request 429s on the peer bucket); trusted `127.0.0.1` splits
   buckets per resolved client (A×4 → 429, B×4 → 429, independent);
   malformed allowlist fails adapter construction.
4. **Docs** — AD-37; this plan; gap-analysis rows (Tier-2 item, SEC-6
   keying note, sequencing); guide 11 §9 (new trusted-proxy section +
   deferral list); AD-33 plan as-built notes and SECURITY_HEADERS plan
   caveats re-scoped to `X-Forwarded-Proto`/`-Host` only.

## Verification

- `vitest run packages/blue-platform-node/test/trusted-proxy.spec.ts` —
  24 tests (unit matrix + 3 integration scenarios).
- Full platform-node suite green; manifest + doc-coverage gates pass;
  `oxlint --type-aware --deny-warnings` clean on touched files.

## Out of scope (documented)

- RFC 7239 `Forwarded` header parsing (extension path per AD-37 D-3).
- `X-Forwarded-Proto` / `X-Forwarded-Host` rewriting (scheme/host
  awareness stays on the SECURITY_HEADERS-plan deferral list).
- `Client-Ip` (Rails/Rack-ism; see AD-37 D-3).
