[**@blue/orm v0.0.1**](../README.md)

***

[@blue/orm](../README.md) / InMemoryTransactionManager

# Class: InMemoryTransactionManager

An in-memory implementation of [TransactionManager](../interfaces/TransactionManager.md) with snapshot
rollback.

On `run()`, the backing [InMemoryDataSource](InMemoryDataSource.md)'s stores are snapshotted;
if `fn` throws, the stores are restored to that snapshot (rollback).
Otherwise the transaction commits (writes stay).

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
