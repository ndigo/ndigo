[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / FetchAppender

# Class: FetchAppender

Defined in: packages/blue-logger/src/appenders/fetch-appender.ts:17

A "clean", empty container.

## Extends

- [`AbstractBatchAppender`](AbstractBatchAppender.md)

## Constructors

### Constructor

> **new FetchAppender**(`url`, `options`): `FetchAppender`

Defined in: packages/blue-logger/src/appenders/fetch-appender.ts:22

#### Parameters

##### url

`string`

##### options

[`FetchAppenderSettings`](../type-aliases/FetchAppenderSettings.md) = `{}`

#### Returns

`FetchAppender`

#### Overrides

[`AbstractBatchAppender`](AbstractBatchAppender.md).[`constructor`](AbstractBatchAppender.md#constructor)

## Properties

### errorHandler

> **errorHandler**: [`ErrorHandler`](../interfaces/ErrorHandler.md)

Defined in: packages/blue-logger/src/appender.ts:40

#### Inherited from

[`AbstractBatchAppender`](AbstractBatchAppender.md).[`errorHandler`](AbstractBatchAppender.md#errorhandler)

---

### entries

> `readonly` **entries**: [`Entry`](../type-aliases/Entry.md)[]

Defined in: packages/blue-logger/src/appender.ts:52

#### Inherited from

[`AbstractBatchAppender`](AbstractBatchAppender.md).[`entries`](AbstractBatchAppender.md#entries)

---

### batchSize

> **batchSize**: `number`

Defined in: packages/blue-logger/src/appender.ts:53

#### Inherited from

[`AbstractBatchAppender`](AbstractBatchAppender.md).[`batchSize`](AbstractBatchAppender.md#batchsize)

---

### layout

> **layout**: [`BatchLayout`](../interfaces/BatchLayout.md)

Defined in: packages/blue-logger/src/appender.ts:54

#### Inherited from

[`AbstractBatchAppender`](AbstractBatchAppender.md).[`layout`](AbstractBatchAppender.md#layout)

---

### appending

> **appending**: `Promise`\<`Response`\>

Defined in: packages/blue-logger/src/appenders/fetch-appender.ts:18

---

### url

> `readonly` **url**: `string`

Defined in: packages/blue-logger/src/appenders/fetch-appender.ts:19

---

### options

> `readonly` **options**: [`FetchAppenderSettings`](../type-aliases/FetchAppenderSettings.md)

Defined in: packages/blue-logger/src/appenders/fetch-appender.ts:20

## Methods

### append()

> **append**(`entry`): `void`

Defined in: packages/blue-logger/src/appender.ts:67

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

#### Returns

`void`

#### Inherited from

[`AbstractBatchAppender`](AbstractBatchAppender.md).[`append`](AbstractBatchAppender.md#append)

---

### appendBatch()

> **appendBatch**(`entries`): `void`

Defined in: packages/blue-logger/src/appenders/fetch-appender.ts:29

#### Parameters

##### entries

[`Entry`](../type-aliases/Entry.md)[]

#### Returns

`void`

#### Overrides

[`AbstractBatchAppender`](AbstractBatchAppender.md).[`appendBatch`](AbstractBatchAppender.md#appendbatch)
