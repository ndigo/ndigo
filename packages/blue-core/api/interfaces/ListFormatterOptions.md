[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / ListFormatterOptions

# Interface: ListFormatterOptions

Options for [ListFormatter](../classes/ListFormatter.md).

## Extends

- [`FormatOptions`](FormatOptions.md)

## Properties

### locale

> **locale**: `string`

A BCP 47 language tag, e.g. `en-US`, `fr-CA`, `de`.

#### Inherited from

[`FormatOptions`](FormatOptions.md).[`locale`](FormatOptions.md#locale)

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

***

### type?

> `optional` **type?**: `"unit"` \| `"conjunction"` \| `"disjunction"`

List semantics: conjunction (and), disjunction (or), or unit.
