# @ndigo/mcp

> MCP tools projected from Ndigo dispatch metadata — one handler, REST route and agent tool.

An MCP tool is not a second API description. `@toolMapping` opts a handler
method into the agent surface; the tool's JSON Schema is projected from the
same `@parameters` + `validatedBy` metadata that binds the HTTP request. The
same method serves both, and the OpenAPI document and `tools/list` carry
identical schemas.

## Installation

```bash
pnpm add @ndigo/mcp
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

`ndigo add @ndigo/mcp` installs the package and runs the `mcp-setup` generator,
which writes an MCP wiring module and a sample tool controller.

## Getting Started

Mark a handler as a tool:

```ts
import { getMapping, parameters, pathValue, toolMapping } from '@ndigo/dispatcher';

export class OrdersController {
    @getMapping('/orders/:id')
    @parameters({ id: pathValue() })
    @toolMapping({ name: 'get_order', readOnly: true, description: 'Read one order.' })
    getOrder({ id }: { id: string }) {
        return this.orders.find(id);
    }
}
```

Expose the dispatcher's tools over stdio:

```ts
import { McpToolRegistry, startStdioServer } from '@ndigo/mcp';

const registry = McpToolRegistry.from(dispatcher, {
    readOnly: process.env['NDIGO_MCP_READ_ONLY'] === 'true',
    // Bind tool arguments through the same resolvers HTTP uses.
    argumentResolvers: context.getValue(ARGUMENT_RESOLVERS),
});
await startStdioServer(registry);
```

## Usage

### Projection

`McpToolRegistry.from(dispatcher, options)` walks the registered mapping tables
and projects every `@toolMapping` handler:

- **Name** — `options.name` or the snake_case method name.
- **Description** — `options.description` or `METHOD /pattern`.
- **Input schema** — one object property per `@parameters` entry, using the
  `validatedBy` Zod schema (or the extractor's conversion target when no
  schema is attached).
- **Read-only** — `readOnly: true` marks the tool; the default is mutating.

### Policy

- `readOnly: true` omits mutating tools from `tools/list` and rejects them on
  call.
- `argumentResolvers` is the dispatcher's `ARGUMENT_RESOLVERS` bean. Tools
  without parameters work without it; parameterized tools need it to bind
  path/query/header/body values.
- `@whenFeature('flag')` hides the tool unless `isFeatureEnabled(flag)` returns
  true. Without an evaluator, gated tools stay hidden (fail closed).
- The HTTP endpoint is an ordinary dispatcher route, so the interceptor chain
  (auth, rate limit, CSRF, feature gates) runs before the transport sees the
  request.

### Streamable HTTP

Mount one route; every HTTP method reaches the same endpoint:

```ts
import { McpHTTPEndpoint } from '@ndigo/mcp';
import { requestMapping } from '@ndigo/dispatcher';

const endpoint = new McpHTTPEndpoint(registry, { inspect: manifest });

@requestMapping({ value: '/mcp' })
async mcp(route: Route): Promise<void> {
    await endpoint.handle(route);
}
```

The endpoint is stateless: each request gets a fresh transport. It requires the
Node platform adapter because Streamable HTTP owns the raw request/response.

OAuth 2.1 protected-resource metadata is available as
`protectedResourceMetadata({ resource, authorizationServers, scopesSupported })`
(RFC 9728). Pair it with `AuthRouteGuard` for bearer validation and scopes; the
guard denies before the transport runs.

### MCP Apps

Link a tool to an interactive view with `ui`:

```ts
import { createUiResource } from '@ndigo/mcp';

@toolMapping({ name: 'get_orders', readOnly: true, ui: 'ui://orders' })
getOrders() { … }

const orders = createUiResource({
    uri: 'ui://orders',
    name: 'Orders',
    body: '<main>Orders</main>',
    css: 'main { color: red; }',
    script: 'console.log("orders");',
    csp: { connectDomains: ['https://api.example.test'] },
});
createMcpServer(registry, { uiResources: [orders] });
```

The server advertises `io.modelcontextprotocol/ui`, serves the document as
`text/html;profile=mcp-app`, and carries `_meta.ui` (CSP domains, permissions,
border, domain). `createUiResource` inlines CSS and a module script into one
self-contained document and rejects `</style>`/`</script>` breakouts. The host
renders it in a sandboxed iframe and builds the CSP from the declared domains —
never use a `*` origin.

### Resources and telemetry

`createMcpServer(registry, { inspect })` exposes the inspect manifest as
`ndigo://manifest`, `ndigo://routes`, and `ndigo://config` resources. Each tool
call emits one `execute_tool <name>` span with `gen_ai.tool.name` and
`gen_ai.tool.call.id` attributes; outbound HTTP spans nest under it.

## API

See the [generated API reference](api/README.md).

## Development

```bash
pnpm --filter @ndigo/mcp build:lib
pnpm --filter @ndigo/mcp test
```

## Contributing

See the repository [contributing guide](../../CONTRIBUTING.md).

## License

ISC
