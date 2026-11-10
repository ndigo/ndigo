---
name: ndigo-debug
description: Diagnoses a failing Ndigo application with the CLI's introspection surfaces. Use when a route is missing, startup fails, behavior is unexpected, or logs are needed.
---

# Debugging a Ndigo application

## Decision table

| Symptom                  | First command                            |
| :----------------------- | :--------------------------------------- |
| Environment / startup    | `ndigo doctor --json`                    |
| Nothing in the log       | `ndigo logs --lines 200 [--file <path>]` |
| Route or mapping missing | `ndigo inspect` (`ndigo routes --json`)  |
| Response shape wrong     | `ndigo openapi` and the view guide       |
| App-specific tooling     | `ndigo mcp [dir] --readOnly`             |
| Config key absent        | `ndigo inspect` (presence only)          |

## Sequence

1. `ndigo doctor --json` — versions, workspace, git, and failed checks.
2. `ndigo inspect` — the app's own AD-70 manifest. It boots the application
   without listening, so a boot failure surfaces here.
3. Compare the manifest to expectations: route, mapping, parameters, config
   key presence.
4. Read `ndigo logs` (default `logs/app.log`) and the process stderr.
5. Reproduce with the narrowest app script; add a regression test.

## Traps

- **`inspect` is application-owned.** A missing `scripts.inspect` is a wiring
  gap; add it, then re-run. The CLI cannot enumerate routes without it.
- **stdout is the interface.** MCP and `--json` output must stay on stdout;
  application diagnostics belong on stderr.
- **A manifest is value-free.** Config entries expose presence, never values;
  do not expect secrets in the manifest.

## Verify

The diagnosis is confirmed by a manifest entry, a log line, or a failing test —
not by a guess; then the fix is proven by the narrowest re-run.
