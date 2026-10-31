[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / HandlerMethodArgumentResolver

# Interface: HandlerMethodArgumentResolver

Strategy interface for resolving method parameters into argument values in the context of a given route.

## Methods

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `unknown`

Resolves a method parameter into an argument value from a given route.

#### Parameters

##### parameter

[`MethodParameter`](../classes/MethodParameter.md)

The method parameter to resolve.

##### route

[`Route`](#)

The current route.

##### mapping

`unknown`

The route handler mapping.

#### Returns

`unknown`

The resolved argument value, or `null` if not resolvable.

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Whether the given method parameter is supported by this resolver.

#### Parameters

##### parameter

[`MethodParameter`](../classes/MethodParameter.md)

The method parameter to check.

#### Returns

`boolean`

Whether or not the given method parameter is supported by this resolver.
