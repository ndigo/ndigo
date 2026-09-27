[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-2.md) / removeNonWord

# Variable: removeNonWord

> `const` **removeNonWord**: (`value`) => `string`

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
