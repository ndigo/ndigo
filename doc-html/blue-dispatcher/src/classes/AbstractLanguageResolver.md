[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractLanguageResolver

# Abstract Class: AbstractLanguageResolver

Defined in: [packages/blue-dispatcher/src/language-resolver.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/language-resolver.ts#lines-22)

Base class for language resolvers with a configurable fallback language.

## Extended by

- [`NavigatorLanguageResolver`](NavigatorLanguageResolver.md)

## Implements

- [`LanguageResolver`](../interfaces/LanguageResolver.md)

## Constructors

### Constructor

> **new AbstractLanguageResolver**(`defaultLanguage`): `AbstractLanguageResolver`

Defined in: [packages/blue-dispatcher/src/language-resolver.ts:33](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/language-resolver.ts#lines-33)

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

Defined in: [packages/blue-dispatcher/src/language-resolver.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/language-resolver.ts#lines-26)

Fallback language used when no route-specific language is available.

## Methods

### resolveLanguage()

> `abstract` **resolveLanguage**(`route`): `string`

Defined in: [packages/blue-dispatcher/src/language-resolver.ts:48](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/language-resolver.ts#lines-48)

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
