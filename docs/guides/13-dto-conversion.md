# Guide 13 — DTO & Conversion

How to project models into API shapes with `ConversionService`:
one service converts both leaf values and whole objects — schema targets are
contract-enforced projection, fail-fast. Reference application: `[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)`.

**Audience:** Node API developers · **Prerequisites:** Guides [01](01-building-a-node-api.md) and [07](07-request-validation.md) · **Reference app:** `[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)`

## What you'll learn

- Convert leaf values and whole objects with `ConversionService`.
- Derive DTO schemas from entity metadata.
- Convert request payloads into entities.
- Declare the OpenAPI response contract.
- Compose leaf and shape conversions.

## One service, two target kinds

`ConversionService` converts any value to a target **constructor** (leaf,
registry-backed) or a target **zod schema** (shape projection):

```ts
import { createConversionService } from '@ndigo/core';
import type { z } from 'zod';

const conversion = createConversionService();

const date = conversion.convert('2026-09-29', Date); // leaf: registered converter
const dto = conversion.convert(note, noteDtoSchema); // shape: typed z.infer<typeof noteDtoSchema>
const dtos = conversion.convert(notes, noteDtoSchema.array()); // arrays: the schema defines them
```

Handlers should never return persistence shapes: raw entities leak internal
columns, and decorator-affixed fields serialize unpredictably. Converting
through a DTO (data transfer object) schema is the explicit, typed answer.

Fail-fast: schema targets are `schema.parse` — a missing field, wrong type,
or failed transform throws the structured `ZodError`; a partial result never
escapes. This is deliberate: implicit best-effort copying (the reference framework
`BeanUtils`) hides drift until it reaches the client. Request-side mismatches
were already 400 via `validatedBody`; a response-side failure is a handler
bug and surfaces through the RFC 9457 error path.

## Deriving DTO schemas from entities

`@ndigo/orm` derives schemas from column metadata, so the entity stays the
single source of truth:

```ts
import { schemaForEntity } from '@ndigo/orm';
import { z } from 'zod';

const noteResponseSchema = z.object({
    id: z.number(),
    title: z.string(),
    summary: z.string(),
    createdAt: z.string().nullable(),
});

const noteDtoSchema = schemaForEntity(Note)
    .pick({ id: true, title: true, body: true, createdAt: true })
    .transform(({ id, title, body, createdAt }) => ({
        id,
        title,
        summary: (body ?? '').slice(0, 80) || title,
        createdAt,
    }))
    .pipe(noteResponseSchema);
```

Two notes:

- Entity-derived schemas erase to `Record<string, z.ZodType>` — annotate
 the transform input from the entity's declared column types.
- **Transforms are not JSON-Schema-representable** (zod's native
 `toJSONSchema` throws). Declare the transform's output as an explicit
 `z.object` contract and `.pipe` the transform into it: the documented
 schema _is_ the conversion target, and drift fails loud at `convert`.

## Request → entity (the other direction)

The validated body is already entity-shaped — instantiate and copy:

```ts
const noteInsertSchema = insertSchemaForEntity(Note);

@postMapping('/')
@parameters({ data: validatedBody(noteInsertSchema) })
async create(token: string | undefined, data: z.infer<typeof noteInsertSchema>) {
    const note = new Note();
    Object.assign(note, data); // @prePersist fills the rest
    entityManager.persist(note);
    return { note: conversionService.convert(note, noteDtoSchema) };
}
```

## Declaring the response contract

The same schema the conversion validates against documents the endpoint —
handler output and spec cannot drift:

```ts
@getMapping('/notes')
@apiDocs({ summary: 'List notes', responses: { '200': noteResponseSchema } })
async list(token: string | undefined) {
    return { notes: conversionService.convert(entityManager.findAll(Note), noteDtoSchema.array()) };
}
```

The generator embeds the schema via zod's native `toJSONSchema` (the
 seam); bare schemas default to `description: 'OK'`, and the object
form adds a description. Operations without `responses` keep the default
`200: { description: 'OK' }`.

## Leaf and shape composition

The two target kinds compose in transforms — converters registered for
environment/config/argument binding are reachable inside schema transforms:

```ts
const schema = z.object({ at: z.string() }).transform(({ at }) => ({ at: conversionService.convert(at, Date) }));
```

Constructor targets resolve by the value's runtime source type (with the
String fallback that environment binding uses), so registered converters
serve both binding and projections.

In Node apps the auto-configuration registers the shared
`CONVERSION_SERVICE` bean (`createConversionService`) — zero wiring;
override the bean for custom converter registries.

## What conversion is not

- No same-name conventions, decorators, or reflection — schema targets are
 the explicit shape, nothing implicit.
- No mapping profiles/registries — schema reuse _is_ the profile.
- Schema targets produce plain `z.infer` shapes — no class-instance targets
 (instantiate entities via `Object.assign`, above).
- No async facade — call `schema.parseAsync` directly when needed.
- Client-side reuse works out of the box (ndigo-core has no node
 dependencies) though no formal web wiring exists.

## See also

- [Guide 12 — OpenAPI & API Docs](12-openapi-and-api-docs.md) — the generated spec
- [Guide 20 — ORM & Migrations](20-orm-and-migrations.md) — entity metadata
- — the conversion decision
