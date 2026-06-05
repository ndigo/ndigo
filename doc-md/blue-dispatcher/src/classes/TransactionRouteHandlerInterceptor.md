[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / TransactionRouteHandlerInterceptor

# Class: TransactionRouteHandlerInterceptor

Defined in: packages/blue-dispatcher/src/transaction-interceptor.ts:12

Wraps route handler execution in a transaction.

## Implements

- [`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md)

## Constructors

### Constructor

> **new TransactionRouteHandlerInterceptor**(`transactionManager`): `TransactionRouteHandlerInterceptor`

Defined in: packages/blue-dispatcher/src/transaction-interceptor.ts:28

Create a transaction interceptor.

#### Parameters

##### transactionManager

`RouteTransactionManager`

The transaction manager to use.

#### Returns

`TransactionRouteHandlerInterceptor`

## Methods

### preHandle()

> **preHandle**(`route`, `handler`): `Promise`\<`boolean`\>

Defined in: packages/blue-dispatcher/src/transaction-interceptor.ts:40

Start a transaction before the route handler executes.

#### Parameters

##### route

`Route`

The current route.

##### handler

`any`

The route handler.

#### Returns

`Promise`\<`boolean`\>

`true` to continue execution.

#### Implementation of

[`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md).[`preHandle`](../interfaces/RouteHandlerInterceptor.md#prehandle)

***

### postHandle()

> **postHandle**(`route`, `handler`, `modelAndView`): `Promise`\<`void`\>

Defined in: packages/blue-dispatcher/src/transaction-interceptor.ts:57

Commit the transaction after successful handler execution.

#### Parameters

##### route

`Route`

The current route.

##### handler

`any`

The route handler.

##### modelAndView

[`ModelAndView`](ModelAndView.md)

The model and view returned by the handler.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md).[`postHandle`](../interfaces/RouteHandlerInterceptor.md#posthandle)

***

### completeHandle()

> **completeHandle**(`route`, `handler`, `error`): `Promise`\<`void`\>

Defined in: packages/blue-dispatcher/src/transaction-interceptor.ts:71

Roll back the transaction when handler execution fails.

#### Parameters

##### route

`Route`

The current route.

##### handler

`any`

The route handler.

##### error

`Error`

The error thrown during execution.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`RouteHandlerInterceptor`](../interfaces/RouteHandlerInterceptor.md).[`completeHandle`](../interfaces/RouteHandlerInterceptor.md#completehandle)
