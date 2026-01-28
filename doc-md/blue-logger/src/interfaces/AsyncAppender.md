[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / AsyncAppender

# Interface: AsyncAppender

Defined in: packages/blue-logger/src/appender.ts:16

## Extends

- [`Appender`](Appender.md)

## Extended by

- [`AsyncBatchAppender`](AsyncBatchAppender.md)

## Properties

### errorHandler

> **errorHandler**: [`ErrorHandler`](ErrorHandler.md)

Defined in: packages/blue-logger/src/appender.ts:11

#### Inherited from

[`Appender`](Appender.md).[`errorHandler`](Appender.md#errorhandler)

***

### layout

> **layout**: [`Layout`](Layout.md)

Defined in: packages/blue-logger/src/appender.ts:12

#### Inherited from

[`Appender`](Appender.md).[`layout`](Appender.md#layout)

## Methods

### append()

> **append**(`entry`): `Promise`\<`void`\>

Defined in: packages/blue-logger/src/appender.ts:17

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Appender`](Appender.md).[`append`](Appender.md#append)
