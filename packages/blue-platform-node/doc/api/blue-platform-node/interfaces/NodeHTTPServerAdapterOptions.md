[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / NodeHTTPServerAdapterOptions

# Interface: NodeHTTPServerAdapterOptions

Options for [NodeHTTPServerAdapter](../classes/NodeHTTPServerAdapter.md).

## Properties

### allowedWebSocketOrigins?

> `optional` **allowedWebSocketOrigins?**: `string`[]

When set, WebSocket upgrades must carry an `Origin` (or
`Sec-WebSocket-Origin`) header whose scheme/host/port match one of
these bare origins exactly (implicit default ports compare equal).
Upgrades from any other origin — or with no Origin header at all —
are rejected with `403` before the `connection` event fires. Omit for
public socket endpoints that must accept any client.

***

### authenticate?

> `optional` **authenticate?**: (`sources`) => `Record`\<`string`, `unknown`\> \| `Promise`\<`Record`\<`string`, `unknown`\> \| `null`\> \| `null`

Optional upgrade-time authentication hook. Invoked on every accepted
upgrade before the socket handler runs, with the request sources
(query/headers/cookies) captured from the handshake.

Returning an object populates `session.attributes` — the identity
binding point (e.g. `{ principal }`) REST handlers get via the auth
session. Returning `null` rejects the upgrade with `1008` (policy
violation). An `async` hook is awaited, up to
[NodeHTTPServerAdapterOptions.authenticateTimeoutMs](#authenticatetimeoutms). Absent,
sockets accept any client (public endpoint posture).

This is also where `@authenticated`/`@authorized` socket handlers get
the `principal` they require — see [SocketRequestAuthenticator](SocketRequestAuthenticator.md).

Authenticates an accepted WebSocket upgrade from its request sources.

#### Parameters

##### sources

`SocketRequestSources`

Query parameters, headers, and cookies captured from the handshake.

#### Returns

`Record`\<`string`, `unknown`\> \| `Promise`\<`Record`\<`string`, `unknown`\> \| `null`\> \| `null`

The attribute bag to merge into `session.attributes`, or `null` to reject the upgrade with `1008`.

***

### authenticateTimeoutMs?

> `optional` **authenticateTimeoutMs?**: `number`

Milliseconds an [NodeHTTPServerAdapterOptions.authenticate](#authenticate)
hook may take before the socket is closed with `1011` and the
session is dropped. The session is deliberately untracked while
authentication is in flight, so an identity provider that never
settles would otherwise pin the connection for the process's
lifetime. Default `10_000`.

***

### limits?

> `optional` **limits?**: [`HTTPRequestLimits`](HTTPRequestLimits.md)

Request pipeline limits/timeouts. Defaults are conservative and safe.

***

### maxConnections?

> `optional` **maxConnections?**: `number`

Maximum concurrent WebSocket connections this adapter admits, counted
from the accepted upgrade until the connection closes (so sockets
still resolving parameters or identity hold their slot). An upgrade
over the cap is closed with `1013` ("try again later") before
dispatch. Default `10_000`; `Infinity` disables the cap.

***

### multipart?

> `optional` **multipart?**: `Partial`\<[`MultipartLimits`](MultipartLimits.md)\>

Multipart parser bounds (per-file/field/part/request limits, spill
threshold), passed through to [parseMultipart](../functions/parseMultipart.md). Defaults are the
parser's 10 MiB request cap — NOTE this is independent of
[HTTPRequestLimits.maxBodyBytes](HTTPRequestLimits.md#maxbodybytes) (1 MiB default), which caps only
non-multipart bodies; align the two when one budget for every body
shape is intended.

***

### socketLimits?

> `optional` **socketLimits?**: [`SocketLimits`](SocketLimits.md)

Socket transport bounds (frame payload, inbound queue cap). Defaults
are conservative and safe; env-tunable via `BLUE_SOCKET_MAX_PAYLOAD_BYTES`
and `BLUE_SOCKET_MAX_QUEUED_MESSAGES`.

***

### socketRegistry?

> `optional` **socketRegistry?**: [`NodeSocketSessionRegistry`](../classes/NodeSocketSessionRegistry.md)

Session registry tracking open sockets (broadcast, rooms, heartbeat;
AD-21). When omitted, the adapter creates a default registry with
standard heartbeat defaults — heartbeats are on unless explicitly
disabled.

***

### tls?

> `optional` **tls?**: [`TLSServerOptions`](TLSServerOptions.md)

TLS material for the origin listener (AD-81). When set, the adapter
binds `http2.createSecureServer` with `allowHTTP1: true` — ALPN
negotiates h2 with an HTTP/1.1 fallback, and WebSocket upgrades keep
flowing over the h1.1 path (RFC 8441 is not implemented by `ws` or
browsers). Omit for the plaintext HTTP/1.1 origin.

***

### trustedProxies?

> `optional` **trustedProxies?**: `string`[]

Trusted-proxy addresses/ranges (IP literal or CIDR, IPv4/IPv6) whose
`X-Forwarded-For` header the server may believe. The direct socket
peer must match this set before the header is even read — a client
reaching the server directly can never spoof an address (AD-37).
Empty (default) trusts nobody: `NodeRequest.remoteAddress` stays the
socket address. Malformed entries (hostnames, ports, bad prefixes)
fail loud at construction.
