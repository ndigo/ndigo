[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / XMLLayout

# Class: XMLLayout

Defined in: packages/blue-logger/src/layouts/xml-layout.ts:11

## Extends

- [`NullLayout`](NullLayout.md)

## Constructors

### Constructor

> **new XMLLayout**(): `XMLLayout`

Defined in: packages/blue-logger/src/layouts/xml-layout.ts:17

#### Returns

`XMLLayout`

#### Overrides

[`NullLayout`](NullLayout.md).[`constructor`](NullLayout.md#constructor)

## Properties

### mediaType

> `readonly` **mediaType**: [`MediaType`](../../../blue-core/src/classes/MediaType.md)

Defined in: packages/blue-logger/src/layouts/xml-layout.ts:12

#### Overrides

[`NullLayout`](NullLayout.md).[`mediaType`](NullLayout.md#mediatype)

---

### batchFooter

> **batchFooter**: `string`

Defined in: packages/blue-logger/src/layouts/xml-layout.ts:13

#### Overrides

[`NullLayout`](NullLayout.md).[`batchFooter`](NullLayout.md#batchfooter)

---

### batchHeader

> **batchHeader**: `string`

Defined in: packages/blue-logger/src/layouts/xml-layout.ts:14

#### Overrides

[`NullLayout`](NullLayout.md).[`batchHeader`](NullLayout.md#batchheader)

---

### batchSeparator

> **batchSeparator**: `string`

Defined in: packages/blue-logger/src/layouts/xml-layout.ts:15

#### Overrides

[`NullLayout`](NullLayout.md).[`batchSeparator`](NullLayout.md#batchseparator)

## Methods

### formatEntries()

> `protected` **formatEntries**(`entries`): `string`[]

Defined in: packages/blue-logger/src/layouts/null-layout.ts:31

#### Parameters

##### entries

[`Entry`](../type-aliases/Entry.md)[]

#### Returns

`string`[]

#### Inherited from

[`NullLayout`](NullLayout.md).[`formatEntries`](NullLayout.md#formatentries)

---

### format()

> **format**(`__namedParameters`): `string`

Defined in: packages/blue-logger/src/layouts/xml-layout.ts:46

#### Parameters

##### \_\_namedParameters

[`Entry`](../type-aliases/Entry.md)

#### Returns

`string`

#### Overrides

[`NullLayout`](NullLayout.md).[`format`](NullLayout.md#format)

---

### formatBatch()

> **formatBatch**(`entries`): `string`

Defined in: packages/blue-logger/src/layouts/xml-layout.ts:50

#### Parameters

##### entries

[`Entry`](../type-aliases/Entry.md)[]

#### Returns

`string`

#### Overrides

[`NullLayout`](NullLayout.md).[`formatBatch`](NullLayout.md#formatbatch)

---

### formatError()

> **formatError**(`error?`): `string`

Defined in: packages/blue-logger/src/layouts/xml-layout.ts:55

#### Parameters

##### error?

`Error`

#### Returns

`string`

---

### formatMessage()

> **formatMessage**(`message`): `string`

Defined in: packages/blue-logger/src/layouts/xml-layout.ts:61

#### Parameters

##### message

[`loggable`](../type-aliases/loggable.md)[]

#### Returns

`string`
