[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-http/src](../../../README.md) / [ResponseStatuses](../README.md) / PRECONDITION\_REQUIRED

# Variable: PRECONDITION\_REQUIRED

> `const` **PRECONDITION\_REQUIRED**: [`ResponseStatus`](../../../classes/ResponseStatus.md)

Defined in: [packages/blue-http/src/response-statuses.ts:274](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-statuses.ts#lines-274)

The origin server requires the request to be conditional. This response is intended to prevent the 'lost update' problem, where a client `GET`s a resource's state, modifies it, and `PUT`s it back to the server, when meanwhile a third party has modified the state on the server, leading to a conflict.
