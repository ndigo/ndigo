# Vitest 5 Upgrade

**Date:** 2026-11-04
**Status:** Complete
**Impact:** Medium (test toolchain only — no runtime or package-API change)

## Summary

| Tool   | From   | To    |
| :----- | :----- | :---- |
| vitest | 4.0.18 | 5.1.0 |

The catalog pin moved from `~4.0.18` to `~5.1.0`. Vitest 5 requires Node
≥22.12 (the workspace floor is 24) and now declares `vite` as a **required
peer** (`^6.4.0 || ^7.0.0 || ^8.0.0`) — the workspace already resolves the
catalog's Vite 8.3.5, so no additional dependency was needed.

Vitest 4 ran its own transform pipeline (Vite 7 + esbuild). Vitest 5 runs the
project's own Vite (8) instead, which transforms through **Oxc**. That switch —
plus two deliberate behaviour changes in the runner itself — is what actually
broke the suite; none of the failures was an API rename, so each section below
names the failure it repairs.

## Changes

### 1. Benchmark suites rewritten to the `bench` fixture

`bench` is no longer a top-level import: it is a fixture on the test context,
and benchmark files are grouped into their own project. All 15 `*.bench.ts`
files were rewritten:

```diff
-import { bench, describe } from 'vitest';
-
-describe('FIFO enqueue+dequeue – 1000 ops', () => {
-    bench('RingBuffer', () => { /* … */ });
-    bench('Array (push/shift)', () => { /* … */ });
-});
+import { test } from 'vitest';
+
+test('FIFO enqueue+dequeue – 1000 ops', async ({ bench }) => {
+    await bench.compare(
+        bench('RingBuffer', () => { /* … */ }),
+        bench('Array (push/shift)', () => { /* … */ }),
+    );
+});
```

- Every leaf `describe(name, () => { bench(…) })` suite became
  `test(name, async ({ bench }) => …)`; setup statements that preceded the
  benches moved into the test body unchanged.
- Comparison suites call `bench.compare(…)` so the interleaved measurement that
  `describe` used to provide is preserved (45 call sites).
- Single-benchmark suites call `bench(name, fn).run()` (25 call sites).
- Result: **70 `test()` suites** holding **172 `bench(…)` registrations**.
- `radix-tree.bench.ts` kept its outer grouping `describe` (it only groups,
  it holds no benchmarks) with its 9 tests nested inside.
- Benchmark tables are now printed by the **verbose** reporter only — the
  `test:bench` script already runs `vitest bench --run --reporter verbose`, and
  a filtered file run needs `--reporter=verbose` to see the numbers.

`testNamePattern` filtering joins names with `' > '`, so a `-t` filter matches
`<file> > <test> > <bench>` rather than the old flat suite name.

Running the lane for the first time in a while also surfaced **two pre-existing
bugs** in bench files (identical on the previous commit — `test:bench` is a
local lane with no CI step, so nothing had executed them since the framework
APIs they exercise changed):

- `packages/ndigo-context/bench/context-lookup.bench.ts` called
  `ContextToken('bean1')` without `new` (it has been a class for a while); the
  call now constructs the token.
- `packages/ndigo-dispatcher/bench/routing.bench.ts` annotated its controller
  with a bare `@routeMapping()`, whose default value is `/**`; composed with the
  method paths that produced `/**/users`, which the radix tree rejects
  (`Greedy segment "**" must be the last segment`). The class prefix is now `/`,
  which also restores the file's stated intent: the "static"/"parameterised"
  scenarios now hit real static/param/wildcard nodes instead of the greedy
  fallback.

The same bare-`@routeMapping()` idiom survives in
`packages/ndigo-dispatcher/bench/argument-resolver.bench.ts`, where it is inert
— that file builds method parameters directly and never registers a context — so
it was left alone rather than churned.

### 2. Every test lane declares its config explicitly

**Vitest 5 no longer searches parent directories for a config file.** Package
lanes used to find the root `vitest.config.ts` by walking up from
`packages/<pkg>/`; without it they lost `environment: 'jsdom'` and the shared
`vitest.aliases.ts` table (tests silently ran against built `lib/` output in
the Node environment). Each package script now passes the root config:

```diff
-    "test": "vitest run",
-    "test:watch": "vitest"
+    "test": "vitest run --config ../../vitest.config.ts",
+    "test:watch": "vitest --config ../../vitest.config.ts"
```

