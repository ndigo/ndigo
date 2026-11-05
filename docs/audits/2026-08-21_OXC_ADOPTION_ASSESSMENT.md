# OXC Adoption Assessment

**Date:** 2026-08-21
**Status:** Complete
**Scope:** Assess the current state of OXC tool adoption in the ndigo monorepo, identify what's broken, and fix critical issues.

---

## 1. Executive Summary

The ndigo monorepo has partially adopted OXC tools. **oxlint** is configured as the primary linter and is installed as a devDependency. The `@ndigo/eslint-plugin` was migrated to use oxlint's `eslintCompatPlugin` API for dual compatibility. However, the migration was **incomplete and broken** — `pnpm lint` crashed on startup and 14 of 21 plugin tests failed.

**Critical bugs found and fixed:**

| Bug                 | Symptom                                                                 | Root Cause                                                                      | Fix                                                          |
| ------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `pnpm lint` crashes | `TypeError: Cannot set properties of undefined (setting 'recommended')` | `plugin.configs` was `undefined` because `eslintCompatPlugin` doesn't create it | Initialize `configs` inside the plugin object after creation |
| 14 tests fail       | `Cannot access context.filename in createOnce`                          | Rules used `createOnce` API which explicitly blocks `context.filename`          | Switched to `create` API for rules that need filename        |

**Pre-existing issues (not caused by OXC migration):**

- `@ndigo/view` package has uncommitted changes with 11 build errors
- `@ndigo/view/test/content-negotiation.spec.ts` has a parse error caught by oxlint
- 100+ lint warnings across the codebase (unused vars, no-useless-escape, etc.)

---

## 2. What Was Adopted

### 2.1 oxlint (Linting) — ✅ Working (after fixes)

- **Package:** `oxlint@^1.78.0` in root `devDependencies`
- **Config:** Root `.oxlintrc.json` with ignore patterns, JS plugin, rules, env, globals, and overrides
- **Script:** `"lint": "oxlint ."` in root `package.json`
- **Plugin:** `@ndigo/eslint-plugin` using `@oxlint/plugins` `eslintCompatPlugin` API
- **Custom rules:** 4 rules migrated to oxlint-compatible format:
    - `no-direct-integration-imports` — blocks direct imports from encapsulated libraries
    - `no-internal-file-imports` — blocks cross-package imports of underscore-prefixed files
    - `no-internal-file-exports` — blocks re-exporting internal files from public API
    - `no-browser-globals-in-isomorphic` — flags unguarded browser globals in isomorphic code

### 2.2 @oxlint/plugins — ✅ Working (after fixes)

- **Package:** `@oxlint/plugins@^1.78.0` in `@ndigo/eslint-plugin` dependencies
- **API:** `eslintCompatPlugin` wraps rules for dual ESLint/oxlint compatibility
- **Test framework:** `oxlint/plugins-dev` provides `RuleTester` for testing custom rules

### 2.3 What Was NOT Adopted

| Tool              | Status           | Reason                                                                   |
| ----------------- | ---------------- | ------------------------------------------------------------------------ |
| **oxfmt**         | ❌ Not attempted | No configuration files found. Prettier remains the formatter.            |
| **oxc-transform** | ❌ Not attempted | No configuration or dependencies found. `tsc -b` remains the build tool. |
| **oxc-resolver**  | ❌ Not attempted | No configuration or dependencies found.                                  |
| **oxc-minifier**  | ❌ Not attempted | Not applicable (library, not app).                                       |

---

## 3. What Was Broken (and Fixed)

### 3.1 Bug 1: `plugin.configs` undefined (CRITICAL — blocked all linting)

**Error:**

```
Failed to load JS plugin: ./packages/ndigo-eslint-plugin/lib/index.js
TypeError: Cannot set properties of undefined (setting 'recommended')
    at file:///.../packages/ndigo-eslint-plugin/lib/index.js:31:28
```

**Root Cause:** The `eslintCompatPlugin` function from `@oxlint/plugins` returns the plugin object as-is. The `Plugin` type only defines `meta` and `rules` — it does not include `configs`. The code then tried to set `plugin.configs.recommended = { ... }` but `plugin.configs` was `undefined`.

**Fix:** Initialize `configs` after plugin creation using a type-safe cast through `unknown`:

```typescript
(plugin as unknown as Record<string, unknown>).configs = {
    recommended: { ... }
};
```

### 3.2 Bug 2: `context.filename` in `createOnce` (CRITICAL — 14/21 tests failed)

**Error:**

```
Error: Cannot access `context.filename` in `createOnce`
```

**Root Cause:** Three rules (`no-direct-integration-imports`, `no-internal-file-exports`, `no-browser-globals-in-isomorphic`) used the `createOnce` API and accessed `context.filename`. The oxlint `createOnce` API explicitly blocks `context.filename` — it throws an error. This is by design: `createOnce` is called once for all files, so per-file state like `filename` is not available.

