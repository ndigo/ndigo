[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-http/src](../../../README.md) / [ResponseStatuses](../README.md) / TEMPORARY\_REDIRECT

# Variable: TEMPORARY\_REDIRECT

> `const` **TEMPORARY\_REDIRECT**: [`ResponseStatus`](../../../classes/ResponseStatus.md)

Defined in: packages/blue-http/src/response-statuses.ts:135

The server sends this response to direct the client to get the requested resource at another URI with same method that was used in the prior request. This has the same semantics as the `302 Found` HTTP response code, with the exception that the user agent must not change the HTTP method used: If a `POST` was used in the first request, a `POST` must be used in the second request.
