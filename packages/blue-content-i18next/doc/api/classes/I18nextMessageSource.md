[**@blue/content-i18next v0.0.1**](../README.md)

***

[@blue/content-i18next](../README.md) / I18nextMessageSource

# Class: I18nextMessageSource

A [MessageSource](#) implemented over an i18next instance.

i18next owns resource storage, interpolation, plurals (via
`Intl.PluralRules`), contexts, and fallback chains; this adapter maps the
BlueJS contract onto that surface. Missing messages fall back to the key.

Each instance owns its i18next instance (`createInstance()`) — no global
singleton, safe for isomorphic use.

## Example

```ts
const messages = new I18nextMessageSource({
    resources: {
        en: { translation: { greeting: 'Hello {{name}}!', items_one: 'one item', items_other: '{{count}} items' } },
        fr: { translation: { greeting: 'Bonjour {{name}} !' } },
    },
    language: 'en',
    fallbackLanguage: 'en',
});
messages.getMessage('greeting', { values: { name: 'Ada' } });          // 'Hello Ada!'
messages.getMessage('items', { count: 3 });                            // '3 items'
messages.getMessage('greeting', { values: { name: 'Ada' } }, 'fr');    // 'Bonjour Ada !'
```

## Implements

- [`MessageSource`](#)

## Constructors

### Constructor

> **new I18nextMessageSource**(`options?`): `I18nextMessageSource`

Creates a message source over i18next.

#### Parameters

##### options?

[`I18nextMessageSourceOptions`](../interfaces/I18nextMessageSourceOptions.md) = `{}`

i18next configuration mapped onto the BlueJS contract.

#### Returns

`I18nextMessageSource`

## Properties

### instance

> `readonly` **instance**: `i18n`

The underlying i18next instance (escape hatch for advanced use).

## Accessors

### language

#### Get Signature

> **get** **language**(): `string` \| `undefined`

The currently active language.

##### Returns

`string` \| `undefined`

## Methods

### changeLanguage()

> **changeLanguage**(`language`): `Promise`\<`void`\>

Switches the active language.

#### Parameters

##### language

`string`

The language to activate.

#### Returns

`Promise`\<`void`\>

***

### getMessage()

> **getMessage**(`key`, `params?`, `language?`): `string`

Resolves and formats the message for the requested key.

#### Parameters

##### key

`string`

The message key to resolve (dot notation nests; plural and
  context variants use i18next `_one`/`_other`/`_male`-style suffixes).

##### params?

`MessageParams`

Interpolation values, plural count, and context.

##### language?

`string`

Language override; the active language when omitted.

#### Returns

`string`

The formatted message, or the key itself when missing.

#### Implementation of

`MessageSource.getMessage`

***

### preload()

> **preload**(`languages`): `Promise`\<`void`\>

Preloads resources for the given languages (no-op for languages
already provided as static resources).

#### Parameters

##### languages

`string`[]

The languages to load.

#### Returns

`Promise`\<`void`\>
