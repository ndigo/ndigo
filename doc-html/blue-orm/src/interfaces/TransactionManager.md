[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / TransactionManager

# Interface: TransactionManager

Defined in: [packages/blue-orm/src/transaction-manager.ts:32](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/transaction-manager.ts#lines-32)

Manages transaction boundaries for a data source.

Concrete implementations (e.g., `DrizzleTransactionManager`) wrap
the underlying database's begin/commit/rollback primitives.

Inject a `TransactionManager` into a service class to enable the
[transactional](../functions/transactional.md) decorator to enforce transaction boundaries:

## Example

```typescript
class OrderService {
    transactionManager: TransactionManager;

    constructor(txManager: TransactionManager) {
        this.transactionManager = txManager;
    }

    @transactional()
    async placeOrder(order: Order): Promise<void> {
        // runs inside a transaction
    }
}
```

## Since

1.0.0

## Methods

### run()

> **run**\<`T`\>(`fn`): `Promise`\<`T`\>

Defined in: [packages/blue-orm/src/transaction-manager.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/transaction-manager.ts#lines-40)

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

***

### isActive()

> **isActive**(): `boolean`

Defined in: [packages/blue-orm/src/transaction-manager.ts:45](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/transaction-manager.ts#lines-45)

Returns `true` if a transaction is currently active.

#### Returns

`boolean`
