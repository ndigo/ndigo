# Agent and LLM integration — implementation plan

**Status:** Accepted — P0–P5 shipped 2026-11-10
**Decision:** [AD-96](../decisions/2026-11-10_AD96_LLM_AGENT_INTEGRATION.md) (umbrella), with [AD-97](../decisions/archive/2026-11-10_AD97_CLI_JSON_CONTRACT.md), [AD-98](../decisions/archive/2026-11-10_AD98_AGENT_CONTENT_GENERATION.md), [AD-99](../decisions/archive/2026-11-10_AD99_MCP_HOST_EXTRACTION.md), [AD-100](../decisions/archive/2026-11-10_AD100_MCP_TOOL_PROJECTION.md), and [AD-101](../decisions/archive/2026-11-10_AD101_A2UI_ADOPTION.md)
**Scope:** `@ndigo/cli`, `create-ndigo-app`, `tools/agent-content` (new),
`@ndigo/mcp` (new), `@ndigo/ai` (new), `@ndigo/core`, `@ndigo/view`,
`@ndigo/view-webcomponent`, `@ndigo/ui` registry, `docs/guides`, `ndigo-site`

---

## 0. Why now

Every framework in the JS and full-stack space has shipped an agent story in
the last twelve months, and the stories have converged on five capability
families. Two are relevant to Ndigo today; three become relevant once the
framework exposes a runtime surface.

| Family                    | Who ships it                                   | Representative artifact                                                      |
| :------------------------ | :--------------------------------------------- | :--------------------------------------------------------------------------- |
| Dev-time context          | Angular, Svelte, Next.js, Laravel              | `SKILL.md` sets, managed `AGENTS.md`, version-matched docs in `node_modules` |
| Project introspection MCP | Angular CLI, Laravel Boost                     | `list_projects`, `get_best_practices`, DB schema/query, `record_rule`        |
| Runtime/dev-server MCP    | Next.js, .NET Aspire                           | `/_next/mcp`: `get_errors`, `get_routes`, `compile_route`, OTel traces       |
| Self-correction tools     | Svelte, Angular                                | `svelte-autofixer`, `onpush_zoneless_migration`                              |
| App-facing agent surface  | Laravel MCP, FastAPI-MCP, Nuxt, Angular WebMCP | tools/resources/prompts + OAuth 2.1; `provideExperimentalWebMcpTools`        |

Two pieces of published evidence shape the design:

1. **Passive context beats on-demand retrieval.** Vercel's Next.js evals: 53%
   baseline, 53% with a skill that was never invoked, 79% with a skill plus
   explicit instructions, **100%** with a compressed docs index embedded in
   `AGENTS.md`. The skill went uninvoked in 56% of cases.
2. **Tool surfaces are attack surfaces.** Laravel shipped an SSRF bug and an
   OAuth redirect flaw in its AI SDK/MCP packages shortly after launch.

### Two audiences, deliberately separated

- **Developer agents** write Ndigo applications. Addressed by P0–P2.
- **Product agents** use Ndigo applications. Addressed by P3–P5.

Conflating them is the most common mistake in this space: Angular ships one
MCP server that does both and it is correspondingly hard to reason about
permissions for.

---

## 1. What already exists

Three assets change the shape of this plan, and one of them is the single most
important input:

| Asset                         | State                                                                                                                                                                     | Consequence                                                                                        |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------- |
| `ndigo ui mcp`                | **Shipped.** Stdio MCP, 5 tools (`list_items`, `search_items`, `get_item`, `install_items`, `validate_registry`), `--readOnly` omits the mutating tool, JSON-text results | The MCP host exists. `ndigo mcp` is a second route map over an extracted host, not a new subsystem |
| `ui view --json`              | Shipped                                                                                                                                                                   | A `--json` convention exists to standardise and extend, rather than invent                         |
| `agent-local/skills/ndigo-ui` | Shipped `SKILL.md`, synced to `.opencode/` and `.omp/` by `pnpm agents:sync`, CI-checked                                                                                  | The skills pipeline exists; only the _content_ is new                                              |
| `@ndigo/ui` registry          | 41 items, shadcn-compatible, `ndigo.ui.json` + `ui.lock.json` with per-file SHA-256                                                                                       | A per-application **component allowlist already exists** — which is exactly A2UI's security model  |
| `@ndigo/inspect`              | Manifest v1: `app`, `routes`, `mappings`, `config`; secrets never read                                                                                                    | The introspection substrate for `ndigo mcp` is done                                                |
| `@ndigo/openapi`              | Spec generated from the same metadata that serves requests, including `validatedBy` Zod                                                                                   | Tool schemas can be derived, not authored — the parity guarantee                                   |
| `@ndigo/core` media types     | `APPLICATION_JSON`, `TEXT_TOON` (`packages/ndigo-core/src/media-types.ts`)                                                                                                | `application/a2ui+json` is one more registered token                                               |

