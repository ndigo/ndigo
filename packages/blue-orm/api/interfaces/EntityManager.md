[**@blue/orm v0.0.1**](../README.md)

***

[@blue/orm](../README.md) / EntityManager

# Interface: EntityManager

Manages the lifecycle of entities, including persistence, retrieval, and removal.

## Methods

### clear()

> **clear**(): `void`

Clears all managed entities and resets identity counters.

#### Returns

`void`

***

### fetchRelation()

> **fetchRelation**(`entity`, `relationName`): `unknown`

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

`unknown`

The related entity, an array of related entities, or
  `undefined`/`[]` when nothing relates.

#### Throws

When the relation or its join column is not
  declared, or for many-to-many relations (join-table semantics not
  implemented).

***

### find()

> **find**\<`T`\>(`entityClass`, `id`): `T` \| `undefined`

Finds an entity by its class and primary ID.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The constructor of the entity class.

##### id

`unknown`

The primary ID of the entity.

#### Returns

`T` \| `undefined`

The found entity or `undefined` if not found.

***

### findAll()

> **findAll**\<`T`\>(`entityClass`): `T`[]

Finds all entities of a given class.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entityClass

`Constructable`\<`T`\>

The constructor of the entity class.

#### Returns

`T`[]

An array of all found entities.

***

### flush()

> **flush**(): `void`

Flushes any pending changes to the data source.

#### Returns

`void`

***

### persist()

> **persist**\<`T`\>(`entity`): `void`

Persists a new entity or updates an existing one.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

The entity to persist.

#### Returns

`void`

#### Throws

If the entity class is not decorated with `@entity` or is missing a `@primaryColumn`.

***

### remove()

> **remove**\<`T`\>(`entity`): `void`

Removes an entity from persistence.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

The entity to remove.

#### Returns

`void`
