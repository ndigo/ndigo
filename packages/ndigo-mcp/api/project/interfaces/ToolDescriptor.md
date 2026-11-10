[**@ndigo/mcp v0.0.1**](../../README.md)

***

[@ndigo/mcp](../../README.md) / [project](../README.md) / ToolDescriptor

# Interface: ToolDescriptor

One tool as reported to MCP clients.

## Properties

### annotations?

> `readonly` `optional` **annotations?**: `object`

Behaviour hints.

#### readOnlyHint?

> `readonly` `optional` **readOnlyHint?**: `boolean`

The tool only reads state.

***

### description?

> `readonly` `optional` **description?**: `string`

One-line description.

***

### inputSchema

> `readonly` **inputSchema**: [`JSONSchema`](../type-aliases/JSONSchema.md)

JSON Schema for the tool arguments.

***

### name

> `readonly` **name**: `string`

Tool name (snake_case).