The repo also carries the constraint that keeps this honest: **AD-75 D-3** — the
CLI is a thin front; implementations live in their packages. **AD-70** — `ndigo
inspect` fronts the _application's_ `scripts.inspect`. Both apply verbatim to the
agent surface.

---

## 2. Principles

- **D-1 — Skills are routers over verbs, not documentation.** A skill says "for
  X run `ndigo generate controller`, then `ndigo lint`, then `ndigo test`," plus
  the traps. Facts (flags, item lists, route tables) come from machine output,
  because they change faster than the skill. The shipped `ndigo-ui` skill
  already states this: _"use the tooling rather than a copied list; the set
  grows."_
- **D-2 — One authored source per artifact; satellites are generated.**
  `ndigo-site` already syncs docs from the monorepo. Agent content follows the
  same rule; a published skills repo, if any, is a generated mirror.
- **D-3 — The agent surface derives from serving metadata.** Same argument
  `@ndigo/openapi` makes: routes, parameters, and Zod schemas already exist for
  request dispatch. Tool schemas are projections of that metadata, never a
  second description.
- **D-4 — Passive context first, skills second.** Ship an `AGENTS.md` block and
  a retrievable docs index; reserve skills for workflows (upgrade, adoption,
  verification).
- **D-5 — Read-only by default.** Mutating tools are opt-in, mirroring
  `--readOnly` on `ndigo ui mcp`. `install_items` plans unless `dryRun: false`;
  every new server repeats that pattern.
- **D-6 — Consumer content ships with the CLI.** Skills, docs index, and
  instruction blocks are version-matched to the installed framework, not to the
  website's latest.
- **D-7 — No harness matrix.** Emit the paths harnesses already share:
  `AGENTS.md` at the repository root and `.agents/skills/<id>/SKILL.md`.
  `.mcp.json` is written only under `--mcp`, and only in its Claude Code /
  Copilot CLI shape; every other client is a documented snippet on the site.
  Per-harness installation is delegated to `npx skills add` against the
  generated mirror, never implemented in the CLI. `graft` already deploys
  agent wiring across claude/codex/copilot/antigravity/hermes — do not
  duplicate that.
- **D-8 — Representations are negotiated, not special-cased.** A2UI, MCP App
  resources, and TOON are all view representations selected by content
  negotiation, like `ServerSentEventView`.

---

## 3. Placement

| Artifact                                    | Home                                          | Reason                                                                                  |
| :------------------------------------------ | :-------------------------------------------- | :-------------------------------------------------------------------------------------- |
| `--json` sweep, `ndigo commands`            | `packages/ndigo-cli`                          | CLI internals                                                                           |
| Agent content source                        | `tools/agent-content/` (new)                  | Consumed by two packages (CLI assets, CNA templates) — same shape as `tools/generators` |
| `ndigo ai:*`                                | `packages/ndigo-cli/src/commands/ai/`         | Route map, like `db` and `ui`                                                           |
| CNA `--agents`                              | `packages/create-ndigo-app`                   | Templates version with the scaffold                                                     |
| `ndigo mcp`                                 | `packages/ndigo-cli/src/commands/mcp.ts`      | Thin front over the extracted host                                                      |
| `@ndigo/mcp`                                | new package                                   | Dependency inversion: needs dispatcher metadata, `@ndigo/inspect`, `@ndigo/auth-*`      |
| A2UI media type                             | `@ndigo/core` + a view in `@ndigo/view`       | AD-66 precedent                                                                         |
| `<nd-a2ui-surface>`                         | `packages/ndigo-ui/registry/ui/a2ui-surface/` | Copy-in item; third-party imports inside registry items are the norm (`@zag-js/*`)      |
| `@ndigo/ai`                                 | new package                                   | Wraps the AI SDK through an integration layer, like `@ndigo/dom` wraps linkedom         |
| Catalogue pages, `llms.txt`, `/r/` payloads | `ndigo-site`                                  | Published views                                                                         |
| Agent setup page, skills mirror             | `ndigo-site`, generated `ndigo/skills`        | Per-client snippets and a generated publication; no authored client files               |

