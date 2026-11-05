[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-http-server-adapter](../README.md) / SocketRequestAuthenticator

# Interface: SocketRequestAuthenticator

Upgrade-time identity provider for socket endpoints.

The returned bag is merged into `session.attributes`. Returning `null`
rejects the upgrade with `1008` (policy violation). Socket handlers
marked `@authenticated`/`@authorized` additionally require the bag to
carry a `principal` with a `hasRole(role)` method — authentication or
authorization failures close the socket with `1008`.

[NodeHTTPServerAdapterOptions.authenticate](NodeHTTPServerAdapterOptions.md#authenticate) is the direct wiring;
`HTTPServer` also resolves an application-context bean named
`socketRequestAuthenticator` implementing this interface, so bean-based
applications wire identity without constructing the adapter.

## Methods

### authenticate()

> **authenticate**(`sources`): `Record`\<`string`, `unknown`\> \| `Promise`\<`Record`\<`string`, `unknown`\> \| `null`\> \| `null`

Authenticates an accepted WebSocket upgrade from its request sources.

#### Parameters

##### sources

`SocketRequestSources`

Query parameters, headers, and cookies captured from the handshake.

#### Returns

`Record`\<`string`, `unknown`\> \| `Promise`\<`Record`\<`string`, `unknown`\> \| `null`\> \| `null`

The attribute bag to merge into `session.attributes`, or `null` to reject the upgrade with `1008`.
