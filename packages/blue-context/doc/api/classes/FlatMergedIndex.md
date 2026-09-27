[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / FlatMergedIndex

# Class: FlatMergedIndex

Index that merges sources into one flat object on build.

Top-level keys are taken first-source-wins, so lookups are a single
property read instead of a prototype-chain walk. Per-key winning sources
are retained for origin tracking (Phase 5). Captured source maps are
replaced, not mutated — in-place edits after build stay invisible until
the next rebuild.

## Implements

- [`PropertyIndex`](../interfaces/PropertyIndex.md)

## Constructors

### Constructor

> **new FlatMergedIndex**(): `FlatMergedIndex`

#### Returns

`FlatMergedIndex`

## Methods

### build()

> **build**(`sources`): `void`

Rebuilds the index from the given ordered sources (first = highest
precedence).

#### Parameters

##### sources

[`PropertySource`](../interfaces/PropertySource.md)[]

The ordered property sources.

#### Returns

`void`

#### Implementation of

[`PropertyIndex`](../interfaces/PropertyIndex.md).[`build`](../interfaces/PropertyIndex.md#build)

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

#### Implementation of

[`PropertyIndex`](../interfaces/PropertyIndex.md).[`getProperty`](../interfaces/PropertyIndex.md#getproperty)

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

#### Implementation of

[`PropertyIndex`](../interfaces/PropertyIndex.md).[`hasProperty`](../interfaces/PropertyIndex.md#hasproperty)

***

### originOf()

> **originOf**(`key`): `string` \| `undefined`

Returns the name of the source that first defined the top-level segment
of the key (`server.port` reports the source owning `server` — top-level
granularity, AD-16 D1/Q7).

#### Parameters

##### key

`string`

The property key (only the top-level segment is consulted).

#### Returns

`string` \| `undefined`

The winning source name, or `undefined`.

#### Implementation of

[`PropertyIndex`](../interfaces/PropertyIndex.md).[`originOf`](../interfaces/PropertyIndex.md#originof)
