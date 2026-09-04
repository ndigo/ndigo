[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-http/src](../../../README.md) / [ResponseStatuses](../README.md) / ACCEPTED

# Variable: ACCEPTED

> `const` **ACCEPTED**: [`ResponseStatus`](../../../classes/ResponseStatus.md)

Defined in: packages/blue-http/src/response-statuses.ts:56

The request has been received but not yet acted upon. It is noncommittal, since there is no way in HTTP to later send an asynchronous response indicating the outcome of the request. It is intended for cases where another process or server handles the request, or for batch processing.
