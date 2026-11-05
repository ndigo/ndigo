[**@ndigo/inspect v0.0.1**](../../README.md)

***

[@ndigo/inspect](../../README.md) / [mappings](../README.md) / collectMappings

# Function: collectMappings()

> **collectMappings**(`source?`): [`InspectMapping`](../../types/interfaces/InspectMapping.md)[]

Enumerate the registered handler mappings from a mapping source.

A dispatcher contributes its `handlerMappings` collection (only entries
exposing a mapping read model are read); an array or single table is read
directly. Rows are de-duplicated (first registration wins, mirroring
dispatch precedence) and sorted by pattern, then handler class, then method.

`undefined` means "no mappings" (the optional input) and yields `[]`. An
explicit `null` is a caller error and fails fast with a [FrameworkError](#)
naming the accepted shapes, rather than an opaque `TypeError` from probing
the null source.

## Parameters

### source?

[`MappingSource`](../../types/type-aliases/MappingSource.md) \| `null`

The mapping source, `undefined` for no mappings, or `null`
  (rejected).

## Returns

[`InspectMapping`](../../types/interfaces/InspectMapping.md)[]

The sorted mapping rows.

## Throws

When `source` is `null`.
