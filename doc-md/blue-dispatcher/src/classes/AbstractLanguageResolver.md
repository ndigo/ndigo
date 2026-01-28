[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractLanguageResolver

# Abstract Class: AbstractLanguageResolver

Defined in: packages/blue-dispatcher/src/language-resolver.ts:10

## Extended by

- [`NavigatorLanguageResolver`](NavigatorLanguageResolver.md)

## Implements

- [`LanguageResolver`](../interfaces/LanguageResolver.md)

## Constructors

### Constructor

> **new AbstractLanguageResolver**(`defaultLanguage`): `AbstractLanguageResolver`

Defined in: packages/blue-dispatcher/src/language-resolver.ts:13

#### Parameters

##### defaultLanguage

`string`

#### Returns

`AbstractLanguageResolver`

## Properties

### defaultLanguage

> `readonly` **defaultLanguage**: `string`

Defined in: packages/blue-dispatcher/src/language-resolver.ts:11

## Methods

### resolveLanguage()

> `abstract` **resolveLanguage**(`route`): `string`

Defined in: packages/blue-dispatcher/src/language-resolver.ts:22

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`string`

#### Implementation of

[`LanguageResolver`](../interfaces/LanguageResolver.md).[`resolveLanguage`](../interfaces/LanguageResolver.md#resolvelanguage)
