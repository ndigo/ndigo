[**@blue/http v0.0.1**](../../../../README.md)

***

[@blue/http](../../../../README.md) / [blue-http](../../../README.md) / [blue-http](../README.md) / PRECONDITION\_REQUIRED

# Variable: PRECONDITION\_REQUIRED

> `const` **PRECONDITION\_REQUIRED**: [`ResponseStatus`](../../../classes/ResponseStatus.md)

The origin server requires the request to be conditional. This response is intended to prevent the 'lost update' problem, where a client `GET`s a resource's state, modifies it, and `PUT`s it back to the server, when meanwhile a third party has modified the state on the server, leading to a conflict.
