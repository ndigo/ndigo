# Agent-facing surfaces — implementation plan

**Status:** Proposed
**Decision:** [AD-96](../decisions/2026-11-10_AD96_LLM_AGENT_INTEGRATION.md) (umbrella),
[AD-100](../decisions/2026-11-10_AD100_MCP_TOOL_PROJECTION.md) (tool projection),
[AD-101](../decisions/2026-11-10_AD101_A2UI_ADOPTION.md) (A2UI)
**Tracking:** [#358](https://github.com/ndigo/ndigo/issues/358)
**Scope:** `docs/guides` (new 48; edits to 47, 37, 09, `README.md`, `coverage.md`),
`apps/21-ndigo-agent-lab`, `apps/20-ndigo-ui-lab`, `packages/ndigo-mcp`
(HTTP `uiResources` passthrough), generated `docs-index.md`, `ndigo-site` sync.

---

## 0. Why now

The agent integration ships in two directions, and only one is documented:

| Direction              | What it means                                   | Documented today                                                  |
| :--------------------- | :---------------------------------------------- | :---------------------------------------------------------------- |
| Model → app            | Run an agent inside a Ndigo app                 | Guide 47 — `@ndigo/ai`, `@ndigo/ai-sdk`, SSE, limits (180 lines)  |
| App → agent            | Make handlers callable by an agent              | Fragments only — see below                                        |

The plan's own audience split says developer agents are addressed by P0–P2 and
product agents by P3–P5. Guide 47 covers P5 alone; P3 (tool projection) and P4
(A2UI, MCP Apps, WebMCP) have no task-shaped guide.

Current coverage of the P3/P4 surface:

| Surface                    | Documented at                                                          | Depth                     |
| :------------------------- | :--------------------------------------------------------------------- | :------------------------ |
| `@ndigo/mcp` tool registry | `docs/guides/coverage.md` maps the package to Guide 37 (the CLI guide) | Package home is a CLI doc |
| MCP Apps `ui://`           | Guide 37, one paragraph                                                | Thin                      |
| WebMCP                     | Guide 37, two sentences; package README                                | Thin; no coverage row     |
| A2UI view                  | Guide 09, one subsection                                               | View-contract depth       |
| `get_catalog` / A2UI items | Guide 30, one sentence; Guide 37, CLI command                          | Mention                   |

AD-96's evidence line claims "Guides: 37 and 47". That is optimistic: 37 is a
command reference, 47 stops at the model loop.

The P4 exit criteria also name a demo that does not exist yet: "one item renders
in a MCP Apps host" and "a WebMCP tool appears in a browser agent". No app
under `apps/` demonstrates either — `apps/21-ndigo-agent-lab` covers P5 only,
and `apps/20-ndigo-ui-lab` covers A2UI rendering. Writing the guide exposes
this gap, so the demo extension is part of this plan rather than a follow-up.

---

## 1. What ships

| # | Deliverable                                                                | Kind                |
| :- | :------------------------------------------------------------------------- | :------------------ |
| 1 | `docs/guides/48-agent-facing-surfaces.md`                                  | New guide           |
| 2 | `apps/21-ndigo-agent-lab`: MCP App, A2UI route, Streamable HTTP endpoint   | Demo (Node)         |
| 3 | `apps/20-ndigo-ui-lab`: WebMCP demo element beside the A2UI surface        | Demo (browser)      |
| 4 | `packages/ndigo-mcp`: `McpHTTPEndpointOptions.uiResources`                 | Small additive API  |
| 5 | Guide 47: structured output, adapter contract, abort/errors                | Guide extension     |
| 6 | Guides 37/09 + index/coverage/AD-96 evidence                               | Pointer edits       |
| 7 | `tools/agent-content/docs-index.md` + CLI asset copy                       | Generated           |
| 8 | `ndigo-site` content sync                                                  | Separate repo       |

Deliberately **not** shipped: a guide for `ndigo ai:*` (stays in Guide 37 and
the site page), a guide per package, and any new AI runtime feature.

---

## 2. Guide 48 — Agent-Facing Surfaces

**Path:** `docs/guides/48-agent-facing-surfaces.md`
**Title:** `# Guide 48 — Agent-Facing Surfaces`
**Audience:** Node · browser · **Prerequisites:** 05, 06, 07, 12, 30, 37
**Reference apps:** `apps/21-ndigo-agent-lab`, `apps/20-ndigo-ui-lab`

Opening paragraph (also what the generated docs index picks up): one handler,
one schema, five surfaces — REST route, OpenAPI operation, MCP tool, MCP App,
A2UI surface, WebMCP tool — with no duplicated descriptions.

### Section outline

| § | Section                    | Content                                                                                                              | Target  |
| :- | :------------------------- | :------------------------------------------------------------------------------------------------------------------- | :------ |
| 1 | One handler, many surfaces | Projection table; where each surface is declared; schema parity as the invariant                                     | ~30 ln  |
| 2 | Declaring a tool           | `@toolMapping({ name, description, readOnly, ui })`; naming rules; `@whenFeature` removes a tool from `tools/list`    | ~40 ln  |
| 3 | Serving MCP                | `McpToolRegistry.from(dispatcher, { readOnly, argumentResolvers, isFeatureEnabled })`; stdio vs Streamable HTTP      | ~35 ln  |
| 4 | Policy and auth            | Bearer/scopes through `@ndigo/auth-*`; per-tool rate limits; breaker; one `execute_tool` span; read-only default     | ~30 ln  |
| 5 | MCP Apps                   | `ui: 'ui://orders'`; `createUiResource(...)`; CSP/visibility/permissions; single-file HTML; no wildcard origin       | ~35 ln  |
| 6 | A2UI                       | `A2UIView` / `a2uiViewResolver` / `MediaTypes.APPLICATION_A2UI_JSON`; `nd-a2ui-surface`; installed-only catalog       | ~40 ln  |
| 7 | WebMCP                     | `AsWebMcpElement` + `webMcpToolForHandler`; connect/disconnect lifecycle; `exposedTo`; feature detection              | ~30 ln  |
| 8 | Prove the parity           | `OpenAPISpecGenerator` over the dispatcher tables vs `tools/list`; MCP smoke test; unknown-component rejection        | ~25 ln  |

Total target: ~265 lines, under the 300-line target and well under the 400-line
warning.

### Rules the guide must respect

- The H1 number matches the filename (`48`).
- Every backticked `apps/…` / `packages/…` path exists — `pnpm guides:check`
  enforces this.
- TypeScript fences parse; fragments are wrapped by the checker.
- Link the guide from `docs/guides/README.md`.
- The A2UI section states the catalog constraint plainly: the surface renders
  only installed ndigo-ui elements; there is no `Text`/`List` basic catalog.
  That is why the demo uses `Switch`/`Slider`, not a free-form layout.
- The guide does not re-teach the model loop (47), per-client MCP config (site
  page), or CLI flags (37).

---

## 3. Demo extensions

### 3.1 `apps/21-ndigo-agent-lab` (Node)

Today the app has `order-tools.ts` (two `@toolMapping` handlers), `chat-controller.ts`
(SSE), `mcp.ts` (stdio), and no HTTP MCP transport, MCP App, A2UI route, or test
lane.

| File                                    | Change                                                                                                       |
| :-------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `src/order-tools.ts`                    | Add `ui: 'ui://orders'` to `listOrders`' `@toolMapping`                                                       |
| `src/orders-ui.ts` (new)                | `createUiResource({ uri: 'ui://orders', name, body, css, script, csp })` — one self-contained document        |
| `src/mcp.ts`                            | Pass `{ name: 'ndigo-agent-lab', uiResources: [ordersUi] }` to `startStdioServer`                             |
| `src/http-mcp-controller.ts` (new)      | Lazy `McpHTTPEndpoint` + methodless `@requestMapping({ value: '/mcp' })` handler (mirror `ChatController`'s lazy context pattern) |
| `src/report-controller.ts` (new)        | `@getMapping('/reports/orders')` returning `ModelAndView('orders', a2uiMessages)`                             |
| `src/agent-lab-configuration.ts`        | `@entry()` `ContentNegotiationViewResolver` with `a2uiViewResolver('orders')` + a JSON resolver for `orders`  |
| `package.json`                          | `@ndigo/view` (runtime), `vitest` (dev); add a `test` script                                                  |
| `test/parity.spec.ts` (new)             | OpenAPI ↔ `tools/list` schema parity; `_meta.ui.resourceUri` on `list_orders`; A2UI view serialization        |
| `vitest.config.ts` (new)                | Node environment, `ndigoAliases` (mirror `apps/20-ndigo-ui-lab/vitest.config.ts`)                             |
| `README.md`                             | Sections for MCP Apps, A2UI, and the HTTP endpoint; run commands                                             |

Notes:

- The A2UI messages use `Switch` and `Slider` so `apps/20-ndigo-ui-lab`'s
  surface can render them (the installed-only catalog). The payload is a
  `createSurface` + `updateComponents` pair, catalog id `ndigo-ui`.
- The parity test builds the dispatcher tables the same way
  `OpenAPIDocsController` does: `dispatcher.handlerMappings.filter((m) => 'getHandlerMethods' in m)`.
- The HTTP endpoint needs the `uiResources` passthrough from §3.3; without it,
  `tools/list` would advertise `_meta.ui.resourceUri` while `resources/read`
  returns nothing.

### 3.2 `apps/20-ndigo-ui-lab` (browser)

The lab already renders A2UI through `<nd-a2ui-surface>` and has a jsdom test
lane. WebMCP belongs here because it is the browser half of the same story.

| File                                      | Change                                                                                                       |
| :---------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `src/components/webmcp/webmcp-demo.ts` (new) | `class WebMcpDemo extends AsWebMcpElement(NdElement)` with a `@parameters`-decorated `search` and `webMcpTools()` returning `webMcpToolForHandler(...)` |
| `src/main.ts`                             | Import the demo module so `defineElement('nd-webmcp-demo', …)` runs                                           |
| `index.html`                              | One section with `<nd-webmcp-demo>` and a status line                                                         |
| `test/webmcp-demo.spec.ts` (new)          | jsdom: `document.modelContext` is absent, so registration is a no-op; assert the tool descriptor and that connect/disconnect do not throw |
| `package.json`                            | `@ndigo/dispatcher`, `@ndigo/view-webcomponent`, `zod`                                                        |

Notes:

- The handler uses `queryValue('query')` + `validatedBy(z.string().min(2))`, so
  the WebMCP input schema is the same one an HTTP route would bind.
- `exposedTo` is left unset in the demo (same-origin only); the guide explains
  when to set it.

### 3.3 `packages/ndigo-mcp` — HTTP UI resources

`McpHTTPEndpointOptions` currently exposes only `inspect`, while
`createMcpServer` already accepts `uiResources`. Widening the type is additive:

```ts
export interface McpHTTPEndpointOptions {
    readonly inspect?: InspectManifest;
    /** MCP Apps `ui://` resources served as `text/html;profile=mcp-app`. */
    readonly uiResources?: readonly UiResource[];
}
```

`http.ts` already forwards `this.#options` to `createMcpServer`, so only the
type and a test change. Extend `test/http.spec.ts` with a case asserting the
server advertises `io.modelcontextprotocol/ui` and serves the resource.
Regenerate `packages/ndigo-mcp/api/` with `pnpm doc:api`.

---

## 4. Guide 47 extension

Guide 47 stays the model-loop guide; it gains three short sections and a
cross-link to 48.

| Addition              | Content                                                                                                                 |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| Structured output     | `AiAgent.object({ schema, messages })` → `AiObjectResult<T>`; the adapter's `generateObject`; when to prefer it over tools |
| The adapter contract  | `AiModel`: `info`, `generateStep`, `streamStep`, `generateObject`; adapters never execute tools — the loop does          |
| Abort and failures    | `AiRunRequest.signal`; `AiModelDisabledError` (rollout flag) and `AiRateLimitError` (`retryAfterMs`)                     |

Retitle the H1 to `# Guide 47 — AI Agents, Model Loops & Streaming` so "MCP
Tools" is not claimed by two guides. The filename stays; links are unaffected.
Update the one-line description in `docs/guides/README.md`.

---

## 5. Existing-guide and index edits

| File                                          | Edit                                                                                                              |
| :-------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| `docs/guides/37-ndigo-cli.md`                 | Replace the runtime MCP Apps/WebMCP paragraphs with one-line pointers to 48. Keep `ndigo mcp`, `ndigo ai:*`, `ui catalog` — it is the CLI guide |
| `docs/guides/09-views-and-content-negotiation.md` | Keep the A2UI view subsection; add "see Guide 48 for the end-to-end surface"                                  |
| `docs/guides/README.md`                       | Add 48 to the index; update 47's summary                                                                          |
| `docs/guides/coverage.md`                     | `@ndigo/mcp` → 48 (37 stays for the host command); add 48 to `@ndigo/view`, `@ndigo/view-webcomponent`, `@ndigo/ui`; note WebMCP on the webcomponent row |
| `docs/decisions/2026-11-10_AD96_LLM_AGENT_INTEGRATION.md` | Evidence line: `Guides: 37, 47, 48`                                                                  |
| `docs/plans/README.md`                        | Index this plan under "Draft Plans"                                                                               |

Do not rewrite the 2026-11-09 integration plan; it is a historical record.

---

## 6. Generated and published surfaces

- `pnpm agent-content:build` regenerates `tools/agent-content/docs-index.md`
  and `packages/ndigo-cli/assets/agent/docs-index.md`; Guide 48's first
  paragraph becomes the agent-visible summary.
- `pnpm agent-content:check` must be clean in CI.
- `ndigo-site` (separate repo) syncs `docs/guides/NN-*.md`. It currently stops
  at 46, so the sync will pick up 47 and 48 together. Run `npm run sync` there
  and commit the regenerated content.

---

## 7. Testing

| Layer            | Command                                                        | Asserts                                                              |
| :--------------- | :------------------------------------------------------------- | :------------------------------------------------------------------- |
| Guide contract   | `pnpm guides:check`                                            | H1 numbering, reference paths, parseable fences, index link          |
| Links            | `pnpm docs:links`                                              | No broken relative links after the edits                             |
| MCP transport    | `pnpm vitest run packages/ndigo-mcp/test/http.spec.ts`         | HTTP endpoint advertises and serves UI resources                     |
| Agent lab        | `pnpm --filter @ndigo/agent-lab test`                          | OpenAPI ↔ `tools/list` parity, `_meta.ui`, A2UI serialization        |
| UI lab           | `pnpm --filter @ndigo/ui-lab test`                             | WebMCP descriptor + no-op registration without `document.modelContext` |
| Generated content | `pnpm agent-content:check`                                    | Docs index matches the guide tree                                    |
| Repo gates       | `pnpm lint`, `pnpm build`, `pnpm test`                         | Nothing regressed                                                    |

Manual smoke:

```bash
pnpm --filter @ndigo/agent-lab start
curl -s localhost:3210/mcp -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
curl -s localhost:3210/reports/orders -H 'accept: application/a2ui+json'
pnpm --filter @ndigo/agent-lab mcp   # stdio: tools/list + resources/read ui://orders
```

---

## 8. Risks and decisions

| Risk / decision                     | Position                                                                                                                   |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| WebMCP cannot run in a Node app     | Browser surface goes to `apps/20-ndigo-ui-lab` (already the A2UI home), not `apps/21`. Guide 48 cites both apps.            |
| A2UI catalog has no `Text`/`List`   | Demo uses `Switch`/`Slider`; the guide states the constraint. A basic catalog is out of scope and would be a separate change. |
| `McpHTTPEndpoint` API change        | Additive optional field; regenerate `packages/ndigo-mcp/api/`. `pnpm-lock.yaml` untouched.                                   |
| Guide 47 retitle                    | Cheap and clarifying; filename unchanged, so no redirects.                                                                  |
| A guide for `ndigo ai:*`            | Not yet. Guide 37 plus the site page own it; revisit only if the site page does not land.                                   |
| App 21 has no test lane             | Adding vitest is part of this work; the parity test is the guide's proof, so it should live with the demo.                  |

---

## 9. Task breakdown

### Phase 1 — MCP transport passthrough

1. Add `uiResources` to `McpHTTPEndpointOptions`.
2. Extend `packages/ndigo-mcp/test/http.spec.ts`.
3. `pnpm doc:api` for `@ndigo/mcp`.

**Exit:** the HTTP endpoint serves `ui://orders`; package tests green; API tree
regenerated.

### Phase 2 — Agent lab (Node)

1. Add `src/orders-ui.ts`, wire it into `src/mcp.ts`.
2. Add `src/http-mcp-controller.ts` and mount `/mcp`.
3. Add `src/report-controller.ts` + the `viewResolver` entry.
4. Add `@ndigo/view`, vitest, `test/parity.spec.ts`, `vitest.config.ts`.
5. Update the README.

**Exit:** `pnpm --filter @ndigo/agent-lab test` green; stdio and HTTP list the
same tools; `list_orders` carries `_meta.ui.resourceUri`; `/reports/orders`
negotiates A2UI.

### Phase 3 — UI lab (browser)

1. Add the WebMCP demo element, import it, add the section.
2. Add deps and `test/webmcp-demo.spec.ts`.
3. Update the lab README if it documents the sections.

**Exit:** `pnpm --filter @ndigo/ui-lab test` and `build` green; the element
registers no-op without WebMCP and exposes the expected descriptor.

### Phase 4 — Guide 48

1. Write the guide against the now-runnable demos.
2. Link it from `docs/guides/README.md`.

**Exit:** `pnpm guides:check` and `pnpm docs:links` green; the guide is under
300 lines.

### Phase 5 — Guide 47 and pointer edits

1. Add the three sections to 47 and retitle.
2. Replace 37's runtime prose with pointers; link 09 to 48.
3. Update `coverage.md`, the README summary, and AD-96's evidence line.

**Exit:** no duplicate runtime explanations between 37 and 48; coverage rows
name 48 where the package's primary home moved.

### Phase 6 — Generated output and validation

1. `pnpm agent-content:build`, commit both docs-index copies.
2. `pnpm agent-content:check`, `pnpm lint`, `pnpm build`, `pnpm test`.
3. Open the PR with `Closes #358`; squash-merge.
4. After merge: sync `ndigo-site`, then remove the worktree and branch.

---

## 10. Out of scope

- New AI runtime capabilities (structured-output providers, agent memory, etc.).
- A basic A2UI catalog (`Text`, `Row`, `Column`, `List`) in the surface.
- Per-client MCP configuration files; the site page remains canonical.
- A `tools/agent-content` contributor guide; AD-98 and AGENTS.md §7 cover it.
- Rewriting historical plans or ADRs beyond the one evidence line.

---

## 11. See also

- [AD-96](../decisions/2026-11-10_AD96_LLM_AGENT_INTEGRATION.md),
  [AD-98](../decisions/2026-11-10_AD98_AGENT_CONTENT_GENERATION.md),
  [AD-99](../decisions/2026-11-10_AD99_MCP_HOST_EXTRACTION.md),
  [AD-100](../decisions/2026-11-10_AD100_MCP_TOOL_PROJECTION.md),
  [AD-101](../decisions/2026-11-10_AD101_A2UI_ADOPTION.md),
  [AD-102](../decisions/2026-11-10_AD102_TOON_REPRESENTATION.md)
- [Agent and LLM integration plan](2026-11-09_LLM_AGENT_INTEGRATION.md) — P0–P5 delivery record
- Guide 47, Guide 37, Guide 09, Guide 30
- `apps/21-ndigo-agent-lab`, `apps/20-ndigo-ui-lab`
- `packages/ndigo-mcp`, `packages/ndigo-view`, `packages/ndigo-view-webcomponent`
