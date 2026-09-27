[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / ConversionService

# Interface: ConversionService

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

Returns the underlying converter registry.

## Methods

### canConvert()

> **canConvert**(`sourceType`, `targetType`): `boolean`

Checks whether a converter exists for the given source/target type pair.

#### Parameters

##### sourceType

`unknown`

##### targetType

`unknown`

#### Returns

`boolean`

***

### convert()

> **convert**(`source`, `targetType`): `unknown`

Converts a value from one type to another using the registered converter.

#### Parameters

##### source

`unknown`

The value to convert.

##### targetType

`unknown`

The target type constructor (e.g., `Date`, `Number`).

#### Returns

`unknown`

The converted value, or throws if no converter is found.

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
