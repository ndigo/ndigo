[**@ndigo/openapi v0.0.1**](../../README.md)

***

[@ndigo/openapi](../../README.md) / [writer](../README.md) / WriteOpenAPISpecOptions

# Interface: WriteOpenAPISpecOptions

Options for [writeOpenAPISpec](../functions/writeOpenAPISpec.md).

## Properties

### format?

> `optional` **format?**: [`OpenAPIFormat`](../type-aliases/OpenAPIFormat.md)

Serialization format; `'yaml'` currently falls back to JSON.

***

### generatorOptions?

> `optional` **generatorOptions?**: [`OpenAPIGeneratorOptions`](../../spec/interfaces/OpenAPIGeneratorOptions.md)

Generator options (security, server url, etc.).

***

### mappings

> **mappings**: readonly [`RouteMappingTable`](../../spec/interfaces/RouteMappingTable.md)[]

Route tables to merge into the document.

***

### outPath

> **outPath**: `string`

Destination file path.
