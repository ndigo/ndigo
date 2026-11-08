[**@ndigo/test v0.0.1**](../../README.md)

***

[@ndigo/test](../../README.md) / [memory-view-target](../README.md) / MemoryViewTarget

# Class: MemoryViewTarget

Captures rendered view output instead of mounting it into a DOM container.

## Implements

- [`ViewTarget`](#)

## Constructors

### Constructor

> **new MemoryViewTarget**(): `MemoryViewTarget`

#### Returns

`MemoryViewTarget`

## Accessors

### lastRender

#### Get Signature

> **get** **lastRender**(): [`CapturedRender`](../interfaces/CapturedRender.md) \| `null`

The last captured render, or `null` if none yet.

##### Returns

[`CapturedRender`](../interfaces/CapturedRender.md) \| `null`

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Clears the captured render.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the capture is cleared.

#### Implementation of

`ViewTarget.clear`

***

### commit()

> **commit**(`output`, `model`, `route`): `Promise`\<`void`\>

Captures a rendered output for assertions.

#### Parameters

##### output

`unknown`

The rendered output.

##### model

`unknown`

The data model used for the render.

##### route

[`Route`](#)

The route that was rendered.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the render is captured.

#### Implementation of

`ViewTarget.commit`

***

### prepare()

> **prepare**(`route`): `Promise`\<`void`\>

Prepares the target for a render (there is no DOM container to clear).

#### Parameters

##### route

[`Route`](#)

The route being rendered.

#### Returns

`Promise`\<`void`\>

A promise that resolves immediately.

#### Implementation of

`ViewTarget.prepare`
