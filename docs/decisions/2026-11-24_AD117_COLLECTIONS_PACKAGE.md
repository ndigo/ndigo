# AD-117: The collections package — standalone containers move, kernel-coupled containers stay

**Date:** 2026-11-24
**Status:** Accepted
**See also:** AD-113 (public surface policy), AD-91 D4 (pre-1.0 hard cut), AD-115 (boundary relationships)
**Refs:** #749 (this decision)

---

## Context

`@ndigo/core` mixed kernel contracts (comparison, equality, serialization,
errors) with ten container modules. Only a handful of packages imported the
containers; none of them are part of the kernel's own type system — except
three. The extraction was scoped as all ten, but the build exposed the
dependency direction:

- `MutablePropertyValues extends RingBuffer<PropertyValue>`
  (`packages/ndigo-core/src/property-value.ts`).
- `MediaType` keeps eviction order in two `Deque<string>` instances
  (`packages/ndigo-core/src/media-type.ts`).
- `URLGlobPathMatcher` caches compiled regexes in a
  `BoundedCache<string, RegExp>` (`packages/ndigo-core/src/path-matcher.ts`).

`@ndigo/collections` depends on `@ndigo/core` for `Serializable`, `Equatable`,
`createNull`, and `naturalComparison`. Its derived layer rank is 2, one above
core. Moving the three containers would therefore make core import a rank-2
package: an upward-layer violation (`no-upward-layer-imports`) and a package
cycle.

## Decision

### D-1 — Seven containers move

`@ndigo/collections` owns:

| Module             | Exports                                                                |
| ------------------ | ---------------------------------------------------------------------- |
| `bloom-filter`     | `BloomFilter`, `BloomFilterJSON`                                       |
| `count-min-sketch` | `CountMinSketch`, `CountMinSketchJSON`                                 |
| `heap`             | `Heap`, `PriorityQueue`                                                |
| `multi-value-map`  | `MultiValueMap`                                                        |
| `radix-tree`       | `RadixTree`, `RadixMatch`                                              |
| `tree-node`        | `TreeNode`, `ChildNode`, `ParentNode`, `direct`, `escalate`, `indexOf` |
| `trie`             | `Trie`                                                                 |

The ten specs for these modules move with them.

### D-2 — Three stay in core

`RingBuffer`, `Deque`, and `BoundedCache` remain public core exports because
core's own public types build on them. They are kernel infrastructure, not
standalone containers. Their specs stay in core.

### D-3 — Hard cut for the seven

The seven exports are removed from `@ndigo/core`; there is no compatibility
re-export (AD-91 D4). The import sites update to
`@ndigo/collections`: dispatcher (metadata registry, radix mapping),
platform-node (multipart), jobs (outbox heap), view (content negotiation), and
the context tree-node types. `@ndigo/view` keeps its `BoundedCache` re-export
because that container did not move.

### D-4 — Follow-up: what moving the remaining three would require

A later change can move all three only after core stops using them:

1. `MediaType` — replace the two `Deque` eviction orders with insertion-ordered
   `Map`s (or a small internal LRU helper), then move `Deque`.
2. `URLGlobPathMatcher` — replace the `BoundedCache` with an internal `Map`
   plus capacity eviction, then move `BoundedCache`.
3. `MutablePropertyValues` — rewrite the class without extending `RingBuffer`
   (it relies on the ring's protected head/tail/capacity internals), then move
   `RingBuffer`. This is the riskiest step because the class is public.

Only then can `@ndigo/collections` cover all ten without inverting the
dependency. That investigation is tracked as a follow-up, not part of #749.

## Consequences

- `@ndigo/collections` is a rank-2 package with 16 exports across seven
  modules.
- `@ndigo/core` no longer exports the standalone containers; its README points
  at collections, and its module doc names the three it keeps.
- The layer map, Vitest aliases, spec tsconfig, package docs index, and
  `doc:api` all register the new package.
- The remaining three are documented as a deliberate boundary, not an
  oversight.
