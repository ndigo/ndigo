[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [router](../README.md) / Router

# Interface: Router

Defines the core interface for a router, providing access to the current route and a mechanism to refresh it.

## Properties

### callback

> `readonly` **callback**: [`RouterCallback`](../type-aliases/RouterCallback.md)

Invoked when the route changes.

***

### route

> `readonly` **route**: `string`

The current route path.

## Methods

### navigate()?

> `optional` **navigate**(`path`): `boolean` \| `void` \| `Promise`\<`void`\>

Programmatically navigates the router to the given path.

Implementations that support programmatic navigation (e.g., `PartitionRouter`, `HashRouter`)
should provide this method. When absent, callers should fall back to platform-specific
navigation (e.g., `history.pushState`).

#### Parameters

##### path

`string`

The target path to navigate to.

#### Returns

`boolean` \| `void` \| `Promise`\<`void`\>

`void`, `boolean` (whether a mount matched), or a `Promise<void>` depending on the implementation.

***

### refresh()

> **refresh**(): `void`

Re-evaluates the current route.

#### Returns

`void`
