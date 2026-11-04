[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / HTTPServerOptions

# Interface: HTTPServerOptions

Options for creating an [HTTPServer](../classes/HTTPServer.md).

## Properties

### adapter?

> `optional` **adapter?**: [`HTTPServerAdapter`](HTTPServerAdapter.md)

Custom adapter. Defaults to `NodeHTTPServerAdapter`.

***

### allowedWebSocketOrigins?

> `optional` **allowedWebSocketOrigins?**: `string`[]

WebSocket Origin allowlist handed to the default adapter. When
omitted, env `NDIGO_SOCKET_ALLOWED_ORIGINS` (comma-separated bare
origins) is honored; absent both, any origin may upgrade (public
socket endpoints).

***

### authenticate?

> `optional` **authenticate?**: (`sources`) => `Record`\<`string`, `unknown`\> \| `Promise`\<`Record`\<`string`, `unknown`\> \| `null`\> \| `null`

Upgrade-time authentication hook for the default adapter — see
[NodeHTTPServerAdapterOptions.authenticate](NodeHTTPServerAdapterOptions.md#authenticate). When omitted, the
default adapter uses the application-context
`socketRequestAuthenticator` bean.

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

Milliseconds the default adapter waits for its authentication hook —
see [NodeHTTPServerAdapterOptions.authenticateTimeoutMs](NodeHTTPServerAdapterOptions.md#authenticatetimeoutms).

***

### host?

> `optional` **host?**: `string`

Host to bind to. Defaults to `'127.0.0.1'`.

***

### maxConnections?

> `optional` **maxConnections?**: `number`

Maximum concurrent socket connections for the default adapter — see
[NodeHTTPServerAdapterOptions.maxConnections](NodeHTTPServerAdapterOptions.md#maxconnections).

***

### port?

> `optional` **port?**: `number`

TCP port to listen on. Defaults to `3000` or `process.env.PORT`.

***

### socketLimits?

> `optional` **socketLimits?**: [`SocketLimits`](SocketLimits.md)

Socket transport bounds (frame payload, inbound queue cap). When
omitted, env `NDIGO_SOCKET_MAX_PAYLOAD_BYTES` / `NDIGO_SOCKET_MAX_QUEUED_MESSAGES`
are honored by the default adapter.

***

### socketRegistry?

> `optional` **socketRegistry?**: [`NodeSocketSessionRegistry`](../classes/NodeSocketSessionRegistry.md)

Socket session registry shared with the default adapter (AD-21 D4).
When omitted, the registry is resolved from the application context
(`socketSessionRegistry` bean) at start, falling back to a fresh
instance — so broadcasts from the bean reach the adapter's sessions.

***

### tls?

> `optional` **tls?**: [`TLSServerOptions`](TLSServerOptions.md)

TLS material for the default adapter (AD-81). When set, the origin
listener is an `http2.createSecureServer` in `allowHTTP1` mode:
ALPN negotiates `h2` with an HTTP/1.1 fallback, and WebSocket
upgrades keep working over the h1.1 path (RFC 8441 is not
implemented by `ws` or browsers — WebSockets cannot ride h2).
Ignored when a custom [HTTPServerOptions.adapter](#adapter) is passed.

Env fallback when omitted: `NDIGO_TLS_KEY` + `NDIGO_TLS_CERT` (both
required together — a half-configured pair throws rather than
silently serving plaintext) and optional `NDIGO_TLS_CA`. Blank env
values count as unset, and the env is consulted for the default
adapter only — a custom [HTTPServerOptions.adapter](#adapter) is never
TLS-configured through it (REV-102).

***

### trustedProxies?

> `optional` **trustedProxies?**: `string`[]

Trusted-proxy allowlist handed to the default adapter (AD-37): IP
literals and CIDR prefixes (IPv4/IPv6) whose `X-Forwarded-For`
header the server may believe. Env-tunable via `NDIGO_TRUSTED_PROXIES`
(comma-separated) when the option is absent; an explicit option wins
over the env. Empty = trust nobody: the socket address stands and
the header is never consulted.
