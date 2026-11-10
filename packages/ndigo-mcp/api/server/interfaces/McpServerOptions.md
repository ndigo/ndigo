[**@ndigo/mcp v0.0.1**](../../README.md)

***

[@ndigo/mcp](../../README.md) / [server](../README.md) / McpServerOptions

# Interface: McpServerOptions

Options for [createMcpServer](../functions/createMcpServer.md).

## Properties

### inspect?

> `readonly` `optional` **inspect?**: `InspectManifest`

The application manifest, exposed as MCP resources.

***

### name?

> `readonly` `optional` **name?**: `string`

Server name reported to clients.

***

### uiResources?

> `readonly` `optional` **uiResources?**: readonly [`UiResource`](../../ui-resource/interfaces/UiResource.md)[]

MCP Apps `ui://` resources served as `text/html;profile=mcp-app`.

***

### version?

> `readonly` `optional` **version?**: `string`

Server version reported to clients.
