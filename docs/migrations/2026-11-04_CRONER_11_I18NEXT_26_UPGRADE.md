# croner 11 and i18next 26 Upgrade

**Date:** 2026-11-04
**Status:** Complete
**Impact:** Low (two runtime dependencies, one behaviour change each)

## Summary

| Package   | From      | To        | Used by                  |
| :-------- | :-------- | :-------- | :----------------------- |
| `croner`  | `^10.0.1` | `^11.0.0` | `@ndigo/scheduler`       |
| `i18next` | `^24.2.3` | `^26.7.1` | `@ndigo/content-i18next` |

Both are runtime dependencies of a single package each, and neither is in the
workspace catalog — the ranges live in the packages' own manifests:

```diff
 // packages/ndigo-scheduler/package.json
-    "croner": "^10.0.1"
+    "croner": "^11.0.0"

 // packages/ndigo-content-i18next/package.json
-    "i18next": "^24.2.3"
+    "i18next": "^26.7.1"
```

## croner 11 — daylight-saving semantics

croner 11 aligns DST behaviour with croner-rust and Vixie cron, deviating from
OCPS 1.4 §4.3.1. Patterns are now classified as **fixed-time jobs** (one value
each for second, minute and hour) or **interval jobs** (more than one value in
any of those fields), and the two are handled differently across a transition.

Measured against both versions with the same probe (Europe/Paris, 2026):

| Scenario                                       | croner 10           | croner 11             |
| :--------------------------------------------- | :------------------ | :-------------------- |
| `0 30 2 * * *` in the spring-forward gap       | 03:30 local         | 03:00 local           |
| `0 0,30 2 * * *` scoped to the skipped hour    | fires 03:00 / 03:30 | does not fire         |
| `0 0,30 * * * *` across the fall-back overlap  | skips the repeat    | runs both occurrences |
| `0 30 2 * * *` (fixed-time) across the overlap | first occurrence    | first occurrence      |
| `0 0 ? * MON` (day-of-week `?`)                | ran daily (bug)     | runs on Mondays       |

`@ndigo/scheduler` only constructs `new Cron(expression, { timezone })` and
calls `nextRun(reference)` — none of the options whose semantics changed
(`startAt`, `dayOffset`, `enumerate`, `previousRun`) are used, so no source
change was needed. The DST outcomes above are user-visible, so they are pinned
by three new specs in `packages/ndigo-scheduler/test/schedule.spec.ts` and
recorded in the changelog; the scheduling guide makes no DST promise that would
need rewording.

## i18next 26 — the `initImmediate` removal

i18next 26 removes the `initImmediate` → `initAsync` compatibility alias (kept
since v24), so the adapter's synchronous-init call had to be renamed:

```diff
-        // initImmediate: false + static resources make getMessage available
+        // initAsync: false + static resources make getMessage available
         void this.instance
             .init({
                 returnEmptyString: false,
-                initImmediate: false,
+                initAsync: false,
```

That is the only source change: the adapter's remaining surface (`createInstance`,
`t`, `changeLanguage`, `getFixedT`, `language`) is stable across 24 → 26, and it
does not touch the other removals in 26 (`interpolation.format`,
`showSupportNotice`, `simplifyPluralSuffix`).

**Verified, not assumed.** i18next 25 changed language matching
(`changeLanguage` always resolves through `getBestMatchFromCodes`, which now
falls back to a code with the same script). Running the adapter's init options
against 24.2.3 and 26.7.1 side by side gives identical outcomes for `fr`,
`fr-CA`, `FR`, `en-GB`, `de` and `getFixedT('fr-CA')` — region-qualified and
case-variant codes still resolve to the base language, and unknown codes still
fall back to the configured fallback language (all 11 adapter specs stay green).

## Verification

| Gate                         | Result     |
| :--------------------------- | :--------- |
| `pnpm typecheck`             | pass       |
| `pnpm test` (108 nx targets) | 108 passed |
| `pnpm test:bench`            | 70 passed  |
| `pnpm lint` / `pnpm build`   | pass       |
| `pnpm manifest:check`        | pass       |

`@ndigo/scheduler` (77 specs, including the three new DST specs) and
`@ndigo/content-i18next` (11 specs) were run directly against the new versions
before the full sweep.

## Follow-ups

- `@ndigo/content-i18next` exposes i18next types (`i18n`, `TFunction`) through
  its public surface while keeping `i18next` a hard dependency. If a consumer
  ever needs to share one i18next instance with the adapter, that edge should
  become a `peerDependencies` entry — a design decision, not a version bump.
- `@libsql/client` 0.18 remains the last held bump (0.x breaking change).
