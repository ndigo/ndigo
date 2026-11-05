[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [browser-environment](../README.md) / filterImportMetaEnv

# Function: filterImportMetaEnv()

> **filterImportMetaEnv**(`env`, `prefix?`): `JSONObject`

Filters an `import.meta.env`-style object down to the client-visible keys
(matching the given prefix — the Vite `VITE_` contract by default).

The allow-list IS the security boundary: anything not matching the prefix
never becomes a property, so stray secrets in the build environment cannot
leak into client reads. Exposed as a pure function for direct testing.

## Parameters

### env

`Record`\<`string`, `unknown`\> \| `undefined`

The raw environment object (typically `import.meta.env`).

### prefix?

`string` = `IMPORT_META_PREFIX`

The key prefix to expose (default `VITE_`).

## Returns

`JSONObject`

The filtered, client-visible property map.