47 package manifests were updated (28 of which also carry `test:watch`). The
`root` is still the project directory, so discovery stays scoped to that
package. Two apps that relied on the same parent lookup
(`apps/02-ndigo-hello-node`, `apps/04-ndigo-api`) gained their own
`vitest.config.ts`, mirroring the sibling Node lanes.

### 3. Decorator lowering moved into every Vitest config

Vitest 4 lowered TC39 decorators inside its own esbuild transform. Vitest 5
transforms through Vite 8's Oxc pipeline, which **passes `@decorator` syntax
through unchanged** — exactly the behaviour the HI-1 decorator policy already
compensates for on the build path. Any spec whose imported workspace source
uses a decorator (`@entry`/`@getMapping` controllers, `@cached`, `@traced`,
`@tagMapping`, …) failed at module evaluation with
`SyntaxError: Invalid or unexpected token`.

The existing `scripts/vite-plugin-lower-decorators.mjs` is now wired into each
Vitest config, so tests lower decorators the same way `vite build` does:

```diff
 export default defineConfig({
+    plugins: [lowerDecorators()],
     resolve: { alias: ndigoAliases },
```

- root `vitest.config.ts` — covers all 47 package lanes and the repo-only
  `src/oxlint` lane (`test:internal`);
- all 19 app configs (17 existing + the 2 added above).

The stale "Vitest needs no plugin: its own esbuild transform already lowers
decorators" claims in the plugin docblock, the app `vite.config.ts` comments
and four app `vitest.config.ts` headers were corrected in the same change. The
regression is covered by the specs that caught it — `packages/ndigo-cache/test/cached.spec.ts`
(a `@cached` class body) and the `bootBrowserApp` smoke specs that load
decorated controllers.

### 4. `global.customElements` assignment replaced with a stub

`packages/ndigo-view-webcomponent/test/tag-mapping.spec.ts` mocked the registry
by assignment:

```diff
-global.customElements = { define: mockDefine } as unknown as CustomElementRegistry;
+vi.stubGlobal('customElements', { define: mockDefine });
```

The jsdom global is a getter-only accessor, so the assignment now throws
(`Cannot set property customElements of [object Window] which has only a
getter`). `vi.stubGlobal` is the supported way to replace it.

## Breaking changes that did **not** apply

Checked against the workspace and left as-is; recorded so the next reader does
not have to re-derive it:

- `clearMocks` now defaults to `true` — the suite has no `clearMocks` config
  and no spec depends on a spy surviving into the next test (all 108 lanes
  green).
- Unawaited `expect(...).resolves/rejects` now fail — no occurrences.
- `vi.mock`/`vi.unmock`/`vi.hoisted` outside the module top level now throw —
  the 6 specs using `vi.mock` and the single `vi.hoisted` call are all at module
  scope.
- `toThrow('')`, `expect.poll` timeout behaviour, `toMatchFileSnapshot`,
  custom matcher typing, `describe.sequential`, alternate `@vitest/*` entry
  points: not used in this repository.
- Reporter/artifact output now lands in `.vitest/` (already gitignored).

## Verification

`pnpm install`, then the full gate set from a clean tree:

| Gate                         | Result                                      |
| :--------------------------- | :------------------------------------------ |
| `pnpm format:check`          | pass                                        |
| `pnpm test` (108 nx targets) | 108 passed                                  |
| `pnpm test:bench` (15 files) | 70/70 suites pass, tables printed (verbose) |
| `pnpm lint`                  | pass                                        |
| `pnpm build`                 | pass                                        |
| `pnpm typecheck`             | pass                                        |
| `pnpm test:internal`         | 94 passed                                   |
| `pnpm test:tooling`          | 11 passed                                   |
| `pnpm manifest:check`        | pass                                        |
| `pnpm docs:links`            | pass                                        |

## Follow-ups

- Wave 4 of the dependency sweep: `croner` 11 and `i18next` 26 (runtime
  behaviour — the content adapter passes `initImmediate: false`, removed in
  v26).
- `vitest bench` now warns when a benchmark calls imported bindings through the
  Vite module runner's export getters
  (`Benchmark … accessed module export getters too many times`) — it fires for
  `routing.bench.ts`, where the framework calls go through getters but the
  external routers do not, so that comparison is biased in the framework's
  favour. Binding the imports to module-local consts (documented in the
  benchmarking guide) or measuring the built artifact would remove it.
- Vitest 5 emits a Vite warning for extensionless config imports
  (`./vitest.aliases`, `../../vitest.aliases`). It is a pre-existing
  formatting-lane concern, not a break: the warning only matters once Vite's
  native `configLoader` becomes the default.
