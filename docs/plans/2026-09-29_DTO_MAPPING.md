# 2026-09-29 DTO / Object Mapping — implementation plan

**Scope:** The "DTO/object mapping" Tier-2 gap ([Framework Gap Analysis](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md) §2.2) — model-to-model projection (entity → DTO, i.e. data transfer object, shape projection), plus the AD-35 recorded follow-up "response-schema inference" at the explicit-contract level.
**Status:** ALL WAVES IMPLEMENTED 2026-09-29. (Two implementation amendments, recorded in AD-38: (1) zod-native `toJSONSchema` cannot represent transform schemas — D-4 documents the transform's _output_ as an explicit `z.object` contract with the conversion transform `.pipe()`d into it; (2) the initial `@ndigo/mapper` + `ObjectMapper` facade design was replaced same-day by the unified design below — schema targets live in `ConversionService`, `convert` is the single verb, no new package.)
**Decision record:** [AD-38](../decisions/2026-09-29_AD38_DTO_MAPPING.md).
**Gap rows:** Gap analysis §2.2 (DTO mapping); AD-35 D-7 follow-up list (response schemas).

---

## 1. Problem

1. **No projection layer.** `ConversionService` (`packages/ndigo-core/src/converter.ts`) covers leaf conversion only: string↔typed, constructor-keyed (`ConverterRegistry.makeKey(sourceType, targetType)`). There is no object-to-shape conversion anywhere in the repo (graft search for `Mapper|mapTo|toDto|toDTO|projection`: zero framework hits).
2. **The demo shows the cost today.** `apps/ndigo-api/src/note-controller.ts`:
    - `list` returns `entityManager.findAll(Note)` — the full entity (id, internal `createdAt`, everything) dumped raw into JSON; no shape control.
    - `create` hand-copies: `note.title = String(data?.['title'] ?? '')` — field-by-field, untyped, easy to drift from the entity schema.
3. **Response schemas are a recorded gap.** AD-35 D-2/D-7 defer response-schema inference ("the framework keeps no return-type metadata"); the generator emits only `200: { description: 'OK' }` (`packages/ndigo-openapi/src/spec.ts`). Handlers that already declare an output shape in code have no way to surface it in the spec.

### 1.1 Industry landscape (research, 2026-09-28)

| Approach                                        | Mechanism                                                             | Verdict for Ndigo                                                                                                                                                                                                                                                                            |
| ----------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spring `BeanUtils.copyProperties` / ModelMapper | Reflection, name-matching conventions                                 | Implicit, dynamic, **silently partial** on mismatch. Java's answer to erased types — TS does not have this problem.                                                                                                                                                                          |
| MapStruct (Java)                                | Compile-time codegen                                                  | Type-safe but a build-time generator for a language whose types die at runtime; AD-34 D-8 already declined generator codegen on principle.                                                                                                                                                   |
| .NET AutoMapper                                 | Reflection conventions + fluent config                                | Same implicit-mapping model; the TS port (`@automapper/core`/`pojos`) forces declaring types/properties twice and is "opinionated tooling" per community reports.                                                                                                                            |
| `class-transformer` (NestJS staple)             | Decorators + classes + reflection metadata                            | Class-based, decorator-driven; maintenance is slow (open "is class-transformer abandoned?" discussion in 2025); depends on class-instance targets and `reflect-metadata`-style machinery Ndigo removed in favor of tokens/`Symbol.metadata` (AD-34).                                         |
| `typia`                                         | AOT compiler plugin                                                   | Fast, but a build-time compiler layer — rejected in the same spirit as AD-34 D-8.                                                                                                                                                                                                            |
| `effect/schema`                                 | Schema runtime + extensive library                                    | Powerful; drags the Effect ecosystem gravity into the core.                                                                                                                                                                                                                                  |
| Mapstronaut (new)                               | MapStruct-inspired declarative                                        | Unproven, August 2025 release.                                                                                                                                                                                                                                                               |
| **Zod**                                         | Schema: `pick/omit/extend/transform/default/coerce` + `z.infer` types | **Already Ndigo's validation stack** (AD-07), already a direct dependency of 9 packages, already drives request DTOs (`validatedBody(insertSchemaForEntity(Note))`), ORM schemas (`schemaForEntity`), config binding (AD-34 D-3), and OpenAPI schema derivation (`toJSONSchema`, AD-35 D-3). |

**Naming (2026-09-29, user-steered):** "mapping" is the wrong word for the
operation — `Array.map`, the JS `Map` type, Jackson's `ObjectMapper`, and
MyBatis `Mapper` all occupy it, and mapping implies configurable
association. The operation is **converting**: one value or one collection
into a target contract, enforced by the target shape. `ConversionService`
is extended, not replaced.

**Conclusion:** schema-driven conversion in TS is the correct frame.
TypeScript erases types; Ndigo already owns runtime schemas that _are_ the
types (`z.infer`). Schema targets in `ConversionService`: the schema is the
contract, and the same schema object feeds conversion and the OpenAPI
document — one shape, cannot drift. This is the AD-34 position applied to
the last reflection-era gap.

## 2. Decisions (AD-38)

### D-1 — One service: schema targets in `ConversionService` (ndigo-core)

`convert` gains a second target kind — any `z.ZodType`:

```ts
conversion.convert(note, noteDtoSchema); // z.infer<typeof noteDtoSchema>, fail-fast parse
conversion.convert(notes, noteDtoSchema.array()); // arrays: the schema defines them
conversion.convert('2026-09-29', Date); // leaf: registered converters (unchanged)
```

- **No new package.** An initial `@ndigo/mapper` + `ObjectMapper` facade was
  built and rolled back before publishing: it split one concept across two
  abstractions, and every facade name (`Mapper`, `Projector`, `Parser`)
  collided or invented vocabulary. ndigo-core already carries ecosystem deps
  (`semver`, `@tsmetadata/polyfill`); zod joins them.
- **Registry untouched**: the schema branch short-circuits before the
  constructor-keyed registry (makeKey is name-based; schemas have no name).
- **Leaf lookup becomes source-aware** (value's runtime source type with a
  String fallback preserving binding behavior); the dispatcher's
  constructor-keyed `resolveTypeConverter` path is unchanged.
- **Typed overloads**: `convert<T>(source, targetType: z.ZodType<T>): T`.

### D-2 — Explicit schema-driven projection only

No same-name conventions, no `@Transform`-style decorators, no profiles.
Targets derive from existing seams (`schemaForEntity(E).pick(...)`
`.transform(...).pipe(contract)` or standalone `z.object`); output is a
plain `z.infer` shape, never a class instance.

### D-3 — Fail-fast, never silent

`schema.parse` semantics — structured `ZodError`, no partial result.
Deliberate deviation from BeanUtils' silent partial copy. Request side:
400/422 via `validatedBody` (unchanged). Response side: handler bug → the
existing RFC 9457 error path.

### D-4 — `@apiDocs` gains `responses`; the conversion target is the response contract

`@apiDocs({ responses: { '200': noteResponseSchema } })` — additive
metadata; the generator embeds the schema via zod's native `toJSONSchema`
(AD-35 D-3 seam). No `responses` → current `200: { description: 'OK' }`
default unchanged. No return-type inference — the schema the handler
converts through _is_ the documented shape.

### D-5 — Node zero-wiring bean

`CONVERSION_SERVICE` (`createConversionService()`) registered by
`NodeAutoConfiguration` — the AD-24 `CacheManager` pattern.

### D-6 — Out of scope (v1), documented

Named profiles; flatten/unflatten helpers; codegen; async facade
(`schema.parseAsync` direct); DTO→entity instantiation (`Object.assign` —
the documented pattern); formal client/island wiring; RFC 9457 `default`
response entry (separate AD-35 follow-up).

## 3. Risks

- **Zod version coupling in core** — mitigated: zod is already the repo's
  validation standard (9 packages), and the schema branch is one
  `instanceof` + `parse` call.
- **Binding-path regression** — mitigated: leaf lookup keeps the String
  fallback; the dispatcher path is untouched; the full core + demo suites
  guard it.
- **OpenAPI metadata growth** — `responses` is additive; generator default
  behavior preserved (specs prove no-op when absent).

## 4. Sequencing — ✅ all waves implemented 2026-09-29

### Wave 1 — Schema targets in `ConversionService` (`@ndigo/core`)

- `converter.ts`: `z` import; `sourceTypeOf` helper; schema branch in
  `convert`/`canConvert`; source-aware leaf lookup with String fallback;
  typed `convert<T>(…, z.ZodType<T>): T` overload; JSDoc.
- `package.json`: `zod` dependency.
- Specs (`converter.spec.ts`): identity projection; pick/omit; transform
  (computed field); `z.default`; nested schemas; `z.coerce`; arrays via
  `schema.array()` (elements + empty + whole-call failure); fail-fast
  (`ZodError`, no partial); null/undefined; `canConvert` for schema
  targets; source-aware constructor lookup; no-converter TypeError naming
  the source.

### Wave 2 — Dogfood in `apps/ndigo-api`

- `note.dto.ts`: entity-derived `noteDtoSchema` (`schemaForEntity(Note)`
  pick + computed summary transform piped into the `noteResponseSchema`
  contract); module-level `conversionService`.
- Controllers: `convert(notes, noteDtoSchema.array())` / `convert(note,
  noteDtoSchema)`; typed `validatedBody` + `Object.assign` instantiation;
  `String(...)` hand-copy removed.
- Integration specs: DTO shape assertions (summary present, entity
  columns absent), create 400/422 validation unchanged.

### Wave 3 — OpenAPI response schemas (`@ndigo/openapi`)

- `@apiDocs({ responses })` metadata (bare schema | `{ description?,
  schema? }`); generator maps to operations via `toJSONSchema`; default
  `200 OK` unchanged without it.
- Specs: schema embedded (properties/required), object-form description,
  default preserved; demo declares the contract on the note handlers
  (list/get/create) and the app docs spec asserts it.

### Wave 4 — Wiring, docs, gates

- `CONVERSION_SERVICE` token + bean in `NodeAutoConfiguration`; bean spec
  (schema target + leaf target).
- AD-38 (as amended); this plan; guide 14 (`docs/guides/14-dto-conversion.md`);
  gap-analysis §2.2 row + references; guides README; root README package
  lists; `@ndigo/mapper` package removed (rolled back).
- Gates: `pnpm lint`, `pnpm format:check`, `pnpm build`, changed-package
  `vitest run`, `pnpm manifest:check`, `graft build`.
  (Note: `pnpm doc:api` fails on a pre-existing `@ndigo/http` TypeDoc
  warning unrelated to this work — committed docs predate `HTTPHeader.delete`.)

## 5. Verification

- Unit: Wave 1 spec matrix (above) + existing core suite.
- Demo: `apps/ndigo-api` integration — `GET /notes` returns only DTO
  fields; `POST /notes` 400/422 validation unchanged; `GET /v3/api-docs`
  carries the response schema for the note operations.
- Docs/gates: manifest + format + lint + build green; `graft build`
  refreshed.
