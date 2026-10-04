# TypeScript-Native Layer Plan — AD-34

**Date:** 2026-09-27
**Status:** Spec + tasks — ready for wave selection
**Scope:** Seven suggestions (S1–S7) from the 2026-09-27 Spring-heritage evaluation, adding the TypeScript layer to Spring-derived surfaces. Touches `blue-factory`, `blue-context`, `blue-boot`, `blue-dispatcher`, `blue-cache`, `blue-oxlint-plugin`, `apps/blue-api`, plus guides 03/07/09 and a new ADR (AD-34).
**Decision record:** `docs/decisions/2026-09-27_AD34_TYPESCRIPT_NATIVE_LAYER.md` (drafted in Wave 4).

---

## 1. Background

BlueJS ports Spring solutions deliberately; the evaluation found the framework already TS-native where it replaced Java machinery (Zod over Bean Validation AD-7; extractor-factory binding over reflection `@RequestParam`; wrapper decorators over AOP proxies — self-invocation works, stronger than Spring; SpEL rejected, "no expression language" D-5). The remaining Spring-isms are **stringly-typed handles and expression DSLs** — exactly where TypeScript's compile-time layer pays.

### 1.1 Boundaries — explicitly out of scope (decided)

| Spring mechanism                                       | Verdict                                                                                                                                                                                                                             | Evidence                                                                                           |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Runtime SpEL engine                                    | **Rejected** — `key: string \| ((args) => string)` + no expression language                                                                                                                                                         | `blue-cache/src/cached.ts:26-33` (D-5)                                                             |
| Reflection parameter binding / `@Autowired` proxies    | **Rejected** — extractor factories + explicit `new` in `@entry` are strictly better                                                                                                                                                 | `blue-dispatcher/src/parameter-factories.ts`, `apps/blue-api/src/node-app-configuration.ts:61-130` |
| `@Primary` / `@Qualifier` string selectors             | **Rejected** — `ContextToken<T>` (S1) is the TS answer; qualifier strings would reimport the Java flaw                                                                                                                              | `blue-factory/src/context-token.ts`                                                                |
| Bean-presence `@Conditional`                           | **Rejected** — `@profile` gate + plain `if` in the `@entry` method covers the real cases                                                                                                                                            | `node-app-configuration.ts:172-176`                                                                |
| Java-style annotation strings for route mapping tables | **Kept (strings stay canonical)** — mappings deserialize from JSON (`builder.fromConfig`), and the registry needs merge/compareTo ordering; typed forms are programmatic conveniences producing the same canonical strings (D5, D8) | `request-mapping.ts:35-39`, `route-condition.ts:216-304`                                           |

### 1.2 The seven items

| #   | Suggestion                                              | Where the TS layer lands                                                                                |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| S1  | Typed bean graph — tokens first, strings default-off    | `blue-context` (`@entry`), `blue-dispatcher` (`resolveHandlerWithContext`), `blue-oxlint-plugin` (rule) |
| S2  | Typed context events                                    | `blue-context` (typed overlay over `EventEmitter`)                                                      |
| S3  | Schema-derived `@configurationProperties`               | `blue-boot`                                                                                             |
| S4  | Typed property paths + typed programmatic config access | `blue-context`                                                                                          |
| S5  | Profile expression builder                              | `blue-context`                                                                                          |
| S6  | Route-condition builders                                | `blue-dispatcher`                                                                                       |
| S7  | Typed cache references                                  | `blue-cache`                                                                                            |

---

## 2. Specifications

### S1 — Typed bean graph: tokens first

**Problem.** Every app bean is registered and looked up by unchecked string: `@entry cacheManager()` → `'cacheManager'`; app code casts at the call site — `context.getValue<CacheManager>('cacheManager')` (`apps/blue-api/src/cached-report-controller.ts:36-42`). Renames and typos fail at dispatch time, not compile time. `ContextToken<T>` + the dual `string | ContextToken<T>` registry API already exist (`blue-factory/src/registry.ts:11-27`); only 7 framework beans use tokens.

