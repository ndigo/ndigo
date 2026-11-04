# Package Documentation

How BlueJS packages document themselves — the standard every package must
meet, and the tooling that keeps it true. Applies to all
`packages/*`; the reference implementation of the standard is the
[`blue-generators`](../../packages/blue-generators/README.md) scaffolding.

## Why this shape

BlueJS packages are deliberately standalone-readable: a developer who only
needs `@blue/http` should never have to open the framework monorepo docs.
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
# @blue/<name>

> One-line tagline — what it does and who it's for.

[2–3 sentences: the problem it solves, why it exists as a separate package.]

## Installation # pnpm add @blue/<name> + prerequisites

## Getting Started # smallest runnable example

## Usage # common patterns; ### subsections per feature

## Configuration # (optional) options table

## API # link to api/README.md; DO NOT re-list symbols

## Development # pnpm --filter @blue/<name> build:lib / test

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
  (e.g. `blue-scheduler`) are allowed only alongside the generated link.
- Package READMEs link packages by relative path (`../blue-util/README.md`).

## package.json metadata

| Field                                             | Requirement                                                                                            | Why                                   |
| :------------------------------------------------ | :----------------------------------------------------------------------------------------------------- | :------------------------------------ |
| `description`                                     | ≥ 25 chars, non-generic (not `"Blue Cache"`); one-sentence value statement                             | npm listing, doc index, search        |
| `keywords`                                        | non-empty array incl. `"bluejs"` + domain tags                                                         | npm discoverability                   |
| `author`                                          | `"Jeff Rose <jeff_rose@outlook.com>"`                                                                  | npm profile                           |
| `license`                                         | `"ISC"`                                                                                                | always                                |
| `files`                                           | `["doc", "lib"]` for every package; `@blue/generators` additionally ships `["src", "generators.json"]` | npm tarball ships only these + README |
| `repository` / `homepage` / `bugs`                | set at publish time, when a public remote exists                                                       | npm links                             |
| `exports` / `sideEffects` / `type` / dep sections | enforced by `scripts/check-manifests.mjs` — see ARCHITECTURE.md "Manifest Dependency Sections"         | install closure                       |

## Generated API docs

- **Generate:** `pnpm doc:api` (alias `pnpm doc`) — runs TypeDoc per package
  over the package's `exports` map, writing `packages/<name>/api/`,
  then regenerates the root `API.md` index.
- **Zero-warning standard:** `treatWarningsAsErrors` is on. Broken JSDoc
  links fail the lane — that's the drift guard.
- **Cross-package links:** each package's API reference is isolated, so a
  JSDoc link to a symbol in another package needs an entry in
  [`scripts/external-symbol-links.json`](../../scripts/external-symbol-links.json)
  (`{ "@blue/other": { "Symbol": "#" } }`). TypeDoc names the needed entry
  in its warning message — add it there, never in a package's own docs.
- **After any public API change:** update the JSDoc, run `pnpm doc:api`,
  commit the generated `api/` tree with the change.
- **Freshness:** CI regenerates the packages a PR affects — and every package
  on the weekly sweep — then runs `git diff --exit-code -- packages API.md`, so
  stale docs fail the lane. Locally: `pnpm doc:check` (full regeneration);
  `node scripts/doc-api.mjs --only <pkg-dir>` regenerates a single package.
- **Coverage gate:** `pnpm doc:api` fails when a **top-level exported**
  function, class, interface, or type alias has no doc comment (declaration
  or signature). By design: class/interface members, variables, and enum
  members are exempt (names self-document); `@internal` and `_`-prefixed
  internal files are exempt. Adding a public symbol with no comment is a
  CI failure — write the one-liner (type aliases included).

## Adding a new package

```bash
pnpm exec nx g @blue/generators:package --name mypackage --description "…"
pnpm exec nx g @blue/generators:readme --name mypackage --description "…"
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
