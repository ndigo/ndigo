[**@blue/orm-drizzle v0.0.1**](../README.md)

***

[@blue/orm-drizzle](../README.md) / DrizzleUnitOfWork

# Class: DrizzleUnitOfWork

Tracks new, dirty, and removed entities and flushes them to a Drizzle store
as a single async batch.

## Since

1.0.0

## Constructors

### Constructor

> **new DrizzleUnitOfWork**(`entityManager`): `DrizzleUnitOfWork`

#### Parameters

##### entityManager

[`DrizzleEntityManager`](DrizzleEntityManager.md)

The Drizzle entity manager used to persist.

#### Returns

`DrizzleUnitOfWork`

## Methods

### clear()

> **clear**(): `void`

Clears all registered entities without persisting.

#### Returns

`void`

***

### flush()

> **flush**(): `Promise`\<`void`\>

Persists all registered changes through the Drizzle entity manager:
new and dirty entities are upserted, removed entities are deleted.

#### Returns

`Promise`\<`void`\>

A promise that resolves once all writes have completed.

***

### getState()

> **getState**\<`T`\>(`entity`): `EntityState` \| `undefined`

Gets the current tracked state of an entity.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

#### Returns

`EntityState` \| `undefined`

`'new'`, `'managed'` (dirty), `'removed'`, or `undefined` when
  the entity is not tracked.

***

### registerDirty()

> **registerDirty**\<`T`\>(`entity`): `void`

Registers an existing entity whose state has changed. A new or removed
entity is not also marked dirty.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

#### Returns

`void`

***

### registerNew()

> **registerNew**\<`T`\>(`entity`): `void`

Registers a new entity to be persisted on the next flush.
Clears any prior removed/dirty registrations for the same entity.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

#### Returns

`void`

***

### registerRemoved()

> **registerRemoved**\<`T`\>(`entity`): `void`

Registers an entity to be removed on the next flush.
Clears any prior new/dirty registrations for the same entity.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

#### Returns

`void`
