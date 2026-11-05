[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [formatter](../README.md) / DateTimeFormatter

# Class: DateTimeFormatter

Formats a Date for display in an explicit locale and time zone.

A thin wrapper over `Intl.DateTimeFormat` that caches the underlying
instance per option set and rejects invalid inputs with a clear error.

## Example

```ts
const formatter = new DateTimeFormatter({ locale: 'en-US', timeZone: 'UTC', dateStyle: 'medium' });
formatter.format(new Date('2026-09-13T12:00:00Z')); // 'Sep 13, 2026'
```

## Constructors

### Constructor

> **new DateTimeFormatter**(`options`): `DateTimeFormatter`

Creates a date/time formatter.

#### Parameters

##### options

[`DateTimeFormatterOptions`](../interfaces/DateTimeFormatterOptions.md)

Locale, time zone, and presentation styles.

#### Returns

`DateTimeFormatter`

## Methods

### format()

> **format**(`value`): `string`

Formats a date value.

#### Parameters

##### value

`string` \| `number` \| `Date`

A `Date`, an ISO 8601 string, or a millisecond timestamp.

#### Returns

`string`

The locale-formatted date string.

#### Throws

When the value cannot be parsed as a valid date.
