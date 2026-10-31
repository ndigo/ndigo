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
- [`CompletionAwareHTTPInterceptor`](#)

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

### postComplete()

> **postComplete**(`request`): `void`

Releases the method+url clone for a completed request so the map tracks
only in-flight requests.

#### Parameters

##### request

`Request`

#### Returns

`void`

#### Implementation of

`CompletionAwareHTTPInterceptor.postComplete`

***

### postResponse()

> **postResponse**(`response`, `settings`, `request?`): `Promise`\<`void` \| `Response`\>

Handles failed responses by queuing them for retry when offline.

#### Parameters

##### response

`Response`

The response from the server.

##### settings

`HTTPInit`

The request settings.

##### request?

`Request`

The final request that was sent, when available.

#### Returns

`Promise`\<`void` \| `Response`\>

The response, or a queued promise when offline.

#### Implementation of

`ResponseAwareHTTPInterceptor.postResponse`

***

### preRequest()

> **preRequest**(`request`, `http`): `Promise`\<`void` \| `Response`\>

Captures an undisturbed clone of each outgoing request for offline
replay, then queues the request when the browser is already offline.

#### Parameters

##### request

`Request`

The outgoing request.

##### http

`HTTP`

The HTTP client.

#### Returns

`Promise`\<`void` \| `Response`\>

A queued promise while offline, otherwise void.

#### Implementation of

`RequestAwareHTTPInterceptor.preRequest`
