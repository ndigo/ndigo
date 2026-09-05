[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / NavigatorLanguageResolver

# Class: NavigatorLanguageResolver

Defined in: [packages/blue-dispatcher/src/language-resolver.ts:56](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/language-resolver.ts#lines-56)

Resolve language from the browser's `navigator` object.

## See

https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage

## Extends

- [`AbstractLanguageResolver`](AbstractLanguageResolver.md)

## Constructors

### Constructor

> **new NavigatorLanguageResolver**(`defaultLanguage`): `NavigatorLanguageResolver`

Defined in: [packages/blue-dispatcher/src/language-resolver.ts:33](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/language-resolver.ts#lines-33)

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

Defined in: [packages/blue-dispatcher/src/language-resolver.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/language-resolver.ts#lines-26)

Fallback language used when no route-specific language is available.

#### Inherited from

[`AbstractLanguageResolver`](AbstractLanguageResolver.md).[`defaultLanguage`](AbstractLanguageResolver.md#defaultlanguage)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-dispatcher/src/language-resolver.ts:57](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/language-resolver.ts#lines-57)

##### Returns

`string`

## Methods

### resolveLanguage()

> **resolveLanguage**(`_route`): `string`

Defined in: [packages/blue-dispatcher/src/language-resolver.ts:67](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/language-resolver.ts#lines-67)

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
