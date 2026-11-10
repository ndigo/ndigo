# Guide 48 — Agent-Facing Surfaces

Make one handler a REST route, an OpenAPI operation, an MCP tool, an MCP App,
an A2UI surface, and a browser tool — from one schema and without duplicating a
single description. Reference applications: `apps/21-ndigo-agent-lab` for the
Node surfaces and `apps/20-ndigo-ui-lab` for the browser surfaces.

**Audience:** Node · browser · **Prerequisites:** guides 05, 06, 07, 12, 30, 37 · **Reference app:** `apps/21-ndigo-agent-lab` (Node), `apps/20-ndigo-ui-lab` (browser)

## What you'll learn

- Why `@parameters` and `validatedBy` are the only schema you write.
- How to project a handler into MCP over stdio and Streamable HTTP.
- How to link a tool to an MCP App `ui://` resource.
- How to serve A2UI through content negotiation and render it with the installed catalog.
- How to expose a browser handler as a WebMCP tool.
- How to test the OpenAPI ↔ `tools/list` parity.

## 1. One handler, many surfaces

| Surface    | Declaration                                 | Consumer                |
| :--------- | :------------------------------------------ | :---------------------- |
| REST route | `@getMapping` / `@postMapping`              | HTTP clients            |
| OpenAPI    | the same route metadata                     | generated document      |
| MCP tool   | `@toolMapping`                              | stdio, Streamable HTTP  |
| MCP App    | `ui` on `@toolMapping` + `createUiResource` | MCP host iframe         |
| A2UI       | `ModelAndView` + `a2uiViewResolver`         | `application/a2ui+json` |
| WebMCP     | `@parameters` + `webMcpToolForHandler`      | browser agent           |

The invariant is the metadata: `@parameters` declares the extractors and
`validatedBy` declares the Zod schema. Every surface above reads that one
description, so a renamed argument or a tightened schema cannot drift between
the route, the OpenAPI document, and `tools/list`.

## 2. Declare the tool

`@toolMapping` opts a handler into the agent surface. It carries only
agent-specific metadata — never a second argument schema.

```ts
@requestMapping('/')
export class OrderTools {
    @getMapping('/tools/orders')
    @toolMapping({ name: 'list_orders', readOnly: true, description: 'List every order.', ui: 'ui://orders' })
    listOrders(): readonly Order[] {
        return ORDERS;
    }

    @getMapping('/tools/orders/:id')
    @parameters({ id: pathVariable('id') })
    @toolMapping({ name: 'lookup_order', readOnly: true, description: 'Read one order by id.' })
    lookupOrder(id: string): Order | { error: string } {
        return ORDERS.find((order) => order.id === id) ?? { error: `order '${id}' not found` };
    }
}
```

- The name must be snake_case starting with a letter; the method name is the
  default.
- `readOnly: true` marks the tool as non-mutating. A read-only registry omits
  mutating tools from `tools/list` **and** rejects them on call.
- `description` defaults to the route summary.
- `ui` is an MCP Apps resource URI (`ui://…`); it is projected as
  `_meta.ui.resourceUri`.
- `@whenFeature('flag')` removes a gated tool from `tools/list` entirely — fail
  closed when the evaluator is absent.

## 3. Serve it over stdio and HTTP

Build one registry from the dispatcher, then attach a transport:

```ts
const registry = McpToolRegistry.from(context.getValue(DISPATCHER), {
    readOnly: true,
    argumentResolvers: context.getValue(ARGUMENT_RESOLVERS),
});
await startStdioServer(registry, { name: 'ndigo-agent-lab', uiResources: [ordersUi] });
```

Streamable HTTP mounts the same registry on an ordinary route, so the normal
interceptor chain (auth, rate limits, CSRF, feature gates) runs before the
transport sees the request:

```ts
@requestMapping('/')
export class McpHTTPController {
    readonly #endpoint = new McpHTTPEndpoint(registry, { uiResources: [ordersUi] });

    @requestMapping('/mcp')
    @parameters({ route: routeValue() })
    async mcp(route: Route): Promise<void> {
        await this.#endpoint.handle(route);
    }
}
```

