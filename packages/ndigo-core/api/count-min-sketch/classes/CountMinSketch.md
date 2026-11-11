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

Number of hash rows.

##### Returns

`number`

***

### total

#### Get Signature

> **get** **total**(): `number`

Total count added across every value.

##### Returns

`number`

***

### width

#### Get Signature

> **get** **width**(): `number`

Number of counters per row.

##### Returns

`number`

## Methods

### add()

> **add**(`value`, `count?`): `this`

Records occurrences of a value.

#### Parameters

##### value

`unknown`

The value to count; hashed through its string form.

##### count?

`number` = `1`

How many occurrences to add; defaults to one.

#### Returns

`this`

This sketch, for chaining.

***

### clear()

> **clear**(): `void`

Resets every counter and the total.

#### Returns

`void`

***

### equals()

> **equals**(`value`): `boolean`

Compares the full serialized state.

#### Parameters

##### value

`unknown`

The candidate to compare against.

#### Returns

`boolean`

`true` when dimensions, counters, and total match.

#### Implementation of

[`Equatable`](../../equatable/interfaces/Equatable.md).[`equals`](../../equatable/interfaces/Equatable.md#equals)

***

### estimate()

> **estimate**(`value`): `number`

Estimates occurrences of a value.

#### Parameters

##### value

`unknown`

The value to estimate.

#### Returns

`number`

A count that never undercounts and overcounts within the bound.

***

### toJSON()

> **toJSON**(): [`CountMinSketchJSON`](../type-aliases/CountMinSketchJSON.md)

Returns the JSON form.

#### Returns

[`CountMinSketchJSON`](../type-aliases/CountMinSketchJSON.md)

The dimensions, counter table, and total.

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toJSON`](../../serializable/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Summarizes the sketch.

#### Returns

`string`

The dimensions and total count.

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

Sizes a sketch for a target error bound.

#### Parameters

##### expectedItems

`number`

Expected distinct values (used for the width bound).

##### falsePositiveRate

`number`

Target error rate in `(0, 1)`.

#### Returns

`CountMinSketch`

A sketch with the derived dimensions.
