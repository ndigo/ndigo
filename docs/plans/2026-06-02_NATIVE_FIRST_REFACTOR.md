# Spec: Native-First Refactor — Drop Ramda & Arcsecond

**Date:** 2026-06-02  
**Status:** Pending implementation  
**Motivation:** Benchmark results show Ramda and Arcsecond carry significant runtime costs (3×–210× slower than native equivalents on hot paths). Phase I of the glob pipeline work already replaced the four most expensive Arcsecond parsers. This spec completes the job: dissolve `@ndigo/parser` into `@ndigo/core`, rewrite each Ramda caller directly in native TypeScript, delete the transducer infrastructure nobody uses, and remove the Persona Cookie legacy code.

---

## 1. Objective

1. **Dissolve `@ndigo/parser` into `@ndigo/core`** — after Arcsecond is gone the package's only rationale (Library Integration Layer for Arcsecond) evaporates. The remaining parsers are all consumed exclusively by `@ndigo/core`/`@ndigo/context`.
2. **Drop Arcsecond** — rewrite the one remaining consumer (`matrixExpression`) and remove the package dependency.
3. **Drop Ramda** — rewrite each Ramda caller directly in native TypeScript; let the Ramda-backed sub-modules evaporate. Do **not** replace them with equivalent utility modules — go straight to native at the call site.
4. **Slim `@ndigo/util`** — keep `types`, `string`, `date`, `math`; delete `function`, `logic`, `list`, `object`, `relation` once callers are rewritten.
5. **Delete unused transducer infrastructure** — `TransducerTransformer` in `@ndigo/http` and the transducer protocol types/classes in `@ndigo/core` have no consumers outside their own test files.
6. **Remove Persona Cookie legacy code** — `to-piped-string.ts` and `from-piped-string.ts` are explicitly documented as legacy and are not exported.

### Out of Scope (for now)

- `@ndigo/util/date` (wraps `date-fns`) — not a hot path.
- `@ndigo/util/math` (wraps `seedrandom`) — not a hot path.
- `@ndigo/model` (wraps `objectmodel`) — separate concern.

---

## 2. Current State — What Is Actually Used

### 2a. `@ndigo/parser` consumers outside the package

| Consumer                                       | Imported items                                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `@ndigo/core/src/path-matcher.ts`              | `urlGlob`                                                                                         |
| `@ndigo/core/src/wildcard-exp.ts`              | `wildcardExpression`                                                                              |
| `@ndigo/core/src/data-binder.ts`               | `keypathExpression`                                                                               |
| `@ndigo/context/src/property-resolver.ts`      | `keypathExpression`                                                                               |
| `@ndigo/http/src/parsers/matrix-expression.ts` | `char, choice, possibly, regex, sepBy, sequenceOf, takeRight` (**raw Arcsecond — last consumer**) |
| `@ndigo/platform-web/src/cookies.ts`           | `Parser` type only                                                                                |
| Test files                                     | `Ok` type only                                                                                    |

`fsGlob` is exported but has **zero external consumers** — delete it.

### 2b. `@ndigo/util` sub-modules — what survives

| Sub-path               | Decision                                                             |
| ---------------------- | -------------------------------------------------------------------- |
| `@ndigo/util/types`    | **Keep** — is\*, like\* predicates; already custom, no Ramda         |
| `@ndigo/util/string`   | **Keep** — toPascal, encodeHTML, trailingSplit, etc.; already custom |
| `@ndigo/util/date`     | **Keep** — date-fns backed; out of scope                             |
| `@ndigo/util/math`     | **Keep** — seedrandom backed; out of scope                           |
| `@ndigo/util/function` | **Delete** after callers rewritten                                   |
| `@ndigo/util/logic`    | **Delete** after callers rewritten                                   |
| `@ndigo/util/list`     | **Delete** after callers rewritten                                   |
| `@ndigo/util/object`   | **Delete** after callers rewritten                                   |
| `@ndigo/util/relation` | **Delete** after callers rewritten                                   |

### 2c. Transducer inventory

| Item                                                                                                                    | Location                                                 | External consumers                                      |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| `CompletingTransformer`, `Transformer`, `Reduced`, `XDelegatingTransformer`, `likeReduced`, `likeTransformer`, `reduce` | `@ndigo/core/src/transducer.ts`                          | **None** (own tests only)                               |
| `TransducerTransformer`                                                                                                 | `@ndigo/http/src/transformers/transducer-transformer.ts` | **None** (own tests only)                               |
| `transduce`, `into`                                                                                                     | `@ndigo/util/list`                                       | Only `TransducerTransformer` — deleted in this refactor |

---

## 3. Dead Code / Files to Delete

### `@ndigo/parser` (before dissolution)

