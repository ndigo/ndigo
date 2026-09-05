[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / InMemoryDataSource

# Class: InMemoryDataSource

Defined in: [packages/blue-orm/src/data-source.ts:39](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/data-source.ts#lines-39)

An in-memory implementation of the `DataSource` interface.
It stores entity data in JavaScript Maps.

## Implements

- [`DataSource`](../interfaces/DataSource.md)

## Constructors

### Constructor

> **new InMemoryDataSource**(): `InMemoryDataSource`

Defined in: [packages/blue-orm/src/data-source.ts:46](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/data-source.ts#lines-46)

Creates an instance of `InMemoryDataSource`.

#### Returns

`InMemoryDataSource`

## Properties

### destroyed

> **destroyed**: `boolean`

Defined in: [packages/blue-orm/src/data-source.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/data-source.ts#lines-40)

#### Implementation of

[`DataSource`](../interfaces/DataSource.md).[`destroyed`](../interfaces/DataSource.md#destroyed)

## Methods

### init()

> **init**(): `void`

Defined in: [packages/blue-orm/src/data-source.ts:54](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/data-source.ts#lines-54)

Initializes the data source. No operation for `InMemoryDataSource`.

#### Returns

`void`

#### Implementation of

[`DataSource`](../interfaces/DataSource.md).[`init`](../interfaces/DataSource.md#init)

***

### destroy()

> **destroy**(): `void`

Defined in: [packages/blue-orm/src/data-source.ts:59](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/data-source.ts#lines-59)

Destroys the data source by clearing all stores and marking it as destroyed.

#### Returns

`void`

#### Implementation of

[`DataSource`](../interfaces/DataSource.md).[`destroy`](../interfaces/DataSource.md#destroy)

***

### getStore()

> **getStore**\<`T`\>(`entityName`): `Map`\<`unknown`, `T`\>

Defined in: [packages/blue-orm/src/data-source.ts:70](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/data-source.ts#lines-70)

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

Defined in: [packages/blue-orm/src/data-source.ts:85](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/data-source.ts#lines-85)

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

### createStore()

> **createStore**(`entityName`): `void`

Defined in: [packages/blue-orm/src/data-source.ts:93](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/data-source.ts#lines-93)

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

### clear()

> **clear**(): `void`

Defined in: [packages/blue-orm/src/data-source.ts:102](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/data-source.ts#lines-102)

Clears all entity stores.

#### Returns

`void`

#### Implementation of

[`DataSource`](../interfaces/DataSource.md).[`clear`](../interfaces/DataSource.md#clear)

***

### snapshot()

> **snapshot**(): `object`

Defined in: [packages/blue-orm/src/data-source.ts:114](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/data-source.ts#lines-114)

Captures a deep snapshot of all entity stores (for transaction rollback).

Entity instances are shallow-cloned into new Maps so restore can rewind
to this exact point.

#### Returns

`object`

An opaque snapshot handle to pass to [restore](#restore).

##### stores

> **stores**: `Map`\<`string`, `Map`\<`unknown`, `unknown`\>\>

***

### restore()

> **restore**(`snapshot`): `void`

Defined in: [packages/blue-orm/src/data-source.ts:128](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/data-source.ts#lines-128)

Restores entity stores to a previously captured snapshot, discarding any
writes made after it. Used for transaction rollback.

#### Parameters

##### snapshot

The snapshot from [snapshot](#restore).

###### stores

`Map`\<`string`, `Map`\<`unknown`, `unknown`\>\>

#### Returns

`void`
