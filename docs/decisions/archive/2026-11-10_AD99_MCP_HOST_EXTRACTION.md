# AD-99: Extract the MCP host and add `ndigo mcp`

> **Consolidated** — merged into the umbrella ADR. Retained for history.

**Date:** 2026-11-10
**Status:** Accepted.

## Context

`ndigo ui mcp` already served the registry over stdio MCP. A second server for
application introspection would have duplicated the protocol plumbing: server
construction, tool registration, JSON-text results, error mapping, read-only
filtering, and stdio startup. The CLI is a thin front (AD-75); protocol code
belongs in one place even when it is CLI-owned.

## Decision

**Extract the host, not the tools.** `createMcpHost` owns the protocol
plumbing and read-only filtering. Each server supplies its own tool set:
`ndigo ui mcp` keeps registry tools, `ndigo mcp` supplies introspection tools.
The host is a CLI helper, not a public package, because the application-facing
MCP surface is `@ndigo/mcp`.

**`ndigo mcp` has two profiles.** The static profile exposes the application
manifest and repository facts: `get_manifest`, `get_routes`,
`get_config_keys` (presence only), `get_best_practices`, `run_doctor`,
`get_logs`, and `get_commands`. `run_target` and `record_rule` are mutating and
are omitted under `--readOnly`. `--live` hands stdio to the application's own
`scripts.mcp`, so an app can define its runtime tools instead of the static set.

**Read-only is a flag, not an environment variable.** `--readOnly` is explicit
per invocation; tools are omitted from `tools/list` as well as rejected on
call.

## Rationale

- The second server is a route map over an existing host, exactly as the CLI
  fronts `db`, `ui`, and the app's own scripts.
- A static profile works without booting the app; `--live` is the escape hatch
  when runtime state is required.
- Keeping values out of `get_config_keys` (presence only) preserves the
  `@ndigo/inspect` secret boundary.
- `get_commands` reuses the AD-97 index so the CLI surface is discoverable from
  the same process that serves it.

## Consequences

- New CLI MCP servers register tools on `createMcpHost`; they do not construct
  `McpServer` or `StdioServerTransport` directly.
- `ndigo mcp` is not a `--json` command (it is a long-running stdio server).
- The live profile depends on the application's `scripts.mcp`; a missing script
  is a startup error with an actionable message.
- Read-only filtering has one implementation and one place to test.

## Revisit triggers

- The MCP transport gains a transport the host does not abstract (for example,
  a server-initiated HTTP profile).
- The static/live split proves insufficient and profiles need composition.
- `ndigo mcp` needs tool-level authorization beyond read-only.

## Evidence

- `packages/ndigo-cli/src/helpers/mcp-host.ts`.
- `packages/ndigo-cli/src/commands/mcp.ts` and `packages/ndigo-cli/src/commands/ui/mcp.ts`.
- Guide 37 — the `ndigo mcp` profiles and tool list.
- PR #327.

## See Also

- AD-96 — umbrella
- AD-97 — the `--json` command index
- AD-100 — `@ndigo/mcp`, the application-facing server