| File                                                            | Reason                                   |
| --------------------------------------------------------------- | ---------------------------------------- |
| `src/to-piped-string.ts`                                        | Persona Cookie legacy; not in `index.ts` |
| `src/from-piped-string.ts`                                      | Persona Cookie legacy; not in `index.ts` |
| `src/matrix-string.ts`                                          | Not in `index.ts`; dead code             |
| `src/to-matrix-string.ts`                                       | Not in `index.ts`; dead code             |
| `src/many-n.ts`                                                 | Verify unused, then delete               |
| `src/sep-by-n.ts`                                               | Verify unused, then delete               |
| `src/fs-glob.ts` + `src/_glob-chars.ts` (FS_LITERAL_CHARS only) | `fsGlob` has no external consumers       |

### `@ndigo/core`

| File                | Reason                                          |
| ------------------- | ----------------------------------------------- |
| `src/transducer.ts` | No external consumers; all types/classes unused |

### `@ndigo/http`

| File                                         | Reason                                 |
| -------------------------------------------- | -------------------------------------- |
| `src/transformers/transducer-transformer.ts` | No external consumers; test-only usage |

---

## 4. Implementation Phases

### Phase 0 — Delete Dead/Legacy Code

**Goal:** Remove files with no consumers. Zero risk.

- [ ] Delete `packages/ndigo-parser/src/to-piped-string.ts` + `from-piped-string.ts`
- [ ] Delete `packages/ndigo-parser/src/matrix-string.ts` + `to-matrix-string.ts`
- [ ] Delete `packages/ndigo-parser/src/many-n.ts` + `sep-by-n.ts` (after verifying unused)
- [ ] Delete `packages/ndigo-http/src/transformers/transducer-transformer.ts` + its test
- [ ] Delete `packages/ndigo-core/src/transducer.ts` + its test
- [ ] Remove `transducer-transformer` from `packages/ndigo-http/src/transformers/index.ts`
- [ ] Remove `export * from './transducer'` from `packages/ndigo-core/src/index.ts`
- [ ] **Gate:** `pnpm build && pnpm test`

### Phase 1 — Rewrite `matrixExpression` (Last Arcsecond Consumer)

**Goal:** Break the last import of raw Arcsecond primitives.

**File:** `packages/ndigo-http/src/parsers/matrix-expression.ts`

The hand-rolled approach mirrors `cookieExpression` and `queryExpression`. The parser handles:

- `;`-separated `key=value` pairs, leading `;` stripped
- `+` → space, percent-decode keys and values
- Empty value → `null`, comma-separated value → array, key-only → `null` value

- [ ] Rewrite `matrix-expression.ts` as hand-rolled; remove `@ndigo/parser` import entirely
- [ ] All existing `matrix-expression.spec.ts` tests must pass unchanged
- [ ] **Gate:** `pnpm vitest run packages/ndigo-http`

### Phase 2 — Dissolve `@ndigo/parser` into `@ndigo/core`

**Goal:** Delete `@ndigo/parser` as a package; move its remaining files into `@ndigo/core`.

Files to move into `packages/ndigo-core/src/`:

- `url-glob.ts` + `ext-glob.ts` + `posix-class.ts`
- `_expand-brace.ts` + `_expand-sequence.ts` + `_expansion-limit.ts` + `_glob-chars.ts` (URL_LITERAL_CHARS only)
- `brace-expression.ts` + `sequence-expression.ts` + `no-op.ts`
- `keypath-expression.ts` + `wildcard-expression.ts`
- `_util.ts` → merge needed contents into `@ndigo/core` internal utilities or inline

Steps:

- [ ] Move parser source files into `packages/ndigo-core/src/`
- [ ] Update `packages/ndigo-core/src/index.ts` to export `urlGlob`, `keypathExpression`, `wildcardExpression` (replacing `@ndigo/parser` exports)
- [ ] Update all import paths in `@ndigo/core` src files that referred to `@ndigo/parser`
- [ ] Update `packages/ndigo-context/src/property-resolver.ts` — import `keypathExpression` from `@ndigo/core`
- [ ] Update `packages/ndigo-platform-web/src/cookies.ts` — remove `Parser` type; replace with local inline type
- [ ] Update test files importing `Ok` type — inline or remove
- [ ] Delete `packages/ndigo-parser/` directory entirely
- [ ] Remove `@ndigo/parser` from `peerDependencies` / `devDependencies` in all `package.json` files
- [ ] Remove `@ndigo/parser` entry from `pnpm-workspace.yaml` / `nx.json` if present
- [ ] **Gate:** `pnpm build && pnpm test`

### Phase 3 — Rewrite Ramda Callers in Native TypeScript

**Goal:** Eliminate every import from `@ndigo/util/function`, `/logic`, `/list`, `/object`, `/relation` by rewriting each call site in native TypeScript. Work package by package.

**Approach:** For each source file that imports from a Ramda-backed sub-module:

