[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-request](../README.md) / getNodeResponse

# Function: getNodeResponse()

> **getNodeResponse**(`route`): `ServerResponse`\<`IncomingMessage`\> \| `undefined`

Reads the Node `ServerResponse` the HTTP server adapter stored on the route.

## Parameters

### route

[`Route`](#)

The route being handled.

## Returns

`ServerResponse`\<`IncomingMessage`\> \| `undefined`

The response, or `undefined` outside an HTTP dispatch.
