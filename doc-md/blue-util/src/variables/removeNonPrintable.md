[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-util/src](../README.md) / removeNonPrintable

# Variable: removeNonPrintable()

> `const` **removeNonPrintable**: (`value`) => `string`

Defined in: packages/blue-util/src/string/remove-non-printable.ts:22

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
