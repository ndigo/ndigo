[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [parse-multipart](../README.md) / MultipartLimits

# Interface: MultipartLimits

Per-upload bounds. Every field is optional; [DEFAULT\_MPART\_LIMITS](#)
fills the rest. `0` is a valid bound; negative or non-finite values throw
a `RangeError` (fail-loud boot configuration).

## Properties

### fileThreshold?

> `optional` **fileThreshold?**: `number`

Parts at or below this many bytes stay in memory; larger ones spill to a
temp file (default 128 KiB). Set to `0` to force disk for every part.

***

### maxFields?

> `optional` **maxFields?**: `number`

Maximum number of text-field parts (default 100).

***

### maxFieldSize?

> `optional` **maxFieldSize?**: `number`

Maximum size of a single text field, in bytes (default 1 MiB). Truncated fields reject with `413 field_too_large` — a silently truncated string is never bound.

***

### maxFiles?

> `optional` **maxFiles?**: `number`

Maximum number of file parts (default 100).

***

### maxFileSize?

> `optional` **maxFileSize?**: `number`

Maximum size of a single file part, in bytes (default 10 MiB).

***

### maxParts?

> `optional` **maxParts?**: `number`

Maximum total number of parts, fields + files (default `maxFiles + maxFields`).

***

### maxRequestSize?

> `optional` **maxRequestSize?**: `number`

Maximum combined size of the whole request, in bytes (default 10 MiB).
