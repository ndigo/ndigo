[**@ndigo/mcp v0.0.1**](../../README.md)

***

[@ndigo/mcp](../../README.md) / [registry](../README.md) / McpToolRegistryOptions

# Interface: McpToolRegistryOptions

Policy options for a registry.

## Properties

### isFeatureEnabled?

> `readonly` `optional` **isFeatureEnabled?**: (`flag`) => `boolean` \| `Promise`\<`boolean`\>

Feature-flag evaluator. A `@whenFeature` tool is omitted unless this
returns true; without an evaluator, gated tools stay hidden (fail closed).

#### Parameters

##### flag

`string`

#### Returns

`boolean` \| `Promise`\<`boolean`\>

***

### readOnly?

> `readonly` `optional` **readOnly?**: `boolean`

Omit mutating tools from `tools/list` and reject them on call.
