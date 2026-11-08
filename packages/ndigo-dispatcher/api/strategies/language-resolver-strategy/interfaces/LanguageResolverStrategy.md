[**@ndigo/dispatcher v0.0.1**](../../../README.md)

***

[@ndigo/dispatcher](../../../README.md) / [strategies/language-resolver-strategy](../README.md) / LanguageResolverStrategy

# Interface: LanguageResolverStrategy

Strategy mixin contract for locale resolution: exposes the active
`languageResolver` and an initializer that receives the application context
so the resolver can be built from environment settings.

## Properties

### languageResolver

> **languageResolver**: [`LanguageResolver`](../../../language-resolver/interfaces/LanguageResolver.md)

The active locale resolver.

## Methods

### initLanguageResolver()

> **initLanguageResolver**(`context`): `void`

Builds and installs the language resolver.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`
