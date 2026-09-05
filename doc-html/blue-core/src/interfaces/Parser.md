[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / Parser

# Interface: Parser\<T\>

Defined in: [packages/blue-core/src/parser.ts:27](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/parser.ts#lines-27)

Class-based interface for parsing a string into a structured value of type `T`.

Represents the class-based form of `Converter<string, T>` from `@blue/core/converter`.
Implement this interface when the parser needs to be registered, injected, or composed as an object.
For standalone utility functions, use the `parse*` naming convention and type with
`Converter<string, T>` directly (imported from `'@blue/core'`).

## Example

```typescript
// Class-based — implements Parser<T>
class MatrixString implements Parser<MatrixParams>, Stringifier<MatrixParams> {
    parse(value: string): MatrixParams { ... }
    stringify(value: MatrixParams): string { ... }
}

// Standalone function — typed as Converter<string, T> (from @blue/core)
const parseWildcard: Converter<string, string> = (pattern) => ...;
```

## Type Parameters

### T

`T` = `any`

The type of the parsed value.

## Methods

### parse()

> **parse**(`value`): `T`

Defined in: [packages/blue-core/src/parser.ts:33](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/parser.ts#lines-33)

Parses a string value into a value of type T.

#### Parameters

##### value

`string`

The string value to parse.

#### Returns

`T`

The parsed value of type T.
