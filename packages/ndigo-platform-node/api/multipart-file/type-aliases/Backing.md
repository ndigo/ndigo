[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [multipart-file](../README.md) / Backing

# Type Alias: Backing

> **Backing** = \{ `data`: `Buffer`; `kind`: `"buffer"`; \} \| \{ `kind`: `"temp"`; `path`: `string`; `size`: `number`; \}

Backing store for a parsed file part: in-memory buffer or temp-file handle.
