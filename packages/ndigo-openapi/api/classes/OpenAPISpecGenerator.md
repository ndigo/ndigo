[**@ndigo/openapi v0.0.1**](../README.md)

***

[@ndigo/openapi](../README.md) / OpenAPISpecGenerator

# Class: OpenAPISpecGenerator

Builds OpenAPI documents from the framework's route tables.

Thread-safe and pure: `generate` reads dispatch metadata and returns a
fresh document; nothing is cached on the instance.

## Constructors

### Constructor

> **new OpenAPISpecGenerator**(): `OpenAPISpecGenerator`

#### Returns

`OpenAPISpecGenerator`

## Methods

### generate()

> **generate**(`mappings`, `options?`): [`OpenAPIDocument`](../interfaces/OpenAPIDocument.md)

Generate the API document for the given handler mappings.

#### Parameters

##### mappings

readonly [`RouteMappingTable`](../interfaces/RouteMappingTable.md)[]

The registered mappings, in dispatch order (first
  mapping wins, mirroring the strategy's precedence).

##### options?

[`OpenAPIGeneratorOptions`](../interfaces/OpenAPIGeneratorOptions.md) = `{}`

Document options + filters.

#### Returns

[`OpenAPIDocument`](../interfaces/OpenAPIDocument.md)

The OpenAPI 3.0.3 document.
