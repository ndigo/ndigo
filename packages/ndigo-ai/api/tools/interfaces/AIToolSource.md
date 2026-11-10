[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [tools](../README.md) / AIToolSource

# Interface: AIToolSource

A source of tools the agent may call. Implementations decide where tools
live and how they execute; `McpToolRegistry` is the canonical one.

## Methods

### call()

> **call**(`name`, `args?`, `context?`): `Promise`\<`unknown`\>

Invokes one tool.

#### Parameters

##### name

`string`

The tool name.

##### args?

`Record`\<`string`, `unknown`\>

The decoded JSON arguments.

##### context?

[`AIToolCallContext`](AIToolCallContext.md)

The call context, including the model call id.

#### Returns

`Promise`\<`unknown`\>

The tool result.

#### Throws

When the tool is unknown, hidden, or the handler fails.

***

### listTools()

> **listTools**(): `Promise`\<readonly [`AIToolDescriptor`](AIToolDescriptor.md)[]\>

Lists the tools visible under the source's policy.

#### Returns

`Promise`\<readonly [`AIToolDescriptor`](AIToolDescriptor.md)[]\>

The tool descriptors shown to the model.
