[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [helpers/mcp-host](../README.md) / McpHost

# Interface: McpHost

A configured MCP server plus registration and stdio helpers.

## Properties

### server

> `readonly` **server**: `McpServer`

The underlying server, for tests and advanced wiring.

## Methods

### registerTool()

> **registerTool**\<`Shape`\>(`tool`): `void`

Registers a tool, skipping it under [McpHostOptions.readOnly](McpHostOptions.md#readonly).

#### Type Parameters

##### Shape

`Shape` *extends* `ZodRawShapeCompat`

#### Parameters

##### tool

[`McpToolDefinition`](McpToolDefinition.md)\<`Shape`\>

The tool definition to register.

#### Returns

`void`

***

### startStdio()

> **startStdio**(`label`): `Promise`\<`void`\>

Connects a stdio transport and writes the listening line to stderr.

#### Parameters

##### label

`string`

The server label prefixed to the stderr line.

#### Returns

`Promise`\<`void`\>
