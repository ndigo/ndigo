[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / NumberFormatter

# Class: NumberFormatter

Formats numbers for display in an explicit locale.

A thin wrapper over `Intl.NumberFormat` that caches the underlying
instance per option set.

## Example

```ts
const formatter = new NumberFormatter({ locale: 'de-DE', style: 'currency', currency: 'EUR' });
formatter.format(1234.5); // '1.234,50 EUR'
```

## Constructors

### Constructor

> **new NumberFormatter**(`options`): `NumberFormatter`

Creates a number formatter.

#### Parameters

##### options

[`NumberFormatterOptions`](../interfaces/NumberFormatterOptions.md)

Locale and number presentation options.

#### Returns

`NumberFormatter`

## Methods

### format()

> **format**(`value`): `string`

Formats a numeric value.

#### Parameters

##### value

`number`

The number to format.

#### Returns

`string`

The locale-formatted number string.
