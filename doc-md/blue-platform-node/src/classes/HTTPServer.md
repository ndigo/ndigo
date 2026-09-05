[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / HTTPServer

# Class: HTTPServer

Defined in: [packages/blue-platform-node/src/http-server.ts:50](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-server.ts#lines-50)

A managed HTTP server that delegates incoming requests to a [NodeDispatcher](NodeDispatcher.md).

## Example

```ts
const server = new HTTPServer(dispatcher, { port: 3000 });
await server.start();
// ... later
await server.close();
```

## Constructors

### Constructor

> **new HTTPServer**(`dispatcher`, `options?`): `HTTPServer`

Defined in: [packages/blue-platform-node/src/http-server.ts:83](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-server.ts#lines-83)

Create a new HTTP server.

#### Parameters

##### dispatcher

[`NodeDispatcher`](NodeDispatcher.md)

The dispatcher to handle incoming requests.

##### options?

[`HTTPServerOptions`](../interfaces/HTTPServerOptions.md) = `{}`

Server configuration.

#### Returns

`HTTPServer`

## Accessors

### port

#### Get Signature

> **get** **port**(): `number`

Defined in: [packages/blue-platform-node/src/http-server.ts:59](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-server.ts#lines-59)

The port the server is listening on, or `0` if not yet started.

##### Returns

`number`

***

### started

#### Get Signature

> **get** **started**(): `boolean`

Defined in: [packages/blue-platform-node/src/http-server.ts:66](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-server.ts#lines-66)

Whether the server has been started.

##### Returns

`boolean`

***

### server

#### Get Signature

> **get** **server**(): `unknown`

Defined in: [packages/blue-platform-node/src/http-server.ts:73](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-server.ts#lines-73)

The underlying adapter (e.g. the `http.Server` instance).

##### Returns

`unknown`

## Methods

### start()

> **start**(): `Promise`\<`void`\>

Defined in: [packages/blue-platform-node/src/http-server.ts:97](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-server.ts#lines-97)

Start listening. Safe to call multiple times — subsequent calls are no-ops.

#### Returns

`Promise`\<`void`\>

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [packages/blue-platform-node/src/http-server.ts:108](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-server.ts#lines-108)

Stop the server gracefully.

#### Returns

`Promise`\<`void`\>
