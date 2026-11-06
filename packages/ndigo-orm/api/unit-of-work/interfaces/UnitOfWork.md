[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [unit-of-work](../README.md) / UnitOfWork

# Interface: UnitOfWork

Manages a set of changes to entities that will be committed as a single transaction.

Use [InMemoryUnitOfWork](../classes/InMemoryUnitOfWork.md) for in-memory stores or implement this interface
for SQL-backed data sources. Pair with [TransactionManager](../../transaction-manager/interfaces/TransactionManager.md) and the
[transactional](../../decorators/functions/transactional.md) decorator for full transactional workflows.

## Methods

### clear()

> **clear**(): `void`

Clears all registered entities from the Unit of Work, resetting its state.

#### Returns

`void`

***

### flush()

> **flush**(): `void`

Persists all registered changes (new, dirty, removed entities) to the `EntityManager`.
After flushing, the Unit of Work is cleared.

#### Returns

`void`

***

### getState()

> **getState**\<`T`\>(`entity`): [`EntityState`](../type-aliases/EntityState.md) \| `undefined`

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

### registerDirty()

> **registerDirty**\<`T`\>(`entity`): `void`

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

### registerNew()

> **registerNew**\<`T`\>(`entity`): `void`

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

### registerRemoved()

> **registerRemoved**\<`T`\>(`entity`): `void`

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
