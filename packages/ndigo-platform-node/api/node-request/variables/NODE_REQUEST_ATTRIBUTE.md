[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-request](../README.md) / NODE\_REQUEST\_ATTRIBUTE

# Variable: NODE\_REQUEST\_ATTRIBUTE

> `const` **NODE\_REQUEST\_ATTRIBUTE**: `"__node:request"` = `'__node:request'`

Well-known route attribute key under which the Node.js request context is stored.
Middleware must place a [NodeRequest](../interfaces/NodeRequest.md) at this key before dispatching.
