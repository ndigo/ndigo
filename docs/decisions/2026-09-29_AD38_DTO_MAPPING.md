# AD-38: DTO conversion — schema targets in ConversionService

**Date:** 2026-09-29
**Status:** Ratified — implementation in
[`docs/plans/2026-09-29_DTO_MAPPING.md`](../plans/2026-09-29_DTO_MAPPING.md)
(two implementation amendments below).
**Closes:** the "DTO/object mapping" (DTO = data transfer object) Tier-2 gap in
[`docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md`](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md)
§2.2, and the AD-35 recorded follow-up "response-schema inference" at the
explicit-contract level.

## Background

`ConversionService` covered leaf conversion only — string↔typed binding,
constructor-keyed (`ConverterRegistry.makeKey(sourceType, targetType)`). No
model-to-model projection existed anywhere in the repo: demo handlers
returned raw entities (`entityManager.findAll(Note)` dumped into JSON) or
hand-copied fields (`note.title = String(data?.['title'] ?? '')`).

The industry options were surveyed against the repo's established pattern
(**own the contract, wrap the ecosystem standard, use platform APIs
directly** — AD-07 Zod, AD-19 i18n, AD-24 caching, AD-35 OpenAPI):

- **Spring `BeanUtils`/ModelMapper, .NET AutoMapper** — implicit
  reflection conventions; Java's workaround for erased types; silently
  partial on mismatch. TypeScript does not have this problem.
- **MapStruct** — compile-time codegen; declined on the AD-34 D-8
  principle (no generator codegen).
- **`class-transformer`** — decorator/class/reflection machinery Blue
  already removed (AD-34); slow maintenance.
- **`typia`** — AOT compiler layer; same AD-34 D-8 rejection.
- **`effect/schema`** — ecosystem gravity disproportionate to the gap.
- **Zod** — already Blue's validation stack (AD-07), already a dependency
  of 9 packages, already drives request DTOs (`validatedBody`
  `insertSchemaForEntity`), ORM schemas (`schemaForEntity`), config
  schema mode (AD-34 D-3), and OpenAPI schema derivation (`toJSONSchema`,
  AD-35 D-3).

**Naming:** "mapping" was rejected for the operation — `Array.map`, the JS
`Map` type, Jackson's `ObjectMapper`, and MyBatis `Mapper` all occupy the
word, and mapping implies configurable association while this operation is
a one-way contract-enforced conversion. "Converting" was the correct verb,
and `ConversionService` the correct home.

**Conclusion:** schema-driven conversion in Blue is one operation with two
target kinds. The engine is `schema.parse`; the framework already owns
runtime schemas that _are_ the types (`z.infer`); the same schema object
feeds conversion and the OpenAPI document — one shape, cannot drift. This
is the AD-34 position applied to the last reflection-era gap.

## Decisions

### D-1 — One service: schema targets in `ConversionService` (blue-core)

`ConversionService.convert` gains a second target kind — any `z.ZodType`:

```ts
conversion.convert(note, noteDtoSchema); // shape: schema.parse (fail-fast), typed z.infer
conversion.convert(notes, noteDtoSchema.array()); // arrays: the schema defines them
conversion.convert('2026-09-29', Date); // leaf: registered converters (unchanged)
```

- **No new package.** An initial parallel-facade design (`@blue/mapper` +
  `ObjectMapper`) was built and rolled back before publishing: it split one
  concept ("convert a value to a target contract") across two abstractions,
  and every candidate name for the facade (`Mapper`, `Projector`, `Parser`)
  collided or invented vocabulary. `blue-core` already holds ecosystem
  dependencies (`semver`, `@tsmetadata/polyfill`); zod joins them.
- **Registry untouched.** The schema branch short-circuits before the
  constructor-keyed registry — `makeKey` is name-based, schemas have no
  name, and `schema.parse` needs no registry. Leaf lookup additionally
  becomes **source-aware** (value's runtime source type, String fallback
  preserving the environment/config binding convention) — the dispatcher's
  `resolveTypeConverter` already used constructor-keyed lookup, unchanged.
- **`canConvert`** answers `true` for schema targets; constructor targets
  keep registry semantics.
