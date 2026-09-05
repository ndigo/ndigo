[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / ConverterRegistry

# Class: ConverterRegistry

Defined in: [packages/blue-core/src/converter.ts:67](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/converter.ts#lines-67)

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

### register()

> **register**(`converter`, `sourceType`, `targetType`): `void`

Defined in: [packages/blue-core/src/converter.ts:76](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/converter.ts#lines-76)

Registers a converter for the given source/target type pair.

#### Parameters

##### converter

`any`

The converter instance (must have a `convert` method).

##### sourceType

`any`

Runtime identity of the source type (e.g., `String`, `Date`).

##### targetType

`any`

Runtime identity of the target type (e.g., `UUID`, `Number`).

#### Returns

`void`

***

### getConverter()

> **getConverter**(`sourceType`, `targetType`): `any`

Defined in: [packages/blue-core/src/converter.ts:88](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/converter.ts#lines-88)

Retrieves the converter for a given source/target type pair.

#### Parameters

##### sourceType

`any`

Runtime identity of the source type.

##### targetType

`any`

Runtime identity of the target type.

#### Returns

`any`

The converter instance, or `undefined` if none is registered.

***

### hasConverter()

> **hasConverter**(`sourceType`, `targetType`): `boolean`

Defined in: [packages/blue-core/src/converter.ts:98](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/converter.ts#lines-98)

Checks whether a converter exists for the given source/target type pair.

#### Parameters

##### sourceType

`any`

Runtime identity of the source type.

##### targetType

`any`

Runtime identity of the target type.

#### Returns

`boolean`

`true` if a converter is registered.

***

### unregister()

> **unregister**(`sourceType`, `targetType`): `void`

Defined in: [packages/blue-core/src/converter.ts:107](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/converter.ts#lines-107)

Removes the converter for the given source/target type pair.

#### Parameters

##### sourceType

`any`

Runtime identity of the source type.

##### targetType

`any`

Runtime identity of the target type.

#### Returns

`void`

***

### getAll()

> **getAll**(): `object`[]

Defined in: [packages/blue-core/src/converter.ts:114](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/converter.ts#lines-114)

Returns all registered converters as an array of entries.

#### Returns

`object`[]

***

### clear()

> **clear**(): `void`

Defined in: [packages/blue-core/src/converter.ts:121](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/converter.ts#lines-121)

Clears all registered converters.

#### Returns

`void`
