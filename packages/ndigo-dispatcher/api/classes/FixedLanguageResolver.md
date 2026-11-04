[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / FixedLanguageResolver

# Class: FixedLanguageResolver

Always resolves the configured fallback language.

## Extends

- [`AbstractLanguageResolver`](AbstractLanguageResolver.md)

## Constructors

### Constructor

> **new FixedLanguageResolver**(`defaultLanguage`): `FixedLanguageResolver`

Store the fallback language.

#### Parameters

##### defaultLanguage

`string`

The default language to use.

#### Returns

`FixedLanguageResolver`

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

Resolve the configured language for every route.

#### Parameters

##### \_route

[`Route`](#)

The current route.

#### Returns

`string`

The configured language.

#### Overrides

[`AbstractLanguageResolver`](AbstractLanguageResolver.md).[`resolveLanguage`](AbstractLanguageResolver.md#resolvelanguage)