**Shape.**

1. `entry()` (blue-context) gains a token overload:
    ```ts
    @entry(CACHE_MANAGER)          // ContextToken<CacheManager>
    cacheManager() { ... }
    ```
    Decorator metadata records the token; `ConfigurationParser.processEntry` registers under the token (registry is description-keyed — `setValue(token)`/`getValue(token)` already resolve; verified in `factory.spec.ts:256-276`). String form stays.
2. `resolveHandlerWithContext` (blue-dispatcher `_shared.ts:19-22`) accepts `ContextToken<object>`; `MaybeHandler` widens. String handlers stay for deserialized mapping tables.
3. Framework beans migrate to tokens: existing 7 (`DISPATCHER`, `ROUTER`, `HOST_MANAGER_TOKEN`, `HEALTH_REGISTRY`, `METRIC_AGGREGATOR`, `SHARED_DEPENDENCY_REGISTRY_TOKEN`) + beans from auto-configurations discovered in the task (`cacheManager`, `rateLimiter`, …). App lookups in `apps/blue-api` migrate (S1 demo gate).
4. New oxlint rule `no-string-registry-lookup` (`blue-oxlint-plugin`), v1 semantics: flag string-literal `getValue`/`getInstance`/`hasValue`/`destroyValue` calls (any receiver; no declaration scan — the same-module declaration-scan scope from the plan draft was dropped at implementation; documented `oxlint-disable-next-line` for intentional dynamic lookups; v2 candidates: receiver/declaration awareness + static template-literal args).

**Tasks**

- [ ] T1.1 `@entry(TOKEN)` support
    - **Objective:** `@entry` accepts `string | ContextToken`, records the token in metadata; parser registers by token.
    - **Acceptance:** `context.getValue(TOKEN)` returns the entry instance; `@entry('name')` string overload unchanged; token description remains the registry key (rename-safe: renaming a token changes only code, never data).
    - **Verify:** new specs in `blue-context/test` (token round-trip, string compat); existing `@entry` specs green.
    - **Files:** `packages/blue-context/src/configuration.ts`, `packages/blue-factory/src/context-token.ts` (no change expected), specs.
    - **Depends:** —
- [ ] T1.2 Typed handler resolution
    - **Objective:** mappings accept `ContextToken<object>` as handler.
    - **Acceptance:** `requestMapping('/x', { handler: TOKEN, ... })` resolves; string handler still resolves (JSON tables intact).
    - **Verify:** dispatcher spec with token-handler mapping.
    - **Files:** `packages/blue-dispatcher/src/_shared.ts`, `abstract-*-mapping.ts` (type-only), `route-handler-mapping.ts` export.
    - **Depends:** T1.1.
- [ ] T1.3 Framework bean migration
    - **Objective:** all framework `@entry` beans + their lookup sites use tokens; no string lookup of a known bean remains in `packages/blue-*/src` except documented mapping-data paths.
    - **Acceptance:** `grep` over framework src shows zero string-literal `getValue('…')` for migrated beans; suites green.
    - **Verify:** `pnpm run test` (affected: blue-context, blue-factory, blue-dispatcher, blue-management, blue-host, blue-router).
    - **Files:** auto-configurations, token modules, lookup call sites.
    - **Depends:** T1.1, T1.2.
- [ ] T1.4 Demo gate — blue-api token wiring
    - **Objective:** `CachedReportController` uses `CACHE_MANAGER` token (`setApplicationContext` + `getValue`); `cacheManager.getCache('reports')` moves to typed token (T3.5) or stays documented.
    - **Acceptance:** `/api/cached-report` spec keeps passing; no string `getValue` in blue-api src.
    - **Verify:** `pnpm --filter @blue/api test`.
    - **Files:** `apps/blue-api/src/cached-report-controller.ts`, `node-app-configuration.ts`.
    - **Depends:** T1.3.
