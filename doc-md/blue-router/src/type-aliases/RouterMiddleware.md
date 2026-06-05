[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / RouterMiddleware

# Type Alias: RouterMiddleware

> **RouterMiddleware** = (`route`) => `boolean` \| `void` \| `Promise`\<`boolean` \| `void`\>

Defined in: packages/blue-router/src/router-interceptor.ts:10

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
