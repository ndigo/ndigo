[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / EntityManager

# Interface: EntityManager

Defined in: packages/blue-orm/src/entity-manager.ts:10

Manages the lifecycle of entities, including persistence, retrieval, and removal.

## Methods

### persist()

> **persist**\<`T`\>(`entity`): `void`

Defined in: packages/blue-orm/src/entity-manager.ts:16

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

### find()

> **find**\<`T`\>(`entityClass`, `id`): `T` \| `undefined`

Defined in: packages/blue-orm/src/entity-manager.ts:23

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

Defined in: packages/blue-orm/src/entity-manager.ts:29

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

### remove()

> **remove**\<`T`\>(`entity`): `void`

Defined in: packages/blue-orm/src/entity-manager.ts:34

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

***

### flush()

> **flush**(): `void`

Defined in: packages/blue-orm/src/entity-manager.ts:38

Flushes any pending changes to the data source.

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: packages/blue-orm/src/entity-manager.ts:42

Clears all managed entities and resets identity counters.

#### Returns

`void`
