[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / UnitOfWork

# Interface: UnitOfWork

Defined in: packages/blue-orm/src/unit-of-work.ts:22

Manages a set of changes to entities that will be committed as a single transaction.

Use [InMemoryUnitOfWork](../classes/InMemoryUnitOfWork.md) for in-memory stores or implement this interface
for SQL-backed data sources. Pair with [TransactionManager](TransactionManager.md) and the
[transactional](../functions/transactional.md) decorator for full transactional workflows.

## Since

1.0.0

## Methods

### registerNew()

> **registerNew**\<`T`\>(`entity`): `void`

Defined in: packages/blue-orm/src/unit-of-work.ts:27

Registers a new entity to be persisted.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

The entity to register.

#### Returns

`void`

***

### registerDirty()

> **registerDirty**\<`T`\>(`entity`): `void`

Defined in: packages/blue-orm/src/unit-of-work.ts:32

Registers an existing entity whose state has been modified.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

The entity to register.

#### Returns

`void`

***

### registerRemoved()

> **registerRemoved**\<`T`\>(`entity`): `void`

Defined in: packages/blue-orm/src/unit-of-work.ts:37

Registers an entity to be removed.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

The entity to register.

#### Returns

`void`

***

### getState()

> **getState**\<`T`\>(`entity`): [`EntityState`](../type-aliases/EntityState.md) \| `undefined`

Defined in: packages/blue-orm/src/unit-of-work.ts:43

Gets the current state of an entity within the Unit of Work.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

The entity to check.

#### Returns

[`EntityState`](../type-aliases/EntityState.md) \| `undefined`

The `EntityState` or `undefined` if the entity is not tracked.

***

### flush()

> **flush**(): `void`

Defined in: packages/blue-orm/src/unit-of-work.ts:48

Persists all registered changes (new, dirty, removed entities) to the `EntityManager`.
After flushing, the Unit of Work is cleared.

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: packages/blue-orm/src/unit-of-work.ts:52

Clears all registered entities from the Unit of Work, resetting its state.

#### Returns

`void`
