# TS 6.0 Migration Remediation Plan

This document outlines the steps to resolve critical regressions, type safety risks, and maintainability issues introduced during the TypeScript 6.0 migration.

## 🎯 Objectives

1. **Restore Broken Logic**: Fix the behavioral regressions in `@blue/domain` and `@blue/dispatcher`.
2. **Eliminate "Type Lies"**: Replace dangerous `as unknown as T` casts and unverified `!` assertions with defensive runtime checks.
3. **Stabilize Public API**: Update all consumers of widened return types (`| null` / `| undefined`) to prevent runtime crashes.
4. **Restore Maintainability**: Refactor the bloated `@blue/validate` constraints and fix style violations.

---

## 🛠️ Implementation Strategy: The Remediation Waves

### Wave 1: Critical Regressions (Immediate Priority)

- [x] **Task 1.1: Restore `@blue/domain` Property Delegation**
    - Target: `packages/blue-domain/src/component.ts`
    - Action: Revert the `initializeData` mixin from returning `undefined` to delegating `get` calls to `component.model.get(key, { isolate: true })`.
- [x] **Task 1.2: Restore `RouteHandlerAdapter.supports()`**
    - Target: `packages/blue-dispatcher/src/route-handler-adapter.ts`
    - Action: Re-add the `supports(handler: object): boolean` method to the `RouteHandlerAdapter` interface. Ensure concrete implementations (`MetadataHandlerAdapter`, `ControllerHandlerAdapter`) correctly implement it.

### Wave 2: Type Safety Hardening

- [x] **Task 2.1: Upgrade `like*` Predicates to `unknown`**
    - Target: All `like*` functions across the monorepo.
    - Action: Change signatures from `(value: any) => value is T` to `(value: unknown) => value is T`.
- [x] **Task 2.2: Remediation of "Type Lies" (`as unknown as T`)**
    - Target: High-risk areas (especially `@blue/context` and `@blue/boot`).
    - Action: Replace `null as unknown as T` with `T | null` where possible. Implement defensive runtime checks before casting.
- [x] **Task 2.3: Audit Non-Null Assertions (`!`)**
    - Target: All class fields marked with `!`.
    - Action: Verify guaranteed assignment paths. Replace `!` with optional chaining or explicit null checks if not guaranteed.

### Wave 3: API Stability & Consumer Updates

- [x] **Task 3.1: Call-Site Audit for Widened Returns**
    - Target: Consumers of 15+ methods (e.g., `RingBuffer.get()`, `ViewResolver.resolveViewName()`).
    - Action: Implement explicit null/undefined checks at each call site.
- [x] **Task 3.2: Update Migration Documentation**
    - Target: `docs/migrations/`
    - Action: Document return type changes as breaking changes.

### Wave 4: Maintainability & Style

- [x] **Task 4.1: Refactor `@blue/validate` Constraints**
    - Target: `packages/blue-validate/src/standard-constraints.ts`
    - Action: Create a `createConstraint` helper to reduce boilerplate.
- [x] **Task 4.2: Style & Convention Cleanup**
    - Target: `packages/blue-core/src/comparable.ts` (Import order) and `packages/blue-dispatcher/test/...` (`APIController` naming).
    - Action: Move imports to top; rename `ApiController` $\rightarrow$ `APIController`.

---

## 📋 Verification Plan

1. **Compilation Gate**: `pnpm build` must remain clean.
2. **Test Gate**: `pnpm test` must pass.
3. **Architecture Gate**: Final `architecture-reviewer` pass.
4. **Lint Gate**: `pnpm lint` for style compliance.
