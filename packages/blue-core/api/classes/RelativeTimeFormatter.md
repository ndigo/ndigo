[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / RelativeTimeFormatter

# Class: RelativeTimeFormatter

Formats relative time (e.g. "3 days ago") in an explicit locale.

A thin wrapper over `Intl.RelativeTimeFormat` that caches the underlying
instance per option set.

## Example

```ts
const formatter = new RelativeTimeFormatter({ locale: 'en', numeric: 'always' });
formatter.format(-3, 'day'); // '3 days ago'
```

## Constructors

### Constructor

> **new RelativeTimeFormatter**(`options`): `RelativeTimeFormatter`

Creates a relative-time formatter.

#### Parameters

##### options

[`RelativeTimeFormatterOptions`](../interfaces/RelativeTimeFormatterOptions.md)

Locale and presentation options.

#### Returns

`RelativeTimeFormatter`

## Methods

### format()

> **format**(`value`, `unit`): `string`

Formats a relative time value.

#### Parameters

##### value

`number`

The delta (negative for the past).

##### unit

`RelativeTimeFormatUnit`

The time unit.

#### Returns

`string`

The locale-formatted relative time string.
