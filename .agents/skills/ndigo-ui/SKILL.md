---
name: ndigo-ui
description: Use when building, changing, or extending Ndigo UI — installing
    registry items, composing blocks, styling with --nd-* tokens, adding a
    primitive or behaviour element, or porting an upstream component. Covers the
    ndigo ui CLI, the shadcn channel, Zag.js bindings, conformance, and the lab.
---

# Ndigo UI

Ndigo UI is the owned design system: `--nd-*` tokens, native-first markup, and
copy-in source distributed through a shadcn-compatible registry. It is optional
and the framework does not depend on it. There is no React, no Tailwind, and no
styled component runtime.

- `@ndigo/ui` ships tokens, the opt-in base layer, and the typed token catalog.
  It does **not** export components.
- Installed `ndigo.ui.json` / shadcn items are **your source**: read, edit, and
  own them. Updates are deliberate (`--overwrite`), never automatic.
- Behaviour comes from Zag.js machines; markup, ARIA parts, and CSS are ours.
- Only blocks may import `@ndigo/view-webcomponent` for island wiring. L0–L2
  items (tokens, theme, primitives) import nothing from Ndigo.

Guide 30 is the human-facing companion; `packages/ndigo-ui/README.md` is the
package contract; `apps/20-ndigo-ui-lab` is the dogfooded consumer.

## 1. Pick the surface

| Need                                                | Use                                                      |
| :-------------------------------------------------- | :------------------------------------------------------- |
| A look for an existing native element               | Native-first CSS item (`button`, `input`, `table`, ...)  |
| Coordinated parts, keyboard behaviour, or a machine | `<nd-*>` custom element backed by Zag.js                 |
| A page-level composition of several items           | Block (`app-shell`, `command`, `data-table`, ...)        |
| A one-off brand surface                             | Consume `--nd-*` tokens directly; do not add a primitive |

Prefer the native element. Create a custom element only when the platform does
not supply the behaviour or the component needs coordinated parts.

## 2. Find and install items

The canonical registry is `packages/ndigo-ui/registry.json` (included by the
root `registry.json`). The current set is 41 items: `theme`, `lib`, 34
primitives (`registry:ui`), and 5 blocks. Use the tooling rather than a copied
list; the set grows.

### In this repo and the lab

The lab's `ndigo.ui.json` points at the local root registry:

```bash
# Discovery
node packages/ndigo-cli/bin/run.js ui list --registry registry.json
node packages/ndigo-cli/bin/run.js ui view code-block --registry registry.json --json
node packages/ndigo-cli/bin/run.js ui validate --registry registry.json

# Install into an app whose ndigo.ui.json names the registry
node packages/ndigo-cli/bin/run.js ui add button input field dialog --dir apps/my-app
```

`ui add` resolves `registryDependencies`, writes the item files, records a
SHA-256 per file in `ui.lock.json`, and installs npm dependencies. Useful flags:
`--dryRun`, `--overwrite`, `--skipInstall`, `--registry <file|dir|url>`.
`ui init <dir> --registry <source>` writes `ndigo.ui.json` with the default
aliases (`@ui` → `src/ui`, `@lib` → `src/lib`, `@components`, `@hooks`).

### MCP server

`ndigo ui mcp --dir <app> [--registry <source>] [--readOnly]` serves the same
registry over stdio. Tools: `list_items`, `search_items`, `get_item`,
`install_items`, `validate_registry`. Results are JSON text.
`install_items` plans by default; set `dryRun: false` to write. `--readOnly`
omits the install tool.

### External applications: the shadcn channel

Configure the namespace in `components.json`:

```json
{
    "registries": {
        "@ndigo": "https://ndigo.dev/r/{name}.json"
    }
}
```

Then install:

```bash
npx shadcn@latest add @ndigo/code-block
```

The direct URL works without configuration:

```bash
npx shadcn@latest add https://ndigo.dev/r/code-block.json
```

Browse the catalogue at `https://ndigo.dev/ui` when the site is deployed; each
page shows the install command, target paths, dependencies, and the item README.
The generated pages and `public/r/` payloads live in `ndigo-site`. The
first-party `ndigo ui` commands are the monorepo/lab installer; do not claim the
remote namespace as a `ndigo ui` source until its resolver supports built
payloads.

## 3. Compose

1. Install `theme` (tokens + base) first, or import `@ndigo/ui/tokens.css` and
   optionally `@ndigo/ui/theme.css`. The copy-in `theme` item and the package
   stylesheets are alternatives; pick one.
2. Behaviour primitives depend on `lib`; install pulls it automatically.
3. Blocks depend on the primitives they compose. Keep the composition:
    - `command` = dialog + combobox + a small shortcut/event glue module.
    - `data-table` = table + checkbox + button + pagination, with client-side
      sorting, selection, and paging.
    - `app-shell` = banner, nav, sidebar, main, footer landmarks.
    - `code-block` = a preformatted surface plus a copy glue module.
    - `sidebar` = native `<details>` groups, no runtime; host the same nav in
      `nd-drawer` for off-canvas mobile.

Keep the `data-part` markup contract intact: elements query those parts and
spread machine props onto them. Do not rename parts or replace native controls
with `div`s inside a behaviour item.

For forms, native-first items submit standard data. `select`, `switch`,
`tags-input`, and `date-picker` render hidden native inputs; keep them in the
markup and let the normal binding + Zod path serialize them. `slider` and
`combobox` expose their value through the element API and `nd-value-change`;
add a native input when the form must submit them. Do not add a second binding
path.

## 4. Style with tokens

Use `--nd-*`; never hard-code brand colours, spacing, radii, or motion.

