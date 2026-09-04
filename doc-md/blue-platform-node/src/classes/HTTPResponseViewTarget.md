[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / HTTPResponseViewTarget

# Class: HTTPResponseViewTarget

Defined in: packages/blue-platform-node/src/node-view-target.ts:17

A `ViewTarget` implementation that writes rendered view output to an HTTP
`ServerResponse`. Supports content negotiation via the `Accept` header.

## Implements

- `ViewTarget`

## Constructors

### Constructor

> **new HTTPResponseViewTarget**(`response`): `HTTPResponseViewTarget`

Defined in: packages/blue-platform-node/src/node-view-target.ts:23

#### Parameters

##### response

`ServerResponse`\<`IncomingMessage`\> \| `undefined`

The Node.js `ServerResponse` to write to.

#### Returns

`HTTPResponseViewTarget`

## Methods

### prepare()

> **prepare**(`route`): `Promise`\<`void`\>

Defined in: packages/blue-platform-node/src/node-view-target.ts:28

#### Parameters

##### route

`Route`

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

`ViewTarget.prepare`

***

### commit()

> **commit**(`output`, `model`, `route`): `Promise`\<`void`\>

Defined in: packages/blue-platform-node/src/node-view-target.ts:33

#### Parameters

##### output

`unknown`

##### model

`unknown`

##### route

`Route`

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

`ViewTarget.commit`

***

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: packages/blue-platform-node/src/node-view-target.ts:72

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

`ViewTarget.clear`
