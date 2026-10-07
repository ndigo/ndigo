[**@blue/router v0.0.1**](../README.md)

***

[@blue/router](../README.md) / RouterErrorHandler

# Type Alias: RouterErrorHandler

> **RouterErrorHandler** = (`error`, `route`) => `void`

Invoked when a navigation's interceptor pipeline throws or an
`afterCompletion` hook rejects. Lets routers surface failures instead of
swallowing them (PWB-REV-015).

## Parameters

### error

`unknown`

The error raised by the pipeline.

### route

[`Route`](../interfaces/Route.md)

The route whose navigation failed.

## Returns

`void`

## Since

1.0.0
