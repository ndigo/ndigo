[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / DefaultRouteTransactionManager

# Class: DefaultRouteTransactionManager

Defined in: packages/blue-router/src/transaction-manager.ts:125

A default implementation of `RouteTransactionManager` that handles committing and rolling back route transactions.

## Since

1.0.0

## Implements

- [`RouteTransactionManager`](../interfaces/RouteTransactionManager.md)

## Constructors

### Constructor

> **new DefaultRouteTransactionManager**(): `DefaultRouteTransactionManager`

#### Returns

`DefaultRouteTransactionManager`

## Methods

### commit()

> **commit**(`status`): `void`

Defined in: packages/blue-router/src/transaction-manager.ts:132

Commits the given route transaction.
If the transaction is marked as rollback-only, it will be rolled back instead.

#### Parameters

##### status

[`RouteTransactionStatus`](../interfaces/RouteTransactionStatus.md)

The `RouteTransactionStatus` to commit.

#### Returns

`void`

#### Since

1.0.0

#### Implementation of

[`RouteTransactionManager`](../interfaces/RouteTransactionManager.md).[`commit`](../interfaces/RouteTransactionManager.md#commit)

***

### getTransaction()

> **getTransaction**(`route`, `previousRoute`, `syncHash?`): [`RouteTransactionStatus`](../interfaces/RouteTransactionStatus.md)

Defined in: packages/blue-router/src/transaction-manager.ts:153

Creates and returns a new `RouteTransactionStatus` for a given route change.

#### Parameters

##### route

[`PathRoute`](PathRoute.md)

The new `PathRoute` for the transaction.

##### previousRoute

`string`

The previous route string before this transaction.

##### syncHash?

`boolean` = `true`

`true` if the browser hash should be synchronized during rollback, `false` otherwise. Defaults to `true`.

#### Returns

[`RouteTransactionStatus`](../interfaces/RouteTransactionStatus.md)

A new `RouteTransactionStatus` instance.

#### Since

1.0.0

#### Implementation of

[`RouteTransactionManager`](../interfaces/RouteTransactionManager.md).[`getTransaction`](../interfaces/RouteTransactionManager.md#gettransaction)

***

### rollback()

> **rollback**(`status`): `void`

Defined in: packages/blue-router/src/transaction-manager.ts:163

Rolls back the given route transaction.
If `syncHash` is enabled in the transaction status, the browser's hash will be reverted to the `previousRoute`.

#### Parameters

##### status

[`RouteTransactionStatus`](../interfaces/RouteTransactionStatus.md)

The `RouteTransactionStatus` to roll back.

#### Returns

`void`

#### Since

1.0.0

#### Implementation of

[`RouteTransactionManager`](../interfaces/RouteTransactionManager.md).[`rollback`](../interfaces/RouteTransactionManager.md#rollback)
