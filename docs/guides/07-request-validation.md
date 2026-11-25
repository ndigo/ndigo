# Guide 07 — Request Validation

Never trust the request. Validation runs after binding, checking that the data meets your rules before the handler executes. Ndigo combines coercive binding with Zod schemas, and can derive schemas directly from ORM entity metadata.

**Use for:** ensuring request data meets your rules before the handler runs.

**Not for:** business-rule validation that depends on database state; that belongs in the handler or service layer.

The validation pipeline: an extractor resolves and converts a value, then a Zod schema runs over it. Failures surface as a 422 problem document with structured issues.

**Audience:** Node and browser application developers · **Prerequisites:** [Guide 06](06-argument-binding.md) · **Reference app:** [apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api), [apps/12-ndigo-petclinic](https://github.com/ndigo/ndigo/tree/main/apps/12-ndigo-petclinic)

## What you'll learn

- Wrap one extractor with `validatedBy`.
- Validate whole bodies, queries, and parameter maps.
- Derive Zod schemas from ORM entities.
- Read the 422 validation document.
- Keep browser and server validation on the same schema.

## The pipeline

```text
request → extractor (resolve + type-convert) → Zod schema (validatedBy) → handler
                                                    │ failure
                                                    ▼
                              ParameterConversionError → 422 problem + errors[]
```

The `convert` hook runs in every platform resolver — Node's body/query/path/
header/cookie/session resolvers, the browser BIND path, and the browser
named-value resolvers.

## 1. Basic per-field validation: `validatedBy(schema, extractor)`

Wrap any extractor with a Zod schema. On failure a
`ParameterConversionError` is thrown and flows through the error resolver
chain to a 422 with `errors[]`.

```ts
import { z } from 'zod';
import { getMapping, parameters, queryValue, validatedBy } from '@ndigo/dispatcher';

@requestMapping('/subscribe')
class SubscribeController {
    @getMapping('/')
    @parameters({ email: validatedBy(z.email(), queryValue('email')) })
    subscribe(email: string) {
        return { ok: true };
    }
}
```

The schema sees **already-coerced values**: `convertType` conversion runs
before the schema, so `z.coerce.number` on a query string works as a
second coercion stage.

## 2. Whole-body: `validatedBody(schema)`

Validate an entire parsed request body against one schema — sugar over
`validatedBy(schema, bodyValue)`.

```ts
const NoteSchema = z.object({
    title: z.string().min(1).max(140),
    body: z.string().optional(),
});

@postMapping('/')
@parameters({ note: validatedBody(NoteSchema) })
create(note: z.infer<typeof NoteSchema>) {
    // note is validated + coerced
}
```

## 3. Whole-query: `validatedQuery(schema)`

Bind the entire query object (all `route.data`) through one schema. Useful
for search/filter contracts.

```ts
const SearchSchema = z.object({
    page: z.coerce.number().min(1),
    q: z.string().max(80),
});

@parameters({ search: validatedQuery(SearchSchema) })
search(search: z.infer<typeof SearchSchema>) {
    // search.page: number, search.q: string
}
```

## 4. Whole map: `validateParameters(schema, extractors)`

Apply one schema across several extractors.

```ts
@parameters(validateParameters(UserSchema, {
    user: dataBinderValue('query'),
}))
```

## 5. Entity-derived schemas: `insertSchemaForEntity`

Schemas can come from `@ndigo/orm` entity metadata instead of being written
by hand — one declaration drives the column, the DB table (via
`@ndigo/orm-drizzle`), and the wire validation.

```ts
import { column } from '@ndigo/orm';

@entity('notes')
export class Note {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ type: 'varchar', schema: z.string().min(1) })
    title!: string;

    @column({ type: 'text', nullable: true })
    body!: string;
}
```

Derive the _writable_ shape (w/o primary/generated columns; nullable/untyped
optional) and validate the body:

```ts
import { insertSchemaForEntity } from '@ndigo/orm';

@postMapping('/')
@parameters({ data: validatedBody(insertSchemaForEntity(Note)) })
create(data: Record<string, unknown>) { … }
```

A `POST` with `{ title: '' }` now yields:

```json
{
    "type": "urn:ndigo:validation-failed",
    "title": "Validation Failed",
    "status": 422,
    "detail": "title: Too small: expected string to have >=1 characters",
    "errors": [{ "path": ["title"], "message": "Too small: …", "code": "too_small" }]
}
```

- 400 stays reserved for **transport/binding** problems; 422 is for
  **schema (Zod) failures**.
- The full entity schema (`schemaForEntity`) is for reads/validation of
  persisted instances; always use `insertSchemaForEntity` for create bodies.

## 6. Browser parity

`validatedBy`/`validateParameters` also run on the browser pipeline — the BIND
resolver and the shared named-value resolvers invoke the same `convert`
hook, so per-field validation works in `@ndigo/platform-web` with the same
single-decorator surface. (Whole-body `validatedBody` is Node-specific:
browser request "bodies" are form/model sources.)

## See also

- Full API: [`@ndigo/dispatcher` validation helpers](/reference/api/ndigo-dispatcher/zod-validated-by/)
  (docstring includes all four usage forms) and
  [`@ndigo/orm` entity schema](/reference/api/ndigo-orm/entity-schema/).
