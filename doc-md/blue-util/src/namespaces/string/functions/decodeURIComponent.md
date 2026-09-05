[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [string](../README.md) / decodeURIComponent

# Function: decodeURIComponent()

> **decodeURIComponent**(`value`): `string`

Defined in: [packages/blue-util/src/string/decode-uri-component.ts:105](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-util/src/string/decode-uri-component.ts#lines-105)

Enhanced decodeURIComponent
- Decodes + to a space.
- Converts the BOM to a replacement character �.
- Does not throw with invalid encoded input.
- Decodes as much of the string as possible.

## Parameters

### value

`string`

The encoded string

## Returns

`string`

The decoded string
