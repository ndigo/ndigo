[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [mcp/tools](../README.md) / getBestPractices

# Function: getBestPractices()

> **getBestPractices**(`context`, `request?`): `Promise`\<\{ `sections`: readonly [`PracticeSection`](../interfaces/PracticeSection.md)[]; `sources`: readonly `string`[]; \}\>

Renders `STYLE_GUIDE.md` and `ARCHITECTURE.md` sections. Without a topic
this is an index (titles only); with one, the matching bodies are returned.

## Parameters

### context

[`AppToolContext`](../interfaces/AppToolContext.md)

The application context (document discovery starts here).

### request?

[`PracticeRequest`](../interfaces/PracticeRequest.md) = `{}`

The optional topic filter.

## Returns

`Promise`\<\{ `sections`: readonly [`PracticeSection`](../interfaces/PracticeSection.md)[]; `sources`: readonly `string`[]; \}\>

The source paths and selected sections.
