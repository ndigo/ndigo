[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [mcp/tools](../README.md) / AppManifest

# Interface: AppManifest

The parts of the `@ndigo/inspect` v1 manifest the CLI consumes.

## Properties

### app?

> `readonly` `optional` **app?**: `object`

The application identity block.

#### name?

> `readonly` `optional` **name?**: `string`

#### profiles?

> `readonly` `optional` **profiles?**: readonly `string`[]

***

### config

> `readonly` **config**: readonly [`AppConfigEntry`](AppConfigEntry.md)[]

Declared configuration keys; values are never part of the manifest.

***

### routes

> `readonly` **routes**: readonly [`AppRoute`](AppRoute.md)[]

Declarative routes, sorted by name then path.

***

### version

> `readonly` **version**: `number`

The manifest schema version.
