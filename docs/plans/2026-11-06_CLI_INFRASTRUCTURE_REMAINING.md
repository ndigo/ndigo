# `ndigo-cli` — Remaining Infrastructure Work Plan

**Status:** Reconciled 2026-11-06 against the landed state. The original
draft of this plan predates the command-expansion wave and the 2026-11-06
CLI review remediation (`docs/audits/2026-11-06_CLI_REVIEW.md`, PRs #145,
#147, #149, #151, #153) — several "remaining" items below landed in the
meantime; those are marked **landed** and only genuinely open work is
planned.

**Scope:** items requiring new infrastructure (templates, generators,
manifests) rather than CLI plumbing.
**Principle:** The CLI stays a thin front; all heavy lifting lives in the
owning packages (`tools/generators`, `@ndigo/openapi`, release tooling).

---

## 1. `ndigo update` — remote version manifest + migrations

**Landed:** local manifest apply path with a validated trust boundary —
`--check` comparison and apply mode both exist, manifest values must be
exact semver pins under `@ndigo/*` names (`packages/ndigo-cli/src/commands/_version-manifest.ts`
was reviewed in #145 specifically to close the npm-alias supply-chain
channel before anything remote could ship).

**Remaining plan**

1. Publish a version manifest at a stable URL (e.g.
   `https://ndigo.dev/versions.json`) listing each `@ndigo/*` package's
   latest release and the minimum CLI version that supports it. The fetch
   inherits the PR1 validation boundary — remote payloads pass the same
   `likeVersionManifest` gate before any disk write.
2. Add `scripts/check-versions.mjs` (or extend `manifest:check`) that
   validates the manifest schema in CI.
3. In `@ndigo/cli`: fetch with an offline cache under `~/.cache/ndigo/`
   (record the fetch date; fail closed on stale/missing), plus a second
   integrity channel (checksum or signature shipped with the package) per
   the security lane's SEC-001 recommendation.
4. Add `--dry-run` printing the planned dependency diff without writing.
5. Run any pending framework migrations after the install (the AD-78
   runner pattern — a `migrations/` directory per package).
6. Decide the range contract: today the manifest is exact-pins-only and
   `--check` compares specifiers literally (range-style app deps get a
   hint). If range-style apps should "pass", implement real range
   semantics instead of the literal comparison.

**Deliverables:** remote fetch/cache module, `--dry-run`, migration
runner hookup, tests against a fixture manifest (local test fixtures
already exist from #145/#153).

---

## 2. `ndigo add` — complete `--skip-setup` and widen setup coverage

**Landed:** dedicated setup generators exist for the four Tier-1
capabilities — `redis-setup`, `jobs-setup`, `socket-setup`, `cache-setup`
(tools/generators) — and `add` attempts `<pkg>-setup` after install,
falling back to the manual-wiring hint (`src/commands/add.ts`).

**Remaining plan**

1. `--skip-setup` flag to skip the generator attempt (reviewed plan
   item, not yet implemented).
2. Ship setup generators for the remaining capability packages that need
   wiring (check `@ndigo/generators`' generator set before adding).
3. Each new setup generator follows the existing four: install + wiring
   file + bootstrap registration + `.env.example` keys.
4. Tools-side tests per generator.

**Deliverables:** `--skip-setup`, additional setup generators as
identified, tests.

---

## 3. `ndigo new --preset` — starter presets

**Landed:** the `api` preset (node app + sample `@entity` + db adapter
registry) and the kind-resolving presets `minimal`/`browser`; `--preset`
resolves the kind when `--kind` is omitted.

**Remaining plan**

1. `full-stack` preset — api + browser in one workspace (two apps).
   Today the CLI brief documents only the implemented presets; `full-stack`
   must not be advertised until the generator ships it.
2. `--with-db <engine>` flag wiring the adapter runner (depends on the
   DB adapter plan §3).

**Deliverables:** preset templates, generator changes, tests.

---

## 4. `ndigo generate` — migration's own template

**Landed:** dedicated generator factories for `controller`, `service`,
`entity`, `middleware`, and `config` with real templates.

**Remaining plan**

1. `migration` currently reuses the component scaffold via a generator
   alias (tools/generators/generators.json); give it a dedicated template
   derived from the `db new` scaffold (empty `Migration` module + version
   probe parity) or remove the alias in favor of documenting `ndigo db new`
   as the canonical path — one canonical path per artifact.
2. Update `FLAG_KEYS_BY_KIND` in @ndigo/cli if new kinds need flags.

**Deliverables:** migration generator decision + template + tests.

---

## 5. `ndigo openapi` — script-convention runner

**Landed:** `@ndigo/openapi`'s document emitter helper and the CLI's
`--out`/`--format` forwarding.

**Remaining plan**

1. An `openapi` script convention (or a `ndigo generate openapi-runner`
   kind) so apps gain a canonical emitter entry point instead of
   hand-writing the script.
2. Guide-wording pass once the runner exists.

**Deliverables:** runner generator (or documented script convention),
tests.

---

## 6. `ndigo logs --since <duration>`

**Landed:** the byte-faithful follow mode (`--follow` with `--lines`,
`--file`, rotation handling, clean SIGINT/SIGTERM exit) from the review
remediation.

**Remaining plan**

1. `--since <duration>` optional filter (parse with a small duration
   parser).
2. Tests with a temp-file fixture (the follow spec from #153 is the
   pattern).

**Deliverables:** `--since` implementation + tests.

---

## Sequencing

1. **Low-risk, independent:** `--skip-setup`, `logs --since`, the
   migration-generator decision.
2. **Generator/template work:** `full-stack` preset (+`--with-db`),
   remaining setup generators, the openapi runner.
3. **Release-coupled:** the remote version manifest + cache + `--dry-run`
   + framework migrations — the trust boundary landed in #145, so this
   work can start against a validated front; keep it gated behind the 1.0
   release as before.

Each item should land as its own PR following the worktree discipline.
