[**@blue/platform-web v0.0.1**](../../README.md)

***

[@blue/platform-web](../../README.md) / [blue-platform-web](../README.md) / OfflineInterceptor

# Class: OfflineInterceptor

HTTP interceptor that detects browser offline status.

This interceptor monitors the browser's online/offline state and can
be used to trigger retry logic or notify the application.

## Implements

- [`ResponseAwareHTTPInterceptor`](#)

## Constructors

### Constructor

> **new OfflineInterceptor**(`config?`, `emitter`): `OfflineInterceptor`

Creates a new offline interceptor.

#### Parameters

##### config?

[`OfflineInterceptorConfig`](../interfaces/OfflineInterceptorConfig.md) = `{}`

Offline interceptor configuration.

##### emitter

`EventEmitter`

Event emitter to notify about status changes.

#### Returns

`OfflineInterceptor`

## Accessors

### isOnline

#### Get Signature

> **get** **isOnline**(): `boolean`

Returns the current online status.

##### Returns

`boolean`

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void` \| `Response`\>

Handles the response after a request.

#### Parameters

##### response

`Response`

The response returned by fetch.

##### settings

`HTTPInit`

The request settings used for the call.

#### Returns

`Promise`\<`void` \| `Response`\>

The response.

#### Implementation of

`ResponseAwareHTTPInterceptor.postResponse`
