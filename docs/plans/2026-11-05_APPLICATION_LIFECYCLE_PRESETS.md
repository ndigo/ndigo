# Application Lifecycle Presets — Node runner and browser runtime

**Status:** Completed — Phases 0–2 landed 2026-11-05; Phase 3 close-out (API
reference regeneration, graph refresh, full gates) done 2026-11-05.
**Scope:** `@ndigo/boot`, `@ndigo/platform-node`, `@ndigo/platform-web`, the
app generator templates, the reference apps, and the docs that teach the
entrypoint story.
**Decision record:** [AD-90](../decisions/2026-11-05_AD90_APPLICATION_LIFECYCLE_PRESETS.md).

---

## 1. Summary

Add two thin, overridable entrypoint presets on top of the existing
auto-configurations:

1. **`createNodeApplication(sources, options)`** in `@ndigo/platform-node` —
   builds the context with `NodeAutoConfiguration` and `NodeEnvironment`,
   loads config files through the new default reader, starts `HTTP_SERVER`,
   installs `gracefulShutdown`, and returns `{ context, server, port, close }`.
2. **`createWebApplication(sources, options)`** in `@ndigo/platform-web` —
   builds the context with `WebAutoConfiguration`, creates the
   `DOMElementViewTarget`, `BrowserDispatcher`, and `HashRouter`, registers
   `VIEW_TARGET` / `DISPATCHER` / `ROUTER`, and performs the first navigation.

Both presets are **additive**: every implicit action has a `false` switch or
an opt-out, every hook is optional, and the returned context is the same
container the app would have built by hand. `ApplicationBuilder`,
`MetadataConfigApplicationContext`, `NodeAutoConfiguration`,
`WebAutoConfiguration`, `HTTPServer.start()`, and `gracefulShutdown()` remain
public and unchanged.

Phase 0 fixes `@ndigo/boot`'s browser safety so the web preset can use the
same `ApplicationBuilder` as the Node preset (AD-90 D-5).

## 2. Why now, why this shape

- The repetition is measured and stable: 13/13 Node entrypoints repeat the
  start/shutdown block; 11/13 also mutate `process.env['PORT']`; 5/5 browser
  entrypoints repeat the dispatcher/router/view-target wiring. The app
  generator now **canonicalises** the long form into every new project, so
  the cost compounds.
- Entry defaults are already solved (`NodeAutoConfiguration`,
  `WebAutoConfiguration`). The missing piece is sequencing after `refresh()`,
  which a `@configuration` class cannot own: `HTTPServer` must not bind on
  refresh (`packages/ndigo-platform-node/src/http-server.ts:218-219`).
- The presets are the smallest unit that removes the duplication without
  creating a new package (AD-85 D-4.4) or a second configuration mechanism
  (AD-90 D-1/D-2).
- Pre-1.0 is the right time to add the surface: no deprecation, no migration
  burden, and the generator templates can switch in the same change.

## 3. Target API (shape, not final)

```ts
// @ndigo/platform-node
export interface CreateNodeApplicationOptions {
    /** Port used when `PORT` is unset; applied as `server.port`. */
    port?: number;
    profiles?: readonly string[];
    properties?: JSONObject;
    /** `true` (default) loads config/application*.json via nodeConfigFileReader. */
    configFiles?: boolean | StandardConfigFileLoader;
    /** `true` (default) registers NodeAutoConfiguration. */
    platform?: boolean;
    /** Pre-refresh builder wiring (secrets, config server, processors, defaults). */
    configureBuilder?: (builder: ApplicationBuilder) => void | Promise<void>;
    /** After refresh, before the socket binds (migrations, interceptors, session restore). */
    beforeStart?: (context: ConfigurableApplicationContext) => void | Promise<void>;
    /** Extra resources closed after the server and before the context. */
    resources?: readonly Closable[];
    /** `true` (default) installs SIGINT/SIGTERM teardown. */
    shutdown?: boolean | Omit<GracefulShutdownOptions, 'resources'>;
}

export interface NodeApplication {
    readonly context: ConfigurableApplicationContext;
    readonly server: HTTPServer;
    /** The bound port — the ephemeral port assigned by the socket when `port: 0`. */
    readonly port: number;
    close(): Promise<void>;
}

export function createNodeApplication(
    sources: readonly Function[],
    options?: CreateNodeApplicationOptions
): Promise<NodeApplication>;
```

```ts
// @ndigo/platform-web
export interface CreateWebApplicationOptions {
    /** Context name; defaults to `ndigo-web-application`. */
    name?: string;
    /** Element or id; defaults to `#app`. */
    root?: string | Element;
    eventMap?: Record<string, string>;
    interceptors?: readonly RouterInterceptor[];
    /** Defaults to the current hash path. */
    initialPath?: string;
    /** `true` (default) performs the first navigation. */
    autoNavigate?: boolean;
    /** Runs after the runtime is wired, before the first navigation. */
    beforeNavigate?: (app: WebApplication) => void | Promise<void>;
    /** `true` (default) registers WebAutoConfiguration. */
    platform?: boolean;
    profiles?: readonly string[];
    properties?: JSONObject;
}