Notes:

- `@requestMapping('/mcp')` with no HTTP method handles any method.
- `routeValue()` with no name binds the whole `Route`; without it the handler
  receives no arguments.
- Build the endpoint lazily in the real app: the registry projects the
  dispatcher's mappings, so it must run after every controller is registered
  (see `#resolveEndpoint()` in the demo).
- `ndigo add @ndigo/mcp` installs the package and runs the `mcp-setup`
  generator: a wiring module, a `scripts.mcp` entry, and one sample tool.

## 4. Policy, auth, and telemetry

- **Read-only by default.** Pass `readOnly: true` unless the application
  deliberately exposes mutations; the policy applies to both list and call.
- **OAuth 2.1.** Serve `protectedResourceMetadata(...)` beside the endpoint and
  let `AuthRouteGuard` validate the bearer token and `@authorized` roles. The
  guard denies before the transport runs.
- **Limits.** Apply per-tool or per-principal budgets through
  `@ndigo/rate-limit`; wrap downstream calls in `@circuitBreaker` / `@retry`.
- **Telemetry.** Every call emits one `execute_tool <name>` span with
  `gen_ai.tool.name` and `gen_ai.tool.call.id`; outbound HTTP spans nest under
  it.
- **Audit.** Log the tool name and principal in an interceptor; never log
  arguments that may carry secrets.

```ts
export const metadata = protectedResourceMetadata({
    resource: 'https://api.example.test/mcp',
    authorizationServers: ['https://auth.example.test'],
    scopesSupported: ['tools.read'],
});
```

`scopesSupported` is advertised RFC 9728 metadata. The framework's
`AuthRouteGuard` enforces `@authorized` roles, not scopes; enforce scopes in
your adapter or a custom guard when the deployment requires them.

## 5. MCP Apps

An MCP App is a tool plus a `ui://` document the host renders in a sandboxed
iframe. Link the tool with `ui`, then build the document:

```ts
export const ordersUi = createUiResource({
    uri: 'ui://orders',
    name: 'Orders',
    description: 'The order catalogue rendered by an MCP Apps host.',
    trustedMarkup: true,
    body: '<main><h1>Orders</h1><table>…</table></main>',
    css: 'table { border-collapse: collapse; }',
    csp: { connectDomains: ['https://api.example.test'] },
});
```

- `createUiResource` inlines CSS and one script into a self-contained document
  and rejects `</style>` / `</script>` breakouts.
- `body` is HTML-escaped by default; set `trustedMarkup: true` only for markup
  the application authored.
- The server advertises `io.modelcontextprotocol/ui`, serves the document as
  `text/html;profile=mcp-app`, and carries `_meta.ui` (CSP domains,
  permissions, border, domain).
- Declare every external origin in `csp`; never use `*`.
- Pass the resource to both transports: `startStdioServer(registry, {
  uiResources })` and `new McpHTTPEndpoint(registry, { uiResources })`.

## 6. A2UI

A2UI is a representation, not a runtime dependency: the handler returns an
array of A2UI 1.0 messages and content negotiation picks it.

```ts
export function orderSurfaceMessages(): readonly unknown[] {
    return [
        { version: '1.0', createSurface: { surfaceId: 'orders', catalogId: 'ndigo-ui' } },
        {
            version: '1.0',
            updateComponents: {
                surfaceId: 'orders',
                components: [{ id: 'root', component: 'Switch', checked: true }],
            },
        },
    ];
}

@requestMapping('/reports')
export class ReportController {
    @getMapping('/orders')
    orders(): ModelAndView {
        return new ModelAndView('orders', orderSurfaceMessages());
    }
}
```

Register the resolver so `orders` has two representations. JSON stays first, so
an unopinionated `Accept: */*` keeps the JSON default:

