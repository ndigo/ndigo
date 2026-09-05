[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / HTTPServerAdapter

# Interface: HTTPServerAdapter

Defined in: [packages/blue-platform-node/src/http-server.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-server.ts#lines-18)

Adapter interface for platform HTTP servers.
The default implementation wraps `node:http.createServer()`.

## Properties

### server

> `readonly` **server**: `unknown`

Defined in: [packages/blue-platform-node/src/http-server.ts:24](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-server.ts#lines-24)

The underlying server instance (for integration tests, etc.).

## Methods

### listen()

> **listen**(`port`, `host?`): `Promise`\<`void`\>

Defined in: [packages/blue-platform-node/src/http-server.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-server.ts#lines-20)

Start listening on the given port and host.

#### Parameters

##### port

`number`

##### host?

`string`

#### Returns

`Promise`\<`void`\>

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [packages/blue-platform-node/src/http-server.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-server.ts#lines-22)

Stop the server gracefully.

#### Returns

`Promise`\<`void`\>
