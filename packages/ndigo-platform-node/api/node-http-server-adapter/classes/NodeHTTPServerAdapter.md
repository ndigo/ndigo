[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-http-server-adapter](../README.md) / NodeHTTPServerAdapter

# Class: NodeHTTPServerAdapter

Default HTTP server adapter using raw `node:http`.

## Example

```ts
const adapter = new NodeHTTPServerAdapter(dispatcher);
await adapter.listen(3000);
```

## Implements

- [`HTTPServerAdapter`](../../http-server/interfaces/HTTPServerAdapter.md)

## Constructors

### Constructor

> **new NodeHTTPServerAdapter**(`dispatcher`, `options?`): `NodeHTTPServerAdapter`

Creates the adapter.

#### Parameters

##### dispatcher

[`NodeDispatcher`](../../node-dispatcher/classes/NodeDispatcher.md)

The dispatcher to invoke for each incoming request.

##### options?

[`NodeHTTPServerAdapterOptions`](../interfaces/NodeHTTPServerAdapterOptions.md) = `{}`

Optional request limits and timeouts.

#### Returns

`NodeHTTPServerAdapter`

## Accessors

### server

#### Get Signature

> **get** **server**(): `unknown`

The underlying Node server.

##### Returns

`unknown`

The underlying server instance (for integration tests, etc.).

#### Implementation of

[`HTTPServerAdapter`](../../http-server/interfaces/HTTPServerAdapter.md).[`server`](../../http-server/interfaces/HTTPServerAdapter.md#server)

***

### socketRegistry

#### Get Signature

> **get** **socketRegistry**(): [`NodeSocketSessionRegistry`](../../node-socket-session-registry/classes/NodeSocketSessionRegistry.md)

The session registry backing this adapter's sockets (broadcast, rooms,
heartbeat). Shared with the application so any service can push to a
room (AD-21 D4).

##### Returns

[`NodeSocketSessionRegistry`](../../node-socket-session-registry/classes/NodeSocketSessionRegistry.md)

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Stops the server gracefully: stop accepting new connections, then wait
up to `shutdownTimeoutMs` for in-flight requests to drain before
destroying remaining sockets.

#### Returns

`Promise`\<`void`\>

A promise that resolves once closed.

#### Implementation of

[`HTTPServerAdapter`](../../http-server/interfaces/HTTPServerAdapter.md).[`close`](../../http-server/interfaces/HTTPServerAdapter.md#close)

***

### handleRequest()

> **handleRequest**(`req`, `res`): `Promise`\<`void`\>

Handles one incoming request through the dispatch pipeline.

#### Parameters

##### req

`IncomingMessage`

The Node request.

##### res

`ServerResponse`

The Node response.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the response is written.

***

### listen()

> **listen**(`port`, `host?`): `Promise`\<`void`\>

Binds the server. Rejects on bind errors (port in use, bad host, …)
instead of resolving silently.

#### Parameters

##### port

`number`

The port to bind.

##### host?

`string`

The bind host.

#### Returns

`Promise`\<`void`\>

A promise that resolves once listening.

#### Implementation of

[`HTTPServerAdapter`](../../http-server/interfaces/HTTPServerAdapter.md).[`listen`](../../http-server/interfaces/HTTPServerAdapter.md#listen)
