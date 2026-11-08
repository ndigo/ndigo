[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [drizzle-derived-query-repository](../README.md) / DrizzleDerivedQueryRepository

# Class: DrizzleDerivedQueryRepository\<T, ID\>

Async repository with derived-query support over
[DrizzleEntityManager](../../drizzle-entity-manager/classes/DrizzleEntityManager.md). Concrete repositories declare derived
methods and delegate to [derive](#derive):

```ts
class NoteRepository extends DrizzleDerivedQueryRepository<Note, number> {
    findByTitle(title: string): Promise<Note[]> {
        return this.derive('findByTitle', [title]);
    }
    findByPriorityTop3(priority: number): Promise<Note[]> {
        return this.derive('findByPriorityTop3', [priority]);
    }
}
```

Supported method names match `parseDerivedQuery`: equality filters joined
by `And`, an optional trailing `OrderBy<Property>[Asc|Desc]`, and an
optional trailing `First`/`Top<N>` limit (`findByPriorityTop3`). Every
matched property is a declared entity column, so the generated SQL is
allowlisted and parameterized.

## Extends

- [`DrizzleRepository`](../../drizzle-repository/classes/DrizzleRepository.md)\<`T`, `ID`\>

## Type Parameters

### T

`T` *extends* `object`

The entity type.

### ID

`ID`

The entity's primary identifier type.

## Constructors

### Constructor

> **new DrizzleDerivedQueryRepository**\<`T`, `ID`\>(`entityClass`, `entityManager`): `DrizzleDerivedQueryRepository`\<`T`, `ID`\>

Creates a repository for an entity class.

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The entity class this repository manages.

##### entityManager

[`DrizzleEntityManager`](../../drizzle-entity-manager/classes/DrizzleEntityManager.md)

The Drizzle entity manager used for data access.

#### Returns

`DrizzleDerivedQueryRepository`\<`T`, `ID`\>

#### Inherited from

[`DrizzleRepository`](../../drizzle-repository/classes/DrizzleRepository.md).[`constructor`](../../drizzle-repository/classes/DrizzleRepository.md#constructor)

## Methods

### count()

> **count**(): `Promise`\<`number`\>

Returns the number of entities of the managed type.

#### Returns

`Promise`\<`number`\>

The entity count.

#### Inherited from

[`DrizzleRepository`](../../drizzle-repository/classes/DrizzleRepository.md).[`count`](../../drizzle-repository/classes/DrizzleRepository.md#count)

***

### deleteById()

> **deleteById**(`id`): `Promise`\<`boolean`\>

Deletes an entity by its primary identifier.

#### Parameters

##### id

`ID`

The entity's primary identifier.

#### Returns

`Promise`\<`boolean`\>

`true` when the entity was found and deleted, `false` otherwise.

#### Inherited from

[`DrizzleRepository`](../../drizzle-repository/classes/DrizzleRepository.md).[`deleteById`](../../drizzle-repository/classes/DrizzleRepository.md#deletebyid)

***

### derive()

> **derive**(`methodName`, `args`): `Promise`\<`T`[]\>

Evaluates a derived-query method name against the database.

#### Parameters

##### methodName

`string`

The method name that was called.

##### args

`unknown`[]

The method arguments (query values).

#### Returns

`Promise`\<`T`[]\>

Matching entities, ordered and limited as parsed.

#### Throws

When the method name is not a supported derived query.

***

### existsById()

> **existsById**(`id`): `Promise`\<`boolean`\>

Checks whether an entity with the given primary identifier exists.

#### Parameters

##### id

`ID`

The entity's primary identifier.

#### Returns

`Promise`\<`boolean`\>

Whether the entity exists.

#### Inherited from

[`DrizzleRepository`](../../drizzle-repository/classes/DrizzleRepository.md).[`existsById`](../../drizzle-repository/classes/DrizzleRepository.md#existsbyid)

***

### findAll()

> **findAll**(`options?`): `Promise`\<`T`[]\>

Retrieves all entities of the managed type.

#### Parameters

##### options?

`RelationFetchOptions` = `{}`

Optional relation loading (eager fetch).

#### Returns

`Promise`\<`T`[]\>

All entities.

#### Inherited from

[`DrizzleRepository`](../../drizzle-repository/classes/DrizzleRepository.md).[`findAll`](../../drizzle-repository/classes/DrizzleRepository.md#findall)

***

### findById()

> **findById**(`id`, `options?`): `Promise`\<`T` \| `undefined`\>

Retrieves an entity by its primary identifier.

#### Parameters

##### id

`ID`

The entity's primary identifier.

##### options?

`RelationFetchOptions` = `{}`

Optional relation loading (eager fetch).

#### Returns

`Promise`\<`T` \| `undefined`\>

The entity, or `undefined` when not found.

#### Inherited from

[`DrizzleRepository`](../../drizzle-repository/classes/DrizzleRepository.md).[`findById`](../../drizzle-repository/classes/DrizzleRepository.md#findbyid)

***

### findPage()

> **findPage**(`request`): `Promise`\<`Page`\<`T`\>\>

Retrieves one page of entities; ordering and slicing happen in SQL.

#### Parameters

##### request

`PageRequest`

The page index (1-based), size, and optional sort orders.

#### Returns

`Promise`\<`Page`\<`T`\>\>

The requested page with totals.

#### Inherited from

[`DrizzleRepository`](../../drizzle-repository/classes/DrizzleRepository.md).[`findPage`](../../drizzle-repository/classes/DrizzleRepository.md#findpage)

***

### loadRelation()

> **loadRelation**(`entity`, `relationName`): `Promise`\<`unknown`\>

Loads a declared relation of an entity lazily and assigns it onto the
entity's field.

#### Parameters

##### entity

`T`

The entity whose relation is loaded.

##### relationName

`string`

The declared relation field name.

#### Returns

`Promise`\<`unknown`\>

The loaded relation value (entity, array, or undefined/[] when
  nothing relates).

#### Inherited from

[`DrizzleRepository`](../../drizzle-repository/classes/DrizzleRepository.md).[`loadRelation`](../../drizzle-repository/classes/DrizzleRepository.md#loadrelation)

***

### save()

> **save**(`entity`): `Promise`\<`T`\>

Persists (inserts or updates) the entity.

#### Parameters

##### entity

`T`

The entity to save.

#### Returns

`Promise`\<`T`\>

The saved entity.

#### Inherited from

[`DrizzleRepository`](../../drizzle-repository/classes/DrizzleRepository.md).[`save`](../../drizzle-repository/classes/DrizzleRepository.md#save)
