[**@ndigo/dispatcher v0.0.1**](../../../README.md)

***

[@ndigo/dispatcher](../../../README.md) / [strategies/view-resolver-strategy](../README.md) / ViewResolverStrategy

# Interface: ViewResolverStrategy

Strategy mixin contract for view resolution: exposes the ordered
`viewResolvers` that resolve a view name to a rendered result, and an
initializer that installs them from the application context.

## Properties

### viewResolvers

> **viewResolvers**: `ViewResolver`[]

The ordered view resolvers.

## Methods

### initViewResolvers()

> **initViewResolvers**(`context`): `void`

Installs the view-resolver chain.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`
