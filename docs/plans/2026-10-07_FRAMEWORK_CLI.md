# 2026-10-07 The framework CLI — `@blue/cli`

**Date:** 2026-10-07
**Status:** Executed (see §8)
**Decision:** [AD-75](../decisions/2026-10-07_AD75_FRAMEWORK_CLI.md)
**Scope:** GAP-6 of the 2026-10-07 delta sweep
(`docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6): a first-class
framework CLI — the research-backed command surface on `@oclif/core` v5,
embedded as a library.

---

## 1. Problem

Every Node app runs a bespoke `tsx src/index.ts`; every browser app runs
raw `vite`; root tooling is a pile of ad-hoc `pnpm` scripts; the AD-74
cluster and the AD-70 inspector exist as libraries no one can type. There
is no `blue <command>`.

## 2. Research (2026-10-07, web — full report in session `CliResearch-2`)

- The command taxonomy is near-universal: create/generate, dev/serve,
  db/*, build/test, **doctor** (`nest info`/`artisan about`), and upgrade
  with versioned codemods (`rails app:update`, `nx migrate`, `quarkus
  update`).
- DX expectations: prompts for anything not flagged, `--help`/`--version`
  everywhere, dry-runs, documented exit codes.
- Generators are framework-owned packages, never CLI plugins.
- `@oclif/core` v5.0.0 (2026-08-31) requires Node ≥22 — the BlueJS
  baseline; Salesforce-backed, ~weekly releases, embedded by `sf`/Heroku/
  Shopify. Alternatives (commander, citty, `node:util parseArgs`) lighter
  but lack the structure or the institutional validation.

## 3. Change

1. **`@blue/cli`** (new, layer 6, bin `blue`) on `@oclif/core ^5`, embedded:
   file-per-command topics (serve, dev, generate, db:migrate, inspect,
   doctor), typed flags, help, exit-code contract.
2. **`serve`** — the app's `start` script under the AD-74 supervisor:
   `--cluster <n>`, `--port <base>` (PORT = base + slot).
3. **`dev`** — the app's `dev` (vite) or `start` script.
4. **`generate`** — front for `@blue/generators` via the workspace Nx
   bridge; kind allowlist (package/component/readme/header).
5. **`db:migrate` / `inspect`** — the app's declared scripts, with hints.
6. **`doctor`** — versions, workspace, git (oclif's `this.log` output seam).
7. **Shell-free script execution** — scripts resolve to argv and spawn
   without a shell so OS signals reach the real application process
   (verified: package `run` wrappers and dash-style `sh` both swallow
   SIGTERM).

## 4. Deliberately out of scope (in the ADR)

- Server-side watch (dev hot-reload for Node apps) — v1.1.
- `upgrade`/codemods — ships with the first artifact-breaking change.
- build/test/lint wrappers — pnpm/nx own the monorepo tooling.
- oclif's plugin machinery + authoring chain — commands are plain classes
  in the workspace's `tsc` pipeline.

## 5. Verification

- Unit (2 helper specs): dir resolution, script resolution (argv, `.bin`
  PATH), compound-script rejection, missing-script hints.
- Real-bin integration (6): `--version`, `--help` surface, doctor output,
  unknown-generator usage error (exit 2), inspect hint, and the `serve`
  end-to-end — app up with the slot PORT, SIGTERM relayed into the app's
  own drain (marker), clean exit 0.
- The AD-74 signal-reach finding is an integration-level regression test of
  the shell-free contract.

## 6. Docs

AD-75; guide 25 + guides index; companion plan + plans index; package
README; ARCHITECTURE package map/roadmap; CHANGELOG; generated API docs.

## 7. Execution log (2026-10-07)

Implemented + verified in one pass. Along the way three real defects were
found and fixed IN the substrate, not the CLI:

- **Signal swallowing (render chain)**: `pnpm --dir run` kills its child
  without granting a drain; even `sh -c` forks on dash. Documented in
  `app-scripts.ts`; specs pin the shell-free contract.
- **oclif v5 requires `this.parse()`** — args/flags come from its return,
  not instance fields.
- **`Promise.race`-leaked timers** in `@blue/cluster` kept a supervisor
  process alive after a clean stop — races now clear their timers, and the
  respawn backoff polls the lifecycle (max 100 ms chunks).

Full gate set green (see the review plan's follow-up verification).
