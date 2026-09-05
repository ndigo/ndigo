[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / FeatureContextMountManager

# Class: FeatureContextMountManager

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:108](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-108)

Creates, tracks, and tears down mounted feature contexts.

## Constructors

### Constructor

> **new FeatureContextMountManager**(`parent`, `options?`): `FeatureContextMountManager`

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:113](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-113)

#### Parameters

##### parent

[`ApplicationContext`](../interfaces/ApplicationContext.md)

##### options?

[`FeatureContextMountManagerOptions`](../interfaces/FeatureContextMountManagerOptions.md) = `{}`

#### Returns

`FeatureContextMountManager`

## Methods

### registerFeature()

> **registerFeature**(`options`): `this`

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:119](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-119)

#### Parameters

##### options

[`FeatureRegistrationOptions`](../interfaces/FeatureRegistrationOptions.md)

#### Returns

`this`

***

### mount()

> **mount**(`name`): [`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:132](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-132)

#### Parameters

##### name

`string`

#### Returns

[`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)

***

### mountLazy()

> **mountLazy**(`name`): `Promise`\<[`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)\>

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:184](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-184)

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

`Promise`\<[`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)\>

A promise resolving to the feature context composition.

#### Throws

If the feature has no `loader` registered.

#### Throws

If the loader rejects or `createContext` throws.

***

### remountLazy()

> **remountLazy**(`name`, `policy?`): `Promise`\<[`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)\>

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:227](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-227)

Unmount and re-mount a feature, re-executing its loader.
Useful for retrying after a failed load.

#### Parameters

##### name

`string`

##### policy?

[`FeatureUnmountPolicy`](../type-aliases/FeatureUnmountPolicy.md)

#### Returns

`Promise`\<[`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)\>

***

### unmount()

> **unmount**(`name`, `policy?`): `boolean`

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:232](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-232)

#### Parameters

##### name

`string`

##### policy?

[`FeatureUnmountPolicy`](../type-aliases/FeatureUnmountPolicy.md)

#### Returns

`boolean`

***

### hasRegistration()

> **hasRegistration**(`name`): `boolean`

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:252](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-252)

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### isMounted()

> **isMounted**(`name`): `boolean`

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:256](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-256)

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### getMountedFeature()

> **getMountedFeature**(`name`): [`FeatureContextComposition`](../interfaces/FeatureContextComposition.md) \| `undefined`

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:277](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-277)

#### Parameters

##### name

`string`

#### Returns

[`FeatureContextComposition`](../interfaces/FeatureContextComposition.md) \| `undefined`

***

### destroy()

> **destroy**(): `void`

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:281](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-281)

#### Returns

`void`
