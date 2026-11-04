[**@ndigo/content v0.0.1**](../README.md)

***

[@ndigo/content](../README.md) / MessageSource

# Interface: MessageSource

Formats messages for a given key and language.

Composes a [ContentSource](ContentSource.md): a message is a formatted content key.
Missing messages fall back to the key itself, matching the content layer's
fallback convention.

## Example

```ts
const messages = new I18nextMessageSource({ … });
await messages.getMessage('greeting', { values: { name: 'Ada' } }, 'en');
// → 'Hello, Ada!'
await messages.getMessage('items', { count: 3 }, 'en');
// → '3 items'  (plural key `items_other`)
```

## Methods

### getMessage()

> **getMessage**(`key`, `params?`, `language?`): `Promise`\<`string`\>

Resolves and formats the message for the requested key.

Methods are async by default; implementations may be synchronous
under the hood.

#### Parameters

##### key

`string`

The message key to resolve.

##### params?

[`MessageParams`](MessageParams.md)

Optional formatting parameters (interpolation values, plural count, variant).

##### language?

`string` \| [`LanguageCode`](../classes/LanguageCode.md)

The language to use; the source's active language when omitted.

#### Returns

`Promise`\<`string`\>

A promise of the formatted message, or the key itself when no translation exists.
