[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / StaticResourceResolver

# Class: StaticResourceResolver

Defined in: [packages/blue-platform-node/src/static-resource-resolver.ts:66](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/static-resource-resolver.ts#lines-66)

Resolves static files strictly inside a canonical base directory.

## Constructors

### Constructor

> **new StaticResourceResolver**(`basePath`): `StaticResourceResolver`

Defined in: [packages/blue-platform-node/src/static-resource-resolver.ts:74](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/static-resource-resolver.ts#lines-74)

#### Parameters

##### basePath

`string`

The directory to serve files from. Canonicalized on
first use; must exist and be readable.

#### Returns

`StaticResourceResolver`

## Methods

### base()

> **base**(): `Promise`\<`string`\>

Defined in: [packages/blue-platform-node/src/static-resource-resolver.ts:79](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/static-resource-resolver.ts#lines-79)

Canonical base directory (resolved lazily, cached).

#### Returns

`Promise`\<`string`\>

***

### resolve()

> **resolve**(`requestPath`): `Promise`\<[`StaticResourceResult`](../interfaces/StaticResourceResult.md)\>

Defined in: [packages/blue-platform-node/src/static-resource-resolver.ts:91](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/static-resource-resolver.ts#lines-91)

Resolves a request-relative path to file bytes + MIME type, or a
classified failure. Never throws for expected failure modes.

#### Parameters

##### requestPath

`string`

The URL-decoded path relative to the base root
  (leading `/` allowed and ignored).

#### Returns

`Promise`\<[`StaticResourceResult`](../interfaces/StaticResourceResult.md)\>
