[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / MetadataScanner

# Class: MetadataScanner

Create a new MetadataScanner for a given target.
Invoked via the `classdesc` decorator.

**TC39 Decorator Migration Note:**
This class has been updated to work with TC39 Stage 3 decorators. It scans Symbol.metadata
on class constructors instead of using the legacy Reflect.getMetadata API.

Metadata keys are expected to follow patterns like:
- `route:mapping` (class-level)
- `route:mapping:methodName` (method-level)
- `method:parameter:methodName` (method parameter info)

## Param

**target**

Class constructor, prototype, or instance

## Constructors

### Constructor

> **new MetadataScanner**(`target?`): `MetadataScanner`

Create a scanner for a target object.

#### Parameters

##### target?

`Record`\<`string`, `unknown`\> = `{}`

The object, prototype, or constructor to scan.

#### Returns

`MetadataScanner`

## Properties

### \_cache

> **\_cache**: `MultiValueMap`\<`string`, `string`\>

Cached metadata lookups for the current target.

***

### \_target

> **\_target**: `Record`\<`string`, `unknown`\>

Target object whose metadata is being scanned.

## Methods

### clear()

> **clear**(): `void`

Clear all cached metadata lookups for this scanner.

#### Returns

`void`

***

### get()

> **get**(`metadataKey`): `string`[] \| `undefined`

Get the property names that match a metadata key.

#### Parameters

##### metadataKey

`string`

The metadata key to query.

#### Returns

`string`[] \| `undefined`

The matching property names, or `undefined` when none are found.
