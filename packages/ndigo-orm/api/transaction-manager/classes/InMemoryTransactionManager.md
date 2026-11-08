[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [transaction-manager](../README.md) / InMemoryTransactionManager

# Class: InMemoryTransactionManager

An in-memory implementation of [TransactionManager](../interfaces/TransactionManager.md) with snapshot
rollback.

On `run()`, the backing [InMemoryDataSource](../../data-source/classes/InMemoryDataSource.md)'s stores are
deep-snapshotted; if `fn` throws, the stores are restored to that snapshot
(rollback). Otherwise the transaction commits (writes stay).

Rollback restores the store-visible state: entities read back afterwards
are clones of their pre-transaction values. References callers held to
entities before the transaction keep their own later mutations — the stores
no longer alias them after a rollback.

Overlapping `run()` calls are rejected (the backing store can only hold one
snapshot at a time); a second concurrent call fails loud rather than
silently discarding the first run's commits on rollback (DAT-F2).

## Implements

- [`TransactionManager`](../interfaces/TransactionManager.md)

## Constructors

### Constructor

> **new InMemoryTransactionManager**(`dataSource`): `InMemoryTransactionManager`

Creates the manager over an in-memory data source.

#### Parameters

##### dataSource

[`InMemoryDataSource`](../../data-source/classes/InMemoryDataSource.md)

The in-memory data source to snapshot/roll back.

#### Returns

`InMemoryTransactionManager`

## Methods

### isActive()

> **isActive**(): `boolean`

Whether a transaction is currently active.

#### Returns

`boolean`

Whether a run is in progress.

#### Implementation of

[`TransactionManager`](../interfaces/TransactionManager.md).[`isActive`](../interfaces/TransactionManager.md#isactive)

***

### run()

> **run**\<`T`\>(`fn`): `Promise`\<`T`\>

Runs `fn` in a transaction, rolling the snapshot back on failure.

#### Type Parameters

##### T

`T`

#### Parameters

##### fn

() => `T` \| `Promise`\<`T`\>

The work to run.

#### Returns

`Promise`\<`T`\>

The work's result.

#### Implementation of

[`TransactionManager`](../interfaces/TransactionManager.md).[`run`](../interfaces/TransactionManager.md#run)
