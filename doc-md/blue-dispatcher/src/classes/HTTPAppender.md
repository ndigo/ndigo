[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / HTTPAppender

# Class: HTTPAppender

Defined in: packages/blue-dispatcher/src/logger/http-appender.ts:19

A "clean", empty container.

## Extends

- [`AbstractBatchAppender`](../../../blue-logger/src/classes/AbstractBatchAppender.md)

## Implements

- [`HTTPAware`](../../../blue-http/src/interfaces/HTTPAware.md)

## Constructors

### Constructor

> **new HTTPAppender**(`url`, `init`): `HTTPAppender`

Defined in: packages/blue-dispatcher/src/logger/http-appender.ts:29

#### Parameters

##### url

`string`

##### init

[`TimeoutInit`](../../../blue-http/src/type-aliases/TimeoutInit.md) = `defaults`

#### Returns

`HTTPAppender`

#### Overrides

[`AbstractBatchAppender`](../../../blue-logger/src/classes/AbstractBatchAppender.md).[`constructor`](../../../blue-logger/src/classes/AbstractBatchAppender.md#constructor)

## Properties

### appending

> **appending**: `Promise`\<`Response`\>

Defined in: packages/blue-dispatcher/src/logger/http-appender.ts:21

***

### url

> `readonly` **url**: `string`

Defined in: packages/blue-dispatcher/src/logger/http-appender.ts:22

***

### settings

> `readonly` **settings**: [`TimeoutInit`](../../../blue-http/src/type-aliases/TimeoutInit.md)

Defined in: packages/blue-dispatcher/src/logger/http-appender.ts:23

***

### errorHandler

> **errorHandler**: [`ErrorHandler`](../../../blue-logger/src/interfaces/ErrorHandler.md)

Defined in: packages/blue-logger/src/appender.ts:40

#### Inherited from

[`AbstractBatchAppender`](../../../blue-logger/src/classes/AbstractBatchAppender.md).[`errorHandler`](../../../blue-logger/src/classes/AbstractBatchAppender.md#errorhandler)

***

### entries

> `readonly` **entries**: [`Entry`](../../../blue-logger/src/type-aliases/Entry.md)[]

Defined in: packages/blue-logger/src/appender.ts:52

#### Inherited from

[`AbstractBatchAppender`](../../../blue-logger/src/classes/AbstractBatchAppender.md).[`entries`](../../../blue-logger/src/classes/AbstractBatchAppender.md#entries)

***

### batchSize

> **batchSize**: `number`

Defined in: packages/blue-logger/src/appender.ts:53

#### Inherited from

[`AbstractBatchAppender`](../../../blue-logger/src/classes/AbstractBatchAppender.md).[`batchSize`](../../../blue-logger/src/classes/AbstractBatchAppender.md#batchsize)

***

### layout

> **layout**: [`BatchLayout`](../../../blue-logger/src/interfaces/BatchLayout.md)

Defined in: packages/blue-logger/src/appender.ts:54

#### Inherited from

[`AbstractBatchAppender`](../../../blue-logger/src/classes/AbstractBatchAppender.md).[`layout`](../../../blue-logger/src/classes/AbstractBatchAppender.md#layout)

## Accessors

### \[$aware\]

#### Get Signature

> **get** **\[$aware\]**(): `boolean`

Defined in: packages/blue-dispatcher/src/logger/http-appender.ts:25

##### Returns

`boolean`

#### Implementation of

[`HTTPAware`](../../../blue-http/src/interfaces/HTTPAware.md).[`[$aware]`](../../../blue-http/src/interfaces/HTTPAware.md#aware)

## Methods

### appendBatch()

> **appendBatch**(`entries`): `void`

Defined in: packages/blue-dispatcher/src/logger/http-appender.ts:47

#### Parameters

##### entries

[`Entry`](../../../blue-logger/src/type-aliases/Entry.md)[]

#### Returns

`void`

#### Overrides

[`AbstractBatchAppender`](../../../blue-logger/src/classes/AbstractBatchAppender.md).[`appendBatch`](../../../blue-logger/src/classes/AbstractBatchAppender.md#appendbatch)

***

### setHTTP()

> **setHTTP**(`http`): `void`

Defined in: packages/blue-dispatcher/src/logger/http-appender.ts:85

#### Parameters

##### http

[`HTTP`](../../../blue-http/src/classes/HTTP.md)

#### Returns

`void`

#### Implementation of

[`HTTPAware`](../../../blue-http/src/interfaces/HTTPAware.md).[`setHTTP`](../../../blue-http/src/interfaces/HTTPAware.md#sethttp)

***

### append()

> **append**(`entry`): `void`

Defined in: packages/blue-logger/src/appender.ts:67

#### Parameters

##### entry

[`Entry`](../../../blue-logger/src/type-aliases/Entry.md)

#### Returns

`void`

#### Inherited from

[`AbstractBatchAppender`](../../../blue-logger/src/classes/AbstractBatchAppender.md).[`append`](../../../blue-logger/src/classes/AbstractBatchAppender.md#append)
