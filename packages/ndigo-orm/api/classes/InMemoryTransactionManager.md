[**@ndigo/orm v0.0.1**](../README.md)

***

[@ndigo/orm](../README.md) / InMemoryTransactionManager

# Class: InMemoryTransactionManager

An in-memory implementation of [TransactionManager](../interfaces/TransactionManager.md) with snapshot
rollback.

On `run()`, the backing [InMemoryDataSource](InMemoryDataSource.md)'s stores are
deep-snapshotted; if `fn` throws, the stores are restored to that snapshot
(rollback). Otherwise the transaction commits (writes stay).

Rollback restores the store-visible state: entities read back afterwards
are clones of their pre-transaction values. References callers held to
entities before the transaction keep their own later mutations — the stores
no longer alias them after a rollback.

Overlapping `run()` calls are rejected (the backing store can only hold one
snapshot at a time); a second concurrent call fails loud rather than
silently discarding the first run's commits on rollback (DAT-F2).

## Since

1.0.0

## Implements

- [`TransactionManager`](../interfaces/TransactionManager.md)

## Constructors

### Constructor

> **new InMemoryTransactionManager**(`dataSource`): `InMemoryTransactionManager`

#### Parameters

##### dataSource

[`InMemoryDataSource`](InMemoryDataSource.md)

The in-memory data source to snapshot/roll back.

#### Returns

`InMemoryTransactionManager`

## Methods

### isActive()

> **isActive**(): `boolean`

Returns `true` if a transaction is currently active.

#### Returns

`boolean`

#### Implementation of

[`TransactionManager`](../interfaces/TransactionManager.md).[`isActive`](../interfaces/TransactionManager.md#isactive)

***

### run()

> **run**\<`T`\>(`fn`): `Promise`\<`T`\>

Executes `fn` within a transaction.
If `fn` throws or rejects, the transaction is rolled back.
Otherwise, the transaction is committed.

#### Type Parameters

##### T

`T`

#### Parameters

##### fn

() => `T` \| `Promise`\<`T`\>

The work to execute inside the transaction.

#### Returns

`Promise`\<`T`\>

A promise that resolves to the return value of `fn`.

#### Implementation of

[`TransactionManager`](../interfaces/TransactionManager.md).[`run`](../interfaces/TransactionManager.md#run)
