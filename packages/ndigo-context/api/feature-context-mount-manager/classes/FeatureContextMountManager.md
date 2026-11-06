[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [feature-context-mount-manager](../README.md) / FeatureContextMountManager

# Class: FeatureContextMountManager

Creates, tracks, and tears down mounted feature contexts.

## Constructors

### Constructor

> **new FeatureContextMountManager**(`parent`, `options?`): `FeatureContextMountManager`

#### Parameters

##### parent

[`ApplicationContext`](../../context-interfaces/interfaces/ApplicationContext.md)

##### options?

[`FeatureContextMountManagerOptions`](../interfaces/FeatureContextMountManagerOptions.md) = `{}`

#### Returns

`FeatureContextMountManager`

## Methods

### destroy()

> **destroy**(): `void`

#### Returns

`void`

***

### getMountedFeature()

> **getMountedFeature**(`name`): [`FeatureContextComposition`](../../context-hierarchy/interfaces/FeatureContextComposition.md) \| `undefined`

#### Parameters

##### name

`string`

#### Returns

[`FeatureContextComposition`](../../context-hierarchy/interfaces/FeatureContextComposition.md) \| `undefined`

***

### hasRegistration()

> **hasRegistration**(`name`): `boolean`

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### isMounted()

> **isMounted**(`name`): `boolean`

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### mount()

> **mount**(`name`): [`FeatureContextComposition`](../../context-hierarchy/interfaces/FeatureContextComposition.md)

#### Parameters

##### name

`string`

#### Returns

[`FeatureContextComposition`](../../context-hierarchy/interfaces/FeatureContextComposition.md)

***

### mountLazy()

> **mountLazy**(`name`): `Promise`\<[`FeatureContextComposition`](../../context-hierarchy/interfaces/FeatureContextComposition.md)\>

Mount a feature whose context is loaded dynamically via its registered `loader`.

For features registered with a static `createContext`, use [mount](#mount) instead.

If the feature has already been loaded and mounted, returns the existing composition.
If a load is already in progress, awaits that same promise (deduplication).
Failed loads are retried on the next call — the error state is cleared.

#### Parameters

##### name

`string`

The registered feature name.

#### Returns

`Promise`\<[`FeatureContextComposition`](../../context-hierarchy/interfaces/FeatureContextComposition.md)\>

A promise resolving to the feature context composition.

#### Throws

If the feature has no `loader` registered.

#### Throws

If the loader rejects or `createContext` throws.

***

### registerFeature()

> **registerFeature**(`options`): `this`

#### Parameters

##### options

[`FeatureRegistrationOptions`](../interfaces/FeatureRegistrationOptions.md)

#### Returns

`this`

***

### remountLazy()

> **remountLazy**(`name`, `policy?`): `Promise`\<[`FeatureContextComposition`](../../context-hierarchy/interfaces/FeatureContextComposition.md)\>

Unmount and re-mount a feature, re-executing its loader.
Useful for retrying after a failed load.

#### Parameters

##### name

`string`

##### policy?

[`FeatureUnmountPolicy`](../../context-hierarchy/type-aliases/FeatureUnmountPolicy.md)

#### Returns

`Promise`\<[`FeatureContextComposition`](../../context-hierarchy/interfaces/FeatureContextComposition.md)\>

***

### unmount()

> **unmount**(`name`, `policy?`): `boolean`

#### Parameters

##### name

`string`

##### policy?

[`FeatureUnmountPolicy`](../../context-hierarchy/type-aliases/FeatureUnmountPolicy.md)

#### Returns

`boolean`

***

### unregister()

> **unregister**(`name`): `boolean`

Unmount (close policy) a feature and remove its registration entirely.

#### Parameters

##### name

`string`

The registered feature name.

#### Returns

`boolean`

`true` if a registration was removed.