```ts
@configuration
export class AgentLabConfiguration {
    @entry()
    viewResolver(): ContentNegotiationViewResolver {
        const manager = new ContentNegotiationManager([
            new PathExtensionContentNegotiationStrategy(
                new Map([
                    ['json', MediaTypes.APPLICATION_JSON],
                    ['a2ui', MediaTypes.APPLICATION_A2UI_JSON],
                ])
            ),
        ]);
        const resolver = new ContentNegotiationViewResolver(manager);
        const jsonOrders: ViewResolver = {
            resolveViewName: async (name: string) => (name === 'orders' ? new JSONView() : null),
        };
        resolver.viewResolvers = [jsonOrders, a2uiViewResolver('orders')];
        return resolver;
    }
}
```

```bash
curl -s localhost:3210/reports/orders -H 'accept: application/a2ui+json'
```

The client renders the messages with `<nd-a2ui-surface>` from the `@ndigo/ui`
registry:

```ts
const surface = document.querySelector<NdA2uiSurface>('#a2ui-demo');
surface.messages = orderSurfaceMessages();
```

The catalog is the security model: the surface renders only components the
application installed (`ndigo.ui.json` + `ui.lock.json`). An unknown component
sets `data-error` and emits `nd-a2ui-error` instead of rendering. Tell the
agent what it may use with `ndigo ui catalog --json` or the `get_catalog` MCP
tool on `ndigo ui mcp`.

## 7. WebMCP

A browser view exposes a handler as a WebMCP tool with the same metadata an
HTTP route binds:

```ts
export class WebMcpDemo extends AsWebMcpElement(NdElement) {
    @parameters({ query: validatedBy(z.string().min(2), queryValue('query', { required: true })) })
    search(query: string): readonly CatalogueItem[] {
        return CATALOGUE.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
    }

    override webMcpTools(): readonly WebMcpTool[] {
        return [
            webMcpToolForHandler({
                handler: this,
                method: 'search',
                name: 'search_catalogue',
                description: 'Search the tea catalogue by name.',
                readOnly: true,
            }),
        ];
    }
}
```

- `AsWebMcpElement` registers the tools on connect and aborts the registration
  on disconnect; a reconnect registers again.
- The input schema comes from the same `@parameters` + `validatedBy` metadata.
- Browsers without `document.modelContext` get a no-op registration
  (`supported: false`), so the element ships everywhere.
- `exposedTo` lists secure origins allowed to call a cross-origin tool.
- Non-element code uses `provideWebMcpTools()` or `declareWebMcpTool()`.

## 8. Prove the parity

The parity test is mechanical: generate the OpenAPI document from the same
dispatcher tables and compare each operation's parameters and body with the
tool's `inputSchema`.

```ts
const tables = dispatcher.handlerMappings.filter((mapping) => 'getHandlerMethods' in mapping);
const document = new OpenAPISpecGenerator().generate(tables as RouteMappingTable[]);
const tools = await registry.listTools();
```

`packages/ndigo-mcp/test/parity.spec.ts` proves the projection itself;
`apps/21-ndigo-agent-lab/test/parity.spec.ts` proves the demo wiring (tool list,
`_meta.ui`, the `lookup_order` schema against the generated operation, and A2UI
serialization). `apps/20-ndigo-ui-lab/test/a2ui-surface.spec.ts` covers
installed-component rendering and unknown-component rejection.

## See also

- Package references: [`@ndigo/mcp`](../../packages/ndigo-mcp/README.md),
  [`@ndigo/view`](../../packages/ndigo-view/README.md),
  [`@ndigo/view-webcomponent`](../../packages/ndigo-view-webcomponent/README.md)
- [Guide 09 — Views, Targets & Content Negotiation](09-views-and-content-negotiation.md)
- [Guide 30 — Component Integration](30-component-integration.md)
- [Guide 37 — The `ndigo` CLI](37-ndigo-cli.md)
- [Guide 47 — AI Agents, MCP Tools & Streaming](47-ai-agents.md)
- AD-96 (agent integration), AD-100 (tool projection), AD-101 (A2UI)
- Reference apps: `apps/21-ndigo-agent-lab`, `apps/20-ndigo-ui-lab`
