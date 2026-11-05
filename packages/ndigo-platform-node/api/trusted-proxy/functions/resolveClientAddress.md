[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [trusted-proxy](../README.md) / resolveClientAddress

# Function: resolveClientAddress()

> **resolveClientAddress**(`peer`, `headers`, `trustedProxies`): `string` \| `undefined`

Resolves the client address of a request, honoring `X-Forwarded-For`
only from trusted proxies (AD-37).

- No trusted proxies configured → the socket peer is returned and the
  header is never read (spoof-proof default).
- The direct peer is not trusted → the peer is returned; the header is
  attacker input and is ignored (MDN: if the server can be reached
  directly, no part of XFF is trustworthy).
- The peer is trusted → the header chain is walked rightmost-first,
  skipping hops that match the trusted set; the first non-trusted valid
  IP literal is the client. Malformed entries are skipped, never
  attributed. Empty, missing, or all-trusted chains fall back to the
  peer.

## Parameters

### peer

`string` \| `undefined`

The direct socket address (`req.socket.remoteAddress`).

### headers

`Record`\<`string`, `string` \| `string`[] \| `undefined`\>

The request headers in the node `IncomingMessage`
record shape (`NodeRequest['headers']`); repeated header lines arrive as
`string[]` values and are joined into one chain (MDN parsing
requirement) by `@ndigo/http`'s `X_FORWARDED_FOR`.

### trustedProxies

[`TrustedProxySet`](../classes/TrustedProxySet.md)

The configured trusted-proxy allowlist
(`Matchable<string>` membership test).

## Returns

`string` \| `undefined`

The resolved client address, or `undefined` when no peer exists.
