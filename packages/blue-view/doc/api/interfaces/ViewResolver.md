[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / ViewResolver

# Interface: ViewResolver

Resolves a view name to a concrete [View](View.md) instance.

## Methods

### resolveViewName()

> **resolveViewName**(`name`, `language?`): `Promise`\<[`View`](View.md) \| `null`\>

Resolves the requested view name.

#### Parameters

##### name

`string`

The view name to resolve.

##### language?

`unknown`

Optional locale or language hint used during resolution.

#### Returns

`Promise`\<[`View`](View.md) \| `null`\>

A promise that resolves to the matching view, or `null` when none is available.
