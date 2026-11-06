[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [repository](../README.md) / InMemoryRepository

# Class: InMemoryRepository\<T, ID\>

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

Creates an instance of `InMemoryRepository`.

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The constructor of the entity class this repository manages.

##### entityManager

[`EntityManager`](../../entity-manager/interfaces/EntityManager.md)

The `EntityManager` to use for data operations.

#### Returns

`InMemoryRepository`\<`T`, `ID`\>

#### Overrides

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`constructor`](InMemoryDerivedQueryRepository.md#constructor)

## Methods

### count()

> **count**(): `number`

Returns the number of entities available by fetching all and counting them.

#### Returns

`number`

The total number of entities.

#### Inherited from

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`count`](InMemoryDerivedQueryRepository.md#count)

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

#### Inherited from

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`deleteById`](InMemoryDerivedQueryRepository.md#deletebyid)

***

### derive()

> **derive**(`methodName`, `args`): `T`[]

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

#### Inherited from

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`existsById`](InMemoryDerivedQueryRepository.md#existsbyid)

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

#### Inherited from

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`findAll`](InMemoryDerivedQueryRepository.md#findall)

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

#### Inherited from

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`findById`](InMemoryDerivedQueryRepository.md#findbyid)

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

#### Inherited from

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`findPage`](InMemoryDerivedQueryRepository.md#findpage)

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

#### Inherited from

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`loadRelation`](InMemoryDerivedQueryRepository.md#loadrelation)

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

#### Inherited from

[`InMemoryDerivedQueryRepository`](InMemoryDerivedQueryRepository.md).[`save`](InMemoryDerivedQueryRepository.md#save)
