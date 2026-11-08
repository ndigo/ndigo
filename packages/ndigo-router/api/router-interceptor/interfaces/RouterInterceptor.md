[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [router-interceptor](../README.md) / RouterInterceptor

# Interface: RouterInterceptor

Defines an interface for intercepting route processing at different stages.
Interceptors can perform actions before (`preRoute`) or after (`postRoute`) a route is handled.

## Methods

### afterCompletion()?

> `optional` **afterCompletion**(`route`): `void` \| `Promise`\<`void`\>

Runs after completion, regardless of outcome.

#### Parameters

##### route

[`Route`](../../route/interfaces/Route.md)

The route being navigated.

#### Returns

`void` \| `Promise`\<`void`\>

A promise that resolves once the hook completes.

***

### postHandle()?

> `optional` **postHandle**(`route`): `void` \| `Promise`\<`void`\>

Runs after the route is committed.

#### Parameters

##### route

[`Route`](../../route/interfaces/Route.md)

The route being navigated.

#### Returns

`void` \| `Promise`\<`void`\>

A promise that resolves once the hook completes.

***

### preHandle()?

> `optional` **preHandle**(`route`): `boolean` \| `Promise`\<`boolean`\>

Runs before navigation; `false` aborts it.

#### Parameters

##### route

[`Route`](../../route/interfaces/Route.md)

The route being navigated.

#### Returns

`boolean` \| `Promise`\<`boolean`\>

Whether navigation may proceed.
