[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [string](../README.md) / removeNonWord

# Variable: removeNonWord

> `const` **removeNonWord**: (`value`) => `string`

Defined in: packages/blue-util/src/string/remove-non-word.ts:15

Remove non-word characters.

## Parameters

### value

`string`

The string to be transformed.

## Returns

`string`

The `value` with the non-word characters removed.

## Example

```ts
removeNonWord( "lorem ~!@#$%^&*()_+`-={}[]|\\:\";'/?><., ipsum" );
//=> "lorem _- ipsum"
```
