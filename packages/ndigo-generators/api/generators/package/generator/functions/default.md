[**@ndigo/generators v0.0.1**](../../../../README.md)

***

[@ndigo/generators](../../../../README.md) / [generators/package/generator](../README.md) / default

# Function: default()

> **default**(`tree`, `schema`): `Promise`\<`void`\>

Scaffolds a package skeleton (manifest, tsconfig, README stub, `src/index.ts`
with the canonical header) under `packages/ndigo-<name>`, validating the name
and refusing to overwrite an existing directory.

## Parameters

### tree

`Tree`

### schema

[`PackageGeneratorSchema`](../interfaces/PackageGeneratorSchema.md)

## Returns

`Promise`\<`void`\>
