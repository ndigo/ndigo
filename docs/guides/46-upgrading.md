# Guide 46 — Upgrading Ndigo

An upgrade is a small migration project: read what changed, pin the new
versions, run the app's gates, and keep a rollback path. Ndigo is pre-1.0, so
the rules are stricter and simpler than a published major: renames are hard
cuts, there is no compatibility alias layer, and the repository is the
distribution. After 1.0 the exported surface freezes and changes become
additive unless a major says otherwise.

This guide covers both sides: upgrading an application, and writing the
migration guide when the framework changes.

**Audience:** Application developers and framework contributors · **Prerequisites:** Guides [25](25-clustering.md), [37](37-ndigo-cli.md), and [90](90-package-documentation.md) · **Reference app:** `[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)`

## What you'll learn

- Know what is frozen, what is additive, and what is a hard cut.
- Check and apply `@ndigo/*` version bumps with the CLI manifest.
- Run the upgrade and rollback workflow safely.
- Find and read the CHANGELOG and migration guides.
- Write a migration guide for a framework change.

## 1. The versioning contract

| Phase | Rule |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pre-1.0** | The repository is the distribution; renames/removals are hard cuts with **no aliases** . A change ships with a migration guide and a CHANGELOG entry. |
| **1.0 freeze** | The frozen surface is the public API reachable from each package's `exports` map: exported symbols, their signatures, and documented behavior. `_*.ts`, `lib/`, and `api/` are not covered . |
| **Post-1.0** | Changes to the frozen surface are **additive**. A breaking change waits for the next major, or lands incomplete behind `@ndigo/flags` . |

Consequences for upgrades:

- Do not expect a deprecation layer at 1.0. If a name changed pre-1.0, the old
 name is gone; the migration guide is the bridge.
- Upgrade the `@ndigo/*` packages **as a set**. They are a self-contained graph
 with workspace ranges; mixing minors is not a supported configuration unless
 a guide says otherwise.
- The runtime floors move with the release: Node.js ≥24 and pnpm ≥12.

## 2. Check the versions

`ndigo update` compares an app's `@ndigo/*` dependencies against a version
manifest and applies exact pins:

```bash
ndigo update --check ./apps/my-app
ndigo update ./apps/my-app
```

- The manifest is `ndigo-versions.json` in the app, or the path in
 `--manifest` / `NDIGO_VERSION_MANIFEST`.
- `--check` reports each package behind the manifest and exits non-zero when
 any are behind; `update` writes exact versions and runs `pnpm install`.
- The manifest is a trust boundary: absent or malformed files stop the command
 rather than producing a partial update.
- Range specifiers (`^`, `~`) never compare cleanly against exact pins; pin
 the package first if `--check` says it is permanently behind.

If the app does not use the CLI manifest, edit the `@ndigo/*` versions in
`package.json` together and run `pnpm install`.

## 3. Read before installing

Two sources, in this order:

1. **`CHANGELOG.md` → `[Unreleased]`** — the user-facing _what changed_
 (Added / Changed / Deprecated / Removed / Fixed / Security), with the ADR
 link where one exists.
2. **`docs/migrations/`** — the step-by-step _how to move_, with before/after
 examples. Start at the [migration index](../migrations/README.md).
3. **The ADR** — when the change is architectural, read the decision record to
 understand the new shape and the revisit trigger.

Do not skip a migration guide because the version bump looks small. Pre-1.0
hard cuts are intentionally not softened by aliases.

## 4. The upgrade workflow

```bash
git switch -c chore/upgrade-ndigo
# 1. Read the CHANGELOG and every migration guide that applies.
ndigo update --check ./apps/my-app
ndigo update ./apps/my-app          # or edit package.json as a set
pnpm install
pnpm build
pnpm typecheck
pnpm test
# 2. Run the app's smoke lane and exercise the changed surface.
pnpm apps:smoke
```

Then:

- **Fix compiler errors first.** They usually point at the renamed symbol or
 changed signature; the migration guide names the replacement.
- **Run the app**, not only the tests: start it, hit the changed route/job/view,
 and check the browser console and server logs.
- **Database changes** — apply the migration with `ndigo db migrate`, verify
 `ndigo db status`, and keep a backup/previous image for rollback. A schema
 migration is not automatically reversible.
- **Commit the lockfile** with the manifest changes; a floating install is not
 an upgrade.
- **Update the app's own docs/comments** that cite the old API; the guide and
 package README are the current source.

## 5. Rollback

Keep the rollback path before you start:

1. The previous branch/image and `pnpm-lock.yaml` are the code rollback.
2. `git restore package.json pnpm-lock.yaml && pnpm install` returns the
 dependency graph.
3. A database migration may need a restore from backup or a forward fix; do
 not assume `db rollback` covers a destructive change.
4. Config/secret changes (new keys, renamed keys) need the old values; keep the
 previous environment snapshot.

If the upgrade is half-applied, stop and restore both code and lockfile before
debugging forward.

## 6. Writing a migration guide

When a framework change needs an upgrade path, add
`docs/migrations/YYYY-MM-DD_DESCRIPTION.md` (date = completion) and link it in
the [migration index](../migrations/README.md). The template:

```markdown
# <Package> <old> → <new>

**Date:** YYYY-MM-DD
**Affected packages:** `@ndigo/...`
**Change type:** breaking / additive / tooling

## Why

The decision record and the user-visible reason.

## What changed

The old shape and the new shape, with the smallest before/after example.

## Migration steps

1. Bump the package set.
2. Replace X with Y (codemod/manual).
3. Update config keys / imports / tests.

## Verification

The commands and the app surface to exercise.

## Rollback

What to restore; call out irreversible database/config changes.

## References

ADR, PR, issue.
```

Also:

- Add the CHANGELOG entry under `[Unreleased]` in the matching category; keep
 it user-facing and link the ADR.
- Add or update the ADR when the change is architectural; the migration guide
 is the _how_, the ADR is the _why_.
- Update the affected guide and package README in the same change.
- Pre-1.0: state explicitly that there is no alias; post-1.0: state the major
 or the flag gate.

## 7. Pitfalls

- **Skipping the migration guide.** The compiler catches signatures, not
 changed semantics or config keys.
- **Mixing framework versions.** Upgrade the set; a partial bump can resolve
 two contract generations at once.
- **Floating ranges.** `^`/`~` around a pre-1.0 line hides the exact version
 the guide was written for; `ndigo update` pins.
- **Forgetting the lockfile.** A `package.json` edit without a committed lock
 is not reproducible.
- **Assuming a database rollback.** Test the restore path before the upgrade.
- **Ignoring the runtime floor.** Node 24/pnpm 12 are part of the release, not
 a suggestion.
- **Keeping old imports behind a wrapper.** Pre-1.0 aliases do not exist;
 migrate the call site.
- **No app smoke.** Unit tests can pass while the server fails to bind or a
 view no longer resolves.

## See also

- [Migration index](../migrations/README.md) — every upgrade guide
- [CHANGELOG](../../CHANGELOG.md) — the user-facing change log
- [Guide 25 — Clustering](25-clustering.md) — the CLI lifecycle used by the upgrade commands
- [Guide 37 — The `ndigo` CLI](37-ndigo-cli.md) — `update`, `db`, and `serve`
- [Guide 38 — Deployment & Production Readiness](38-deployment-and-production-readiness.md) — release/rollback posture
- [Guide 90 — Package Documentation](90-package-documentation.md) — the package/API standard
- — the freeze surface and additive policy
