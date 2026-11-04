[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / FeatureRegistrationOptions

# Interface: FeatureRegistrationOptions

Options used to register a feature for mounting.

## Extends

- [`FeatureContextOptions`](FeatureContextOptions.md)

## Properties

### createContext?

> `optional` **createContext?**: (`parent`) => [`ApplicationContext`](ApplicationContext.md)

Creates the feature context instead of using `parent.newChild`.

#### Parameters

##### parent

[`ApplicationContext`](ApplicationContext.md)

#### Returns

[`ApplicationContext`](ApplicationContext.md)

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`createContext`](FeatureContextOptions.md#createcontext)

***

### data?

> `optional` **data?**: `JSONObject`

Initial values for the feature context.

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`data`](FeatureContextOptions.md#data)

***

### dependencies?

> `optional` **dependencies?**: `object`

Declare dependencies this feature requires from the shell.
Validated at mount time against the SharedDependencyRegistry.

#### optional?

> `optional` **optional?**: `Record`\<`string`, `string`\>

Optional dependencies — mount warns if missing.

#### requires?

> `optional` **requires?**: `Record`\<`string`, `string`\>

Required dependencies — mount fails if missing or version-mismatched.

***

### gatewayOptions?

> `optional` **gatewayOptions?**: [`ContextEventGatewayOptions`](ContextEventGatewayOptions.md)

Relay gateway validation options.

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`gatewayOptions`](FeatureContextOptions.md#gatewayoptions)

***

### loader?

> `optional` **loader?**: () => `Promise`\<[`LazyFeatureModule`](LazyFeatureModule.md)\>

Async loader for dynamically code-split feature modules.
Resolves to a module exporting `createContext(parent)`.
Use with `mountLazy` — mount must be awaited.

#### Returns

`Promise`\<[`LazyFeatureModule`](LazyFeatureModule.md)\>

#### Example

```ts
manager.registerFeature({
  name: 'checkout',
  loader: () => import('./checkout/checkout-module'),
});
await manager.mountLazy('checkout');
```

***

### name

> **name**: `string`

The feature context name.

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`name`](FeatureContextOptions.md#name)

***

### relays?

> `optional` **relays?**: [`ContextEventRelay`](ContextEventRelay.md)[]

Event relays to attach to the feature context.

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`relays`](FeatureContextOptions.md#relays)

***

### relayTarget?

> `optional` **relayTarget?**: [`ApplicationContext`](ApplicationContext.md)

Optional relay target context.

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`relayTarget`](FeatureContextOptions.md#relaytarget)

***

### unmountPolicy?

> `optional` **unmountPolicy?**: [`FeatureUnmountPolicy`](../type-aliases/FeatureUnmountPolicy.md)
