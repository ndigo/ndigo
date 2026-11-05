[**@ndigo/dispatcher v0.0.1**](../../../README.md)

***

[@ndigo/dispatcher](../../../README.md) / [strategies/route-error-resolver-strategy](../README.md) / AsRouteErrorResolverStrategy

# Function: AsRouteErrorResolverStrategy()

> **AsRouteErrorResolverStrategy**\<`T`\>(`superclass`): `Constructable`\<[`RouteErrorResolverStrategy`](../interfaces/RouteErrorResolverStrategy.md)\> & `T`

Mixin that installs the error-resolver collection: registers each configured
resolver under the collection key and defaults to
`MetadataErrorResolver` when the application configures none.

## Type Parameters

### T

`T` *extends* `Constructable`\<[`StrategyInitializer`](../../strategy-initializer/interfaces/StrategyInitializer.md)\>

## Parameters

### superclass

`T`

## Returns

`Constructable`\<[`RouteErrorResolverStrategy`](../interfaces/RouteErrorResolverStrategy.md)\> & `T`
