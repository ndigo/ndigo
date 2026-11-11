# AD-101: A2UI adoption — catalog, media type, renderer, MCP Apps, WebMCP

**Date:** 2026-11-10
**Status:** Accepted.

## Context

An agent that can call an application's tools still needs to render a result.
The agent cannot be handed an arbitrary component library: the application
already has a component allowlist (`ui.lock.json`), and only the components it
installed are safe and meaningful to render. A2UI provides a declarative
surface format; MCP Apps provides a resource channel; WebMCP provides a browser
registration channel. Each is useful, and each fails if treated as a
special-cased side channel rather than another representation.

## Decision

**D-1 — The catalog is the installed set.** `ndigo ui catalog` projects the
registry plus the application's `ui.lock.json` into an A2UI 1.0 catalog. Only
installed `registry:ui` and `registry:block` items appear, so the agent's
component vocabulary is exactly what the application ships.

**D-2 — A2UI is a negotiated representation.** `application/a2ui+json` is a
registered media type; `A2UIView` serializes an array of A2UI messages, and
`a2uiViewResolver()` lets content negotiation select it against JSON and the
other views. The view is dependency-free — if A2UI stalls, the representation
is reversible in one diff.

**D-3 — The renderer is a copy-in registry item, not framework core.**
`nd-a2ui-surface` maps A2UI components to the installed `<nd-*>` elements named
in a generated component map. Unknown or uninstalled components emit
`nd-a2ui-error`. Third-party imports inside registry items are expected (the
item depends on `@a2ui/web_core`); the framework packages stay clean.

**D-4 — MCP Apps serves the same views over `ui://`.** A tool declares
`ui: 'ui://<app>'`; the server carries `_meta.ui.resourceUri` and serves the
resource as `text/html;profile=mcp-app` under the MCP Apps extension.

**D-5 — WebMCP declares the same handlers in the browser.**
`AsWebMcpElement` + `webMcpToolForHandler` register an element's tools on
connect and abort them on disconnect. The input schema is the same
`@parameters` + `validatedBy` projection; unsupported browsers get a no-op
registration (`supported: false`), and `exposedTo` controls cross-origin
exposure.

**D-6 — Read-only and allowlist rules apply everywhere.** The catalog only
contains installed items; WebMCP registration is gated by the element's tools;
MCP App resources are declared, not auto-installed.

## Rationale

- Reusing the allowlist answers the security question and the vocabulary
  question with the same data.
- A negotiated view keeps A2UI out of the core request path; an app that never
  installs it pays nothing.
- Copy-in keeps the renderer on the same lifecycle as the rest of ndigo-ui and
  avoids turning `@ndigo/ui` into a component runtime.
- WebMCP and MCP Apps expose the same tool metadata already projected for HTTP
  and MCP — no third description.

## Consequences

- The catalog and the installed registry cannot disagree; a missing item is
  simply absent.
- `@a2ui/web_core` is an item dependency, not a framework dependency.
- Browser support for WebMCP is feature-detected; server rendering and MCP
  remain the primary paths.
- A2UI 1.0 and the MCP Apps extension are versioned contracts to revisit, not
  permanent assumptions.

## Revisit triggers

- A2UI 1.0 final changes the catalog/message shape in a way the copy-in item
  cannot absorb.
- The MCP Apps extension changes its resource metadata or MIME type.
- WebMCP ships in a browser without `document.modelContext`-compatible
  discovery, or the standard regresses.
- A2UI component coverage requires components the registry does not own.

## Evidence

- `packages/ndigo-core/src/media-types.ts` — `application/a2ui+json`.
- `packages/ndigo-view/src/a2ui-view.ts` — `A2UIView`, `a2uiViewResolver`.
- `packages/ndigo-ui/registry/ui/a2ui-surface/` — copy-in renderer and
  component map.
- `packages/ndigo-cli/src/commands/ui/catalog.ts` — installed-only projection.
- `packages/ndigo-mcp/src/ui-resource.ts` — `ui://` resources.
- `packages/ndigo-view-webcomponent/src/webmcp.ts` — WebMCP declaration.
- PRs #333, #337, #339, #342, #344.

## See Also

- AD-96 — umbrella
- AD-95 — ndigo-ui registry and the allowlist
- AD-100 — `@ndigo/mcp` tool projection
