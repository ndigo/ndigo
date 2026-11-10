[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [mcp/tools](../README.md) / recordRule

# Function: recordRule()

> **recordRule**(`context`, `request`): `Promise`\<\{ `index`: `string`; `path`: `string`; \}\>

Writes one rule to `.ndigo/rules/<slug>.md` and regenerates the index.

## Parameters

### context

[`AppToolContext`](../interfaces/AppToolContext.md)

The application context.

### request

[`RuleRequest`](../interfaces/RuleRequest.md)

The rule name, text, and overwrite choice.

## Returns

`Promise`\<\{ `index`: `string`; `path`: `string`; \}\>

The written paths relative to the application directory.
