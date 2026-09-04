[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / HTTPServerOptions

# Interface: HTTPServerOptions

Defined in: packages/blue-platform-node/src/http-server.ts:30

Options for creating an [HTTPServer](../classes/HTTPServer.md).

## Properties

### port?

> `optional` **port?**: `number`

Defined in: packages/blue-platform-node/src/http-server.ts:32

TCP port to listen on. Defaults to `3000` or `process.env.PORT`.

***

### host?

> `optional` **host?**: `string`

Defined in: packages/blue-platform-node/src/http-server.ts:34

Host to bind to. Defaults to `'127.0.0.1'`.

***

### adapter?

> `optional` **adapter?**: [`HTTPServerAdapter`](HTTPServerAdapter.md)

Defined in: packages/blue-platform-node/src/http-server.ts:36

Custom adapter. Defaults to `NodeHTTPServerAdapter`.
