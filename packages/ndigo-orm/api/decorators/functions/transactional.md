[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [decorators](../README.md) / transactional

# Function: transactional()

> **transactional**(): (`target`, `context`) => `Function`

Marks a method as participating in a transaction.

When the decorated method is called on a class instance that has a
`transactionManager` property implementing [TransactionManager](../../transaction-manager/interfaces/TransactionManager.md),
the method body is automatically wrapped in `transactionManager.run(fn)`.

If no `transactionManager` property is found on the instance, the method
is called directly (graceful degradation — useful in unit tests that do
not need real transaction boundaries).

Transaction metadata is also recorded on `Symbol.metadata` under the
`transactionalMetadataKey` key so that runtime introspection is possible.

## Returns

(`target`, `context`) => `Function`

## Example

```typescript
class OrderService {
    transactionManager: TransactionManager;

    constructor(txManager: TransactionManager) {
        this.transactionManager = txManager;
    }

    @transactional()
    async placeOrder(order: Order): Promise<void> {
        // automatically wrapped in transactionManager.run(...)
    }
}
```
