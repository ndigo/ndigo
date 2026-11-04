[**@ndigo/orm v0.0.1**](../README.md)

***

[@ndigo/orm](../README.md) / InMemoryDataSource

# Class: InMemoryDataSource

An in-memory implementation of the `DataSource` interface.
It stores entity data in JavaScript Maps.

## Implements

- [`DataSource`](../interfaces/DataSource.md)

## Constructors

### Constructor

> **new InMemoryDataSource**(): `InMemoryDataSource`

Creates an instance of `InMemoryDataSource`.

#### Returns

`InMemoryDataSource`

## Properties

### destroyed

> **destroyed**: `boolean`

#### Implementation of

[`DataSource`](../interfaces/DataSource.md).[`destroyed`](../interfaces/DataSource.md#destroyed)

## Methods

### clear()

> **clear**(): `void`

Clears all entity stores.

#### Returns

`void`

#### Implementation of

[`DataSource`](../interfaces/DataSource.md).[`clear`](../interfaces/DataSource.md#clear)

***

### createStore()

> **createStore**(`entityName`): `void`

Creates a new store for the given entity name if it doesn't already exist.

#### Parameters

##### entityName

`string`

The name of the entity.

#### Returns

`void`

#### Implementation of

[`DataSource`](../interfaces/DataSource.md).[`createStore`](../interfaces/DataSource.md#createstore)

***

### destroy()

> **destroy**(): `void`

Destroys the data source by clearing all stores and marking it as destroyed.

#### Returns

`void`

#### Implementation of

[`DataSource`](../interfaces/DataSource.md).[`destroy`](../interfaces/DataSource.md#destroy)

***

### getStore()

> **getStore**\<`T`\>(`entityName`): `Map`\<`unknown`, `T`\>

Retrieves the store for a given entity name.

#### Type Parameters

##### T

`T`

#### Parameters

##### entityName

`string`

The name of the entity.

#### Returns

`Map`\<`unknown`, `T`\>

A Map representing the entity store.

#### Throws

If the store for the entity does not exist.

#### Implementation of

[`DataSource`](../interfaces/DataSource.md).[`getStore`](../interfaces/DataSource.md#getstore)

***

### hasStore()

> **hasStore**(`entityName`): `boolean`

Checks if a store for the given entity name exists.

#### Parameters

##### entityName

`string`

The name of the entity.

#### Returns

`boolean`

`true` if the store exists, `false` otherwise.

#### Implementation of

[`DataSource`](../interfaces/DataSource.md).[`hasStore`](../interfaces/DataSource.md#hasstore)

***

### init()

> **init**(): `void`

Initializes the data source. No operation for `InMemoryDataSource`.

#### Returns

`void`

#### Implementation of

[`DataSource`](../interfaces/DataSource.md).[`init`](../interfaces/DataSource.md#init)

***

### restore()

> **restore**(`snapshot`): `void`

Restores entity stores to a previously captured snapshot, discarding any
writes made after it. Used for transaction rollback.

Entities are re-cloned from the snapshot, so the handle stays pristine
and can be restored repeatedly. Rollback restores the store-visible
state: entities read back after a restore are clones of their
pre-snapshot values. References callers held to entities before the
snapshot still observe their own later mutations — after a restore the
stores no longer alias those objects.

#### Parameters

##### snapshot

The snapshot from `snapshot()`.

###### stores

`Map`\<`string`, `Map`\<`unknown`, `unknown`\>\>

#### Returns

`void`

***

### snapshot()

> **snapshot**(): `object`

Captures a deep snapshot of all entity stores (for transaction rollback).

Every stored entity is deep-cloned — values and nested references are
copied, object prototypes are preserved so restored entities remain
valid class instances, and cycles/shared references are kept intact.
Store keys are kept as-is (primary identifiers), and the snapshot is
isolated from mutations made after this call.

Own enumerable state is copied, so entities with ECMAScript private
fields should implement the [ENTITY\_CLONE](../variables/ENTITY_CLONE.md) hook to carry that
state across a snapshot/restore (DAT-F7).

#### Returns

`object`

An opaque snapshot handle to pass to [restore](#restore).

##### stores

> **stores**: `Map`\<`string`, `Map`\<`unknown`, `unknown`\>\>
