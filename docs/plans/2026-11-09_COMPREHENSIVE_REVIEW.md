# Comprehensive Review and Remediation — 2026-11-09

Scope: full-repository sweep focused on changes since the 2026-11-05 review —
the ndigo-ui Phase 3 items (date picker, command palette, data table, pagination,
navigation menu, scroll area, tags input, file upload, sidebar, code block), the
`apps/07-ndigo-island` migration off Web Awesome (#304), and the CI runner work
(#280, #285). Method: mechanical gates, a deep read of every changed registry
item and block, the island client/server halves, the registry installer, and
targeted jsdom probes for behaviour that the existing specs do not assert.

## 0. Gate baseline

Run in a clean worktree at `ca1736cbf` (`docs/review-2026-11`).

| Gate                              | Result                                         |
| :-------------------------------- | :--------------------------------------------- |
| `pnpm lint` (oxlint, type-aware)  | ✅ exit 0                                      |
| `pnpm typecheck`                  | ✅ exit 0                                      |
| `pnpm build`                      | ✅ 49/49 tasks                                 |
| `pnpm test` (Nx)                  | ✅ 112/112 tasks                               |
| `@ndigo/ui` tests                 | ✅ 25 files, 173 tests                         |
| `@ndigo/ui-lab` tests             | ✅ 24 tests                                    |
| `@ndigo/island` tests             | ✅ 8 files, 32 tests                           |
| `pnpm manifest:check`             | ✅ all packages and root conform               |
| `pnpm docs:links`                 | ✅ 456 files, 1881 relative links              |
| `pnpm guides:check`               | ✅ 49 guides, 0 warnings                       |
| `pnpm audit --prod`               | ✅ no known vulnerabilities                    |
| `ndigo ui validate`               | ✅ 41 items                                    |
| `pnpm doc:check` / `doc:coverage` | Not run — no public API changes in this review |
| Playwright e2e (`07`, `03`)       | Not run — no browser installed in this session |

Behaviour findings marked **verified** were reproduced with throwaway jsdom
probes against the registry sources (probe files removed after use); findings
marked **inspection** come from code reading and are called out as such.

## 1. Findings

### A. ndigo-ui behaviour (correctness, focus, forms)

**R-01 — `data-table` selection ids are wrong when rows have no `data-row-id` (High, verified).**
`packages/ndigo-ui/registry/blocks/data-table/data-table.ts:120-123` filters the
selected rows and then maps the _filtered_ array index:

```ts
rows()
    .filter((row) => row.hasAttribute('data-selected'))
    .map((row, index) => row.dataset.rowId ?? String(index));
```

With rows 2 and 3 selected the handle reports `['0','1']` instead of `['1','2']`.
Fix: map the full row list first (`rows().map((row, index) => …)`), then filter
by `data-selected`, or use `rows().entries()`. Add a regression test without
`data-row-id`.

**R-02 — Pagination re-render drops keyboard focus (High, verified).**
`data-table.ts:197` calls `pagination.replaceChildren(list)` on every render.
Pressing “Next” or a page number destroys the focused button; `document.activeElement`
becomes `<body>`, so a keyboard user loses their place on every page change.
Fix: reconcile the existing list in place (keyed by page/direction), or restore
focus to the equivalent control after render. Add an `activeElement` assertion.

**R-03 — File-upload list re-render drops keyboard focus (High, verified).**
`packages/ndigo-ui/registry/ui/file-upload/nd-file-upload.ts:149` rebuilds every
`<li>` from `api.acceptedFiles` on each render. Deleting a file with the keyboard
drops focus to `<body>`. Fix: keyed reconciliation like `nd-tags-input`’s
`#items` map, then focus the next/previous delete trigger (or the dropzone when
the list empties). Add a focus assertion.

**R-04 — Accordion `toggle()` cannot switch items in single mode (Medium, verified).**
`packages/ndigo-ui/registry/ui/accordion/nd-accordion.ts:46-51` always appends to
the current value list. With `multiple` absent (single mode) Zag rejects the
multi-value set, so `toggle('b')` leaves the first item open. Fix: branch on the
`multiple` attribute — replace the value in single mode, append/filter in multiple
mode — and test both.

**R-05 — Disabled `nd-date-picker` still submits its value (Medium, verified).**
The hidden input created at `nd-date-picker.ts:142-146` only receives `name`;
`#syncHiddenInput` (`:105-108`) only writes `value`. A disabled picker therefore
contributes its stale value to `FormData`. Fix: mirror `disabled`, `name`, and
`required` onto the hidden input and update them when the attributes change; add
a `FormData` regression test.

**R-06 — An empty `nd-select` submits the first option and passes `required` (High, verified).**
`#syncHiddenSelect` (`nd-select.ts:127-141`) rebuilds `<option>` elements with no
explicit selection when the machine value is empty. A `<select>` then implicitly
selects its first option, so `form.checkValidity()` is `true` and `FormData`
contains `"apple"` even though the user chose nothing. The hidden select does
carry `required`; the defect is the implicit first-option selection. Fix: add a
disabled, selected empty option (or set `selectedIndex = -1`) when there is no
value, keep `required`/`disabled`/`name` in sync, and test both validity and
`FormData`.

**R-07 — Command palette removes the search focus ring (Medium, verified by inspection).**
`packages/ndigo-ui/registry/blocks/command/command.css:93-96` sets
`outline: none` on the combobox input’s `:focus-visible` with no replacement.
The input is the palette’s primary control; keyboard focus is invisible. Fix:
keep the ring, or move it to the combobox control with `:focus-within`.

### B. Architecture and structural correctness

**R-08 — Overlay structure builders are duplicated and unscoped (High, verified).**
`nd-dialog` correctly scopes its parts with `#ownPart`
(`nd-dialog.ts:141-149`), but `drawer` (`:81`, `:119`), `popover` (`:75`, `:102`),
`tooltip` (`:77`, `:104`), and `menu` (`:66`, `:93`) use an unscoped
`this.querySelector('[data-part="positioner"]')`. A nested component inside the
content — a select in a popover, for example — is mistaken for the overlay’s own
part: the outer content is moved into the nested component’s positioner and the
wrong props are spread onto it. Verified with a popover containing an `nd-select`
(the outer overlay has no own positioner); the dialog equivalent survives because
of `#ownPart`. Fix: extract one `ownPart`/`ensureOverlayStructure` helper into
`registry/base` (the `lib` item) and use it in all five overlays; add a
nested-component regression test for each. This also removes four copies of the
same ~30-line structure builder.

**R-09 — Direct text nodes are orphaned by root/content wrappers (Medium, verified).**
Every `#ensureRoot`/`#ensureStructure` moves `...this.children`, so text nodes
stay outside the generated root. `<nd-dialog>Hello</nd-dialog>` renders “Hello”
outside the modal content, and `<nd-scroll-area>hello</nd-scroll-area>` leaves
it outside the viewport. Affected: scroll-area (`:76`), dialog (`:108`),
popover (`:82`), select (`:93`), accordion (`:65`), tabs (`:59`), and the same
pattern in drawer/tooltip/menu. Fix: move `childNodes` (excluding generated
parts) when building the wrapper; add text-only fixtures.

**R-10 — Attribute reactivity is start-only for most documented attributes (Medium/High, verified).**
Only `open`, `checked`, `placement`, and `orientation` are observed. Every other
documented attribute is read once in the props factory: `disabled`, `readonly`,
`required`, `invalid`, `name`, `value`, `min`, `max`, `step`, `locale`, `accept`,
`max-files`, `delimiter`, `blur-behavior`, and the navigation-menu delays.
Verified: adding `disabled` after connect is ignored by `nd-switch`,
`nd-date-picker`, and `nd-select`; changing `name` on a connected date picker
leaves the hidden input stale. Fix: define a reactivity contract in the registry
README (state attributes are live; collection/structural attributes are
start-only) and implement `observedAttributes` + `updateProps` for the live set.
`base-element.ts` is the natural home for an attribute-to-props helper.

**R-11 — Machine ids are regenerated on every reconnect (Low, inspection).**
Each element does `this.id || \`nd-…-${++nextId}\``in`onConnect`. A DOM move
(disconnect → reconnect) changes every part id and increments the counter, so
`aria-controls`/`aria-labelledby`targets churn. Fix: assign the generated id
once (or set`this.id`) and reuse it across connects.

**R-12 — Toast stacks a close listener on every connect (Low, inspection).**
`nd-toast.ts:22-27` adds a click listener in `onConnect` and never removes it;
moving the element stacks handlers. Fix: one `AbortController` per connect,
aborted in `onDisconnect`.

### C. Accessibility and design tokens

**R-13 — Dark-theme accent text fails WCAG AA (High, verified by calculation).**
`--nd-color-accent-strong` is `#9a38ff` on `#0a0a14` = **4.11:1** (normal text
needs 4.5:1). It is used for links (`theme/base.css:44`), checked combobox/select
items (`nd-combobox.css:100`, `nd-select.css:104`), current navigation links
(`nd-navigation-menu.css:89`), table links, and typography. Fix: lighten the dark
`--nd-color-accent-strong` (e.g. `#b07cff` or a verified value) or add a distinct
`--nd-color-link` token; add a token-pair contrast test (R-16).

**R-14 — Island status colors are hardcoded and fail contrast on dark (High, verified by calculation).**
`apps/07-ndigo-island/client/main.ts:283,288,291` uses `#666` (3.43:1) and
`#1a7f4b` (3.92:1) on the dark page background; the server fallback repeats
`#666` at `src/island-controller.ts:54`. The comment “≥4.5:1 on white” is true
only in the light theme. Fix: use `--nd-color-text-muted` and
`--nd-color-success` (both pass in dark and light), or set an explicit theme and
verify both.

**R-15 — No browser-based contrast/axe lane (Medium, inspection).**
Guide 44 requires the full axe rule set in a real browser or Playwright
(`docs/guides/44-accessibility.md:177-197`), but every jsdom spec disables
`color-contrast` (21 files, e.g. `test/axe.spec.ts:33`) and no
`@axe-core/playwright` dependency exists. The token failure in R-13 is
therefore uncaught. Fix: add a Playwright axe lane for the lab in both themes
(and with overlays open), or at minimum a deterministic token-pair contrast test
for every semantic foreground/background pair.

**R-16 — No RTL coverage (Medium, inspection).**
Plan §7 and guide 44 (`:136-138`) require at least one component per library in
`dir="rtl"`; no test or fixture uses RTL. Fix: add an RTL fixture for one overlay
and one form control; audit the remaining `left`/`right`/`width`/`height` uses
(`nd-date-picker.css:84-85` is the only obvious physical pair).

**R-17 — Motion guards are incomplete (Low, inspection).**
`nd-card.css:59` and `nd-scroll-area.css:30` transition without a
`prefers-reduced-motion` guard; 12 other files already gate motion. Fix: add the
same guard.

**R-18 — Overlay token and forced-colors gaps (Low, inspection).**
`nd-dialog.css:31` hardcodes `rgb(10 10 20 / 0.65)` while the drawer uses
`color-mix`; no CSS handles `forced-colors` or `prefers-contrast`. Fix: add an
overlay token (or `color-mix`) and `forced-colors` fallbacks for focus/selected
states.

**R-19 — Command empty state is not announced (Low, inspection).**
`registry/blocks/command/command.html:38` is a plain `<p hidden>`; showing it
after a filter change is silent to screen readers. Fix: `role="status"` (or
`aria-live="polite"`).

**R-20 — Code block cannot be scrolled by keyboard (Low, inspection).**
`<pre class="nd-code-block__pre">` has `overflow: auto` but no `tabindex`, so a
keyboard user cannot reach the horizontal scroll. Fix: `tabindex="0"` plus an
accessible label when the content can overflow.

### D. Consistency, complexity, and performance

**R-21 — Item budgets duplicate the registry (Medium, inspection).**
`packages/ndigo-ui/test/item-budget.spec.ts:19-200` hand-lists 40 items and their
files, duplicating `registry.json` and each `meta.json`. A new item silently
skips the budget check unless the test is edited. Fix: derive the list from
`registry.json` + `meta.json.gzipBytes`, and assert that every budgeted item is
covered (the current list happens to cover all 40 today).

**R-22 — `ui.lock.json` is stale for four lab items (Medium, verified).**
The lab’s installed `popover`, `tooltip`, `select`, and `drawer` sources are
byte-identical to the registry, but their recorded SHA-256 differs; no gate
detects lock drift. A future `ndigo ui add` will refuse to overwrite without
`--overwrite`. Fix: regenerate the lock (`ndigo ui add … --overwrite` or a new
`ui sync`/`ui doctor`) and add a CI check that lock hashes match both the
installed files and the registry sources.

**R-23 — Lab assets are hand-maintained (Medium, inspection).**
`apps/20-ndigo-ui-lab/index.html` lists ~45 stylesheets and `src/main.ts` imports
20 element modules; adding one item requires edits in the page, the bootstrap,
the spec, and the lock. Fix: generate the stylesheet links and element imports
from `ui.lock.json` (or a Vite glob over `src/ui/**/*.css|ts`), so the lab
follows the lock automatically.

**R-24 — Full DOM rebuilds where keyed updates would do (Low, inspection).**
Date-picker rebuilds the 42-cell grid on every render (focus moves included,
relying on Zag to restore focus), file-upload rebuilds the list (R-03), and
pagination rebuilds the control (R-02). Fix keyed updates for the file list and
pagination at minimum; consider keyed day cells for the date picker.

**R-25 — Registry metadata never matures (Low, inspection).**
All 40 `meta.json` files say `"status": "spike"`, including dialog/menu/button.
The field is undefined and never promoted. Fix: define the allowed statuses and
promotion criteria (conformance green, axe clean, budget recorded) and update
the items; or remove the field until it has a consumer.

**R-26 — Form serialization is under-specified (Low, verified).**
`nd-tags-input` submits `a, b` (delimiter plus space) while the README says
“comma-separated”; `nd-select` rebuilds its hidden options on every value change.
Fix: document the exact serialization (`delimiter` join, trimming) and test it;
state whether the space is part of the contract.

**R-27 — Test-quality nits (Low, inspection).**
`test/form-controls.spec.ts` asserts CSS source text (`toContain('prefers-reduced-motion')`),
which is a change detector; several specs duplicate the `PACKAGE_ROOT` lookup;
and the jsdom axe specs cannot catch contrast (R-15). Replace source-text
assertions with behaviour/browser checks where possible and extract the
`PACKAGE_ROOT` helper.

**R-28 — `nd-combobox` has no declarative selected value (Low, inspection).**
`value` is documented as the initial input query, while `select`/`switch` use
`value`/`checked` for the selected state. Add `default-value` (or `selected`) for
the chosen item and document the distinction; today only the `select()` method
can preselect.

### E. Documentation

**R-29 — Guide 30 still describes the pre-migration island (Medium, verified).**
`docs/guides/30-component-integration.md:11-12` names `apps/07-ndigo-island` as
the runnable third-party reference and `:202-213` says the island “keeps its Web
Awesome integration until the ndigo-ui components exist … until the migration
lands.” The migration landed in #304; the island’s dependency is gone. Fix:
retarget the worked example to a generic third-party library, add a
“migrated to ndigo-ui” note linking AD-95, and drop the migration checklist (or
mark it historical).

**R-30 — App ladder descriptions are stale (Medium, verified).**
`apps/README.md:31` still says the island uses the “adopted component-library
form (AD-71)”; `:44` describes the lab as only “dialog/menu/button/app-shell”
when it installs all 41 items. Fix both rows.

**R-31 — Lab README is stale (Medium, verified).**
`apps/20-ndigo-ui-lab/README.md:6-8,24-28` says six items were installed and the
page uses only the dialog, menu, and app shell; the lock has 41 items and the
page demos the full catalogue. The install command lists only three items. Fix:
update the text and either list the items from the lock or stop enumerating them.

**R-32 — Plan command surface is ahead of the implementation (Low, inspection).**
`docs/plans/2026-11-08_NDIGO_UI.md:99-131` lists `sync`, `port`, `doctor`, and
`search`; `packages/ndigo-cli/src/commands/ui` has `init`, `add`, `list`, `view`,
and `validate`. Fix: mark the unimplemented commands as pending (and use R-22’s
lock check as the first `sync`/`doctor` slice).

### F. Security notes (no blocking findings)

- Registry installs validate every target (`packages/ndigo-cli/src/ui/install.ts:128-134`)
  and reject absolute/`..` paths; dependency installation uses `spawn` with an
  argument array, not a shell. Keep the path guard and add a regression test for
  `@ui/../../escape` if one is missing.
- The island fallback escapes model text (`src/island-controller.ts:26-33`) and
  the shell uses EJS-escaped values; the unescaped `app.intro` translation is
  server-controlled and must stay so.
- Low hygiene: `navigator.platform` is deprecated (`blocks/command/command.ts:146`);
  prefer `navigator.userAgentData?.platform` with a fallback. A second
  `initCommandPalette` stacks a second global keydown listener; guard single
  initialisation or document one palette per document.

## 2. Remediation waves

Each wave is one issue/branch/worktree/PR per AGENTS.md §8. Registry changes are
applied in `packages/ndigo-ui/registry`, then re-installed into
`apps/20-ndigo-ui-lab` with `ndigo ui add … --overwrite` (and the lock
regenerated) so the committed copies do not drift.

### Wave 1 — Behaviour and focus fixes (small, high value)

1. R-01 — `selectedIds` maps the row index, not the selection index.
2. R-02 — patch the pagination in place (or restore focus) and assert `activeElement`.
3. R-03 — keyed file-list reconciliation and focus after delete.
4. R-04 — single-mode accordion `toggle()`.
5. R-05 — disabled/name/required mirroring on the date-picker hidden input.
6. R-06 — empty-option placeholder / no implicit first-option selection on the
   select hidden `<select>`; keep required/disabled/name in sync.
7. R-07 — restore the command palette focus ring.

Tests: add the missing regression assertions to `data-table.spec.ts`,
`file-upload.spec.ts`, `disclosure.spec.ts`, `date-picker.spec.ts`,
`select.spec.ts`, and `command.spec.ts`; run `pnpm --filter @ndigo/ui test`
and `pnpm --filter @ndigo/ui-lab test`.

### Wave 2 — Overlay/root structure (one shared helper)

1. R-08 — add `ownPart`/`ensureOverlayStructure` to `registry/base`, migrate
   dialog/drawer/popover/tooltip/menu, and add a nested-component test per
   overlay.
2. R-09 — move child nodes (not only elements) into the generated root/content;
   add text-only fixtures for scroll-area and dialog, and cover the other
   wrappers.
3. Update `registry/base/meta.json` and the `lib` item budget; reinstall the lab.

Verify: `pnpm --filter @ndigo/ui test`, `pnpm --filter @ndigo/ui-lab test`,
`pnpm manifest:check`, and a budget check for the new `lib` size.

### Wave 3 — Attribute reactivity and lifecycle

1. R-10 — define the reactivity contract in the registry README; observe the live
   attributes (`disabled`, `readonly`, `required`, `invalid`, `name`, `value`,
   `min`, `max`, `step`, `locale`, `accept`, `max-files`, `delimiter`, delays)
   and forward them through `updateProps`; keep collection/structural attributes
   start-only and document that.
2. R-11 — assign the generated machine id once.
3. R-12 — abort the toast close listener on disconnect.
4. R-05/R-06 follow-ups: attribute-driven hidden-field updates.

Tests: one attribute-reactivity test per element family (form control, overlay,
collection control) and a reconnect test that asserts the part ids are stable.

### Wave 4 — Accessibility, tokens, and the browser gate

1. R-13 — fix the dark `--nd-color-accent-strong` (or add `--nd-color-link`);
   recompute every semantic pair in both themes.
2. R-14 — replace the island’s hardcoded status colors with tokens.
3. R-15 — add the Playwright + `@axe-core/playwright` lane for the lab (light and
   dark, overlays open), or a deterministic token-contrast unit test plus a small
   browser smoke; wire it into `preflight`/CI.
4. R-16 — RTL fixture for one overlay and one form control.
5. R-17/R-18 — reduced-motion guards, overlay token, `forced-colors` fallbacks.
6. R-19/R-20 — command empty-state status and focusable `<pre>`.

Verify: `pnpm --filter @ndigo/ui test`, `pnpm --filter @ndigo/ui-lab test`,
the new browser lane, and the island e2e (if the island colors change).

### Wave 5 — Registry tooling, metadata, and docs

1. R-21 — derive item budgets from the registry + meta.
2. R-22 — regenerate the lab lock and add the lock-drift gate (this is the first
   `ui sync --check`/`ui doctor` slice).
3. R-23 — generate the lab’s stylesheet/import lists from the lock.
4. R-25 — define/promote registry statuses.
5. R-26 — document and test the form serialization.
6. R-27 — test-quality cleanup (PACKAGE_ROOT helper, replace source-text
   assertions where practical).
7. R-28 — add a declarative selected value to the combobox.
8. R-29/R-30/R-31/R-32 — update guide 30, the app ladder, the lab README, and the
   ndigo-ui plan’s command status.

Verify: `pnpm manifest:check`, `pnpm docs:links`, `pnpm guides:check`,
`pnpm --filter @ndigo/ui test`, `pnpm --filter @ndigo/ui-lab test`,
`ndigo ui validate`, and the new lock check.

## 3. Verification (whole plan)

- `pnpm lint && pnpm typecheck && pnpm build && pnpm test`
- `pnpm manifest:check && pnpm docs:links && pnpm guides:check`
- `pnpm audit --prod` stays clean (no dependency changes are required)
- `pnpm doc:api` only if a public `@ndigo/ui` export changes; otherwise no
  generated API diff.
- Reinstall the lab from the registry after every registry change and confirm
  `ui.lock.json` hashes match; run the island e2e if its client changes.
- After merge: `graft build` to refresh the graph.

## 4. Notes and non-goals

- The jsdom suite is green and broad; the failures above are gaps in what it
  asserts (index fallback, `activeElement`, form validity, nested parts), not
  pre-existing red tests.
- No dependency upgrades or security advisories are proposed; the lockfile and
  `pnpm-lock.yaml` stay untouched.
- R-08/R-09/R-10 are the only changes that touch many registry items at once;
  they are deliberately separate waves so the behaviour fixes (Wave 1) can land
  and be released first.
- The registry’s copy-in model means every fix must be re-installed into the lab
  (and any other consumer) — the stale lock (R-22) is the current symptom.

## 5. Execution log (2026-11-09)

Implemented in the adjacent worktree on `docs/review-2026-11`.

### Wave 1 — behaviour and focus (R-01…R-07)

- `data-table` maps the full row list before filtering selection ids, and
  restores focus to the same page control (or the current-page indicator) after
  a pagination render.
- `nd-file-upload` reconciles items by `File` identity instead of rebuilding the
  list, and focuses the replacement row after a keyboard delete.
- `nd-accordion.toggle()` replaces the value in single mode and only collapses
  when `collapsible` is present.
- `nd-date-picker` mirrors `name`/`disabled` onto the hidden input (and observes
  the live state attributes); `nd-select` adds a disabled empty placeholder so
  an empty select neither submits the first option nor validates as filled.
- The command palette keeps an inset focus ring on the search input.
- Regression tests added to the data-table, file-upload, disclosure,
  date-picker, select, and combobox specs.

### Wave 2 — overlay/root structure (R-08, R-09)

- Added `registry/base/structure-element.ts` with `ownPart`,
  `ensureRootElement`, and `ensureOverlayStructure`; registered it in the `lib`
  item and its budget.
- Dialog, drawer, popover, tooltip, and menu now use the shared, nested-safe
  structure builder; select, combobox, slider, accordion, tabs, scroll-area, and
  date-picker use the shared root helper. Text nodes beside the root/content are
  adopted instead of orphaned.
- Added `test/structure.spec.ts` (nested select in a popover, text-only dialog
  and scroll area, helper units) and refreshed the lab install.

### Wave 3 — reactivity and lifecycle (R-10…R-12)

- Form controls observe `disabled`, `readonly`, `required`, `invalid`, `name`,
  `value`, and their range/collection attributes and forward them through
  `updateProps`/`setValue`; the live set is documented in the package README.
- Machine ids are assigned once and reused across reconnects; the toast aborts
  its close listener on disconnect.
- Added `test/reactivity.spec.ts` (switch/select/date-picker live updates, stable
  part ids, one toast listener per connect).

### Wave 4 — accessibility and tokens (R-13…R-20)

- Dark `--nd-color-accent-strong` is now `#b07cff` (≥5.6:1 on the dark surfaces)
  and light `--nd-color-warning` is `#92400e`; `test/token-contrast.spec.ts`
  enforces AA for every semantic foreground/background pair in both themes.
- The island’s status lines use `--nd-color-text-muted`/`--nd-color-success`,
  and the connection line is a live region.
- Added an RTL fixture and a logical-property CSS guard (`test/rtl.spec.ts`),
  reduced-motion guards for card/scroll-area, forced-colors focus/selection
  fallbacks, a tokenised dialog backdrop, a command empty-state status, and a
  focusable code block `<pre>`.

### Wave 5 — tooling, metadata, and docs (R-21…R-32)

- Item budgets are derived from `registry.json` + `meta.json`, with a coverage
  assertion; `test/ui-lock.spec.ts` verifies every committed lock against both
  the installed files and the registry sources.
- The lab globs its installed element/stylesheet trees, so `index.html` and
  `main.ts` no longer need per-item edits.
- Registry items are `stable` with documented promotion criteria
  (`registry/STATUS.md`); the tags-input serialization is documented; the
  `PACKAGE_ROOT` lookup is shared; `nd-combobox` gained `default-value`.
- Guide 30, the app ladder, the lab README, and the ndigo-ui plan’s command
  status now match the post-migration repository.

### Post-remediation gates

| Gate                  | Result                      |
| :-------------------- | :-------------------------- |
| `pnpm lint`           | ✅ exit 0                   |
| `pnpm typecheck`      | ✅ exit 0                   |
| `pnpm build`          | ✅ 49/49 tasks              |
| `pnpm test` (Nx)      | ✅ 112/112 tasks            |
| `@ndigo/ui` tests     | ✅ 30 files, 284 tests      |
| `@ndigo/ui-lab` tests | ✅ 24 tests                 |
| `@ndigo/island` tests | ✅ 8 files, 32 tests        |
| `pnpm format:check`   | ✅                          |
| `pnpm manifest:check` | ✅                          |
| `pnpm docs:links`     | ✅ 457 files, 1881 links    |
| `pnpm guides:check`   | ✅ 49 guides                |
| `pnpm audit --prod`   | ✅ no known vulnerabilities |
| `ndigo ui validate`   | ✅ 41 items                 |

### Deferred / partial

- R-15: the deterministic token-contrast contract landed; a full Playwright
  axe lane (both themes, overlays open) remains the release-gate follow-up.
- R-24: file-upload and pagination use keyed updates; the date-picker grid still
  rebuilds (Zag restores focus), and keyed day cells remain a follow-up.
- R-27: the shared `PACKAGE_ROOT` helper landed; the CSS source-text assertions
  in `form-controls.spec.ts` remain because jsdom cannot compute the styles.
- Playwright e2e was not run in this session (no browser installed).
- The Vite `import.meta.glob` typing was localised in the lab because the full
  `vite/client` reference collided with the http fixture `*.pdf` ambient modules
  in the root spec program; the fixture declarations were renamed to avoid the
  collision.

### Merge note

The branch was rebased onto `main` at `54dda4300` (the ndigo-ui MCP server
#319 and the guide 30 refresh #315) before the squash merge. The guide 30
conflict was resolved in favour of the refreshed main text plus the
superseded-AD-71 note and the issue #304 migration reference. The `AGENTS.md`
graft-wiring change observed earlier was no longer present in the primary
checkout (graft re-synced it), so the merge carries no `AGENTS.md` diff.