- [ ] T1.5 oxlint rule `no-string-registry-lookup`
    - **Objective:** mechanical enforcement: string-literal registry lookups named by a declared token are flagged in the same module/package.
    - **Acceptance:** rule spec: flags `getValue('cacheManager')` beside a declared token, passes dynamic-string lookups, honors `oxlint-disable-next-line` with justification.
    - **Verify:** `packages/blue-oxlint-plugin` test suite + `pnpm lint` green repo-wide.
    - **Files:** `packages/blue-oxlint-plugin/src/rules/no-string-registry-lookup.ts`, `index.ts` export, rule spec.
    - **Depends:** T1.3 (rule only ships once migrations landed, else it blocks the repo).

### S2 — Typed context events

**Problem.** Context lifecycle and env events are `emit(type: string | symbol, ...data: unknown[])` (`blue-context/src/event-emitter.ts:36,46`, `generic-application-context.ts:225-379`, `environment.ts:279`). Payloads are invisible to the compiler.

**Shape.** Additive typed overlay; the raw `Emitter` stays string-typed (it is a general-purpose mixin). In blue-context:

```ts
export interface ContextEvents {
    'context:preparing': [context: ApplicationContext];
    'context:refresh': [context: ApplicationContext];
    'context:close': [context: ApplicationContext];
    'context:destroy': [context: ApplicationContext];
    [CONFIG_REFRESH_EVENT]: []; // environment refresh (literal value preserved)
}
```

`GenericApplicationContext.on<K extends keyof ContextEvents>(type: K, listener: (...payload) => void)` / typed `once`/`off`/`emit` overloads over the inherited emitter; same treatment on `AbstractEnvironment` for `CONFIG_REFRESH_EVENT`. Typed and raw forms coexist.

**Tasks**

- [ ] T2.1 `ContextEvents` map + typed overlay on `GenericApplicationContext`
    - **Acceptance:** typed `on`/`emit` compile-check payloads; raw `emit('custom:event', …)` still compiles; lifecycle specs unchanged.
    - **Verify:** new spec asserting payload type errors are rejected by `tsc` (type-level test file) + runtime round-trip.
    - **Files:** `packages/blue-context/src/context.ts`, `generic-application-context.ts` (overloads or a typed mixin), `context-interfaces.ts`, specs.
- [ ] T2.2 Typed environment refresh event
    - **Acceptance:** typed listen on `CONFIG_REFRESH_EVENT` payload `[]`; `@refreshScope` wiring (generic-application-context `_wireRefreshScope`) uses the typed path.
    - **Verify:** `blue-boot` refresh-scope suite green.
    - **Files:** `packages/blue-context/src/environment.ts`, `generic-application-context.ts`.
    - **Depends:** T2.1.

### S3 — Schema-derived `@configurationProperties`

**Problem.** Binding class fields via string-key iteration + relaxed kebab-case matching (`blue-boot/src/configuration-properties.ts:312-337`, `resolveNested:345-405`) can drift from the Zod schema that boots the app. Two descriptions of one environment (`validateWith` in `application-builder.ts:306-309` + the config class; real usage: `apps/blue-api/src/server-config.ts`).

**Shape.** Opt-in `schema` mode:

```ts
const serverSchema = z.object({
    name: z.string().default('blue-api'),
    port: z.coerce.number().default(3000),
});

@configurationProperties('server', { schema: serverSchema })
export class ServerConfig {
    name!: string; // bound from the schema, typed as z.infer
    port!: number;
}
```

`resolveConfigurationProperties` walks `schema.shape` when present: leaf entries bind via the existing `getValueAs` conversion path (Zod primitive → conversion target mapping: `z.coerce.number()` → `Number`, `z.string()` → `String`, `z.boolean()` → `Boolean`, `z.date()` → `Date`, arrays/objects via JSON), `.default()` feeds `@defaultValue`-equivalent semantics, required leaves use `getRequiredPropertyAs` (fail-loud at boot). Relaxed string path and class-field-only mode unchanged; both modes spec-covered.

**Tasks**

