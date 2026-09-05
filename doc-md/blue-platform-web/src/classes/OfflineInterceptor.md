[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / OfflineInterceptor

# Class: OfflineInterceptor

Defined in: [packages/blue-platform-web/src/offline-interceptor.ts:27](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/offline-interceptor.ts#lines-27)

HTTP interceptor that detects browser offline status.

This interceptor monitors the browser's online/offline state and can
be used to trigger retry logic or notify the application.

## Implements

- `ResponseAwareHTTPInterceptor`

## Constructors

### Constructor

> **new OfflineInterceptor**(`config?`, `emitter`): `OfflineInterceptor`

Defined in: [packages/blue-platform-web/src/offline-interceptor.ts:38](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/offline-interceptor.ts#lines-38)

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

Defined in: [packages/blue-platform-web/src/offline-interceptor.ts:49](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/offline-interceptor.ts#lines-49)

Returns the current online status.

##### Returns

`boolean`

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void` \| `Response`\>

Defined in: [packages/blue-platform-web/src/offline-interceptor.ts:60](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/offline-interceptor.ts#lines-60)

Handles the response after a request.

#### Parameters

##### response

`Response`

The response returned by fetch.

##### settings

`any`

The request settings used for the call.

#### Returns

`Promise`\<`void` \| `Response`\>

The response.

#### Implementation of

`ResponseAwareHTTPInterceptor.postResponse`
