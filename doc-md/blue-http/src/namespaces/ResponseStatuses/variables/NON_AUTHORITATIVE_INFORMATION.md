[**BlueJS Framework v3.0.0-alpha.0**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-http/src](../../../README.md) / [ResponseStatuses](../README.md) / NON\_AUTHORITATIVE\_INFORMATION

# Variable: NON\_AUTHORITATIVE\_INFORMATION

> `const` **NON\_AUTHORITATIVE\_INFORMATION**: `ResponseStatus`

Defined in: packages/blue-http/src/response-statuses.ts:61

This response code means the returned meta-information is not exactly the same as is available from the origin server, but is collected from a local or a third-party copy. This is mostly used for mirrors or backups of another resource. Except for that specific case, the "200 OK" response is preferred to this status.
