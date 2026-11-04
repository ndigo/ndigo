# pnpm 12 and Nx 24 Upgrade

**Date:** 2026-11-04
**Status:** Complete
**Impact:** Low–medium (toolchain only; lockfile reshape, no source changes)

## Summary

| Tool       | From   | To      |
| :--------- | :----- | :------ |
| pnpm       | 11.4.0 | 12.16.1 |
| nx         | 23.2.1 | 24.0.4  |
| @nx/devkit | 24.0.2 | 24.0.4  |

pnpm 12 is the Rust rewrite of pnpm. Upstream describes the upgrade as "should
not feel like a migration": the commands, flags, settings, and lockfile format
are the ones from pnpm 11, with the differences listed below. Nx 24 changes
mostly affect Angular, Gradle, Remix, and module-federation workspaces; this
workspace uses no Nx plugins and no `nx migrate` codemods, so the version bump
is mechanical.

The `@nx/devkit` pin was already ahead of `nx` (24.0.2 against 23.2.1), which
left the workspace on mismatched majors. Both now resolve from the catalog at
24.0.4.

## Changes

### `package.json`

```diff
-    "pnpm": ">=11.0.0"
+    "pnpm": ">=12.0.0"
   },
-  "packageManager": "pnpm@11.4.0",
+  "packageManager": "pnpm@12.16.1",
```

With `engine-strict=true` and a corepack shim, the `packageManager` bump is what
actually switches the toolchain: corepack downloads pnpm 12.16.1 on the next
`pnpm` invocation.

### `pnpm-workspace.yaml`

```diff
 catalog:
-  '@nx/devkit': '~24.0.2'
+  '@nx/devkit': '~24.0.4'
-  nx: '~23.2.1'
+  nx: '~24.0.4'

 overrides:
-  nx: '>=23.2.1'
+  nx: '>=24.0.4'
```

pnpm 12 also wrote a `minimumReleaseAgeExclude` block. Its built-in
`minimumReleaseAge` is 1440 minutes (one day), non-strict: an install that needs
a younger version proceeds and records a version-pinned exception. nx 24.0.4
was published hours before this upgrade, so it and its platform binaries were
recorded. `minimumReleaseAgeExcludePrune: true` drops entries once the lockfile
no longer resolves them, so the list does not grow stale across future bumps.

### `nx.json`

```diff
-  "defaultBase": "master",
+  "defaultBase": "main",
```

This was a pre-existing bug: the repository's base branch is `main`, so any
future `nx affected` comparison would have diffed against the wrong branch.

### Documentation

- Root `README.md`: requirements and technology-stack versions.
- `CONTRIBUTING.md`: pnpm prerequisite and the `corepack prepare` command
  (also corrected the stale Node 22 line to 24).
- `AGENTS.md`: package-manager floor.
- 43 package `README.md` files and the package README template: `pnpm ≥11` →
  `pnpm ≥12`.

## pnpm 12 behavior notes

### Lockfile

- The pinned package manager is now part of the lockfile:
  `importers['.'].packageManagerDependencies.pnpm`, plus the `pnpm` package and
  its `@pnpm/exe.*` optional platform binaries under `packages:`.
- Cyclic dependency graphs are ordered by package ID, so a package inside a
  cycle no longer gets one peer variant per path that reaches it. The first
  re-resolving install produces a one-time lockfile diff; later installs are
  byte-stable. In this workspace that also removed copies that only the old
  variant graph kept alive (for example the `https-proxy-agent` / `axios`
  subtree under the previous Nx version).
- `pnpm install --frozen-lockfile false` is rejected; use
  `pnpm install --no-frozen-lockfile`.
- `pnpm install --resolution-only` is removed; `pnpm peers check` reports peer
  issues from the lockfile instead.

### Installation

- `packageImportMethod: auto` hardlinks before it clones on Linux. Nothing to
  configure; installs on btrfs are faster, and this machine's store is on ext4,
  where the behavior is unchanged.
- `engineStrict` now also fails for incompatible engines reachable through an
  optional subtree.

### Git dependencies

Specifiers only name the repository; pnpm resolves GitHub, GitLab, and
Bitbucket over HTTPS and never records SSH URLs. This workspace has no git
dependencies, so no action was needed.

## Nx 24 notes

- Task-based `affected` is the default. This workspace does not call
  `nx affected` in CI, so nothing changed there; `defaultBase` is corrected for
  future use.
- `nx` keeps its `@swc/core` / `@swc-node/register` peer pair, unchanged here.
- Nx Cloud (`nxCloudId` in `nx.json`) continues to work; the local build used
  the cache as before.

## Verification

Run on the upgrade branch:

```bash
pnpm install          # resolves with pnpm 12.16.1
pnpm format:check
pnpm lint
pnpm build            # 47 Nx tasks
pnpm test             # 66 projects
pnpm test:internal
pnpm manifest:check
pnpm docs:links
```

All gates pass.

## Rollback

```bash
git revert <this-commit>
corepack prepare pnpm@11.4.0 --activate
pnpm install
```

The previous lockfile installs under pnpm 12 as well (format 9.0 is unchanged),
so a partial rollback of just the toolchain pin is possible without regenerating
the lockfile.
