[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [language-resolver](../README.md) / NavigatorLanguageResolver

# Class: NavigatorLanguageResolver

Resolves language from the browser's `navigator` object.

## See

https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage

## Extends

- [`AbstractLanguageResolver`](AbstractLanguageResolver.md)

## Constructors

### Constructor

> **new NavigatorLanguageResolver**(`defaultLanguage`): `NavigatorLanguageResolver`

Store the fallback language.

#### Parameters

##### defaultLanguage

`string`

The default language to use.

#### Returns

`NavigatorLanguageResolver`

#### Inherited from

[`AbstractLanguageResolver`](AbstractLanguageResolver.md).[`constructor`](AbstractLanguageResolver.md#constructor)

## Properties

### defaultLanguage

> `readonly` **defaultLanguage**: `string`

Fallback language used when no route-specific language is available.

#### Inherited from

[`AbstractLanguageResolver`](AbstractLanguageResolver.md).[`defaultLanguage`](AbstractLanguageResolver.md#defaultlanguage)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

## Methods

### resolveLanguage()

> **resolveLanguage**(`_route`): `string`

Resolve the browser language, falling back to the configured default when needed.

#### Parameters

##### \_route

[`Route`](#)

The current route.

#### Returns

`string`

The browser language or the configured default language.

#### Overrides

[`AbstractLanguageResolver`](AbstractLanguageResolver.md).[`resolveLanguage`](AbstractLanguageResolver.md#resolvelanguage)
