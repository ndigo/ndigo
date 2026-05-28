# pnpm 11 Upgrade Migration

**Date:** 2026-05-27  
**Status:** Complete  
**Impact:** Low (configuration only, no source code changes)

## Summary

Upgraded from pnpm 8.15.0 to pnpm 11.4.0. This required changes to three configuration files due to
breaking changes in pnpm 10+ and 11+.

## Changes

### `package.json`

**1. Updated `packageManager` field:**

```diff
- "packageManager": "pnpm@8.15.0",
+ "packageManager": "pnpm@11.4.0",
```

**2. Updated `engines.pnpm` requirement:**

```diff
- "pnpm": ">=8.0.0"
+ "pnpm": ">=11.0.0"
```

**3. Moved `overrides` to root level (pnpm 11 breaking change):**

```diff
- "pnpm": {
-   "overrides": {
-     "braces": ">=2.3.1",
-     "handlebars": ">=4.7.7",
-     "https-proxy-agent": ">=2.2.3"
-   },
-   "patchedDependencies": {}
- }
+ "overrides": {
+   "braces": ">=2.3.1",
+   "handlebars": ">=4.7.7",
+   "https-proxy-agent": ">=2.2.3"
+ }
```

In pnpm 11, the `pnpm.overrides` field is no longer read. Overrides must be at root level.

---

### `.npmrc`

**Removed workspace settings** that moved to `pnpm-workspace.yaml` in pnpm 10+. The following keys
are no longer valid in `.npmrc` and were migrated (pnpm 10 changed from kebab-case `.npmrc` keys to
camelCase `pnpm-workspace.yaml` keys):

```diff
- link-workspace-packages=deep
- prefer-workspace-packages=true
- save-workspace-protocol=rolling
```

A migration comment was left in `.npmrc` pointing to `pnpm-workspace.yaml`.

The remaining `.npmrc` content (hoisting rules, peer dependency settings) is compatible with pnpm 11.

---

### `pnpm-workspace.yaml`

**Added workspace settings** (migrated from `.npmrc`) using camelCase keys:

```yaml
linkWorkspacePackages: deep
preferWorkspacePackages: true
saveWorkspaceProtocol: rolling
```

**Added `onlyBuiltDependencies`** to explicitly allow post-install scripts for packages that require
native compilation. Without this list, pnpm 11 raises `ERR_PNPM_IGNORED_BUILDS` and aborts:

```yaml
onlyBuiltDependencies:
  - '@ast-grep/cli'
  - esbuild
  - msw
  - nx
  - protobufjs
```

---

## Breaking Changes from pnpm 8 → 11

### Configuration Format

| Setting | pnpm 8 location | pnpm 11 location |
| :------ | :-------------- | :--------------- |
| `overrides` | `package.json` under `"pnpm"` key | Root level of `package.json` |
| `link-workspace-packages` | `.npmrc` (kebab-case) | `pnpm-workspace.yaml` (camelCase) |
| `prefer-workspace-packages` | `.npmrc` (kebab-case) | `pnpm-workspace.yaml` (camelCase) |
| `save-workspace-protocol` | `.npmrc` (kebab-case) | `pnpm-workspace.yaml` (camelCase) |

### Build Script Approval

pnpm 10+ requires explicit allowlisting of packages with post-install build scripts. Use either:

```bash
# Interactive approval (one-time, writes to pnpm-workspace.yaml)
pnpm approve-builds

# Or declare directly in pnpm-workspace.yaml
onlyBuiltDependencies:
  - esbuild
  - nx
  # ...
```

Without this, `pnpm install` raises `ERR_PNPM_IGNORED_BUILDS` and exits non-zero.

### Lockfile Incompatibility

The pnpm 8 lockfile format is incompatible with pnpm 11. Regenerate:

```bash
rm pnpm-lock.yaml
pnpm install
```

---

## Migration Path

### For Developers

1. **Update pnpm globally:**

   ```bash
   npm install -g pnpm@latest
   ```

2. **Approve build scripts (one-time interactive):**

   ```bash
   pnpm approve-builds
   # Select all packages that require build scripts, then confirm
   ```

3. **Regenerate lockfile:**

   ```bash
   rm pnpm-lock.yaml
   pnpm install
   ```

4. **Verify:**

   ```bash
   pnpm build
   pnpm test
   ```

5. **Commit:**

   ```bash
   git add pnpm-lock.yaml package.json pnpm-workspace.yaml .npmrc
   git commit -m "chore: upgrade to pnpm 11.4.0"
   ```

### For CI/CD

Update the pnpm install step:

```diff
- npm install -g pnpm@8.15.0
+ npm install -g pnpm@11.4.0
```

Or use corepack:

```bash
corepack enable
corepack install
```

---

## What's New in pnpm 11

- **Enhanced security:** Tarball integrity mismatches fail by default (`--update-checksums` to override)
- **Credential security:** Unscoped auth tokens are URL-scoped at load time to prevent credential leaks
- **Build approval:** Explicit allowlist required for packages with post-install scripts
- **Staged publishing:** New `pnpm stage` command
- **Native commands:** `pnpm pkg`, `pnpm repo`, `pnpm set-script` built-in

---

## Rollback

```bash
git checkout HEAD~1 package.json pnpm-workspace.yaml .npmrc
pnpm install
```

---

## References

- [pnpm 11.0.0 Release Notes](https://github.com/pnpm/pnpm/releases/tag/v11.0.0)
- [pnpm 11.4.0 Release Notes](https://github.com/pnpm/pnpm/releases/tag/v11.4.0)
- [Migrating from v10 to v11](https://pnpm.io/11.x/migration)
- [pnpm Workspace Configuration](https://pnpm.io/pnpm-workspace_yaml)
- [pnpm Configuration](https://pnpm.io/npmrc)