No new development repository. Everything here is version-locked to framework
internals or to registry shape; the `ndigo/skills` mirror is a generated
publication, not a source.

---

## 4. Phases

**Sequencing (decided 2026-11-09).** **P2 is the first issue addressed**, ahead
of P0. It is a refactor of working code with a built-in acceptance test — the
existing `ndigo ui mcp` suite — so it turns a proven implementation into a
reusable host at low risk, and it puts an agent-visible capability in the tree
sooner than a plumbing phase would. P0 still precedes P1 and P3, both of which
consume its `--json` contract; `ndigo mcp` ships without the `get_commands` tool
until P0 lands.

### P0 — Machine-readable CLI surface

**Premise.** Every later phase consumes this. Today `inspect` prints the
manifest and `ui view --json` prints JSON, but most verbs print prose.

**Deliverables**

- A single `--json` contract: exactly one JSON document on stdout, diagnostics
  on stderr, exit codes unchanged, human output untouched when the flag is
  absent. Documented in `docs/guides/37-ndigo-cli.md`.
- `--json` added to `doctor`, `info`, `logs`, `config list`, `env`, `openapi`,
  `db status`, `lint`, `typecheck`, `routes`.
- `ndigo commands --json` — verb, positional parameters, flags, brief, exit
  codes. Implemented as a `COMMAND_INDEX` beside `rootRouteMap` in
  `packages/ndigo-cli/src/index.ts` (every command is already imported there),
  with a unit test asserting parity against the route map keys so it cannot
  drift. If `@stricli/core` exposes route enumeration, walk it instead. Also
  surfaces the index as the `get_commands` tool on `ndigo mcp` — a follow-up
  edit, since the server ships first.
- No `--json` on script fronts (`serve`, `build`, `test`, `inspect`, later
  `mcp`): their contract is exit codes, and `inspect` passes through the app's
  own manifest. Wrapping those creates a second source of truth.

**Exit criteria.** `ndigo commands --json | jq -e '.commands | length > 0'`
passes; every swept command emits valid JSON; default output byte-identical;
`pnpm typecheck && pnpm test` green.

**Single-lane files.** `packages/ndigo-cli/api/` (regenerated by `pnpm doc:api`).

---

### P1 — Agent context, skills, and CNA

**Deliverables**

- `tools/agent-content/` — the single authored source:

    ```
    tools/agent-content/
      instructions/ndigo.md          # the managed AGENTS.md block body
      skills/<id>/SKILL.md           # nine skills, see below; emitted to .agents/skills/
      docs-index.md                  # compressed index over docs/guides + packages
      build.mjs                      # emits CLI assets + CNA templates
      .agent-content.json            # sha256 manifest, CI-gated
    ```

    `pnpm agent-content:build` emits `packages/ndigo-cli/assets/agent/` and
    `packages/create-ndigo-app/templates/<kind>/AGENTS.md.template`.
    `pnpm agent-content:check` fails on drift. This deliberately reuses the
    `agents:sync` / `agents:check` mechanism but keeps its own store: the existing
    store serves agents working _on_ Ndigo, this one serves agents working _with_
    it. Do not merge the two.

    The emitted skill target is `<app>/.agents/skills/<id>/SKILL.md` — the shared
    location read by Codex, Cursor, Copilot, Gemini CLI, OpenCode, Antigravity,
    Junie, and OpenClaw. Claude Code reads `.claude/skills/` only; the site
    documents a per-skill symlink rather than the CLI writing a second copy.
    Root `skills/` is not used — it is OpenClaw's workspace convention, not a
    shared one. One constant in `build.mjs` names the target, so a future
    convention change stays a one-line edit.

- Nine skills, one per verb cluster: `ndigo-app`, `ndigo-endpoint`,
  `ndigo-persistence`, `ndigo-views`, `ndigo-ui`, `ndigo-reactive`,
  `ndigo-verify`, `ndigo-debug`, `ndigo-upgrade`. Each is short (≤120 lines):
  decision table, the verbs, the three traps. No flag lists.
  The consumer `ndigo-ui` skill is **not** a copy of the internal one — the
  internal version cites `packages/ndigo-ui/registry/` and
  `apps/20-ndigo-ui-lab`, which mean nothing in an application.

