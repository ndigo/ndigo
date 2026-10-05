# AD-02: `@blue/domain` vs `@blue/model` reconciliation — optional MVVM layer over a pure model

**Date:** 2026-05-27
**Status:** Accepted — ratified with the Wave roadmap; implemented Wave 5
(2026-05-28); **superseded by AD-07 (2026-09-05)** — `blue-model` retired,
`blue-domain` archived, validation unified on Zod.

## Context

Two packages overlapped: `@blue/model` (validation/data shapes, built on
the objectmodel integration) and `@blue/domain` (component layer,
`GenericDomainComponent.validate()` throwing `Method not implemented` —
explicitly awaiting this decision). Without a reconciliation, constraint
logic risked being duplicated across both, and view-models had no defined
source.

## Evidence

- `GenericDomainComponent.validate()` was the blocking stub — the decision
  was awaited before Wave 5 could land.
- Wave 5 implemented the domain layer 2026-05-28: validate/destroy
  lifecycle, domain decorators, `ClassValidation` type exports
  (`b05a8dce`).
- AD-07 (2026-09-05) retired `blue-validate` + `blue-model` (objectmodel:
  no static type inference, `as any` surface, Proxy instances fighting the
  signals value model), migrated `blue-domain` value objects to Zod, and
  archiving `blue-domain` the same day (`2f014abc`,
  `06c51978`). The MVVM layer itself was not carried forward — the
  signals/islands view story (AD-19, AD-03) replaced it.

## Decision

- **`@blue/domain` is an optional MVVM layer** depending on `@blue/model`
  for validation and `@blue/context` for event emission.
- **`@blue/model` stays pure** — validation/data shape only. No actions,
  no lifecycle.
- A domain component is "model + actions + lifecycle"; Web Component
  view-models _project from_ domain components; future adapters (React,
  Lit) back against the same domain component.

## Consequences

- Wave 5 shipped the domain component lifecycle against `blue-model`
  constraints (2026-05-28).
- The reconciliation was superseded within one 1.0 cycle: AD-07 unified
  validation on Zod, deleting both `blue-model` and `blue-validate`, and
  the domain layer was archived 2026-09-05. This ADR records the
  intermediate decision and why it was replaced — the "pure data shape
  below, behavior above" split survives in the AD-07 derived-schema design
  (`@blue/orm` entity metadata → Zod schema = single source of truth).

## References

- Roadmap: `docs/plans/2026-05-27_FEATURE_COMPLETENESS_ROADMAP.md` (AD-02)
- Wave 5 implementation: commit `b05a8dce` (2026-05-28)
- Supersession: [AD-07 Zod canonical schema](2026-09-05_AD07_ZOD_VALIDATION.md)
- Domain archive: commit `2f014abc` (2026-09-05); validation retirement
  `06c51978` (2026-09-05)

## Revisit Trigger

Revisit if a framework-level MVVM/domain-component seam is requested by a
consumer — the historical design (model + actions + lifecycle, projected
view-models) would be rebuilt on Zod schemas and signals, not on
`blue-model`/objectmodel.
