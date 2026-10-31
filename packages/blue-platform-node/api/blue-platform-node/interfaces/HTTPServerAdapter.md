[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / HTTPServerAdapter

# Interface: HTTPServerAdapter

Adapter interface for platform HTTP servers.
The default implementation wraps `node:http.createServer()`.

## Properties

### server

> `readonly` **server**: `unknown`

The underlying server instance (for integration tests, etc.).

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Stop the server gracefully.

#### Returns

`Promise`\<`void`\>

***

### listen()

> **listen**(`port`, `host?`): `Promise`\<`void`\>

Start listening on the given port and host.

#### Parameters

##### port

`number`

##### host?

`string`

#### Returns

`Promise`\<`void`\>
