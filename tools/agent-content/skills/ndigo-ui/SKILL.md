---
name: ndigo-ui
description: Uses the Ndigo UI design system and copy-in registry. Use when adding UI components, tokens, or theming to an application.
package: "@ndigo/ui"
---

# Ndigo UI: registry, components, tokens

## Decision table

| Goal               | Command                                               |
| :----------------- | :---------------------------------------------------- |
| Initialize aliases | `ndigo ui init [dir]`                                 |
| Find items         | `ndigo ui list`, `ndigo ui view <item>`               |
| Install items      | `ndigo ui add <item...> [--dryRun]`                   |
| Validate a source  | `ndigo ui validate [--registry <source>]`             |
| Machine-readable   | `ndigo ui list --json`, `ndigo ui view <item> --json` |

## The contract

- The registry is shadcn-compatible. `ndigo.ui.json` records the source and the
  install aliases; `ui.lock.json` records a SHA-256 per installed file.
- Installed source is copied into the application and belongs to it; there is
  no runtime component package.
- `theme` and `lib` are foundation items. Items declare their
  `registryDependencies`; `ui add` installs them first.
- `@ndigo/ui` ships a version-matched export index at
  `node_modules/@ndigo/ui/docs/llms.txt` when installed as a dependency.

## Sequence

1. `ndigo ui init` once per application.
2. `ndigo ui add theme lib button input field dialog`
3. Import the token layer once, then use the installed element names
   (`nd-button`, `nd-input`, `nd-dialog`, …).
4. `ndigo ui validate` after editing registry config.

## Traps

- **Install `theme` before styling anything.** Components consume the
  `--nd-*` token catalog; do not redeclare or hard-code those values.
- **Do not vendor a component by hand.** Add the registry item, then edit the
  installed file if needed; the lock file tracks it.
- **`ui add` writes files and installs npm dependencies.** Use `--dryRun` to
  plan, `--skipInstall` when dependencies are managed separately.

## Verify

`ndigo ui validate` passes, the installed items render in the app, and
`ui.lock.json` is committed.

## Example prompt

> Use ndigo ui to add a dialog and a button to this app. Install `theme` and
> `lib` first, then the items; keep the first version to one screen using the
> installed elements. Check focus and keyboard behavior in the browser, then
> run `ndigo ui validate` and commit `ui.lock.json`.
