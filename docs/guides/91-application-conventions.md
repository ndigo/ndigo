# Guide 91 — Application Conventions

How the demo applications under `apps/` are named and laid out. The rules keep
the ladder readable, keep package names stable across renumbering, and make a
file's role obvious before it is opened. They apply to new apps and to files
touched while changing an existing app; the [migration backlog](#migration-backlog)
lists the older shapes that are deliberately left for follow-up work.

**Audience:** Framework contributors · **Prerequisites:** Workspace bootstrapped; [guide 37](37-ndigo-cli.md) · **Reference app:** `[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)`

## What you'll learn

- Name directories, packages, and apps.
- Pair `-web` and `-api` applications.
- Apply role-based file suffixes and folder layout.
- Keep the demonstration ladder readable.
- Work through the deferred normalization backlog.

## 1. Directory and package names

Every application lives at:

```text
apps/NN-ndigo-<slug>
```

- `NN` is a two-digit reading-order number (`01`–`99`). It is **presentation
 only** — it never appears in a package name, import specifier, or nx target.
- `<slug>` is kebab-case and names the application, not its technology:
 `todo-web`, `todo-api`, `httpbin`, `petclinic`.
- The package name is `@ndigo/<slug>` — the directory's `ndigo-` prefix and
 number are dropped. `[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)` is `@ndigo/api`;
 `[apps/04-ndigo-todo-api](https://github.com/ndigo/ndigo/tree/main/apps/04-ndigo-todo-api)` is `@ndigo/todo-api`.
- The package is always `private: true`; apps are not published.

New apps append at the next free number. `ndigo new <slug> --kind node|browser`
allocates both the number and the dev port );
add the row to [apps/README.md](../../apps/README.md) by hand.

### Renumbering or renaming an app

The number is disposable and the slug is stable, so a reorder is a mechanical
sweep:

1. `git mv apps/<old> apps/<new>` (directory order is what changes).
2. Update `name` in the app's `package.json` only if the **slug** changed.
3. Run `pnpm install` to regenerate the workspace importers in
 `pnpm-lock.yaml`.
