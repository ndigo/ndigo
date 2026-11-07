# Package Documentation

How Ndigo packages document themselves — the standard every package must
meet, and the tooling that keeps it true. Applies to all
`packages/*`; the reference implementation of the standard is the
[`ndigo-generators`](../../tools/generators/README.md) scaffolding.

## Why this shape

Ndigo packages are deliberately standalone-readable: a developer who only
needs `@ndigo/http` should never have to open the framework monorepo docs.
So every package carries its own docs:

- **`README.md`** — the human-written entry point (purpose, install,
  usage, API pointer).
- **`api/`** — the generated TypeDoc reference tree, committed and
  CI-verified.
- **`package.json` metadata** — registry-facing fields (description,
  keywords, files) that make the package self-describing on npm.

The repo-root `API.md` is just an index linking into the
per-package references — no root-level generated site.

## The per-package README

Written for someone meeting the package for the first time. Required
section order (drop optional ones):

```markdown
# @ndigo/<name>

> One-line tagline — what it does and who it's for.

[2–3 sentences: the problem it solves, why it exists as a separate package.]

## Installation # pnpm add @ndigo/<name> + prerequisites

## Getting Started # smallest runnable example

## Usage # common patterns; ### subsections per feature

## Configuration # (optional) options table

## API # link to api/README.md; DO NOT re-list symbols

## Development # pnpm --filter @ndigo/<name> build:lib / test

## See Also # (optional) sibling packages

## Contributing # link to root CONTRIBUTING.md

## License # ISC
```

`pnpm manifest:check` enforces this skeleton: the required H2 set —
Installation, Getting Started, Usage, API, Development, Contributing,
License — must be present and in order. `Configuration` and `See Also`
stay optional.

Rules:

- No internal references: no `AD-##` ids, decision-record links, commit
  notes, or audit citations in package READMEs — those belong in `docs/`.
- The `## API` section is a _link_, not a dump. Hand-written symbol lists
  (e.g. `ndigo-scheduler`) are allowed only alongside the generated link.
- Package READMEs link packages by relative path (`../ndigo-util/README.md`).

## package.json metadata

| Field                                             | Requirement                                                                                    | Why                                   |
| :------------------------------------------------ | :--------------------------------------------------------------------------------------------- | :------------------------------------ |
| `description`                                     | ≥ 25 chars, non-generic (not `"Ndigo Cache"`); one-sentence value statement                    | npm listing, doc index, search        |
| `keywords`                                        | non-empty array incl. `"ndigo"` + domain tags                                                  | npm discoverability                   |
| `author`                                          | `"Jeff Rose <jeff_rose@outlook.com>"`                                                          | npm profile                           |
| `license`                                         | `"ISC"`                                                                                        | always                                |
| `files`                                           | `["api", "lib"]` for every package (enforced by `scripts/check-manifests.mjs`)                 | npm tarball ships only these + README |
| `repository` / `homepage` / `bugs`                | set at publish time, when a public remote exists                                               | npm links                             |
| `exports` / `sideEffects` / `type` / dep sections | enforced by `scripts/check-manifests.mjs` — see ARCHITECTURE.md "Manifest Dependency Sections" | install closure                       |

## Generated API docs

- **Generate:** `pnpm doc:api` (alias `pnpm doc`) — runs TypeDoc per package
  over the package's `src/` tree (`entryPointStrategy: expand`, so **one
  module per source file**), writing `packages/<name>/api/`, then regenerates
  the root `API.md` index.
- **Layout:** the reference mirrors the source tree. `api/README.md` lists
  every file as a module; each module page (`api/<file>.md`, or
  `api/<dir>/README.md` for a subpath entry point) lists that file's symbols;
  symbol pages are namespaced by their file
  (`api/<file>/classes/<Symbol>.md`). `_*.ts` files are the repo's
  internal-file convention and are excluded.
- **Package index description:** `scripts/typedoc-module-summary-plugin.mjs`
  lifts the package README's blockquote tagline onto the project reflection,
  so `api/README.md` opens with the same one-line description as the README.
  `@packageDocumentation` is deliberately not used: TypeDoc ignores it under
  `entryPointStrategy: expand` (probed 2026-11-06).
