[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [feature-routing-registry](../README.md) / FeatureRouteRegistration

# Interface: FeatureRouteRegistration

Defines the structure for registering a feature with the `FeatureRoutingRegistry`.

## Properties

### name

> **name**: `string`

The feature name.

***

### onActivate?

> `optional` **onActivate?**: () => `void`

Invoked after the feature activates.

#### Returns

`void`

***

### onDeactivate?

> `optional` **onDeactivate?**: () => `void`

Invoked after the feature deactivates.

#### Returns

`void`

***

### onRoute

> **onRoute**: (`route`) => `void`

Receives the feature-local route.

#### Parameters

##### route

[`Route`](../../route/interfaces/Route.md)

#### Returns

`void`

***

### prefix

> **prefix**: `string`

The URL prefix that activates the feature.
