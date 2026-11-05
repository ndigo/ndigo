[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [http-shared](../README.md) / rebuildResponse

# Function: rebuildResponse()

> **rebuildResponse**(`source`, `body`, `headers?`): `Response`

Rebuilds a response with a replacement body (and/or headers) while
preserving the transport metadata the `Response` constructor resets —
`url`, `redirected`, and `type` — and dropping the now-stale
`Content-Length` (HTT-REV-011).

## Parameters

### source

`Response`

The response being rebuilt.

### body

`BodyInit` \| `null`

The replacement body.

### headers?

`Headers`

Replacement headers; defaults to the source's headers.

## Returns

`Response`

The rebuilt response with its metadata re-attached.
