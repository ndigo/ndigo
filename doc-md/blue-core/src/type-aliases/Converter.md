[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / Converter

# Type Alias: Converter\<S, T\>

> **Converter**\<`S`, `T`\> = (`source`) => `T`

Defined in: packages/blue-core/src/parser.ts:28

General type conversion from `S` to `T`.

This is the base concept for string-specific variants:
- **[Parser](../interfaces/Parser.md)** — class-based form of `Converter<string, T>` (use `parse*` functions for standalone utilities)
- **[Stringifier](../interfaces/Stringifier.md)** — class-based form of `Converter<T, string>` (use `stringify*` / `to*` for standalone utilities)

For standalone conversion functions, type them directly as `Converter<S, T>`:

## Type Parameters

### S

`S`

The source type.

### T

`T`

The target type.

## Parameters

### source

`S`

## Returns

`T`

## Example

```typescript
import type { Converter } from '@blue/core';

const parseWildcard: Converter<string, string> =
    (pattern) => `^${pattern.replace(/\* /g, '.*?')}$`;

const parseKeypath: Converter<string, KeypathToken[] | null> =
    (input) => { ... };
```
