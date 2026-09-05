[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / RetryOnOfflineConfig

# Interface: RetryOnOfflineConfig

Defined in: [packages/blue-platform-web/src/retry-on-offline-interceptor.ts:10](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/retry-on-offline-interceptor.ts#lines-10)

Configuration options for the RetryOnOfflineInterceptor.

## Properties

### maxRetries?

> `optional` **maxRetries?**: `number`

Defined in: [packages/blue-platform-web/src/retry-on-offline-interceptor.ts:14](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/retry-on-offline-interceptor.ts#lines-14)

Maximum number of retry attempts when offline. Defaults to 5.

***

### retryInterval?

> `optional` **retryInterval?**: `number`

Defined in: [packages/blue-platform-web/src/retry-on-offline-interceptor.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/retry-on-offline-interceptor.ts#lines-18)

Interval in milliseconds between retry attempts. Defaults to 3000.

***

### enableLogging?

> `optional` **enableLogging?**: `boolean`

Defined in: [packages/blue-platform-web/src/retry-on-offline-interceptor.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/retry-on-offline-interceptor.ts#lines-22)

Whether to log retry attempts. Defaults to `false`.
