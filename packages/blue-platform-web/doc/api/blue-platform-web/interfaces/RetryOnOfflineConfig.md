[**@blue/platform-web v0.0.1**](../../README.md)

***

[@blue/platform-web](../../README.md) / [blue-platform-web](../README.md) / RetryOnOfflineConfig

# Interface: RetryOnOfflineConfig

Configuration options for the RetryOnOfflineInterceptor.

## Properties

### enableLogging?

> `optional` **enableLogging?**: `boolean`

Whether to log retry attempts. Defaults to `false`.

***

### maxRetries?

> `optional` **maxRetries?**: `number`

Maximum number of retry attempts when offline. Defaults to 5.

***

### retryInterval?

> `optional` **retryInterval?**: `number`

Interval in milliseconds between retry attempts. Defaults to 3000.
