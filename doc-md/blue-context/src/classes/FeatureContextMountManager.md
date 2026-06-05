[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / FeatureContextMountManager

# Class: FeatureContextMountManager

Defined in: packages/blue-context/src/feature-context-mount-manager.ts:61

Creates, tracks, and tears down mounted feature contexts.

## Constructors

### Constructor

> **new FeatureContextMountManager**(`parent`, `options?`): `FeatureContextMountManager`

Defined in: packages/blue-context/src/feature-context-mount-manager.ts:66

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

Defined in: packages/blue-context/src/feature-context-mount-manager.ts:72

#### Parameters

##### options

[`FeatureRegistrationOptions`](../interfaces/FeatureRegistrationOptions.md)

#### Returns

`this`

***

### mount()

> **mount**(`name`): [`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)

Defined in: packages/blue-context/src/feature-context-mount-manager.ts:85

#### Parameters

##### name

`string`

#### Returns

[`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)

***

### remount()

> **remount**(`name`, `policy?`): [`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)

Defined in: packages/blue-context/src/feature-context-mount-manager.ts:118

#### Parameters

##### name

`string`

##### policy?

[`FeatureUnmountPolicy`](../type-aliases/FeatureUnmountPolicy.md)

#### Returns

[`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)

***

### unmount()

> **unmount**(`name`, `policy?`): `boolean`

Defined in: packages/blue-context/src/feature-context-mount-manager.ts:123

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

Defined in: packages/blue-context/src/feature-context-mount-manager.ts:143

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### isMounted()

> **isMounted**(`name`): `boolean`

Defined in: packages/blue-context/src/feature-context-mount-manager.ts:147

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### getMountedFeature()

> **getMountedFeature**(`name`): [`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)

Defined in: packages/blue-context/src/feature-context-mount-manager.ts:168

#### Parameters

##### name

`string`

#### Returns

[`FeatureContextComposition`](../interfaces/FeatureContextComposition.md)

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-context/src/feature-context-mount-manager.ts:172

#### Returns

`void`
