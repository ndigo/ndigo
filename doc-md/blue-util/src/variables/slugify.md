[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-util/src](../README.md) / slugify

# Variable: slugify

> `const` **slugify**: `SlugifyFunction`

Defined in: packages/blue-util/src/string/slugify.ts:31

Converts a string into a slug.

The character with which spaces will be replaced.

The value to be slugified.

## Returns

The slugified string.

## Example

```ts
const hyphenate = slugify('-');
hyphenate('Lorem Ipsum Dolor');
//=> "lorem-ipsum-dolor"
slugify('~', 'Lorem Ipsum Dolor');
//=> "lorem~ipsum~dolor"
```
