# AD-100: `@ndigo/mcp` — application tools projected from dispatch metadata

**Date:** 2026-11-10
**Status:** Accepted.

## Context

An application's MCP tools must describe the same operations its HTTP API
serves. Authoring them separately produces the usual drift: a route gains a
parameter, the tool schema does not, and the agent sends invalid arguments.
Ndigo already derives `@ndigo/openapi` from dispatch metadata; the tool surface
can be the same projection with a different transport.

The CLI's MCP servers are for introspection of a project. Application tools are
a different audience: they run inside the app, need the app's handler
instances, and must participate in the app's auth and policy chain.

## Decision

**One decorator, `@toolMapping`.** Applied to a handler method, it carries the
tool name, description, `readOnly` hint, optional `ui` resource, and the feature
gate declared by `@whenFeature`. It follows the camelCase `*Mapping` family and
stores metadata under `mcp:toolMapping` (AD-83).

**Schema projection, not a second schema.** `McpToolRegistry.from(source)`
walks the dispatcher's mapping tables and projects every `@toolMapping`
handler. The input schema comes from the same `@parameters` + `validatedBy`
metadata that binds the HTTP request; the descriptor carries that JSON Schema
verbatim, so the OpenAPI document and `tools/list` agree mechanically.

**Invocation goes through the binding pipeline.** `McpToolRegistry.call()`
builds a synthetic `Route`, binds arguments with the dispatcher's
`ARGUMENT_RESOLVERS` chain, and invokes the same handler the HTTP route uses.
The registry accepts the resolver chain (or reads an initialized dispatcher)
and fails with an actionable error when a parameterized tool has none.

**Policy is the registry's, transport is the caller's.** `readOnly` omits
mutating tools from `tools/list` and rejects them on call; `@whenFeature`
hides a tool unless the evaluator enables it (fail closed without one).
`startStdioServer` serves stdio; `McpHTTPEndpoint` is mounted on an ordinary
dispatcher route, so the normal interceptor chain (auth, rate limiting, CSRF,
flags) runs before the transport.

**MCP Apps and resources.** `createMcpServer` serves resources/prompts and
`ui://` resources as `text/html;profile=mcp-app`; a tool with
`ui: 'ui://<app>'` carries `_meta.ui.resourceUri` so hosts can render the
declared view. WebMCP declaration is a separate view-layer concern (AD-101).

**Telemetry.** Each call emits one `execute_tool <name>` span with
`gen_ai.tool.name` and `gen_ai.tool.call.id`; the tool projection never emits
its own model spans.

## Rationale

- Projection gives tool/HTTP parity without review discipline; the parity test
  is the mechanical proof.
- Reusing the binding pipeline means Zod validation, converters, and error
  shaping behave identically in both surfaces.
- Read-only and feature gates fail closed, matching the CLI's `--readOnly`
  posture.
- Serving HTTP through a dispatcher route avoids a second auth stack.

## Consequences

- `@ndigo/mcp` is Node-only: stdio and Streamable HTTP transports, plus
  `node:crypto` for call ids.
- Consumers that call parameterized tools must pass the
  `ARGUMENT_RESOLVERS` bean (or use an initialized dispatcher). The registry
  errors clearly instead of crashing inside argument binding.
- Tool schemas are exactly the route schemas; a tool cannot hide a required
  parameter from the model.
- Interceptors that apply to the HTTP route also apply to MCP HTTP calls.

## Revisit triggers

- The MCP specification moves to a transport or auth profile this route-based
  mounting cannot represent.
- Hosts require tool approval or streaming results as a first-class contract.
- A non-dispatch tool source needs to be first-class rather than an
  `AIToolSource` implementation.

## Evidence

- `packages/ndigo-mcp/src/project.ts`, `registry.ts`, `server.ts`, `http.ts`,
  `ui-resource.ts`.
- Guide 37 — agent tools; guide 47 — agent loop.
- Tests: projection, read-only/feature gating, resolver-backed calls, stdio and
  Streamable HTTP, MCP Apps resources.
- PRs #335 (package), #342 (MCP Apps), #350 (resolver binding fix).

## See Also

- AD-96 — umbrella
- AD-99 — CLI MCP host extraction and the introspection server
- AD-101 — A2UI, MCP Apps, WebMCP
