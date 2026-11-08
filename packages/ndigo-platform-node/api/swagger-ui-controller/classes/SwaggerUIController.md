[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [swagger-ui-controller](../README.md) / SwaggerUIController

# Class: SwaggerUIController

The UI controller. Registered without decorator metadata by
[OpenAPIDocsAutoConfiguration](../../openapi-docs-auto-configuration/classes/OpenAPIDocsAutoConfiguration.md) (per-instance paths).

`swagger-ui-dist` is a peer dependency resolved lazily: a missing or
unresolvable peer fails only the docs endpoints (500 problem document),
never boot of the whole docs auto-configuration (SEC-3).

## Constructors

### Constructor

> **new SwaggerUIController**(`options`): `SwaggerUIController`

#### Parameters

##### options

[`ResolvedOpenAPIDocsOptions`](../../openapi-docs-auto-configuration/interfaces/ResolvedOpenAPIDocsOptions.md)

#### Returns

`SwaggerUIController`

## Methods

### asset()

> **asset**(`file`, `route`): `Promise`\<`void`\>

Serves a Swagger UI asset from `swagger-ui-dist` with full HTTP
semantics (ETag/conditional GET, cache headers, single-range).

#### Parameters

##### file

`string` \| `undefined`

The asset path (e.g. `swagger-ui-bundle.js`).

##### route

[`Route`](#)

The current route.

#### Returns

`Promise`\<`void`\>

A promise that resolves once written.

***

### page()

> **page**(`route`): `Promise`\<`void`\>

Writes the UI page (no-cache: the page is the wiring point).

#### Parameters

##### route

[`Route`](#)

The current route (carries the Node response).

#### Returns

`Promise`\<`void`\>

A promise that resolves once written.