- [ ] T3.1 `schema` option + shape-walk binding in `resolveConfigurationProperties`
    - **Acceptance:** schema-mode class binds name/type/default from the schema; missing required property fails boot with the existing loud error; relaxed + field-iteration modes still pass their specs.
    - **Verify:** new specs (schema mode, defaults, missing-required, zod-type → conversion mapping); `pnpm --filter @blue/boot test`.
    - **Files:** `packages/blue-boot/src/configuration-properties.ts`, specs.
- [ ] T3.2 Demo migration — `server-config.ts` to schema mode
    - **Acceptance:** blue-api boots from schema-mode config; behavior identical.
    - **Verify:** blue-api suite green.
    - **Files:** `apps/blue-api/src/server-config.ts`, `node-app-configuration.ts` (wiring if touched).
    - **Depends:** T3.1.

### S4 — Typed property paths + typed programmatic access

**Problem.** `@property('server.port', Number)` paths are unchecked strings (`blue-context/src/configuration.ts:151-171`); `@defaultValue('42')` is a raw env string (`:189-197`). TS cannot typecheck the path — the TS layer is a compile-time key map.

**Shape.**

1. **`propertyKeys` deep-key helper** in blue-context producing template-literal-typed path constants:
    ```ts
    const keys = propertyKeys({ server: { name: '', port: 0 } });
    // keys.server.name: 'server.name' & keys.server.name — typed literal
    @property(keys.server.port, Number)
    ```
    Mapping types recurse; `@property` and `@defaultValue` accept `TemplateLiteralKeys`/`string` (strings stay legal).
2. **`typedConfig(schema)`** — schema-typed programmatic config access on the context:
    ```ts
    context.typedConfig('server', serverSchema); // z.infer<typeof serverSchema> | undefined
    ```
    Thin wrapper over `getPropertyAs`/`getRequiredPropertyAs` (blue-context `environment.ts:248-266`), reusing the S3 zod→conversion mapping.
3. Defaults **stay strings** (env is textual interpolation; `@defaultValue('3000')` semantics unchanged, D4) — path typing is the deliverable, not default typing.

**Tasks**

- [ ] T4.1 `propertyKeys` helper
    - **Acceptance:** deep paths typed as literals (compile-error on unknown key); runtime returns `'server.port'`; degenerate shapes (arrays, `undefined` values) documented.
    - **Verify:** type-level spec + runtime spec.
    - **Files:** `packages/blue-context/src/property-keys.ts` (+ index export), specs.
- [ ] T4.2 `typedConfig` on `ApplicationContext`
    - **Acceptance:** returns `z.infer` typed value or `undefined`; required variant throws on missing; conversion reuse (shared helper with T3.1).
    - **Verify:** spec round-trip against `MockEnvironment`-seeded context.
    - **Files:** `packages/blue-context/src/context.ts`, zod mapping helper module (shared with T3.1), specs.
    - **Depends:** T4.1 (shared mapping helper; T3.1 extracts it).

### S5 — Profile expression builder

**Problem.** `@profile('dev & !ci')` strings are parsed by a hand-rolled tokenizer/recursive-descent parser (`blue-context/src/profile-expression.ts`) — a Java-annotation-era grammar. Strings must stay (env-driven activation, `SPRING_PROFILES_ACTIVE`-style config); in-code use deserves compile-time composition.

**Shape.** Blue-context `Profile` namespace: `Profile.parse(s)` (validates through the existing grammar), `Profile.not('dev')`, `Profile.and('dev', Profile.not('ci'))`, `Profile.or(...)` — every builder returns the **canonical expression string** (`'dev & !ci'`), so decorators, `acceptsProfiles(expression: string)` (env `environment.ts:240-242`), metadata, and serialization stay untouched. Validation happens at build time via the existing parser.

**Tasks**

- [ ] T5.1 `Profile` builder
    - **Acceptance:** composed builders produce parser-accepted canonical strings; malicious/unknown tokens throw at build; `@profile(Profile.and(...))` compiles and activates identically to the string form.
    - **Verify:** profile-expression specs extended (builder→string round-trip, precedence via parens), `blue-boot` profile-activation suite green.
    - **Files:** `packages/blue-context/src/profile.ts` (+ index export), specs.
