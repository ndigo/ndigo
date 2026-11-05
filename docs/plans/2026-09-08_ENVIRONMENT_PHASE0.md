# Environment Phase 0 — Named Property Sources, JS-Native Index Strategy

**Date:** 2026-09-08
**Status:** Draft — awaiting decisions D2/D3/D6 plus bench sign-off
**Roadmap:** Phase 0 of the Environment roadmap (see research summary, prior chat): foundations for placeholders (P1), standard sources & precedence (P2), profiles completion (P3), typed binding v2 (P4), origin tracking & customizers (P5), validation & DX (P6).
**Prerequisite decision from roadmap:** the documented source-precedence doctrine is deferred to P2. Phase 0 establishes _named, ordered_ sources so that doctrine becomes a configuration decision, not an API change.

## 1 · Objective

Introduce named, ordered **property sources** with a source registry, wrapped in the existing resolver — and do it with JavaScript-native data structures, not Java ports. Spring's `MutablePropertySources`/`PropertySource` model is the semantic reference, but its implementation (iterate all sources, two virtual calls per source, per-lookup) is exactly the kind of structure that works in Java and underperforms in JS.

User stories:

1. As an application, I can register a property source under a name, and **reorder/add/remove/replace** sources relative to each other (test overrides, customizer hooks, platform layering) without the stale-chain footgun of mutating a returned array.
2. As a library author, I get the **same lookup cost** after ordering surgery as before it — ordering operations never linearize lookups.
3. As a framework maintainer, I get a **documented precedence claim** for `NodeEnvironment` (`process.env` vs constructor sources) that matches tests.
4. As a Phase 5 consumer, the index retains **per-key origin** (which source won) so origin tracking is a read, not a rework.

Non-goals (explicit): placeholders `${key}`, CLI args, config files, env-var relaxation, default-profile activation, typed binding, validation, browser sources — those are P1–P6.

## 2 · Current state (evidence)

| Location                                                                                                                 | What it does                                                                                                                                                                                                    | Problem                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `environment.ts` — `Environment`/`ConfigurableEnvironment`/`AbstractEnvironment`/`StandardEnvironment`/`MockEnvironment` | `propertySources: JSONObject[]` get/set; `merge()`; profile sets; `PrototypalPropertyResolver` backend                                                                                                          | Getter returns the **live internal array** — `push` mutates it without rebuilding the resolver chain (stale lookups until re-assignment). Boot does `push` + re-set (`application.ts:138-141`) — works today only because it re-assigns; any caller that forgets is a silent bug |
| `property-resolver.ts` — `PrototypalPropertyResolver`                                                                    | Prototype-chain of source objects; `getProperty`/`hasProperty` via `parseKeypath` + `reduce`                                                                                                                    | Per-lookup allocation: `KeypathConverter.convert` builds a fresh token array every call (`keypath-expression.ts`); no origin info; replace-all semantics only                                                                                                                    |
| `node-environment.ts`                                                                                                    | `super([...propertySources, process.env])` — **docstring says "process.env is the primary source"** but code puts custom sources first; backing is the **live** `process.env` binding, not a snapshot           | Doc/behavior contradiction + live-binding cost (D7); `node-environment.spec.ts` pins custom-sources-override-`process.env` — tests win, docstring is wrong                                                                                                                       |
| `browser-environment.ts`                                                                                                 | `extends StandardEnvironment`, no sources                                                                                                                                                                       | Fine for P0 (P2 gives it sources)                                                                                                                                                                                                                                                |
| Callers of `propertySources`                                                                                             | `application.ts:139-141` (boot, push+re-set), `configuration.ts:308-310` (`processPropertySource` replace-all), `environment.ts:176-180` (`merge` concat+re-set), `node-environment.ts` constructor, plus specs | All in-repo — migratable in P0; constructor signatures stay compatible                                                                                                                                                                                                           |
| `radix-tree.ts` (ndigo-core)                                                                                             | `RadixTree<V>`: segment trie, `insert`/`lookup`/`delete`, `NodeKind = static\|param\|wildcard`; URL-routing-oriented (`:param`, `{name}`)                                                                       | Precedent for custom structures; a config variant would be static-segment-only — **not** the existing class                                                                                                                                                                      |
| Bench convention                                                                                                         | `vitest bench` in `packages/ndigo-context/bench/context-lookup.bench.ts`, run via `pnpm test:bench`                                                                                                             | P0 adds `property-lookup.bench.ts`                                                                                                                                                                                                                                               |

