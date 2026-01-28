[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / BatchAppender

# Interface: BatchAppender

Defined in: packages/blue-logger/src/appender.ts:27

## Extends

- [`Appender`](Appender.md)

## Properties

### errorHandler

> **errorHandler**: [`ErrorHandler`](ErrorHandler.md)

Defined in: packages/blue-logger/src/appender.ts:11

#### Inherited from

[`Appender`](Appender.md).[`errorHandler`](Appender.md#errorhandler)

***

### batchSize

> **batchSize**: `number`

Defined in: packages/blue-logger/src/appender.ts:28

***

### layout

> **layout**: [`BatchLayout`](BatchLayout.md)

Defined in: packages/blue-logger/src/appender.ts:29

#### Overrides

[`Appender`](Appender.md).[`layout`](Appender.md#layout)

## Methods

### append()

> **append**(`entry`): `void`

Defined in: packages/blue-logger/src/appender.ts:13

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

#### Returns

`void`

#### Inherited from

[`Appender`](Appender.md).[`append`](Appender.md#append)