- `ndigo ai:init | ai:check | ai:update` as a route map
  (`packages/ndigo-cli/src/commands/ai/`):

    | Command         | Behaviour                                                                                                                                                                                                                                                |
    | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `ai:init [dir]` | Writes the managed block into `AGENTS.md` between `<!-- BEGIN:ndigo-agent-rules -->` / `<!-- END:ndigo-agent-rules -->`, preserving everything outside; writes `.agents/skills/`; writes `.mcp.json` (Claude Code / Copilot CLI shape) only with `--mcp` |
    | `ai:check`      | Regenerates in memory, diffs, exits 1 when stale                                                                                                                                                                                                         |
    | `ai:update`     | Same as init, intended for post-`ndigo update`                                                                                                                                                                                                           |

    Flags: `--dry-run`, `--force`, `--skills`, `--mcp`, `--instruction-file
  <path>` (default `AGENTS.md`), `--dir <path>`. No `--agent claude|copilot|…`
    matrix (D-7).

    `--mcp` is the only client-specific flag. `.mcp.json` is read by Claude Code
    and Copilot CLI; VS Code (`.vscode/mcp.json`), Cursor (`.cursor/mcp.json`),
    Gemini (`.gemini/settings.json`), and OpenCode (`opencode.json`) each get a
    snippet in the site table, not a generated file.

