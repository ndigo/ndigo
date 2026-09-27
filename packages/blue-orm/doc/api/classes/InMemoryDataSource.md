[**@blue/orm v0.0.1**](../README.md)

***

[@blue/orm](../README.md) / InMemoryDataSource

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

Entity instances are shallow-cloned into new Maps so restore can rewind
to this exact point.

#### Returns

`object`

An opaque snapshot handle to pass to [restore](#restore).

##### stores

> **stores**: `Map`\<`string`, `Map`\<`unknown`, `unknown`\>\>
