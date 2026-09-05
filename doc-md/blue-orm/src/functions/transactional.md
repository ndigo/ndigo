[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / transactional

# Function: transactional()

> **transactional**(): (`target`, `context`) => `Function`

Defined in: [packages/blue-orm/src/decorators.ts:332](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/decorators.ts#lines-332)

Marks a method as participating in a transaction.

When the decorated method is called on a class instance that has a
`transactionManager` property implementing [TransactionManager](../interfaces/TransactionManager.md),
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

## Since

1.0.0
