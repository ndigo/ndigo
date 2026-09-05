[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / InMemoryRepository

# Class: InMemoryRepository\<T, ID\>

Defined in: [packages/blue-orm/src/repository.ts:186](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/repository.ts#lines-186)

An in-memory implementation of a repository, extending `AbstractRepository`.
It uses an `InMemoryEntityManager` for data operations, and supports derived
queries via [InMemoryDerivedQueryRepository.derive](InMemoryDerivedQueryRepository.md#derive).

## Extends

- [`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md)\<`T`, `ID`\>

## Type Parameters

### T

`T` *extends* `object`

The type of the entity.

### ID

`ID`

The type of the entity's primary identifier.

## Constructors

### Constructor

> **new InMemoryRepository**\<`T`, `ID`\>(`entityClass`, `entityManager`): `InMemoryRepository`\<`T`, `ID`\>

Defined in: [packages/blue-orm/src/repository.ts:192](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/repository.ts#lines-192)

Creates an instance of `InMemoryRepository`.

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The constructor of the entity class this repository manages.

##### entityManager

[`EntityManager`](../interfaces/EntityManager.md)

The `EntityManager` to use for data operations.

#### Returns

`InMemoryRepository`\<`T`, `ID`\>

#### Overrides

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`constructor`](InMemoryDerivedQueryRepository.md#constructor)

## Methods

### getEntityClass()

> `protected` **getEntityClass**(): `Constructable`\<`T`\>

Defined in: [packages/blue-orm/src/repository.ts:73](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/repository.ts#lines-73)

The entity class this repository manages.

#### Returns

`Constructable`\<`T`\>

#### Inherited from

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`getEntityClass`](InMemoryDerivedQueryRepository.md#getentityclass)

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

#### Inherited from

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`save`](InMemoryDerivedQueryRepository.md#save)

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

#### Inherited from

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`findById`](InMemoryDerivedQueryRepository.md#findbyid)

***

### findAll()

> **findAll**(): `T`[]

Defined in: [packages/blue-orm/src/repository.ts:100](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/repository.ts#lines-100)

Retrieves all entities of the managed type using the `EntityManager`.

#### Returns

`T`[]

An array containing all entities.

#### Inherited from

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`findAll`](InMemoryDerivedQueryRepository.md#findall)

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

#### Inherited from

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`deleteById`](InMemoryDerivedQueryRepository.md#deletebyid)

***

### count()

> **count**(): `number`

Defined in: [packages/blue-orm/src/repository.ts:124](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/repository.ts#lines-124)

Returns the number of entities available by fetching all and counting them.

#### Returns

`number`

The total number of entities.

#### Inherited from

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`count`](InMemoryDerivedQueryRepository.md#count)

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

#### Inherited from

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`existsById`](InMemoryDerivedQueryRepository.md#existsbyid)

***

### derive()

> **derive**(`methodName`, `args`): `T`[]

Defined in: [packages/blue-orm/src/repository.ts:163](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/repository.ts#lines-163)

Evaluates a derived-query method name against `this.findAll()`.

#### Parameters

##### methodName

`string`

The method name that was called.

##### args

`unknown`[]

The method arguments (query values).

#### Returns

`T`[]

Matching entities.

#### Throws

When the method name is not a supported derived query.

#### Inherited from

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`derive`](InMemoryDerivedQueryRepository.md#derive)
