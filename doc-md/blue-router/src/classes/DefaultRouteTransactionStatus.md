[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / DefaultRouteTransactionStatus

# Class: DefaultRouteTransactionStatus

Defined in: packages/blue-router/src/transaction-manager.ts:49

A default implementation of `RouteTransactionStatus` that tracks the state of a route transaction.

## Since

1.0.0

## Implements

- [`RouteTransactionStatus`](../interfaces/RouteTransactionStatus.md)

## Constructors

### Constructor

> **new DefaultRouteTransactionStatus**(`route`, `previousRoute`, `isNewTransaction?`, `syncHash?`): `DefaultRouteTransactionStatus`

Defined in: packages/blue-router/src/transaction-manager.ts:93

Creates an instance of `DefaultRouteTransactionStatus`.

#### Parameters

##### route

[`PathRoute`](PathRoute.md)

The current `PathRoute` for this transaction.

##### previousRoute

`string`

The previous route string before this transaction.

##### isNewTransaction?

`boolean` = `true`

`true` if this is a new transaction, `false` otherwise. Defaults to `true`.

##### syncHash?

`boolean` = `true`

`true` if the browser hash should be synchronized during rollback, `false` otherwise. Defaults to `true`.

#### Returns

`DefaultRouteTransactionStatus`

#### Since

1.0.0

## Properties

### previousRoute

> `readonly` **previousRoute**: `string`

Defined in: packages/blue-router/src/transaction-manager.ts:54

#### Implementation of

[`RouteTransactionStatus`](../interfaces/RouteTransactionStatus.md).[`previousRoute`](../interfaces/RouteTransactionStatus.md#previousroute)

***

### route

> `readonly` **route**: [`PathRoute`](PathRoute.md)

Defined in: packages/blue-router/src/transaction-manager.ts:55

#### Implementation of

[`RouteTransactionStatus`](../interfaces/RouteTransactionStatus.md).[`route`](../interfaces/RouteTransactionStatus.md#route)

***

### syncHash

> `readonly` **syncHash**: `boolean`

Defined in: packages/blue-router/src/transaction-manager.ts:56

#### Implementation of

[`RouteTransactionStatus`](../interfaces/RouteTransactionStatus.md).[`syncHash`](../interfaces/RouteTransactionStatus.md#synchash)

## Accessors

### isCompleted

#### Get Signature

> **get** **isCompleted**(): `boolean`

Defined in: packages/blue-router/src/transaction-manager.ts:63

Indicates whether the transaction has been completed (committed or rolled back).

##### Since

1.0.0

##### Returns

`boolean`

`true` if the transaction is completed, `false` otherwise.

#### Implementation of

[`RouteTransactionStatus`](../interfaces/RouteTransactionStatus.md).[`isCompleted`](../interfaces/RouteTransactionStatus.md#iscompleted)

***

### isRollbackOnly

#### Get Signature

> **get** **isRollbackOnly**(): `boolean`

Defined in: packages/blue-router/src/transaction-manager.ts:72

Indicates whether the transaction is marked for rollback only.

##### Since

1.0.0

##### Returns

`boolean`

`true` if the transaction is rollback-only, `false` otherwise.

#### Implementation of

[`RouteTransactionStatus`](../interfaces/RouteTransactionStatus.md).[`isRollbackOnly`](../interfaces/RouteTransactionStatus.md#isrollbackonly)

***

### isNewTransaction

#### Get Signature

> **get** **isNewTransaction**(): `boolean`

Defined in: packages/blue-router/src/transaction-manager.ts:81

Indicates whether this status object represents a new transaction.

##### Since

1.0.0

##### Returns

`boolean`

`true` if it's a new transaction, `false` otherwise.

#### Implementation of

[`RouteTransactionStatus`](../interfaces/RouteTransactionStatus.md).[`isNewTransaction`](../interfaces/RouteTransactionStatus.md#isnewtransaction)

## Methods

### setRollbackOnly()

> **setRollbackOnly**(): `void`

Defined in: packages/blue-router/src/transaction-manager.ts:107

Marks the current transaction as rollback-only.
A rollback-only transaction cannot be committed and will always be rolled back.

#### Returns

`void`

#### Since

1.0.0

#### Implementation of

[`RouteTransactionStatus`](../interfaces/RouteTransactionStatus.md).[`setRollbackOnly`](../interfaces/RouteTransactionStatus.md#setrollbackonly)

***

### complete()

> **complete**(): `void`

Defined in: packages/blue-router/src/transaction-manager.ts:116

Marks the transaction as completed.
This method is typically called internally by the `RouteTransactionManager`.

#### Returns

`void`

#### Since

1.0.0
