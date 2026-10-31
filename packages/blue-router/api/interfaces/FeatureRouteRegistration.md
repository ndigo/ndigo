[**@blue/router v0.0.1**](../README.md)

***

[@blue/router](../README.md) / FeatureRouteRegistration

# Interface: FeatureRouteRegistration

Defines the structure for registering a feature with the `FeatureRoutingRegistry`.

## Since

1.0.0

## Properties

### name

> **name**: `string`

***

### onActivate?

> `optional` **onActivate?**: () => `void`

#### Returns

`void`

***

### onDeactivate?

> `optional` **onDeactivate?**: () => `void`

#### Returns

`void`

***

### onRoute

> **onRoute**: (`route`) => `void`

#### Parameters

##### route

[`Route`](Route.md)

#### Returns

`void`

***

### prefix

> **prefix**: `string`
