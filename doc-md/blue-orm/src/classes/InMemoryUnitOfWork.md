[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / InMemoryUnitOfWork

# Class: InMemoryUnitOfWork

Defined in: packages/blue-orm/src/unit-of-work.ts:64

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

Defined in: packages/blue-orm/src/unit-of-work.ts:74

Creates an instance of `InMemoryUnitOfWork`.

#### Parameters

##### entityManager

[`EntityManager`](../interfaces/EntityManager.md)

The `EntityManager` to use for persisting changes.

#### Returns

`InMemoryUnitOfWork`

## Methods

### registerNew()

> **registerNew**\<`T`\>(`entity`): `void`

Defined in: packages/blue-orm/src/unit-of-work.ts:86

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

### registerDirty()

> **registerDirty**\<`T`\>(`entity`): `void`

Defined in: packages/blue-orm/src/unit-of-work.ts:97

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

### registerRemoved()

> **registerRemoved**\<`T`\>(`entity`): `void`

Defined in: packages/blue-orm/src/unit-of-work.ts:110

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

***

### getState()

> **getState**\<`T`\>(`entity`): [`EntityState`](../type-aliases/EntityState.md) \| `undefined`

Defined in: packages/blue-orm/src/unit-of-work.ts:121

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

### flush()

> **flush**(): `void`

Defined in: packages/blue-orm/src/unit-of-work.ts:142

Persists all registered changes (new, dirty, removed entities) to the `EntityManager`.
New and dirty entities are persisted, removed entities are removed.
After flushing, the Unit of Work is cleared.

#### Returns

`void`

#### Implementation of

[`UnitOfWork`](../interfaces/UnitOfWork.md).[`flush`](../interfaces/UnitOfWork.md#flush)

***

### clear()

> **clear**(): `void`

Defined in: packages/blue-orm/src/unit-of-work.ts:162

Clears all registered entities from the Unit of Work, resetting its state.

#### Returns

`void`

#### Implementation of

[`UnitOfWork`](../interfaces/UnitOfWork.md).[`clear`](../interfaces/UnitOfWork.md#clear)
