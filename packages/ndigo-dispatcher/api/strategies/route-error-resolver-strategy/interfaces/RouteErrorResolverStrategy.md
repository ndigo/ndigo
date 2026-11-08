[**@ndigo/dispatcher v0.0.1**](../../../README.md)

***

[@ndigo/dispatcher](../../../README.md) / [strategies/route-error-resolver-strategy](../README.md) / RouteErrorResolverStrategy

# Interface: RouteErrorResolverStrategy

Strategy mixin contract for error handling: exposes the ordered
`errorResolvers` that turn a thrown error into a response and a key under
which the collection is registered.

## Properties

### errorResolvers

> **errorResolvers**: [`RouteErrorResolver`](../../../route-error-resolver/interfaces/RouteErrorResolver.md)[]

The ordered error resolvers.

## Methods

### initErrorResolvers()

> **initErrorResolvers**(`context`): `void`

Installs the error-resolver collection.

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`
