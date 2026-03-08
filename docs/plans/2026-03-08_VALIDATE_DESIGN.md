# 2026-03-08 Validate Design

## Objective

Define the next-step architecture for `@blue/validate` as a Layer 2 infrastructure package that:

1. preserves BlueJS integration-layer boundaries,
2. supports validation across form, domain, and service inputs,
3. allows future backing-library swaps without consumer breakage.

---

## Captured Integration Philosophy

This plan formalizes the current BlueJS philosophy discussed during package sequencing work:

1. **Integrate or write**: BlueJS may use open-source libraries, but consumers should primarily interact with Blue APIs.
2. **Encapsulation over leakage**: Integration-layer packages (`@blue/util`, `@blue/parser`, `@blue/model`) shield higher layers from direct third-party coupling.
3. **Pragmatic exception at the View layer**: Rendering engines (React/Lit/etc.) are not worth fully hiding due to integration cost and low architectural gain.
4. **Potential future `@blue/util` split**: core-vs-extended utility API is a valid future evaluation, but explicitly out of scope for this phase.

Applied to `@blue/validate`: Blue should expose a stable validation interface while retaining freedom to implement with internal logic and/or an encapsulated backing library.

---

## Research Summary

### Spring Validation Model (Reference)

Spring combines **Jakarta Bean Validation** (spec) with **Hibernate Validator** (implementation) and framework orchestration (`@Valid`, `@Validated`, groups, composed constraints).

Relevant takeaways for BlueJS:

- Keep a **stable validation contract** while allowing multiple implementations.
- Support **constraint composition** (reusable higher-level constraints).
- Support **contextual validation sets** (group-like scenarios for create/update/process variants).
- Keep validation usable across layers rather than tying it to one transport mechanism.

### TypeScript Library Landscape

| Library | Strengths | Risks | Fit for Encapsulated Blue API |
| :------ | :-------- | :---- | :---------------------------- |
| Zod | Mature ecosystem, strong TS ergonomics, sync/async parse | Bigger footprint than smaller alternatives | Strong candidate for adapter backend |
| Yup | Mature and familiar | Larger bundle, weaker modern TS ergonomics | Secondary candidate |
| Valibot | Small, modular, tree-shake friendly | Smaller ecosystem | Strong candidate when size/perf prioritized |
| ArkType | Advanced type-level expressiveness | Niche API, lower familiarity | Experimental candidate |

No option should be exposed directly to consumers of non-integration packages.

---

## Current `@blue/validate` Assessment

### Strengths

- Broad existing constraint/type catalog (`standard-constraints.ts`, `standard-types.ts`).
- Existing `Type` + `TypeValidator` workflow and tests.
- Existing format rule library (`formats.ts`) and custom error types.

### Gaps

- `src/types.ts` contains unresolved TODO around custom type source.
- `src/constraints.ts` contains unresolved TODO around custom constraint source.
- Legacy typing is loose in core paths (`any`-heavy surfaces).
- Decorator behavior is currently dev-only/non-blocking (`console.error` side effect).
- Multiple tests are skipped, indicating unfinished behavior/contracts.

### Architectural Risk

Current design is useful but incomplete as a long-term integration layer because extension points and backend strategy are implicit, not explicit.

---

## Design Goals for the Next Revision

1. **Layer-agnostic use**: Validate form payloads, domain objects, and service inputs with the same core API.
2. **Stable Blue contract**: Preserve Blue-facing API independent of backend implementation choice.
3. **Explicit extension points**: First-class APIs for registering constraints/types.
4. **Composable constraints**: Preserve/expand existing composition model.
5. **Sync + async paths**: Clear support for synchronous predicates and async validation workflows.
6. **Migration-friendly**: Incremental path from current `Type`/`TypeValidator` behavior.

---

## Proposed Architecture (Recommended)

### 1) Blue-First Validation Core

Retain a Blue-native core contract:

- `Constraint`
- `TypeDefinition`
- `ValidationResult`
- `Validator`

Add explicit registration and composition APIs:

- `registerConstraint(name, constraint)`
- `registerType(name, definition)`
- `hasConstraint(name)` / `hasType(name)`

### 2) Backend Adapter Boundary

Introduce an internal adapter boundary for optional library-backed execution:

- `ValidationBackendAdapter` (internal abstraction)
- default backend: Blue native constraints/types
- optional backend: adapter over Zod/Valibot/etc.

Consumer packages continue importing only from `@blue/validate`.

### 3) Constraint Groups (Spring-Inspired)

Add optional group-like support for contextual validation (e.g. create/update/auth-flow), without hard-linking to any framework layer.

### 4) Decorator Strategy

Keep decorators as a thin metadata layer over the same validation core. Avoid diverging decorator-only semantics.

---

## Viable Implementation Tracks

### Track A: Blue-Native First (No external backend in first increment)

- Resolve TODOs and formalize registration APIs.
- Improve type safety and error contract.
- Unskip/fix behavior in existing test suite.
- Add grouped/contextual validation support.

**Pros:** lowest adoption risk, preserves existing behavior.
**Cons:** slower path to leveraging mature external schema ecosystems.

### Track B: Adapter-Ready Increment + Pilot Backend

- Do Track A foundation.
- Add internal adapter boundary.
- Pilot one backend (Zod **or** Valibot) behind Blue contract.

**Pros:** validates future portability early.
**Cons:** more moving parts in the first redesign increment.

### Recommendation

Use **Track B** with an incremental rollout:

1. foundation hardening,
2. adapter boundary,
3. one pilot backend behind feature-flag/config-level opt-in.

---

## Proposed Backend Pilot Decision Criteria

If the pilot backend is selected now:

- choose **Zod** if ecosystem/tooling compatibility is top priority,
- choose **Valibot** if bundle size/modularity is top priority.

Both remain implementation details of `@blue/validate`.

---

## Approval Gate (Before Implementation)

Implementation should begin only after explicit approval on:

1. **Track selection** (A vs B; recommendation B),
2. **pilot backend choice** (Zod vs Valibot vs defer),
3. **decorator semantics** (non-blocking feedback vs blocking validation behavior),
4. **group model** (naming and API shape for contextual validation sets).

---

## Immediate Next Steps

1. Finalize approval decisions listed above.
2. Draft `@blue/validate` API delta proposal (old vs new surfaces).
3. Implement foundation hardening in small commits with test re-activation.
4. Add adapter boundary and optional backend pilot.
5. Update package README and migration notes once implementation lands.
