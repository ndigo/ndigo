[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [tool-mapping](../README.md) / ToolMappingMetadata

# Interface: ToolMappingMetadata

Tool metadata declared by [toolMapping](../functions/toolMapping.md).

## Properties

### description?

> `readonly` `optional` **description?**: `string`

One-line tool description; defaults to the route summary.

***

### name?

> `readonly` `optional` **name?**: `string`

MCP tool name (snake_case); defaults to the method name.

***

### readOnly?

> `readonly` `optional` **readOnly?**: `boolean`

Mark the tool read-only (mutating tools are gated by policy).

***

### ui?

> `readonly` `optional` **ui?**: `string`

MCP Apps resource URI (`ui://…`) rendered by the host after the call.
Projected as `_meta.ui.resourceUri`.
