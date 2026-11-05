[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [feature-routing-registry](../README.md) / FeatureRoutingRegistry

# Class: FeatureRoutingRegistry

Manages the registration and activation of features based on routing.
It allows features to be mounted at specific URL prefixes and provides policies for feature activation.

## Since

1.0.0

## Constructors

### Constructor

> **new FeatureRoutingRegistry**(`partitionRouter?`, `options?`): `FeatureRoutingRegistry`

Creates an instance of `FeatureRoutingRegistry`.

#### Parameters

##### partitionRouter?

[`PartitionRouter`](../../partition-router/classes/PartitionRouter.md) = `...`

The `PartitionRouter` instance to use for routing. Defaults to a new `PartitionRouter`.

##### options?

[`FeatureRoutingRegistryOptions`](../interfaces/FeatureRoutingRegistryOptions.md) = `{}`

Configuration options for the registry.

#### Returns

`FeatureRoutingRegistry`

#### Since

1.0.0

## Accessors

### activeFeatureName

#### Get Signature

> **get** **activeFeatureName**(): `string` \| `undefined`

Gets the name of the currently active feature.

##### Since

1.0.0

##### Returns

`string` \| `undefined`

The name of the active feature, or `undefined` if no feature is active.

***

### partitionRouter

#### Get Signature

> **get** **partitionRouter**(): [`PartitionRouter`](../../partition-router/classes/PartitionRouter.md)

Gets the underlying `PartitionRouter` instance used by the registry.

##### Since

1.0.0

##### Returns

[`PartitionRouter`](../../partition-router/classes/PartitionRouter.md)

The `PartitionRouter` instance.

## Methods

### navigate()

> **navigate**(`path`): `boolean`

Navigates the underlying `PartitionRouter` to the given path.
If the navigation is not handled by any registered route, the currently active feature (if any) will be deactivated.

#### Parameters

##### path

`string`

The path to navigate to.

#### Returns

`boolean`

`true` if the navigation was handled by a registered route, `false` otherwise.

#### Since

1.0.0

***

### refresh()

> **refresh**(): `void`

Refreshes the routing by calling `refresh` on the underlying `PartitionRouter`.
This can re-evaluate the current URL against registered routes.

#### Returns

`void`

#### Since

1.0.0

***

### registerFeature()

> **registerFeature**(`feature`): `this`

Registers a new feature with the routing registry.
Each feature is associated with a unique name and a URL prefix.

#### Parameters

##### feature

[`FeatureRouteRegistration`](../interfaces/FeatureRouteRegistration.md)

The `FeatureRouteRegistration` object containing feature details and callbacks.

#### Returns

`this`

The current `FeatureRoutingRegistry` instance for chaining.

#### Throws

If a feature with the same name is already registered,
  or another feature already occupies the same route prefix.

#### Since

1.0.0

***

### setActiveFeature()

> **setActiveFeature**(`name`): `this`

Explicitly sets a feature as active by its name.
This will trigger the activation policy (e.g., deactivating other features if policy is 'exclusive').

#### Parameters

##### name

`string`

The name of the feature to activate.

#### Returns

`this`

The current `FeatureRoutingRegistry` instance for chaining.

#### Throws

If the specified feature name is not registered.

#### Since

1.0.0

***

### unregister()

> **unregister**(`name`): `boolean`

Removes a feature registration: deactivates it if active and unmounts
its route prefix so future navigation no longer matches.

#### Parameters

##### name

`string`

The registered feature name.

#### Returns

`boolean`

`true` if a registration was removed.

#### Since

1.0.0
