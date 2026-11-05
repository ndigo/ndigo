[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / ConversionService

# Interface: ConversionService

Central type-conversion service (modelled on the classic `ConversionService`,
extended with schema targets — AD-38).

Provides a unified API for registering, looking up, and executing type
conversions at runtime: leaf conversions (string ↔ typed, constructor
keyed) and contract-enforced object projection (zod schema targets) share
one method. Built-in converters are registered automatically when the
service is created with default options.

## Example

```typescript
import { conversionService } from '@ndigo/core';

const date = conversionService.convert('2024-01-15', Date);      // leaf: registered converter
const dto = conversionService.convert(entity, noteDtoSchema);    // shape: schema parse (fail-fast)
const dtos = conversionService.convert(entities, noteDtoSchema.array()); // arrays: schema-defined
```

## Properties

### registry

> `readonly` **registry**: [`ConverterRegistry`](../classes/ConverterRegistry.md)

Returns the underlying converter registry.

## Methods

### canConvert()

> **canConvert**(`sourceType`, `targetType`): `boolean`

Checks whether a converter exists for the given source/target type
pair, mirroring [convert](#convert)'s lookup: a pair is convertible when
an exactly-registered converter exists, or a String-source converter
is registered for the target type (the environment/config binding
fallback `convert` applies). Schema targets are always convertible.

#### Parameters

##### sourceType

`unknown`

##### targetType

`unknown`

#### Returns

`boolean`

***

### convert()

#### Call Signature

> **convert**\<`T`\>(`source`, `targetType`): `T`

Converts a value to a target type or shape.

Two target kinds:
- **Zod schema** — contract-enforced projection: the value is parsed
  through the schema (fail-fast `ZodError` on any mismatch, no partial
  result), producing the `z.infer` shape. Covers object/entity → DTO
  projection; arrays convert via `schema.array()`.
- **Constructor** — leaf conversion through the registered converter
  (e.g. `Date`, `Number`), looked up by the value's runtime source
  type with a String fallback (the environment/config binding
  convention).

##### Type Parameters

###### T

`T`

##### Parameters

###### source

`unknown`

The value to convert.

###### targetType

`ZodType`\<`T`\>

The target zod schema or type constructor.

##### Returns

`T`

The converted value; throws when no converter is registered
  (constructor targets) or the schema rejects the value (`ZodError`).

#### Call Signature

> **convert**(`source`, `targetType`): `unknown`

##### Parameters

###### source

`unknown`

###### targetType

`unknown`

##### Returns

`unknown`

***

### register()

> **register**\<`S`, `T`\>(`converter`, `sourceType`, `targetType`): `void`

Registers a converter for a source/target type pair.

#### Type Parameters

##### S

`S`

##### T

`T`

#### Parameters

##### converter

[`Converter`](Converter.md)\<`S`, `T`\>

##### sourceType

`unknown`

##### targetType

`unknown`

#### Returns

`void`

***

### unregister()

> **unregister**(`sourceType`, `targetType`): `void`

Removes the converter for a source/target type pair.

#### Parameters

##### sourceType

`unknown`

##### targetType

`unknown`

#### Returns

`void`
