# Guide 52 — The Agent Operate Contract

One vocabulary for the four ways an agent meets an application — MCP tools,
WebMCP browser tools, A2UI surfaces, and the in-page bridge — so a declaration,
a safety hint, and a denial mean the same thing wherever the agent enters.

**Audience:** Node · browser · agent tooling · **Prerequisites:** Guides [12](12-openapi-and-api-docs.md), [30](30-component-integration.md), [47](47-ai-agents.md), [48](48-agent-facing-surfaces.md) · **Reference package:** `packages/ndigo-core`, `packages/ndigo-mcp`, `packages/ndigo-view-webcomponent`

## What you'll learn

- The vocabulary shared by the bridge, MCP, WebMCP, and A2UI.
- Which safety hint each host can express — and which one it drops.
- How attribution and denial behave on every surface.
- Where the UI SDK adapter plugs in without touching application code.

## 1. The vocabulary

| Term           | What it is                                                    | Declared by                                             |
| :------------- | :------------------------------------------------------------ | :------------------------------------------------------ |
| **Tool**       | One callable operation with a JSON Schema and safety hints    | `@toolMapping` (Node), `webMcpToolForHandler` (browser) |
| **Host**       | The agent runtime an adapter registers with                   | `AgentToolHost`                                         |
| **Adapter**    | Maps the neutral contract onto one host                       | `webMcpAgentHost` today; UI SDK later                   |
| **Entity**     | Anything an agent can see and operate in the page             | `AgentEntity`                                           |
| **Snapshot**   | The entity list at one moment                                 | `AgentBridge.snapshot`                                  |
| **Query**      | Label/text/kind filtering over entities and their items       | `AgentBridge.query`                                     |
| **Act**        | Ordered actions applied through the entities' own action APIs | `AgentBridge.act`                                       |
| **Annotation** | A safety hint (`readOnlyHint`, `consequentialHint`, …)        | `AgentToolAnnotations`                                  |
| **Scope**      | Origins allowed to see and execute a browser tool             | `exposedTo`                                             |

Two rules keep the vocabulary honest. A tool is declared once, on the handler;
an adapter never re-describes it. And a **denial is data**, not an exception
(section 5).

## 2. The four surfaces

| Surface      | Entry point                                 | Direction            | Policy owner                              |
| :----------- | :------------------------------------------ | :------------------- | :---------------------------------------- |
| MCP server   | `MCPToolRegistry`, stdio or Streamable HTTP | application → agent  | registry `readOnly`/`authorize`/`confirm` |
| MCP Apps     | `ui` on `@toolMapping` + `createUiResource` | result rendering     | host rendering + app resource             |
| A2UI         | `a2uiViewResolver` over content negotiation | result rendering     | installed-component allowlist             |
| WebMCP       | `webMcpAgentHost`, `webMcpToolForHandler`   | page → browser agent | browser host consent                      |
| Agent bridge | `AgentBridge` in the page                   | page ↔ agent         | adapter + host                            |

MCP, A2UI, and the WebMCP projection share one handler declaration through
`@parameters` + `validatedBy`; Guide 48 covers the projection. This guide covers
what happens to policy once the projection exists.

## 3. One declaration, mapped hints

`AgentToolAnnotations` is the neutral vocabulary. Each host maps what it can and
drops what it cannot — silently converting a hint would be worse than dropping
it.

| Neutral hint           | `@toolMapping`  | MCP descriptor    | WebMCP       | Enforcement                                 |
| :--------------------- | :-------------- | :---------------- | :----------- | :------------------------------------------ |
| `readOnlyHint`         | `readOnly`      | `readOnlyHint`    | pass-through | `readOnly` omits and rejects mutating tools |
| `consequentialHint`    | `consequential` | `destructiveHint` | pass-through | `confirm` asks a person; host may confirm   |
| `untrustedContentHint` | — (app-level)   | —                 | pass-through | host sanitization and presentation          |
| `debugging`            | —               | —                 | pass-through | developer-only hosts                        |
| `exposedTo`            | —               | —                 | `exposedTo`  | browser host scopes origins                 |
| `authorize`/`confirm`  | —               | registry options  | host consent | refusal is an `isError` result              |

