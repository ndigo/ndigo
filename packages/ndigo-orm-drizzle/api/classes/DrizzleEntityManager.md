[**@ndigo/orm-drizzle v0.0.1**](../README.md)

***

[@ndigo/orm-drizzle](../README.md) / DrizzleEntityManager

# Class: DrizzleEntityManager

## Constructors

### Constructor

> **new DrizzleEntityManager**(`dataSource`): `DrizzleEntityManager`

#### Parameters

##### dataSource

[`DrizzleDataSource`](DrizzleDataSource.md)

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

##### relationName

`string`

#### Returns

`Promise`\<`unknown`\>

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

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entityClass

`Constructable`\<`T`\>

##### id

`unknown`

#### Returns

`Promise`\<`T` \| `undefined`\>

***

### findAll()

> **findAll**\<`T`\>(`entityClass`): `Promise`\<`T`[]\>

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entityClass

`Constructable`\<`T`\>

#### Returns

`Promise`\<`T`[]\>

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

##### conditions

`object`[]

##### options?

###### limit?

`number`

###### orderBy?

`SortOrder`[]

#### Returns

`Promise`\<`T`[]\>

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

##### request

`PageRequest`

#### Returns

`Promise`\<`Page`\<`T`\>\>

***

### persist()

> **persist**\<`T`\>(`entity`): `Promise`\<`void`\>

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

#### Returns

`Promise`\<`void`\>

***

### remove()

> **remove**\<`T`\>(`entity`): `Promise`\<`void`\>

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

#### Returns

`Promise`\<`void`\>
