[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [run-node-application](../README.md) / NodeApplication

# Interface: NodeApplication

A booted Node application: the refreshed context, the started server, the
bound port, and a programmatic teardown.

## Properties

### context

> `readonly` **context**: `ConfigurableApplicationContext`

The refreshed context — every bean stays reachable.

***

### port

> `readonly` **port**: `number`

The bound port (the ephemeral port when `port: 0` was requested).

***

### server

> `readonly` **server**: [`HTTPServer`](../../http-server/classes/HTTPServer.md)

The started managed server.

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Closes the server, the extra resources, and the context. Idempotent.

#### Returns

`Promise`\<`void`\>
