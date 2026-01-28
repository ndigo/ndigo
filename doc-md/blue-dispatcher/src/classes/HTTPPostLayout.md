[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / HTTPPostLayout

# Class: HTTPPostLayout

Defined in: packages/blue-dispatcher/src/logger/http-post-layout.ts:9

## Extends

- [`NullLayout`](../../../blue-logger/src/classes/NullLayout.md)

## Constructors

### Constructor

> **new HTTPPostLayout**(): `HTTPPostLayout`

Defined in: packages/blue-dispatcher/src/logger/http-post-layout.ts:12

#### Returns

`HTTPPostLayout`

#### Overrides

[`NullLayout`](../../../blue-logger/src/classes/NullLayout.md).[`constructor`](../../../blue-logger/src/classes/NullLayout.md#constructor)

## Properties

### mediaType

> `readonly` **mediaType**: [`MediaType`](../../../blue-core/src/classes/MediaType.md)

Defined in: packages/blue-dispatcher/src/logger/http-post-layout.ts:10

#### Overrides

[`NullLayout`](../../../blue-logger/src/classes/NullLayout.md).[`mediaType`](../../../blue-logger/src/classes/NullLayout.md#mediatype)

***

### batchFooter

> **batchFooter**: `string`

Defined in: packages/blue-logger/src/layout.ts:33

#### Inherited from

[`NullLayout`](../../../blue-logger/src/classes/NullLayout.md).[`batchFooter`](../../../blue-logger/src/classes/NullLayout.md#batchfooter)

***

### batchHeader

> **batchHeader**: `string`

Defined in: packages/blue-logger/src/layout.ts:34

#### Inherited from

[`NullLayout`](../../../blue-logger/src/classes/NullLayout.md).[`batchHeader`](../../../blue-logger/src/classes/NullLayout.md#batchheader)

***

### batchSeparator

> **batchSeparator**: `string`

Defined in: packages/blue-logger/src/layouts/null-layout.ts:9

#### Inherited from

[`NullLayout`](../../../blue-logger/src/classes/NullLayout.md).[`batchSeparator`](../../../blue-logger/src/classes/NullLayout.md#batchseparator)

## Methods

### format()

> **format**(`entry`): `string`

Defined in: packages/blue-dispatcher/src/logger/http-post-layout.ts:23

#### Parameters

##### entry

[`Entry`](../../../blue-logger/src/type-aliases/Entry.md)

#### Returns

`string`

#### Overrides

[`NullLayout`](../../../blue-logger/src/classes/NullLayout.md).[`format`](../../../blue-logger/src/classes/NullLayout.md#format)

***

### formatBatch()

> **formatBatch**(`entries`): `string`

Defined in: packages/blue-logger/src/layouts/null-layout.ts:26

#### Parameters

##### entries

[`Entry`](../../../blue-logger/src/type-aliases/Entry.md)[]

#### Returns

`string`

#### Inherited from

[`NullLayout`](../../../blue-logger/src/classes/NullLayout.md).[`formatBatch`](../../../blue-logger/src/classes/NullLayout.md#formatbatch)

***

### formatEntries()

> `protected` **formatEntries**(`entries`): `string`[]

Defined in: packages/blue-logger/src/layouts/null-layout.ts:31

#### Parameters

##### entries

[`Entry`](../../../blue-logger/src/type-aliases/Entry.md)[]

#### Returns

`string`[]

#### Inherited from

[`NullLayout`](../../../blue-logger/src/classes/NullLayout.md).[`formatEntries`](../../../blue-logger/src/classes/NullLayout.md#formatentries)
