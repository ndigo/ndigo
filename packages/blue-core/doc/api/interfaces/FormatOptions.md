[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / FormatOptions

# Interface: FormatOptions

Shared formatting options. The locale is always explicit; the time zone is
always explicit for date/time formatting so server-rendered output can be
pinned and hydrated identically on the client (never ambient server time).

## Extended by

- [`DateTimeFormatterOptions`](DateTimeFormatterOptions.md)
- [`NumberFormatterOptions`](NumberFormatterOptions.md)
- [`RelativeTimeFormatterOptions`](RelativeTimeFormatterOptions.md)
- [`ListFormatterOptions`](ListFormatterOptions.md)

## Properties

### locale

> **locale**: `string`

A BCP 47 language tag, e.g. `en-US`, `fr-CA`, `de`.

***

### timeZone?

> `optional` **timeZone?**: `string`

An IANA time zone, e.g. `UTC`, `America/New_York`.
