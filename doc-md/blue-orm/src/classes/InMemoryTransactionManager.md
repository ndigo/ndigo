[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / InMemoryTransactionManager

# Class: InMemoryTransactionManager

Defined in: packages/blue-orm/src/transaction-manager.ts:59

An in-memory implementation of [TransactionManager](../interfaces/TransactionManager.md).

This implementation does **not** provide rollback semantics
(there is no durable state to roll back). It exists to:
- Allow code decorated with [transactional](../functions/transactional.md) to run in tests
  without a real database.
- Serve as a reference for the `TransactionManager` contract.

## Since

1.0.0

## Implements

- [`TransactionManager`](../interfaces/TransactionManager.md)

## Constructors

### Constructor

> **new InMemoryTransactionManager**(): `InMemoryTransactionManager`

#### Returns

`InMemoryTransactionManager`

## Methods

### isActive()

> **isActive**(): `boolean`

Defined in: packages/blue-orm/src/transaction-manager.ts:63

Returns `true` if a transaction is currently active.

#### Returns

`boolean`

#### Implementation of

[`TransactionManager`](../interfaces/TransactionManager.md).[`isActive`](../interfaces/TransactionManager.md#isactive)

***

### run()

> **run**\<`T`\>(`fn`): `Promise`\<`T`\>

Defined in: packages/blue-orm/src/transaction-manager.ts:68

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
