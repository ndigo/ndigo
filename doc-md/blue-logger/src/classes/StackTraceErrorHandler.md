[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / StackTraceErrorHandler

# Class: StackTraceErrorHandler

Defined in: packages/blue-logger/src/error-handler.ts:43

## Implements

- [`AsyncErrorHandler`](../interfaces/AsyncErrorHandler.md)

## Constructors

### Constructor

> **new StackTraceErrorHandler**(`appender`): `StackTraceErrorHandler`

Defined in: packages/blue-logger/src/error-handler.ts:46

#### Parameters

##### appender

[`Appender`](../interfaces/Appender.md)

#### Returns

`StackTraceErrorHandler`

## Properties

### appender

> `readonly` **appender**: [`Appender`](../interfaces/Appender.md)

Defined in: packages/blue-logger/src/error-handler.ts:44

## Methods

### handleError()

> **handleError**(`entry`): `Promise`\<`void`\>

Defined in: packages/blue-logger/src/error-handler.ts:55

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AsyncErrorHandler`](../interfaces/AsyncErrorHandler.md).[`handleError`](../interfaces/AsyncErrorHandler.md#handleerror)
