[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [formatter](../README.md) / NumberFormatterOptions

# Interface: NumberFormatterOptions

Options for [NumberFormatter](../classes/NumberFormatter.md).

## Extends

- [`FormatOptions`](FormatOptions.md)

## Properties

### currency?

> `optional` **currency?**: `string`

ISO 4217 currency code — required when `style` is `currency`.

***

### locale

> **locale**: `string`

A BCP 47 language tag, e.g. `en-US`, `fr-CA`, `de`.

#### Inherited from

[`FormatOptions`](FormatOptions.md).[`locale`](FormatOptions.md#locale)

***

### maximumFractionDigits?

> `optional` **maximumFractionDigits?**: `number`

Maximum digits after the decimal separator.

***

### minimumFractionDigits?

> `optional` **minimumFractionDigits?**: `number`

Minimum digits after the decimal separator.

***

### notation?

> `optional` **notation?**: `"standard"` \| `"scientific"` \| `"engineering"` \| `"compact"`

Compact or scientific notation.

***

### style?

> `optional` **style?**: keyof NumberFormatOptionsStyleRegistry

Number presentation style.

***

### timeZone?

> `optional` **timeZone?**: `string`

An IANA time zone, e.g. `UTC`, `America/New_York`.

#### Inherited from

[`FormatOptions`](FormatOptions.md).[`timeZone`](FormatOptions.md#timezone)

***

### unit?

> `optional` **unit?**: `string`

Unit identifier — used when `style` is `unit`.