- `create-ndigo-app`: `ScaffoldOptions.agents: boolean`; `--agents` /
  `--no-agents`; interactive prompt defaulting to Yes; `--yes` implies on;
  template writes a **bootstrap pointer only** ("this is a Ndigo app; run
  `ndigo ai:init` for full context" plus four rules). Version-bearing content is
  written by the CLI, never by the scaffold. `printNextSteps` mentions
  `ndigo ai:init` when skipped.

    The design-system counterpart is **#325** (`--ui`): both flags touch
    `ScaffoldOptions` and `printNextSteps`. **Delivered:** `--ui` writes the
    `ndigo.ui.json` pointer, the token import, and the `@ndigo/ui` dependency;
    its design-system paragraph is appended at scaffold time, so the managed
    `tools/agent-content/` block and its emitted template stay untouched.

- `ndigo-site`: one "using Ndigo with your agent" page — canonically
  `AGENTS.md` + `.agents/skills/`, the Claude Code per-skill symlink snippet,
  and one MCP config snippet per client (Claude Code / Copilot CLI, VS Code,
  Cursor, Gemini, OpenCode). This page is the only per-client documentation
  surface; applications receive no generated client files.

**Exit criteria.** Fresh scaffold with `--yes` contains a valid `AGENTS.md`
and no stale claims; `ndigo ai:init` on an existing app is idempotent
(two runs, no diff); the tree it creates is exactly `AGENTS.md`,
`.agents/skills/*/SKILL.md`, and (with `--mcp`) `.mcp.json` — no writes to
`.claude/`, `.github/`, `.cursor/`, or `.opencode/`; `ai:check` fails after a
manual edit to generated content; CNA tests cover both flag values;
`pnpm agent-content:check` in CI.

**Single-lane files.** `packages/create-ndigo-app/api/`, `packages/ndigo-cli/api/`.

---

### P2 — Extract the MCP host and ship `ndigo mcp`

**Premise.** `ui/mcp.ts` already contains a working server. Extract before
adding a second domain.

**Deliverables**

- `packages/ndigo-cli/src/helpers/mcp-host.ts` — server construction, stdio
  transport, `--readOnly` gating, JSON-text result helper, tool registration
  and error mapping. `ui/mcp.ts` is refactored onto it with **no behaviour
  change**; its tests are the safety net.
- `ndigo mcp [dir] [--readOnly] [--live]`:

    | Tool                 | Source                                                                 | Read-only                      |
    | :------------------- | :--------------------------------------------------------------------- | :----------------------------- |
    | `get_manifest`       | app `scripts.inspect` (AD-70), or `@ndigo/inspect`                     | yes                            |
    | `get_routes`         | manifest `routes`                                                      | yes                            |
    | `get_config_keys`    | manifest `config` (presence only, never values)                        | yes                            |
    | `get_commands`       | `COMMAND_INDEX` from P0 (absent until then)                            | yes                            |
    | `get_best_practices` | rendered `STYLE_GUIDE.md` + `ARCHITECTURE.md` sections, version-pinned | yes                            |
    | `run_doctor`         | `ndigo doctor`                                                         | yes                            |
    | `get_logs`           | `ndigo logs`                                                           | yes                            |
    | `run_target`         | `ndigo build/test/lint`                                                | **omitted under `--readOnly`** |
    | `record_rule`        | writes `.ndigo/rules/*.md` + index                                     | **omitted under `--readOnly`** |

- Two profiles: **static** (manifest, doctor, logs — no application boot) works
  out of the box; **live** (`--live`) delegates to the application's
  `scripts.mcp`, following AD-70 exactly. Absent the script, `--live` exits with
  the same actionable message `inspect` gives today.

**Exit criteria.** `ndigo ui mcp` behaviour and tests unchanged after
extraction; `ndigo mcp` answers `get_manifest` against `apps/05-ndigo-api`;
`--readOnly` tool list is verified by a test that asserts `run_target` is
absent.

**Single-lane files.** `packages/ndigo-cli/api/`.

---

### P3 — `@ndigo/mcp`: application tools from dispatch metadata

**Premise.** This is the phase that fills a hole no JS framework except
Nuxt/Hono has filled, and it is cheap _because_ of `@ndigo/openapi`.

**Deliverables**

- Decorators (camelCase, `*Mapping` family, consistent with `@requestMapping` /
  `@getMapping`):

    ```ts
    @requestMapping('/api/orders')
    class OrderController {
        @getMapping('/:id')
        @parameters({ id: pathVariable('id') })
        @validatedBy(OrderIdSchema)
        @toolMapping({ name: 'get_order', readOnly: true })
        getOrder({ id }: { id: string }) {
            /* … */
        }
    }
    ```

    `inputSchema` is projected from the same `@parameters` + `validatedBy`
    metadata that binds the HTTP request. No second description.

- `@ndigo/mcp` package: tool registry assembled from dispatcher route tables,
  `tools/list`, `tools/call`, `resources/list` (from `@ndigo/inspect`),
  `prompts/list`. Two transports: stdio (local) and Streamable HTTP mounted on
  a dispatcher route, negotiated as `application/json` or `text/event-stream`
  through the existing SSE view.
- Auth and policy, all reused rather than invented:
    - `@ndigo/auth-*` → OAuth 2.1 protected-resource metadata, bearer validation,
      `WWW-Authenticate`, scopes from route metadata.
    - `@ndigo/rate-limit` → per-tool and per-principal budgets.
    - `@ndigo/resilience` → breaker around downstream calls made by tools.
    - `@ndigo/flags` → `@whenFeature` gates a tool out of `tools/list` entirely.
    - `@ndigo/log` + `@ndigo/telemetry` → audit record and one span per tool call
      (`gen_ai.tool.name`, `gen_ai.tool.call.id`).
- `ndigo add @ndigo/mcp` → setup generator `@ndigo/generators:mcp-setup`
  (reached through the existing `add.ts` hook) writes `scripts.mcp`, a config
  block, and one sample tool.

**Parity test (the important one).** Every operation carrying `@toolMapping`
appears in both the generated OpenAPI document and `tools/list` with identical
JSON Schema. This is the mechanical proof that D-3 holds.

**Exit criteria.** An app exposes three tools over stdio and over HTTP; a tool
call appears as one span with child HTTP spans; `--readOnly`-equivalent config
omits mutating tools from `tools/list` (not merely from `tools/call`); the
parity test is green.

**Single-lane files.** `pnpm-lock.yaml`, `packages/ndigo-mcp/api/`, `API.md`.

---

### P4 — Agent UI: A2UI, MCP Apps, WebMCP

**Premise.** A2UI's security model is a client-side catalog allowlist. Ndigo UI
already materialises one per application (`ndigo.ui.json` + `ui.lock.json`
SHA-256 per file), so Ndigo can state what no other framework can: _the agent's
component vocabulary is exactly what this application installed, with hashes._

Order matters — each step is independently valuable.

**(a) Catalog exposure — no A2UI dependency, ship first**

- `ndigo ui catalog [--json]`: emit A2UI-shaped component descriptors derived
  from `packages/ndigo-ui/registry.json` and the items actually installed.
- `get_catalog` tool on `ui mcp` (sixth tool; read-only).
- Grounds generation rather than hoping for it. Analogous to
  `get_best_practices` / `get_manifest`.

**(b) `application/a2ui+json` as a representation**

- `MediaTypes.APPLICATION_A2UI_JSON` in `@ndigo/core`, next to `TEXT_TOON`.
- An A2UI view alongside `ServerSentEventView`; a handler returns A2UI, content
  negotiation selects it, `@ndigo/mcp` carries it in tool results.
- Reversible in one diff if the format stalls.

**(c) `<nd-a2ui-surface>` registry item**

- `packages/ndigo-ui/registry/ui/a2ui-surface/` — behaviour tier, depends on
  `lib`, wraps `@a2ui/web_core` (`MessageProcessor`, `SurfaceModel`,
  `DataModel`). Do not reimplement the ~3k lines of protocol handling.
- The component mapping table is generated from `registry.json` at item build
  time, so the surface can only render what the app installed.
- Gate on a stable `web_core` entry point (`v1_0`); A2UI v1.0 is published as
  current while v0.9.1 is still documented as stable — confirm freeze status
  before starting, and keep the mapping table isolated so a revision bump is a
  data change.

**(d) MCP Apps resources**

- `_meta.ui.resourceUri` support in `@ndigo/mcp`; a `ui://` resource view that
  renders an installed registry item to a single self-contained HTML document
  (inlining at build time, the `vite-plugin-singlefile` pattern).
- Constraint from the MCP Apps spec: sandboxed iframe, explicit target origin,
  no `*` in `postMessage`.

**(e) WebMCP**

- `provideWebMcpTools()` and `declareWebMcpTool()` in
  `@ndigo/view-webcomponent`, resolving dependencies from the injection context
  and unregistering on element disconnect. Schema from the same `validatedBy`
  metadata as P3.
- Ndigo's advantage over Angular here is narrow but real: the DI container is
  isomorphic, so one controller method is a REST route, an MCP tool, and a
  browser tool.

**Exit criteria.** (a) `get_catalog` returns one descriptor per installed item.
(b) A route negotiates `application/a2ui+json` and a MCP tool result carries it.
(c) The lab renders a server-generated A2UI payload using installed items only,
with an unknown component rejected. (d) One item renders in a MCP Apps host.
(e) A WebMCP tool appears in a browser agent and disappears on disconnect.

**Single-lane files.** `pnpm-lock.yaml`, `packages/ndigo-ui/api/`,
`packages/ndigo-ui/registry.json` (shared with any in-flight UI work — sequence
this phase after UI intake settles).

---

### P5 — `@ndigo/ai`

**Premise.** Only worth doing if it is Ndigo-shaped. Competing with the AI SDK
on ergonomics is a losing fight; competing on instrumentation, resilience, and
schema fidelity is not.

**Deliverables**

- `@ndigo/ai`: contracts for model providers, chat/streaming, structured output,
  and a tool loop that consumes `@ndigo/mcp` tools.
- `@ndigo/ai-sdk`: integration-layer adapter wrapping the AI SDK, following the
  `@ndigo/dom` precedent — no package imports the AI SDK directly.
- Streaming on the existing SSE write path and `parseServerSentEvents` read path.
- `generateObject` against Zod schemas; tool calls reuse the P3 registry.
- Telemetry: GenAI semantic-convention spans through `@ndigo/telemetry`.
- Resilience and limits: breaker, retry, per-model rate limits, `@ndigo/flags`
  for model rollout.
- Secret handling: provider keys through the existing `{cipher:…}` configuration
  path; never in a client-bound file.

**Exit criteria.** An app runs a tool-calling loop against a local model with a
single trace covering prompt, tool calls, and completion; the same tools are
simultaneously exposed over MCP; a provider outage degrades through the
existing breaker rather than throwing.

**Single-lane files.** `pnpm-lock.yaml`, `packages/ndigo-ai/api/`, `API.md`.

---

## 5. Command surfaces

```
ndigo commands [--json]

ndigo ai:init   [dir] [--dry-run] [--force] [--skills] [--mcp] [--instruction-file <f>]
ndigo ai:check  [dir]
ndigo ai:update [dir]

ndigo mcp       [dir] [--readOnly] [--live]

ndigo ui catalog [--json]
ndigo ui mcp     [--dir <app>] [--registry <source>] [--readOnly]   # + get_catalog
```

`--json` contract, restated once: one JSON document on stdout, diagnostics on
stderr, exit codes unchanged, human output untouched when absent.

---

## 6. Testing

| Layer         | Coverage                                                                                                                                                                                                               |
| :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CLI JSON      | Snapshot each `--json` payload shape; assert `commands` parity against route map keys                                                                                                                                  |
| Agent content | `agent-content:check` drift gate; `ai:init` idempotency (two runs → no diff); marker-block preservation around hand-written content; emitted tree is exactly `AGENTS.md` + `.agents/skills/`; mirror matches the store |
| MCP host      | Reuse `ui mcp` tests post-extraction; `--readOnly` tool-list assertions                                                                                                                                                |
| `@ndigo/mcp`  | OpenAPI ↔ `tools/list` schema parity; bearer and scope rejection; feature-gated tools absent from the list                                                                                                             |
| A2UI          | Catalog completeness against `registry.json`; unknown-component rejection; surface rendering in the lab                                                                                                                |
| CNA           | Both `--agents` values; `--force` over an existing `AGENTS.md` must not clobber outside the markers                                                                                                                    |

The repo's existing gates apply unchanged: `pnpm lint`, `pnpm typecheck`,
`pnpm build`, `pnpm test`, `pnpm manifest:check`, `pnpm docs:links`,
`pnpm guides:check`, `pnpm doc:check`.

---

## 7. Risks

| Risk                                        | Mitigation                                                                                                                                                                                                  |
| :------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MCP tool surface becomes an attack surface  | Read-only default (D-5); auth on every remote transport; audit log; approval path for destructive tools; `--readOnly` omits from `tools/list`, not just `tools/call`                                        |
| Skills go uninvoked (56% in Vercel's evals) | Passive `AGENTS.md` block and docs index carry the facts; skills only carry workflows (D-4)                                                                                                                 |
| Generated content rots                      | `agent-content:check` in CI; content generated, never hand-edited; docs renumbered twice already (12 → 90)                                                                                                  |
| Harness skill and MCP paths churn           | One target constant in `build.mjs`; canonical paths only (`.agents/skills/`); per-client installs delegated to `npx skills add`; no copies written into `.claude/`, `.github/`, `.opencode/`, or `.cursor/` |
| Two agent-content stores drift              | Internal (`development-agents/`, `agent-local/`) and consumer (`tools/agent-content/`) are separate by design; neither imports the other                                                                    |
| A2UI revision churn                         | Bind through `web_core`; mapping table is data; (a) and (b) carry no A2UI dependency at all                                                                                                                 |
| Registry churn destabilises P4              | Sequence P4 after UI intake settles; `registry.json` is single-lane                                                                                                                                         |
| `ndigo mcp` duplicates `ui mcp`             | Host extracted first (P2), one implementation, two route maps                                                                                                                                               |
| Scope creep into an AI SDK competitor       | P5 is last and requires a demonstrated consumer                                                                                                                                                             |

---

## 8. Open questions

1. **`--json` envelope.** Flat command-specific objects (proposed), or a shared
   `{ schemaVersion, data, diagnostics }` wrapper? Flat is simpler; a wrapper
   makes long-lived contracts (`commands`, `inspect`) versionable.
2. **`get_best_practices` scope.** Render from `STYLE_GUIDE.md` +
   `ARCHITECTURE.md`, or a purpose-written agent-facing summary? The former
   cannot drift; the latter is shorter.
3. **CNA and the design system.** Filed as **#325** — `--ui` writes a pointer
   (`ndigo.ui.json` + token import + next-steps line), never registry content;
   default off; browser kind only. The open part is a later `--ui starter` that
   installs items when a `ndigo` binary is available.
4. **A2UI renderer tier.** A behaviour element (`registry/ui/a2ui-surface`) is
   proposed; blocks are defined as page-level compositions, so a new
   `registry:integration` type may be cleaner if more arrive.
5. **`ndigo mcp --live` transport.** Keep stdio-only for local agents, or also
   support SSE for remote ones before P3 exists?
6. **Public skills repository — resolved: generated mirror, no CLI installer.**
   `ndigo ai:init` stays the version-matched path (D-6). A generated
   `ndigo/skills` mirror is published from `tools/agent-content/` for
   `npx skills add ndigo/skills`, which owns the per-harness install matrix and
   its churn. The mirror is never hand-edited and is gated by
   `agent-content:check` in CI.

---

## 9. Decisions to record

| ADR                                                                       | Subject                                              | Phase     |
| :------------------------------------------------------------------------ | :--------------------------------------------------- | :-------- |
| [AD-96](../decisions/2026-11-10_AD96_LLM_AGENT_INTEGRATION.md)            | Agent integration umbrella: two audiences, D-1…D-8   | before P0 |
| [AD-97](../decisions/archive/2026-11-10_AD97_CLI_JSON_CONTRACT.md)        | `--json` output contract for the CLI                 | P0        |
| [AD-98](../decisions/archive/2026-11-10_AD98_AGENT_CONTENT_GENERATION.md) | Agent content generation and the two-store split     | P1        |
| [AD-99](../decisions/archive/2026-11-10_AD99_MCP_HOST_EXTRACTION.md)      | MCP host extraction and `ndigo mcp` profiles         | P2        |
| [AD-100](../decisions/archive/2026-11-10_AD100_MCP_TOOL_PROJECTION.md)    | `@ndigo/mcp` decorator surface and schema projection | P3        |
| [AD-101](../decisions/archive/2026-11-10_AD101_A2UI_ADOPTION.md)          | A2UI adoption: catalog, media type, renderer         | P4        |

---

## 10. Issue and worktree breakdown

One issue per phase; P4 splits into five. Names follow
`<repo>-<issue>-<slug>`, branches `type/N-slug`, one worktree each.

| Issue | Title                                                                     | Depends on                          |
| :---- | :------------------------------------------------------------------------ | :---------------------------------- |
| 1     | `feat(cli): --json contract and ndigo commands`                           | —                                   |
| 2     | `feat(cli): agent content generation and ndigo ai:*`                      | 1                                   |
| 3     | `feat(create-ndigo-app): --agents scaffold option`                        | 2                                   |
| 4     | `refactor(cli): extract MCP host; add ndigo mcp`                          | — (first; `get_commands` follows 1) |
| 5     | `feat(mcp): @ndigo/mcp tool projection from dispatch metadata`            | 4                                   |
| 6     | `feat(ui): A2UI catalog exposure`                                         | —                                   |
| 7     | `feat(core): application/a2ui+json media type and view`                   | 5, 6                                |
| 8     | `feat(ui): nd-a2ui-surface registry item`                                 | 7                                   |
| 9     | `feat(mcp): MCP Apps ui:// resources`                                     | 5                                   |
| 10    | `feat(view-webcomponent): WebMCP tool declaration`                        | 5                                   |
| 11    | `feat(ai): @ndigo/ai contracts and AI SDK adapter`                        | 5                                   |
| 12    | `feat(scaffold): ndigo-ui in create-ndigo-app (--ui)` — **filed as #325** | —                                   |

Issue 6 is independent of everything and is the cheapest first win if the
sequence needs breaking up.

The P1 site page and the generated `ndigo/skills` mirror ride issue 2: one
authored store, one `agent-content:build` output feeding CLI assets, the CNA
template, and the mirror.

---

## 11. References

- AD-66 — TOON as an opt-in authoring format (media-type precedent)
- AD-70 — application-owned introspection entry (`scripts.inspect`)
- AD-75 D-3 — CLI as a thin front; implementations in packages
- AD-95 — ndigo-ui design system
- `docs/guides/37-ndigo-cli.md`, `docs/guides/30-*` (UI companion),
  `docs/guides/90-package-documentation.md`
- `docs/plans/2026-11-08_NDIGO_UI.md` — phase/exit-criteria format this plan follows
- Agent Skills client locations (checked 2026-10-25): `.agents/skills/` is read
  by Codex, Cursor, Copilot, Gemini CLI, OpenCode, Antigravity, Junie, and
  OpenClaw; Claude Code reads `.claude/skills/` only; `.mcp.json` is read by
  Claude Code and Copilot CLI, not VS Code, Cursor, Gemini, or OpenCode
- Vercel, _AGENTS.md outperforms skills in our agent evals_ (January 2026)
- Angular — Agent Skills, CLI MCP server, WebMCP;
  Next.js — bundled docs, `/_next/mcp`, agent skills;
  Svelte — MCP server and `svelte-autofixer`;
  Laravel — `laravel/mcp` and Boost;
  FastAPI-MCP; Nuxt MCP server and MCP Toolkit; .NET Aspire MCP server
- MCP Apps extension (`modelcontextprotocol/ext-apps`)
- A2UI specification (v1.0 current, v0.9.1 stable; `@a2ui/web_core`)