- [ ] T5.2 Adoption in framework/demo
    - **Acceptance:** at least one `@profile` site moves to the builder; others documented.
    - **Verify:** demo spec profile gate covers the builder form.
    - **Files:** `node-app-configuration.ts` (`devInfo`), specs.
    - **Depends:** T5.1.

### S6 — Route-condition builders

**Problem.** Mapping conditions are string expressions in config objects — `requestMapping({ value: '/users/{id}', method: 'DELETE', queryParams: 'filter=all' })` (`request-mapping.ts:35-39`) — parsed by `AbstractNameValueExpression` (`route-condition.ts:64-146`). Strings are canonical (mapping tables deserialize from JSON; `merge`/`compareTo` ordering at `route-condition.ts:216-304`); in-code conditions get a typed spelling.

**Shape.** Builders in blue-dispatcher returning the canonical expression strings, validated through the existing parsers:

```ts
queryParams: queryParamCondition('filter', 'all'),          // 'filter=all'
queryParams: queryParamCondition('filter', 'all', { not: true }), // '!filter=all'
matrixParams: matrixParamCondition('color', 'red'),
```

Values containing parser metacharacters (`=`, `!`, `,`, `;`) escape per the existing grammar (implementation reads the parser to pin escaping); the mapping config types accept the builder results (they are strings).

**Tasks**

- [ ] T6.1 Condition builders
    - **Acceptance:** builder output expression-equals the hand-written string for the same intent (spec matrix incl. negation, repeated values); config with builder-produced conditions matches and merges identically.
    - **Verify:** `blue-dispatcher` condition specs extended; routing bench unaffected (builders are decoration-time only).
    - **Files:** `packages/blue-dispatcher/src/condition-builders.ts` (+ index export), specs.
- [ ] T6.2 Demo adoption
    - **Acceptance:** an existing conditional mapping in blue-api uses a builder; behavior identical.
    - **Verify:** blue-api suite green.
    - **Files:** `apps/blue-api` controller mapping.
    - **Depends:** T6.1.

### S7 — Typed cache references

**Problem.** `cacheName: 'reports'` + `cacheManager.getCache('reports')` are unchecked strings (`blue-cache/src/cached.ts:36-45`, `cache-manager.ts`).

**Shape.** `ContextToken<Cache<T>>` as the cache handle (data operations awaitable since the AD-40 async-cache cutover):

```ts
export const REPORTS = new ContextToken<Cache<Report>>('reports');

@cached({ cache: REPORTS, ttl: 60_000 })
async reportValue(): Promise<Report> { ... }

await cacheManager.getCache(REPORTS).delete(key);   // typed store
```

`CachedSpec.cache?: ContextToken<Cache<unknown>>` + `CacheManager.getCache` token overload; named lookup remains supported. Manager lookup is local/synchronous; store operations return promises.

**Tasks**

- [ ] T7.1 Token cache handles
    - **Acceptance:** `@cached({ cache: TOKEN })` keys the same named store as the string form (token description is the store name); typed `getCache(TOKEN)` returns the generic store; string `getCache('reports')` still compiles.
    - **Verify:** blue-cache specs (token round-trip, TTL, single-flight, degradation) + blue-api cached-report suite.
    - **Files:** `packages/blue-cache/src/cached.ts`, `cache-manager.ts`, specs.
- [ ] T7.2 Demo migration
    - **Acceptance:** cached-report demo declares `REPORTS` token; both decorator and manual eviction (documented contract `getCache('reports').delete`) use it.
    - **Verify:** `/api/cached-report` invocation counter spec unchanged.
    - **Files:** `apps/blue-api`.
    - **Depends:** T7.1.

---

## 3. Waves and dependency order

