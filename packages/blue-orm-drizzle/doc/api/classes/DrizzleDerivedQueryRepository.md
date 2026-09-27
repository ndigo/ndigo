[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / DrizzleDerivedQueryRepository

# Class: DrizzleDerivedQueryRepository\<T, ID\>

Async repository with Spring Data-style derived-query support over
[DrizzleEntityManager](DrizzleEntityManager.md). Concrete repositories declare derived
methods and delegate to [derive](#derive):

```ts
class NoteRepository extends DrizzleDerivedQueryRepository<Note, number> {
    findByTitle(title: string): Promise<Note[]> {
        return this.derive('findByTitle', [title]);
    }
    findTop3ByPriority(priority: number): Promise<Note[]> {
        return this.derive('findTop3ByPriority', [priority]);
    }
}
```

Supported method names match `parseDerivedQuery`: equality filters
joined by `And`, optional `OrderBy<Property>[Asc|Desc]`, optional
`First`/`Top<N>`. Every matched property is a declared entity column,
so the generated SQL is allowlisted and parameterized.

## Extends

- [`DrizzleRepository`](DrizzleRepository.md)\<`T`, `ID`\>

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

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The entity class this repository manages.

##### entityManager

[`DrizzleEntityManager`](DrizzleEntityManager.md)

The Drizzle entity manager used for data access.

#### Returns

`DrizzleDerivedQueryRepository`\<`T`, `ID`\>

#### Inherited from

[`DrizzleRepository`](DrizzleRepository.md).[`constructor`](DrizzleRepository.md#constructor)

## Methods

### count()

> **count**(): `Promise`\<`number`\>

Returns the number of entities of the managed type.

#### Returns

`Promise`\<`number`\>

#### Inherited from

[`DrizzleRepository`](DrizzleRepository.md).[`count`](DrizzleRepository.md#count)

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

[`DrizzleRepository`](DrizzleRepository.md).[`deleteById`](DrizzleRepository.md#deletebyid)

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

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[`DrizzleRepository`](DrizzleRepository.md).[`existsById`](DrizzleRepository.md#existsbyid)

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

#### Inherited from

[`DrizzleRepository`](DrizzleRepository.md).[`findAll`](DrizzleRepository.md#findall)

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

[`DrizzleRepository`](DrizzleRepository.md).[`findById`](DrizzleRepository.md#findbyid)

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

[`DrizzleRepository`](DrizzleRepository.md).[`findPage`](DrizzleRepository.md#findpage)

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

[`DrizzleRepository`](DrizzleRepository.md).[`loadRelation`](DrizzleRepository.md#loadrelation)

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

[`DrizzleRepository`](DrizzleRepository.md).[`save`](DrizzleRepository.md#save)
