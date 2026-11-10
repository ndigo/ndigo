[**@ndigo/mcp v0.0.1**](../../README.md)

***

[@ndigo/mcp](../../README.md) / [registry](../README.md) / McpToolRegistry

# Class: McpToolRegistry

A registry of tools projected from dispatch metadata.

## Methods

### call()

> **call**(`name`, `args?`, `context?`): `Promise`\<`unknown`\>

Invokes one tool through the handler's normal binding pipeline.

#### Parameters

##### name

`string`

The tool name.

##### args?

`Record`\<`string`, `unknown`\> = `{}`

The tool arguments.

##### context?

[`ToolCallContext`](../interfaces/ToolCallContext.md) = `{}`

Transport context (request id).

#### Returns

`Promise`\<`unknown`\>

The normalized handler result.

#### Throws

When the tool is unknown, hidden by policy, or the handler fails.

***

### listTools()

> **listTools**(): `Promise`\<[`ToolDescriptor`](../../project/interfaces/ToolDescriptor.md)[]\>

Lists the tools visible under the current policy.

#### Returns

`Promise`\<[`ToolDescriptor`](../../project/interfaces/ToolDescriptor.md)[]\>

The descriptors reported by `tools/list`.

***

### from()

> `static` **from**(`source`, `options?`): `McpToolRegistry`

Projects tools from a dispatcher or mapping table.

#### Parameters

##### source

[`MappingSource`](../../project/type-aliases/MappingSource.md)

The mapping source.

##### options?

[`McpToolRegistryOptions`](../interfaces/McpToolRegistryOptions.md) = `{}`

Read-only and feature policy.

#### Returns

`McpToolRegistry`

The registry.
