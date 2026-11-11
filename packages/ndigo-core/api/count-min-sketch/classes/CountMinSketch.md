[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [count-min-sketch](../README.md) / CountMinSketch

# Class: CountMinSketch

A value that can safely be converted to a string or JSON payload.

## Implements

- [`Serializable`](../../serializable/interfaces/Serializable.md)
- [`Equatable`](../../equatable/interfaces/Equatable.md)\<`CountMinSketch`\>

## Constructors

### Constructor

> **new CountMinSketch**(`depth?`, `width?`): `CountMinSketch`

#### Parameters

##### depth?

`number` = `5`

##### width?

`number` = `1024`

#### Returns

`CountMinSketch`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

***

### depth

#### Get Signature

> **get** **depth**(): `number`

##### Returns

`number`

***

### total

#### Get Signature

> **get** **total**(): `number`

##### Returns

`number`

***

### width

#### Get Signature

> **get** **width**(): `number`

##### Returns

`number`

## Methods

### add()

> **add**(`value`, `count?`): `this`

#### Parameters

##### value

`unknown`

##### count?

`number` = `1`

#### Returns

`this`

***

### clear()

> **clear**(): `void`

#### Returns

`void`

***

### equals()

> **equals**(`value`): `boolean`

Determines if this object is equal to the specified value.

#### Parameters

##### value

`unknown`

The value to compare with this object.

#### Returns

`boolean`

`true` if the objects are equal, `false` otherwise.

#### Implementation of

[`Equatable`](../../equatable/interfaces/Equatable.md).[`equals`](../../equatable/interfaces/Equatable.md#equals)

***

### estimate()

> **estimate**(`value`): `number`

#### Parameters

##### value

`unknown`

#### Returns

`number`

***

### toJSON()

> **toJSON**(): [`CountMinSketchJSON`](../type-aliases/CountMinSketchJSON.md)

Returns a JSON-safe representation of the value.

#### Returns

[`CountMinSketchJSON`](../type-aliases/CountMinSketchJSON.md)

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toJSON`](../../serializable/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Returns a string representation of the value.

#### Returns

`string`

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toString`](../../serializable/interfaces/Serializable.md#tostring)

***

### fromJSON()

> `static` **fromJSON**(`json`): `CountMinSketch`

Restores a sketch from its [CountMinSketchJSON](../type-aliases/CountMinSketchJSON.md) form.

#### Parameters

##### json

[`CountMinSketchJSON`](../type-aliases/CountMinSketchJSON.md)

The serialized state, as produced by [CountMinSketch.toJSON](#tojson).

#### Returns

`CountMinSketch`

A new sketch with the restored dimensions, counters, and total.

***

### withTargetError()

> `static` **withTargetError**(`expectedItems`, `falsePositiveRate`): `CountMinSketch`

#### Parameters

##### expectedItems

`number`

##### falsePositiveRate

`number`

#### Returns

`CountMinSketch`
