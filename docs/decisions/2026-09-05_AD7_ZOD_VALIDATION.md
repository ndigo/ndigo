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

**Note (resolved 2026-09-05):** `drizzle-zod` is now integrated — `blue-orm-drizzle/src/drizzle-zod.ts` materializes a real Drizzle `sqliteTable` from `@entity`/`@column` metadata (`drizzleTableForEntity`, with SQL-type → sqlite-core builder mapping, `.notNull()`/nullable + autoincrement PK handling) and derives insert/select Zod schemas via `createInsertSchema`/`createSelectSchema`. The metadata-built table's columns are dynamic, so the drizzle-zod boundary uses a documented bounded cast. Tests confirm the derived schemas enforce the entity shape (id string-coerced, required non-nullables, optional nullables).

### Follow-up (2026-09-05, `1518ae0c`)

Completed the remaining `blue-orm` persistence contracts in `blue-orm-drizzle`:
`DrizzleTransactionManager` (BEGIN/COMMIT/ROLLBACK, nested-run rejection),
`DrizzleUnitOfWork` (async new/dirty/removed tracking, `Promise.all` flush), and
`DrizzleRepository` (async CRUD). `DrizzleEntityManager.persist` validates
against the AD-7-derived Zod schema. 12 libSQL in-memory integration tests.

## Revisit Trigger

Revisit if a requirement emerges that Zod cannot express (e.g. class-instance identity semantics, or a decorator API that must remain for a specific consumer).

### Follow-up (2026-09-07, `AbstractPlatformArgumentResolver` fix)

**Silently-dead `validatedBy` on the shared resolver pipeline — fixed.**

AD-7 step 5 wired `validatedBy`'s `convert` hook through the browser **BIND**
resolver only. When the 11 per-platform resolver implementations were later
deduplicated into `AbstractPlatformArgumentResolver` (the shared
`resolveArgument` pipeline in `blue-dispatcher`), the `parameter.convert`
invocation was not carried over. Result: every resolver extending the shared
base — all six Node resolvers (body, query, path, header, cookie, session)
and the web query/cookie/model/session/state resolvers — silently ignored
Zod validation. Only the BIND path (`BrowserBindMethodArgumentResolver`)
validated. The AD-7 "structurally dead" failure (from the legacy system) had
partially returned.

**Fix:** `AbstractPlatformArgumentResolver.resolveArgument` now runs
`parameter.convert` after `convertType` conversion and before the nil-check,
mirroring the BIND resolver. Schemas see coerced values, so
`z.coerce.number()` composes with both steps.

**Documentation of usage:** see the `validatedBy`/`validateParameters` docstrings
in `packages/blue-dispatcher/src/zod-validated-by.ts` (whole-body Node,
whole-map, and per-field forms).

**Regression coverage:** `packages/blue-platform-node/test/zod-validation.spec.ts`
— whole-body coercion, per-field query, per-field body, and both failure
paths surfacing as `ParameterConversionError`. Web coverage remains in
`packages/blue-platform-web/test/zod-validation.spec.ts`.

### Follow-up (2026-09-07, Phase 2 — `validatedBody` / `validatedQuery` sugar)

Added ergonomic entry points to the same mechanism, so a single zod schema
wraps an entire request source instead of composing `validatedBy` with a
star extractor by hand:

- `validatedBody(schema)` — validates the whole parsed body; equivalent to
  `validatedBy(schema, bodyValue('*'))`. The `'*'` convention for "whole
  source" already existed for the body; this is the sugar over it.
- `validatedQuery(schema)` — validates the whole query object; implements the
  matching `'*'` convention in both query resolvers (`QueryValueMethodArgumentResolver`
  in dispatcher and `NodeQueryValueMethodArgumentResolver` in platform-node),
  binding all of `route.data`.
- The shared `AbstractNamedValueMethodArgumentResolver` (browser query, path,
  matrix, attribute) now invokes `parameter.convert`, closing the same
  silent-death gap Phase 1 fixed for the platform base pipeline — per-field
  validation on those resolvers previously no-op'd.

Full usage surface documented in `zod-validated-by.ts` (validatedBody,
validatedQuery, validateParameters, validatedBy — whole-source, per-field, and
whole-map forms). Coverage: `platform-node/test/zod-validation.spec.ts` adds
whole-query coercion + whole-query failure; `platform-web/test/zod-validation.spec.ts`
adds shared-resolver per-field query validation.

### Follow-up (2026-09-07, Phase 3 — entity-derived request validation, dogfood)

Closed the loop between entity metadata and request validation:

- **`insertSchemaForEntity(entityClass)`** (`@blue/orm`) derives the
  writable shape of an entity: `schemaForEntity` minus the primary key and
  any `@generated()` columns, with nullable/untyped columns made optional. A
  client-created payload never carries (or is required to carry)
  server-owned fields.
- **Dogfooded in `blue-api`:** both note controllers
  (`NoteController` in-memory, `DrizzleNoteController` SQL) now validate the
  request body with `validatedBody(insertSchemaForEntity(Note))`. The
  entities declare `@column({ schema: z.string().min(1) })` — the metadata
  is the single source of truth for the constraint.
- **Framework gap found and closed:** a binding failure (`ParameterConversionError`
  from Zod rejection) had no default HTTP mapping in the Node pipeline —
  `MetadataErrorResolver` only resolves user-configured `@errorMapping`
  handlers, so validation failures fell through to a generic 200/empty
  response. New `NodeParameterBindingErrorResolver` (`@blue/platform-node`)
  maps any `ParameterBindingError` (missing params, failed conversions,
  Zod validation) to a 400 JSON response with the failure message;
  `NodeAutoConfiguration.errorResolvers` registers it before
  `MetadataErrorResolver` so app error handlers still win. This is the
  minimal piece of the planned error-model work (Item 3, RFC 7807) that the
  validation feature needed to be correct end-to-end.

**Verified:** `POST /drizzle/notes` with `{ title: '' }` → `400`
`{"error":"Failed to convert validated parameter '*': title: Too small: …"}`
from the entity-derived schema; valid title persists (200). Full suites:
orm 87, platform-node 163, platform-web 143, dispatcher 211, api 10,
management 8, boot 51, island 10.

### Follow-up (2026-09-07, Phase 4A — structured validation issues)

`ParameterConversionError` now carries the machine-readable per-field failures,
not just a flattened message. `validatedBy`'s failure path builds a
`ZodValidationError` (the `ParameterConversionError.cause`) holding a
structured `issues` array — each with `path`, `message`, and Zod `code`
(e.g. `too_small`, `invalid_type`) — alongside the human-readable flattened
`message`. Error resolvers can now render either a flat detail string or a
structured `errors` array without string-parsing.

Coverage: `platform-node/test/zod-validation.spec.ts` asserts the cause is a
`ZodValidationError` and that its `issues` survive the whole resolver chain
for whole-query, whole-body (both failing fields listed), and per-field
paths. The browser BIND path shares `validatedBy`, so it gets the structure
for free. The RFC 7807 envelope that renders these issues (`application/problem+json`)
remains Item 3's scope — Phase 4B.
