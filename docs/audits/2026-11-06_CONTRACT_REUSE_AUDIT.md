# Contract-reuse audit — the `@ndigo/core`/`@ndigo/factory` contract vocabulary (2026-11-06)

**Scope:** `packages/*`, `apps/*` · **Method:** exhaustively-verified scans
(comparator idioms, `typeof`-chain shape guards, `close`/`destroy`/`init`
members vs. `implements` declarations, `toJSON` vs. `Serializable`,
error-lineage lineage) surfaced through the graft call graph, corroborated by
direct reads of every candidate site.

## The vocabulary and its adoption state

| Contract family                                                                                                                   | Exports           | Adoption                                                                         |
| :-------------------------------------------------------------------------------------------------------------------------------- | :---------------- | :------------------------------------------------------------------------------- |
| Equality (`Equatable`, `equates`, `likeEquatable`)                                                                                | core              | ✅ uniform — every `equals()`-carrying class declares it                         |
| Ordering (`Comparable`/`Comparator`, `stringComparator`, `numberComparator`, `compareBy`, `chainComparisons`, `invertComparison`) | core              | ✅ inside core/http/content · ⚠️ 13 hand-rolled sites elsewhere                  |
| Enumeration (`Enumerable`)                                                                                                        | core              | ⚠️ thin — `HealthRegistry`, `PropertySources`, context `propertySource()`        |
| Serialization (`Serializable`, JSON types)                                                                                        | core              | ✅ uniform except `RouteMatchResult`                                             |
| Matching (`Matchable`/`ResultMatcher`/`PatternMatcher`)                                                                           | core              | ✅ good adoption; no `likeMatchable` guard existed                               |
| Parsing/Conversion/Formatting (`Parser`, `Stringifier`, `ConversionService`, `FormattingService`)                                 | core              | ✅ healthy — wired through the context                                           |
| Lifecycle (`Initializable`, `Closeable`/`AsyncCloseable`, `Destroyable`/`AsyncDestroyable`, `SmartLifecycle`)                     | factory           | ⚠️ 7 declaring classes; the rest duck-typed                                      |
| Shape guards (`like({...})`, `like*` family)                                                                                      | util/core/factory | ⚠️ standard one-liners in core/factory · ⚠️ 7 bespoke `typeof` ladders elsewhere |

## Findings → outcome

| #   | Finding                                                                                                                                              | Outcome / Where recorded                                                                                                                                                                                                                                    |
| :-- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ~13 inline `<`/`>`/`-` comparator lambdas duplicated the comparator primitives                                                                       | Converted as #163 ([PR #168] — closed-guards phase of the same campaign). `localeCompare`/default `.sort()` sites kept (locale-aware / JS default by design); `orm` `compareValues` (mixed-type, null-aware) kept; demo apps skipped (no `@ndigo/core` dep) |
| 2   | 7 bespoke multi-line `typeof` shape guards + 4 inline structural checks                                                                              | Converted + `likeMatchable` added to core (#164). `_isDestroyableView` deliberately uses `like({ destroy: Function })` — views are not lifecycle entries and carry no `destroyed` flag                                                                      |
| 3   | Infra classes with `close()`/`destroy()` not declaring the lifecycle contracts; driver interfaces carried `close:` members without lifecycle lineage | Contracts extended + classes declared (#165). Exclusions documented: `HTTPServer` (self-stops via `SmartLifecycle`), `SocketSession.close(code, reason)` (parameters), `FixedWindowRateLimiter` (no resources)                                              |
| 4   | Closed-state guards throwing plain `Error`; 8 domain errors extending plain `Error`                                                                  | Normalized per [AD-94](../decisions/2026-11-06_AD94_ERROR_LINEAGE.md) (#166); `UnknownPasswordSchemeError` intentionally left (dependency-free `@ndigo/auth-core`)                                                                                          |
| 5   | `RouteMatchResult` had `toJSON()` without declaring `Serializable`                                                                                   | Declared (this PR)                                                                                                                                                                                                                                          |

## Deliberately not pursued

- `Enumerable` on `Map`-backed containers (`MultiValueMap`, `LRUCache`) — they
  are `Iterable`; the contract targets named-entry registries.
- Wiring the unused `likeComparable`/`likeComparator` guards into product code
  — the sort call sites take functions, not comparator objects; forcing them
  buys nothing.
- A `StringComparator.compareLocale` for the `localeCompare` sites — three
  small call sites, no shared rationale yet (Rule of Three).
- `Logger`/`EventEmitter` shape mirrors in platform packages that do not
  depend on `@ndigo/factory` — the duck-typing boundary there is documented at
  each site (`HashRouter` is the reference example).

## Verification commands

Re-run the survey's sweeps after future changes:

```sh
rg -n "\.sort\(\(.*\?" packages/*/src apps/*/src            # inline comparators
rg -n "typeof .+=== ['\"]function['\"]" packages/*/src apps/*/src  # shape-guard ladders (expect callables only)
rg -n "throw new Error\(" packages/*/src                    # error lineage (expect data/config-only)
```

[PR #168]: https://github.com/ndigo/ndigo/pull/168
