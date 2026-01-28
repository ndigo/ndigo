[**BlueJS Framework v3.0.0-alpha.0**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-http/src](../../../README.md) / [ResponseStatuses](../README.md) / UPGRADE\_REQUIRED

# Variable: UPGRADE\_REQUIRED

> `const` **UPGRADE\_REQUIRED**: `ResponseStatus`

Defined in: packages/blue-http/src/response-statuses.ts:269

The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol. The server sends an `Upgrade` header in a 426 response to indicate the required protocol(s).
