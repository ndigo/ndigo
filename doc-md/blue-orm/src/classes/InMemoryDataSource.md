[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / InMemoryDataSource

# Class: InMemoryDataSource

Defined in: packages/blue-orm/src/data-source.ts:39

An in-memory implementation of the `DataSource` interface.
It stores entity data in JavaScript Maps.

## Implements

- [`DataSource`](../interfaces/DataSource.md)

## Constructors

### Constructor

> **new InMemoryDataSource**(): `InMemoryDataSource`

Defined in: packages/blue-orm/src/data-source.ts:46

Creates an instance of `InMemoryDataSource`.

#### Returns

`InMemoryDataSource`

## Properties

### destroyed

> **destroyed**: `boolean`

Defined in: packages/blue-orm/src/data-source.ts:40

#### Implementation of

[`DataSource`](../interfaces/DataSource.md).[`destroyed`](../interfaces/DataSource.md#destroyed)

## Methods

### init()

> **init**(): `void`

Defined in: packages/blue-orm/src/data-source.ts:54

Initializes the data source. No operation for `InMemoryDataSource`.

#### Returns

`void`

#### Implementation of

[`DataSource`](../interfaces/DataSource.md).[`init`](../interfaces/DataSource.md#init)

***

### destroy()

> **destroy**(): `void`

Defined in: packages/blue-orm/src/data-source.ts:59

Destroys the data source by clearing all stores and marking it as destroyed.

#### Returns

`void`

#### Implementation of

[`DataSource`](../interfaces/DataSource.md).[`destroy`](../interfaces/DataSource.md#destroy)

***

### getStore()

> **getStore**\<`T`\>(`entityName`): `Map`\<`unknown`, `T`\>

Defined in: packages/blue-orm/src/data-source.ts:70

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

Defined in: packages/blue-orm/src/data-source.ts:85

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

Defined in: packages/blue-orm/src/data-source.ts:93

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

Defined in: packages/blue-orm/src/data-source.ts:102

Clears all entity stores.

#### Returns

`void`

#### Implementation of

[`DataSource`](../interfaces/DataSource.md).[`clear`](../interfaces/DataSource.md#clear)
