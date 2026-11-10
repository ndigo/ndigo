[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [tool-mapping](../README.md) / getToolMapping

# Function: getToolMapping()

> **getToolMapping**(`target`, `methodName`): [`ToolMappingMetadata`](../interfaces/ToolMappingMetadata.md) \| `undefined`

Reads the tool metadata recorded by [toolMapping](toolMapping.md).

## Parameters

### target

`unknown`

The decorated class constructor or instance.

### methodName

`string`

The decorated method name.

## Returns

[`ToolMappingMetadata`](../interfaces/ToolMappingMetadata.md) \| `undefined`

The metadata, or `undefined` when the method is not a tool.
