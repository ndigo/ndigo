# `ndigo-cli` — Command Expansion Plan (non-DB)

**Status:** Draft plan (2026-11-06)
**Scope:** `@ndigo/cli` only. DB commands are covered separately in
`2026-11-06_DB_ADAPTER_ABSTRACTION.md`.
**Principle:** The CLI stays a thin front. Every new command either (a) fronts
an app-owned script under the AD-74/AD-75 process lifecycle, or (b) fronts a
framework generator via the Nx bridge. No command reimplements framework logic.

---

## 1. Lifecycle parity (front app scripts)

Apps already declare `start`/`dev`/`inspect`/`db:*`. Extend the same
one-shot/supervised pattern to the remaining standard scripts.

| Command           | Script key                      | Lifecycle | Notes                                                  |
| ----------------- | ------------------------------- | --------- | ------------------------------------------------------ |
| `ndigo build`     | `build`                         | one-shot  | Production bundle; `--watch` optional.                 |
| `ndigo test`      | `test`                          | one-shot  | Pass-through args after `--`.                          |
| `ndigo lint`      | `lint`                          | one-shot  | Pass-through args.                                     |
| `ndigo format`    | `format`                        | one-shot  | Pass-through args.                                     |
| `ndigo clean`     | (none — CLI-owned)              | one-shot  | Remove `dist`/`lib`/`.nx/cache`/coverage; `--dry-run`. |
| `ndigo typecheck` | `typecheck` (or `tsc --noEmit`) | one-shot  | Useful for CI.                                         |

Implementation: reuse `runAppOnce`/`runWorkspaceOnce`; add `build`/`test`/`lint`/
`format`/`typecheck` to the script-key allow-list. `clean` is CLI-owned
(filesystem) with a protected-path guard (reuse the `--force` guard from
`create-ndigo-app`).

---

## 2. Project scaffolding & growth

### 2.1 `ndigo add <package>`

Angular/Nest-style capability installer.

- Resolve the package name (must be `@ndigo/*` or an approved integration).
- Run `pnpm add <pkg>` in the app directory.
- If the package ships a generator (`@ndigo/generators:<pkg>-setup`), run it
  via the Nx bridge to wire config/imports.
- Print next steps (env vars, config keys).

Exit codes: 2 on unknown/unsupported package, 1 on install failure.

### 2.2 `ndigo new` presets

Extend `--kind node|browser` with `--preset <name>`:

- `api` (Node + ORM + dispatcher + auth stub)
- `browser` (Vite + view + content)
- `full-stack` (api + browser in a workspace)
- `minimal` (today's default)

Presets are template directories under `@ndigo/generators:app`; the CLI just
forwards `--preset`. Keep `--kind` as the low-level axis.

### 2.3 `ndigo generate` expansion

Add kinds to `GENERATOR_KINDS` (requires new generators in
`@ndigo/generators`):

- `controller`, `service`, `entity`, `middleware`, `config`, `migration`
  (migration stays DB-agnostic — scaffolds an empty `Migration` module).

Each new kind must have a `FLAG_KEYS_BY_KIND` entry and a generator. The CLI
change is mechanical (add to the enum + flag map); the generator work is the
bulk.

---

## 3. Framework maintenance

### 3.1 `ndigo update`

Bump `@ndigo/*` versions in the app's manifest to the latest compatible
release and run any pending framework migrations.

- Read current versions, compute target from a published manifest/registry.
- Apply edits via a generated migration script (reuse AD-78 runner pattern).
- `--dry-run` prints the diff without writing.
- `--check` exits 1 if updates are available (CI gate).

Depends on a published version manifest — gate behind 1.0 release.

### 3.2 `ndigo info`

Superset of `doctor`: CLI version, Node/pnpm, workspace root, git, installed
`@ndigo/*` versions, enabled integrations, and (if a registry is present) DB
adapters. Reuse `doctor` internals; add a `--json` output for tooling.

### 3.3 `ndigo completion <shell>`

Generate shell completion scripts (bash/zsh/fish/powershell). Stricli has
first-class support via `@stricli/auto-complete`; add the package as a
dependency and a `buildInstallCommand`-based install/uninstall. Low effort,
high DX.

### 3.4 `ndigo config get|set|list`

Read/write a small app-level config file (`ndigo.config.ts` or
`.ndigorc.json`) for keys like default DB, telemetry, port. Shared with the
DB adapter registry (see DB plan §2).

---

## 4. Introspection & DX

### 4.1 `ndigo routes`

Focused view of the AD-70 manifest's route table (method, path, controller,
guards). `inspect` already prints the full manifest; this filters + formats.

### 4.2 `ndigo openapi`

Emit an OpenAPI document from the manifest (routes + Zod-derived schemas).
Depends on `@ndigo/openapi` if/when it lands.

### 4.3 `ndigo env`

Validate required environment variables against a declared schema
(`ndigo.config.ts#env` or `.env.example`). Exit 2 on missing/invalid; print
a checklist. Useful in CI and `doctor`.

### 4.4 `ndigo logs` / `ndigo tail`

Tail the app's log file if a convention exists (`logs/app.log` or stdout
capture). Lower priority; only if apps adopt a log file convention.

---

## 5. Prioritisation

**Wave 1 (high ROI, low risk, fits existing patterns):**

1. `build` / `test` / `lint` / `format` / `typecheck` / `clean`
2. `completion`
3. `info` (doctor superset) + `--json`
4. `config get|set|list`
5. `routes`

**Wave 2 (medium effort, generator work):** 6. `generate` expansion (controller/service/entity/middleware/config) 7. `new --preset` 8. `add` 9. `env`

**Wave 3 (release-coupled / larger):** 10. `update` 11. `openapi` 12. `logs`/`tail`

---

## 6. Conventions to preserve

- Every command stays a thin front: app scripts, generators, or framework
  packages own the logic.
- Pass-through args use `--` separator (Stricli supports variadic trailing
  args).
- Exit codes follow the existing contract: 0 ok, 1 runtime, 2 usage.
- New commands get a row in guide 25 and an entry in `GENERATOR_KINDS` where
  applicable.
- `ndigo db *` remains DB-agnostic (see DB adapter plan).
