[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / AbstractLanguageResolver

# Abstract Class: AbstractLanguageResolver

Base class for language resolvers with a configurable fallback language.

## Extended by

- [`NavigatorLanguageResolver`](NavigatorLanguageResolver.md)
- [`FixedLanguageResolver`](FixedLanguageResolver.md)
- [`AcceptHeaderLanguageResolver`](AcceptHeaderLanguageResolver.md)

## Implements

- [`LanguageResolver`](../interfaces/LanguageResolver.md)

## Constructors

### Constructor

> **new AbstractLanguageResolver**(`defaultLanguage`): `AbstractLanguageResolver`

Store the fallback language.

#### Parameters

##### defaultLanguage

`string`

The default language to use.

#### Returns

`AbstractLanguageResolver`

## Properties

### defaultLanguage

> `readonly` **defaultLanguage**: `string`

Fallback language used when no route-specific language is available.

## Methods

### resolveLanguage()

> `abstract` **resolveLanguage**(`route`): `string`

Resolve the active language for a route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`string`

The resolved language tag.

#### Implementation of

[`LanguageResolver`](../interfaces/LanguageResolver.md).[`resolveLanguage`](../interfaces/LanguageResolver.md#resolvelanguage)