4. Sweep live references: `apps/README.md`, the root `README.md`, CI workflow
 paths/filters, `scripts/apps-smoke.mjs`, `scripts/check-migration-schema.mjs`
 (for the API's `db/`), package README links, current `docs/guides/**`, and
 source comments that cite an app path.
5. Validate with `pnpm typecheck`, the affected app tests, `pnpm lint`,
 `pnpm manifest:check`, `pnpm docs:links`, and `pnpm format`.
6. Refresh the graph with `graft build`.

Do **not** rewrite historical records: `docs/plans/`, `docs/decisions/`,
`docs/audits/`, dated migration guides, and `CHANGELOG.md` describe the tree as
it was when they were written.

## 2. Paired front-end and back-end apps

When a browser app and a server app are two halves of one product, use role
suffixes and put the pair next to each other:

| Role | Suffix | Examples |
|:---------------- |:----- |:------------------------------------------ |
| Browser front end | `-web` | `03-ndigo-todo-web`, `10-ndigo-conduit-web` |
| HTTP/API back end | `-api` | `04-ndigo-todo-api`, `11-ndigo-conduit-api` |

The web half comes first in the ladder. Back ends with no paired front end keep
their domain name (`05-ndigo-api`, `09-ndigo-httpbin`). Do not use
`-backend`, `-server`, or `-client` as product suffixes; reserve `client/` for
the browser build directory inside an app that serves its own client.

The current pairs are:

| Web | API |
|:--------------------- |:--------------------- |
| `03-ndigo-todo-web` | `04-ndigo-todo-api` |
| `10-ndigo-conduit-web` | `11-ndigo-conduit-api` |

## 3. Source layout

A small app may keep a flat `src/` — `01-ndigo-hello` and `02-ndigo-hello-node`
are intentionally this small. Once a role has more than one file, group it:

```text
src/
├── app/                  # composition roots, runtime, tokens, bootstrap helpers
├── controllers/          # HTTP / socket entry points
├── services/             # domain and application services
├── repositories/         # persistence adapters over @ndigo/orm or a driver
├── entities/             # ORM entities (*.entity.ts)
├── dtos/                 # DTOs (*.dto.ts)
├── interceptors/         # pipeline interceptors
├── views/                # view classes and server-rendered views
├── components/           # Web Components / islands
└── index.ts              # process or browser entry point
```

Use only the folders the app needs. Keep the entry point at `src/index.ts`; a
browser app that also ships a server-owned client uses `client/` for the
browser bundle entry and `src/` for the server.

### File names

Files are kebab-case and end with the role they play:

| Suffix | Holds |
|:----------------------- |:------------------------------------------------------------------------------------ |
| `*-controller.ts` | HTTP/socket handlers (`todo-controller.ts`) |
| `*-service.ts` | Domain/application operations (`todo-service.ts`) |
| `*-repository.ts` | Persistence adapter (`note-repository.ts`) |
| `*-store.ts` | A minimal in-memory collection; prefer `-repository` once it wraps a real data source |
| `*-configuration.ts` | DI composition/config root (`todo-configuration.ts`) |
| `*-interceptor.ts` | One interceptor class |
| `*-http-interceptors.ts` | A wiring module that installs several interceptors |
| `*-resolver.ts` | View/argument resolver (`status-view-resolver.ts`) |
| `*-view.ts` | A view or Web Component that renders (`report-view.ts`) |
| `*-handler.ts` | Processes a request/event |
| `*-strategy.ts` | Encapsulates an interchangeable algorithm |
| `*-factory.ts` | Creates instances |
| `*-registry.ts` | Stores registered objects |
| `*-adapter.ts` | Adapts an external interface |
| `*.entity.ts` | ORM entity (`todo.entity.ts`) |
| `*.dto.ts` | Data-transfer object (`todo.dto.ts`) |

Notes:

- The `*.entity.ts` / `*.dto.ts` dot suffixes are the established framework
 convention; keep the dot, not a hyphen.
- A module that would otherwise be called `interceptors.ts` takes a domain
 prefix — `todo-http-interceptors.ts` — so its purpose survives a folder move.
- Avoid generic basenames such as `entities.ts`, `models.ts`, `store.ts`,
 `views.ts`, `services.ts`, `config.ts`, or `utils.ts`. Split them by domain or
 give them a domain prefix. `_util.ts` remains the package-internal escape
 hatch described in the STYLE_GUIDE; it is not an application catch-all.
- Name the primary export after the file: `todo-controller.ts` exports
 `TodoController`, `todo-configuration.ts` exports `TodoConfiguration`.
 Acronyms follow the STYLE_GUIDE casing rules (`HTTPController`, but
 `httpTransformer` in identifiers).

### Tests

- Unit and integration specs live in `test/` and mirror the source subject:
 `src/todo-controller.ts` → `test/todo-controller.spec.ts`.
- Shared in-process harnesses live in `test/harness.ts`; fixtures that are not
 specs use a descriptive name, not `_`-prefixed package internals.
- End-to-end specs live in `e2e/*.spec.ts` and are driven by Playwright.
- One spec file per subject; a file that needs the whole app composition is an
 integration spec (`api.integration.spec.ts`, `conduit-api.spec.ts`).

## 4. Package manifest and README

Every app carries:

- `name` = `@ndigo/<slug>`, `private: true`, `type: "module"`.
- `dev` (Vite) or `start` (Node/`tsx`); `build` or `build:client` where the app
 has a build step; `test`; `test:e2e` for Playwright lanes.
- A README with the standard sections: tagline, **Run**, **Demonstrates** (or
 equivalent), **Development**, **See Also**, **Contributing**, **License**.
- A row in [apps/README.md](../../apps/README.md) with the directory, package,
 runtime, dev port, and one-line purpose.

## 5. Applying the convention

Prefer normalizing files you already have to touch rather than opening a
standalone refactor. A rename is safe when it is mechanical and covered by the
app's test lane; run that lane and `pnpm typecheck` before and after.

### Migration backlog

The directory and package renames are complete. These file-level shapes remain
and are deferred so the ladder stays reviewable:

| App | Current shape | Target shape |
|:--------------------- |:---------------------------------------------------------------------------------------------------------------------------------------------------- |:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `11-ndigo-conduit-api` | Flat `src/`: `entities.ts` (User, Article, Comment, Favorite, Follow), `schemas.ts`, `store.ts`, `views.ts`, `auth.ts`, `errors.ts`, `presenter.ts` | `entities/` with `user.entity.ts`, `article.entity.ts`, `comment.entity.ts`, `favorite.entity.ts`, `follow.entity.ts`; `conduit-store.ts`; `views/article-view.ts` + `comment-view.ts` |
| `12-ndigo-petclinic` | Flat `src/`: `entities.ts` (Owner, Pet, PetType, Visit, Vet, Specialty, VetSpecialty), `forms.ts`, `messages.ts`, `responses.ts`, `request-values.ts` | `entities/` per entity, `forms/`, `messages/`; keep the domain-prefixed root files |
| `10-ndigo-conduit-web` | Role folders already in place; the last generic names are `views/models.ts` and `app/conduit-services.ts` | `views/models.ts` → per-resource `*.dto.ts`; `conduit-services.ts` is already domain-prefixed and may stay |

Each row is a candidate for the next touch of that app, not a licence for a
repo-wide rename. When a row is complete, delete it from this table.

## See also

- [apps/README.md](../../apps/README.md) — the numbered ladder, ports, and per-app index
- [STYLE_GUIDE.md](../../STYLE_GUIDE.md) — file, symbol, and role-suffix rules in the framework packages
- [guide 37 — The `ndigo` CLI](37-ndigo-cli.md) — `ndigo new` allocates the next app number and port

[Back to guides](./README.md)
