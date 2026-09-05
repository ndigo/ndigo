[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / AbstractAppender

# Abstract Class: AbstractAppender

Defined in: packages/blue-logger/src/appender.ts:39

A "clean", empty container.

## Extends

- [`Null`](../../../blue-core/src/classes/Null.md)

## Extended by

- [`AbstractBatchAppender`](AbstractBatchAppender.md)
- [`AlertAppender`](AlertAppender.md)
- [`BrowserConsoleAppender`](BrowserConsoleAppender.md)

## Implements

- [`Appender`](../interfaces/Appender.md)

## Constructors

### Constructor

> **new AbstractAppender**(): `AbstractAppender`

Defined in: packages/blue-logger/src/appender.ts:43

#### Returns

`AbstractAppender`

#### Overrides

[`Null`](../../../blue-core/src/classes/Null.md).[`constructor`](../../../blue-core/src/classes/Null.md#constructor)

## Properties

### errorHandler

> **errorHandler**: [`ErrorHandler`](../interfaces/ErrorHandler.md)

Defined in: packages/blue-logger/src/appender.ts:40

#### Implementation of

[`Appender`](../interfaces/Appender.md).[`errorHandler`](../interfaces/Appender.md#errorhandler)

---

### layout

> **layout**: [`Layout`](../interfaces/Layout.md)

Defined in: packages/blue-logger/src/appender.ts:41

#### Implementation of

[`Appender`](../interfaces/Appender.md).[`layout`](../interfaces/Appender.md#layout)

## Methods

### append()

> `abstract` **append**(`entry`): `void`

Defined in: packages/blue-logger/src/appender.ts:48

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

#### Returns

`void`

#### Implementation of

[`Appender`](../interfaces/Appender.md).[`append`](../interfaces/Appender.md#append)
