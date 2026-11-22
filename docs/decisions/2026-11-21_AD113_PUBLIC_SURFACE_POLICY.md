# AD-113: Public surface policy — internal non-usage is not a removal criterion

**Date:** 2026-11-21
**Status:** Accepted
**See also:** AD-46 (internal file export convention), AD-112; #605–#632 (core contract migration)
**Refs:** #632 (this decision)

---

## Context

A survey of `@ndigo/core`'s public exports found several symbols with no
in-package consumer: `likeComparable`, `likeComparator`, `likeSerializable`,
`likeConstructable`, `likePropertyValues`, `matchAny`, `matchNot`,
`WildcardConverter`, `SpecificityComparator`, and `naturalComparison` are
exported from `src/index.ts` but not referenced elsewhere in the monorepo.

The naive reading — "unused export, delete it" — would shrink the public
surface. But the monorepo is _one_ consumer of a _published_ package. An export
with no internal caller is not evidence of uselessness; it is evidence that the
internal code does not happen to need that capability today. Downstream users
may. Removing it is a breaking change for them and is not justified by internal
non-usage alone.

The same survey found a handful of public exports with no spec: the ten
symbols above. The defect there is not that they exist, but that they are
untested. "Untested public API" is the real problem — it leaves the contract
unpinned and lets regressions land silently.

## Decision

### D-1 — Internal non-usage is not a removal criterion

A published package's export list is a product surface. The monorepo is one
consumer of it. The criterion for keeping or removing a public symbol is:

> Does the symbol have a documented, tested, non-overlapping contract?

Removal is justified **only** when (a) two public symbols do the same job,
creating user-facing ambiguity, or (b) an internal helper leaked into
`index.ts` accidentally. Neither applies to the current list. Each of the ten
symbols above has a distinct contract and stays.

### D-2 — Untested public API is the defect

The ten untested exports (`likeComparable`, `likeComparator`,
`likeSerializable`, `likeConstructable`, `likePropertyValues`, `matchAny`,
`matchNot`, `WildcardConverter`, `SpecificityComparator`,
`naturalComparison`) get specs and TSDoc `@example`s. The defect is the
missing test, not the symbol. Specs are table-driven and small; they guard
defaults and combinators.

### D-3 — Deliberate pairs stay, documented

Three pairs look similar but serve different domains and both remain:

- **`Heap` vs `PriorityQueue`** — raw heap with an explicit `comparison` vs a
  queue interface. Different ergonomics for the same underlying structure.
- **`WildcardExp` vs `WildcardConverter`** — matcher vs parser. One evaluates,
  one parses.
- **`SpecificityComparator` vs `PathPatternComparator`** — media-type
  specificity vs path specificity. Different domains.

Each pair is documented in TSDoc so users can choose.

## Consequences

- No public symbols are removed by this audit.
- Ten new spec files (or additions to existing ones) pin the untested
  contracts.
- `pnpm doc:api` remains zero-warning; every public symbol carries an
  `@example`.
- Future PRs that add a public export must add a spec and TSDoc `@example` in
  the same change (enforced by review, not by lint).

## Revisit triggers

- A public symbol accumulates a genuine duplicate (two symbols, one job).
- An internal helper is found in `index.ts` with no documented contract.
- A public symbol goes a full release cycle with no downstream usage _and_ no
  spec — at that point removal is on the table again, but only via an ADR.
  EOF
