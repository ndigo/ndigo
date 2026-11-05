[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [resource](../README.md) / AsModuleResourceLoader

# Function: AsModuleResourceLoader()

> **AsModuleResourceLoader**\<`T`\>(`superclass`): `Constructable`\<[`ResourceLoader`](../interfaces/ResourceLoader.md)\> & `T`

Mixin that resolves a resource by dynamic `import()` of its location, so a
resource module is loaded on demand. A failed import is wrapped in
`UnresolvedResource` rather than surfacing the loader error.

## Type Parameters

### T

`T` *extends* `Constructable`

## Parameters

### superclass

`T`

## Returns

`Constructable`\<[`ResourceLoader`](../interfaces/ResourceLoader.md)\> & `T`
