[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / PrototypeChainIndex

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
