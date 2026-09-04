[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / NodeHTTPServerAdapter

# Class: NodeHTTPServerAdapter

Defined in: packages/blue-platform-node/src/node-http-server-adapter.ts:27

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

> **new NodeHTTPServerAdapter**(`dispatcher`): `NodeHTTPServerAdapter`

Defined in: packages/blue-platform-node/src/node-http-server-adapter.ts:38

#### Parameters

##### dispatcher

[`NodeDispatcher`](NodeDispatcher.md)

The dispatcher to invoke for each incoming request.

#### Returns

`NodeHTTPServerAdapter`

## Accessors

### server

#### Get Signature

> **get** **server**(): `unknown`

Defined in: packages/blue-platform-node/src/node-http-server-adapter.ts:31

The underlying server instance (for integration tests, etc.).

##### Returns

`unknown`

The underlying server instance (for integration tests, etc.).

#### Implementation of

[`HTTPServerAdapter`](../interfaces/HTTPServerAdapter.md).[`server`](../interfaces/HTTPServerAdapter.md#server)

## Methods

### listen()

> **listen**(`port`, `host`): `Promise`\<`void`\>

Defined in: packages/blue-platform-node/src/node-http-server-adapter.ts:43

Start listening on the given port and host.

#### Parameters

##### port

`number`

##### host

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`HTTPServerAdapter`](../interfaces/HTTPServerAdapter.md).[`listen`](../interfaces/HTTPServerAdapter.md#listen)

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: packages/blue-platform-node/src/node-http-server-adapter.ts:52

Stop the server gracefully.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`HTTPServerAdapter`](../interfaces/HTTPServerAdapter.md).[`close`](../interfaces/HTTPServerAdapter.md#close)

***

### handleRequest()

> **handleRequest**(`req`, `res`): `Promise`\<`void`\>

Defined in: packages/blue-platform-node/src/node-http-server-adapter.ts:59

#### Parameters

##### req

`IncomingMessage`

##### res

`ServerResponse`

#### Returns

`Promise`\<`void`\>
