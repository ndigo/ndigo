[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [property-resolver](../README.md) / PrototypeChainIndex

# Class: PrototypeChainIndex

Index that layers sources through a prototype chain.

The chain object gives source precedence only for top-level keys; deeper
tokens index into the resolved value, matching the framework's historical
resolution semantics. Mutations to a captured source map remain visible
without a rebuild.

## Implements

- [`PropertyIndex`](../interfaces/PropertyIndex.md)

## Constructors

### Constructor

> **new PrototypeChainIndex**(): `PrototypeChainIndex`

#### Returns

`PrototypeChainIndex`

## Methods

### build()

> **build**(`sources`): `void`

Builds the index from sources.

#### Parameters

##### sources

[`PropertySource`](../../property-source/interfaces/PropertySource.md)[]

The property sources.

#### Returns

`void`

#### Implementation of

[`PropertyIndex`](../interfaces/PropertyIndex.md).[`build`](../interfaces/PropertyIndex.md#build)

***

### getProperty()

> **getProperty**(`key`): `JSONValue` \| `undefined`

Gets a property.

#### Parameters

##### key

`string`

The key.

#### Returns

`JSONValue` \| `undefined`

The value.

#### Implementation of

[`PropertyIndex`](../interfaces/PropertyIndex.md).[`getProperty`](../interfaces/PropertyIndex.md#getproperty)

***

### hasProperty()

> **hasProperty**(`key`): `boolean`

Whether a property exists.

#### Parameters

##### key

`string`

The key.

#### Returns

`boolean`

`true` when present.

#### Implementation of

[`PropertyIndex`](../interfaces/PropertyIndex.md).[`hasProperty`](../interfaces/PropertyIndex.md#hasproperty)
