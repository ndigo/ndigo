[**@blue/scheduler v0.0.1**](../README.md)

***

[@blue/scheduler](../README.md) / TimeZones

# Variable: TimeZones

> `const` **TimeZones**: `Readonly`\<\{ `Africa`: `Readonly`\<`Record`\<`string`, `string`\>\>; `America`: `Readonly`\<`Record`\<`string`, `string`\>\>; `Asia`: `Readonly`\<`Record`\<`string`, `string`\>\>; `Europe`: `Readonly`\<`Record`\<`string`, `string`\>\>; `GMT`: `"GMT"`; `Oceania`: `Readonly`\<`Record`\<`string`, `string`\>\>; `UTC`: `"UTC"`; \}\>

Curated common IANA time-zone identifiers (AD-20 D6).

Autocomplete + typo safety for the common cases without hand-maintaining
the full ~400-entry IANA catalog. Arbitrary identifiers remain accepted —
validated by [isValidTimeZone](../functions/isValidTimeZone.md) — and a full generated catalog is a
named revisit if the curated set proves insufficient.
