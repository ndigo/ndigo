# Code Review and Mitigation — 2026-10-04 (Post-AD-43 comprehensive sweep)

**Date:** 2026-10-04
**Scope:** Working tree at `fb919eb9` + uncommitted AD-42/AD-43 work (new
`packages/ndigo-proxy`, `packages/ndigo-resilience`, ndigo-boot `processors()`,
ndigo-api demo gate) and the recent committed wave (`fb919eb9..HEAD`:
ndigo-redis, LibSQL stores, socket fanout, AsyncRepository — commits
`2454c692` `c6d68a09` `33ba7ca5` `151f100f` and doc regen commits). Root
tooling/hygiene reviewed repo-wide.
**Method:** Two parallel read-only review slices (committed-feature review,
workspace/docs wiring audit) plus integrator re-verification: the headline
behavioral claims reproduced by execution against the source tree
(standalone `order` handling, async-interceptor return types), the affected
suites run (12 files / 67 tests green), and the doc-coverage gate and
git-history claims verified directly.
**Status:** Findings recorded; **Waves 1–3 EXECUTED 2026-10-04** — all items
landed, regression-tested, full-repo gates green (tests, typecheck, lint,
format, manifest, prod audit, docs — see §4). Pre-existing gate failures
found en route (docs gate on `CacheMiss` links, ndigo-api typecheck, audit
overrides) were remediated as part of Wave 3.
**Legend:** `[code]` established by reading cited lines · `[exec]` reproduced
by execution · `[inference]` reasoned from code without execution.

---

## 1. Findings

### 1.1 Correctness / API contract (new packages)

**C-1 (Must Fix, Wave 1) — `interceptMethods` ignores the documented `order`
contract; the container path honors it.** `[exec]` Probe on the working tree:
two interceptors with `order` 10 and -5 registered `[a, b]` execute as
`["registered-first","registered-second"]` — registration order, not sorted
order. Container path sorts once at processor construction
(`processor.ts` `sortInterceptors`); `weave.ts` `collectMethodSpecs` filters
the raw array and `interceptMethods` never sorts. `order` is part of the
public `MethodInterceptor` contract, so the standalone path silently behaves
differently. **Fix:** sort interceptors once inside `collectMethodSpecs`
(shared by both paths) or in `interceptMethods`; add a regression test in
`intercept-methods.spec.ts` (current suites test ordering only via
`sortInterceptors`/`invokeChain` unit tests and the processor path).

