# AD-28: Static files — ETag/conditional GET, Range, precompressed variants, SPA fallback, directory control

**Date:** 2026-09-24
**Status:** Accepted — decision recorded; implementation landed (see
[plan](../plans/2026-09-24_STATIC_FILES.md)).

## Background

Static serving existed but was transport-poor: `StaticResourceResolver`
(packages/blue-platform-node/src/static-resource-resolver.ts) did the hard
security work — canonical-base containment, MIME allowlist, whole-file
`Buffer` reads — and `StaticController` served `/static/{file}` with a fixed
MIME/nosniff header pair. The gap analysis (§3 "Static files") listed six
missing features: Range requests, ETag/conditional GET, cache headers,
gzip/brotli, SPA history-mode fallback, directory-listing control. Two
structural defects compounded the work: the radix router had **no greedy
route segment** (`**` classified as a literal static segment), so nested
static paths were unmatchable and a SPA catch-all was inexpressible; and
`ResponseEntityView` converts every `4xx` to a problem+json document,
dropping the mandatory `Content-Range` header a `416` must carry.

## Decisions

### D-1 — Greedy route segments: `{*name}` captures the remainder; `**` matches without capture

The radix matcher gains a greedy node kind matching the rest of the path
(zero or more segments). Per-segment probe order stays additive: static →
param → single wildcard `*` → greedy, with the deepest greedy passed on the
way down remembered as a backtracking fallback (a more specific branch may
fail deeper). `{*name}` captures the raw remainder (no leading slash,
trailing slashes stripped, no percent-decoding — `%2F` must never become
`/`); `**` matches without capturing. Greedy must be the last segment of its
pattern (config error otherwise). `PathPatternComparator` ranks fewer greedy
segments before length, since a catch-all is strictly less specific than any
non-greedy pattern and the `{*name}` spelling is always one character longer.

### D-2 — Strong ETag + conditional GET (RFC 7232)

`ETag: "<hex(size)>-<hex(mtimeMs)>"` computed from the `stat` already taken;
`Last-Modified` (RFC 1123). `If-None-Match` (list, `*`, weak `W/` prefixes)
takes precedence over `If-Modified-Since` (second-granularity comparison).
Match → `304` echoing the validators (plus `Cache-Control`/`Vary`), no body.
ETags are per-variant — the encoding suffix disambiguates so a cache can
never pair gzip bytes with the original's validator. Generated directory
listings carry no validators (not cacheable).

### D-3 — Precompressed variants only

`<file>.br` / `<file>.gz` next to the original, matched by `Accept-Encoding`
(q-values; ties prefer `br`; `*` acceptable but never beats an explicit
codec), served with `Content-Encoding` + `Vary: Accept-Encoding`. `Vary` is
sent whenever the type is compressible (text-ish allowlist), even when the
original is served — caches must not give gzip clients a non-gzip copy. No
on-the-fly compression: precompressed files are zero-CPU and keep the
resolver streaming-free. Image/font/binary types never negotiate.

### D-4 — Single-range `bytes=` (RFC 7233 subset)

`Accept-Ranges: bytes` on file responses. `bytes=a-b`, `bytes=a-`, `bytes=-n`
→ `206` + `Content-Range`/`Content-Length`/sliced bytes. Unsatisfiable →
`416` + `Content-Range: bytes */N`. Malformed or multi-range → ignored,
plain `200` (RFC-legal). `If-Range` is not in v1 (documented).

### D-5 — `StaticResourceHandler`: one HTTP decision flow, direct writes

A node-platform class owns the per-request semantics — resolve (variant
negotiation) → conditional → range → cache headers → body — writing directly
to the `ServerResponse`, because `304`/`206`/`416` status/header/no-body
combinations cannot flow through `ResponseEntityView`. Errors keep the
existing problem+json contract (`writeProblem`); the handler is mounted by
`StaticController` and `StaticFileView` (which previously duplicated the
error writing).

### D-6 — Handler options with safe defaults

`StaticHandlerOptions { cacheControl?, indexNames?, listDirectories?,
spaFallback? }`. Defaults: `cacheControl: 'public, max-age=3600'` (`null`
omits the header), `indexNames: ['index.html']`, listing and SPA fallback
off — every pre-existing behavior is preserved, and the resolver's original
spec passes unmodified.

### D-7 — Directory modes

Directory requests resolve through `indexNames` (each re-verified by
recursive containment) before an opt-in generated HTML listing
(`listDirectories: true`): names HTML-escaped, hrefs relative, parent entry
off the root only. Listing default off.

### D-8 — HEAD falls back to GET; `routeValue()` binds the Route

`HTTPMethodCondition` matches a `HEAD` request against `GET`-constrained
mappings (RFC 9110 §9.3.2 — HEAD is GET without the body). Node's
`ServerResponse` suppresses the body natively while keeping headers, so
conditional-GET revalidation probes (`curl -I`, caches) work.

The controller needed dispatch context, which forced a decision about the
`ROUTE` type's `routeValue()` factory. Its old signature
(`routeValue('route')`) was never truthful: the `*Value(name)` contract
extracts a value _named_ `name` from a source, and there is no "route"
property to extract — the documented call returned `undefined` (resolver
fell through to `route.attributes['route']`). The factory is redefined
cleanly: **no-argument `routeValue()` binds the whole `Route`** (the
injection form the docstring always promised), and a named call binds a
`Route` property (`routeValue('path')` / `'method'` / `'id'`, plus
`attributes` — matching `attributeValue`). The other `ROUTE` factories
(`pathValue()`, `methodValue()`) are untouched. This supersedes AD-27 D-5's
"ROUTE untouched" freeze _for this signature only_.

### D-9 — Non-goals

No on-the-fly compression, multi-range, `If-Range`, percent-decoding
(incl. `%2F`), content-hash/immutable presets, listing default-on, or
conditional requests on POST.

## Consequences

- Nested static paths (`/static/assets/logo.png`) and SPA catch-alls
  (`/{*rest}`) are expressible — a routing capability with uses beyond static
  files.
- Browsers and caches revalidate with ETags (304) instead of re-downloading;
  media seeking works via 206; text assets ship precompressed with correct
  `Vary`; SPA deployments serve client routes; directories are index- or
  listing-controlled, never raw-listed.
- `@blue/test` was _not_ added as a devDependency of `blue-platform-node`:
  the nx task graph cycles (`platform-node → blue-test → platform-node`).
  Platform specs use a local response sink instead.
- `routeValue()`'s dead name-argument form is removed; no-argument
  `routeValue()` binds the Route (D-8).
- Existing static behavior is unchanged unless options opt in — the resolver
  containment spec and all prior static tests pass unmodified.

**Supersedes:** the "Static files" row of the
[Framework Gap Analysis](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md) §3
and §5 sequencing item 6 ("static-file ETag/Range/compression").
