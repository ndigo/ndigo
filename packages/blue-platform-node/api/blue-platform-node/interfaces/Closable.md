[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / Closable

# Interface: Closable

A resource with a closeable lifecycle, e.g. an [HTTPServer](../classes/HTTPServer.md).

## Methods

### close()

> **close**(): `void` \| `Promise`\<`void`\>

Close the resource. May be async; it is awaited during shutdown.

#### Returns

`void` \| `Promise`\<`void`\>
