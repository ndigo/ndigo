[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-request](../README.md) / NODE\_INCOMING\_ATTRIBUTE

# Variable: NODE\_INCOMING\_ATTRIBUTE

> `const` **NODE\_INCOMING\_ATTRIBUTE**: `"__node:incoming"` = `'__node:incoming'`

Well-known route attribute key under which the raw `IncomingMessage` is
stored. Handlers that own the transport (MCP Streamable HTTP, raw SSE) need
the Node request object, which the parsed [NodeRequest](../interfaces/NodeRequest.md) cannot
substitute for.
