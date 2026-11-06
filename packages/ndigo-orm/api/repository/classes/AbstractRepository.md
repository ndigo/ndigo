[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [repository](../README.md) / AbstractRepository

# Abstract Class: AbstractRepository\<T, ID\>

An abstract base class for implementing the `Repository` interface.
Provides common functionality for interacting with an `EntityManager`.

## Extended by

- [`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md)

## Type Parameters

### T

`T` *extends* `object`

The type of the entity.

### ID

`ID`

The type of the entity's primary identifier.

## Implements

- [`Repository`](../interfaces/Repository.md)\<`T`, `ID`\>

## Constructors

### Constructor

> **new AbstractRepository**\<`T`, `ID`\>(`entityClass`, `entityManager`): `AbstractRepository`\<`T`, `ID`\>

Creates an instance of `AbstractRepository`.

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The constructor of the entity class this repository manages.

##### entityManager

[`EntityManager`](../../entity-manager/interfaces/EntityManager.md)

The `EntityManager` to use for data operations.

#### Returns

`AbstractRepository`\<`T`, `ID`\>

## Methods

### count()

> **count**(): `number`

Returns the number of entities available by fetching all and counting them.

#### Returns

`number`

The total number of entities.

#### Implementation of

[`Repository`](../interfaces/Repository.md).[`count`](../interfaces/Repository.md#count)

***

### deleteById()

> **deleteById**(`id`): `boolean`

Deletes an entity by its ID. It first finds the entity and then removes it via the `EntityManager`.

#### Parameters

##### id

`ID`

The ID of the entity to delete.

#### Returns

`boolean`

`true` if the entity was found and deleted, `false` otherwise.

#### Implementation of

[`Repository`](../interfaces/Repository.md).[`deleteById`](../interfaces/Repository.md#deletebyid)

***

### existsById()

> **existsById**(`id`): `boolean`

Checks if an entity with the given ID exists by attempting to find it.

#### Parameters

##### id

`ID`

The ID of the entity to check.

#### Returns

`boolean`

`true` if an entity with the given ID exists, `false` otherwise.

#### Implementation of

[`Repository`](../interfaces/Repository.md).[`existsById`](../interfaces/Repository.md#existsbyid)

***

### findAll()

> **findAll**(`options?`): `T`[]

Retrieves all entities of the managed type using the `EntityManager`.

#### Parameters

##### options?

[`RelationFetchOptions`](../interfaces/RelationFetchOptions.md) = `{}`

Optional relation loading (eager fetch).

#### Returns

`T`[]

All entities of the managed type.

#### Implementation of

[`Repository`](../interfaces/Repository.md).[`findAll`](../interfaces/Repository.md#findall)

***

### findById()

> **findById**(`id`, `options?`): `T` \| `undefined`

Retrieves an entity by its ID using the `EntityManager`.

#### Parameters

##### id

`ID`

The ID of the entity to retrieve.

##### options?

[`RelationFetchOptions`](../interfaces/RelationFetchOptions.md) = `{}`

Optional relation loading (eager fetch).

#### Returns

`T` \| `undefined`

The entity with the given ID or `undefined` if not found.

#### Implementation of

[`Repository`](../interfaces/Repository.md).[`findById`](../interfaces/Repository.md#findbyid)

***

### findPage()

> **findPage**(`request`): [`Page`](../../page/interfaces/Page.md)\<`T`\>

Retrieves one page of entities, sorted and sliced per the request.
Sort properties must name declared entity fields; anything else fails loud.

#### Parameters

##### request

[`PageRequest`](../../page/interfaces/PageRequest.md)

The page index (1-based), size, and optional sort orders.

#### Returns

[`Page`](../../page/interfaces/Page.md)\<`T`\>

The requested page with totals. Pages beyond the last are empty.

#### Implementation of

[`Repository`](../interfaces/Repository.md).[`findPage`](../interfaces/Repository.md#findpage)

***

### loadRelation()

> **loadRelation**(`entity`, `relationName`): `unknown`

#### Parameters

##### entity

`T`

##### relationName

`string`

#### Returns

`unknown`

#### Implementation of

[`Repository`](../interfaces/Repository.md).[`loadRelation`](../interfaces/Repository.md#loadrelation)

***

### save()

> **save**(`entity`): `T`

Saves a given entity by persisting it through the `EntityManager`.

#### Parameters

##### entity

`T`

The entity to save.

#### Returns

`T`

The saved entity.

#### Implementation of

[`Repository`](../interfaces/Repository.md).[`save`](../interfaces/Repository.md#save)
