[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [media-type](../README.md) / SpecificityComparator

# Class: SpecificityComparator\<T\>

Comparator to sort `MediaType` in order of specificity.

## Type Parameters

### T

`T` *extends* [`MediaType`](MediaType.md)

## Implements

- [`Comparator`](../../comparable/interfaces/Comparator.md)\<`T`\>

## Constructors

### Constructor

> **new SpecificityComparator**\<`T`\>(): `SpecificityComparator`\<`T`\>

#### Returns

`SpecificityComparator`\<`T`\>

## Methods

### compare()

> **compare**(`mediaType1`, `mediaType2`): `number`

Compares two media types by specificity.

#### Parameters

##### mediaType1

`T`

First media type.

##### mediaType2

`T`

Second media type.

#### Returns

`number`

A comparison result.

#### Implementation of

`Comparator.compare`

***

### compareParameters()

> **compareParameters**(`mediaType1`, `mediaType2`): `number`

Compares parameters by size (more parameters = more specific).

#### Parameters

##### mediaType1

`T`

First media type.

##### mediaType2

`T`

Second media type.

#### Returns

`number`

A comparison result.
