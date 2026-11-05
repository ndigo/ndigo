[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [property-resolver](../README.md) / PropertyIndex

# Interface: PropertyIndex

Internal lookup strategy behind [PrototypalPropertyResolver](../classes/PrototypalPropertyResolver.md).

Strategies produce identical query results for identical registries; the
resolver picks one per platform (see the Phase 0 plan, D3/D6).

## Methods

### build()

> **build**(`sources`): `void`

Rebuilds the index from the given ordered sources (first = highest
precedence).

#### Parameters

##### sources

[`PropertySource`](../../property-source/interfaces/PropertySource.md)[]

The ordered property sources.

#### Returns

`void`

***

### getProperty()

> **getProperty**(`key`): `JSONValue` \| `undefined`

Resolves a property value, or `undefined` when absent.

#### Parameters

##### key

`string`

The property name (keypath syntax).

#### Returns

`JSONValue` \| `undefined`

The resolved value or `undefined`.

***

### hasProperty()

> **hasProperty**(`key`): `boolean`

Returns whether the property resolves to a non-null value.

#### Parameters

##### key

`string`

The property name (keypath syntax).

#### Returns

`boolean`

`true` when the property is defined.

***

### originOf()?

> `optional` **originOf**(`key`): `string` \| `undefined`

Returns the name of the source that won the given key — optional:
strategies that retain origins implement it; others omit it (the
resolver reports `null`). Top-level-key granularity (AD-16 D1/Q7).

#### Parameters

##### key

`string`

The top-level property key.

#### Returns

`string` \| `undefined`

The winning source name, or `undefined` when unsupported/unknown.
