[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / StaticResourceResult

# Interface: StaticResourceResult

Defined in: [packages/blue-platform-node/src/static-resource-resolver.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/static-resource-resolver.ts#lines-28)

The result of resolving a static resource.

## Properties

### kind

> `readonly` **kind**: [`StaticResourceKind`](../type-aliases/StaticResourceKind.md)

Defined in: [packages/blue-platform-node/src/static-resource-resolver.ts:29](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/static-resource-resolver.ts#lines-29)

***

### data?

> `readonly` `optional` **data?**: `Buffer`\<`ArrayBufferLike`\>

Defined in: [packages/blue-platform-node/src/static-resource-resolver.ts:31](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/static-resource-resolver.ts#lines-31)

Raw file bytes (only for `ok`).

***

### contentType?

> `readonly` `optional` **contentType?**: `string`

Defined in: [packages/blue-platform-node/src/static-resource-resolver.ts:33](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/static-resource-resolver.ts#lines-33)

MIME type from the allowlist (only for `ok`).
