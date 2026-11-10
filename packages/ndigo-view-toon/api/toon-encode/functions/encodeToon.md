[**@ndigo/view-toon v0.0.1**](../../README.md)

***

[@ndigo/view-toon](../../README.md) / [toon-encode](../README.md) / encodeToon

# Function: encodeToon()

> **encodeToon**(`value`, `options?`): `string`

Encodes a JSON-model value as a TOON document (spec v4.4).

## Parameters

### value

`unknown`

The value to encode — plain objects, arrays, and JSON
  primitives; the type system cannot prove that, so runtime failures map
  to `IllegalStateError` here rather than surfacing from deep inside the
  encoder.

### options?

[`ToonEncodeOptions`](../interfaces/ToonEncodeOptions.md) = `{}`

Indentation and delimiter tuning.

## Returns

`string`

The rendered document.

## Throws

`IllegalStateError` when the value is not encodable (functions,
  `undefined`, BigInt, circular references) or the options are invalid.

## Example

```ts
encodeToon([{ id: 'a', qty: 2 }, { id: 'b', qty: 5 }]);
// rows[2]{id,qty}: a,2 / b,5 — the tabular form TOON exists for
```
