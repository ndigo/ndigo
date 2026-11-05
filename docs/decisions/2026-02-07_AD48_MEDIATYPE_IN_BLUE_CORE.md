# AD-48: `MediaType` lives in `@blue/core`

**Date:** 2026-02-07
**Status:** Accepted — implemented; enhanced 2026-02-08

## Context

The planned HTTP transform pipeline needs a `mediaType` in its transform
context. That forced the question of where `MediaType` (and `QualityFactor`)
belong: `@blue/core`, `@blue/http`, a new `@blue/media-type` package, or plain
strings. `MediaType` is used by HTTP packages but also by non-HTTP consumers
(`@blue/logger` serialization layouts, `@blue/service` base class), so its
location determines the dependency graph.

## Evidence

- `docs/plans/2026-02-07_MEDIATYPE_LOCATION_ANALYSIS.md` (Completed & Archived)
  records the decision: keep `MediaType` and `quality-factor.ts` in `@blue/core`.
  Rationale: moving to `@blue/http` would force non-HTTP packages
  (`@blue/logger`, `@blue/service`) to depend on an HTTP package; RFC 9110
  defines media types as string grammar, so a rich class is an extension, but
  the class's registry/wildcards/suffix/quality-factor API serves content
  negotiation and type safety (principles-inspired) beyond HTTP.
- `docs/plans/2026-02-08_MEDIATYPE_ENHANCEMENT_SUMMARY.md` (COMPLETE) adds
  `baseType`, `getDefaultCharset()`, `toContentType()`, `parseMediaType()`, and
  fixes `withCharset()` and `MediaType.for()`; 8 new tests (82/82 core passing).
- **Verified current (2026-10-04):** all three files exist in
  `packages/blue-core/src/` — `media-type.ts` (the `MediaType` class),
  `media-types.ts` (predefined type constants), `quality-factor.ts`.
  Born with the initial commit `7a9db875` (2026-01-23) and touched by
  `31291371`/`c3de42c7` (2026-01). `@blue/http`'s transformers consume
  `MediaType` via `packages/blue-http/src/transformers/http-transformer.ts`
  (`mediaType: MediaType | null | undefined`), confirming core-sourced use.

## Decision

- D-1 `MediaType` and `QualityFactor` stay in `@blue/core` as foundational
  data-format identifiers.
- D-2 Rejected: move to `@blue/http` (bad dependency graph), extract a
  `@blue/media-type` package (no consumer pressure), or eliminate in favor of
  plain strings (loses registry/wildcard/quality-factor capabilities).

## Consequences

- `@blue/core` exposes `media-type.ts`, `media-types.ts`, `quality-factor.ts`;
  content negotiation and the transform pipeline consume `MediaType` without
  non-HTTP packages depending on `@blue/http`.
- Enhanced surface (`baseType`, `toContentType`, `parseMediaType`) ships and
  unblocks the HTTP transform pipeline (AD-49).

## References

- Plans: `docs/plans/2026-02-07_MEDIATYPE_LOCATION_ANALYSIS.md`,
  `docs/plans/2026-02-08_MEDIATYPE_ENHANCEMENT_SUMMARY.md`
- Implementation: `packages/blue-core/src/media-type.ts`,
  `packages/blue-core/src/media-types.ts`, `packages/blue-core/src/quality-factor.ts`
- Related: [AD-49](2026-02-07_AD49_HTTP_TRANSFORM_PIPELINE.md) (consumer of
  `MediaType`)

## Revisit Trigger

Revisit if a second non-core consumer drives the cost of `@blue/core` carrying
HTTP-ish concepts, or if the media-type API needs to grow beyond the
Principles-inspired surface.
