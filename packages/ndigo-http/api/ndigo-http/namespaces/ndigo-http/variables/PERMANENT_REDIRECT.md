[**@ndigo/http v0.0.1**](../../../../README.md)

***

[@ndigo/http](../../../../README.md) / [ndigo-http](../../../README.md) / [ndigo-http](../README.md) / PERMANENT\_REDIRECT

# Variable: PERMANENT\_REDIRECT

> `const` **PERMANENT\_REDIRECT**: [`ResponseStatus`](../../../classes/ResponseStatus.md)

This means that the resource is now permanently located at another URI, specified by the `Location:` HTTP Response header. This has the same semantics as the `301 Moved Permanently` HTTP response code, with the exception that the user agent must not change the HTTP method used: If a `POST` was used in the first request, a `POST` must be used in the second request.