**C-2 (Must Fix, Wave 1) — Async interceptors silently convert sync methods
to Promise-returning.** `[exec]` Probe: a sync method carrying `@retry`
called through a woven proxy returns `Promise { <pending> }` although its
declared type is `string`. `RetryInterceptor.invoke` and
`CircuitBreakerInterceptor.invoke` are `async`, and the weaver returns
whatever the chain returns — the metadata-only annotation is invisible to
the type system, so callers get no compile-time signal. Inherent to
annotation-driven advice; not fixable at runtime without changing semantics.
**Fix:** document loudly on `@retry`/`@circuitBreaker` JSDoc and in
`docs/guides/15-method-interception.md` ("advised methods may return a
Promise even when declared sync; prefer advising async methods"); pin the
behavior with tests (sync chain stays sync; async interceptor in chain ⇒
Promise).

**C-3 (Should Fix, Wave 1) — Default `retryable` retries `CircuitOpenError`**
`[code]` `retry.ts` `retryAll = () => true`; composed `[retry, circuitBreaker]`
(outer retry), a retry loop re-invokes an open circuit, defeating fail-fast
(backoff may be shorter than `resetMs`). **Fix:** exclude
`CircuitOpenError` from the default predicate, or document the composition
requirement and add a composition test.

**C-4 (Should Fix, Wave 1) — Circuit cells keyed by `entryName.methodName`
string can collide.** `[code]` `circuit-breaker.ts` `key =
${invocation.entryName}.${String(invocation.methodName)}`. Two distinct
classes with the same name (standalone weaving derives the entry name from
the class name) advised by one interceptor instance share one circuit.
**Fix:** key per target type — `Map<Function, Map<string, CircuitCell>>`
via weak-keyed map — or include the target in the key.

**C-5 (Optional, Wave 1) — Invalid retry config silently clamped.**
`[code]` `retry.ts` `Math.max(1, spec.attempts ?? DEFAULT_RETRY_ATTEMPTS)`
silently turns `attempts: 0` into one attempt. Repo convention is fail-loud
boot config; throw on `attempts < 1` instead.

### 1.2 Design (new packages)

**D-1 (Should Fix, Wave 1) — Two `interception(...)` registrations silently
annul all advice.** `[code]`
`ApplicationBuilder.processors()` replaces any previous processors, and the
second processor's `processAfterInitialization` sees an already-woven proxy
(`INTERCEPTED` WeakSet in `weave.ts`), returns it unchanged — the second
interceptor set never applies, with no error. **Fix:** document the
single-processor rule on `processors()`/`interception()`; optionally fail
loudly when a second `interception()` processor is registered.

**D-2 (Nit) — Per-call allocation in the weaver.** `[code]` `weave.ts`
builds `{ ...spec.descriptor, target, args }` per call; the descriptor half
is immutable and could be pre-spread once per method. (Optional, Wave 2.)

**D-3 (FYI) — Probe overlap.** Concurrent calls past `resetMs` can all probe;
first success closes, a concurrent failure re-opens with a fresh window.
Acceptable v1 state machine; documented behavior.

### 1.3 Security (recent committed work)

**S-1 (Should Fix, Wave 2) — `RedisSocketFanout` has no message
authenticity.** `[code]` `ndigo-redis/src/pubsub/socket-fanout.ts`: the
`origin` UUID only excludes self-delivery (`decoded.origin !== this.#origin`);
`#decode` validates shape only. Spoofing is prevented solely by Redis ACLs +
namespace charset isolation. Documented at-most-once pub/sub tradeoff, not a
regression. **Fix:** state the trust boundary (Redis ACLs must restrict
publish/subscribe per namespace) in the package README.

**S-2 (Should Fix, Wave 2) — Session-cap "atomically" wording overstates
`batch()`.** `[code]` `libsql-session-store.ts`: expiry-delete + count-gated
INSERT run in one `batch()`, not a transaction. Safe for single-file SQLite
(write serialization); for a remote libsql server two racing creates can both
observe COUNT < max. **[inference — remote path not exercised]** **Fix:**
soften the JSDoc claim or use a transaction when the client is remote.

**S-3 (Positive) — Injection posture is clean across the wave.**
`[code]` LibSQL stores use `?` placeholders with module-constant table/column
names; Redis keys are hex-encoded (`component()`), values versioned-envelope
wrapped, URLs restricted to `redis:`/`rediss:`, connection errors never log
secrets.

### 1.4 Performance (recent committed work)

- **P-1 (Nit, FYI)** `pubsub/socket-fanout.ts:132-136` — every publish adds a
  no-op subscriber round-trip as a fail-closed readiness probe; doubles
  command traffic per broadcast. Intentional; document if throughput matters.
- **P-2 (Nit, FYI)** `cache/cache.ts:112-116` — `size()` holds every scanned
  key in a `seen` Set (O(n) memory) before the EXISTS check. Acceptable for
  the documented non-snapshot semantics.

### 1.5 Wiring / docs gate

**W-1 (Block, Wave 1) — `pnpm doc:check` fails for both new packages.**
`[code]` `scripts/doc-api.mjs` generates per-package `doc/api/` and
`doc:check` fails on any diff; neither `packages/ndigo-proxy/doc/` nor
`packages/ndigo-resilience/doc/` exists and `doc/README.md` is unregenerated.
**Fix:** run `pnpm doc:api` and commit the generated trees before the
feature lands (READMEs already exist and satisfy the documented prerequisite).

**W-2 (Nit, Wave 2) — Empty `"devDependencies": {}`** in both new manifests;
siblings omit the field when unused.

**W-3 (Verified non-issue) — `@tsmetadata/polyfill` in ndigo-proxy
`dependencies` is correct**: it is a runtime side-effect import
(`src/annotation.ts:15`, Symbol.metadata support for ES2022 targets), not
build-only. Suggestion to move it to devDependencies is rejected; no action.

**W-4 (Verified non-issue) — `fb919eb9` trimmed only blank lines** from
`AGENTS.md` and `.github/copilot-instructions.md`; the graft rule block is
intact in both. Guides index entry for guide 15 is present; AD/plan file
naming matches convention (`AD42_`, no hyphen).

**W-5 (FYI) — Graft graph is stale** against the working tree (both new
packages untracked, changed files not re-indexed). Run `pnpm graft:build`
after the feature commit, per the repo rule.

### 1.6 Hygiene / repo clutter

**H-1 (Should Fix, Wave 2) — Duplicated root benchmarks with a hardcoded
pnpm path.** `[code]` `benchmark-{react,svelte,vue,vanilla}.ts` share ~90%
scaffolding; `package.json` scripts invoke them through
`./node_modules/.pnpm/tsx@4.22.3/...` — a pinned store path that breaks on
any pnpm/layout change. **Fix:** consolidate into one parameterized bench
(e.g. `scripts/bench-dom.mjs --impl react`) and invoke `tsx` from
devDependencies (`pnpm exec tsx ...`).

**H-2 (Should Fix, Wave 2) — Dead vendored `mockServiceWorker.js`.**
`[code]` Root `test/mockServiceWorker.js` (MSW worker, `eslint-disable`
headers) has zero references outside the graft index; ndigo-test's
`browser-mock-client` superseded it. Remove after a reference re-check.

**H-3 (Nit, Wave 2) — Legacy root shim.** `[code]` Root `src/index.ts`
re-exports `@ndigo/core` with commented-out legacy exports; root
`package.json` `exports`/`types` point at the gitignored `lib/`. No consumer
found (`[inference]` — verified via grep; confirm with a build-graph check
before deleting).

**H-4 (Nit, Wave 2) — Error-message drift** between Redis and memory cache
managers (`RedisCacheManager: cache name must be a non-empty string` omits
the offending value the sibling appends); `_codec.ts` `encode`/`decode`
lack per-function JSDoc vs package convention.

### 1.7 Tests

- New suites are green and dense: 12 files / 67 tests pass, including
  real-backend LibSQL and live-redis tests and both demo gates.
- Coverage gaps to close with the Wave 1 fixes: standalone `order`
  (C-1), sync-method + async interceptor (C-2), retry × circuit breaker
  composition (C-3), collision of same-named classes (C-4).

## 2. Verified good (no action)

- Container integration honors instance replacement: factory caches the
  woven proxy (`abstract-factory.ts:472-484,640-642`), singleton identity
  preserved (`processor.spec.ts`).
- WeakSet double-wrap guard, target-bound receivers (private fields),
  descriptor freezing, fail-loud annotation-name validation, `#private`
  preservation through the proxy — all exercised by tests.
- AD-42/AD-43, plans, and guide 15 form a complete decision trail; the
  demo-gate convention (ndigo-api audit, ndigo-service resilience) matches
  cached/scheduled precedent.
- tsconfig / nx / vitest / workspace wiring of both packages is
  byte-for-byte consistent with siblings.

## 3. Waves

| Wave                       | Content                                                                                                                                                            | Items                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| 1 — Pre-commit correctness | order fix + test, async-return docs/tests, retryable default, circuit keying, fail-loud attempts, `processors()` single-registration docs, `pnpm doc:api` + commit | C-1 C-2 C-3 C-4 C-5 D-1 W-1         |
| 2 — Polish sweep           | benchmarks consolidation, dead-file removal, README security note, session-store doc wording, allocation/error-message/JSDoc nits, manifest cleanup                | H-1 H-2 H-3 H-4 S-1 S-2 P-3 W-2 D-2 |
| 3 — Gate verification      | full-repo gates: tests, typecheck, `pnpm doc:check`, oxlint, `pnpm graft:build`; commit remediation per repo convention                                            | —                                   |

## 4. Verification

- C-1: new `intercept-methods.spec.ts` case (orders 10/-5 registered
  reversed ⇒ execution in sorted order) + probe re-run.
- C-2: tests pinning sync-chain sync result and Promise for async
  interceptor chains; guide 15 words "advised methods may return a Promise".
- W-1: `pnpm doc:check` exits 0 with a clean tree after `pnpm doc:api`.
- Wave 3: `pnpm test`, typecheck, `pnpm doc:check`, `pnpm graft:build` all
  green at head.
