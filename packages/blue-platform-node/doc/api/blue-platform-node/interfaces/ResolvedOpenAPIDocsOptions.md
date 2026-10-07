[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / ResolvedOpenAPIDocsOptions

# Interface: ResolvedOpenAPIDocsOptions

Resolved docs options (defaults applied). `uiPath` is normalized to a
trailing-slash form so `{uiPath}{*file}` concatenation is clean.

## Extends

- `OpenAPIGeneratorOptions`

## Properties

### accessGuard

> **accessGuard**: [`RouteHandlerInterceptor`](#) \| `undefined`

***

### description?

> `optional` **description?**: `string`

Spec `info.description`.

#### Inherited from

`OpenAPIGeneratorOptions.description`

***

### enabled

> **enabled**: `boolean`

***

### excludePaths?

> `optional` **excludePaths?**: `string`[]

Explicit path denylist (matched after template translation).

#### Inherited from

`OpenAPIGeneratorOptions.excludePaths`

***

### include?

> `optional` **include?**: (`mapping`, `handlerMethod`) => `boolean`

Per-route filter; return `false` to leave the mapping out of the spec.
Called once per registered handler method, before path expansion.

#### Parameters

##### mapping

`RouteMappingTable`

##### handlerMethod

`RouteHandlerMethod`

#### Returns

`boolean`

#### Inherited from

`OpenAPIGeneratorOptions.include`

***

### path

> **path**: `string`

***

### security?

> `optional` **security?**: `string`[]

Document-level default security requirements (scheme names); a
per-operation `@apiDocs({ security })` overrides them. Omitted when
empty.

#### Inherited from

`OpenAPIGeneratorOptions.security`

***

### securitySchemes?

> `optional` **securitySchemes?**: `Record`\<`string`, `OpenAPISecurityScheme`\>

Named security schemes for `components.securitySchemes` (DAT-F12).
Referenced by name from the document-level [security](OpenAPIDocsAutoConfigurationOptions.md#security) default
and per-operation `@apiDocs({ security })` requirements.

#### Inherited from

`OpenAPIGeneratorOptions.securitySchemes`

***

### servers?

> `optional` **servers?**: `string`[]

Static `servers` URLs; omitted when empty.

#### Inherited from

`OpenAPIGeneratorOptions.servers`

***

### title?

> `optional` **title?**: `string`

Spec `info.title`; defaults to `'API'`.

#### Inherited from

`OpenAPIGeneratorOptions.title`

***

### uiPath

> **uiPath**: `string`

***

### version?

> `optional` **version?**: `string`

Spec `info.version`; defaults to `'0.0.0'`.

#### Inherited from

`OpenAPIGeneratorOptions.version`
