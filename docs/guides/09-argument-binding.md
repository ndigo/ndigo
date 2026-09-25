# Guide 09 — Argument Binding

How handler arguments bind in BlueJS: the full source vocabulary, whole-source
**data binding** (`dataBinderValue` — the form/model-binding story), and
multipart **JSON parts** (`requestPart`). The engine mirrors Spring MVC's
resolver architecture — each parameter source is one resolver, first match
wins — and the binding machinery reuses `DataBinder` (keypath-aware,
core/isomorphic), `ConversionService`, and the Zod `convert` hook (guide 02).

## 1. The binding surface

One coherent set of bindings, all read from the Route/dispatch context. Source
is encoded in the type only where a whole source is bound into an object
(`data-{source}:value`); otherwise each wire source is its own `*:value` type.

| Binding         | Factory                                | Type                    | Source                                            | Nested? | Platform |
| --------------- | -------------------------------------- | ----------------------- | ------------------------------------------------- | ------- | -------- |
| Path variable   | `pathVariable('id')`                   | `path:variable`         | Route params (`:id`)                              | no      | both     |
| Query           | `queryValue(name)`                     | `query:value`           | Route query                                       | no      | both     |
| Matrix          | `matrixValue(name)`                    | `matrix:value`          | Segment matrix                                    | no      | both     |
| Header          | `headerValue(name)`                    | `header:value`          | Request header                                    | no      | node     |
| Body            | `bodyValue(name)`; no-arg = whole body | `body:value`            | request body (JSON / urlencoded)                  | yes     | node     |
| Cookie          | `cookieValue(name)`                    | `cookie:value`          | `document.cookie` / `request.cookies`             | no      | both     |
| History state   | `historyStateValue(name)`              | `history-state:value`   | `history.state`                                   | yes     | browser  |
| Session storage | `sessionStorageValue(name)`            | `session-storage:value` | `sessionStorage`                                  | no      | browser  |
| Local storage   | `localStorageValue(name)`              | `local-storage:value`   | `localStorage`                                    | no      | browser  |
| Request session | `requestSessionValue(name)`            | `request-session:value` | `request.session`                                 | yes     | node     |
| Attribute       | `attributeValue(name)`                 | `attribute:value`       | Framework context (`route.attributes`)            | yes     | both     |
| Data binding    | `dataBinderValue(source, Target?)`     | `data-{source}:value`   | whole flat source → object (per-platform set, §2) | builds  | both     |
| Request part    | `requestPart(part?, Target?)`          | `request-part:value`    | multipart JSON/text part                          | JSON    | node     |
| Socket session  | `socketSessionValue(name)`             | `socket-session:value`  | Socket session                                    | —       | socket   |

**Nested-capable** sources (`body`, `request-session`, `history-state`,
`attribute`) support dotted reads — `bodyValue('address.city')` walks the JSON
body. Scalar sources (`query`, `matrix`, headers, cookies, storage) do **not**:
`queryValue('a.b')` is a literal key, never a walk.

**Whole-source rule:** omitting the name binds the entire source object —
`queryValue()` = whole query bag, `bodyValue()` = whole body,
`attributeValue()` = whole framework-context bag, and so on for every
object-valued binder (the old `'*'` sentinel was removed; `matrixValue` is
name-only because matrix params span segments). `pathVariable()` binds all
route params; `routeValue()` binds the whole `Route`; `pathValue()` and
`methodValue()` are sugar for the `path`/`method` properties — the rest of
the `ROUTE` surface stays as recorded in AD-27/AD-28.

## 2. Whole-source data binding — the form/model story

`dataBinderValue(source)` assembles a whole flat source into one nested object:
dotted client keys (`address.street`) nest via `DataBinder` keypaths, repeated
keys bind as arrays, and a `prefix` filters+strips a key prefix. The bindable
sources are an explicit per-platform allow-list:

- **Node:** `body` (the `@ModelAttribute` equivalent — urlencoded/JSON), `cookie`.
- **Browser:** `query`, `cookie`, `session-storage`, `local-storage`.

```ts
import { z } from 'zod';
import { parameters, dataBinderValue, validatedBy } from '@blue/dispatcher';

class ProfileForm {
    email = '';
    age = 0;                                  // coerced by the schema; binding is string-typed
    address = { street: '', city: '' };       // client sends "address.street" / "address.city"
}

@postMapping('/profile')
@parameters({
    profile: validatedBy(
        z.object({
            email: z.string().email(),
            age: z.coerce.number(),
            address: z.object({ street: z.string(), city: z.string() }),
            // unknown keys are STRIPPED by default (zod ^4.5.4)
        }),
        dataBinderValue('body')               // source in the type
    )
})
async updateProfile(profile: ProfileForm) {
    // profile is a validated ProfileForm instance — not a Record
    return { ok: true, email: profile.email };
}
```

Semantics to know:

- **Plain object vs instance.** With no target, `dataBinderValue('body')`
  binds into a plain nested object. With a target constructor,
  `dataBinderValue('body', ProfileForm)`, the handler receives a real
  `instanceof ProfileForm` — `instanceof` checks require the target.
- **Validation + whitelist.** The Zod `convert` hook runs after binding.
  Object schemas strip unknown keys by default (zod ^4.5.4 — there is no
  `.stripUnknown()`); the no-schema path (`dataBinderValue(source)` without
  `validatedBy`) binds **everything** in the source.
- **Coercion.** Binding is string-typed (form fields arrive as strings); the
  pipeline has no per-property conversion hook — `z.coerce.number()` is the
  coercion surface.
- **Missing value.** An absent whole source with `{ required: true }` throws
  `MissingParameterError` (→ 400). An empty-but-present source binds to an
  empty object.
- **Form + query stay separate** in v1 — query fields do not fold into form
  binding (a documented divergence from Spring's combined `@ModelAttribute`).

Nested scalar reads coexist: `bodyValue('address.city')` reads one value out
of the JSON body without binding.

## 3. Multipart JSON parts — `requestPart`

`requestPart(part?, Target?)` binds a named `multipart/form-data` part like
`@RequestBody` — JSON parts parse to an object (raw-text fallback), bind into
an optional DTO instance, then validate. File parts stay `fileValue()` /
`MultipartFile`. The part name is explicit or the method-argument name
(AD-26 convention):

```ts
@postMapping('/upload')
@parameters({
    meta: requestPart(MetaDto),        // part "meta" → MetaDto instance
    biography: requestPart('bio'),     // explicit part name, plain object
    file: fileValue(),                 // file parts untouched
})
async upload(meta: MetaDto, biography: object, file: MultipartFile) { … }
```

`requestPart()` / `requestPart('bio')` yield plain objects; `requestPart(MetaDto)`
yields an `instanceof MetaDto`. Repeated parts (collapsed to `string[]` by the
parser) parse per element into an array.

## 4. Matrix parity

`matrixValue(name)` reads semicolon-separated matrix params from the mapping's
path segment (`/books;color=red`). Repeated params (`;tag=a;tag=b`) and
comma-joined values (`;id=1,2,3`) bind as arrays; the single-value path is
unchanged.

## 5. Missing values → 400

A required parameter missing from the request throws `MissingParameterError`
from every resolver — a `ParameterBindingError`, mapped to `400` by
`NodeParameterBindingErrorResolver` (was: an unmapped `TypeError` → 500).
Socket dispatch is unchanged (missing required params close the socket with
`1008`).

See [AD-27](../decisions/2026-09-24_AD27_ARGUMENT_BINDING.md) for the full
decision record and non-goals.
