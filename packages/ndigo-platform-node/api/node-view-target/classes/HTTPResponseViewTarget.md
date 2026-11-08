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

Creates a view target over a Node response.

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

#### Implementation of

`ViewTarget.clear`

***

### commit()

> **commit**(`output`, `model`, `route`): `Promise`\<`void`\>

Writes the rendered output to the response.

#### Parameters

##### output

`unknown`

The rendered output.

##### model

`unknown`

The data model.

##### route

[`Route`](#)

The current route.

#### Returns

`Promise`\<`void`\>

A promise that resolves once written.

#### Implementation of

`ViewTarget.commit`

***

### prepare()

> **prepare**(`route`): `Promise`\<`void`\>

Prepares the target for a render (no-op).

#### Parameters

##### route

[`Route`](#)

The route being rendered.

#### Returns

`Promise`\<`void`\>

A promise that resolves immediately.

#### Implementation of

`ViewTarget.prepare`
