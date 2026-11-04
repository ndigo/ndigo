[**@ndigo/orm v0.0.1**](../README.md)

***

[@ndigo/orm](../README.md) / TransactionManager

# Interface: TransactionManager

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

### isActive()

> **isActive**(): `boolean`

Returns `true` if a transaction is currently active.

#### Returns

`boolean`

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
