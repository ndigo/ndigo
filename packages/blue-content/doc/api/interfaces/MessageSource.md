[**@blue/content v0.0.1**](../README.md)

***

[@blue/content](../README.md) / MessageSource

# Interface: MessageSource

Formats messages for a given key and language.

Composes a [ContentSource](ContentSource.md): a message is a formatted content key.
Missing messages fall back to the key itself, matching the content layer's
fallback convention.

## Example

```ts
const messages = new I18nextMessageSource({ … });
messages.getMessage('greeting', { values: { name: 'Ada' } }, 'en');
// → 'Hello, Ada!'
messages.getMessage('items', { count: 3 }, 'en');
// → '3 items'  (plural key `items_other`)
```

## Methods

### getMessage()

> **getMessage**(`key`, `params?`, `language?`): `string`

Resolves and formats the message for the requested key.

#### Parameters

##### key

`string`

The message key to resolve.

##### params?

[`MessageParams`](MessageParams.md)

Optional formatting parameters (interpolation values, plural count, variant).

##### language?

`string`

The language to use; the source's active language when omitted.

#### Returns

`string`

The formatted message, or the key itself when no translation exists.
