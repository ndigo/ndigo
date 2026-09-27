[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-2.md) / slugify

# Function: slugify()

> **slugify**(`delimiter`, `value`): `string`

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
