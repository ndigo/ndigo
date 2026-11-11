# AD-97: A uniform `--json` contract for the CLI

> **Consolidated** — merged into the umbrella ADR. Retained for history.

**Date:** 2026-11-10
**Status:** Accepted.

## Context

Agents driving the `ndigo` CLI cannot reliably parse human output. The CLI
already had one machine-readable surface (`ui view --json`), but the shape
varied per command: some printed an object, some a bare array, some mixed
diagnostics into stdout. A second convention would have been worse than none —
an agent would have to learn each command.

## Decision

**One JSON document on stdout, diagnostics on stderr, exit codes unchanged.**
When `--json` is present, the command writes exactly one JSON value to stdout;
human output is untouched without the flag. Warnings and progress stay on
stderr.

**A published command index.** `ndigo commands [--json]` returns every command
with its flags, positionals, and exit codes. The index is built from the same
command registry the dispatcher uses, so an agent can discover the surface
instead of hard-coding it.

**Per-command payload shapes are tested.** `doctor`, `info`, `logs`,
`config list`, `env`, `openapi`, `db status`, `lint`, `typecheck`, `routes`,
`commands`, and `ui catalog` each have a snapshot/shape test. Long-running or
interactive commands (`serve`, `build`, `test`, `inspect`, `mcp`) deliberately
do not take `--json`.

## Rationale

- A single envelope rule is cheaper to learn than a per-command schema, and it
  keeps stdout machine-clean.
- Exit codes are the stable contract for agents; changing them behind `--json`
  would create a second truth.
- Publishing the command index from the registry prevents the index and the
  parser from drifting.
- `ui catalog` is the first payload that is consumed by an agent (A2UI), so its
  shape had to follow the same rule rather than invent one.

## Consequences

- Every new command must decide its payload and add a shape test; `--json` is
  not an afterthought.
- Human output cannot be changed casually when it is also the non-JSON
  surface; the flag is the boundary.
- The agent skills can instruct "run `ndigo commands --json`" instead of
  listing flags.

## Revisit triggers

- A command needs streaming JSON (JSONL); that requires a deliberate envelope
  decision, not a per-command exception.
- The CLI moves off `@stricli/core` and the registry/index seam no longer
  exists.
- Agents need a stable schema version in payloads.

## Evidence

- `packages/ndigo-cli/src/commands/_json.ts`,
  `_command-registry.ts`, and per-command `--json` paths.
- Guide 37 — the CLI command table and JSON contract.
- Snapshot/shape tests under `packages/ndigo-cli/test/`.
- PR #329.

## See Also

- AD-96 — umbrella
- AD-75 — the CLI as a thin front