| Wave                              | Items                                                                                                    | Depends on                                                                 | Parallelizable                                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Wave 1 — Typed wiring**         | T1.1–T1.5, T2.1–T2.2                                                                                     | —                                                                          | T1.x and T2.x in parallel (different packages; both touch `blue-context` lightly — merge carefully) |
| **Wave 2 — Typed configuration**  | T3.1–T3.2, T4.1–T4.2                                                                                     | Wave 1 merged (shared zod→conversion helper created by T3.1, used by T4.2) | T3 and T4 sequential within (T4.2 depends on the helper)                                            |
| **Wave 3 — Typed DSL ergonomics** | T5.1–T5.2, T6.1–T6.2, T7.1–T7.2                                                                          | Wave 2 merged                                                              | Fully parallel (three packages)                                                                     |
| **Wave 4 — Docs, ADR, gates**     | ADR-34, guide updates (03 env config, 07 caching, 09 argument binding), README plan index, `graft build` | All waves                                                                  | —                                                                                                   |

**Per-wave gate checklist (process fix carried from 09-25/09-27):** `pnpm lint`, `pnpm format:check`, `pnpm build`, affected suites, `pnpm manifest:check` — all green in the same commit that lands the wave. `pnpm format` before the commit.

---

## 4. Verification

1. **Per-task:** acceptance criteria above; behavior changes smoke-tested via `pnpm --filter <pkg> test` plus the demo gate for user-facing surfaces (blue-api `/api/cached-report`, profile-gated bean, conditional mapping).
2. **Per-wave gates:** lint / format:check / build / manifest:check repo-wide + all affected suites.
3. **Type-level guardrail:** T2.1 adds a type-error fixture (a file that must fail `tsc`) so the typed overlay cannot silently degrade to `unknown[]`.
4. **Regression guard:** demo apps (blue-api) exercise S1/S3/S5/S6/S7 end-to-end; `apps/blue-hello-node` untouched (documents the string form still works).
5. **Docs:** ADR-34 records D1–D8; guides 03/07/09 gain one "typed form" section each. `graft build --deep` refreshes the index before the final commit.

## 5. Risks

| Risk                                                                           | Mitigation                                                                                                                                  |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Rule false positives on intentional dynamic lookups (T1.5)                     | v1 scope = same-module token declarations; documented `oxlint-disable-next-line` with justification (repo precedent for justified disables) |
| S3 zod→conversion mapping edge cases (`z.coerce` vs strict, optional/nullable) | Spec matrix in T3.1; unsupported shapes fall back to JSON binding, documented                                                               |
| `@entry(TOKEN)` metadata shape change ripples to `ConfigurationParser`         | T1.1 keeps the metadata key format; parser reads token when present, else name (back-compat)                                                |
| Typed events overlay tempts framework to type every ad-hoc emitter             | D2: overlay only on `GenericApplicationContext` + `AbstractEnvironment`; raw `Emitter` untouched                                            |
| Condition-builder escaping diverges from the hand-written grammar              | T6.1 pins a spec matrix against the existing parser; builders parse their own output at decoration time                                     |

## 6. Decisions for ADR-34

- **D1** Tokens are the canonical bean handle; strings remain a compatibility + data path (JSON mapping tables).
- **D2** Typed events are an additive overlay on the two framework emitters; the core `Emitter` stays string-typed.
- **D3** Schema-derived configuration is opt-in beside the field-iteration path.
- **D4** Property defaults stay env strings; the deliverable is typed paths (T4.1) and typed programmatic access (T4.2).
- **D5** DSL builders produce canonical strings; no predicate/function form for mapping tables (serialize/merge/compare requirements); SpEL remains rejected.
- **D6** No `@Primary`/`@Qualifier`/`@Conditional` ports.
- **D7** oxlint rule v1 = same-module token declarations; package-scope analysis is v2.
- **D8** `blue-generators` token codegen deferred (v2); tokens are declared once per bean root, not per lookup.

## 7. Follow-ups (deliberate deferrals)

- `@parameters` keys cannot be statically checked against handler parameter names (decorator evaluation precedes the method signature; TS has no remedy in decorator position) — document in guide 09, keep the runtime error path.
- `blue-generators` token codegen (D8).
- Package-scope token analysis in the oxlint rule (D7).
