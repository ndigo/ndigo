[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-content/src](../README.md) / AsyncContentSource

# Interface: AsyncContentSource

Defined in: [packages/blue-content/src/async.ts:15](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/async.ts#lines-15)

Extends ContentSource with asynchronous content loading.

## Extends

- [`ContentSource`](ContentSource.md)

## Methods

### getContentAsync()

> **getContentAsync**(`key`, `language`): `Promise`\<`string`\>

Defined in: [packages/blue-content/src/async.ts:19](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/async.ts#lines-19)

Asynchronously resolves content for the requested key and language.

#### Parameters

##### key

`string`

##### language

`string`

#### Returns

`Promise`\<`string`\>

***

### getContent()

> **getContent**(`key`, `language`): `string`

Defined in: [packages/blue-content/src/content.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/content.ts#lines-20)

Gets translated content for the requested key and language.

#### Parameters

##### key

`string`

The content key to resolve.

##### language

`string`

The requested language code.

#### Returns

`string`

The resolved content string.

#### Inherited from

[`ContentSource`](ContentSource.md).[`getContent`](ContentSource.md#getcontent)
