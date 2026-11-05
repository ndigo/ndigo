[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [openapi-docs-auto-configuration](../README.md) / OpenAPIDocsAutoConfiguration

# Class: OpenAPIDocsAutoConfiguration

Auto-configuration serving the generated OpenAPI spec + Swagger UI.

The docs endpoints are registered **at construction** (per-instance
paths — decorators cannot carry instance options), carrying a private
access condition so the spec never self-references (dispatch never reads
the access condition).

## Constructors

### Constructor

> **new OpenAPIDocsAutoConfiguration**(`options?`): `OpenAPIDocsAutoConfiguration`

#### Parameters

##### options?

[`OpenAPIDocsAutoConfigurationOptions`](../interfaces/OpenAPIDocsAutoConfigurationOptions.md) = `{}`

#### Returns

`OpenAPIDocsAutoConfiguration`

## Methods

### docsController()

> **docsController**(): [`OpenAPIDocsController`](../../openapi-docs-controller/classes/OpenAPIDocsController.md)

The spec controller bean (context-aware: reads the dispatcher at
request time; generation is lazy + memoized).

#### Returns

[`OpenAPIDocsController`](../../openapi-docs-controller/classes/OpenAPIDocsController.md)

The docs controller.

***

### handlerMappings()

> **handlerMappings**(): `RadixMetadataHandlerMapping`[]

The mapping serving the spec and UI, with the configured guard.

Declared as the `handlerMappings` collection entry (the resolution
the strategy checks first), immune to registration-order clobbering.

#### Returns

`RadixMetadataHandlerMapping`[]

The docs mapping.

***

### swaggerUiController()

> **swaggerUiController**(): [`SwaggerUIController`](../../swagger-ui-controller/classes/SwaggerUIController.md)

The Swagger UI controller bean (page + assets).

#### Returns

[`SwaggerUIController`](../../swagger-ui-controller/classes/SwaggerUIController.md)

The UI controller.
