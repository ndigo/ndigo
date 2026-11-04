[**@ndigo/orm v0.0.1**](../README.md)

***

[@ndigo/orm](../README.md) / InMemoryUnitOfWork

# Class: InMemoryUnitOfWork

An in-memory implementation of the [UnitOfWork](../interfaces/UnitOfWork.md) interface.
Tracks new, dirty, and removed entities and flushes changes via an `EntityManager`.

Use this class in tests or with `InMemoryEntityManager`. For SQL-backed stores,
implement `UnitOfWork` with your `EntityManager` adapter.

## Since

1.0.0

## Implements

- [`UnitOfWork`](../interfaces/UnitOfWork.md)

## Constructors

### Constructor

> **new InMemoryUnitOfWork**(`entityManager`): `InMemoryUnitOfWork`

Creates an instance of `InMemoryUnitOfWork`.

#### Parameters

##### entityManager

[`EntityManager`](../interfaces/EntityManager.md)

The `EntityManager` to use for persisting changes.

#### Returns

`InMemoryUnitOfWork`

## Methods

### clear()

> **clear**(): `void`

Clears all registered entities from the Unit of Work, resetting its state.

#### Returns

`void`

#### Implementation of

[`UnitOfWork`](../interfaces/UnitOfWork.md).[`clear`](../interfaces/UnitOfWork.md#clear)

***

### flush()

> **flush**(): `void`

Persists all registered changes (new, dirty, removed entities) to the `EntityManager`.
New and dirty entities are persisted, removed entities are removed.
After flushing, the Unit of Work is cleared.

#### Returns

`void`

#### Implementation of

[`UnitOfWork`](../interfaces/UnitOfWork.md).[`flush`](../interfaces/UnitOfWork.md#flush)

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

The `EntityState` ('new', 'managed', 'removed') or `undefined` if the entity is not tracked.

#### Implementation of

[`UnitOfWork`](../interfaces/UnitOfWork.md).[`getState`](../interfaces/UnitOfWork.md#getstate)

***

### registerDirty()

> **registerDirty**\<`T`\>(`entity`): `void`

Registers an existing entity whose state has been modified.
An entity is only marked dirty if it's not new or removed.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

The entity to register.

#### Returns

`void`

#### Implementation of

[`UnitOfWork`](../interfaces/UnitOfWork.md).[`registerDirty`](../interfaces/UnitOfWork.md#registerdirty)

***

### registerNew()

> **registerNew**\<`T`\>(`entity`): `void`

Registers a new entity to be persisted.
If the entity was previously marked for removal or dirty, those registrations are cleared.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

The entity to register.

#### Returns

`void`

#### Implementation of

[`UnitOfWork`](../interfaces/UnitOfWork.md).[`registerNew`](../interfaces/UnitOfWork.md#registernew)

***

### registerRemoved()

> **registerRemoved**\<`T`\>(`entity`): `void`

Registers an entity to be removed.
If the entity was previously marked as new or dirty, those registrations are cleared.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### entity

`T`

The entity to register.

#### Returns

`void`

#### Implementation of

[`UnitOfWork`](../interfaces/UnitOfWork.md).[`registerRemoved`](../interfaces/UnitOfWork.md#registerremoved)
