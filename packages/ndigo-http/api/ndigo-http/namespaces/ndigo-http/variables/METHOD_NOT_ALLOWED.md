[**@ndigo/http v0.0.1**](../../../../README.md)

***

[@ndigo/http](../../../../README.md) / [ndigo-http](../../../README.md) / [ndigo-http](../README.md) / METHOD\_NOT\_ALLOWED

# Variable: METHOD\_NOT\_ALLOWED

> `const` **METHOD\_NOT\_ALLOWED**: [`ResponseStatus`](../../../classes/ResponseStatus.md)

The request method is known by the server but has been disabled and cannot be used. For example, an API may forbid `DELETE`-ing a resource. The two mandatory methods, `GET` and `HEAD`, must never be disabled and should not return this error code.
