[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / ParameterExtractor

# Type Alias: ParameterExtractor

> **ParameterExtractor** = `object`

Factory function return type - describes a parameter extraction

## Properties

### convert?

> `optional` **convert?**: (`value`) => `unknown`

Optional post-bind validator/converter (e.g. Zod via `validatedBy`).

#### Parameters

##### value

`unknown`

#### Returns

`unknown`

***

### convertType?

> `optional` **convertType?**: `object`

Type-based conversion: { source: SourceConstructor, target: TargetConstructor }

#### source

> **source**: `unknown`

#### target

> **target**: `unknown`

***

### defaultValue

> **defaultValue**: `string` \| `null`

***

### name

> **name**: `string`

***

### partName?

> `optional` **partName?**: `string`

Explicit multipart/form-data client field name, when it differs from the
 method-argument name. `fileValue('avatar_url')` sets this so the resolver
 reads that part instead of inferring from the argument name.

***

### prefix?

> `optional` **prefix?**: `string` \| `null`

***

### required

> **required**: `boolean`

***

### schema?

> `optional` **schema?**: `z.ZodType`\<`unknown`\>

The Zod schema backing [ParameterExtractor.convert](#convert), when the
extractor was produced by `validatedBy` (AD-35). Generation-time
introspection seam — the OpenAPI generator derives JSON Schema from it;
never read by the resolvers (they go through `convert`).

***

### target?

> `optional` **target?**: () => `object`

Optional target constructor for whole-source binding: when set, the
 bound result is a real instance of the target (not a plain object).
 `dataBinderValue(source, Target)` sets this (D-3).

#### Returns

`object`

***

### type

> **type**: [`MethodParameterType`](../classes/MethodParameterType.md)
