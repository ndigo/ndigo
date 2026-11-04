[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / ListFormatter

# Class: ListFormatter

Formats string lists (e.g. "a, b, and c") in an explicit locale.

A thin wrapper over `Intl.ListFormat` that caches the underlying instance
per option set.

## Example

```ts
const formatter = new ListFormatter({ locale: 'en', type: 'conjunction' });
formatter.format(['Ada', 'Grace']); // 'Ada and Grace'
```

## Constructors

### Constructor

> **new ListFormatter**(`options`): `ListFormatter`

Creates a list formatter.

#### Parameters

##### options

[`ListFormatterOptions`](../interfaces/ListFormatterOptions.md)

Locale and list presentation options.

#### Returns

`ListFormatter`

## Methods

### format()

> **format**(`values`): `string`

Formats a list of strings.

#### Parameters

##### values

readonly `string`[]

The strings to join.

#### Returns

`string`

The locale-formatted list string.
