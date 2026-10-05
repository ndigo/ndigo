# AD-49: HTTP request/response body transform pipeline

**Date:** 2026-02-07
**Status:** Accepted — implemented 2026-03-08 (`cbc99fb4`)

## Context

`@blue/http` had no mechanism to transform request/response bodies beyond its
interceptor chain (JSON sanitization, validation, parsing all had to be manual
or ad hoc). The design follows Spring's `HttpMessageConverter`: composable,
type-safe body transformers selected by a transform context, wired through the
existing interceptor system.

## Evidence

- `docs/plans/2026-02-07_HTTP_TRANSFORM_PIPELINE.md` defines `TransformContext`,
  `HTTPTransformer<TInput, TOutput>`, five specialized transformers, and a
  `@blue/http/transformers` subpath export. A blocker (interceptor return types)
  was resolved 2026-03-08 by upgrading `ResponseAwareHTTPInterceptor` to
  `Promise<Response | void>`.
- **Verified current (2026-10-04):**
  `packages/blue-http/src/transformers/http-transformer.ts` exports
  `TransformContext` and `HTTPTransformer<TInput = unknown, TOutput = unknown>`
  plus `Transform`. `packages/blue-http/src/transformers/index.ts` re-exports
  `http-transformer`, `json-transformer`, `composition-transformer`,
  `form-data-transformer`, `url-search-params-transformer`.
- The `TransducerTransformer` from the plan does NOT exist in the tree today —
  only composition/json/form-data/url-search-params were shipped; the transducer
  variant was dropped in implementation (not recorded in the plan).
- Package born `cbc99fb4` (2026-03-07) "feat(http): add request/response
  transform pipeline and specialized transformers"; subpath export `./transformers`
  is declared in `packages/blue-http/package.json` `exports`.

## Decision

- D-1 Continuous-transform contract `HTTPTransformer<TInput, TOutput>` with
  `canTransform(body, context): boolean` and
  `transform(body, context): TOutput | Promise<TOutput>`; `Transform` covers
  plain functions. (Spring `HttpMessageConverter` inspiration.)
- D-2 `TransformContext` carries `url`, `headers`, `mediaType`, `direction`
  (`'request' | 'response'`), `metadata` for conditional transforms.
- D-3 Specialized transformers: JSON, composition (via `pipe()` left-to-right),
  FormData, URLSearchParams. No default transforms — explicit configuration
  only.
- D-4 Subpath export `@blue/http/transformers` for the specialized set.
- Resolved in implementation: the generics question from
  `docs/plans/2026-02-07_HTTP_TRANSFORMER_GENERICS.md` (whether `TOutput`
  should default to `TInput`) is answered NO — the deployed signature is
  `HTTPTransformer<TInput = unknown, TOutput = unknown>` with both generics
  explicit and `unknown` as their default. The plan itself never finalized;
  verified from current code.

## Consequences

- `@blue/http` gains a composable, type-safe body-transform pipeline with
  subpath exports; existing interceptors remain backward compatible
  (`Promise<Response | void>`).
- `TransformContext.mediaType` is `MediaType | null | undefined`
  (core-sourced per AD-48).

## References

- Plans: `docs/plans/2026-02-07_HTTP_TRANSFORM_PIPELINE.md`,
  `docs/plans/2026-02-07_HTTP_TRANSFORMER_GENERICS.md`
- Implementation: `packages/blue-http/src/transformers/` (http, json,
  composition, form-data, url-search-params); commit `cbc99fb4` (2026-03-07);
  `packages/blue-http/package.json` `./transformers` export
- Related: [AD-48](2026-02-07_AD48_MEDIATYPE_IN_BLUE_CORE.md) (`MediaType` in
  context), [AD-51](2026-02-11_AD51_SUBPATH_EXPORTS.md) (subpath export pattern)

## Revisit Trigger

Revisit if a transducer-based (early-terminating, single-pass) transformer is
needed for large collections, or if the response-interceptor
`Promise<Response | void>` upgrade should default error handling to match the
request path.
