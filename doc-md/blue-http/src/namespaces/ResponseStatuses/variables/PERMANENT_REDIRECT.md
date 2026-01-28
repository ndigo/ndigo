[**BlueJS Framework v3.0.0-alpha.0**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-http/src](../../../README.md) / [ResponseStatuses](../README.md) / PERMANENT\_REDIRECT

# Variable: PERMANENT\_REDIRECT

> `const` **PERMANENT\_REDIRECT**: `ResponseStatus`

Defined in: packages/blue-http/src/response-statuses.ts:140

This means that the resource is now permanently located at another URI, specified by the `Location:` HTTP Response header. This has the same semantics as the `301 Moved Permanently` HTTP response code, with the exception that the user agent must not change the HTTP method used: If a `POST` was used in the first request, a `POST` must be used in the second request.
