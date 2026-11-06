# @ndigo/conduit-api — RealWorld (Conduit) API

> The [RealWorld](https://github.com/gothinkster/realworld) “Conduit” backend — users, JWT auth, articles, tags, comments, follows and favorites — built as a conformance probe on `@ndigo/platform-node`.

The RealWorld spec is the machine-readable target (`specs/api/openapi.yml`) and the
official API-test collection is the independent oracle: an external checklist that
says nothing about Ndigo internals. This app answers the whole surface over a
`@ndigo/platform-node` pipeline — Zod-validated bindings, in-memory ORM entities,
a `@ndigo/auth-server` JWT and a spec-exact `{errors:{…}}` envelope — with zero
external infrastructure, so the whole flow runs from a clean checkout.

## Run

```bash
cd apps/11-ndigo-conduit-api && pnpm start
# PORT=3040 by default (reserved for this app — see apps/README.md)
```

```bash
# Register → the response carries the JWT
curl -s -X POST localhost:3040/api/users \
  -H 'content-type: application/json' \
  -d '{"user":{"username":"alice","email":"alice@example.com","password":"alice-secret"}}'

# Authenticated write: Authorization: Token <jwt>
curl -s -X POST localhost:3040/api/articles \
  -H 'content-type: application/json' \
  -H "Authorization: Token $TOKEN" \
  -d '{"article":{"title":"How to conform","description":"d","body":"b","tagList":["realworld"]}}'

curl -s localhost:3040/api/articles?tag=realworld&limit=20&offset=0
curl -s localhost:3040/api/tags
```

Environment:

| Variable                   | Default                           | Purpose                                   |
| -------------------------- | --------------------------------- | ----------------------------------------- |
| `PORT`                     | `3040`                            | Listen port                               |
| `NDIGO_CONDUIT_JWT_SECRET` | dev fallback (43 bytes)           | HS256 signing secret — set this in prod   |
| `NDIGO_CONDUIT_SCRYPT_LN`  | `17` (OWASP floor, ~128 MiB/hash) | scrypt cost exponent for password hashing |

## Endpoints

All routes are JSON. `Authorization: Token <jwt>` marks the protected ones; a
missing header is `401 {"errors":{"token":["is missing"]}}` and an unusable token
is `401 {"errors":{"token":["is invalid"]}}` — including on the optional-auth
reads, which fail closed rather than silently degrading to anonymous.

**User and authentication**

```text
POST   /api/users                                  → 201 {user} | 422 duplicates/validation
POST   /api/users/login                            → 200 {user} | 401 wrong credentials
GET    /api/user                       (Token)     → 200 {user} | 401
PUT    /api/user                       (Token)     → 200 {user} | 401 | 422
```

**Profiles**

```text
GET    /api/profiles/:username                     → 200 {profile} | 404
POST   /api/profiles/:username/follow  (Token)     → 200 {profile} | 401 | 404
DELETE /api/profiles/:username/follow  (Token)     → 200 {profile} | 401 | 404
```

**Articles**

```text
GET    /api/articles?tag=&author=&favorited=&limit=&offset=  → 200 {articles,articlesCount}
GET    /api/articles/feed              (Token)     → 200 {articles,articlesCount} | 401
POST   /api/articles                   (Token)     → 201 {article} | 401 | 422
GET    /api/articles/:slug                         → 200 {article} | 404
PUT    /api/articles/:slug             (author)    → 200 {article} | 401 | 403 | 404
DELETE /api/articles/:slug             (author)    → 204 | 401 | 403 | 404
POST   /api/articles/:slug/favorite    (Token)     → 200 {article} | 401 | 404
DELETE /api/articles/:slug/favorite    (Token)     → 200 {article} | 401 | 404
```

**Comments**

```text
GET    /api/articles/:slug/comments                → 200 {comments} | 404
POST   /api/articles/:slug/comments    (Token)     → 201 {comment} | 401 | 404 | 422
DELETE /api/articles/:slug/comments/:id (author)   → 204 | 401 | 403 | 404
```

**Tags**

```text
GET    /api/tags                                   → 200 {tags}
```

### Behavior pinned down

- **Payload shapes** are the spec's: articles carry
  `{slug,title,description,body,tagList,createdAt,updatedAt,favorited,favoritesCount,author:{username,bio,image,following}}`;
  list/feed items are the same minus `body` (the spec's list schema has no
  `body`, and the official collection asserts its absence); `favorited`,
  `favoritesCount` and `following` are view-relative.
- **Slugs** derive from the title (lowercased, non-alphanumerics → `-`) and stay
  unique: a repeated title gets a `-<n>` suffix, and a retitle re-derives the
  slug (the old URL then `404`s).
- **Idempotent edges**: favoriting an already-favorited article and re-following
  return `200` with an unchanged count, so a retried request cannot drift state.
- **Ownership** is `403 {"errors":{"article":["forbidden"]}}` (or `comment`),
  distinct from the `404` an unknown slug produces.
- **Deletes** are `204`; deleting an article cascades to its comments and
  favorites.
- **Validation** is `422` with the field-keyed envelope; `bio`/`image` accept
  `null` and normalize `""` to `null` (the collection's normalization rule).

## Storage

In-memory ORM entities (`@ndigo/orm`): `User`, `Article`, `Comment`, `Favorite`
and `Follow`, each a real `@entity` with `@column` metadata that doubles as the
Zod validation source (AD-07).

Every handler goes through `ConduitStore` (`src/store.ts`) — the persistence
seam. It exposes domain operations (register, publish, favorite, follow, filter,
page) and nothing else, so swapping the in-memory manager for a
Drizzle/SQL-backed `EntityManager` means re-implementing that one class against
the same method surface; controllers, serializers and tests are unchanged.

## Demonstrates

- `@ndigo/auth-server` `JWTAdapter` — HS256 issuance/validation as the RealWorld
  `Token <jwt>` scheme, `sub` = account id, issuer/audience pinned, 24 h TTL.
- `@ndigo/auth-core` `DelegatingPasswordEncoder` — self-describing scrypt hashes,
  so cost parameters can move without invalidating stored passwords.
- `@ndigo/dispatcher` `validatedBody` / `validatedQuery` — Zod contracts on the
  whole body and the whole query (coerced paging bounds).
- A **custom error resolver** placed first in the chain
  (`ConduitConfiguration.errorResolvers`) that rewrites framework binding
  failures into the RealWorld envelope, plus a `ProducerView` error body — the
  framework's RFC 9457 rewrite for `>=400` responses is deliberately bypassed
  (see the conformance note and `src/errors.ts`).
- Ownership/visibility logic: optional-auth reads, author-only writes, cascading
  deletes, view-relative flags computed from single-scan indexes.
- `ResponseEntity.created` / `.noContent` for the spec's `201`/`204` statuses.
- `@ndigo/orm` in-memory entities with `@prePersist`/`@preUpdate` timestamp hooks.
- `@ndigo/test` `MockHTTP` — the whole flow without binding a port.

## Tests

```bash
pnpm --filter @ndigo/conduit-api test
```

29 focused cases in `test/conduit.integration.spec.ts`, dispatched through the
real pipeline: register → login → current user → profile/follow → publish →
favorite → comment → list with filters and paging → update → delete → tags, plus
the auth matrix (missing vs invalid token, wrong scheme, optional-auth reads),
ownership (`403` vs `404`), the validation envelope, and the list-vs-single
payload shapes.

## Conformance note

**Spec referenced:** `specs/api/openapi.yml` in
[`realworld-apps/realworld`](https://github.com/realworld-apps/realworld) (the
`gothinkster/realworld` name redirects here), OpenAPI `2.0.0`, fetched from
commit [`98ff1a9f1b0b89f38b1aff7e1fb238718226a81f`](https://github.com/realworld-apps/realworld/blob/98ff1a9f1b0b89f38b1aff7e1fb238718226a81f/specs/api/openapi.yml)
(the last commit touching the spec; blob `820a0f9b…`). The spec is MIT-licensed.

**Collection referenced:** the official API-test suite in the same repo and
commit — `specs/api/hurl/*.hurl` (`auth`, `articles`, `comments`, `favorites`,
`feed`, `pagination`, `profiles`, `tags` and the five `errors_*.hurl` files),
run by `specs/api/run-api-tests-hurl.sh`; a Bruno collection generated from it
lives in `specs/api/bruno/`. The historical Postman/Newman collection is
[`gothinkster/realworld-e2e-tests`](https://github.com/gothinkster/realworld-e2e-tests).
**Nothing is vendored here** — the collection's assertions were read as the
oracle and folded into the repo-local Vitest suite above, which covers the same
checklist offline with no `hurl`/`newman` dependency.

**Known deviations** (each is a deliberate choice, not an oversight):

| #   | Surface                     | Official expectation                                                  | This app                                                                      | Why                                                                                                                                  |
| --- | --------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Duplicate registration      | `409` + `{"errors":{"username":["has already been taken"]}}`          | `422` + the same body                                                         | The task assigns one error envelope for validation _and_ conflict; the body matches the collection exactly, only the status differs. |
| 2   | Wrong-password login status | `401` (collection also pins `{"errors":{"credentials":["invalid"]}}`) | `401` + `{"errors":{"credentials":["invalid"]}}`                              | Aligned with the collection.                                                                                                         |
| 3   | Error body media type       | `application/json`                                                    | `application/json` (errors) / `application/problem+json` for unrouted 404/405 | Unknown routes and wrong methods never reach a controller, so the framework's problem document answers them — see below.             |

Non-deviations worth recording, because each is asserted by the collection and
verified here: blank-field messages (`"can't be blank"`) and their field keys;
`422` for an empty/null `email`/`username` on update; `""` → `null` for
`bio`/`image`; `401` for every protected route with no token; `403` vs `404`
distinction on writes; `404 {"errors":{"article":["not found"]}}` for an unknown
slug on read, update, delete and favorite; duplicate titles allowed with distinct
slugs; list items without `body`; `articlesCount` = total matches while `limit`
bounds the page; newest-first ordering; feed items carrying
`author.following: true`; comment ordering oldest-first; favorite counts that
move by exactly one.

### Why the error envelope needs its own view

`apps/05-ndigo-api` documents the framework's contract: every `>=400` response is
an `application/problem+json` document (AD-10), and `ResponseEntityView` enforces
it — any 4xx/5xx `ResponseEntity` body is rewritten. RealWorld requires
`{"errors":{…}}` with `application/json`, so this app answers errors with a
`ProducerView` (`ConduitErrorView`) instead of a `ResponseEntity`, and its first
error resolver translates Zod/binding failures into the same envelope. The
framework itself is unmodified; this is a documented alternative rendering path.

## See Also

- [apps/README](../README.md) — the numbered application ladder and port registry
- [02 — Request Validation](../../docs/guides/02-request-validation.md) — the
  `validatedBody`/`validatedQuery` surface and the framework's 422 document
- [01 — Building a Node API](../../docs/guides/01-building-a-node-api.md) —
  bootstrap, controllers, binding, the RFC 9457 error contract
- [@ndigo/platform-node](../../packages/ndigo-platform-node/README.md) — the Node
  platform foundation
- [@ndigo/auth-server](../../packages/ndigo-auth-server/README.md) — JWT adapter
- [@ndigo/orm](../../packages/ndigo-orm/README.md) — entities and schema derivation
- [RealWorld spec](https://github.com/realworld-apps/realworld/tree/main/specs/api)
  — `openapi.yml` plus the official Hurl/Bruno API-test collections

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
