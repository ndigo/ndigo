[**BlueJS Framework v3.0.0-alpha.0**](../../../../../README.md)

---

[BlueJS Framework](../../../../../modules.md) / [blue-validate/src](../../../README.md) / [formats](../README.md) / REPEATING_SEQUENCE_REGEX

# Variable: REPEATING_SEQUENCE_REGEX

> `const` **REPEATING_SEQUENCE_REGEX**: `RegExp`

Defined in: packages/blue-validate/src/formats.ts:203

## Constant

## Example

```ts
REPEATING_SEQUENCE_REGEX.test('111a!'); // is true, Since we have repeating sequence '111'
REPEATING_SEQUENCE_REGEX.test('123a!'); // is false, Since we don't have a repeating sequence
```
