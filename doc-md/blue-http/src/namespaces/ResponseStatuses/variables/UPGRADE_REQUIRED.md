[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-http/src](../../../README.md) / [ResponseStatuses](../README.md) / UPGRADE\_REQUIRED

# Variable: UPGRADE\_REQUIRED

> `const` **UPGRADE\_REQUIRED**: [`ResponseStatus`](../../../classes/ResponseStatus.md)

Defined in: [packages/blue-http/src/response-statuses.ts:269](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-statuses.ts#lines-269)

The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol. The server sends an `Upgrade` header in a 426 response to indicate the required protocol(s).
