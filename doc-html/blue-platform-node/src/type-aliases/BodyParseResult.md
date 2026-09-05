[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / BodyParseResult

# Type Alias: BodyParseResult

> **BodyParseResult** = \{ `kind`: `"empty"`; \} \| \{ `kind`: `"json"`; `value`: `Record`\<`string`, `unknown`\>; \} \| \{ `kind`: `"raw"`; `raw`: `string`; \}

Defined in: [packages/blue-platform-node/src/http-request-limits.ts:76](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/http-request-limits.ts#lines-76)

Body parse outcomes. Malformed input is a `400` (never silently reshaped).
