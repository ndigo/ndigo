[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / parseMultipart

# Function: parseMultipart()

> **parseMultipart**(`req`, `options?`): `Promise`\<[`NodeMultipartContext`](../classes/NodeMultipartContext.md)\>

Parse a `multipart/form-data` request body into fields + file parts.

Streams the incoming request directly through busboy — it never buffers the
whole body first, so an oversized upload cannot exhaust memory. Rejects with
a `413` [RequestLimitError](../classes/RequestLimitError.md) when any configured limit is exceeded, and
with a `400` when the body is not valid multipart.

## Parameters

### req

`IncomingMessage`

### options?

[`MultipartParseOptions`](../interfaces/MultipartParseOptions.md) = `{}`

## Returns

`Promise`\<[`NodeMultipartContext`](../classes/NodeMultipartContext.md)\>
