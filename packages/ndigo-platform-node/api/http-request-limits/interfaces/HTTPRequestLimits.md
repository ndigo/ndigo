[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [http-request-limits](../README.md) / HTTPRequestLimits

# Interface: HTTPRequestLimits

Tunable bounds for the Node HTTP request pipeline.

## Properties

### headersTimeoutMs?

> `optional` **headersTimeoutMs?**: `number`

Time to receive the request headers in ms (default 10s). Produces `408`.

***

### keepAliveTimeoutMs?

> `optional` **keepAliveTimeoutMs?**: `number`

Socket keep-alive timeout in ms (default 5s; Node default is 5s only when set).

***

### maxBodyBytes?

> `optional` **maxBodyBytes?**: `number`

Maximum request body size in bytes (default 1 MiB). Oversized bodies produce `413`.

***

### maxHeaderBytes?

> `optional` **maxHeaderBytes?**: `number`

Maximum combined size of the `Cookie` header (default 16 KiB).

***

### maxRequestsPerSocket?

> `optional` **maxRequestsPerSocket?**: `number`

Maximum number of pending requests per socket (default 100).

***

### requestTimeoutMs?

> `optional` **requestTimeoutMs?**: `number`

Time to receive the complete request, headers + body, in ms (default 30s). Produces `408`.

***

### shutdownTimeoutMs?

> `optional` **shutdownTimeoutMs?**: `number`

Grace period, in ms, for in-flight requests during shutdown (default 10s).
