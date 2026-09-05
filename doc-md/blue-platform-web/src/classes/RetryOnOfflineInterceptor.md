[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / RetryOnOfflineInterceptor

# Class: RetryOnOfflineInterceptor

Defined in: [packages/blue-platform-web/src/retry-on-offline-interceptor.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/retry-on-offline-interceptor.ts#lines-40)

Interceptor that queues failed requests when offline and replays them when online.

Uses the browser's `navigator.onLine` property to detect connectivity.
When a request fails and the browser is offline, the request is queued
and retried at the configured interval until it succeeds or the max retries
is reached.

## Example

```ts
const http = new HTTP([new RetryOnOfflineInterceptor()]);
await http.get('/api/data');
// If offline, the request is queued and retried automatically
```

## Implements

- `RequestAwareHTTPInterceptor`
- `ResponseAwareHTTPInterceptor`

## Constructors

### Constructor

> **new RetryOnOfflineInterceptor**(`config?`): `RetryOnOfflineInterceptor`

Defined in: [packages/blue-platform-web/src/retry-on-offline-interceptor.ts:51](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/retry-on-offline-interceptor.ts#lines-51)

#### Parameters

##### config?

[`RetryOnOfflineConfig`](../interfaces/RetryOnOfflineConfig.md) = `{}`

#### Returns

`RetryOnOfflineInterceptor`

## Accessors

### queuedCount

#### Get Signature

> **get** **queuedCount**(): `number`

Defined in: [packages/blue-platform-web/src/retry-on-offline-interceptor.ts:60](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/retry-on-offline-interceptor.ts#lines-60)

Returns the number of currently queued requests.

##### Returns

`number`

## Methods

### preRequest()

> **preRequest**(`request`, `http`): `Promise`\<`void` \| `Response`\>

Defined in: [packages/blue-platform-web/src/retry-on-offline-interceptor.ts:71](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/retry-on-offline-interceptor.ts#lines-71)

Checks the cache for a matching response before the request is sent.

#### Parameters

##### request

`Request`

The outgoing request.

##### http

`HTTP`

The HTTP client.

#### Returns

`Promise`\<`void` \| `Response`\>

A cached response when available, otherwise void.

#### Implementation of

`RequestAwareHTTPInterceptor.preRequest`

***

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void` \| `Response`\>

Defined in: [packages/blue-platform-web/src/retry-on-offline-interceptor.ts:90](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/retry-on-offline-interceptor.ts#lines-90)

Handles failed responses by queuing them for retry when offline.

#### Parameters

##### response

`Response`

The response from the server.

##### settings

`any`

The request settings.

#### Returns

`Promise`\<`void` \| `Response`\>

The response, or a queued promise when offline.

#### Implementation of

`ResponseAwareHTTPInterceptor.postResponse`
