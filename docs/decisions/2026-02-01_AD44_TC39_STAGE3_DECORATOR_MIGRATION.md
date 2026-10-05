# AD-44: Migrate decorators from legacy TypeScript to TC39 Stage 3

**Date:** 2026-02-01
**Status:** Accepted — implemented 2026-02-02 (phases 1–5)

## Context

BlueJS used legacy TypeScript `experimentalDecorators` with `reflect-metadata`.
TypeScript marks these legacy decorators deprecated, and `reflect-metadata` is a
separate runtime dependency. The framework's 16 decorators (across 5 packages)
had to move to the TC39 Stage 3 standard to stay compatible with future
TypeScript versions, access decorator context/`addInitializer`, and drop
the `reflect-metadata` dependency.

## Evidence

- Plan `docs/plans/2026-02-01_DECORATOR_MIGRATION.md` records the 16-decorator
  inventory and package-by-package phases: `@pattern` (blue-validate),
  `@configuration`/`@profile`/`@property`/`@propertySource`/`@entry`
  (blue-context), `@routeMapping`/`@errorMapping`/`@errorHandler`/route-params
  (blue-dispatcher), `@scope`/`@singletonScope`/`@prototypeScope`/`@hashScope`
  (blue-factory), `@viewMapping`/`@tagMapping` (blue-view-webcomponent).
- Migration landed 2026-02-02: `913a75bf` validate `@Pattern` (Phase 1),
  `4f298618` context configuration decorators (Phase 2), `bdfcf0e8` dispatcher
  (Phase 3), `d098c556` MetadataManager, `08987919` factory scope decorators.
- **Verified in the tree today (2026-10-04):** `packages/blue-context/src/configuration.ts`
  implements decorators against TC39 context objects — `context: ClassDecoratorContext`,
  `ClassMethodDecoratorContext`, `ClassFieldDecoratorContext` — and imports
  `@tsmetadata/polyfill` (Symbol.metadata polyfill); metadata is read via
  `getMetadata(target)` off `Symbol.metadata`. The TC39 signature is explicit:
  `configuration<T extends new (...args) => unknown>(target, context: ClassDecoratorContext): T`.
  `@entry()` (`entry(nameOrTarget?): EntryDecorator`) is a method decorator.
- Both are public: `packages/blue-context/src/index.ts:9` `export * from './configuration'`.
- Consumers decorating sources today include `packages/blue-context/src/schema-config.ts`,
  `packages/blue-boot/src/application.ts`, `packages/blue-platform-node/src/node-auto-configuration.ts`.
- No `reflect-metadata` import and no `experimentalDecorators` in any
  `packages/*/tsconfig*.json` (grep, 2026-10-04) — legacy path fully removed.

## Decision

- D-1 Adopt TC39 Stage 3 decorators standard (not legacy
  `experimentalDecorators`) across all packages that use decorators.
- D-2 Replace `reflect-metadata` with `@tsmetadata/polyfill` and read/write
  metadata through `Symbol.metadata`.
- D-3 Standardize decorator naming to camelCase `@entry()`-style factories.
- Deferred: none recorded — the plan's final status is COMPLETE; the only
  still-listed package, `@blue/validate`, was later retired wholesale by AD-07.

## Consequences

- All packages migrated independently via per-package tsconfig overrides;
  `packages/blue-context/src/configuration.ts` is the illustrative decorated
  surface (`@configuration`, `@entry`, `@property`, `@profile`,
  `@propertySource`, `@defaultValue`, `@nested`).
- No `reflect-metadata` dependency remains in any package.

## References

- Plan: `docs/plans/2026-02-01_DECORATOR_MIGRATION.md`
- Implementation: `packages/blue-context/src/configuration.ts`, commits
  `913a75bf`, `4f298618`, `bdfcf0e8`, `d098c556`, `08987919` (2026-02-02)
- Related: [AD-07](2026-09-05_AD07_ZOD_VALIDATION.md) (retired `@blue/validate`)

## Revisit Trigger

Revisit if TypeScript's TC39 decorator implementation diverges from the
standard (e.g. experimental `Symbol.metadata` details) or if a decorator
pattern (property-accessor or static-block) needs the polyfill's gap closed.