- **Function display:** TypeDoc converts a `const` to a Function only when the
  initializer is a function literal and the declaration has no type
  annotation. Factory-produced callables — guards such as
  `export const likeContentSource = like({...}) as (value) => value is ContentSource`,
  decorator factories, and re-export stubs — therefore stayed Variables.
  `scripts/typedoc-function-kind-plugin.mjs` reclassifies a function-typed
  constant as a Function when its type has call signatures, no properties, and
  no construct signatures, so those pages move under `## Functions` with the
  normal `Function: name()` rendering. Callable objects that carry members
  (`TagMapping`, `ViewMapping`, `errorHandler`, `errorMapping`) stay Variables
  so their member docs survive. No `@function` tag is used — that is not a
  TSDoc-standard tag and STYLE_GUIDE §5 rules it out.
- **Build before generating:** TypeDoc resolves cross-package types through
  the workspace symlinks into built `lib/`, so `pnpm build` must precede
  `pnpm doc:api` or the regenerated reference keeps the previous doc
  comments.
- **Zero-warning standard:** `treatWarningsAsErrors` is on. Broken JSDoc
  links fail the lane — that's the drift guard. Because modules are per file,
  an unqualified `{@link Name}` only resolves inside the declaring file; link
  across files of the same package as
  `{@link <module>.<Name> | Name}` (class members: `{@link <module>.<Type>#<member>}`).
- **Cross-package links:** each package's API reference is isolated, so a
  JSDoc link to a symbol in another package needs an entry in
  [`scripts/external-symbol-links.json`](../../scripts/external-symbol-links.json)
  (`{ "@ndigo/other": { "Symbol": "#" } }`). TypeDoc names the needed entry
  in its warning message — add it there, never in a package's own docs.
- **After any public API change:** update the JSDoc, run `pnpm doc:api`,
  commit the generated `api/` tree with the change.
- **Freshness:** CI regenerates the packages a PR affects — a package's
  `src/` **or** its manifest counts, since name/version/description reach the
  tree — and every package on the weekly sweep, then runs
  `git diff --exit-code -- packages API.md`, so stale docs fail the lane. A PR
  that changes the doc toolchain, or one with more changed files than the
  compare API reports (it caps the list at 300 entries, truncating it
  silently), regenerates everything instead of guessing. Locally:
  `pnpm doc:check` (full regeneration); `node scripts/doc-api.mjs --only
  <pkg-dir>` regenerates a single package.
- **Coverage gate:** `pnpm doc:api` fails when a **top-level exported**
  function, class, interface, or type alias has no doc comment (declaration
  or signature). By design: class/interface members, variables, and enum
  members are exempt (names self-document); `@internal` and `_`-prefixed
  internal files are exempt. Adding a public symbol with no comment is a
  CI failure — write the one-liner (type aliases included).
- **Depth ratchet:** `scripts/doc-coverage.mjs` tracks per-package documentation
  depth (module summaries, undocumented members, missing `@param`/`@returns`,
  example/remarks counts) against a committed baseline
  (`docs/tsdoc-baseline.json`). CI fails on regression; the baseline is
  refreshed as packages are cleaned, and is deleted once everything is at
  zero tolerance. Run `node scripts/doc-coverage.mjs --write-baseline` after
  a batch.
- **Named exports render readable pages:** TypeDoc derives each page's name
  from the declaration, so a default export renders as `default`
  (`api/<module>/classes/default.md`). Export named symbols and re-export them
  by name from `src/index.ts`; a stray `export default` is a documentation
  defect, not just a style one.
- **Empty doc blocks do not count as documentation:** an empty `/** */`
  satisfies the presence gate but renders nothing. Every block must carry a
  real one-line summary (file header) or a member description.
- **Example syntax:** `scripts/doc-examples.mjs` parses every fenced
  `@example` block as TypeScript; CI fails on syntax errors.
- **TSDoc syntax:** `internal/tsdoc-syntax` (oxlint) validates every doc
  comment against the TSDoc standard (`@microsoft/tsdoc`).
- **Module summaries:** `scripts/typedoc-module-summary-plugin.mjs` lifts the
  canonical file-header summary onto the generated module page, so
  `api/<file>/README.md` describes the module.

## Adding a new package

```bash
pnpm exec nx g @ndigo/generators:package --name mypackage --description "…"
pnpm exec nx g @ndigo/generators:readme --name mypackage --description "…"
pnpm doc:api
```

The generators emit the README template and manifest skeleton above; fill
in real content, then let `pnpm manifest:check` + `pnpm doc:api` validate.

## What is deliberately gone

- **No HTML docs** — `doc-html/`, `typedoc.html.json`, and `pnpm doc:html`
  were removed (2026-09). Markdown only.
- **No root generated site** — `typedoc.json` entry-point wizardry is
  replaced by `scripts/doc-api.mjs`; the root `API.md` is the
  generated index.
- **No per-package `README` duplication of the API** — the generated
  reference is the single source for signatures.
