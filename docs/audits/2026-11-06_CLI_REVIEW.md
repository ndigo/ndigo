# 2026-11-06 CLI Review — `@ndigo/cli` (Stricli migration + command expansion)

**Status:** Findings + remediation plan (2026-11-06)
**Scope:** `packages/ndigo-cli` across `02d6bb4a..HEAD` — the OCLIF→Stricli
migration (#124) and the command-expansion waves through #143. ~2,300 added
lines, 35 command files, two helper modules, the package entry point.
**Tracking:** [#144](https://github.com/ndigo/ndigo/issues/144) (must-fixes).

## Method

Three parallel review lanes (full-axis code review; security + dependency
audit; documentation review), followed by independent verification: the
package test suite, `pnpm lint`, the built `lib/` state, and live proofs of
each critical claim against `bin/run.js` (details under Verification).

**Verdict: request-changes.** Two must-fix groups (verified live), a strong
warning cluster, and a docs-sync pass. The underlying discipline is sound:
argv-only spawns (no shell anywhere), bounded delete scopes, no secrets,
clean dependency closure (`@stricli/core@1.3.0`, 0 transitive deps, 0 CVEs),
no lint violations, no integration-layer import violations.

## Must fix (verified live)

| # | Finding | Evidence |
|---| ---| --- |
| F1 | Spawn sites await only `'exit'` with no `'error'` listener (`runAppOnce`/`runWorkspaceOnce`, `update.ts`, `add.ts`, `_diagnostics.capture`); ENOENT arrives as an async `'error'` event instead. | `ndigo doctor` with `pnpm` off PATH printed `Error: spawn pnpm ENOENT` + stack (the check built to diagnose broken environments cannot report cleanly); `_diagnostics` resolved a lying healthy row `pnpm ` with `missing:false`. |
| F2 | No validation boundary on the update manifest: bare `JSON.parse` cast; `manifest.packages[name]` throws on shape mismatch; values pass verbatim into `package.json` before `pnpm install`. | Valid-JSON-wrong-shape manifest → `TypeError` stack in both `--check` and apply mode (live). Supply-chain: `"@ndigo/core": "npm:@evil/companion@1"` is a valid npm alias that installs an arbitrary package *as* `@ndigo/*` (security lane SEC-001); version logic was meaningless string inequality and silently pinned over `^`/`~` ranges. |
| F3 | `logs --follow`: `position` is a byte offset (`statSync().size`) sliced into a UTF-8 string; snapshot races the initial tail; every poll re-reads the whole file; `--lines` accepts `NaN` (prints whole file) and negatives. | Confirmed by two review lanes; garbles non-ASCII logs, can drop appended lines. |
| F4 | `clean --force` declared "Required to clean" but the body never reads the flag — deletes unconditionally. | Destructive gate advertised and unwired; delete guards themselves are correct. |

## Warnings

- **REV-004** — `--version` reads `'..','..','package.json'`, which does not
  exist from the built layout; falls back to `0.0.1`. Masked only because the
  version *is* 0.0.1 (`packages/package.json` confirmed absent, live).
- **REV-008** — `add`/`update` bypass the helper layer: private
  `readAppManifest` twin in `update.ts`; `add.ts` re-implemented the spawn
  bridge and dropped the AD75-H2 signal relay (Ctrl-C orphans `pnpm install`).
- **REV-009** — dual error surfaces: thrown `usageError` renders
  `Command failed, Error: <msg>` + stack (live-confirmed) while inline errors
  print one clean line.
- **REV-011** — completion's hand-maintained `COMMANDS` list already drifted
  (missing `env`, `add`, `update`, `openapi`, `logs`).
- **REV-010** — 23 of 31 commands have zero test coverage; both criticals
  shipped through CI undetected; no assertion separates stderr;
  `app-scripts.spec.ts:29` is cwd-fragile under root-level invocation.
- **REV-012** — `update`/`logs` shipped ahead of their plan's sequencing
  (# mechanism gated behind 1.0), and the plan doc now misstates their state.

## Docs findings

DOC-001 invalid flagged example (`ndigo db migrate --db` — flag denied);
DOC-009/010 broken Markdown tables (raw `|` in backticks, both docs);
DOC-003 package README leaks internal `AD-*` ledger ids (guide-12
violation); DOC-004/005/007 stale intros naming 7 of 21 commands (README,
guides index, root README, `package.json` description, `src/index.ts`
module doc, `generate` help text); DOC-006 TSDoc missing on 22 exported
command symbols (renders as description-less reference entries); DOC-011
`new --preset` brief advertises unimplemented `full-stack`; plus smaller
gaps (g alias undocumented, README flag omissions, db-new wording).

## Suggestions / nits

`createScriptFrontCommand` factory for 5× duplicated script fronts + the
22-file `dir` positional block; collapse `routes`→`inspect` (same script
through both); `config` edges (`set` without value corrupts the file, `get`
missing prints `undefined`, dead `undefined` branch); `serve`/`dev` exit
asymmetry (`process.exit` vs `exitCode`); `env`/`info` are cwd-only;
newline-in-script silent arg-join (fail loud); config key allow-list
(`Object.create(null)`); `buildCliApp` naming tension with §3.13
`create*`; stale `@module blue-cli` in `doctor-floor.spec.ts`; mixed
`.js` suffix style in specs; `db new` empty-slug + `db rollback` unvalidated
count.

## Clean lanes

- No `shell:` anywhere; every spawn argv-based (greps verified).
- `clean.ts` delete scope guarded (`/`, `$HOME`, `node_modules`).
- `env.ts` never parses `.env` values; no `.env` writer in the package.
- No `eval`/`new Function`/dynamic-import/secret tokens; no prototype
  pollution reach through `JSON.parse` + spread paths.
- Dependencies: `@stricli/core@1.3.0` zero transitive deps, SLSA-provenance,
  advisory scan over the locked closure returned no CVEs.
- `migration-probe` is deliberate duplication done right (documented,
  parity-pinned by `db-new.spec`).

## Remediation plan

Sequenced, independently landable PRs (worktree per PR, issue-tracking):

1. **PR1 — `fix(cli)`: fail-safe spawns + validated update manifest** —
   shared `runInteractiveSpawn` (relay + `'error'`→127), manifest boundary
   `likeVersionManifest`/`readVersionManifest` (`_version-manifest.ts`:
   exact pins only, `@ndigo/*` names, clean exit-2 messages), `add`/`update`
   through the helper (restores AD75-H2 relay, deletes the manifest-twin),
   `_diagnostics` error-path fix, tests for all of the above. ← this PR (…#144)
2. **PR2 — `fix(cli)`** — logs byte-faithful rewrite (`Buffer` positions,
   incremental reads, rotation reopen, `--lines` validation), `clean --force`
   enforcement, `--version` path fix, `config` edges.
3. **PR3 — `refactor(cli)`** — shared script-front factory + `dir`
   positional descriptor, one error surface via Stricli exception
   formatting, completion list derived from the route map, hardening rides.
4. **PR4 — `docs(cli)`** — the docs findings list + TSDoc sweep +
   `pnpm doc:api` regen.
5. **PR5 — `test(cli)`** — backfill coverage for the 23 untested commands,
   stderr-separated assertions, route-map parity pin, cwd-fragile fix.
6. **PR6 — `docs`** — reconcile `docs/plans/2026-11-06_CLI_INFRASTRUCTURE_REMAINING.md`
   with the shipped state (its §1/§6 "stub" claims are false as of this
   range) and record the sequencing deviation.

## Verification record (this session)

- Initial test run: 14/29 fail — workspace drift: stale pre-migration
  `lib/` importing the removed `@oclif/core` + drifted `node_modules`.
  After drift repair: 28/29 (remaining: the pre-existing cwd-fragile
  assertion). `lib/` is gitignored; the actionable residue is that the
  integration lane requires a fresh `build:lib`.
- Live proofs (all against the real bin, post-fix both crashes reproduce on
  pre-fix HEAD):
  - `ndigo update --check` with manifest `{}` → `TypeError: Cannot read
    properties of undefined (reading '@ndigo/core')`, exit 1 + stack.
  - `PATH` without `pnpm`: `ndigo doctor` → `Error: spawn pnpm ENOENT` stack.
  - usage-error render: `Command failed, Error: '<dir>' is not an
    application directory — it has no package.json` + stack (exit code
    preserved at 2 via the `process.exitCode` side channel).
- Post-fix (PR1) states verified: `--check`/apply with broken or malicious
  manifests exit 2 with clean stderr; apply pins then reports missing
  `pnpm` as 127; doctor without pnpm reports `n/a (not found)` + failure
  line, exit 1, no stack.
