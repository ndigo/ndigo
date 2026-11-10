[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [tools](../README.md) / AiToolDescriptor

# Interface: AiToolDescriptor

One tool as reported by a source: the same shape as MCP `tools/list`
entries (`name`, `description`, JSON Schema `inputSchema`).

## Properties

### description?

> `readonly` `optional` **description?**: `string`

One-line description shown to the model.

***

### inputSchema

> `readonly` **inputSchema**: `Record`\<`string`, `unknown`\>

JSON Schema for the tool arguments.

***

### name

> `readonly` **name**: `string`

The tool name the model must call.
