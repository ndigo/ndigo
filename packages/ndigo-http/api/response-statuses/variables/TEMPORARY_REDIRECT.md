[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [response-statuses](../README.md) / TEMPORARY\_REDIRECT

# Variable: TEMPORARY\_REDIRECT

> `const` **TEMPORARY\_REDIRECT**: [`default`](../../response-status/classes/default.md)

The server sends this response to direct the client to get the requested resource at another URI with same method that was used in the prior request. This has the same semantics as the `302 Found` HTTP response code, with the exception that the user agent must not change the HTTP method used: If a `POST` was used in the first request, a `POST` must be used in the second request.
