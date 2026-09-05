[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / AsyncBatchAppender

# Interface: AsyncBatchAppender

Defined in: packages/blue-logger/src/appender.ts:32

## Extends

- [`AsyncAppender`](AsyncAppender.md)

## Properties

### errorHandler

> **errorHandler**: [`ErrorHandler`](ErrorHandler.md)

Defined in: packages/blue-logger/src/appender.ts:11

#### Inherited from

[`AsyncAppender`](AsyncAppender.md).[`errorHandler`](AsyncAppender.md#errorhandler)

---

### batchSize

> **batchSize**: `number`

Defined in: packages/blue-logger/src/appender.ts:33

---

### layout

> **layout**: [`BatchLayout`](BatchLayout.md)

Defined in: packages/blue-logger/src/appender.ts:34

#### Overrides

[`AsyncAppender`](AsyncAppender.md).[`layout`](AsyncAppender.md#layout)

## Methods

### append()

> **append**(`entry`): `Promise`\<`void`\>

Defined in: packages/blue-logger/src/appender.ts:17

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`AsyncAppender`](AsyncAppender.md).[`append`](AsyncAppender.md#append)
