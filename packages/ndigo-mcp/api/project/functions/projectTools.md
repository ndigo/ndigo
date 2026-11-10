[**@ndigo/mcp v0.0.1**](../../README.md)

***

[@ndigo/mcp](../../README.md) / [project](../README.md) / projectTools

# Function: projectTools()

> **projectTools**(`source`): [`RegisteredTool`](../interfaces/RegisteredTool.md)[]

Projects every `@toolMapping` handler in the source into a registered tool.

## Parameters

### source

[`MappingSource`](../type-aliases/MappingSource.md)

A dispatcher, a mapping table, or an array of tables.

## Returns

[`RegisteredTool`](../interfaces/RegisteredTool.md)[]

The tools, in registration order.

## Throws

When two handlers project to the same tool name.
