# Guide 06 — Argument Binding

How handler arguments bind in Ndigo: the full source vocabulary, whole-source
**data binding** (`dataBinderValue` — the form/model-binding story), and
multipart **JSON parts** (`requestPart`). The engine mirrors the reference MVC layer's
resolver architecture — each parameter source is one resolver, first match
wins — and the binding machinery reuses `DataBinder` (keypath-aware,
core/isomorphic), `ConversionService`, and the Zod `convert` hook (guide 07).

**Audience:** Node and browser application developers · **Prerequisites:** Guide 01 (Node) or guide 02 (browser); guide 07 for validation · **Reference app:** `apps/05-ndigo-api`

## What you'll learn

- Pick the right extractor for each request source.
- Bind a whole source into a nested object with `dataBinderValue`.
- Read multipart JSON parts and matrix parameters.
- Turn missing required values into a 400 problem document.
- Register custom argument resolvers.

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
import { parameters, dataBinderValue, validatedBy, postMapping } from '@ndigo/dispatcher';

class ProfileForm {
    email = '';
    age = 0; // coerced by the schema; binding is string-typed
    address = { street: '', city: '' }; // client sends "address.street" / "address.city"
}

class ProfileController {
    @postMapping('/profile')
    @parameters({
        profile: validatedBy(
            z.object({
                email: z.string().email(),
                age: z.coerce.number(),
                address: z.object({ street: z.string(), city: z.string() }),
                // unknown keys are STRIPPED by default (zod ^4.5.4)
            }),
            dataBinderValue('body') // source in the type
        ),
    })
    async updateProfile(profile: ProfileForm) {
        // profile is a validated ProfileForm instance — not a Record
        return { ok: true, email: profile.email };
    }
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
  binding (a documented divergence from the reference framework's combined model-attribute binding).

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

### 4.1 Typed condition builders (AD-34 D6)

Mapping conditions stay canonical expression strings (`queryParams:
'filter=all'` — mapping tables deserialize from JSON and the registry
orders/merges conditions by string form). In-code, the builders produce
those strings with the real parser as the validator — a name or value that
would change meaning under the grammar throws at build time:

```ts
import { matrixParamCondition } from '@ndigo/dispatcher';

@getMapping({ value: '/:id', matrixParams: matrixParamCondition('color'), private: false })
getProduct(id: string) { … }           // presence check → 'color'

@requestMapping({ value: '/items', queryParams: queryParamCondition('filter', 'all', { negate: true }) })
method() { … }                          // → 'filter!=all'
```

## 5. Missing values → 400

A required parameter missing from the request throws `MissingParameterError`
from every resolver — a `ParameterBindingError`, mapped to `400` by
`NodeParameterBindingErrorResolver` (was: an unmapped `TypeError` → 500).
Socket dispatch is unchanged (missing required params close the socket with
`1008`).

## 6. Extending the chain — `registerArgumentResolvers` and `passthroughArgumentValue`

Each source in §1 is served by one `HandlerMethodArgumentResolver`, and the
resolver collection lives under the `ARGUMENT_RESOLVERS` context token — the
platform auto-configurations expose it (Node: `NodeAutoConfiguration.argumentResolvers`),
and the standalone helpers `configureNodeArgumentResolvers` /
`configureBrowserArgumentResolvers` register the same lists through
`registerArgumentResolvers`:

```ts
registerArgumentResolvers(context, resolvers);
```

- `registerArgumentResolvers(applicationContext, resolvers)` writes the array
  to `ARGUMENT_RESOLVERS` and returns it — the single registration entry point
  both platform configure functions share, so custom registration behaves
  identically on Node and browser.
- **Resolution order is array order.** The adapter discovers the registered
  resolvers (then a stand-alone resolver under the `ARGUMENT_RESOLVER` token)
  and appends its built-ins — path, matrix, query, attribute, route. The first
  `supportsParameter` match wins, so prepending a resolver is how you
  specialize an existing source without replacing the chain:

```ts
import { ARGUMENT_RESOLVERS, registerArgumentResolvers } from '@ndigo/dispatcher';

const current = context.getValue(ARGUMENT_RESOLVERS) ?? [];
registerArgumentResolvers(context, [new TenantQueryArgumentResolver(), ...current]);
```

A custom resolver implements `HandlerMethodArgumentResolver`
(`supportsParameter` + `resolveArgument` — both must be functions, the
discovery guard is `likeArgumentResolver`), or extends
`AbstractNamedValueMethodArgumentResolver` to reuse the shared named-value
pipeline: name lookup → default → `convertType` conversion → Zod `convert`
(`validatedBy`) → required-missing → `MissingParameterError` (400):

```ts
import { AbstractNamedValueMethodArgumentResolver, MethodParameter, MethodParameterType } from '@ndigo/dispatcher';
import type { Route } from '@ndigo/router';

/** `queryValue('tenant.*')` params read the query first, then the framework context. */
class TenantQueryArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: unknown): unknown {
        return route.data?.[name] ?? route.attributes?.[name.replace(/^tenant\./, '')];
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.QUERY.equals(parameter.type) && parameter.name.startsWith('tenant.');
    }
}
```

`passthroughArgumentValue` is the identity converter for resolvers whose
values are already final — uploaded file parts, parsed JSON parts — so the
pipeline still runs defaults and required handling but no type conversion.
Hand it to `AbstractPlatformArgumentResolver`, the base the platform resolvers
extend:

```ts
import { AbstractPlatformArgumentResolver, passthroughArgumentValue } from '@ndigo/dispatcher';

class UploadArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(passthroughArgumentValue); // values are final — skip ConversionService
    }

    // implement resolveName() + supportsParameter() as above
}
```

See [AD-27](../decisions/2026-09-24_AD27_ARGUMENT_BINDING.md) for the full
decision record and non-goals.

## See also

- [Guide 07 — Request Validation](07-request-validation.md) — schemas on top of the extractors
- [Guide 14 — Multipart & File Upload](14-multipart-and-file-upload.md) — `fileValue()` and request parts
- [`@ndigo/dispatcher`](../../packages/ndigo-dispatcher/README.md) — resolvers and parameter types
