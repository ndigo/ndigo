[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / RelativeTimeFormatterOptions

# Interface: RelativeTimeFormatterOptions

Options for [RelativeTimeFormatter](../classes/RelativeTimeFormatter.md).

## Extends

- [`FormatOptions`](FormatOptions.md)

## Properties

### locale

> **locale**: `string`

A BCP 47 language tag, e.g. `en-US`, `fr-CA`, `de`.

#### Inherited from

[`FormatOptions`](FormatOptions.md).[`locale`](FormatOptions.md#locale)

***

### numeric?

> `optional` **numeric?**: `"always"` \| `"auto"`

`auto` allows strings like "yesterday" where the language supports them.

***

### style?

> `optional` **style?**: `"long"` \| `"short"` \| `"narrow"`

Message length.

***

### timeZone?

> `optional` **timeZone?**: `string`

An IANA time zone, e.g. `UTC`, `America/New_York`.

#### Inherited from

[`FormatOptions`](FormatOptions.md).[`timeZone`](FormatOptions.md#timezone)
