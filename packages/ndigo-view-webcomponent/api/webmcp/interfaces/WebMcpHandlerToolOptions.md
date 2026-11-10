[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [webmcp](../README.md) / WebMcpHandlerToolOptions

# Interface: WebMcpHandlerToolOptions

Options for [webMcpToolForHandler](../functions/webMcpToolForHandler.md).

## Properties

### annotations?

> `readonly` `optional` **annotations?**: [`WebMcpToolAnnotations`](WebMcpToolAnnotations.md)

Additional safety hints.

***

### description

> `readonly` **description**: `string`

Tool description.

***

### exposedTo?

> `readonly` `optional` **exposedTo?**: readonly `string`[]

Origins allowed to use the tool.

***

### handler

> `readonly` **handler**: `object`

The handler instance (or class instance) carrying `@parameters`.

***

### method

> `readonly` **method**: `string`

The decorated method name.

***

### name

> `readonly` **name**: `string`

WebMCP tool name.

***

### readOnly?

> `readonly` `optional` **readOnly?**: `boolean`

Read-only hint.
