[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [repository](../README.md) / InMemoryDerivedQueryRepository

# Class: InMemoryDerivedQueryRepository\<T, ID\>

Base repository with in-memory derived-query support.

Concrete repositories declare derived methods and delegate to [derive](#derive):

```ts
class AccountRepository extends InMemoryDerivedQueryRepository<Account, string> {
    findByEmail(email: string): Account[] {
        return this.derive('findByEmail', [email]);
    }
}
```

## Extends

- [`AbstractRepository`](AbstractRepository.md)\<`T`, `ID`\>

## Extended by

- [`InMemoryRepository`](InMemoryRepository.md)

## Type Parameters

### T

`T` *extends* `object`

The type of the entity.

### ID

`ID`

The type of the entity's primary identifier.

## Constructors

### Constructor

> **new InMemoryDerivedQueryRepository**\<`T`, `ID`\>(`entityClass`, `entityManager`): `InMemoryDerivedQueryRepository`\<`T`, `ID`\>

Creates an instance of `AbstractRepository`.

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The constructor of the entity class this repository manages.

##### entityManager

[`EntityManager`](../../entity-manager/interfaces/EntityManager.md)

The `EntityManager` to use for data operations.

#### Returns

`InMemoryDerivedQueryRepository`\<`T`, `ID`\>

#### Inherited from

[`AbstractRepository`](AbstractRepository.md).[`constructor`](AbstractRepository.md#constructor)

## Methods

### count()

> **count**(): `number`

Returns the number of entities available by fetching all and counting them.

#### Returns

`number`

The total number of entities.

#### Inherited from

[`AbstractRepository`](AbstractRepository.md).[`count`](AbstractRepository.md#count)

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

[`AbstractRepository`](AbstractRepository.md).[`deleteById`](AbstractRepository.md#deletebyid)

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

[`AbstractRepository`](AbstractRepository.md).[`existsById`](AbstractRepository.md#existsbyid)

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

[`AbstractRepository`](AbstractRepository.md).[`findAll`](AbstractRepository.md#findall)

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

[`AbstractRepository`](AbstractRepository.md).[`findById`](AbstractRepository.md#findbyid)

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

[`AbstractRepository`](AbstractRepository.md).[`findPage`](AbstractRepository.md#findpage)

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

[`AbstractRepository`](AbstractRepository.md).[`loadRelation`](AbstractRepository.md#loadrelation)

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

[`AbstractRepository`](AbstractRepository.md).[`save`](AbstractRepository.md#save)
