[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / BodyParseResult

# Type Alias: BodyParseResult

> **BodyParseResult** = \{ `kind`: `"empty"`; \} \| \{ `kind`: `"json"`; `value`: `Record`\<`string`, `unknown`\>; \} \| \{ `kind`: `"raw"`; `raw`: `string`; \}

Body parse outcomes. Malformed input is a `400` (never silently reshaped).
