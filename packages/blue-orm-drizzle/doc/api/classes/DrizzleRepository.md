[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / DrizzleRepository

# Class: DrizzleRepository\<T, ID\>

Async repository over a [DrizzleEntityManager](DrizzleEntityManager.md) for one entity type.

## Since

1.0.0

## Extended by

- [`DrizzleDerivedQueryRepository`](DrizzleDerivedQueryRepository.md)

## Type Parameters

### T

`T` *extends* `object`

The entity type.

### ID

`ID`

The entity's primary identifier type.

## Constructors

### Constructor

> **new DrizzleRepository**\<`T`, `ID`\>(`entityClass`, `entityManager`): `DrizzleRepository`\<`T`, `ID`\>

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The entity class this repository manages.

##### entityManager

[`DrizzleEntityManager`](DrizzleEntityManager.md)

The Drizzle entity manager used for data access.

#### Returns

`DrizzleRepository`\<`T`, `ID`\>

## Methods

### count()

> **count**(): `Promise`\<`number`\>

Returns the number of entities of the managed type.

#### Returns

`Promise`\<`number`\>

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

***

### existsById()

> **existsById**(`id`): `Promise`\<`boolean`\>

Checks whether an entity with the given primary identifier exists.

#### Parameters

##### id

`ID`

#### Returns

`Promise`\<`boolean`\>

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
