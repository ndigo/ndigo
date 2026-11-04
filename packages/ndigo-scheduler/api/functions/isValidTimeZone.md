[**@ndigo/scheduler v0.0.1**](../README.md)

***

[@ndigo/scheduler](../README.md) / isValidTimeZone

# Function: isValidTimeZone()

> **isValidTimeZone**(`zone`): `boolean`

Validates an IANA time-zone identifier using the platform's ICU data.

`Intl.DateTimeFormat` throws `RangeError` on unknown zones, which also
catches the silent-UTC-fallback class of configuration bugs (croner, for
example, accepts garbage zones silently — AD-20 D6 requires this probe).

## Parameters

### zone

`string`

The IANA identifier to validate.

## Returns

`boolean`

Whether the identifier is a recognized time zone.
