[**@ndigo/mcp v0.0.1**](../../README.md)

***

[@ndigo/mcp](../../README.md) / [project](../README.md) / RegisteredTool

# Interface: RegisteredTool

A projected tool with the handler needed to invoke it.

## Properties

### descriptor

> `readonly` **descriptor**: [`ToolDescriptor`](ToolDescriptor.md)

The client-facing descriptor.

***

### feature?

> `readonly` `optional` **feature?**: `string`

Feature flag gating the tool, when `@whenFeature` is present.

***

### handlerMethod

> `readonly` **handlerMethod**: `RouteHandlerMethod`

The dispatch handler method.

***

### info

> `readonly` **info**: `RouteMappingInfo`

The mapping that declared it.

***

### readOnly

> `readonly` **readOnly**: `boolean`

`true` when `@toolMapping` declared the tool read-only.
