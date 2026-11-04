[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / AcceptHeaderLanguageResolver

# Class: AcceptHeaderLanguageResolver

Resolves the primary language from the request's `Accept-Language` header.

Reads [ACCEPT\_LANGUAGE\_ATTRIBUTE](#) from the route — set by platform
adapters — and parses it with the shared `parseAcceptLanguage` helper
(first q-weighted tag). Falls back to the configured default when the
header is absent, unparsable, or `*`.

## Extends

- [`AbstractLanguageResolver`](AbstractLanguageResolver.md)

## Constructors

### Constructor

> **new AcceptHeaderLanguageResolver**(`defaultLanguage`): `AcceptHeaderLanguageResolver`

Store the fallback language.

#### Parameters

##### defaultLanguage

`string`

The default language to use.

#### Returns

`AcceptHeaderLanguageResolver`

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

> **resolveLanguage**(`route`): `string`

Resolve the language from the route's accept-language attribute.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`string`

The negotiated language or the configured default.

#### Overrides

[`AbstractLanguageResolver`](AbstractLanguageResolver.md).[`resolveLanguage`](AbstractLanguageResolver.md#resolvelanguage)
