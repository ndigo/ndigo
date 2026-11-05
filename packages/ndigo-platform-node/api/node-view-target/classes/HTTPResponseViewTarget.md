[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-view-target](../README.md) / HTTPResponseViewTarget

# Class: HTTPResponseViewTarget

A `ViewTarget` implementation that writes rendered view output to an HTTP
`ServerResponse`. Supports content negotiation via the `Accept` header.

## Implements

- [`ViewTarget`](#)

## Constructors

### Constructor

> **new HTTPResponseViewTarget**(`response`): `HTTPResponseViewTarget`

#### Parameters

##### response

`ServerResponse`\<`IncomingMessage`\> \| `undefined`

The Node.js `ServerResponse` to write to.

#### Returns

`HTTPResponseViewTarget`

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

`ViewTarget.clear`

***

### commit()

> **commit**(`output`, `model`, `route`): `Promise`\<`void`\>

#### Parameters

##### output

`unknown`

##### model

`unknown`

##### route

[`Route`](#)

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

`ViewTarget.commit`

***

### prepare()

> **prepare**(`route`): `Promise`\<`void`\>

#### Parameters

##### route

[`Route`](#)

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

`ViewTarget.prepare`
