[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / FeatureRouteRegistration

# Interface: FeatureRouteRegistration

Defined in: [packages/blue-router/src/feature-routing-registry.ts:32](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/feature-routing-registry.ts#lines-32)

Defines the structure for registering a feature with the `FeatureRoutingRegistry`.

## Since

1.0.0

## Properties

### name

> **name**: `string`

Defined in: [packages/blue-router/src/feature-routing-registry.ts:33](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/feature-routing-registry.ts#lines-33)

***

### prefix

> **prefix**: `string`

Defined in: [packages/blue-router/src/feature-routing-registry.ts:34](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/feature-routing-registry.ts#lines-34)

***

### onActivate?

> `optional` **onActivate?**: () => `void`

Defined in: [packages/blue-router/src/feature-routing-registry.ts:35](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/feature-routing-registry.ts#lines-35)

#### Returns

`void`

***

### onDeactivate?

> `optional` **onDeactivate?**: () => `void`

Defined in: [packages/blue-router/src/feature-routing-registry.ts:36](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/feature-routing-registry.ts#lines-36)

#### Returns

`void`

***

### onRoute

> **onRoute**: (`route`) => `void`

Defined in: [packages/blue-router/src/feature-routing-registry.ts:37](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/feature-routing-registry.ts#lines-37)

#### Parameters

##### route

[`Route`](Route.md)

#### Returns

`void`
