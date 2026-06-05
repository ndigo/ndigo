[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MetadataScanner

# Class: MetadataScanner

Defined in: packages/blue-dispatcher/src/metadata-manager.ts:29

Create a new MetadataScanner for a given target.

## Classdesc

Scan a class or prototype for TC39 decorator metadata stored in Symbol.metadata and cache property names.

**TC39 Decorator Migration Note:**
This class has been updated to work with TC39 Stage 3 decorators. It scans Symbol.metadata
on class constructors instead of using the legacy Reflect.getMetadata API.

Metadata keys are expected to follow patterns like:
- `route:mapping` (class-level)
- `route:mapping:methodName` (method-level)
- `method:parameter:methodName` (method parameter info)

## Param

Class constructor, prototype, or instance

## Constructors

### Constructor

> **new MetadataScanner**(`target?`): `MetadataScanner`

Defined in: packages/blue-dispatcher/src/metadata-manager.ts:45

Create a scanner for a target object.

#### Parameters

##### target?

`Record`\<`string`, `any`\> = `{}`

The object, prototype, or constructor to scan.

#### Returns

`MetadataScanner`

## Properties

### \_cache

> **\_cache**: `MultiValueMap`\<`string`, `string`\>

Defined in: packages/blue-dispatcher/src/metadata-manager.ts:33

Cached metadata lookups for the current target.

***

### \_target

> **\_target**: `Record`\<`string`, `any`\>

Defined in: packages/blue-dispatcher/src/metadata-manager.ts:38

Target object whose metadata is being scanned.

## Methods

### get()

> **get**(`metadataKey`): `string`[]

Defined in: packages/blue-dispatcher/src/metadata-manager.ts:153

Get the property names that match a metadata key.

#### Parameters

##### metadataKey

`string`

The metadata key to query.

#### Returns

`string`[]

The matching property names, or `undefined` when none are found.

***

### clear()

> **clear**(): `void`

Defined in: packages/blue-dispatcher/src/metadata-manager.ts:171

Clear all cached metadata lookups for this scanner.

#### Returns

`void`
