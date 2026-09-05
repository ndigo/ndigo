[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / JSONLayout

# Class: JSONLayout

Defined in: packages/blue-logger/src/layouts/json-layout.ts:11

## Extends

- [`NullLayout`](NullLayout.md)

## Constructors

### Constructor

> **new JSONLayout**(): `JSONLayout`

Defined in: packages/blue-logger/src/layouts/json-layout.ts:17

#### Returns

`JSONLayout`

#### Overrides

[`NullLayout`](NullLayout.md).[`constructor`](NullLayout.md#constructor)

## Properties

### mediaType

> `readonly` **mediaType**: [`MediaType`](../../../blue-core/src/classes/MediaType.md)

Defined in: packages/blue-logger/src/layouts/json-layout.ts:12

#### Overrides

[`NullLayout`](NullLayout.md).[`mediaType`](NullLayout.md#mediatype)

---

### batchFooter

> `readonly` **batchFooter**: `string`

Defined in: packages/blue-logger/src/layouts/json-layout.ts:13

#### Overrides

[`NullLayout`](NullLayout.md).[`batchFooter`](NullLayout.md#batchfooter)

---

### batchHeader

> `readonly` **batchHeader**: `string`

Defined in: packages/blue-logger/src/layouts/json-layout.ts:14

#### Overrides

[`NullLayout`](NullLayout.md).[`batchHeader`](NullLayout.md#batchheader)

---

### batchSeparator

> `readonly` **batchSeparator**: `string`

Defined in: packages/blue-logger/src/layouts/json-layout.ts:15

#### Overrides

[`NullLayout`](NullLayout.md).[`batchSeparator`](NullLayout.md#batchseparator)

## Methods

### format()

> **format**(`entry`): `string`

Defined in: packages/blue-logger/src/layouts/json-layout.ts:46

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

#### Returns

`string`

#### Overrides

[`NullLayout`](NullLayout.md).[`format`](NullLayout.md#format)

---

### formatBatch()

> **formatBatch**(`entries`): `string`

Defined in: packages/blue-logger/src/layouts/null-layout.ts:26

#### Parameters

##### entries

[`Entry`](../type-aliases/Entry.md)[]

#### Returns

`string`

#### Inherited from

[`NullLayout`](NullLayout.md).[`formatBatch`](NullLayout.md#formatbatch)

---

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