export interface WebApplication {
    readonly context: ApplicationContext;
    readonly dispatcher: BrowserDispatcher;
    readonly router: HashRouter;
    readonly viewTarget: DOMElementViewTarget;
    destroy(): void;
}

export function createWebApplication(
    sources: readonly Function[],
    options?: CreateWebApplicationOptions
): Promise<WebApplication>;
```

Design rules for both:

- **Compose, do not replace.** The preset registers the platform
  auto-configuration and then the caller's sources; it never forks the entry
  graph.
- **No process exits.** The preset logs and rethrows startup failures; the
  caller's top-level `await` (or `main().catch`) decides the exit code.
  `gracefulShutdown` keeps its documented signal behavior.
- **No app policy.** No auth, ORM, management, docs, static roots, or telemetry
  exporters in the defaults. Those stay explicit.
- **No hidden globals.** `port` is applied as `server.port`, not by mutating
  `process.env`. `configFiles` is a boolean/loader, not an environment hack.
- **Everything reachable.** The returned `context` exposes every entry; the
  returned `server` / `dispatcher` / `router` expose the runtime objects.

## 4. Phases and deliverables

### Phase 0 — `@ndigo/boot` browser safety (prerequisite)

| #   | Deliverable                                                                                                                                       | Where                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 0.1 | Replace the three direct `process.env` reads with `getEnv` (`NDIGO_PROFILES_ACTIVE`, `NDIGO_PROFILES_DEFAULT`, `NDIGO_PROFILES_GROUPS`)           | `packages/ndigo-boot/src/application.ts:299,314,346` |
| 0.2 | Browser-safety test: stub `globalThis.process` as undefined, build an app with a source, assert `run()` succeeds and builder profiles still apply | `packages/ndigo-boot/test/browser-safety.spec.ts`    |
| 0.3 | Record the fix in `CHANGELOG.md` under `Fixed`                                                                                                    | `CHANGELOG.md`                                       |

**Acceptance:** the new test passes; the existing boot suite stays green; no
`process` reference remains on the browser path (`application.ts`,
`config-file-loader.ts` is Node-construction-only).

### Phase 1 — Node preset

| #    | Deliverable                                                                                                                                                                                                                                                                    | Where                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| 1.1  | `nodeConfigFileReader: ConfigFileReader` — `readFile` + `ENOENT → null`, other errors rethrow                                                                                                                                                                                  | `packages/ndigo-platform-node/src/node-config-file-reader.ts`                                                  |
| 1.2  | Unit test: existing file, missing file, permission/other error                                                                                                                                                                                                                 | `packages/ndigo-platform-node/test/node-config-file-reader.spec.ts`                                            |
| 1.3  | `createNodeApplication` + `CreateNodeApplicationOptions` + `NodeApplication`                                                                                                                                                                                                         | `packages/ndigo-platform-node/src/run-node-application.ts`                                                     |
| 1.4  | Default `NodeEnvironment`; dedupe `NodeAutoConfiguration`; `configFiles` default `true`; `port` via `server.port`; `configureBuilder`; `beforeStart`; `resources`; `shutdown`; `close()`                                                                                       | same file                                                                                                      |
| 1.5  | Bound-port reporting: `HTTPServer.port` returns the bound port after a successful `listen` (the kernel-assigned port for `port: 0`) via a bound-port field that resets on `close()`, so a restart re-binds the configured port                                                 | `packages/ndigo-platform-node/src/http-server.ts`, `packages/ndigo-platform-node/test/http-boundaries.spec.ts` |
| 1.6  | Remove `@ndigo/boot`'s devDependencies on the platform packages (the platform-integration specs reach the platform sources relatively) — a manifest edge of any kind closes an Nx build cycle now that `platform-node`/`platform-web` depend on boot (AD-67's acyclicity gate) | `packages/ndigo-boot/package.json`, `packages/ndigo-boot/test/`                                                |
| 1.7  | Export from the package barrel; add `@ndigo/boot` to `dependencies`                                                                                                                                                                                                            | `packages/ndigo-platform-node/src/index.ts`, `package.json`                                                    |
| 1.8  | Integration tests: `port: 0` boots and reports the bound port; `beforeStart` runs before listening; extra resources close after the server; `platform: false` leaves `HTTP_SERVER` unregistered; `shutdown: false` skips signal wiring; a temp config file is loaded           | `packages/ndigo-platform-node/test/run-node-application.spec.ts`                                               |
| 1.9  | Migrate the two reference apps: `02-ndigo-hello-node` (minimal) and `05-ndigo-api` (config files, telemetry, migrations, secrets)                                                                                                                                              | `apps/02-ndigo-hello-node/src/index.ts`, `apps/05-ndigo-api/src/index.ts`                                      |
| 1.10 | Update the generator's Node entrypoint template                                                                                                                                                                                                                                | `packages/ndigo-generators/src/generators/app/files/node/src/index.ts.template`                                |
| 1.11 | Update guide 01 §1 and §5 to teach the preset first and the manual `ApplicationBuilder` path as the escape hatch                                                                                                                                                               | `docs/guides/01-building-a-node-api.md`                                                                        |
| 1.12 | `CHANGELOG.md` Added/Changed entries                                                                                                                                                                                                                                           | `CHANGELOG.md`                                                                                                 |

**Acceptance:** app 02's entrypoint is at most ~10 lines; app 05 keeps every
current behavior (config server, secrets, and audit processor ride
`configureBuilder`; migrations ride `beforeStart`; telemetry flush rides
`resources`) and removes its hand-written reader. The platform-node test lane
is green, including a boot on `port: 0` that reports the ephemeral port.

### Phase 2 — Web preset

| #    | Deliverable                                                                                                                                                                                                                                            | Where                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 2.1  | `createWebApplication` + `CreateWebApplicationOptions` + `WebApplication`                                                                                                                                                                              | `packages/ndigo-platform-web/src/web-application.ts`                               |
| 2.2  | Register `WebAutoConfiguration` by default; build via `ApplicationBuilder` (AD-90 D-5); resolve `root`; create target, dispatcher, router; set `VIEW_TARGET` / `DISPATCHER` / `ROUTER`; `beforeNavigate`; `autoNavigate`; `destroy()`                  | same file                                                                          |
| 2.3  | Export from the package barrel; add `@ndigo/boot` to `dependencies`                                                                                                                                                                                    | `packages/ndigo-platform-web/src/index.ts`, `package.json`                         |
| 2.4  | Integration tests (jsdom): root by id and by element; missing root throws `IllegalStateError`; tokens are set; auto-navigation dispatches `/`; `autoNavigate: false`; `beforeNavigate` order; interceptor installation; `destroy()` closes the context | `packages/ndigo-platform-web/test/web-application.spec.ts`                         |
| 2.5  | Migrate two reference apps: `08-ndigo-views` (minimal) and `19-ndigo-hn` (runtime + `currentPath` removal); keep app-specific tokens/actions                                                                                                           | `apps/08-ndigo-views/src/index.ts`, `apps/19-ndigo-hn/src/app/hn-runtime.ts`       |
| 2.6  | Update the generator's browser entrypoint template                                                                                                                                                                                                     | `packages/ndigo-generators/src/generators/app/files/browser/src/index.ts.template` |
| 2.7  | New guide 30 “Building a browser app” (DI boot, runtime wiring, routing, view targets, app-specific extension) and its guide-index row                                                                                                                 | `docs/guides/30-building-a-browser-app.md`, `docs/guides/README.md`                |
| 2.8  | Root README browser starter list: point at `@ndigo/platform-web` + the preset, not boot alone                                                                                                                                                          | `README.md`                                                                        |
| 2.9  | Verify the boot README's browser claim (or correct it)                                                                                                                                                                                                 | `packages/ndigo-boot/README.md`                                                    |
| 2.10 | Bundle guards stay green for the migrated apps; record any size delta (measured on `apps/19-ndigo-hn`, all dist chunks: 1,162.5 kB → 1,262.8 kB raw, 279.1 kB → 309.1 kB gzip — the `@ndigo/boot` inclusion plus the lazy view-engine chunk, accepted) | app bundle specs                                                                   |
| 2.11 | `CHANGELOG.md` Added/Changed entries                                                                                                                                                                                                                   | `CHANGELOG.md`                                                                     |

**Acceptance:** app 19's runtime drops the duplicated `currentPath` and the
manual dispatcher/router/target wiring; app 08's entrypoint drops the inline
runtime. Browser tests pass without a real browser; `destroy()` is
idempotent. If `ApplicationBuilder` in the browser lane exposes a blocker,
switch the preset to `MetadataConfigApplicationContext` (public API unchanged)
and record the reason in this plan and AD-90 D-5.

### Phase 3 — Close-out

| #   | Deliverable                                                                                                             | Where                  |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 3.1 | Run the full gate set (see §5)                                                                                          | repo root              |
| 3.2 | Regenerate the public API trees (`pnpm doc:api`) for platform-node/platform-web                                         | `packages/*/api/`      |
| 3.3 | Refresh the repo graph (`pnpm graft:build`)                                                                             | `graft/`               |
| 3.4 | Move this plan from “Draft Plans” to “Completed Plans” in the plans index; record the execution date and any deviations | `docs/plans/README.md` |
| 3.5 | Update AD-90 if an implementation decision deviated (status stays Accepted; add an execution note)                      | AD-90                  |

## 5. Validation matrix

| Gate           | Command                                                                                                                                            | Expectation                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Boot safety    | `pnpm vitest run packages/ndigo-boot/test/browser-safety.spec.ts`                                                                                  | green                                                     |
| Node preset    | `pnpm vitest run packages/ndigo-platform-node/test/run-node-application.spec.ts packages/ndigo-platform-node/test/node-config-file-reader.spec.ts` | green                                                     |
| Web preset     | `pnpm vitest run packages/ndigo-platform-web/test/web-application.spec.ts`                                                                         | green                                                     |
| Package builds | `pnpm --filter @ndigo/platform-node build:lib && pnpm --filter @ndigo/platform-web build:lib`                                                      | green                                                     |
| Lint           | `pnpm lint`                                                                                                                                        | green (no upward imports, no warnings)                    |
| Types          | `pnpm typecheck`                                                                                                                                   | green (build + spec lanes)                                |
| Manifests      | `pnpm manifest:check`                                                                                                                              | green (new dep declared, no dead deps)                    |
| Layer map      | `pnpm test:internal`                                                                                                                               | green (ranks unchanged)                                   |
| Docs links     | `pnpm docs:links`                                                                                                                                  | green                                                     |
| Formatting     | `pnpm format:check`                                                                                                                                | green                                                     |
| API docs       | `pnpm doc:api`                                                                                                                                     | regenerated tree committed, `git diff` clean after commit |
| Node apps      | `pnpm apps:smoke`                                                                                                                                  | green for the migrated apps                               |
| Browser apps   | app build + bundle spec (`pnpm --filter @ndigo/views build`, `pnpm vitest run apps/01-ndigo-hello/test/bundle.spec.ts`)                            | green                                                     |

## 6. Risks and rollback

| Risk                                                                | Mitigation                                                                                                                             | Rollback                                                                                  |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `@ndigo/boot` still touches `process` somewhere on the browser path | Phase 0 test stubs `process`; grep the built boot bundle for `process.`                                                                | revert the three-line change; the preset falls back to `MetadataConfigApplicationContext` |
| New dependency edge changes a layer rank                            | AD-89 ranks are derived; both edges point downward (8 > 5, 7 > 5) and `test:internal` proves it                                        | remove the dependency and the preset export in one commit                                 |
| Browser bundle growth                                               | run the existing bundle guards; compare the built asset size                                                                           | use the `MetadataConfigApplicationContext` fallback (no public API change)                |
| Preset hides too much                                               | every implicit action has a `false` switch; the context/handle is returned; tests cover the opt-outs                                   | callers keep using `ApplicationBuilder` directly                                          |
| Port/config precedence surprises                                    | `port` writes `server.port`; `PORT` still wins in `NodeAutoConfiguration.httpServer()`; `NodeEnvironment` matches the documented chain | pass `platform: false` / `configFiles: false` and wire manually                           |
| App migration regressions                                           | migrate two reference apps first; app tests and `apps:smoke` cover both                                                                | revert the app commits independently of the framework commits                             |

## 7. Open questions

- **Should `createNodeApplication` return the `Application` as well?** Current
  plan: no — the context and server are enough; callers needing the builder
  stay on `ApplicationBuilder`.
- **Should the preset log the listening URL?** Current plan: no. The preset
  returns the bound `port`; the app owns its startup logs (the examples log
  their route lists anyway).
- **Should `NodeEnvironment` be the default?** Current plan: yes. It makes
  `systemEnvironment` real (guide 03 says real apps should use it; no app
  does today) and matches the documented precedence chain.
- **Should `createWebApplication` auto-navigate by default?** Current plan:
  yes; `autoNavigate: false` plus `router.navigate()` is the escape hatch.
- **Should the test harness (`bootBrowserApp`) adopt the preset?** Current
  plan: no. It uses `MemoryViewTarget` and deliberately diverges from the DOM
  runtime; the preset is production composition, not a test double.
- **Should the presets be subpath exports?** Current plan: root exports. The
  packages already expose their barrels; a subpath adds no value until a
  bundler-size need appears.

## 8. Definition of done

- [x] Phase 0–2 landed; Phase 3 gates green.
- [x] App 02 and app 05 use `createNodeApplication` with no behavior loss.
- [x] App 08 and app 19 use `createWebApplication`; app 19 no longer carries
      `currentPath`.
- [x] Generator templates emit the presets, not the long form.
- [x] Guide 01, guide 30, the guide index, the root README, and the boot README
      describe the new default path and the manual escape hatch.
- [x] `CHANGELOG.md` has the Added/Changed/Fixed entries.
- [x] `docs/plans/README.md` moves this plan to Completed with the execution
      date.
