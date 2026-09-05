[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-util/src](../README.md) / isEmpty

# Function: isEmpty()

> **isEmpty**(`x`): `boolean`

Defined in: packages/blue-util/src/logic/is-empty.ts:21

Returns `true` if the given value is its type's empty value; `false` otherwise.

## Parameters

### x

`any`

## Returns

`boolean`

## Example

```ts
isEmpty([1, 2, 3]); //=> false
isEmpty([]); //=> true
isEmpty(''); //=> true
isEmpty(null); //=> false
isEmpty({}); //=> true
isEmpty({ length: 0 }); //=> false
isEmpty(Uint8Array.from('')); //=> true
```
