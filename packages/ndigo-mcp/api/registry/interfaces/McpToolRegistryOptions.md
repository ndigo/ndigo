[**@ndigo/mcp v0.0.1**](../../README.md)

***

[@ndigo/mcp](../../README.md) / [registry](../README.md) / McpToolRegistryOptions

# Interface: McpToolRegistryOptions

Policy options for a registry.

## Properties

### argumentResolvers?

> `readonly` `optional` **argumentResolvers?**: readonly `HandlerMethodArgumentResolver`[]

The dispatcher's argument-resolver chain (the `ARGUMENT_RESOLVERS`
context bean). Tool calls bind path/query/header/body arguments through
the same resolvers as HTTP; without them, tools that declare parameters
fail with a clear error.

***

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
