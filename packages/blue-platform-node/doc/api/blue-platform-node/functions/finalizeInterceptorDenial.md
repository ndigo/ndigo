[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / finalizeInterceptorDenial

# Function: finalizeInterceptorDenial()

> **finalizeInterceptorDenial**(`res`, `denial`): `void`

Finalizes an interceptor denial. A `401` denial carries
`WWW-Authenticate: Bearer` (RFC 9110 §15.5.2); `401`/`403` are problem
documents with registered types; other `4xx/5xx` denials are an
about:blank problem at the given status; a status `<= 399` (CORS
preflight `204`, browser redirects) writes headers with no body.
An already-finalized response (`writableEnded`/`destroyed`) is left alone;
one whose headers were already flushed cannot carry a status line, so its
socket is destroyed rather than attempting `writeHead`.

## Parameters

### res

[`DenialResponseWriter`](../interfaces/DenialResponseWriter.md)

The response writer (ServerResponse or MockHTTP sink).

### denial

[`InterceptorDenial`](#)

The denial recorded on the route.

## Returns

`void`