**Fix:** Switched these three rules from `createOnce` to `create` API. The `create` API supports `context.filename` and is the standard ESLint-compatible API. The `no-internal-file-imports` rule doesn't use `context.filename` and continues to use `createOnce`.

### 3.3 Pre-existing: `@ndigo/view` build errors

The `@ndigo/view` package has uncommitted changes with 11 TypeScript errors:

- `IllegalStateError` not imported in `view.ts`
- `_projectViewModel` doesn't exist on `AbstractTemplateView`
- `_renderTemplate` signature mismatch
- `StringTemplateView` doesn't implement abstract `_renderView`
- `content-negotiation-view-resolver.ts` has property access and instanceof errors

These are **not related to the OXC migration** and were present before this assessment.

---

## 4. Current State

### 4.1 What Works

| Component                                       | Status                                               |
| ----------------------------------------------- | ---------------------------------------------------- |
| `pnpm lint` (oxlint)                            | ✅ Runs. Loads JS plugin. Reports warnings + errors. |
| `@ndigo/eslint-plugin` build                    | ✅ Compiles with `tsc -b`                            |
| Plugin tests (21 tests)                         | ✅ All pass                                          |
| Custom rule: `no-internal-file-imports`         | ✅ Working (uses `createOnce`, no filename needed)   |
| Custom rule: `no-direct-integration-imports`    | ✅ Working (uses `create`, filename available)       |
| Custom rule: `no-internal-file-exports`         | ✅ Working (uses `create`, filename available)       |
| Custom rule: `no-browser-globals-in-isomorphic` | ✅ Working (uses `create`, filename available)       |

### 4.2 What Needs Attention (Pre-existing, Not OXC-Related)

| Issue                                                | Location                                               | Severity                    |
| ---------------------------------------------------- | ------------------------------------------------------ | --------------------------- |
| 11 TypeScript build errors                           | `packages/ndigo-view`                                  | 🔴 Blocks full `pnpm build` |
| 1 oxlint parse error                                 | `packages/ndigo-view/test/content-negotiation.spec.ts` | 🔴 Blocks clean `pnpm lint` |
| 100+ lint warnings                                   | Across codebase                                        | 🟡 Should triage            |
| No tests for `no-browser-globals-in-isomorphic` rule | `packages/ndigo-eslint-plugin/test/rules/`             | 🟡 Missing test coverage    |

---

## 5. Recommendations

### 5.1 Immediate (Done)

- ✅ Fix `plugin.configs` initialization in `@ndigo/eslint-plugin/src/index.ts`
- ✅ Fix `createOnce` → `create` for rules needing `context.filename`

### 5.2 Short-Term

1. **Fix `@ndigo/view` build errors** — These are pre-existing uncommitted changes that block `pnpm build`. Either commit or revert them.
2. **Fix `@ndigo/view/test/content-negotiation.spec.ts`** — oxlint reports a parse error here.
3. **Add tests for `no-browser-globals-in-isomorphic`** — This rule has no test coverage.
4. **Triage lint warnings** — 100+ warnings across the codebase. Start with `error`-level issues, then `warning`-level.

### 5.3 Medium-Term (Per OXC Migration Plan)

1. **Enable `erasableSyntaxOnly` in tsconfig** — Phase 1 of the migration plan. Makes the codebase transform-safe.
2. **Expand oxlint rule coverage** — Enable `correctness` category rules. Currently only custom rules are enforced.
3. **Remove dead ESLint config** — `eslint.config.mjs` is unused (oxlint is the linter). Remove to avoid confusion.
4. **Evaluate oxc-transform for build** — Phase 4 of the plan. Requires decorator spike first.

### 5.4 Not Recommended (Per Plan)

- ❌ **oxfmt** — Prettier works fine. No bottleneck.
- ❌ **oxc-resolver** — No consumer in current stack.
- ❌ **Replace Vitest** — No OXC test runner exists.
- ❌ **Replace tsc type-checking** — OXC cannot type-check.

---

## 6. Files Modified

| File                                                                         | Change                                                                 |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `packages/ndigo-eslint-plugin/src/index.ts`                                  | Initialize `configs` after plugin creation; remove `version` from meta |
| `packages/ndigo-eslint-plugin/src/rules/no-direct-integration-imports.ts`    | `createOnce` → `create`                                                |
| `packages/ndigo-eslint-plugin/src/rules/no-internal-file-exports.ts`         | `createOnce` → `create`                                                |
| `packages/ndigo-eslint-plugin/src/rules/no-browser-globals-in-isomorphic.ts` | `createOnce` → `create`                                                |
