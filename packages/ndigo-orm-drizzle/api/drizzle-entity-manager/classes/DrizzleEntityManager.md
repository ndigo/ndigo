[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [drizzle-entity-manager](../README.md) / DrizzleEntityManager

# Class: DrizzleEntityManager

Drizzle-backed entity manager: maps `@ndigo/orm` entity metadata onto SQL
through the data source's Drizzle database, validating every write against
the entity's derived schema and running lifecycle hooks around
persist/find/remove.

## Constructors

### Constructor

> **new DrizzleEntityManager**(`dataSource`): `DrizzleEntityManager`

#### Parameters

##### dataSource

[`DrizzleDataSource`](../../drizzle-data-source/classes/DrizzleDataSource.md)

#### Returns

`DrizzleEntityManager`

## Methods

### count()

> **count**\<`T`\>(`entityClass`): `Promise`\<`number`\>

Returns the number of rows of an entity type, counted in SQL (DA-7)
instead of materializing every row.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The entity class to count.

#### Returns

`Promise`\<`number`\>

***

### deleteById()

> **deleteById**\<`T`\>(`entityClass`, `id`): `Promise`\<`boolean`\>

Deletes a row by primary identifier in a single `DELETE` statement,
reporting whether a row matched.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The entity class to delete from.

##### id

`unknown`

The primary identifier value.

#### Returns

`Promise`\<`boolean`\>

`true` when a row was deleted, `false` otherwise.

***

### existsById()

> **existsById**\<`T`\>(`entityClass`, `id`): `Promise`\<`boolean`\>

Checks whether a row with the given primary identifier exists using an
SQL probe (`SELECT 1 … LIMIT 1`) rather than loading the entity.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The entity class to probe.

##### id

`unknown`

The primary identifier value.

#### Returns

`Promise`\<`boolean`\>

***

### fetchRelation()

> **fetchRelation**(`entity`, `relationName`): `Promise`\<`unknown`\>

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

`Promise`\<`unknown`\>

The loaded relation value.

#### Throws

When the relation, its join column, or the
  target class is not declared, or for many-to-many relations
  (join-table semantics not implemented).

***

### fetchRelations()

> **fetchRelations**(`entities`, `relationNames`): `Promise`\<`void`\>

Eagerly loads declared relations for a batch of entities of the same
class, issuing one query per relation over all distinct join keys rather
than one query per entity (DAT-F5). Each entity's relation field is
assigned the loaded value, mirroring [fetchRelation](#fetchrelation) semantics.

#### Parameters

##### entities

`object`[]

Entities of one class; an empty batch is a no-op.

##### relationNames

`string`[]

Declared relation field names to load.

#### Returns

`Promise`\<`void`\>

#### Throws

When a relation, its join column, or the
  target class is not declared, or for many-to-many relations.

***

### find()

> **find**\<`T`\>(`entityClass`, `id`): `Promise`\<`T` \| `undefined`\>

Finds an entity by its primary identifier.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The entity class.

##### id

`unknown`

The primary identifier.

#### Returns

`Promise`\<`T` \| `undefined`\>

The entity, or `undefined` when absent.

***

### findAll()

> **findAll**\<`T`\>(`entityClass`): `Promise`\<`T`[]\>

Returns all entities of a class.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The entity class.

#### Returns

`Promise`\<`T`[]\>

All entities.

***

### findAllWhere()

> **findAllWhere**\<`T`\>(`entityClass`, `conditions`, `options?`): `Promise`\<`T`[]\>

Finds rows matching equality conditions, with optional ordering and
limit — the building block for derived-query repositories. Sort
properties must name declared entity fields (validated before any SQL
runs); unlike `findPage`, no total counts are computed.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The entity class to query.

##### conditions

`object`[]

Equality conditions as column/value pairs.

##### options?

Optional ordering and limit.

###### limit?

`number`

###### orderBy?

`SortOrder`[]

#### Returns

`Promise`\<`T`[]\>

The matching entities.

***

### findPage()

> **findPage**\<`T`\>(`entityClass`, `request`): `Promise`\<`Page`\<`T`\>\>

Retrieves one page of entities with SQL-side ordering and slicing.
Sort properties must name declared entity fields (validated before any
SQL runs); column and direction fragments are allowlisted and quoted,
so the request can never inject SQL.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The entity class to page.

##### request

`PageRequest`

The page index (1-based), size, and sort orders.

#### Returns

`Promise`\<`Page`\<`T`\>\>

The requested page with totals.

***

### persist()

> **persist**\<`T`\>(`entity`): `Promise`\<`void`\>

Persists (inserts or updates) the entity.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

The entity to persist.

#### Returns

`Promise`\<`void`\>

A promise that resolves once persisted.

***

### remove()

> **remove**\<`T`\>(`entity`): `Promise`\<`void`\>

Removes an entity row.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

The entity to remove.

#### Returns

`Promise`\<`void`\>

A promise that resolves once removed.
