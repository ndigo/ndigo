[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [static-controller](../README.md) / StaticController

# Class: StaticController

Static file serving controller (AD-28): serves files under /static.

The catch-all route binds nested paths (`/static/assets/logo.png`
to `assets/logo.png`), and every HTTP concern — conditional GET, Range,
cache headers, precompressed variants, directory index/listing, SPA
fallback — is delegated to [StaticResourceHandler](../../static-resource-handler/classes/StaticResourceHandler.md).

## Example

```ts
class AppConfig {
  @entry()
  staticController() {
    return new StaticController(resolve('dist'), { spaFallback: true });
  }
}
```

## Constructors

### Constructor

> **new StaticController**(`baseDir?`, `options?`): `StaticController`

Creates the static controller.

#### Parameters

##### baseDir?

`string`

Static root. Defaults to `STATIC_DIR` env or `./public`.

##### options?

[`StaticHandlerOptions`](../../static-resource-handler/interfaces/StaticHandlerOptions.md) = `{}`

Static handler options (D-6).

#### Returns

`StaticController`

## Methods

### serve()

> **serve**(`file?`, `route?`): `Promise`\<`void`\>

GET/HEAD /static/`{*file}` — serves the file with full HTTP semantics.

#### Parameters

##### file?

`string`

The requested file path.

##### route?

[`Route`](#)\<`Record`\<`string`, `string`\>\>

The current route.

#### Returns

`Promise`\<`void`\>
