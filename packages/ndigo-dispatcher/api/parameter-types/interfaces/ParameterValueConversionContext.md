[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-types](../README.md) / ParameterValueConversionContext

# Interface: ParameterValueConversionContext

Context handed to a `ParameterValueConverter`: the bound parameter name, the
`MethodParameter` it came from, and the route/mapping metadata the value is
being bound for.

## Properties

### mapping

> **mapping**: `unknown`

The route mapping.

***

### name

> **name**: `string`

The bound parameter name.

***

### parameter

> **parameter**: [`MethodParameter`](../classes/MethodParameter.md)

The method parameter it came from.

***

### route

> **route**: `unknown`

The route being resolved.
