[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / ViewResolver

# Interface: ViewResolver

Resolves a view name to a concrete [View](View.md) instance.

## Methods

### resolveViewName()

> **resolveViewName**(`name`, `language?`, `request?`): `Promise`\<[`View`](View.md) \| `null`\>

Resolves the requested view name.

#### Parameters

##### name

`string`

The view name to resolve.

##### language?

`unknown`

Optional locale or language hint used during resolution.

##### request?

`unknown`

Optional per-call request (typically the route) carrying
  request-scoped data such as the `Accept` header or path extension.
  Threaded explicitly by the dispatcher so negotiation never relies on
  shared process state; resolvers that do not negotiate ignore it.

#### Returns

`Promise`\<[`View`](View.md) \| `null`\>

A promise that resolves to the matching view, or `null` when none is available.
