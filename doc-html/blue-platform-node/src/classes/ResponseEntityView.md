[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / ResponseEntityView

# Class: ResponseEntityView

Defined in: [packages/blue-platform-node/src/response-entity-view.ts:17](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/response-entity-view.ts#lines-17)

A view that writes a `ResponseEntity` (status, headers, body) to the
`ServerResponse` stored in the route's attributes.

## Constructors

### Constructor

> **new ResponseEntityView**(): `ResponseEntityView`

#### Returns

`ResponseEntityView`

## Methods

### render()

> **render**(`entity`, `route`): `Promise`\<`void`\>

Defined in: [packages/blue-platform-node/src/response-entity-view.ts:24](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/response-entity-view.ts#lines-24)

Render an `ResponseEntity` to the HTTP response.

#### Parameters

##### entity

[`ResponseEntity`](ResponseEntity.md)\<`unknown`\>

The response entity.

##### route

[`Route`](#)

The current route.

#### Returns

`Promise`\<`void`\>
