[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / NodeHTTPServerAdapter

# Class: NodeHTTPServerAdapter

Defined in: [packages/blue-platform-node/src/node-http-server-adapter.ts:61](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-http-server-adapter.ts#lines-61)

Default HTTP server adapter using raw `node:http`.

## Example

```ts
const adapter = new NodeHTTPServerAdapter(dispatcher);
await adapter.listen(3000);
```

## Implements

- [`HTTPServerAdapter`](../interfaces/HTTPServerAdapter.md)

## Constructors

### Constructor

> **new NodeHTTPServerAdapter**(`dispatcher`, `options?`): `NodeHTTPServerAdapter`

Defined in: [packages/blue-platform-node/src/node-http-server-adapter.ts:74](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-http-server-adapter.ts#lines-74)

#### Parameters

##### dispatcher

[`NodeDispatcher`](NodeDispatcher.md)

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

Defined in: [packages/blue-platform-node/src/node-http-server-adapter.ts:66](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-http-server-adapter.ts#lines-66)

The underlying server instance (for integration tests, etc.).

##### Returns

`unknown`

The underlying server instance (for integration tests, etc.).

#### Implementation of

[`HTTPServerAdapter`](../interfaces/HTTPServerAdapter.md).[`server`](../interfaces/HTTPServerAdapter.md#server)

## Methods

### listen()

> **listen**(`port`, `host?`): `Promise`\<`void`\>

Defined in: [packages/blue-platform-node/src/node-http-server-adapter.ts:84](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-http-server-adapter.ts#lines-84)

Binds the server. Rejects on bind errors (port in use, bad host, …)
instead of resolving silently.

#### Parameters

##### port

`number`

##### host?

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`HTTPServerAdapter`](../interfaces/HTTPServerAdapter.md).[`listen`](../interfaces/HTTPServerAdapter.md#listen)

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [packages/blue-platform-node/src/node-http-server-adapter.ts:111](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-http-server-adapter.ts#lines-111)

Stops the server gracefully: stop accepting new connections, then wait
up to `shutdownTimeoutMs` for in-flight requests to drain before
destroying remaining sockets.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`HTTPServerAdapter`](../interfaces/HTTPServerAdapter.md).[`close`](../interfaces/HTTPServerAdapter.md#close)

***

### handleRequest()

> **handleRequest**(`req`, `res`): `Promise`\<`void`\>

Defined in: [packages/blue-platform-node/src/node-http-server-adapter.ts:125](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-http-server-adapter.ts#lines-125)

#### Parameters

##### req

`IncomingMessage`

##### res

`ServerResponse`

#### Returns

`Promise`\<`void`\>