`readOnly: true` together with `consequential: true` is rejected at decoration
time: a read cannot be hard to reverse. MCP has no field for untrusted content
or developer-only tools, so those hints stop at the bridge; do not smuggle them
into `_meta` under a new name.

## 4. Attribution

Every MCP tool call is a span. `gen_ai.tool.call.id` carries the transport's
request id; `gen_ai.tool.call.source` names the invoking surface — `stdio` or
`http` for MCP transports, and `agent` when the `@ndigo/ai` loop executes a
tool. The loop sets `agent` on every call so a mixed trace can separate
model-driven calls from direct client calls. An adapter that forwards a browser
call passes the host's source the same way.

## 5. Denial is data

| Surface      | Denied call looks like                                                                |
| :----------- | :------------------------------------------------------------------------------------ |
| MCP          | `MCPToolDeniedError` → `isError` result (`Needs a person: …`), not a protocol failure |
| Agent bridge | `{ ok: false, error, failedStep }` from `act`                                         |
| WebMCP       | the browser host refuses; the tool result reports the refusal                         |
| A2UI         | the component is not in the installed allowlist; the view is unavailable              |

Throw for bugs, never for policy. A policy refusal an agent cannot read is a
crash in disguise, and every surface above has a data shape for it.

## 6. The UI SDK slot

`AgentToolHost` and `AgentBridge` are the swap point. Application code depends
on the contract from `@ndigo/core`; the browser adapter today is
`webMcpAgentHost` in `@ndigo/view-webcomponent`. When UI SDK leaves beta, its
adapter implements the same interfaces and replaces that object — no handler,
schema, or tool declaration changes. Until then, no application code imports a
`@ui-sdk/*` package; the migration is tracked in issues #550–#555.

Registration lifecycle is part of the contract: an external `AbortSignal` is
honoured, `dispose()` unregisters, and an unsupported host returns
`{ supported: false }` instead of throwing.

## 7. Conformance

The contract is executable, not aspirational:

- `ndigo verify --capability <id>` runs the declared checks against a live
  application: `scripts.inspect` for the manifest, a JSON-RPC handshake with
  `scripts.mcp`, and `scripts.openapi` for route parity.
- `packages/ndigo-core/test/agent-bridge.spec.ts` — a stub adapter satisfies the
  full surface, annotations survive registration, a denied action returns a
  result, and an unservable query returns `{ error }`.
- `packages/ndigo-mcp/test/project.spec.ts` — `readOnly`/`consequential` project
  to `readOnlyHint`/`destructiveHint`.
- `packages/ndigo-mcp/test/parity.spec.ts` — the OpenAPI document and
  `tools/list` still describe the same operations.
- `packages/ndigo-ai/test/agent.spec.ts` — the loop records `source: agent`.

A new host adapter is done when a stub-backed conformance test covers
`registerTools`, annotations, refusal, and disposal — not when the happy path
registers one tool.

## 8. Measuring (optional)

If you compare surfaces, measure the same operation end to end: schema
projection, transport, model turn, and tool execution. A number from the
browser includes the model and the page; a number from stdio does not. Report
the boundary with the number.

## See also

- [Guide 47 — AI Agents, Model Loops & Streaming](47-ai-agents.md)
- [Guide 48 — Agent-Facing Surfaces](48-agent-facing-surfaces.md)
- [Guide 51 — Capabilities for Authoring Agents](51-capabilities-for-authoring-agents.md)
- [Guide 30 — Component Integration](30-component-integration.md)
- [`@ndigo/core` — the bridge contract](../../packages/ndigo-core/README.md)
- [`@ndigo/mcp` — registry policy](../../packages/ndigo-mcp/README.md)
