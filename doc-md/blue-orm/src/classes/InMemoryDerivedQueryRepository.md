[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / InMemoryDerivedQueryRepository

# Class: InMemoryDerivedQueryRepository\<T, ID\>

Defined in: packages/blue-orm/src/repository.ts:154

Base repository with in-memory Spring Data-style derived-query support.

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

Defined in: packages/blue-orm/src/repository.ts:65

Creates an instance of `AbstractRepository`.

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The constructor of the entity class this repository manages.

##### entityManager

[`EntityManager`](../interfaces/EntityManager.md)

The `EntityManager` to use for data operations.

#### Returns

`InMemoryDerivedQueryRepository`\<`T`, `ID`\>

#### Inherited from

[`AbstractRepository`](AbstractRepository.md).[`constructor`](AbstractRepository.md#constructor)

## Methods

### getEntityClass()

> `protected` **getEntityClass**(): `Constructable`\<`T`\>

Defined in: packages/blue-orm/src/repository.ts:73

The entity class this repository manages.

#### Returns

`Constructable`\<`T`\>

#### Inherited from

[`AbstractRepository`](AbstractRepository.md).[`getEntityClass`](AbstractRepository.md#getentityclass)

***

### save()

> **save**(`entity`): `T`

Defined in: packages/blue-orm/src/repository.ts:82

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

***

### findById()

> **findById**(`id`): `T` \| `undefined`

Defined in: packages/blue-orm/src/repository.ts:92

Retrieves an entity by its ID using the `EntityManager`.

#### Parameters

##### id

`ID`

The ID of the entity to retrieve.

#### Returns

`T` \| `undefined`

The entity with the given ID or `undefined` if not found.

#### Inherited from

[`AbstractRepository`](AbstractRepository.md).[`findById`](AbstractRepository.md#findbyid)

***

### findAll()

> **findAll**(): `T`[]

Defined in: packages/blue-orm/src/repository.ts:100

Retrieves all entities of the managed type using the `EntityManager`.

#### Returns

`T`[]

An array containing all entities.

#### Inherited from

[`AbstractRepository`](AbstractRepository.md).[`findAll`](AbstractRepository.md#findall)

***

### deleteById()

> **deleteById**(`id`): `boolean`

Defined in: packages/blue-orm/src/repository.ts:109

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

### count()

> **count**(): `number`

Defined in: packages/blue-orm/src/repository.ts:124

Returns the number of entities available by fetching all and counting them.

#### Returns

`number`

The total number of entities.

#### Inherited from

[`AbstractRepository`](AbstractRepository.md).[`count`](AbstractRepository.md#count)

***

### existsById()

> **existsById**(`id`): `boolean`

Defined in: packages/blue-orm/src/repository.ts:133

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

### derive()

> **derive**(`methodName`, `args`): `T`[]

Defined in: packages/blue-orm/src/repository.ts:163

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
