# Agent-First

The agent-first architecture of Ndigo: the framework assumes two kinds of
agents consume every application — **authoring agents** that build it on
behalf of a user, and **runtime agents** that run inside it — and makes the
same declarations serve both, with deterministic tooling between them. This
page states the approach once; the decision records hold the history and the
guides teach each workflow.

## Design Principles

1. **One declaration, every audience.** `@parameters` + `validatedBy`
   metadata projects to the HTTP route, the OpenAPI operation, and the MCP
   tool descriptor from one source. A second description cannot drift because
   there is no second description — even an unnamed tool's name is derived by
   one shared rule (`defaultToolName` in `@ndigo/dispatcher`) that the
   manifest and `tools/list` both read
   ([AD-70](../decisions/2026-10-06_AD70_EDITOR_TOOLING_INTROSPECTION_FIRST.md),
   [AD-114](../decisions/2026-11-23_AD114_AGENT_CAPABILITIES.md)).
2. **Two audiences, one substrate.** Authoring agents need `AGENTS.md`,
   workflow skills, and a CLI drivable without parsing prose; runtime agents
   need the application's own tools, UI representation, and a model loop that
   respects framework telemetry and limits. Both consume **derived** surfaces;
   neither is handed a hand-maintained copy
   ([AD-96](../decisions/2026-11-10_AD96_LLM_AGENT_INTEGRATION.md)).
3. **Agents run verbs, not prose.** The CLI is the deterministic front: every
   workflow is a verb with typed flags and one machine-readable document
   (`ndigo commands --json` lists the whole surface). Skills route to verbs
   and carry traps; facts that change faster than prose come from machine
   output, never from the skill text
   ([AD-75](../decisions/2026-10-07_AD75_FRAMEWORK_CLI.md),
   [AD-96](../decisions/2026-11-10_AD96_LLM_AGENT_INTEGRATION.md)).
4. **A capability is the installable unit.** Between a package and a workflow
   sits a declared unit of application behaviour: packages, wiring operations
   (`addDependency`/`writeFile`/`editJson`), templates with declared
   variables, and checks — executed by the CLI, planned before it is applied,
   and never half-applied
   ([AD-114](../decisions/2026-11-23_AD114_AGENT_CAPABILITIES.md)).
5. **Verification is executable, not aspirational.** `ndigo verify` runs the
   declared checks against the live application — doctor, boot + manifest,
   a real JSON-RPC handshake with the stdio MCP server, and manifest ↔
   `tools/list` ↔ OpenAPI parity — and every selected check gets a row. The
   contract the catalog declares is the contract the runner executes
   ([Guide 51](../guides/51-capabilities-for-authoring-agents.md)).
6. **Agent content is derived and version-matched.** `tools/agent-content`
   derives the per-package `docs/llms.txt` indexes, the vendored skill
   snapshot, and the CLI's shipped agent assets from committed inputs.
   Hand-written skill content stays router-shaped and short; generated
   artifacts are never edited by hand
   ([AD-107](../decisions/2026-11-18_AD107_SKILLS_AUTHORING.md)).

## How the Pieces Compose

| Layer                | Role                                                                     | Owned by                                         |
| :------------------- | :----------------------------------------------------------------------- | :----------------------------------------------- |
| Declaration metadata | `@toolMapping`, `@parameters`, `validatedBy`, `@whenFeature` on handlers | `@ndigo/dispatcher`, `@ndigo/boot`               |
| Projection           | The same metadata read out as routes, OpenAPI, MCP tools, UI components  | `@ndigo/inspect`, `@ndigo/openapi`, `@ndigo/mcp` |
| Deterministic front  | Typed verbs with JSON documents (`add`, `inspect`, `openapi`, `verify`)  | `@ndigo/cli`                                     |
| Capability catalog   | Declared installable units + the check vocabulary, shipped as data       | `@ndigo/cli` assets                              |
| Workflow skills      | Routers over the verbs; traps and example prompts                        | `ndigo-skills` (vendored)                        |
| Verification         | Declared checks executed against the live application                    | `@ndigo/cli` (`ndigo verify`)                    |

## Working Agent-First Day to Day

An authoring agent adds an agent surface to an application without reading a
single prose guide:

```
ndigo capabilities --json              # discover: what can this app gain?
ndigo add agent-surface                # plan: what would change? (nothing written)
ndigo add agent-surface --apply        # install: deps, entry template, manifest script
ndigo verify --capability agent-surface --json
                                       # prove: boot, MCP handshake, three-way parity
ndigo verify --full                    # the app's own typecheck/test/lint, same report
```

The runtime half needs no extra declaration: the handlers the authoring agent
wired are already the tools a runtime agent calls, and the model loop comes
from `@ndigo/ai` ([Guide 47](../guides/47-ai-agents.md)) with the transport
from `@ndigo/mcp` ([Guide 48](../guides/48-agent-facing-surfaces.md)).

## Resolved Tensions

| Tension                                                            | Resolution                                                                                    |
| :----------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| "AI documentation" rots per harness and per client                 | Derived, version-matched content from one committed store (AD-107)                            |
| A second tool description drifts from the HTTP route               | One metadata projection; the name rule is shared, the parity check catches the rest           |
| Install-time success treated as "it works"                         | `ndigo verify` executes the declared contract against the live application                    |
| Wiring knowledge split across generators, guides, and skills       | The capability is the declared unit; the CLI executes it, skills only coordinate it (AD-114)  |
| Satellites for agent packages would break the projection invariant | Rejected (AD-114): the runtime layer stays in one tree so one declaration projects everywhere |

## Status and Limits

The capability layer is complete: the catalog, `ndigo add` (plan/apply),
the coordination skills, and runtime verification have landed. What remains:

- **The 1.0 publish gate.** Until packages are published, consumer installs
  resolve workspace packages with `link:` — plan/dry-run is exercisable,
  `--apply` is not ([issue #10](https://github.com/ndigo/ndigo/issues/10)).
- **Capability coverage.** Agent surface and model ship today; further
  capabilities back-port wiring that already exists as generators.
- **Check depth.** Boot, handshake, and parity today; tool-call round-trips
  and response-shape assertions are the natural next tier of the vocabulary.

## Related Records and Guides

[AD-96 — agent and LLM integration](../decisions/2026-11-10_AD96_LLM_AGENT_INTEGRATION.md) ·
[AD-114 — agent capabilities](../decisions/2026-11-23_AD114_AGENT_CAPABILITIES.md) ·
[AD-70 — introspection first](../decisions/2026-10-06_AD70_EDITOR_TOOLING_INTROSPECTION_FIRST.md) ·
[AD-75 — the framework CLI](../decisions/2026-10-07_AD75_FRAMEWORK_CLI.md) ·
[AD-107 — skills authoring](../decisions/2026-11-18_AD107_SKILLS_AUTHORING.md) ·
[Guide 37 — the CLI](../guides/37-ndigo-cli.md) ·
[Guide 47 — AI agents](../guides/47-ai-agents.md) ·
[Guide 48 — agent-facing surfaces](../guides/48-agent-facing-surfaces.md) ·
[Guide 51 — capabilities](../guides/51-capabilities-for-authoring-agents.md) ·
[Guide 52 — the operate contract](../guides/52-agent-operate-contract.md)
