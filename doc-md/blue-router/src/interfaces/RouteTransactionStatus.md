[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / RouteTransactionStatus

# Interface: RouteTransactionStatus

Defined in: packages/blue-router/src/transaction-manager.ts:27

Extends `RouteTransactionExecution` with additional details and actions specific to a route transaction's status.

## Since

1.0.0

## Extends

- [`RouteTransactionExecution`](RouteTransactionExecution.md)

## Properties

### isCompleted

> `readonly` **isCompleted**: `boolean`

Defined in: packages/blue-router/src/transaction-manager.ts:18

#### Inherited from

[`RouteTransactionExecution`](RouteTransactionExecution.md).[`isCompleted`](RouteTransactionExecution.md#iscompleted)

***

### isRollbackOnly

> `readonly` **isRollbackOnly**: `boolean`

Defined in: packages/blue-router/src/transaction-manager.ts:19

#### Inherited from

[`RouteTransactionExecution`](RouteTransactionExecution.md).[`isRollbackOnly`](RouteTransactionExecution.md#isrollbackonly)

***

### isNewTransaction

> `readonly` **isNewTransaction**: `boolean`

Defined in: packages/blue-router/src/transaction-manager.ts:20

#### Inherited from

[`RouteTransactionExecution`](RouteTransactionExecution.md).[`isNewTransaction`](RouteTransactionExecution.md#isnewtransaction)

***

### route

> `readonly` **route**: [`PathRoute`](../classes/PathRoute.md)

Defined in: packages/blue-router/src/transaction-manager.ts:28

***

### previousRoute

> `readonly` **previousRoute**: `string`

Defined in: packages/blue-router/src/transaction-manager.ts:29

***

### syncHash

> `readonly` **syncHash**: `boolean`

Defined in: packages/blue-router/src/transaction-manager.ts:30

## Methods

### setRollbackOnly()

> **setRollbackOnly**(): `void`

Defined in: packages/blue-router/src/transaction-manager.ts:32

#### Returns

`void`
