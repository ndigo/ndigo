[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-handler-denial](../README.md) / METHOD\_NOT\_ALLOWED\_ATTRIBUTE

# Variable: METHOD\_NOT\_ALLOWED\_ATTRIBUTE

> `const` **METHOD\_NOT\_ALLOWED\_ATTRIBUTE**: `"__mapping:methodNotAllowed"` = `'__mapping:methodNotAllowed'`

Route attribute key under which the `Allow` header value is stored when a
path resolves but the request method matches none of its handlers (RFC
9110 §15.5.6). The platform adapter finalizes the response as `405 Method Not Allowed` with this `Allow` value.
