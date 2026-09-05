[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-util/src](../README.md) / removeNonWord

# Variable: removeNonWord()

> `const` **removeNonWord**: (`value`) => `string`

Defined in: packages/blue-util/src/string/remove-non-word.ts:20

Parses a piped list string into an object.

## Parameters

### value

`string`

The string to be transformed.

## Returns

`string`

The `value` with the non-word characters removed.

## Example

```ts
removeNonWord('lorem ~!@#$%^&*()_+`-={}[]|\\:";\'/?><., ipsum');
//=> "lorem - ipsum"
```
