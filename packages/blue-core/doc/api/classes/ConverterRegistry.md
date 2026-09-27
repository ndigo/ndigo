[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / ConverterRegistry

# Class: ConverterRegistry

A registry that maps source/target type pairs to converter instances.

Converters are looked up by the runtime identity of their source and target
types (e.g., `String`, `Date`). This enables the dispatch layer to resolve
conversions dynamically without hard-coded switch statements.

## Constructors

### Constructor

> **new ConverterRegistry**(): `ConverterRegistry`

#### Returns

`ConverterRegistry`

## Methods

### clear()

> **clear**(): `void`

Clears all registered converters.

#### Returns

`void`

***

### getAll()

> **getAll**(): `object`[]

Returns all registered converters as an array of entries.

#### Returns

`object`[]

***

### getConverter()

> **getConverter**(`sourceType`, `targetType`): `any`

Retrieves the converter for a given source/target type pair.

#### Parameters

##### sourceType

`unknown`

Runtime identity of the source type.

##### targetType

`unknown`

Runtime identity of the target type.

#### Returns

`any`

The converter instance, or `undefined` if none is registered.

***

### hasConverter()

> **hasConverter**(`sourceType`, `targetType`): `boolean`

Checks whether a converter exists for the given source/target type pair.

#### Parameters

##### sourceType

`unknown`

Runtime identity of the source type.

##### targetType

`unknown`

Runtime identity of the target type.

#### Returns

`boolean`

`true` if a converter is registered.

***

### register()

> **register**(`converter`, `sourceType`, `targetType`): `void`

Registers a converter for the given source/target type pair.

#### Parameters

##### converter

`unknown`

The converter instance (must have a `convert` method).

##### sourceType

`unknown`

Runtime identity of the source type (e.g., `String`, `Date`).

##### targetType

`unknown`

Runtime identity of the target type (e.g., `UUID`, `Number`).

#### Returns

`void`

***

### unregister()

> **unregister**(`sourceType`, `targetType`): `void`

Removes the converter for the given source/target type pair.

#### Parameters

##### sourceType

`unknown`

Runtime identity of the source type.

##### targetType

`unknown`

Runtime identity of the target type.

#### Returns

`void`
