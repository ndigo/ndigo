# AD-52: An encapsulated validation contract with a pluggable backing backend

> **Archived** — this decision is fully superseded and retained for history. See the superseding ADR linked below.

**Date:** 2026-03-08
**Status:** Superseded — superseded by AD-07
[AD-07](../2026-09-05_AD07_ZOD_VALIDATION.md) (2026-09-05); the packages it
governed (`ndigo-validate`, `ndigo-model`) were deleted 2026-09-05.

## Context

`@ndigo/validate` was a Layer 2 infrastructure package holding a
constraint/decorator catalog (`standard-constraints.ts`, `standard-types.ts`,
`formats.ts` plus `Type`+`TypeValidator`) that was useful but incomplete:
`src/types.ts` and `src/constraints.ts` carried unresolved TODO around custom
type/constraint source, legacy typing was `any`-heavy, decorator behavior was
dev-only/non-blocking (`console.error` side effect), and several tests were
skipped. The plan formalized ndigo's encapsulation philosophy (consumers
interact with Ndigo APIs, never a backing library directly) and asked whether
an external schema library should back validation. This direction was later
superseded wholesale: 2026-09-05, Zod replaced the constraint/decorator
system and `ndigo-validate`/`ndigo-model` were retired (AD-07). This ADR records
the earlier design as history.

## Evidence

- Plan: `docs/plans/2026-03-08_VALIDATE_DESIGN.md` — the full research
  summary, proposed architecture, Track A/B comparison, and the
  "Approved Decisions (2026-03-08)" gate.
- Current tree: neither `packages/ndigo-validate` nor `packages/ndigo-model`
  exists; retired 2026-09-05 in commit `06c51978`
  (`refactor(validation): retire ndigo-validate + ndigo-model (AD-07 step 6)`),
  verified via `git log --diff-filter=D -- packages/ndigo-validate/package.json
  packages/ndigo-model/package.json`.
- Zod became, and remains, the canonical runtime-schema primitive — no
  constraint/decorator `Validator` surface exists today.

## Decision

- **D-1 — Ndigo-native core first:** retain `Constraint`, `TypeDefinition`,
  `ValidationResult`, `Validator` plus explicit registration/composition
  APIs (`registerConstraint`, `registerType`, `hasConstraint`, `hasType`).
- **D-2 — backend adapter boundary (Track B, approved):** an internal
  `ValidationBackendAdapter` so the Ndigo contract stays stable while the
  backend may be Ndigo-native or a wrapped library; consumers import only
  from `@ndigo/validate`.
- **D-3 — pilot backend:** **Zod** chosen over Valibot/ArkType/Yup for
  ecosystem/tooling compatibility (Valibot deferred where size/perf is
  prioritized).
- **D-4 — decorator semantics:** blocking by default, configurable
  non-blocking mode (approved gate).
- **D-5 — contextual validation groups:** Symbol/enum groups for
  create/update/process variants, principles-inspired, not bound to any
  framework layer.
- **D-6 — incremental rollout:** foundation hardening → adapter boundary →
  one pilot backend behind feature-flag opt-in.
- **Rejected/deferred:** `@ndigo/util` core-vs-extended split was explicitly
  out of scope; Track A alone was set aside in favor of Track B.

## Supersession

AD-07 (2026-09-05) adopted Zod (v4) as the single runtime-schema primitive
and retired `ndigo-validate`'s constraint/decorator system, its `Validator`/
`createTypeValidator`/`@validated`, the native backend, and `ndigo-model`/
objectmodel. Constraint composition and grouping survive conceptually as Zod
refinements and composition; the adapter boundary became unnecessary because
Zod is no longer hidden but is the public primitive. The `ndigo-orm` entities
retained decorator annotations, with validation **derived** from them via a
per-entity Zod schema (`entity-schema.ts`, AD-07).

## Consequences

- `ndigo-validate` gained an explicit extension-point and adapter design and
  a Zod pilot — the seed of the later Zod adoption.
- When Zod became canonical, the entire constraint registry, standalone
  constraint decorators, `Validator`/`createTypeValidator`, `@validated`,
  and the native backend were deleted; `ndigo-model` (objectmodel
  integration) and its `basic.ts` primitive models were deleted.
- Consumers (`ndigo-domain` value objects, `ndigo-orm` entity validation,
  `ndigo-platform-web` route params) migrated to schema-first Zod.

## References

- Plan: `docs/plans/2026-03-08_VALIDATE_DESIGN.md`
- Deletion: commit `06c51978` (2026-09-05), `--diff-filter=D` on
  `packages/ndigo-validate/` and `packages/ndigo-model/`
- Superseding: [AD-07](../2026-09-05_AD07_ZOD_VALIDATION.md)

## Revisit Trigger

Revisit only if a requirement emerges that a canonical Zod schema cannot
express (e.g. class-instance identity or a decorator API a specific consumer
must retain); otherwise the constraint/decorator era is closed history.
