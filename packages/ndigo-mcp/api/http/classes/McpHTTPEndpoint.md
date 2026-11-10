[**@ndigo/mcp v0.0.1**](../../README.md)

***

[@ndigo/mcp](../../README.md) / [http](../README.md) / McpHTTPEndpoint

# Class: McpHTTPEndpoint

A stateless Streamable HTTP MCP endpoint.

Wire it into an application with a methodless route:

```ts
@requestMapping({ value: '/mcp' })
async mcp(route: Route) { await endpoint.handle(route); }
```

## Constructors

### Constructor

> **new McpHTTPEndpoint**(`registry`, `options?`): `McpHTTPEndpoint`

Creates the endpoint.

#### Parameters

##### registry

[`McpToolRegistry`](../../registry/classes/McpToolRegistry.md)

The projected tools.

##### options?

[`McpHTTPEndpointOptions`](../interfaces/McpHTTPEndpointOptions.md) = `{}`

Endpoint options.

#### Returns

`McpHTTPEndpoint`

## Methods

### handle()

> **handle**(`route`): `Promise`\<`void`\>

Handles one HTTP request from a dispatcher route.

#### Parameters

##### route

[`Route`](#)

The route carrying the raw Node request and response.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the transport finished.
