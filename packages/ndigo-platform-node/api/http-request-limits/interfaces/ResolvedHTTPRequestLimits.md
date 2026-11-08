[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [http-request-limits](../README.md) / ResolvedHTTPRequestLimits

# Interface: ResolvedHTTPRequestLimits

Resolved, read-only limits with defaults applied.

## Properties

### headersTimeoutMs

> `readonly` **headersTimeoutMs**: `number`

Header-arrival timeout in milliseconds.

***

### keepAliveTimeoutMs

> `readonly` **keepAliveTimeoutMs**: `number`

Keep-alive idle timeout in milliseconds.

***

### maxBodyBytes

> `readonly` **maxBodyBytes**: `number`

Maximum request body size in bytes.

***

### maxHeaderBytes

> `readonly` **maxHeaderBytes**: `number`

Maximum header size in bytes.

***

### maxRequestsPerSocket

> `readonly` **maxRequestsPerSocket**: `number`

Maximum pending requests per socket.

***

### requestTimeoutMs

> `readonly` **requestTimeoutMs**: `number`

Total request window in milliseconds.

***

### shutdownTimeoutMs

> `readonly` **shutdownTimeoutMs**: `number`

Shutdown grace period in milliseconds.
