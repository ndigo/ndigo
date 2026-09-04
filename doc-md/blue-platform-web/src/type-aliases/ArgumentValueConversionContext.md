[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / ArgumentValueConversionContext

# Type Alias: ArgumentValueConversionContext

> **ArgumentValueConversionContext** = `ParameterValueConversionContext` & `object`

Defined in: packages/blue-platform-web/src/argument-value-converter.ts:19

Conversion context passed to argument-value converters.

Extends the dispatcher conversion context with the current route so browser
converters can resolve values from route-scoped data.

## Type Declaration

### route

> **route**: `Route`
