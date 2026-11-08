[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [parse-multipart](../README.md) / parseMultipart

# Function: parseMultipart()

> **parseMultipart**(`req`, `options?`): `Promise`\<[`NodeMultipartContext`](../../multipart-file/classes/NodeMultipartContext.md)\>

Parse a `multipart/form-data` request body into fields + file parts.

Streams the incoming request directly through busboy — it never buffers the
whole body first, so an oversized upload cannot exhaust memory. Rejects with
a `413` [RequestLimitError](../../http-request-limits/classes/RequestLimitError.md) when any configured limit is exceeded, and
with a `400` when the body is not valid multipart.

## Parameters

### req

`IncomingMessage`

The incoming request.

### options?

[`MultipartParseOptions`](../interfaces/MultipartParseOptions.md) = `{}`

Parsing limits and temp directory.

## Returns

`Promise`\<[`NodeMultipartContext`](../../multipart-file/classes/NodeMultipartContext.md)\>

The parsed multipart context.
