[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / RouterInterceptor

# Interface: RouterInterceptor

Defined in: [packages/blue-router/src/router-interceptor.ts:17](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router-interceptor.ts#lines-17)

Defines an interface for intercepting route processing at different stages.
Interceptors can perform actions before (`preRoute`) or after (`postRoute`) a route is handled.

## Since

1.0.0

## Methods

### preHandle()?

> `optional` **preHandle**(`route`): `boolean` \| `Promise`\<`boolean`\>

Defined in: [packages/blue-router/src/router-interceptor.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router-interceptor.ts#lines-18)

#### Parameters

##### route

[`Route`](Route.md)

#### Returns

`boolean` \| `Promise`\<`boolean`\>

***

### postHandle()?

> `optional` **postHandle**(`route`): `void` \| `Promise`\<`void`\>

Defined in: [packages/blue-router/src/router-interceptor.ts:19](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router-interceptor.ts#lines-19)

#### Parameters

##### route

[`Route`](Route.md)

#### Returns

`void` \| `Promise`\<`void`\>

***

### afterCompletion()?

> `optional` **afterCompletion**(`route`): `void` \| `Promise`\<`void`\>

Defined in: [packages/blue-router/src/router-interceptor.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/router-interceptor.ts#lines-20)

#### Parameters

##### route

[`Route`](Route.md)

#### Returns

`void` \| `Promise`\<`void`\>
