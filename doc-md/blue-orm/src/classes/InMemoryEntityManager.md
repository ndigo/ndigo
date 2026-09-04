[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / InMemoryEntityManager

# Class: InMemoryEntityManager

Defined in: packages/blue-orm/src/entity-manager.ts:49

An in-memory implementation of the `EntityManager` interface.
It uses an `InMemoryDataSource` to store and manage entities.

## Implements

- [`EntityManager`](../interfaces/EntityManager.md)

## Constructors

### Constructor

> **new InMemoryEntityManager**(`dataSource`): `InMemoryEntityManager`

Defined in: packages/blue-orm/src/entity-manager.ts:57

Creates an instance of `InMemoryEntityManager`.

#### Parameters

##### dataSource

[`DataSource`](../interfaces/DataSource.md)

The data source to use for entity storage.

#### Returns

`InMemoryEntityManager`

## Methods

### persist()

> **persist**\<`T`\>(`entity`): `void`

Defined in: packages/blue-orm/src/entity-manager.ts:73

Persists a new entity or updates an existing one in the in-memory store.
Automatically assigns generated primary IDs if applicable.
Runs any `@prePersist` / `@preUpdate` lifecycle hooks and calls `validate()`
on the entity if the method exists (e.g. via `@validated` from `@blue/validate`).

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

The entity to persist.

#### Returns

`void`

#### Throws

If the entity class is not decorated with `@entity`,
is missing a `@primaryColumn`, or the primary column value is `undefined` or `null`.

#### Throws

If the entity has a `validate()` method and validation fails.

#### Implementation of

[`EntityManager`](../interfaces/EntityManager.md).[`persist`](../interfaces/EntityManager.md#persist)

***

### find()

> **find**\<`T`\>(`entityClass`, `id`): `T` \| `undefined`

Defined in: packages/blue-orm/src/entity-manager.ts:115

Finds an entity by its class and primary ID in the in-memory store.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The constructor of the entity class.

##### id

`unknown`

The primary ID of the entity.

#### Returns

`T` \| `undefined`

The found entity or `undefined` if not found.

#### Implementation of

[`EntityManager`](../interfaces/EntityManager.md).[`find`](../interfaces/EntityManager.md#find)

***

### findAll()

> **findAll**\<`T`\>(`entityClass`): `T`[]

Defined in: packages/blue-orm/src/entity-manager.ts:134

Finds all entities of a given class in the in-memory store.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The constructor of the entity class.

#### Returns

`T`[]

An array of all found entities.

#### Implementation of

[`EntityManager`](../interfaces/EntityManager.md).[`findAll`](../interfaces/EntityManager.md#findall)

***

### remove()

> **remove**\<`T`\>(`entity`): `void`

Defined in: packages/blue-orm/src/entity-manager.ts:152

Removes an entity from the in-memory store.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

The entity to remove.

#### Returns

`void`

#### Implementation of

[`EntityManager`](../interfaces/EntityManager.md).[`remove`](../interfaces/EntityManager.md#remove)

***

### flush()

> **flush**(): `void`

Defined in: packages/blue-orm/src/entity-manager.ts:171

Flushes any pending changes to the data source. No operation for `InMemoryEntityManager`.

#### Returns

`void`

#### Implementation of

[`EntityManager`](../interfaces/EntityManager.md).[`flush`](../interfaces/EntityManager.md#flush)

***

### clear()

> **clear**(): `void`

Defined in: packages/blue-orm/src/entity-manager.ts:176

Clears all managed entities and resets identity counters in the in-memory store.

#### Returns

`void`

#### Implementation of

[`EntityManager`](../interfaces/EntityManager.md).[`clear`](../interfaces/EntityManager.md#clear)
