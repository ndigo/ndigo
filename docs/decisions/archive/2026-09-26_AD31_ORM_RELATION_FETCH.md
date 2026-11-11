# AD-31: ORM relation fetch — explicit join-column metadata, explicit opt-in loading

> **Consolidated** — merged into the umbrella ADR. Retained for history.

**Date:** 2026-09-26
**Status:** Accepted — decisions D-1..D-3 ratified by the owner (2026-09-26);
Wave 3 of the ORM completion plan landed (see
[plan](../../plans/2026-09-26_ORM_COMPLETION.md)).

## Background

The Framework Gap Analysis §3 ORM row records no lazy loading / relation
fetch semantics: `@relation` metadata (`oneToMany`/`manyToOne`/… —
`RelationDefinition { kind, fieldName, targetEntity }`) was declarative only
and nothing loaded a relation at runtime. Two design decisions gate any
implementation: where the foreign key lives (metadata), and how loading is
triggered (fetch strategy).

## Decisions

### D-1 — Join columns are explicit metadata naming existing `@column`s

`RelationDefinition` gains optional `joinColumn` (owning side — many-to-one,
one-to-one: the `@column` field on THIS entity holding the target's primary
key) and `inverseJoinColumn` (inverse side — one-to-many, one-to-one: the
`@column` field on the TARGET entity holding this entity's primary key).
Relation decorators take a second options argument:
`@manyToOne(() => User, { joinColumn: 'authorId' })`.

**As-built refinement of the ratified shape:** the join column names an
existing declared column — it is never generated. Auto-generating FK columns
was reconsidered during implementation: the entity manager persists `@column`
fields only, so a synthesized FK column would never be written; the JPA
shape (FK property + relation on top) is the only coherent one. Consequences:
zero change to generated DDL (`createTableStatements` untouched), FK
nullability is the column's own (`@column({ nullable: true })`), and FKs
round-trip through the normal column pipeline.

Missing metadata fails loud at fetch time (unknown relation, join column not
a declared `@column`, relation declaring neither side — each has a distinct
error). `many-to-many` fetch is explicitly rejected (join-table semantics
out of scope for v1; the decorator still parses).

### D-2 — Fetch is explicit opt-in: eager options + `loadRelation`

No proxies. Eager: `findById(id, { relations: ['author'] })` and
`findAll({ relations: [...] })` load and assign the named relations in both
backends. Lazy: `loadRelation(entity, 'notes')` loads on demand, assigns the
field, and returns the value. Loading composes with the sync memory / async
drizzle split through each manager's `fetchRelation` (owning side: `find`
by FK; inverse side: equality scan/`WHERE` on the FK column). Unset FKs load
as `undefined`; unmatched inverse sides as `[]`.

### D-3 — `persist` binds unset optional columns as SQL NULL

Required by D-1 (an empty FK must persist): `DrizzleEntityManager.persist`
normalizes `undefined` column values to SQL `NULL` for non-generated columns.
While landing, the upsert fallback was also corrected to **rethrow the
original insert error when the entity carries no primary key** — previously
the swallowed failure resurfaced as a misleading "undefined cannot be passed
as argument to the database" from a bogus UPDATE.

## Risks

- Implicit FK conventions (Java-ORM naming) are NOT adopted — a
  relation without join-column options is metadata-only and does not fetch.
  Convention-following apps pay one options argument per relation.
- N+1 on eager loads (one query per relation per entity) — documented;
  relation-aware JOIN loading is a future optimization, not a v1 shape.
- `loadRelation` mutates the entity (assigns the field) — intentional and
  documented; detached/serialized entities keep plain values.

## Verification

Wave-3 gates executed 2026-09-26: `vitest run` green in both packages
(ndigo-orm 113/113 incl. 8 relation-fetch specs; ndigo-orm-drizzle 49/49 incl.
5 specs) and both `tsc -b` builds pass; `graft build` refreshed. Specs cover
eager (findById/findAll, both directions), lazy, unset-FK/empty-inverse
values, and all three fail-loud paths per backend.
