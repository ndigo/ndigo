[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / Router

# Interface: Router

Defined in: packages/blue-router/src/router.ts:21

Defines the core interface for a router, providing access to the current route and a mechanism to refresh it.

## Since

1.0.0

## Properties

### route

> `readonly` **route**: `string`

Defined in: packages/blue-router/src/router.ts:22

***

### callback

> `readonly` **callback**: [`RouterCallback`](../type-aliases/RouterCallback.md)

Defined in: packages/blue-router/src/router.ts:23

## Methods

### refresh()

> **refresh**(): `void`

Defined in: packages/blue-router/src/router.ts:24

#### Returns

`void`

***

### navigate()?

> `optional` **navigate**(`path`): `boolean` \| `void` \| `Promise`\<`void`\>

Defined in: packages/blue-router/src/router.ts:36

Programmatically navigates the router to the given path.

Implementations that support programmatic navigation (e.g., `SiteRouter`, `HashRouter`)
should provide this method. When absent, callers should fall back to platform-specific
navigation (e.g., `history.pushState`).

#### Parameters

##### path

`string`

The target path to navigate to.

#### Returns

`boolean` \| `void` \| `Promise`\<`void`\>

`void`, `boolean` (whether a mount matched), or a `Promise<void>` depending on the implementation.

#### Since

1.0.0
