[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / ContentLookup

# Interface: ContentLookup

Defined in: [packages/blue-validate/src/format.ts:11](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/format.ts#lines-11)

Minimal interface for resolving localised strings by key and language.
Compatible with `ContentSource` from `@blue/content`.

## Methods

### getContent()

> **getContent**(`key`, `language`): `string`

Defined in: [packages/blue-validate/src/format.ts:19](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/format.ts#lines-19)

Returns the localised string for the given key and language.

#### Parameters

##### key

`string`

The content key to resolve.

##### language

`string`

The requested language code.

#### Returns

`string`

The resolved string, or the key itself when no translation exists.
