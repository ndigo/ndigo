[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / NODE\_REQUEST\_ATTRIBUTE

# Variable: NODE\_REQUEST\_ATTRIBUTE

> `const` **NODE\_REQUEST\_ATTRIBUTE**: `"__node:request"` = `'__node:request'`

Defined in: [packages/blue-platform-node/src/node-request.ts:11](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-request.ts#lines-11)

Well-known route attribute key under which the Node.js request context is stored.
Middleware must place a [NodeRequest](../interfaces/NodeRequest.md) at this key before dispatching.
