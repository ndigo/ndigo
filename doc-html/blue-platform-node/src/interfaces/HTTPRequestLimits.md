[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / HTTPRequestLimits

# Interface: HTTPRequestLimits

Defined in: [packages/blue-platform-node/src/http-request-limits.ts:14](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-request-limits.ts#lines-14)

Tunable bounds for the Node HTTP request pipeline.

## Properties

### maxBodyBytes?

> `optional` **maxBodyBytes?**: `number`

Defined in: [packages/blue-platform-node/src/http-request-limits.ts:16](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-request-limits.ts#lines-16)

Maximum request body size in bytes (default 1 MiB). Oversized bodies produce `413`.

***

### maxHeaderBytes?

> `optional` **maxHeaderBytes?**: `number`

Defined in: [packages/blue-platform-node/src/http-request-limits.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-request-limits.ts#lines-18)

Maximum combined size of the `Cookie` header (default 16 KiB).

***

### requestTimeoutMs?

> `optional` **requestTimeoutMs?**: `number`

Defined in: [packages/blue-platform-node/src/http-request-limits.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-request-limits.ts#lines-20)

Time to receive the complete request, headers + body, in ms (default 30s). Produces `408`.

***

### headersTimeoutMs?

> `optional` **headersTimeoutMs?**: `number`

Defined in: [packages/blue-platform-node/src/http-request-limits.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-request-limits.ts#lines-22)

Time to receive the request headers in ms (default 10s). Produces `408`.

***

### keepAliveTimeoutMs?

> `optional` **keepAliveTimeoutMs?**: `number`

Defined in: [packages/blue-platform-node/src/http-request-limits.ts:24](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-request-limits.ts#lines-24)

Socket keep-alive timeout in ms (default 5s; Node default is 5s only when set).

***

### shutdownTimeoutMs?

> `optional` **shutdownTimeoutMs?**: `number`

Defined in: [packages/blue-platform-node/src/http-request-limits.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-request-limits.ts#lines-26)

Grace period, in ms, for in-flight requests during shutdown (default 10s).

***

### maxRequestsPerSocket?

> `optional` **maxRequestsPerSocket?**: `number`

Defined in: [packages/blue-platform-node/src/http-request-limits.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-request-limits.ts#lines-28)

Maximum number of pending requests per socket (default 100).
