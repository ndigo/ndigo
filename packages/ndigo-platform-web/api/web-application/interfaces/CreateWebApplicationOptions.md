[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [web-application](../README.md) / CreateWebApplicationOptions

# Interface: CreateWebApplicationOptions

Options for [createWebApplication](../functions/createWebApplication.md). Every implicit action has an
opt-out; app-specific wiring belongs in the hooks and the returned context.

## Properties

### autoNavigate?

> `optional` **autoNavigate?**: `boolean`

`true` (default) performs the first navigation.

***

### beforeNavigate?

> `optional` **beforeNavigate?**: (`app`) => `void` \| `Promise`\<`void`\>

Runs after the runtime is wired, before the first navigation.

#### Parameters

##### app

[`WebApplication`](WebApplication.md)

#### Returns

`void` \| `Promise`\<`void`\>

***

### eventMap?

> `optional` **eventMap?**: `Record`\<`string`, `string`\>

DOM event → application event map bridged by the view target.

***

### initialPath?

> `optional` **initialPath?**: `string`

First navigation path. Defaults to the path the URL currently addresses.

***

### interceptors?

> `optional` **interceptors?**: readonly `RouterInterceptor`[]

Router interceptors installed before the first navigation.

***

### name?

> `optional` **name?**: `string`

Context name. Defaults to `ndigo-web-application`.

***

### platform?

> `optional` **platform?**: `boolean`

`true` (default) registers `WebAutoConfiguration`.

***

### profiles?

> `optional` **profiles?**: readonly `string`[]

Active profiles.

***

### properties?

> `optional` **properties?**: `JSONObject`

Extra builder properties, merged above the built-in sources.

***

### root?

> `optional` **root?**: `string` \| `Element`

Element (or element id, with or without `#`) to render into. Defaults to `#app`.
