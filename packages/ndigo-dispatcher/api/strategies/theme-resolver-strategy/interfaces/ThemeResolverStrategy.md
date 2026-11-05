[**@ndigo/dispatcher v0.0.1**](../../../README.md)

***

[@ndigo/dispatcher](../../../README.md) / [strategies/theme-resolver-strategy](../README.md) / ThemeResolverStrategy

# Interface: ThemeResolverStrategy

Strategy mixin contract for theme resolution: exposes the active
`themeResolver` and an initializer that builds it from the application
context (falling back to a context-backed fixed resolver).

## Properties

### themeResolver

> **themeResolver**: [`ThemeResolver`](../../../theme-resolver/interfaces/ThemeResolver.md)

## Methods

### initThemeResolver()

> **initThemeResolver**(`context`): `void`

#### Parameters

##### context

`ApplicationContext`

#### Returns

`void`
