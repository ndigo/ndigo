[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / ViewMapping

# Interface: ViewMapping

Defined in: [packages/blue-view/src/view-mapping.ts:13](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-mapping.ts#lines-13)

Resolves a route to the view target that should handle it.

## Methods

### getTarget()

> **getTarget**(`route`): `any`

Defined in: [packages/blue-view/src/view-mapping.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/view-mapping.ts#lines-20)

Returns the target associated with the given route.

#### Parameters

##### route

[`Route`](#)

The route being resolved.

#### Returns

`any`

The resolved target, or `null` when no target matches.
