[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / FeatureRegistrationOptions

# Interface: FeatureRegistrationOptions

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:42](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-42)

Options used to register a feature for mounting.

## Extends

- [`FeatureContextOptions`](FeatureContextOptions.md)

## Properties

### createContext?

> `optional` **createContext?**: (`parent`) => [`ApplicationContext`](ApplicationContext.md)

Defined in: [packages/blue-context/src/context-hierarchy.ts:48](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context-hierarchy.ts#lines-48)

Creates the feature context instead of using `parent.newChild`.

#### Parameters

##### parent

[`ApplicationContext`](ApplicationContext.md)

#### Returns

[`ApplicationContext`](ApplicationContext.md)

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`createContext`](FeatureContextOptions.md#createcontext)

***

### name

> **name**: `string`

Defined in: [packages/blue-context/src/context-hierarchy.ts:52](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context-hierarchy.ts#lines-52)

The feature context name.

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`name`](FeatureContextOptions.md#name)

***

### data?

> `optional` **data?**: `JSONObject`

Defined in: [packages/blue-context/src/context-hierarchy.ts:56](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context-hierarchy.ts#lines-56)

Initial values for the feature context.

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`data`](FeatureContextOptions.md#data)

***

### gatewayOptions?

> `optional` **gatewayOptions?**: [`ContextEventGatewayOptions`](ContextEventGatewayOptions.md)

Defined in: [packages/blue-context/src/context-hierarchy.ts:60](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context-hierarchy.ts#lines-60)

Relay gateway validation options.

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`gatewayOptions`](FeatureContextOptions.md#gatewayoptions)

***

### relayTarget?

> `optional` **relayTarget?**: [`ApplicationContext`](ApplicationContext.md)

Defined in: [packages/blue-context/src/context-hierarchy.ts:64](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context-hierarchy.ts#lines-64)

Optional relay target context.

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`relayTarget`](FeatureContextOptions.md#relaytarget)

***

### relays?

> `optional` **relays?**: [`ContextEventRelay`](ContextEventRelay.md)[]

Defined in: [packages/blue-context/src/context-hierarchy.ts:68](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/context-hierarchy.ts#lines-68)

Event relays to attach to the feature context.

#### Inherited from

[`FeatureContextOptions`](FeatureContextOptions.md).[`relays`](FeatureContextOptions.md#relays)

***

### unmountPolicy?

> `optional` **unmountPolicy?**: [`FeatureUnmountPolicy`](../type-aliases/FeatureUnmountPolicy.md)

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:43](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-43)

***

### dependencies?

> `optional` **dependencies?**: `object`

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:48](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-48)

Declare dependencies this feature requires from the shell.
Validated at mount time against the SharedDependencyRegistry.

#### requires?

> `optional` **requires?**: `Record`\<`string`, `string`\>

Required dependencies — mount fails if missing or version-mismatched.

#### optional?

> `optional` **optional?**: `Record`\<`string`, `string`\>

Optional dependencies — mount warns if missing.

***

### loader?

> `optional` **loader?**: () => `Promise`\<[`LazyFeatureModule`](LazyFeatureModule.md)\>

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:68](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-68)

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
