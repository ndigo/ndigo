# @ndigo/petclinic — PetClinic (server-rendered)

> The [spring-petclinic](https://github.com/spring-projects/spring-petclinic) vertical — owners, their pets,
> clinic visits and the veterinarian directory — ported onto Ndigo as a server-rendered EJS application
> over an in-memory `@ndigo/orm` store, with the same resources available as JSON.

PetClinic is a reference web application in the enterprise sample tradition: a small,
form-driven CRUD vertical that exercises exactly the surface a server-rendered
framework has to get right — search and paging, aggregate pages, five
create/update forms, per-field validation that re-renders with the user's input
intact, post/redirect/get, 404 pages and a JSON representation of the same
resources. This app ports those **flows**, not the Java: the pages, the URLs, the
validation rules and the sample data are the reference's; the implementation is
Ndigo end to end — `@ndigo/dispatcher` controllers, `@ndigo/view-ejs` templates,
`@ndigo/orm` entities, `@ndigo/content-i18next` messages and Zod form contracts.

## Run

```bash
cd apps/12-ndigo-petclinic && pnpm start
# PORT=3050 by default (reserved for this app — see apps/README.md)
```

```bash
# the welcome page (the boot-smoke probe path)
curl -s localhost:3050/ | grep '<h1>'

# owner search, five rows at a time; an empty last name lists everybody
curl -s 'localhost:3050/owners?lastName=Davis'
curl -s 'localhost:3050/owners?page=2'

# the same search in the page's second language
curl -s -H 'Accept-Language: fr' localhost:3050/owners | grep '<h1>'

# the create-owner form round trip: a failed post re-renders, a good one redirects
curl -s -X POST localhost:3050/owners/new -d 'firstName=Ada&lastName=Lovelace&address=1 Analytical Ave.&city=London&telephone=6085550001'
# → 302, Location: /owners/13

# adding a pet and a visit to an existing owner
curl -s -X POST localhost:3050/owners/6/pets/new -d 'name=Paws&birthDate=2021-03-04&typeId=6'
curl -s -X POST localhost:3050/owners/6/pets/8/visits/new -d 'visitDate=2024-06-01&description=booster+shot'

# the JSON representations of the same resources
curl -s localhost:3050/api/owners?lastName=Davis
curl -s localhost:3050/api/owners/6
curl -s localhost:3050/api/vets
```

Environment:

| Variable | Default | Purpose     |
| -------- | ------- | ----------- |
| `PORT`   | `3050`  | Listen port |

## Pages and endpoints

**Server-rendered pages** (`views/*.ejs`, `text/html`, the request's negotiated
language):

| Method | Path                                 | Purpose                                                          |
| ------ | ------------------------------------ | ---------------------------------------------------------------- |
| GET    | `/`                                  | Welcome page: section links, seeded counts, static assets        |
| GET    | `/owners?lastName=&page=`            | Owner search — last-name prefix, 5 per page, rows link to detail |
| GET    | `/owners/new`                        | Create-owner form                                                |
| POST   | `/owners/new`                        | Create → `302 /owners/:id`; invalid input re-renders the form    |
| GET    | `/owners/:id`                        | Owner detail: contact block, pets, each pet's visits             |
| GET    | `/owners/:id/edit`                   | Update-owner form, prefilled                                     |
| POST   | `/owners/:id/edit`                   | Update → `302 /owners/:id`; invalid input re-renders the form    |
| GET    | `/owners/:id/pets/new`               | Add-pet form (name, birth date, type select)                     |
| POST   | `/owners/:id/pets/new`               | Add pet → `302 /owners/:id`                                      |
| GET    | `/owners/:id/pets/:petId/edit`       | Update-pet form, prefilled                                       |
| POST   | `/owners/:id/pets/:petId/edit`       | Update pet → `302 /owners/:id`                                   |
| GET    | `/owners/:id/pets/:petId/visits/new` | Add-visit form                                                   |
| POST   | `/owners/:id/pets/:petId/visits/new` | Record visit → `302 /owners/:id`                                 |
| GET    | `/vets?page=`                        | Veterinarian directory with specialties, 5 per page              |
| GET    | `/static/*`                          | `public/petclinic.css`, `public/logo.svg` (ETag/Range/caching)   |

**JSON representations** (`application/json`, the same data, DTO-shaped):

| Method | Path                          | Purpose                                           |
| ------ | ----------------------------- | ------------------------------------------------- |
| GET    | `/api/owners?lastName=&page=` | `{owners, page, size, totalElements, totalPages}` |
| GET    | `/api/owners/:id`             | One owner document with pets, types and visits    |
| GET    | `/api/vets?page=`             | `{vets, page, size, totalElements, totalPages}`   |

**Errors.** An unknown owner or pet is the rendered 404 page with status `404`
(the `error/not-found` view name the app's resolver serves at 404) on the HTML
routes, and an RFC 9457 `application/problem+json` document with
`type: urn:ndigo:not-found` on the `/api` routes. A malformed id
(`/owners/abc`) answers exactly like a missing row rather than becoming a 500.

### Content negotiation: why an explicit `/api` mapping

JSON is published under `/api/...` rather than by negotiating `Accept` on the
page routes. The two representations do not share a model: a page model carries
form state (`values`, `errors` as message _keys_), paging labels and raw
entities, while a resource document carries the reference REST API's payload
shape (owner → pets → type/visits, vet → specialties). A per-name
`ContentNegotiationViewResolver` would have to re-project the model anyway, so
the explicit mapping keeps each contract honest and lets both be asserted
without header juggling. `ContentNegotiationViewResolver` remains the right tool
for one model in several representations — see
[`apps/07-ndigo-views`](../07-ndigo-views/README.md) and
[`apps/04-ndigo-api`](../04-ndigo-api/README.md).

## Domain and storage

`@ndigo/orm` entities in `src/entities.ts`: `Owner` (with a `pets` relation),
`Pet` (with `type` and `visits`), `Visit`, `Vet`, `Specialty`, `PetType`, and a
`VetSpecialty` link row. Column metadata doubles as the write-time validation
source (AD-07), and relations are real `@oneToMany`/`@manyToOne` declarations
fetched through `findById(id, { relations: ['pets'] })`. Vet ↔ specialty is a
many-to-many relation the in-memory manager deliberately does not resolve, so it
is modelled the way the reference database models it — an explicit join row
joined in two scans.

The repository/service seam:

- `src/clinic-repository.ts` — `ClinicRepository` over one `EntityManager`, with
  one `AbstractRepository` per entity plus the reference's queries
  (`findByLastNameStartingWith`, vet paging) and the cross-entity reads
  (`findOwnerWithPets`, `visitsOf`, `specialtiesOf`). This is the swap point: a
  SQL/Drizzle `EntityManager` means constructing this class differently and
  nothing else changes.
- `src/clinic-service.ts` — the domain operations the pages call
  (`searchOwners`, `ownerDetail`, `petDetail`, `createOwner`, `addPet`,
  `addVisit`, `vetsPage`), returning `undefined` for a miss so each controller
  picks its own 404 idiom.

Sample data is `spring-petclinic`'s
[`db/postgres/data.sql`](https://github.com/spring-projects/spring-petclinic/blob/main/src/main/resources/db/postgres/data.sql):
ten owners, fifteen pets (plus one each for the two classic extra owners),
five visits, six vets, three specialties and six pet types, seeded in the
reference's order so the generated ids match the reference's (`/owners/6` is
Jean Coleman, `/owners/6/pets/7` is Samantha) and the next created owner is
`13`. Two owners the classic fixture set names — `Bonnie Davis`, `Nancy
McArdle` — are included; that keeps the owner list at three pages of five.

## Demonstrates

- `@ndigo/view-ejs` **EJS pages through a view resolver** — controllers return
  view _names_ and models, templates are resolved by name, includes are partial
  templates, and `t(...)`/`formatDate(...)`/`formatList(...)` resolve per
  request.
- **Rendering a page with a status**: `src/views/status-view-resolver.ts` shows
  the seam — an `EJSView` subclass whose `renderTo` produces the status
  alongside the document, chosen by view name, with every other name delegated
  to the standard resolver.
- `@ndigo/dispatcher` **whole-source form binding** (`dataBinderValue('body')`,
  guide 09) on every post, with **Zod** as the single validation source
  (`src/forms.ts`) and **query validation** (`validatedQuery`) for the paged
  searches.
- **Validation that re-renders instead of failing**: the reason the form schemas
  are parsed in the handler rather than attached with `validatedBy` is
  documented in `src/forms.ts` — a schema failure there is a `422` problem
  document (right for the API, wrong for a form). The Zod issue's `message` _is_
  the i18n key, so a failure renders prose in the request's language.
- `@ndigo/content-i18next` — the whole UI is keyed (`src/messages.ts`, `en` +
  `fr`), the language comes from `Accept-Language` (`curl -H 'Accept-Language:
  fr' /owners` renders French labels _and_ French validation messages).
- **Post/redirect/get** with a `302` + `Location` response, so a reload cannot
  re-post a form.
- `@ndigo/platform-node` — `StaticController` serving the app's stylesheet and
  logo, the platform's security headers, and `problemEntity` for the API's 404.
- `@ndigo/orm` relations (`@oneToMany`/`@manyToOne`), entity-derived column
  validation, `pageFromAll` paging with explicit sort allowlists, and the
  identity generator (seeded rows take ids 1..n, new rows continue from there).
- `@ndigo/test` — the whole app driven in-process, including the real EJS
  templates.

## Tests

```bash
pnpm --filter @ndigo/petclinic test
```

41 cases in `test/petclinic.integration.spec.ts`, dispatched through the real
pipeline (routing, binding, validation, view resolution, HTTP contract) against
the real `views/*.ejs` files:

- **pages** — the welcome page and its localized variant, the owner list with
  its paging window (`page=3`, an out-of-range page, a prefix search, a
  lower-case search, an unknown last name), the detail page with pets and
  visits, the vet directory and its second page, the static asset;
- **forms** — every GET form renders its fields (and the pet type select), a
  failed POST re-renders with the entered values _and_ per-field messages
  (empty body, bad alpha values, a bad date, a future date, an unknown type id),
  the prefilled edit forms, and each successful POST's `302` + resulting state;
- **JSON** — the owner list, a single owner (pets, types, visit order), the vet
  list, the 404 problem document, and an unrouted path;
- **404s** — unknown owner, non-numeric id, a pet belonging to another owner, an
  unknown pet.

The suite boots one app and orders its groups so no read-only assertion is
invalidated by a later write.

## Reference: what was ported, what was simplified

**Reference application:** <https://github.com/spring-projects/spring-petclinic>
(boot + MVC + JPA). The ported surface is its feature list: the
welcome page, the owner search with paging, owner detail with pets and visits,
the five create/update forms with the reference's validation rules (required
alpha names, required address and city, 10-digit telephone, a required pet type
select), the vet list with specialties, and its sample data.

Ported as written, because they are the point of the app:

- URL shapes (`/owners/new`, `/owners/:id/edit`, `/owners/:id/pets/:petId/visits/new`),
  including the static-vs-`:id` routing of `/owners/new`;
- the search semantics (last-name **prefix**, case-insensitive) and page size 5;
- per-field validation messages that re-render the form with the user's input
  preserved (`200`, as the reference does), and post/redirect/get on success.

Deliberately simplified or replaced:

| Reference                                  | This app                                                                                                          |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| JPA + HSQLDB/MySQL/PostgreSQL schema       | `@ndigo/orm` in-memory entities seeded from the reference's `data.sql`; no external service                       |
| Thymeleaf templates + fragments            | EJS templates + partial includes                                                                                  |
| `MessageSource` + `messages_*.properties`  | `@ndigo/content-i18next` bundles in `src/messages.ts` (`en`, `fr`)                                                |
| Bean Validation on the entity/DTO          | Zod schemas shared with the entity column metadata as the write-time gate                                         |
| `spring-petclinic-rest`'s separate modules | The same JSON shapes, served by the same app under `/api`                                                         |
| Vet CRUD (`spring-petclinic-rest`)         | Read-only vet list — the reference web app's own scope, where vets are not editable                               |
| Owner "find" autocomplete, spring-security | Out of scope: this port covers the classic server-rendered flows, not authentication or the REST deployment shape |

## See Also

- [apps/README](../README.md) — the numbered application ladder and port registry
- [06 — ndigo-island](../06-ndigo-island/README.md) — EJS view resolution,
  static asset serving and i18n in a Node app
- [02 — Request Validation](../../docs/guides/02-request-validation.md) — Zod
  contracts, `validatedQuery`/`validatedBody`, the 422 document
- [09 — Argument Binding](../../docs/guides/09-argument-binding.md) —
  `dataBinderValue` and the whole-source form path
- [04 — i18n and Content](../../docs/guides/04-i18n-and-content.md) — message
  sources, template helpers, locale negotiation
- [17 — Static Files](../../docs/guides/17-static-files.md) — `StaticController`
  semantics
- [19 — Testing](../../docs/guides/19-testing.md) — `bootApp` + `MockHTTP`
- [@ndigo/orm](../../packages/ndigo-orm/README.md) — entities, relations, paging
- [@ndigo/view-ejs](../../packages/ndigo-view-ejs/README.md) — the EJS view
  technology
- [spring-petclinic](https://github.com/spring-projects/spring-petclinic) — the
  reference application (Apache-2.0)

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