- Replace `pipe(f, g, h)(x)` with `h(g(f(x)))` or a local arrow chain
- Replace `map(fn)(arr)` with `arr.map(fn)`
- Replace `filter(pred)(arr)` with `arr.filter(pred)`
- Replace `reduce(fn, init)(arr)` with `arr.reduce(fn, init)`
- Replace `cond([[pred, fn], ...])` with `if/else` or `switch`
- Replace `propSatisfies(pred, key)(obj)` with `pred(obj[key])`
- Replace `forEachObjIndexed(fn)(obj)` with `Object.entries(obj).forEach(([k, v]) => fn(v, k))`
- Replace `mergeRight(a, b)` with `{ ...a, ...b }`
- Replace `path(['a', 'b'], obj)` with `obj?.a?.b`
- Replace `assocPath(['a', 'b'], val, obj)` with structured spread or inline helper
- etc.

**Order (most to fewest callers, so failures surface early):**

#### 3a. `@ndigo/util` internal — remove Ramda from `_natural-sort.ts` and any remaining internal helpers

#### 3b. `@ndigo/core` source files

#### 3c. `@ndigo/context` source files

#### 3d. `@ndigo/http` source files

#### 3e. `@ndigo/dispatcher` source files

#### 3f. `@ndigo/router` source files

#### 3g. `@ndigo/domain` source files

#### 3h. `@ndigo/validate` source files

#### 3i. `@ndigo/view`, `@ndigo/factory`, `@ndigo/model`, `@ndigo/service`, `@ndigo/platform-*` source files

**Gate after each package:** `pnpm vitest run packages/<package>`  
**Final gate:** `pnpm build && pnpm test && pnpm lint`

### Phase 4 — Delete Ramda-Backed Sub-modules and Drop Dependency

**Goal:** Remove the now-unused sub-modules and the Ramda package itself.

- [ ] Delete `packages/ndigo-util/src/function/`
- [ ] Delete `packages/ndigo-util/src/logic/`
- [ ] Delete `packages/ndigo-util/src/list/`
- [ ] Delete `packages/ndigo-util/src/object/`
- [ ] Delete `packages/ndigo-util/src/relation/`
- [ ] Remove these sub-path exports from `packages/ndigo-util/package.json` `exports`
- [ ] Remove `ramda` from `packages/ndigo-util/package.json` dependencies
- [ ] Remove `ramda.d.ts` and `ramda-extensions.d.ts`
- [ ] Update `packages/ndigo-util/src/index.ts` to remove the deleted sub-module re-exports
- [ ] Update `@ndigo/eslint-plugin` constants — remove Ramda from the integration-layer encapsulation list (it no longer needs encapsulating)
- [ ] **Gate:** `pnpm build && pnpm test && pnpm lint`

---

## 5. Testing Strategy

- Every phase ends with `pnpm build && pnpm test` — no exceptions.
- No new tests needed unless a rewrite introduces new edge-case logic not already covered.
- After Phase 3 completes, run `pnpm test:bench packages/ndigo-util/bench/` to confirm no regressions.

---

## 6. Risks & Mitigations

| Risk                                                             | Mitigation                                                                                                 |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `assocPath` deep-clone semantics vs spread                       | Write a simple recursive helper inline where needed; test the specific callers                             |
| `constructN` / `__` usage in `@ndigo/domain`                     | Replace with `(...args) => new Cls(...args)` or type-safe factory pattern                                  |
| `equals` deep-equality edge cases (NaN, Date)                    | Audit all `equals` call sites; most compare primitives and can use `===`                                   |
| `@ndigo/parser/_util.ts` may have non-trivial logic              | Read before dissolving; inline what's needed into `@ndigo/core`                                            |
| Circular deps after moving glob pipeline to `@ndigo/core`        | `@ndigo/core` has no dependency on `@ndigo/util/list` (now); verify `@ndigo/util/types` dependency remains |
| ESLint plugin references `@ndigo/parser` as an integration layer | Update `_constants.ts` in `@ndigo/eslint-plugin` after dissolution                                         |

---

## 7. Success Criteria

- [ ] `arcsecond` does not appear in any `package.json` dependencies
- [ ] `ramda` does not appear in any `package.json` dependencies
- [ ] `packages/ndigo-parser/` directory does not exist
- [ ] `packages/ndigo-core/src/transducer.ts` does not exist
- [ ] `packages/ndigo-http/src/transformers/transducer-transformer.ts` does not exist
- [ ] `pnpm build` passes (clean, no Nx cache)
- [ ] `pnpm test` passes (all packages)
- [ ] `pnpm lint` passes clean

---

## 8. Boundaries

- **Always:** Run `pnpm build && pnpm test` before marking any phase complete.
- **Ask first:** Any change to `@ndigo/util/date` or `@ndigo/util/math` (out of scope).
- **Never:** Remove an export that is still imported by another package without rewriting the importer first.