## 3 · The Java-ism → JS-native translation (the point of this phase)

Spring's design is shaped by JVM structures and by config being read ~once at startup. ndigo's environment is read **per-request and per-render** (argument resolvers, feature gates, browser bootstrap), so lookup cost and allocation count matter. Port semantics, not implementation:

| Spring (Java)                                                                                                                                                                                  | Why it's wrong for JS                                                  | ndigo native replacement                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MutablePropertySources` = source _list_; every `getProperty` iterates all sources, calling `containsProperty` + `getProperty` per source (2 virtual calls × n sources × keypath tokenization) | O(n) per lookup; per-call allocation; virtual dispatch                 | **Ordered name index + compiled lookup index**: name ops O(1) via `Map`; lookups O(segments) native property walks — never linear in source count                                           |
| `LinkedHashMap`-ordered maps                                                                                                                                                                   | unnecessary class baggage                                              | JS object/`Map` preserve insertion order natively                                                                                                                                           |
| `PropertySource` abstract zoo (`MapPropertySource`, `SystemEnvironmentPropertySource`, …)                                                                                                      | per-source virtual calls + subclass latency                            | **One minimal shape**: `{ name, properties: JSONObject }` — the object _is_ the source; `getProperty` = native walk. Subclasses later only where genuine behavior differs (CLI parsing, P1) |
| Per-lookup `parseKeypath` token array (`keypath-expression.ts`, fresh `tokens[]` per call)                                                                                                     | allocation in the hot path                                             | **Compiled-key cache** (bounded `Map<string, KeypathToken[]>`) inside the index; flat-key strategy needs no tokenization at all                                                             |
| Deep source chains (Spring: up to ~30 sources)                                                                                                                                                 | per-level hash walk, still O(1)-ish — but _build-on-mutation_ beats it | **Strategy choice, bench-driven** (D3, platform-split per D6)                                                                                                                               |

### Research: candidate data structures (evidence)

`parseKeypath`/`keypath-expression` consumer audit (graft): exactly two consumers — `property-resolver.ts:139,167` (the lookup hot path) and `data-binder.ts:117` (`_assocPath`, cold path). Nothing else in the repo has shipped on it, so treating the tokenizer as replaceable is safe; `data-binder` keeps using it as-is.

