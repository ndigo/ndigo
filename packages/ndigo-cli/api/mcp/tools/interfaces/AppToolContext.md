[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [mcp/tools](../README.md) / AppToolContext

# Interface: AppToolContext

Per-server application context; the manifest is built once and cached.

## Properties

### dir

> `readonly` **dir**: `string`

The application directory (absolute).

## Methods

### manifest()

> **manifest**(): `Promise`\<[`AppManifest`](AppManifest.md)\>

The application manifest, built by `scripts.inspect`.

#### Returns

`Promise`\<[`AppManifest`](AppManifest.md)\>