- Semantic colours (`--nd-color-surface`, `--nd-color-text-muted`, ...), type
  (`--nd-font-*`, `--nd-text-*`), space (`--nd-space-*`), radius, shadow,
  duration, easing, and focus-ring tokens.
- `data-theme="light"` switches the palette; leaving it unset follows the OS.
  Dark is the default.
- Use logical properties (`padding-inline`, `inset-block-start`) so RTL works.
  Respect `prefers-reduced-motion`.
- Keep focus visible with the shared focus-ring tokens; do not remove outlines.
- The typed catalog (`TOKENS`, `getTokenDefinition`, `resolveToken`) is the
  contract for docs/tooling, but CSS should read the variables directly.

## 5. Author or edit an item

Registry source lives in `packages/ndigo-ui/registry/`, **not** in `lib/`
(that is TypeScript build output):

```
registry/base/                 # NdElement + createZagElement (the lib item)
registry/ui/<name>/            # one primitive: .html/.css/.ts, README, meta.json
registry/blocks/<name>/        # one block: markup/CSS/glue, README, meta.json
tokens/ndigo-tokens.css        # canonical token stylesheet
theme/base.css                 # opt-in base layer
registry.json                  # item metadata and file targets
```

Primitives and blocks have `README.md` (usage, behaviour, accessibility,
styling) and `meta.json`:

```json
{ "origin": "ndigo", "status": "spike", "gzipBytes": 1673 }
```

`theme` is the two stylesheets plus the registry `docs` field; `lib` is the
`registry/base/` files with `meta.json` and the `docs` field. `origin` records
provenance (`ndigo` or the ported upstream), `status` the maturity, and
`gzipBytes` the measured budget. Add the item to
`registry.json` with `name`, `type`, `title`, `description`, `categories`,
`registryDependencies`, `files` (`path`, `type`, `target`), and `docs`.
Targets use `@ui/`, `@lib/`, `@components/`, `@hooks/`, or a literal `styles/`
path. Update `test/item-budget.spec.ts` with the item's file list.

### Behaviour elements

Use `createZagElement` from `registry/base/zag-element.ts` and `NdElement`:

```ts
import { connect as connectMenu, machine as menuMachine } from '@zag-js/menu';
import { normalizeProps } from '@zag-js/vanilla';
import { createZagElement } from '@/lib/zag-element';

const controller = createZagElement({
    machine: menuMachine,
    connect: (service) => connectMenu(service, normalizeProps),
    props: () => ({/* ids, orientation, ... */}),
    render: (api) => {
        /* spread api.* props onto the [data-part] nodes */
    },
});
```

Start on connect, stop on disconnect, and call `updateProps` for reactive
attributes. Do not hand-roll focus traps, typeahead, ARIA state, or dismiss
layers; let the machine own them. Keep the machine package as an npm
dependency of the item, pinned to the catalog range.

### Porting an upstream component

Upstream is a **design reference** after the first port; do not add its runtime
as a dependency. The translation contract:

| Upstream                 | Ndigo UI                                          |
| :----------------------- | :------------------------------------------------ |
| React component          | `<nd-*>` custom element + `NdElement`             |
| Radix/state machine      | Zag.js machine through `createZagElement`         |
| Tailwind classes         | Scoped CSS consuming `--nd-*`; logical properties |
| Framer Motion            | CSS transitions/animations or WAAPI               |
| React context/props      | Attributes, properties, and DOM events            |
| `asChild` / render props | `[data-part]` markup contract; no wrappers        |

Record provenance in `meta.json` (`origin`) and the licence in the item README
before copying code. Accept permissive licences only (MIT or equivalent);
no-OSI or premium sources are inspiration only. Do not copy React, Tailwind, or
Radix imports into the registry source.

## 6. Conformance is the gate

An item ships only after the shared checks pass:

- axe-clean in the open/interactive state; keyboard and focus contract.
- Logical properties for RTL; `prefers-reduced-motion`.
- Light-DOM first paint: server markup upgrades in place. Items that add a
  shadow root document their DSD fallback.
- Form controls participate through native/hidden inputs or FACE.
- A recorded gzip budget in `meta.json`, guarded by the budget test.
- No imports from Ndigo in L0–L2; only blocks may import
  `@ndigo/view-webcomponent`.

Tests live in `packages/ndigo-ui/test/<item>.spec.ts` and exercise the real
registry markup. The lab spec (`apps/20-ndigo-ui-lab/test/lab.spec.ts`) covers
the installed copies and runs axe.

## 7. Verify

```bash
pnpm lint
pnpm build
pnpm test
pnpm typecheck
pnpm manifest:check
pnpm format:check
node packages/ndigo-cli/bin/run.js ui validate --registry registry.json
pnpm --filter @ndigo/ui-lab test
```

Run `shadcn registry validate registry.json` from `packages/ndigo-ui` (paths
are relative to the registry file) when touching registry metadata. Refresh
the site payloads in `ndigo-site` after registry changes; that repo owns
`public/r/` and the `/ui` catalogue.

## 8. Pitfalls

- **`lib/` is build output.** Registry items are source under `registry/`.
- **`tags-input` uses `removeTag()`**; `remove()` is the DOM method and will
  not update the machine.
- **`date-picker` renders its grid from `api.weeks`**; do not hand-build a
  month grid.
- **`scroll-area` keeps native `scrollTo` overloads**; use the element API.
- **`field` owns its label.** There is no separate `label` item; `input`
  covers `<textarea>` too.
- **`toast` is a native-first live region**, not a Zag machine.
- **`button` is CSS on `<button>`/`<a>`**, not a custom element.
- **Blocks are compositions.** Do not duplicate a primitive's machine inside a
  block; install and compose the item.
- **The site catalogue reads the item README and `docs` field.** Update both
  when behaviour or usage changes.
