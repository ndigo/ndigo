[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [index](../README.md) / ArgumentValueConversionContext

# Type Alias: ArgumentValueConversionContext

> **ArgumentValueConversionContext** = `ParameterValueConversionContext` & `object`

Conversion context passed to argument-value converters.

Extends the dispatcher conversion context with the current route so platform
converters can resolve values from route-scoped data.

## Type Declaration

### route

> **route**: [`Route`](#)
