[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [tool-mapping](../README.md) / toolMapping

# Function: toolMapping()

> **toolMapping**(`options?`): (`target`, `context`) => `void`

Marks a handler method as an MCP tool.

## Parameters

### options?

[`ToolMappingMetadata`](../interfaces/ToolMappingMetadata.md) = `{}`

Optional name, description, and read-only hint.

## Returns

The method decorator.

(`target`, `context`) => `void`

## Throws

When the name is not snake_case or the decorator targets a
  non-method.

## Example

```ts
class OrdersController {
    @getMapping('/:id')
    @parameters({ id: pathValue() })
    @toolMapping({ name: 'get_order', readOnly: true })
    getOrder({ id }: { id: string }): { id: string } {
        return { id };
    }
}
```
