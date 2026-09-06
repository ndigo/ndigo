# AD-7: Zod as the canonical runtime-schema primitive

**Date:** 2026-09-05
**Status:** Executed — all 7 migration steps landed 2026-09-05

## Background

The framework accumulated three overlapping "data shape" facilities:

1. **`blue-validate`** — the legacy constraint/decorator system (`@constrained`, `@min`/`@max`/`@range`, `@length`, `@pattern`, `@past`/`@future`, `Validator`, error types, groups, i18n formatting). ~51 constraints, backend abstraction with only `'native'` implemented.
2. **`blue-model`** — the objectmodel integration layer (`BasicModel(...).assert(...)` value-object constructors). Was the intended modernization of `blue-validate`'s space, but objectmodel has no static type inference (entire surface is `as any`), no ORM or signal integration, and its Proxy-instance model fights the signals value model.
3. **`blue-orm`** (new) — decorator-annotated entities (`@entity`/`@column`/`@primaryColumn`) with an ad-hoc `entity.validate()` hook wired to the legacy `blue-validate`.

`zod@^4` is already a dependency of `blue-validate` and `blue-platform-web`; `blue-validate`'s `validatedBy` already has a full Zod overload, and its `@validated({ backend: 'zod' })` docstring shows the Zod modernization was started and abandoned.

## Decision

**Adopt Zod (latest, v4) as the single runtime-schema primitive**, and retire `blue-validate`'s constraint/decorator system and `blue-model`/objectmodel. Persistence, validation, and static typing derive from one source of truth.

- **Validation** = Zod schemas (`safeParse`/`parse` + `z.infer` types). Deletes the legacy constraint/decorator API surface (`@min`/`@max`/`@email`, `@validated`, `Validator`, groups).
- **Persistence** = Drizzle schema → `drizzle-zod` → the same Zod schema. One definition drives the DB columns, the validation, and the inferred entity type.
- **Reactive state** = plain Zod-validated values held in signals (`signal(schema.parse(x))`); a computed re-validates. No Proxy-based instances.
- **Value objects / DTOs / route params** = schema-first Zod (`z.string().refine(...)`, `z.object(...)`), replacing objectmodel's value objects and `blue-validate`'s `validatedBy` decorators.

**`blue-orm` entities remain decorator-annotated classes** (Blue's established annotation style — `@entity`/`@column`/`@primaryColumn`/lifecycle hooks). Validation is _derived from_ those annotations: the field decorators assemble a per-entity Zod schema at definition time, so a class field declares its column and its validation in one place. The standalone `@min`/`@max`-style constraint decorators are **not** retained — Zod refinements cover those.

## Versions (verified 2026-09-05)

| Package       | Version  | Note                                         |
| ------------- | -------- | -------------------------------------------- |
| `zod`         | `^4.5.4` | latest major; repo currently resolves 4.4.3  |
| `drizzle-zod` | `^0.8.3` | peer-supports `zod ^3.25.0 \|\| ^4.0.0`      |
| `drizzle-orm` | `0.45.2` | already `>=0.36.0` (drizzle-zod requirement) |

## Consequences

**Deleted / retired**

- `blue-model` (objectmodel integration layer) and its `basic.ts` primitive models.
- `blue-validate`'s constraint registry, standalone constraint decorators, `Validator`/`createTypeValidator`, `@validated` class decorator, and native backend — replaced by Zod schemas.
- `blue-orm`'s `entity.validate()` hook (the legacy `@validated` contract); replaced by validating against the entity's derived Zod schema.
- The `objectmodel` entry in the Library Integration Layer map (`AGENTS.md` / `blue-eslint-plugin`).

**Migrated**

- `blue-domain/src/types.ts` value objects (`AccountNumber`, `AlphaString`, …) → Zod schemas.
- `blue-platform-web` route-param validation → schema-first Zod (`validatedBy` keeps its Zod overload; the `Validator` overload is removed).
- `blue-api` entities (`Note` etc.) → keep `@entity`/`@column` decorators; validation derived from them via Zod.

**Gained**

- Static entity/domain types via `z.infer` (removes the `as any` surface in `blue-model`).
- Single-source-of-truth persistence + validation via `drizzle-zod`.

## Migration order (executed 2026-09-05)

1. Bump `zod` to `^4.5.4`; add where needed. ✅
2. Add a `blue-orm` Zod-schema derivation from entity metadata (decorator → `z.object`). ✅ `entity-schema.ts`
3. Replace `blue-orm`'s `validate()` hook with the derived Zod schema; add tests. ✅
4. Migrate `blue-domain` value objects to Zod — deleted dead `types.ts`; `GenericDomainComponent.validate()` is now Zod-backed via `validationSchemas`. ✅
5. Migrate `blue-platform-web` route params; drop the `Validator` overload — `validatedBy` (Zod-only) moved to `blue-dispatcher`, wired through a new `MethodParameter.convert` slot + bind resolver. ✅
6. Delete `blue-validate` + `blue-model`; remove `objectmodel` from the integration map. ✅
7. Update docs + eslint rule sweep. ✅

**Note:** `drizzle-zod` remains deferred — `blue-orm-drizzle` builds raw SQL DDL from metadata rather than Drizzle table objects, so `drizzle-zod` has no integration point yet. The derivation is direct from metadata; `drizzle-zod` applies once the adapter adopts Drizzle table schemas.

### Follow-up (2026-09-05, `1518ae0c`)

Completed the remaining `blue-orm` persistence contracts in `blue-orm-drizzle`:
`DrizzleTransactionManager` (BEGIN/COMMIT/ROLLBACK, nested-run rejection),
`DrizzleUnitOfWork` (async new/dirty/removed tracking, `Promise.all` flush), and
`DrizzleRepository` (async CRUD). `DrizzleEntityManager.persist` validates
against the AD-7-derived Zod schema. 12 libSQL in-memory integration tests.

## Revisit Trigger

Revisit if a requirement emerges that Zod cannot express (e.g. class-instance identity semantics, or a decorator API that must remain for a specific consumer).
