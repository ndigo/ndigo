[**@ndigo/router v0.0.1**](../README.md)

***

[@ndigo/router](../README.md) / RouterMiddleware

# Type Alias: RouterMiddleware

> **RouterMiddleware** = (`route`) => `boolean` \| `void` \| `Promise`\<`boolean` \| `void`\>

A function signature for a router middleware, which can optionally prevent further processing.

## Parameters

### route

[`Route`](../interfaces/Route.md)

The `Route` object being processed.

## Returns

`boolean` \| `void` \| `Promise`\<`boolean` \| `void`\>

`true` to continue processing, `false` to stop, or `void` to continue by default.

## Since

1.0.0
