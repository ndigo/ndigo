[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [entity-manager](../README.md) / InMemoryEntityManager

# Class: InMemoryEntityManager

An in-memory implementation of the `EntityManager` interface.
It uses an `InMemoryDataSource` to store and manage entities.

## Implements

- [`EntityManager`](../interfaces/EntityManager.md)

## Constructors

### Constructor

> **new InMemoryEntityManager**(`dataSource`): `InMemoryEntityManager`

Creates an instance of `InMemoryEntityManager`.

#### Parameters

##### dataSource

[`DataSource`](../../data-source/interfaces/DataSource.md)

The data source to use for entity storage.

#### Returns

`InMemoryEntityManager`

## Methods

### clear()

> **clear**(): `void`

Clears all managed entities and resets identity counters in the in-memory store.

#### Returns

`void`

#### Implementation of

[`EntityManager`](../interfaces/EntityManager.md).[`clear`](../interfaces/EntityManager.md#clear)

***

### fetchRelation()

> **fetchRelation**(`entity`, `relationName`): `unknown`

Loads one declared relation of an entity: the related entity for the
owning side (many-to-one, one-to-one) or the related entities for the
inverse side (one-to-many, one-to-one). Does not mutate the entity.

#### Parameters

##### entity

`object`

The entity whose relation is loaded.

##### relationName

`string`

The declared relation field name.

#### Returns

`unknown`

The related entity, an array of related entities, or
  `undefined`/`[]` when nothing relates.

#### Throws

When the relation or its join column is not
  declared, or for many-to-many relations (join-table semantics not
  implemented).

#### Implementation of

[`EntityManager`](../interfaces/EntityManager.md).[`fetchRelation`](../interfaces/EntityManager.md#fetchrelation)

***

### find()

> **find**\<`T`\>(`entityClass`, `id`): `T` \| `undefined`

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

### flush()

> **flush**(): `void`

Flushes any pending changes to the data source. No operation for `InMemoryEntityManager`.

#### Returns

`void`

#### Implementation of

[`EntityManager`](../interfaces/EntityManager.md).[`flush`](../interfaces/EntityManager.md#flush)

***

### persist()

> **persist**\<`T`\>(`entity`): `void`

Persists a new entity or updates an existing one in the in-memory store.
Automatically assigns generated primary IDs if applicable.
Runs any `@prePersist` / `@preUpdate` lifecycle hooks, then validates the
entity against its Zod schema derived from `@column` metadata (AD-07).

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

### remove()

> **remove**\<`T`\>(`entity`): `void`

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
