[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / Repository

# Interface: Repository\<T, ID\>

Defined in: packages/blue-orm/src/repository.ts:11

Defines the basic contract for a repository, providing common data access operations for entities.

## Type Parameters

### T

`T` *extends* `object`

The type of the entity.

### ID

`ID`

The type of the entity's primary identifier.

## Methods

### save()

> **save**(`entity`): `T`

Defined in: packages/blue-orm/src/repository.ts:17

Saves a given entity. If the entity already exists, it will be updated; otherwise, it will be created.

#### Parameters

##### entity

`T`

The entity to save.

#### Returns

`T`

The saved entity.

***

### findById()

> **findById**(`id`): `T` \| `undefined`

Defined in: packages/blue-orm/src/repository.ts:23

Retrieves an entity by its ID.

#### Parameters

##### id

`ID`

The ID of the entity to retrieve.

#### Returns

`T` \| `undefined`

The entity with the given ID or `undefined` if not found.

***

### findAll()

> **findAll**(): `T`[]

Defined in: packages/blue-orm/src/repository.ts:28

Retrieves all entities.

#### Returns

`T`[]

An array containing all entities.

***

### deleteById()

> **deleteById**(`id`): `boolean`

Defined in: packages/blue-orm/src/repository.ts:34

Deletes an entity by its ID.

#### Parameters

##### id

`ID`

The ID of the entity to delete.

#### Returns

`boolean`

`true` if the entity was found and deleted, `false` otherwise.

***

### count()

> **count**(): `number`

Defined in: packages/blue-orm/src/repository.ts:39

Returns the number of entities available.

#### Returns

`number`

The total number of entities.

***

### existsById()

> **existsById**(`id`): `boolean`

Defined in: packages/blue-orm/src/repository.ts:45

Checks if an entity with the given ID exists.

#### Parameters

##### id

`ID`

The ID of the entity to check.

#### Returns

`boolean`

`true` if an entity with the given ID exists, `false` otherwise.
