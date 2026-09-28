[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / OpenAPIDocsAutoConfigurationOptions

# Interface: OpenAPIDocsAutoConfigurationOptions

Options for [OpenAPIDocsAutoConfiguration](../classes/OpenAPIDocsAutoConfiguration.md).

## Extends

- `OpenAPIGeneratorOptions`

## Properties

### accessGuard?

> `optional` **accessGuard?**: [`RouteHandlerInterceptor`](#)

Interceptor applying only to the docs endpoints (spec, UI page and
assets) — the `ManagementAutoConfiguration` guard pattern. Wire e.g.
the auth-server's `AuthRouteGuard` to require authentication.

***

### description?

> `optional` **description?**: `string`

Spec `info.description`.

#### Inherited from

`OpenAPIGeneratorOptions.description`

***

### enabled?

> `optional` **enabled?**: `boolean`

Kill switch for serving (generation stays usable via the library).

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

### path?

> `optional` **path?**: `string`

Spec document URL; defaults to `/v3/api-docs`.

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

### uiPath?

> `optional` **uiPath?**: `string`

Swagger UI URL; defaults to `/swagger-ui/`.

***

### version?

> `optional` **version?**: `string`

Spec `info.version`; defaults to `'0.0.0'`.

#### Inherited from

`OpenAPIGeneratorOptions.version`
