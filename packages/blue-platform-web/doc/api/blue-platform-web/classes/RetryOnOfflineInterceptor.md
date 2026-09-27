[**@blue/platform-web v0.0.1**](../../README.md)

***

[@blue/platform-web](../../README.md) / [blue-platform-web](../README.md) / RetryOnOfflineInterceptor

# Class: RetryOnOfflineInterceptor

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

- [`RequestAwareHTTPInterceptor`](#)
- [`ResponseAwareHTTPInterceptor`](#)

## Constructors

### Constructor

> **new RetryOnOfflineInterceptor**(`config?`): `RetryOnOfflineInterceptor`

#### Parameters

##### config?

[`RetryOnOfflineConfig`](../interfaces/RetryOnOfflineConfig.md) = `{}`

#### Returns

`RetryOnOfflineInterceptor`

## Accessors

### queuedCount

#### Get Signature

> **get** **queuedCount**(): `number`

Returns the number of currently queued requests.

##### Returns

`number`

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void` \| `Response`\>

Handles failed responses by queuing them for retry when offline.

#### Parameters

##### response

`Response`

The response from the server.

##### settings

`HTTPInit`

The request settings.

#### Returns

`Promise`\<`void` \| `Response`\>

The response, or a queued promise when offline.

#### Implementation of

`ResponseAwareHTTPInterceptor.postResponse`

***

### preRequest()

> **preRequest**(`request`, `http`): `Promise`\<`void` \| `Response`\>

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
