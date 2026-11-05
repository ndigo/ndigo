[**@ndigo/host v0.0.1**](../../README.md)

***

[@ndigo/host](../../README.md) / [host-manager](../README.md) / HostManager

# Class: HostManager

Creates, tracks, and tears down feature contexts and their route partitions.

One registration call wires both registries:

```ts
const host = new HostManager(shellContext, { activationPolicy: 'exclusive' });
host.registerFeature({
    name: 'catalog',
    prefix: '/catalog',
    loader: () => import('./features/catalog'),
    dependencies: { requires: { router: '^1.0.0' } },
});
shellContext.setValue(HOST_MANAGER_TOKEN, host);
```

Pure delegation: mount/unmount/dependency-validation/metrics behavior is
exactly the `FeatureContextMountManager` + `DefaultSharedDependencyRegistry`
+ `FeatureRoutingRegistry` machinery this class assembles.

## Constructors

### Constructor

> **new HostManager**(`parent`, `options?`): `HostManager`

Creates the host orchestrator above `parent` (the shell context).

#### Parameters

##### parent

`ApplicationContext`

##### options?

[`HostManagerOptions`](../interfaces/HostManagerOptions.md) = `{}`

#### Returns

`HostManager`

## Accessors

### activeFeature

#### Get Signature

> **get** **activeFeature**(): `string` \| `undefined`

Gets the name of the currently active feature.

##### Returns

`string` \| `undefined`

***

### partitionRouter

#### Get Signature

> **get** **partitionRouter**(): `PartitionRouter`

Gets the underlying `PartitionRouter` used by the routing registry.

##### Returns

`PartitionRouter`

## Methods

### destroy()

> **destroy**(): `void`

Unregister every feature and clear the host.

#### Returns

`void`

***

### getMountedFeature()

> **getMountedFeature**(`name`): `FeatureContextComposition` \| `undefined`

Get the mounted feature composition, if any.

#### Parameters

##### name

`string`

#### Returns

`FeatureContextComposition` \| `undefined`

***

### isMounted()

> **isMounted**(`name`): `boolean`

Whether a feature is currently mounted.

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### mount()

> **mount**(`name`): `FeatureContextComposition`

Mount a registered feature (static `createContext`/`data` features).

#### Parameters

##### name

`string`

#### Returns

`FeatureContextComposition`

***

### mountLazy()

> **mountLazy**(`name`): `Promise`\<`FeatureContextComposition`\>

Mount a feature loaded dynamically via its registered `loader`.

#### Parameters

##### name

`string`

#### Returns

`Promise`\<`FeatureContextComposition`\>

***

### navigate()

> **navigate**(`path`): `boolean`

Navigate the host's partition router; activates/deactivates features
per the activation policy. Returns whether a feature handled the path.

#### Parameters

##### path

`string`

#### Returns

`boolean`

***

### refresh()

> **refresh**(): `void`

Re-evaluate the current route against all mounted partitions.

#### Returns

`void`

***

### registerFeature()

> **registerFeature**(`options`): `this`

Registers a feature in one call: mount manager + routing registry,
with mount-on-activate / unmount-on-deactivate wiring.

#### Parameters

##### options

[`HostRegistrationOptions`](../interfaces/HostRegistrationOptions.md)

#### Returns

`this`

#### Throws

If a feature with the same name is already registered.

***

### unmount()

> **unmount**(`name`, `policy?`): `boolean`

Unmount a feature, honoring the registration's `unmountPolicy` unless
one is given.

#### Parameters

##### name

`string`

##### policy?

`FeatureUnmountPolicy`

#### Returns

`boolean`

***

### unregister()

> **unregister**(`name`): `boolean`

Unmount (close policy) a feature and remove it from both registries,
freeing its name for re-registration.

#### Parameters

##### name

`string`

#### Returns

`boolean`

`true` if a registration was removed.
