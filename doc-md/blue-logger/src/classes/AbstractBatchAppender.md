[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / AbstractBatchAppender

# Abstract Class: AbstractBatchAppender

Defined in: packages/blue-logger/src/appender.ts:51

A "clean", empty container.

## Extends

- [`AbstractAppender`](AbstractAppender.md)

## Extended by

- [`FetchAppender`](FetchAppender.md)
- [`HTTPAppender`](../../../blue-dispatcher/src/classes/HTTPAppender.md)

## Implements

- [`BatchAppender`](../interfaces/BatchAppender.md)

## Constructors

### Constructor

> **new AbstractBatchAppender**(): `AbstractBatchAppender`

Defined in: packages/blue-logger/src/appender.ts:56

#### Returns

`AbstractBatchAppender`

#### Overrides

[`AbstractAppender`](AbstractAppender.md).[`constructor`](AbstractAppender.md#constructor)

## Properties

### errorHandler

> **errorHandler**: [`ErrorHandler`](../interfaces/ErrorHandler.md)

Defined in: packages/blue-logger/src/appender.ts:40

#### Implementation of

[`BatchAppender`](../interfaces/BatchAppender.md).[`errorHandler`](../interfaces/BatchAppender.md#errorhandler)

#### Inherited from

[`AbstractAppender`](AbstractAppender.md).[`errorHandler`](AbstractAppender.md#errorhandler)

***

### entries

> `readonly` **entries**: [`Entry`](../type-aliases/Entry.md)[]

Defined in: packages/blue-logger/src/appender.ts:52

***

### batchSize

> **batchSize**: `number`

Defined in: packages/blue-logger/src/appender.ts:53

#### Implementation of

[`BatchAppender`](../interfaces/BatchAppender.md).[`batchSize`](../interfaces/BatchAppender.md#batchsize)

***

### layout

> **layout**: [`BatchLayout`](../interfaces/BatchLayout.md)

Defined in: packages/blue-logger/src/appender.ts:54

#### Implementation of

[`BatchAppender`](../interfaces/BatchAppender.md).[`layout`](../interfaces/BatchAppender.md#layout)

#### Overrides

[`AbstractAppender`](AbstractAppender.md).[`layout`](AbstractAppender.md#layout)

## Methods

### append()

> **append**(`entry`): `void`

Defined in: packages/blue-logger/src/appender.ts:67

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

#### Returns

`void`

#### Implementation of

[`BatchAppender`](../interfaces/BatchAppender.md).[`append`](../interfaces/BatchAppender.md#append)

#### Overrides

[`AbstractAppender`](AbstractAppender.md).[`append`](AbstractAppender.md#append)

***

### appendBatch()

> `abstract` **appendBatch**(`entries`): `void`

Defined in: packages/blue-logger/src/appender.ts:83

#### Parameters

##### entries

[`Entry`](../type-aliases/Entry.md)[]

#### Returns

`void`
