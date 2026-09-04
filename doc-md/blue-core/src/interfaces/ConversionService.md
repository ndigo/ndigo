[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / ConversionService

# Interface: ConversionService

Defined in: packages/blue-core/src/converter.ts:265

Central type-conversion service (modelled on Spring's `ConversionService`).

Provides a unified API for registering, looking up, and executing type
conversions at runtime. Built-in converters are registered automatically
when the service is created with default options.

## Example

```typescript
// Get the shared singleton instance
import { conversionService } from '@blue/core';

const date = conversionService.convert('2024-01-15', Date);
const uuid = conversionService.convert('a1b2c3d4-e5f6-7890-abcd-ef1234567890', String);
```

## Properties

### registry

> `readonly` **registry**: [`ConverterRegistry`](../classes/ConverterRegistry.md)

Defined in: packages/blue-core/src/converter.ts:292

Returns the underlying converter registry.

## Methods

### canConvert()

> **canConvert**(`sourceType`, `targetType`): `boolean`

Defined in: packages/blue-core/src/converter.ts:269

Checks whether a converter exists for the given source/target type pair.

#### Parameters

##### sourceType

`any`

##### targetType

`any`

#### Returns

`boolean`

***

### convert()

> **convert**(`source`, `targetType`): `any`

Defined in: packages/blue-core/src/converter.ts:277

Converts a value from one type to another using the registered converter.

#### Parameters

##### source

`any`

The value to convert.

##### targetType

`any`

The target type constructor (e.g., `Date`, `Number`).

#### Returns

`any`

The converted value, or throws if no converter is found.

***

### register()

> **register**\<`S`, `T`\>(`converter`, `sourceType`, `targetType`): `void`

Defined in: packages/blue-core/src/converter.ts:282

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

`any`

##### targetType

`any`

#### Returns

`void`

***

### unregister()

> **unregister**(`sourceType`, `targetType`): `void`

Defined in: packages/blue-core/src/converter.ts:287

Removes the converter for a source/target type pair.

#### Parameters

##### sourceType

`any`

##### targetType

`any`

#### Returns

`void`
