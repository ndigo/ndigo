[**@ndigo/http v0.0.1**](../../../../README.md)

***

[@ndigo/http](../../../../README.md) / [ndigo-http](../../../README.md) / [ndigo-http](../README.md) / UPGRADE\_REQUIRED

# Variable: UPGRADE\_REQUIRED

> `const` **UPGRADE\_REQUIRED**: [`ResponseStatus`](../../../classes/ResponseStatus.md)

The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol. The server sends an `Upgrade` header in a 426 response to indicate the required protocol(s).
