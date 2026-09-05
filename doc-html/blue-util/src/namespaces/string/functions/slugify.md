[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [string](../README.md) / slugify

# Function: slugify()

> **slugify**(`delimiter`, `value`): `string`

Defined in: [packages/blue-util/src/string/slugify.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-util/src/string/slugify.ts#lines-22)

Converts a string into a slug.

## Parameters

### delimiter

`string`

The character with which spaces will be replaced.

### value

`string`

The value to be slugified.

## Returns

`string`

The slugified string.

## Example

```ts
slugify( '-', 'Lorem Ipsum Dolor' );
//=> "lorem-ipsum-dolor"
slugify( '~', 'Lorem Ipsum Dolor' );
//=> "lorem~ipsum~dolor"
```
