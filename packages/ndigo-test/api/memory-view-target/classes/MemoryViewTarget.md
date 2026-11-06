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

#### Returns

`Promise`\<`void`\>

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

#### Implementation of

`ViewTarget.prepare`