| Structure                                                             | JS reality / evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Wins when                                                          | Verdict for ndigo                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Native object property access** (V8 hidden classes + inline caches) | Read-heavy string-key workloads are objects' home turf in modern engines ([OpenReplay](https://blog.openreplay.com/map-set-object-javascript-difference/), [Medium](https://medium.com/@kaushalsinh73/javascript-map-vs-object-performance-and-use-cases-94c52375fe4c)); repeated same-shape access compiles to a load, not a hash                                                                                                                                                                                                                                      | Exact key lookups, hot loops                                       | **`FlatMergedIndex`** — flat object keyed by dot-joined paths: one monomorphic-capable load, zero allocation. Expected default for Node                                                                                                                       |
| **`Map`**                                                             | Competitive; wins for frequent mutation and non-string keys; read-heavy string keys slightly behind objects                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Dynamic inserts/removals at runtime                                | Name registry (`PropertySources`) uses `Map` for O(1) name ops; **not** the lookup index                                                                                                                                                                      |
| **Radix / Adaptive Radix Tree**                                       | Real JS evidence exists: ART vs AVL vs native `Set` benchmark — trees lose to native hash structures for exact lookups; win only for ranges/prefixes, and the JS ART author's complexity budget was large ([dvanderweele](https://dvanderweele.com/how-i-built-an-adaptive-radix-tree-compound-key-index-latin1-collation-regex-compiler-and-183kb-regex-pattern-for-the-complete-works-of-shakespeare-all-in-javascript)). Existing ndigo-core `RadixTree` is URL-routing-shaped (`NodeKind = static\|param\|wildcard`, `delete`) — wrong shape for config keys anyway | Prefix scans, ordered iteration, longest-prefix fallback (`app.*`) | **`RadixKeypathIndex`**, deferred to P2 (browser allow-list workload) — only if prefix queries appear and bench supports it                                                                                                                                   |
| **QP-trie / crit-bit / Judy / HAT-trie**                              | C/Rust/SIMD/Fortran niches ([fanf2 qp-trie research](https://deepwiki.com/fanf2/qp/4.5-other-research-notes:-write-buffers-jumbo-branches-and-compaction)); no credible JS-native implementation beats a flat object for config-size exact lookups; porting means faking cache-line control JS doesn't expose                                                                                                                                                                                                                                                           | Big sparse keyspaces, ordered ops, memory density                  | **Not considered** — no evidence of JS win in our key-space                                                                                                                                                                                                   |
| **HAMT (persistent maps)**                                            | Structural sharing shines for immutable _snapshots_ (Clojure's approach, [javacodegeeks](https://www.javacodegeeks.com/2026/02/clojures-persistent-data-structures-immutability-without-the-performance-hit.html)); JS ports exist but add indirection                                                                                                                                                                                                                                                                                                                  | Frequent copy-on-write of large maps                               | **Not needed** — mutations are rare (source replace), rebuild is O(n) keys per mutation and lazy-dirty amortizes it; no snapshot economy                                                                                                                      |
| **Codegen accessors** (`new Function('src', 'return src.a.b.c')`)     | Monomorphic IC per generated function ⇒ near-literal speed for fixed paths; **blocked by CSP without `unsafe-eval`** ([MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP), [Invicti](https://www.invicti.com/blog/web-security/content-security-policy), [CentralCSP](https://centralcsp.com/articles/trusted-types-eval))                                                                                                                                                                                                                              | Very hot fixed paths (per-request `server.port`)                   | **Deferred, excluded from P0** — eval-family rejected on security grounds (CSP + static-scanner/audit surface, [Repo Deploy Security](https://security.snyk.io)); revisit only if P0 bench shows persistent poor performance, and only with a security review |
| **`process.env` snapshot**                                            | Node's `process.env` is a getter-backed live binding; repeated access goes through the native layer; copying once to a plain object gives monomorphic access + 12-factor freeze                                                                                                                                                                                                                                                                                                                                                                                         | Node hot loops reading env                                         | **D7**: `NodeEnvironment` snapshots `process.env` into a plain object at construction (behavior change, flagged below)                                                                                                                                        |
| **Key-token memoization**                                             | `parseKeypath` allocates a token array per call; consumers: resolver hot path + `data-binder` cold path (grep evidence above)                                                                                                                                                                                                                                                                                                                                                                                                                                           | Repeated lookup of same keys                                       | **Compiled-key cache**: bounded `Map<string, KeypathToken[]>` (cap + FIFO eviction) inside the index; flat strategy skips tokenization entirely                                                                                                               |

### Lookup index strategies (D3 candidate set)

P0 candidates (1–2) implement one internal interface; 3–4 are deferred/excluded — the resolver's chain/table stays swappable behind `PropertyResolver` either way:

1. **`PrototypeChainIndex`** (today's `PrototypalPropertyResolver`, wrapped to take `PropertySource[]`): prototype-chain of source objects; live view of source maps (mutation visible without rebuild); zero build cost; native walk per lookup. Weakness: no prefix/range queries, per-key origin requires a walk to determine. **Conservative default for browsers / non-V8 engines** until evidence says otherwise.
2. **`FlatMergedIndex`**: compiled on mutation — one flat object keyed by dot-joined keypaths, winner per key recorded (source name) so P5 origin is a field read. Lookup = `map[key]`, **zero allocation, zero tokenization**. Weakness: source-map mutation after build goes invisible until next rebuild (sources are replaced, not mutated — acceptable; note in docs). **Expected default for Node** (V8 object property access; bench-gated).
3. **`RadixKeypathIndex`** — deferred. A static-segment radix tree (a _new_ structure — the existing ndigo-core `RadixTree` is URL-routing-shaped with `NodeKind = static|param|wildcard` and `delete` semantics we don't need). Wins only for prefix scans / subtree extraction, the P2 browser allow-list use case (`exposePrefix('app.*')`). Not built in P0 unless bench data shows single-key lookups at ≥ 1k keys suffering.
4. **Codegen accessors** — **excluded from P0** (D8). Revisit only on measured poor performance; any future eval-family path ships behind a security review.

Default selection is a **bench decision, not a taste decision** (D6): scenarios in §8.

## 4 · Decisions

### D1 — One minimal `PropertySource` shape

```ts
interface PropertySource {
    readonly name: string; // 'systemEnvironment' | 'user:0' | … callers choose
    readonly properties: JSONObject; // the source IS a plain object
    getProperty(key: string): JSONValue | undefined; // keypath walk over `properties`
    containsProperty(key: string): boolean;
}
```

Plain-object backing keeps prototype-chain and flat-index builds trivial. No abstract class hierarchy in P0. Auto-wrap helper `wrapSource(name, obj) → PropertySource`; anonymous objects entering via legacy APIs get stable names `source:0`, `source:1`, … (stable = safe anchors for later `addBefore`).

### D2 — `PropertySources` read interface + `MutablePropertySources` (Spring-exact pair)

Mirrors the repo's existing port of Spring's sibling pair (`PropertyValues` interface + `MutablePropertyValues` in ndigo-core): the read face for consumers that only look (`merge`, index builds, test spies), the mutable class for wiring code. Both live in `property-sources.ts`.

```ts
/** Read-only view of the ordered, named property sources. */
interface PropertySources extends Iterable<PropertySource> {
    readonly size: number; // O(1)
    get(name: string): PropertySource | undefined; // O(1)
    contains(name: string): boolean; // O(1)
    toArray(): PropertySource[]; // snapshot for index rebuild
}

/** Mutable registry: O(1) name ops, cached order, no linked list. */
class MutablePropertySources implements PropertySources {
    get(name: string): PropertySource | undefined; // O(1)
    addFirst(name, obj): this; // + 3 more: addLast, addBefore(anchor, …), addAfter(anchor, …)
    remove(name): boolean; // O(1)
    replace(name, obj): boolean; // keeps position, swaps source
    toArray(): PropertySource[]; // lazy-rebuilt on mutation
}
```

- Backing: `Map<string, PropertySource>` (name ops O(1), insertion order) + cached `PropertySource[]` rebuilt lazily on mutation for iteration/chain builds.
- **Error semantics (Q4)**: only the relative-anchor ops throw — `addBefore`/`addAfter` with an unknown anchor throw `IllegalStateError` (the resolver's existing misconfiguration class, `getRequiredProperty` precedent; Spring throws `IllegalArgumentException` here). Message names the missing anchor **and** lists the registered names so a typo is self-diagnosing: `Unknown property source anchor "systemEnviroment"; available: systemEnvironment, user:0`. `remove`/`replace` return booleans (absence is a valid outcome — existence-conditional use). `addFirst`/`addLast` never throw.
- **Mutation → invalidation hook**: the environment subscribes; resolver index rebuilds on next lookup (dirty flag) or eagerly (default: lazy-dirty, so burst edits cost one rebuild).
- `ConfigurableEnvironment` gains `getPropertySources(): MutablePropertySources` (method — avoids colliding with the deprecated array getter; Spring's method of the same name returns the mutable type) **and** keeps the `propertySources: JSONObject[]` get/set as a **compatibility alias, kept indefinitely (deprecated in docs)**. Setter = replace-all (registry clear + addLast per source, auto-wrapping plain objects); getter returns a **fresh snapshot copy each call** — mutating the returned array is a documented no-op (it never affected lookups unless re-assigned; today's push-then-reassign footgun at `application.ts:138-141` becomes impossible). In-repo callers migrate to the registry in P0: `application.ts:139-141` → `getPropertySources().addLast(...)`; `environment.ts:176-180` `merge()` → read other via `getPropertySources()` (read interface only) + profiles unchanged; `configuration.ts:308-310` → replace-all via registry clear+add.

### D4 — `NodeEnvironment`: behavior kept, docstring fixed, env source named

Tests win: `node-environment.spec.ts` pins constructor sources over `process.env`. Keep that precedence; fix the docstring to say custom sources are merged _before_ `process.env` (i.e. higher precedence). Register `process.env` under **`systemEnvironment`** (Spring parity; the name becomes anchorable/reorderable — also the future relaxation site in P1 and the browser allow-list analog in P2). Constructor signature `(propertySources: JSONObject[] = [])` unchanged.

`BrowserEnvironment` / `StandardEnvironment` / `MockEnvironment`: no behavioral change; all constructors accept plain objects and wrap them.

### D5 — Index strategy behind one interface; default bench-chosen

`PrototypalPropertyResolver` is refactored to compose a strategy; its public surface (`getProperty`, `hasProperty`, `getRequiredProperty`, `propertySources` setter) unchanged. Strategy interface (internal):

```ts
interface PropertyIndex {
    build(sources: PropertySource[]): void; // on invalidation
    getProperty(key: string): JSONValue | undefined; // core hot path
    hasProperty(key: string): boolean;
    // design point, not API: per-key winner retained for P5 origin reads
}
```

Per-lookup allocation budget: **zero allocations on hit for `FlatMergedIndex`; at most the cached token array for `PrototypeChainIndex`** (compiled-key cache). Both O(segments) worst case, O(1) amortized expected.

### D6 — Bench before default, **platform-split**

New `packages/ndigo-context/bench/property-lookup.bench.ts` (vitest bench, matching `context-lookup.bench.ts` conventions):

| Scenario       | Variables                                     |
| -------------- | --------------------------------------------- |
| Flat config    | 10 / 100 / 1,000 keys                         |
| Layered config | 2 / 8 / 32 sources, 25% key overlap           |
| Access mix     | hit / miss / nested (`a.b.c`)                 |
| Mutation cost  | rebuild after 1 / 10 / 100 registry mutations |

Baseline: today's resolver on the same fixtures. Target: no matrix cell regresses **≥ 10%** vs baseline; mutation-rebuild amortized cost within margin on the sustained-mixed case.

**Decision rule (per platform):**

The public surface is identical everywhere — `Environment` → `PropertyResolver` + the `PropertySources`/`MutablePropertySources` registry; user code never sees the index. Only the **internal strategy default** differs, selected by the platform class: `NodeEnvironment` → `FlatMergedIndex` (if the rule below passes), `BrowserEnvironment` and `StandardEnvironment` (boot default, tests) → `PrototypeChainIndex` (today's behavior, zero risk; no non-V8 evidence). Parity between strategies is a spec'd guarantee: identical query results on identical registries (success criterion #2); the one divergence — in-place source-map mutation after build is invisible to flat until the next invalidation — is covered by the replace-not-mutate contract (D7) and documented. Explicit override `{ index: 'flat' | 'prototype' }` on the resolver/environment constructor stays behind the same interface for pathological configs; no auto-upgrade.

**Selection rule:** the bench answers one question — _which single strategy_ — against a **pre-committed representative workload**, not a boundary hunt. No key-count threshold.

- **Node (V8)**: `FlatMergedIndex` becomes the default **iff** it wins the representative workload by **≥ 10% median** and **no matrix cell regresses ≥ 10%** vs prototype, and the sustained-mixed-mutation case stays within margin. Otherwise — tie or prototype win — `PrototypeChainIndex` stays the default (ties go to prototype: it _is_ today's behavior, zero regression risk, live-view semantics, zero build cost).
- **Browser**: `PrototypeChainIndex` default — configs are typically small (tens of keys), build cost buys nothing, and non-V8 engines (SpiderMonkey, JavaScriptCore) have no local evidence. Same rule applies if a browser-representative bench is added later (small-N, cold JIT).
- **No auto-upgrade / no magic threshold**: one production strategy per platform (static default), explicit override (`{ index: 'flat' | 'prototype' }`) for pathological configs, documented.
- The bench proves **V8 (Node) only**. Non-V8 engines get the conservative default because no evidence exists — documented in the bench file and the ADR.

**Bench protocol (committed now):** representative Node workload = layered config, 8 sources, 25% overlap, merged ≥ 100 keys, hit-heavy access mix (typical app shape; mutations are startup-time in practice — covered by a sustained 1%-mutation case). Metric: median ns/op with outlier trimming.

**Bench outcome (2026-09-08, V8/Node):** lookup costs are within noise at config scale. Representative workload: flat beats prototype by ~6–20% median across runs — **does not clear the ≥ 10% committed bar** (run-to-run variance straddles it). Sustained 1%-mutation case: prototype is ~15× faster (flat's full merge rebuild is heavy). **Decision: `PrototypeChainIndex` remains the default on both platforms** (ties/borderline go to prototype, per rule); `FlatMergedIndex` stays available via the explicit `{ index: 'flat' }` override. Full numbers in `pnpm exec vitest bench --run` output.

`RadixKeypathIndex` only on evidence (1k+ keys or prefix workload — revisit at P2). Codegen accessors are **out of scope entirely** (D8).

### D7 — `NodeEnvironment` snapshots `process.env` (behavior change, flagged); `refresh()` ships in P0

Copy `process.env` into a plain object at construction instead of holding the live getter-backed binding: repeated reads become monomorphic property access (the research table's `process.env` row), and post-boot `process.env` mutation stops being visible — the 12-factor-correct contract ("sources are replaced, not mutated") and the same semantics the flat index assumes. The snapshot is a **spread copy** (`{...process.env}`), not a literal copy — an env var named `__proto__` must not pollute the source (existing `createNull()` prototype chaining hardens downstream anyway); pinned by spec.

**Flagged behavior change:** code that sets `process.env.X` after boot and expects `environment.getProperty('X')` to see it breaks. Mitigation is first-class **`refresh()`** on `NodeEnvironment` (in P0, 3 lines — `getPropertySources().replace('systemEnvironment', {...process.env})`, which keeps position and invalidates the index) so dynamic env in tests/dev flows stays one discoverable call; the recipe itself is documented. Existing `node-environment.spec.ts` pins stay green (they set env _before_ construction).

### D8 — No eval-family / codegen in Phase 0 (security gate)

`new Function`/`eval`/string-compiled accessors are **excluded from P0** regardless of bench results — the security surface (CSP `unsafe-eval`, static scanners, bundle audits) outweighs the projected speedup on config lookups. Any future eval-family candidate ships only if: (a) P0/P1 benches show persistent poor performance at the target workload, (b) it is gated behind an explicit opt-in, (c) a security review signs off, and (d) it never reaches `ndigo-platform-web` (strict CSP is common there). Noted here so the reasoning survives the session.

## 5 · Project structure

```
packages/ndigo-context/src/
  property-source.ts        NEW  — PropertySource, wrapSource, auto-naming
  property-sources.ts       NEW  — PropertySources interface + MutablePropertySources (D2)
  property-resolver.ts      EDIT — strategy interface, PrototypeChainIndex, FlatMergedIndex, compiled-key cache
  environment.ts            EDIT — registry wiring, compat alias, merge() migration
packages/ndigo-context/bench/
  property-lookup.bench.ts  NEW  — D6 scenarios
packages/ndigo-platform-node/src/node-environment.ts  EDIT — docstring, systemEnvironment name, refresh() (spread copy)
packages/ndigo-platform-node/test/node-environment.spec.ts  EDIT — assert precedence + name; refresh() re-snapshot + __proto__ pin
packages/ndigo-context/test/
  property-sources.spec.ts  NEW  — registry ordering/name/removal/invalidation
  property-resolver.spec.ts EDIT — both strategies, zero-alloc assertions, origin retention
  environment.spec.ts       EDIT — merge via registry, compat alias
packages/ndigo-boot/test/application-builder.spec.ts  EDIT — boot addLast ordering
docs/decisions/2026-09-08_AD11_ENVIRONMENT_PROPERTY_SOURCES.md  NEW — ADR capturing D1–D8
```

Exports: `property-source.ts` + `property-sources.ts` re-exported from `packages/ndigo-context/src/index.ts` (it already exports everything per module).

## 6 · Code style

Matches the module's existing idioms (see `environment.ts`, `property-resolver.ts`): `#private` fields, tsdoc `/** … */` on every public symbol, `Reflect.defineProperty` where hot, no defensive copies in hot paths, `like*` guards where shape-tests are exported. One real snippet of the new surface:

```ts
const { defineProperty } = Reflect;

/** Read-only view of the ordered, named property sources. */
export interface PropertySources extends Iterable<PropertySource> {
    readonly size: number;
    get(name: string): PropertySource | undefined;
    contains(name: string): boolean;
    toArray(): PropertySource[];
}

/** Ordered, named property sources with O(1) name ops and cached order iteration. */
export class MutablePropertySources implements PropertySources {
    #byName!: Map<string, PropertySource>;
    #ordered!: PropertySource[] | null; // lazy rebuild on mutation

    get size(): number {
        return this.#byName.size;
    }

    addFirst(name: string, source: JSONObject): this {
        const entry = wrapSource(name, source);
        this.#byName.set(name, entry);
        this.#ordered = null; // invalidate; next toArray() rebuilds
        return this;
    }

    addAfter(anchor: string, name: string, source: JSONObject): this {
        // splice into #ordered snapshot, re-set in #byName, invalidate
        return this;
    }

    toArray(): PropertySource[] {
        // lazy rebuild from #byName insertion order
        return (this.#ordered ??= [...this.#byName.values()]);
    }

    *[Symbol.iterator](): Iterator<PropertySource> {
        yield* this.toArray();
    }
}
```

## 7 · Testing strategy

Vitest, project suite (`pnpm test`), targeting the observable contract:

- **`MutablePropertySources`**: insertion order; `addFirst/addLast/addBefore/addAfter` — unknown anchor in `addBefore`/`addAfter` throws `IllegalStateError` whose message names the anchor and lists the registered names; `remove`/`replace` return booleans and preserve relative order of survivors; `replace` keeps position; auto-naming stability across mutations; the read interface (`PropertySources`) exposes no mutators (type-level).
- **Index parity**: both strategies return identical values for identical registries (property fuzz over hit/miss/nested); `getRequiredProperty` throws on miss.
- **Zero-allocation**: `FlatMergedIndex.getProperty` hit path allocates nothing (assert via `expect`-level instrumentation or documented `Object`-count bench — count allocations in the bench, not unit tests).
- **Origin retention**: after build, winner-per-key is recoverable (internal accessor) — unit-tested so P5 doesn't rework.
- **Boot path**: `Application._configurePropertySources` → `addLast` semantics; `merge()` composes registries.
- **NodeEnvironment**: custom-overrides-`process.env` (existing pins stay green); `systemEnvironment` name present; post-construction `process.env` mutation invisible until **`refresh()`** (which re-snapshots in place via `replace`); env var named `__proto__` does not pollute the source (spread-copy pin).
- **Legacy compat**: `propertySources = [map1, map2]` setter still resolves (replace-all); getter returns a **fresh snapshot** (mutating it is a no-op, pinned by spec); constructor arrays still work.
- Bench file is a **deliverable**, not decoration: run `pnpm test:bench` and record baseline vs. strategy numbers in the PR.

## 8 · Boundaries

- **Always:** run `pnpm test` (full suite), `pnpm test:bench`, `pnpm lint`, `pnpm format` before landing; keep every existing environment/property/boot spec green (behavior pins win); document the compat alias as deprecated-on-arrival.
- **Ask first:** removing or retyping the `propertySources` getter/setter beyond the compat alias; changing `NodeEnvironment` source precedence; the **D7 snapshot behavior change** (post-boot `process.env` mutation invisibility — new contract, flagged); **any eval-family / `new Function` / string-compiled code** (D8 — requires security review, out of scope for P0); new runtime dependencies (none expected — `Map`, objects, existing `Reflect` idioms only); ADR numbering (next is **AD11**).
- **Never:** mutate the returned `propertySources` array in migrated code; add per-lookup allocations to the hot path; port Java structures wholesale (the §3 table is the contract); introduce eval, `new Function`, or any string-compiled accessor in P0; implement P1–P2 features sneaking in under "while we're here".

## 9 · Success criteria (testable)

1. `new MutablePropertySources()` + 5 mutation ops + `remove`/`replace` all covered by specs; unknown-anchor `addBefore/addAfter` throws `IllegalStateError`; `PropertySources` read interface exposes no mutators.
2. `PrototypeChainIndex` and `FlatMergedIndex` produce identical query results on a shared fixture matrix (hits, misses, nested keypaths, 32-source overlaps).
3. `FlatMergedIndex.getProperty` hot path makes zero allocations on hit; `PrototypeChainIndex` reuses a compiled-key cache (bounded, evicts).
4. Bench ships and runs: no matrix cell regresses ≥ 10% vs. today's resolver; mutation-rebuild stays within margin on the sustained-mixed case; representative workload decides the Node default per D6; `pnpm test:bench` output committed with numbers.
5. `NodeEnvironment` docstring matches tests; `systemEnvironment` registered name observable from `getPropertySources()`.
6. Boot `properties(...)` and `merge()` produce the same resolution results as today across `application-builder.spec.ts`, `environment.spec.ts`, `node-environment.spec.ts` — suite green, zero behavioral diffs (except D7).
7. Per-key winning source retained by the index (P5 origin read works without rework).
8. **D7 pinned**: `NodeEnvironment` resolves from a construction-time `process.env` spread snapshot — env vars set _after_ construction are invisible until **`refresh()`** re-snapshots in place; `refresh()` keeps the `systemEnvironment` position and invalidates the index; `__proto__`-named env var does not pollute; all existing pins green.

## 10 · Rollout

1. Land D1/D2 (property-source.ts, property-sources.ts) + specs — pure additions, nothing wired.
2. Refactor `PrototypalPropertyResolver` onto the strategy interface with `PrototypeChainIndex` extracted; prove parity via existing specs + fuzz.
3. Add `FlatMergedIndex` + compiled-key cache + origin field; parity specs.
4. Bench (`property-lookup.bench.ts`), run, record; choose default per D6.
5. Wire registry into `AbstractEnvironment`; migrate boot/merge/processPropertySource; compat alias + deprecation note.
6. `NodeEnvironment` docstring + `systemEnvironment` name.
7. ADR + full suite + format + lint; `graft build` (graph refresh).

## 11 · Open questions

- **Q1 — `PropertySources` vs `MutablePropertySources` (resolved → D2, option C)**: **both, as a pair** — `PropertySources` read interface + `MutablePropertySources` class, matching the repo's existing `PropertyValues`/`MutablePropertyValues` port (ndigo-core) and Spring's exact split. Read side serves real P0 consumers (`merge`, index builds, test spies); collision-proof for future code; `ConfigurableEnvironment.getPropertySources()` returns the mutable type (Spring parity; the deprecated array getter stays a getter, so the method name is collision-free).
- **Q2 — Selection rule (resolved → D6)**: representative-workload rule — flat default iff ≥ 10% median win, no cell ≥ 10% regression, mixed-mutation within margin; ties go to prototype; **no key-count threshold / no auto-upgrade**; explicit `{ index: 'flat' | 'prototype' }` override documented. Committed protocol: layered, 8 sources, 25% overlap, ≥ 100 keys, hit-heavy, median ns/op with outlier trimming.
- **Q3 — Compat-alias lifetime (resolved → option A)**: kept **indefinitely**, deprecated in docs. Setter = replace-all (registry clear + addLast); getter returns a **fresh snapshot copy** — mutating it is a documented no-op, which removes today's push-then-reassign footgun. No removal horizon (P4's typed binding never touches this alias).
- **Q4 — `addBefore` unknown anchor (resolved → throw)**: `addBefore`/`addAfter` with an unknown anchor throw `IllegalStateError` (house misconfiguration class; Spring throws `IllegalArgumentException`) with a message naming the missing anchor and listing the registered names. `remove`/`replace` stay boolean-returning (existence-conditional use); `addFirst`/`addLast` never throw (no anchor). Silent failure would hide precedence typos until production.
- **Q5 — Codegen/eval-family (resolved → D8)**: **excluded from P0.** The surfacing question is moot for this pass — no `new Function`/eval anywhere, core or platform. Revisit only if P0/P1 benches show persistent poor performance; any future path needs a security review, an explicit opt-in, and must never reach `ndigo-platform-web`.
- **Q6 — D7 snapshot contract (resolved → accept)**: `NodeEnvironment` snapshots `process.env` **and ships `refresh()` in P0** (re-snapshot via `replace('systemEnvironment', {...process.env})`) — the only real objection, dynamic env in tests/dev, gets a one-call answer instead of a documented caveat. Zero in-repo production impact (grep: all env reads are direct `process.env`, none through the environment; `NodeEnvironment` has no boot wiring yet — contract is set before first adopter). Spread copy avoids `__proto__` pollution.
- **Q7 — Engine-fallback selection (resolved → static per-package defaults)**: `NodeEnvironment` → `FlatMergedIndex` (pending bench), `BrowserEnvironment`/`StandardEnvironment` → `PrototypeChainIndex`. **No runtime engine detection** — the package boundary _is_ the platform signal; detection is untestable in CI (Vitest runs V8), fragile (`navigator`/`process.versions` probes), and redundant (the import graph already knows). The explicit `{ index: 'flat' | 'prototype' }` override covers any deploy that needs the non-default; engine-specific tuning only becomes a package-constant change once real non-V8 evidence exists.
