[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / AbstractRepository

# Abstract Class: AbstractRepository\<T, ID\>

Defined in: [packages/blue-orm/src/repository.ts:56](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/repository.ts#lines-56)

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

Defined in: [packages/blue-orm/src/repository.ts:65](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/repository.ts#lines-65)

Creates an instance of `AbstractRepository`.

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The constructor of the entity class this repository manages.

##### entityManager

[`EntityManager`](../interfaces/EntityManager.md)

The `EntityManager` to use for data operations.

#### Returns

`AbstractRepository`\<`T`, `ID`\>

## Methods

### getEntityClass()

> `protected` **getEntityClass**(): `Constructable`\<`T`\>

Defined in: [packages/blue-orm/src/repository.ts:73](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/repository.ts#lines-73)

The entity class this repository manages.

#### Returns

`Constructable`\<`T`\>

***

### save()

> **save**(`entity`): `T`

Defined in: [packages/blue-orm/src/repository.ts:82](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/repository.ts#lines-82)

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

***

### findById()

> **findById**(`id`): `T` \| `undefined`

Defined in: [packages/blue-orm/src/repository.ts:92](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/repository.ts#lines-92)

Retrieves an entity by its ID using the `EntityManager`.

#### Parameters

##### id

`ID`

The ID of the entity to retrieve.

#### Returns

`T` \| `undefined`

The entity with the given ID or `undefined` if not found.

#### Implementation of

[`Repository`](../interfaces/Repository.md).[`findById`](../interfaces/Repository.md#findbyid)

***

### findAll()

> **findAll**(): `T`[]

Defined in: [packages/blue-orm/src/repository.ts:100](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/repository.ts#lines-100)

Retrieves all entities of the managed type using the `EntityManager`.

#### Returns

`T`[]

An array containing all entities.

#### Implementation of

[`Repository`](../interfaces/Repository.md).[`findAll`](../interfaces/Repository.md#findall)

***

### deleteById()

> **deleteById**(`id`): `boolean`

Defined in: [packages/blue-orm/src/repository.ts:109](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/repository.ts#lines-109)

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

### count()

> **count**(): `number`

Defined in: [packages/blue-orm/src/repository.ts:124](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/repository.ts#lines-124)

Returns the number of entities available by fetching all and counting them.

#### Returns

`number`

The total number of entities.

#### Implementation of

[`Repository`](../interfaces/Repository.md).[`count`](../interfaces/Repository.md#count)

***

### existsById()

> **existsById**(`id`): `boolean`

Defined in: [packages/blue-orm/src/repository.ts:133](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/repository.ts#lines-133)

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
