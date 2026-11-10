[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [helpers/mcp-host](../README.md) / McpToolDefinition

# Interface: McpToolDefinition\<Shape\>

One tool registered on an [McpHost](McpHost.md).

## Type Parameters

### Shape

`Shape` *extends* [`ToolSchema`](../type-aliases/ToolSchema.md) = [`ToolSchema`](../type-aliases/ToolSchema.md)

## Properties

### annotations?

> `readonly` `optional` **annotations?**: `object`

Behaviour hints for the client.

***

### description

> `readonly` **description**: `string`

What the tool does and when to use it.

***

### inputSchema

> `readonly` **inputSchema**: `Shape`

Zod raw shape validating the tool arguments.

***

### mutating?

> `readonly` `optional` **mutating?**: `boolean`

When `true`, the tool is omitted in read-only mode.

***

### name

> `readonly` **name**: `string`

Stable tool name (snake_case).

***

### run

> `readonly` **run**: (`args`) => `unknown`

Executes the tool; the resolved value is serialized as JSON text.

#### Parameters

##### args

[`ToolArguments`](../type-aliases/ToolArguments.md)\<`Shape`\>

#### Returns

`unknown`

***

### title

> `readonly` **title**: `string`

Human-readable title.
