[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [string](../README.md) / removeNonPrintable

# Variable: removeNonPrintable

> `const` **removeNonPrintable**: (`value`) => `string`

Defined in: [packages/blue-util/src/string/remove-non-printable.ts:19](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-util/src/string/remove-non-printable.ts#lines-19)

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
