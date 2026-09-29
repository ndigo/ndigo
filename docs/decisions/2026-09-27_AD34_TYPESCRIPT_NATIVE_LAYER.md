# AD-34: TypeScript-native layer — tokens, typed events, schema-bound config, typed DSLs

**Date:** 2026-09-27
**Status:** Accepted — D-1..D-8 ratified and landed 2026-09-27 (all four
waves; see [docs/plans/2026-09-27_TYPESCRIPT_NATIVE_LAYER.md](../plans/2026-09-27_TYPESCRIPT_NATIVE_LAYER.md)).

## Background

BlueJS ports Spring solutions deliberately. The 2026-09-27 evaluation found
the framework already TS-native where it replaced Java machinery (Zod over
Bean Validation, extractor-factory parameter binding over reflection,
wrapper decorators over AOP proxies — self-invocation is intercepted,
stronger than Spring; SpEL rejected at AD-24 D-5). The remaining Spring-isms
were **stringly-typed handles and expression DSLs** — exactly where
TypeScript's compile-time layer pays. This ADR ratifies the TS layer added
for those surfaces and records what stays deliberately Java-shaped.

## Decisions

### D-1 — `ContextToken<T>` is the canonical bean handle; strings are a compat/data path

The registry (`Registry` in `blue-factory`) is description-keyed, so a
token lookup and its string alias resolve the same value — the token is pure
handle, zero runtime cost. The TS layer:

- `@entry(TOKEN)` declaration (blue-context `configuration.ts`); the
  decorator records `{ name, token? }` in metadata and registers by token.
- Typed handler resolution: mapping handlers accept
  `string | ContextToken<object>` (`blue-dispatcher/_shared.ts`); JSON
  deserialized mapping tables keep strings — **mapping data is data**.
- Framework beans migrate to tokens: dispatcher, handler mapping, argument
  resolvers, view target, http server, socket registry/authenticator, cache
  manager, health registry, metric aggregator (plus app beans in the demos).
- New oxlint rule `no-string-registry-lookup` flags string-literal lookups
  (`getValue`/`getInstance`/`hasValue`/`destroyValue`) in non-test files,
  with justified disables for the benchmark fixtures (the string hot path is
  a measured bench axis) and the TypeDoc script (an option bag, not the
  Blue registry). Dynamic (non-literal) names stay legal.

Rejected: `@Primary`/`@Qualifier` string selectors — a qualifier string
would reimport the Java flaw the token eliminates.

### D-2 — Typed events are an additive overlay; the core `Emitter` stays string-typed

`ContextEvents` (lifecycle: `context:preparing/refresh/close/destroy`,
payload `[ApplicationContext]`) and `EnvironmentEvents`
(`config:refresh`, payload `[]`) map event name → payload tuple
(`blue-context/context-events.ts`). `ApplicationContext`,
`ConfigurableEnvironment` and `Environment` gained typed `on`/`off`/`emit`
overloads before the raw fallback overload (last overload = implementation,
so class implementors keep their existing `EventEmitter` mixin methods
unchanged). Raw `string | symbol` events remain legal everywhere. The
framework's general-purpose `Emitter` mixin is untouched — the overlay
exists only on the two framework emitters.

### D-3 — Zod-schema-bound configuration is opt-in; the schema is the single source of truth

`@configurationProperties(prefix, { schema })` binds in **schema mode**:
each shape key resolves `${prefix}.${key}`; coercion, requiredness and
defaults come from the schema (`z.default()` replaces `@defaultValue`;
`z.coerce` replaces the conversion-service target). Fail-loud at boot,
naming the class. The relaxed camelized fallback applies to kebab/snake
field paths in field-decorator mode; schema keys are camelCase shape keys
resolved exactly as `${prefix}.${key}` — schema mode does not probe kebab
spellings. Field-decorator mode (`@property`/`@nested`) is unchanged and remains
the default. The same parse semantics power `Environment.typedConfig` /
`ApplicationContext.typedConfig` (blue-context `schema-config.ts`) — one
module, one behavior, shared by blue-boot. Flat and nested-object shapes are
supported (nested objects arrive whole from the resolver); dotted schema
keys are out of scope. `@defaultValue` is ignored in schema mode (D-4).

### D-4 — Property defaults stay env strings; the deliverable is typed paths

`@defaultValue('3000')` remains textual — the environment is stringly
interpolated and the conversion happens on read. The TS layer for paths is
`propertyKeys(shape)` (blue-context): template-literal-typed leaf keypaths
(`keys.server.port` → `'server.port'`) that `@property` accepts, so typos
fail at compile time. Schema mode's `z.default(value)` supersedes
`@defaultValue` in the literal typing.

### D-5 — Profile grammar stays; `Profile` builder composes it with precedence

The profile expression DSL (`dev`, `!ci`, `a & b`, `(a | b) & c`) remains
the canonical, serializable form — env-driven activation is a string
protocol. `Profile.and/or/not/parse` (blue-context `profile.ts`) build
canonical strings validated through the existing parser at build time, and
parenthesize compounds whose precedence would change meaning under the
grammar (`and(or('a','b'),'c')` → `'(a | b) & c'`). `@profile(...)` and
`acceptsProfiles(...)` accept composed terms. No predicate/function form:
profile metadata is serialized data.

### D-6 — Mapping-condition strings stay; builders round-trip through the parser

Route conditions (`queryParams: 'filter=all'`, `matrixParams: 'color'`)
stay canonical strings — mapping tables deserialize from JSON and the
registry orders/merges conditions by their string form. `queryParamCondition`
/ `matrixParamCondition` (blue-dispatcher `condition-builders.ts`) produce
those strings **with the real parser as the validator**: every built
expression round-trips (`QueryParamExpression(canonical)` must recover the
exact name/value/negation), so a name containing `=` or ending in `!` —
which would silently change meaning — throws at build time. Grammar-legal
characters (a second `=` in the value, matrix `!` in values) are preserved
and verified, not guessed at.

### D-7 — Cache stores get typed handles; `cacheName` stays

`@cached({ cache: REPORTS_CACHE })` and `cacheManager.getCache(TOKEN)` /
`hasCache(TOKEN)` accept `ContextToken<Cache<V>>`; the token description is
the store name, so token and string forms address the identical store
(blue-cache). Explicit `cacheName` with a token is overridden by the token
(precedence documented on the spec). `CachedSpec.cacheName` remains legal.

### D-8 — No predicate-form mapping tables, no generators codegen (v1)

Softer grammars rejected: mapping conditions and profile expressions keep
their string forms because they participate in registry ordering/merging
and JSON serialization — functions would break `merge`/`compareTo` and
deserialization. `blue-generators` token codegen is deferred to v2: tokens
are declared once per bean root, not per lookup. `@parameters` keys cannot
be statically checked against handler parameter names (decorator evaluation
precedes the method signature; TS has no remedy in decorator position) —
documented in guide 09 with the runtime error path as the guard.

## Consequences

- Rename-safe bean/cache/store handles with autocomplete; typo drift fails
  at build, not dispatch.
- Lifecycle/config contracts typed at the compile boundary (typed-events
  spec doubles as the compile gate: payload regressing to `unknown[]`
  breaks the fixture).
- One schema drives keys/coercion/requiredness/defaults for configuration;
  schema-mode classes read as plain `z.infer` shapes.
- Framework lookups migrated token-first; the oxlint rule prevents
  regressions in non-test files. Test suites exercise string lookups
  freely (string remains a supported handle), and the lookup benchmarks
  retain a string axis with a justified disable.
