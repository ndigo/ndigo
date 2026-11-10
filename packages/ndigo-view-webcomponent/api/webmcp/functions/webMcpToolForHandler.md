[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [webmcp](../README.md) / webMcpToolForHandler

# Function: webMcpToolForHandler()

> **webMcpToolForHandler**(`options`): [`WebMcpTool`](../interfaces/WebMcpTool.md)

Projects a handler method and its `@parameters`/`validatedBy` metadata into
a WebMCP tool. Arguments are validated with the same extractor converters
the HTTP route uses, then passed to the method as one object.

## Parameters

### options

[`WebMcpHandlerToolOptions`](../interfaces/WebMcpHandlerToolOptions.md)

Handler, method, and tool description.

## Returns

[`WebMcpTool`](../interfaces/WebMcpTool.md)

The WebMCP tool.

## Throws

When the method does not exist.
