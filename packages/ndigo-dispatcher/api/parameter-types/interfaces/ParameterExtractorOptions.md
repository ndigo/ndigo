[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-types](../README.md) / ParameterExtractorOptions

# Interface: ParameterExtractorOptions

Options for creating a parameter extractor with type-based conversion support.

## Properties

### convertType?

> `optional` **convertType?**: `object`

Type-based converter: specifies source and target types for ConversionService lookup.

#### source

> **source**: `unknown`

#### target

> **target**: `unknown`

***

### defaultValue?

> `optional` **defaultValue?**: `string`

Value used when the parameter is absent.

***

### required?

> `optional` **required?**: `boolean`

Whether the parameter is required.
