[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / FeatureRoutingRegistry

# Class: FeatureRoutingRegistry

Defined in: packages/blue-router/src/feature-routing-registry.ts:45

Manages the registration and activation of features based on routing.
It allows features to be mounted at specific URL prefixes and provides policies for feature activation.

## Since

1.0.0

## Constructors

### Constructor

> **new FeatureRoutingRegistry**(`siteRouter?`, `options?`): `FeatureRoutingRegistry`

Defined in: packages/blue-router/src/feature-routing-registry.ts:76

Creates an instance of `FeatureRoutingRegistry`.

#### Parameters

##### siteRouter?

[`SiteRouter`](SiteRouter.md) = `...`

The `SiteRouter` instance to use for routing. Defaults to a new `SiteRouter`.

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

Defined in: packages/blue-router/src/feature-routing-registry.ts:57

Gets the name of the currently active feature.

##### Since

1.0.0

##### Returns

`string` \| `undefined`

The name of the active feature, or `undefined` if no feature is active.

***

### siteRouter

#### Get Signature

> **get** **siteRouter**(): [`SiteRouter`](SiteRouter.md)

Defined in: packages/blue-router/src/feature-routing-registry.ts:66

Gets the underlying `SiteRouter` instance used by the registry.

##### Since

1.0.0

##### Returns

[`SiteRouter`](SiteRouter.md)

The `SiteRouter` instance.

## Methods

### registerFeature()

> **registerFeature**(`feature`): `this`

Defined in: packages/blue-router/src/feature-routing-registry.ts:92

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

If a feature with the same name is already registered.

#### Since

1.0.0

***

### setActiveFeature()

> **setActiveFeature**(`name`): `this`

Defined in: packages/blue-router/src/feature-routing-registry.ts:116

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

### navigate()

> **navigate**(`path`): `boolean`

Defined in: packages/blue-router/src/feature-routing-registry.ts:133

Navigates the underlying `SiteRouter` to the given path.
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

Defined in: packages/blue-router/src/feature-routing-registry.ts:149

Refreshes the routing by calling `refresh` on the underlying `SiteRouter`.
This can re-evaluate the current URL against registered routes.

#### Returns

`void`

#### Since

1.0.0
