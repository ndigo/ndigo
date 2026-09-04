[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-http/src](../../../README.md) / [ResponseStatuses](../README.md) / METHOD\_NOT\_ALLOWED

# Variable: METHOD\_NOT\_ALLOWED

> `const` **METHOD\_NOT\_ALLOWED**: [`ResponseStatus`](../../../classes/ResponseStatus.md)

Defined in: packages/blue-http/src/response-statuses.ts:174

The request method is known by the server but has been disabled and cannot be used. For example, an API may forbid `DELETE`-ing a resource. The two mandatory methods, `GET` and `HEAD`, must never be disabled and should not return this error code.
