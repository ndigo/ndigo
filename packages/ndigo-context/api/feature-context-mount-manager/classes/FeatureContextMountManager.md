[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [feature-context-mount-manager](../README.md) / FeatureContextMountManager

# Class: FeatureContextMountManager

Creates, tracks, and tears down mounted feature contexts.

## Example

```ts
const manager = new FeatureContextMountManager(context);
manager.registerFeature({ name: 'checkout', loader: () => import('./checkout-module') });
await manager.mountLazy('checkout');
```

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

Destroys the manager and all mounted features.

#### Returns

`void`

***

### getMountedFeature()

> **getMountedFeature**(`name`): [`FeatureContextComposition`](../../context-hierarchy/interfaces/FeatureContextComposition.md) \| `undefined`

Returns the mounted composition.

#### Parameters

##### name

`string`

Feature name.

#### Returns

[`FeatureContextComposition`](../../context-hierarchy/interfaces/FeatureContextComposition.md) \| `undefined`

The composition, if mounted.

***

### hasRegistration()

> **hasRegistration**(`name`): `boolean`

Whether a feature is registered.

#### Parameters

##### name

`string`

Feature name.

#### Returns

`boolean`

`true` when registered.

***

### isMounted()

> **isMounted**(`name`): `boolean`

Whether a feature is mounted.

#### Parameters

##### name

`string`

Feature name.

#### Returns

`boolean`

`true` when mounted.

***

### mount()

> **mount**(`name`): [`FeatureContextComposition`](../../context-hierarchy/interfaces/FeatureContextComposition.md)

Mounts a registered feature.

#### Parameters

##### name

`string`

Feature name.

#### Returns

[`FeatureContextComposition`](../../context-hierarchy/interfaces/FeatureContextComposition.md)

The composition.

***

### mountLazy()

> **mountLazy**(`name`): `Promise`\<[`FeatureContextComposition`](../../context-hierarchy/interfaces/FeatureContextComposition.md)\>

Lazily mounts a feature with a loader.

#### Parameters

##### name

`string`

Feature name.

#### Returns

`Promise`\<[`FeatureContextComposition`](../../context-hierarchy/interfaces/FeatureContextComposition.md)\>

The composition.

***

### registerFeature()

> **registerFeature**(`options`): `this`

Registers a feature.

#### Parameters

##### options

[`FeatureRegistrationOptions`](../interfaces/FeatureRegistrationOptions.md)

Registration options.

#### Returns

`this`

This manager.

***

### remountLazy()

> **remountLazy**(`name`, `policy?`): `Promise`\<[`FeatureContextComposition`](../../context-hierarchy/interfaces/FeatureContextComposition.md)\>

Re-mounts a feature.

#### Parameters

##### name

`string`

Feature name.

##### policy?

[`FeatureUnmountPolicy`](../../context-hierarchy/type-aliases/FeatureUnmountPolicy.md)

Unmount policy.

#### Returns

`Promise`\<[`FeatureContextComposition`](../../context-hierarchy/interfaces/FeatureContextComposition.md)\>

The composition.

***

### unmount()

> **unmount**(`name`, `policy?`): `boolean`

Unmounts a feature.

#### Parameters

##### name

`string`

Feature name.

##### policy?

[`FeatureUnmountPolicy`](../../context-hierarchy/type-aliases/FeatureUnmountPolicy.md)

Unmount policy.

#### Returns

`boolean`

`true` when unmounted.

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
