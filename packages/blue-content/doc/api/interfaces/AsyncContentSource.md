[**@blue/content v0.0.1**](../README.md)

***

[@blue/content](../README.md) / AsyncContentSource

# Interface: AsyncContentSource

Extends ContentSource with asynchronous content loading.

## Extends

- [`ContentSource`](ContentSource.md)

## Methods

### getContent()

> **getContent**(`key`, `language`): `string`

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

***

### getContentAsync()

> **getContentAsync**(`key`, `language`): `Promise`\<`string`\>

Asynchronously resolves content for the requested key and language.

#### Parameters

##### key

`string`

##### language

`string`

#### Returns

`Promise`\<`string`\>
