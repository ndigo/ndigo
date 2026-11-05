[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [router-interceptor](../README.md) / RouterInterceptor

# Interface: RouterInterceptor

Defines an interface for intercepting route processing at different stages.
Interceptors can perform actions before (`preRoute`) or after (`postRoute`) a route is handled.

## Since

1.0.0

## Methods

### afterCompletion()?

> `optional` **afterCompletion**(`route`): `void` \| `Promise`\<`void`\>

#### Parameters

##### route

[`Route`](../../route/interfaces/Route.md)

#### Returns

`void` \| `Promise`\<`void`\>

***

### postHandle()?

> `optional` **postHandle**(`route`): `void` \| `Promise`\<`void`\>

#### Parameters

##### route

[`Route`](../../route/interfaces/Route.md)

#### Returns

`void` \| `Promise`\<`void`\>

***

### preHandle()?

> `optional` **preHandle**(`route`): `boolean` \| `Promise`\<`boolean`\>

#### Parameters

##### route

[`Route`](../../route/interfaces/Route.md)

#### Returns

`boolean` \| `Promise`\<`boolean`\>
