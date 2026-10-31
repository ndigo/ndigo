[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / Converter

# Interface: Converter\<S, T\>

A general-purpose type conversion from source `S` to target `T`.

Unlike [Parser](Parser.md) (string → T) and [Stringifier](Stringifier.md) (T → string),
this interface handles arbitrary source-to-target conversions. It is the
class-based form used by [ConverterRegistry](../classes/ConverterRegistry.md) and [ConversionService](ConversionService.md).

For simple one-off conversions, use a plain function typed as
`Converter<S, T>` directly — the registry accepts any object with a `convert` method:

## Example

```typescript
// Class-based converter (for registration)
class MyIdConverter implements Converter<string, MyId> {
    convert(value: string): MyId { return new MyId(value); }
}
registry.register(new MyIdConverter(), String, MyId);

// Function-based converter (directly usable)
const parseHex: Converter<string, number> = (s) => parseInt(s, 16);
```

## Type Parameters

### S

`S`

The source type.

### T

`T`

The target type.

## Methods

### convert()

> **convert**(`source`): `T`

Converts a value of type `S` to type `T`.

#### Parameters

##### source

`S`

The source value.

#### Returns

`T`

The converted target value.
