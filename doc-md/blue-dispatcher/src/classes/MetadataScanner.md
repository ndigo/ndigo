[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MetadataScanner

# Class: MetadataScanner

Defined in: packages/blue-dispatcher/src/metadata-manager.ts:20

Create a new MetadataScanner for a given target.

## Classdesc

Scan an object for metadata defined on the object’s values and cache the resulting property names for subsequent scans.


## Constructors

### Constructor

> **new MetadataScanner**(`target`): `MetadataScanner`

Defined in: packages/blue-dispatcher/src/metadata-manager.ts:24

#### Parameters

##### target

`Record`\<`string`, `any`\>

#### Returns

`MetadataScanner`

## Properties

### \_cache

> **\_cache**: [`MultiValueMap`](../../../blue-core/src/classes/MultiValueMap.md)\<`string`, `string`\>

Defined in: packages/blue-dispatcher/src/metadata-manager.ts:21

***

### \_target

> **\_target**: `Record`\<`string`, `any`\>

Defined in: packages/blue-dispatcher/src/metadata-manager.ts:22

## Methods

### get()

> **get**(`metadataKey`): `string`[]

Defined in: packages/blue-dispatcher/src/metadata-manager.ts:65

Get the property names of the target object that have the requested metadata.
    *

#### Parameters

##### metadataKey

`string`

#### Returns

`string`[]

The property names on the target that have metadata.

***

### clear()

> **clear**(): `void`

Defined in: packages/blue-dispatcher/src/metadata-manager.ts:80

Clear the metadata cache for the target object.

#### Returns

`void`
