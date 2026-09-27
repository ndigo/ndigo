[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / RouteErrorResolver

# Interface: RouteErrorResolver

Resolves exceptions into a route-specific response.

## Methods

### resolveError()

> **resolveError**(`route`, `handler`, `error`): [`ModelAndView`](../classes/ModelAndView.md) \| `null`

Resolve a route handler error into a model and view.

#### Parameters

##### route

[`Route`](#)

The current route.

##### handler

`object` \| `null`

The handler that was executing when the error occurred, or `null`.

##### error

`Error`

The thrown error.

#### Returns

[`ModelAndView`](../classes/ModelAndView.md) \| `null`

A model and view to render, or `null` when the error should continue through the chain.
