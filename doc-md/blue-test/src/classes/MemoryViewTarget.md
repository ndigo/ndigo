[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-test/src](../README.md) / MemoryViewTarget

# Class: MemoryViewTarget

Defined in: packages/blue-test/src/memory-view-target.ts:31

Captures rendered view output instead of mounting it into a DOM container.

## Implements

- `ViewTarget`

## Constructors

### Constructor

> **new MemoryViewTarget**(): `MemoryViewTarget`

#### Returns

`MemoryViewTarget`

## Accessors

### lastRender

#### Get Signature

> **get** **lastRender**(): [`CapturedRender`](../interfaces/CapturedRender.md) \| `null`

Defined in: packages/blue-test/src/memory-view-target.ts:37

The last captured render, or `null` if none yet.

##### Returns

[`CapturedRender`](../interfaces/CapturedRender.md) \| `null`

## Methods

### prepare()

> **prepare**(`route`): `Promise`\<`void`\>

Defined in: packages/blue-test/src/memory-view-target.ts:42

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

Defined in: packages/blue-test/src/memory-view-target.ts:48

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

Defined in: packages/blue-test/src/memory-view-target.ts:53

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

`ViewTarget.clear`
