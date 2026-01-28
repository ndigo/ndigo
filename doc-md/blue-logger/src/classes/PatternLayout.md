[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / PatternLayout

# Class: PatternLayout

Defined in: packages/blue-logger/src/layouts/pattern-layout.ts:12

## Extends

- [`AbstractLayout`](AbstractLayout.md)

## Constructors

### Constructor

> **new PatternLayout**(`pattern`): `PatternLayout`

Defined in: packages/blue-logger/src/layouts/pattern-layout.ts:17

#### Parameters

##### pattern

`string`

#### Returns

`PatternLayout`

#### Overrides

[`AbstractLayout`](AbstractLayout.md).[`constructor`](AbstractLayout.md#constructor)

## Properties

### mediaType

> **mediaType**: [`MediaType`](../../../blue-core/src/classes/MediaType.md)

Defined in: packages/blue-logger/src/layout.ts:23

#### Inherited from

[`AbstractLayout`](AbstractLayout.md).[`mediaType`](AbstractLayout.md#mediatype)

***

### pattern

> `readonly` **pattern**: `string`

Defined in: packages/blue-logger/src/layouts/pattern-layout.ts:13

***

### newline

> **newline**: `string`

Defined in: packages/blue-logger/src/layouts/pattern-layout.ts:14

***

### categorySeparator

> **categorySeparator**: `string`

Defined in: packages/blue-logger/src/layouts/pattern-layout.ts:15

## Methods

### format()

> **format**(`__namedParameters`): `string`

Defined in: packages/blue-logger/src/layouts/pattern-layout.ts:40

#### Parameters

##### \_\_namedParameters

[`Entry`](../type-aliases/Entry.md)

#### Returns

`string`

#### Overrides

[`AbstractLayout`](AbstractLayout.md).[`format`](AbstractLayout.md#format)
