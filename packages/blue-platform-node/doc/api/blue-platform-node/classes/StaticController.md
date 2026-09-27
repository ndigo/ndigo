[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / StaticController

# Class: StaticController

Static file serving controller (AD-28): `/static/{*file}`.

The catch-all `{*file}` route binds nested paths (`/static/assets/logo.png`
→ `assets/logo.png`), and every HTTP concern — conditional GET, Range,
cache headers, precompressed variants, directory index/listing, SPA
fallback — is delegated to [StaticResourceHandler](StaticResourceHandler.md).

## Example

```ts
@entry
staticController() {
    return new StaticController(resolve('dist'), { spaFallback: true });
}
```

## Constructors

### Constructor

> **new StaticController**(`baseDir?`, `options?`): `StaticController`

#### Parameters

##### baseDir?

`string`

Static root. Defaults to `STATIC_DIR` env or `./public`.

##### options?

[`StaticHandlerOptions`](../interfaces/StaticHandlerOptions.md) = `{}`

Static handler options (D-6).

#### Returns

`StaticController`

## Methods

### serve()

> **serve**(`file?`, `route?`): `Promise`\<`void`\>

GET/HEAD /static/{*file} — serves the file with full HTTP semantics.

#### Parameters

##### file?

`string`

##### route?

[`Route`](#)\<`Record`\<`string`, `string`\>\>

#### Returns

`Promise`\<`void`\>