- **Type safety** via overloads: `convert<T>(source, targetType:
  z.ZodType<T>): T` — the output is `z.infer` at compile time.

### D-2 — Explicit schema-driven projection only

No same-name auto-copy conventions (BeanUtils, automapper-ts),
`@Transform`-style decorators (class-transformer), or named mapping
profiles. Target schemas derive from existing seams
(`schemaForEntity(E).pick(...).transform(...).pipe(contract)` or standalone
`z.object` DTO modules); schemas are visible, reviewable, statically typed.
No `instanceof`/class-instance targets — conversion produces plain
`z.infer` shapes.

### D-3 — Fail-fast, never silent

Schema targets are `schema.parse` semantics: missing field / wrong type /
failed transform → the structured `z.ZodError` propagates; no partial
result ever returns. Deliberate deviation from BeanUtils' silent partial
copy. Direction-aware: request side already 400/422 via `validatedBody`
(unchanged); response side failure is a handler bug → the existing RFC 9457
error path.

### D-4 — `@apiDocs` gains `responses`; the conversion target is the response contract

`@apiDocs({ responses: { '200': noteResponseSchema } })` — additive metadata
(`z.ZodType | { description?, schema? }` per status). The generator pipes
the schema through zod's native `toJSONSchema` (the AD-35 D-3 seam — same
function, version-exact). Without `responses`, the current
`200: { description: 'OK' }` default is unchanged. No return-type inference
is attempted — the schema the handler converts through _is_ the documented
shape.

### D-5 — Node zero-wiring bean

`NodeAutoConfiguration` registers `CONVERSION_SERVICE`
(`createConversionService()`) — the AD-24 `CacheManager` pattern. Apps with
custom converter registries override the bean.

### D-6 — Out of scope (v1), documented

Named mapping profiles; flatten/unflatten helpers; mapping codegen;
async facade (`schema.parseAsync` is directly callable on any target
schema); DTO→entity instantiation (`Object.assign(new Note(),
validatedData)` is the documented pattern); formal client/island conversion
wiring (blue-core has no node deps, so web reuse works untouched);
RFC 9457 `default` response entry in the spec (separate AD-35 follow-up).

## Implementation amendments (2026-09-29)

1. **Transforms are not JSON-Schema-representable.** zod's native
   `toJSONSchema` throws on `.transform()` schemas. Per D-4, the documented
   schema is the transform's **output**, declared as an explicit `z.object`
   contract, and the mapping transform is `.pipe()`d into that contract:
   the documented schema remains the conversion target, and any shape
   drift fails loud at `convert` time. A `responses` entry that is itself a
   transform fails loud at generation (the zod error propagates through the
   generator).
2. **D-1 superseded in part.** The initial design (new `@blue/mapper`
   package with `ObjectMapper` composing `ConversionService`) was replaced
   same-day by the unified design above before anything published; the
   package, its docs, and the `OBJECT_MAPPER` token were removed. `convert`
   is the single verb; `CONVERSION_SERVICE` the single bean.

## Consequences

- Handlers declare output shapes once: `noteResponseSchema` drives
  conversion in code and the response schema in `/v3/api-docs` — drift
  between them is impossible by construction.
- The demo's raw-entity responses and `String(...)` hand-copying are
  replaced by explicit conversions.
- Environment/config/argument binding paths keep their exact behavior;
  the service additionally converts shapes, and registered leaf converters
  compose inside schema transforms.

## References

- Gap analysis: [`docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md`](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md) §2.2
- AD-35 (OpenAPI, response-schema follow-up): [`2026-09-28_AD35_OPENAPI_DOCS.md`](2026-09-28_AD35_OPENAPI_DOCS.md)
- AD-34 (TypeScript-native layer): [`2026-09-27_AD34_TYPESCRIPT_NATIVE_LAYER.md`](2026-09-27_AD34_TYPESCRIPT_NATIVE_LAYER.md)
- AD-07 (Zod validation): [`2026-09-05_AD07_ZOD_VALIDATION.md`](2026-09-05_AD07_ZOD_VALIDATION.md)
- Guide: [`docs/guides/14-dto-conversion.md`](../guides/14-dto-conversion.md)
