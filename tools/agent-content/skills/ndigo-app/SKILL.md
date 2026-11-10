---
name: ndigo-app
description: Scaffolds, runs, configures, and updates a Ndigo application. Use when creating an app, adding scripts, changing configuration, or running the dev loop.
---

# Ndigo application lifecycle

## Decision table

| Goal               | Command                                     |
| :----------------- | :------------------------------------------ |
| New app            | `ndigo new <name> --preset api`             |
| Run locally        | `ndigo dev [dir]`                           |
| Run supervised     | `ndigo serve [dir] --port 3000 --cluster 2` |
| Env template check | `ndigo env [dir] --file .env.example`       |
| Config values      | `ndigo config get\|set\|list`               |
| Package versions   | `ndigo update [dir] --check`                |
| Environment health | `ndigo doctor`                              |

## The script contract

`ndigo` fronts the app's `package.json` scripts, shell-free:
`serve`→`start`, `dev`→`dev` (fallback `start`), `build`→`build`, `test`→`test`,
`lint`→`lint`, `format`→`format`, `typecheck`→`typecheck`, `inspect`→`inspect`,
`openapi`→`openapi`, `db:*`→`db:*`. Keep each script a single command; shell
operators (`&&`, `|`) are rejected so OS signals reach the real process.

## Sequence: new app to first route

1. `ndigo new my-app --preset api`
2. `cd my-app && pnpm install`
3. Add a controller under `src/` and register it as an entry or source in the
   application assembly.
4. `ndigo inspect` — confirm the route and mapping appear.
5. `ndigo dev` — exercise it.
6. `ndigo test && ndigo lint && ndigo typecheck`.

## Traps

- **A route missing from `ndigo inspect` is not registered.** Boot does not
  scan every file; add the controller to the assembly.
- **`--json` is for machines.** `ndigo doctor --json`, `ndigo commands --json`,
  and `ndigo routes --json` emit one document; do not parse human output.
- **Config keys are declared and value-free.** `ndigo inspect` reports key,
  type, and presence only — never read secrets from it.

## Verify

`ndigo inspect` lists the route; `ndigo doctor --json` exits 0; the app starts
under `ndigo dev`.
