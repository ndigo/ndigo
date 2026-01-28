[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / NavigatorLanguageResolver

# Class: NavigatorLanguageResolver

Defined in: packages/blue-dispatcher/src/language-resolver.ts:40

## See

[https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage)

## Extends

- [`AbstractLanguageResolver`](AbstractLanguageResolver.md)

## Constructors

### Constructor

> **new NavigatorLanguageResolver**(`defaultLanguage`): `NavigatorLanguageResolver`

Defined in: packages/blue-dispatcher/src/language-resolver.ts:13

#### Parameters

##### defaultLanguage

`string`

#### Returns

`NavigatorLanguageResolver`

#### Inherited from

[`AbstractLanguageResolver`](AbstractLanguageResolver.md).[`constructor`](AbstractLanguageResolver.md#constructor)

## Properties

### defaultLanguage

> `readonly` **defaultLanguage**: `string`

Defined in: packages/blue-dispatcher/src/language-resolver.ts:11

#### Inherited from

[`AbstractLanguageResolver`](AbstractLanguageResolver.md).[`defaultLanguage`](AbstractLanguageResolver.md#defaultlanguage)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/language-resolver.ts:41

##### Returns

`string`

## Methods

### resolveLanguage()

> **resolveLanguage**(`route`): `string`

Defined in: packages/blue-dispatcher/src/language-resolver.ts:48

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`string`

#### Overrides

[`AbstractLanguageResolver`](AbstractLanguageResolver.md).[`resolveLanguage`](AbstractLanguageResolver.md#resolvelanguage)
