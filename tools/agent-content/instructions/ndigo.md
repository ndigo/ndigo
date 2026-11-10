# Working in this Ndigo application

Ndigo is an ESM-only TypeScript framework: an application context (DI), a
dispatcher over routes and mappings, views for representations, and platform
presets (`@ndigo/platform-node`, `@ndigo/platform-web`).

## Use the CLI, not guessed APIs

The framework changes faster than any copied flag list. Before inventing a
command or an API, run:

- `ndigo commands --json` — every verb, flag, positional, and exit code
- `ndigo inspect` — routes, mappings, and declared config keys (AD-70)
- `ndigo doctor` — environment and workspace checks
- `ndigo routes --json` — the route list only
- `ndigo logs` — the application log tail

Facts come from these commands; the skills below carry workflows and traps.

## Rules

1. **ESM only.** No `require`; emitted TypeScript imports end in `.js`.
2. **CamelCase TC39 decorators.** Use `@requestMapping`, `@getMapping`,
   `@injectable`, `@configurationProperties`. Never enable
   `experimentalDecorators`; the runtime uses stage-3 decorators.
3. **Wiring is explicit.** Controllers and configuration classes are
   registered as entries or sources in the application assembly; boot does not
   scan them.
4. **Scripts are the interface.** `serve`, `build`, `test`, `lint`, `inspect`,
   `openapi`, and `db:*` run the app's `package.json` scripts.
5. **Verify with the version-matched commands.** Do not substitute a global
   toolchain; `ndigo lint`, `ndigo typecheck`, and `ndigo test` are the gates.

## Skills

Load the skill that matches the task; each names its verbs and traps.

| Task                          | Skill               |
| :---------------------------- | :------------------ |
| scaffold, run, configure      | `ndigo-app`         |
| controller, route, validation | `ndigo-endpoint`    |
| entity, migration, database   | `ndigo-persistence` |
| view, negotiation, EJS        | `ndigo-views`       |
| UI registry, tokens           | `ndigo-ui`          |
| signals and reactive state    | `ndigo-reactive`    |
| lint, typecheck, tests        | `ndigo-verify`      |
| failing app, diagnostics      | `ndigo-debug`       |
| framework upgrade             | `ndigo-upgrade`     |
