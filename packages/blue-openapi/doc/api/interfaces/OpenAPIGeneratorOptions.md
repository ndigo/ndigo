[**@blue/openapi v0.0.1**](../README.md)

***

[@blue/openapi](../README.md) / OpenAPIGeneratorOptions

# Interface: OpenAPIGeneratorOptions

Options for [OpenAPISpecGenerator.generate](../classes/OpenAPISpecGenerator.md#generate).

## Properties

### description?

> `optional` **description?**: `string`

Spec `info.description`.

***

### excludePaths?

> `optional` **excludePaths?**: `string`[]

Explicit path denylist (matched after template translation).

***

### include?

> `optional` **include?**: (`mapping`, `handlerMethod`) => `boolean`

Per-route filter; return `false` to leave the mapping out of the spec.
Called once per registered handler method, before path expansion.

#### Parameters

##### mapping

[`RouteMappingTable`](RouteMappingTable.md)

##### handlerMethod

`RouteHandlerMethod`

#### Returns

`boolean`

***

### servers?

> `optional` **servers?**: `string`[]

Static `servers` URLs; omitted when empty.

***

### title?

> `optional` **title?**: `string`

Spec `info.title`; defaults to `'API'`.

***

### version?

> `optional` **version?**: `string`

Spec `info.version`; defaults to `'0.0.0'`.
