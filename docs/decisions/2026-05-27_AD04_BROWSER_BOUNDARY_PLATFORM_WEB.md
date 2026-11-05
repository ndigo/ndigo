# AD-04: Browser-only code lives in `@ndigo/platform-web` — enforced by lint rule

**Date:** 2026-05-27
**Status:** Accepted — ratified with the Wave roadmap; rule shipped Wave 2
straggler (2026-05-28); still enforced (migrated to `@ndigo/oxlint-plugin`
2026-08).

## Context

Isomorphic-core packages (`@ndigo/router`, `@ndigo/dispatcher`, `@ndigo/view`,
`@ndigo/context`, `@ndigo/content`) must run on Node and in the browser.
Browser-only globals (`window`, `document`, `navigator`, `HTMLElement`,
`history`) smuggled into them break Node consumers at import time — the
isomorphic-core principle (architecture roadmap §1) had no mechanical
enforcement.

## Evidence

- Rule `@ndigo/no-browser-globals-in-isomorphic` shipped 2026-05-28 in
  `@ndigo/eslint-plugin` (`e043ece3`, "Wave 2 straggler"), migrated to
  `@ndigo/oxlint-plugin` during the OXC toolchain migration (2026-08,
  `packages/ndigo-oxlint-plugin/src/rules/no-browser-globals-in-isomorphic.ts`),
  with `RuleTester` coverage
  (`packages/ndigo-oxlint-plugin/test/rules/no-browser-globals-in-isomorphic.spec.ts`).
- Browser-only implementations live in `@ndigo/platform-web`:
  `browser-router.ts`, `hash-router.ts` (each carrying the rule's
  `eslint-disable` comment — globals are intentional there),
  `online-reconnect-trigger.ts` (AD-01's offline detection, cited in the
  file header as the AD-04 boundary).

## Decision

- Audit and migrate browser-only globals from isomorphic-core packages
  into `@ndigo/platform-web`.
- Enforce with a dedicated lint rule
  (`no-browser-globals-in-isomorphic`) so the boundary stays mechanical,
  not habitual.

## Consequences

- Isomorphic packages import-clean on Node; `ndigo-platform-web` is the
  single home for browser-global code.
- The rule survives the ESLint → oxlint migration and is part of the
  enforced gate (`pnpm lint --deny-warnings`).
- Boundary arbitration is now a lint decision: any new browser-global use
  in isomorphic code fails CI; escapes are per-file comments with recorded
  rationale.

## References

- Roadmap: `docs/plans/2026-05-27_FEATURE_COMPLETENESS_ROADMAP.md` (AD-04)
- Rule: `packages/ndigo-oxlint-plugin/src/rules/no-browser-globals-in-isomorphic.ts`
  (origin: `@ndigo/eslint-plugin`, commit `e043ece3`)
- Browser surface: `packages/ndigo-platform-web/src/browser-router.ts`,
  `hash-router.ts`, `online-reconnect-trigger.ts`
- Cross-reference: [AD-22](2026-09-15_AD22_WEBSOCKET_CLIENT.md) (isomorphic
  socket client placed by this boundary)

## Revisit Trigger

Revisit if an isomorphic package legitimately needs browser-global access —
the escape hatch is the per-file documented `eslint-disable`, and the rule
design keeps that deliberate and visible.
