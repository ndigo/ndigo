[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / RouteTransactionManager

# Interface: RouteTransactionManager

Defined in: packages/blue-router/src/transaction-manager.ts:39

Defines an interface for managing the lifecycle of route transactions, including committing and rolling back.

## Since

1.0.0

## Methods

### commit()

> **commit**(`status`): `void`

Defined in: packages/blue-router/src/transaction-manager.ts:40

#### Parameters

##### status

[`RouteTransactionStatus`](RouteTransactionStatus.md)

#### Returns

`void`

***

### getTransaction()

> **getTransaction**(`route`, `previousRoute`, `syncHash?`): [`RouteTransactionStatus`](RouteTransactionStatus.md)

Defined in: packages/blue-router/src/transaction-manager.ts:41

#### Parameters

##### route

[`PathRoute`](../classes/PathRoute.md)

##### previousRoute

`string`

##### syncHash?

`boolean`

#### Returns

[`RouteTransactionStatus`](RouteTransactionStatus.md)

***

### rollback()

> **rollback**(`status`): `void`

Defined in: packages/blue-router/src/transaction-manager.ts:42

#### Parameters

##### status

[`RouteTransactionStatus`](RouteTransactionStatus.md)

#### Returns

`void`
