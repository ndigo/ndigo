[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / ViewResolver

# Interface: ViewResolver

Defined in: packages/blue-view/src/view-resolver.ts:18

Resolves a view name to a concrete [View](View.md) instance.

## Methods

### resolveViewName()

> **resolveViewName**(`name`, `language?`): `Promise`\<[`View`](View.md) \| `null`\>

Defined in: packages/blue-view/src/view-resolver.ts:26

Resolves the requested view name.

#### Parameters

##### name

`string`

The view name to resolve.

##### language?

`any`

Optional locale or language hint used during resolution.

#### Returns

`Promise`\<[`View`](View.md) \| `null`\>

A promise that resolves to the matching view, or `null` when none is available.
