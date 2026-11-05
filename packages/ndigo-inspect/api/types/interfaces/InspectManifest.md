[**@ndigo/inspect v0.0.1**](../../README.md)

***

[@ndigo/inspect](../../README.md) / [types](../README.md) / InspectManifest

# Interface: InspectManifest

The deterministic, versioned application manifest.

## Properties

### app

> **app**: [`InspectApp`](InspectApp.md)

The application identity block.

***

### config

> **config**: [`InspectConfigEntry`](InspectConfigEntry.md)[]

Declared configuration keys, sorted by key.

***

### generatedAt

> **generatedAt**: `string`

When the manifest was generated (ISO 8601).

***

### mappings

> **mappings**: [`InspectMapping`](InspectMapping.md)[]

Registered handler mappings, sorted by pattern then handler.

***

### routes

> **routes**: [`InspectRoute`](InspectRoute.md)[]

Declarative routes, sorted by name then path.

***

### version

> **version**: `1`

The manifest schema version.
