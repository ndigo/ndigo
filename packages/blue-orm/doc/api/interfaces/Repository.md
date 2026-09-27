[**@blue/orm v0.0.1**](../README.md)

***

[@blue/orm](../README.md) / Repository

# Interface: Repository\<T, ID\>

Defines the basic contract for a repository, providing common data access operations for entities.

## Type Parameters

### T

`T` *extends* `object`

The type of the entity.

### ID

`ID`

The type of the entity's primary identifier.

## Methods

### count()

> **count**(): `number`

Returns the number of entities available.

#### Returns

`number`

The total number of entities.

***

### deleteById()

> **deleteById**(`id`): `boolean`

Deletes an entity by its ID.

#### Parameters

##### id

`ID`

The ID of the entity to delete.

#### Returns

`boolean`

`true` if the entity was found and deleted, `false` otherwise.

***

### existsById()

> **existsById**(`id`): `boolean`

Checks if an entity with the given ID exists.

#### Parameters

##### id

`ID`

The ID of the entity to check.

#### Returns

`boolean`

`true` if an entity with the given ID exists, `false` otherwise.

***

### findAll()

> **findAll**(`options?`): `T`[]

Retrieves all entities.

#### Parameters

##### options?

[`RelationFetchOptions`](RelationFetchOptions.md)

Optional relation loading (eager fetch).

#### Returns

`T`[]

An array containing all entities.

***

### findById()

> **findById**(`id`, `options?`): `T` \| `undefined`

Retrieves an entity by its ID.

#### Parameters

##### id

`ID`

The ID of the entity to retrieve.

##### options?

[`RelationFetchOptions`](RelationFetchOptions.md)

Optional relation loading (eager fetch).

#### Returns

`T` \| `undefined`

The entity with the given ID or `undefined` if not found.

***

### findPage()

> **findPage**(`request`): [`Page`](Page.md)\<`T`\>

Retrieves one page of entities, sorted and sliced per the request.
Sort properties must name declared entity fields; anything else fails loud.

#### Parameters

##### request

[`PageRequest`](PageRequest.md)

The page index (1-based), size, and optional sort orders.

#### Returns

[`Page`](Page.md)\<`T`\>

The requested page with totals. Pages beyond the last are empty.

***

### loadRelation()

> **loadRelation**(`entity`, `relationName`): `unknown`

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

`unknown`

The loaded relation value (entity, array, or undefined/[] when
  nothing relates).

***

### save()

> **save**(`entity`): `T`

Saves a given entity. If the entity already exists, it will be updated; otherwise, it will be created.

#### Parameters

##### entity

`T`

The entity to save.

#### Returns

`T`

The saved entity.
