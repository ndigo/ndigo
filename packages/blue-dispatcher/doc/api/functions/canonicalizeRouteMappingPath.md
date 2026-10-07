[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / canonicalizeRouteMappingPath

# Function: canonicalizeRouteMappingPath()

> **canonicalizeRouteMappingPath**(`path`): `string`

Canonicalizes a route pattern to the radix node it maps to.

Distinct spellings that the tree normalizes to one node MUST share one
candidate bucket, or the later registration silently shadows the earlier:
empty segments are dropped (`/foo` ≡ `/foo/` ≡ `//foo`) and `{name}` param
segments are folded to `:name` (`/a/:id` ≡ `/a/{id}`). Param labels remain
distinct (`:id` ≠ `:userId`).

Greedy segments are folded uniformly to `*:<label>`: `{*name}` → `*:name`,
while the non-capturing spellings `{*}` and `**` (both zero-length labels in
the radix tree) collapse to `*:`. A bare `*` stays the single-segment
wildcard (distinct from every greedy label).

This is the single source of truth for route-pattern canonicalization: both
the radix mapping here and the `no-duplicate-mapping-path` lint rule consume
it, so they cannot drift.

## Parameters

### path

`string`

The raw route pattern.

## Returns

`string`

The canonical key for the pattern's radix node.
