[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / getSymbolMetadata

# Function: getSymbolMetadata()

> **getSymbolMetadata**(`target`): `Record`\<`string`, `any`\>

Defined in: [packages/blue-core/src/metadata.ts:13](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/metadata.ts#lines-13)

Reads the TC39 `Symbol.metadata` record for a class or instance.

The lookup supports both constructors and values created from them so callers can inspect metadata without
caring which form they received.

## Parameters

### target

`any`

Class constructor, prototype, or instance.

## Returns

`Record`\<`string`, `any`\>

The metadata record, or an empty object when no metadata is present.
