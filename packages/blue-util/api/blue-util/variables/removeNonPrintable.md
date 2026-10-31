[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-2.md) / removeNonPrintable

# Variable: removeNonPrintable

> `const` **removeNonPrintable**: (`value`) => `string`

Remove non-printable characters

## Parameters

### value

`string`

The string to be transformed.

## Returns

`string`

The `value` with the non-printable characters removed.

## Example

```ts
removeNonPrintable( "äÄçÇéÉêlorem-ipsumöÖÐþúÚ" );
//=> "lorem-ipsum"
```
