---
name: ndigo-agent
description: Exposes an application's handlers as MCP tools and verifies the agent surface. Use when adding MCP, changing tool exposure, or wiring an agent.
package: "@ndigo/mcp"
---

# Agent surface

## Decision table

| Goal                        | Command                                                                         |
| :-------------------------- | :------------------------------------------------------------------------------ |
| What it installs            | `ndigo capabilities get agent-surface --json`                                   |
| Plan the wiring             | `ndigo add agent-surface`                                                       |
| Apply it                    | `ndigo add agent-surface --apply --var <name>=<value>` (repeat per `variables`) |
| Validate the catalog        | `ndigo capabilities check`                                                      |
| CLI introspection over MCP  | `ndigo mcp --readOnly`                                                          |
| The app's own MCP server    | the `mcp` script the capability writes                                          |

## What it owns

The capability adds its packages, a stdio entry, and the `mcp` script. The entry
boots the configuration class you name, projects the dispatcher's mappings, and
starts the server. Tool metadata comes from `@toolMapping` on handlers — the
capability does not add a second declaration.

## Sequence

1. `ndigo capabilities get agent-surface --json` — read `packages`, `variables`,
   and `ops`. This is the fact source; do not work from memory.
2. Resolve each `variables[]` entry against the application (a configuration
   class and its module are the usual pair).
3. `ndigo add agent-surface` with one `--var <name>=<value>` per variable —
   inspect `steps[]` and `conflicts[]`.
4. Add `--apply` to write. Re-running is a no-op.
5. `ndigo inspect` — confirm the handlers appear.
6. Run the app's `mcp` script and list tools.

## Traps

- **The entry boots the class you pass.** A wrong class or module starts a
  context with no controllers, so `tools/list` is empty.
- **A route without `@toolMapping` is not a tool.** The projection reads that
  declaration, not the route alone.
- **`ndigo mcp` is the CLI's introspection server.** The application's server is
  its own `mcp` script; do not conflate the two.
- **`--force` overwrites.** Read the conflict first; it exists because a file or
  `scripts.mcp` value differs.
- **Policy is per server.** Pass `readOnly`, `authorize`, and `confirm` where the
  registry is built; the capability's template starts read-only.

## Verify

`ndigo capabilities check` is green; `ndigo inspect` lists the handlers; the
app's `mcp` script lists the expected tools and answers one call.

## Example prompt

> Add an MCP server to this app. Read the `agent-surface` capability first,
> plan it, show me the conflicts, then apply with the app's configuration class.
> Finish by listing the tools the generated server exposes.
