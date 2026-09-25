# 2026-09-24 Static Files: ETag, Range, compression, SPA fallback, directory control

**Status:** IMPLEMENTED 2026-09-24 via [AD-28](../decisions/2026-09-24_AD28_STATIC_FILES.md)
(decision) + this plan (waves 1–4, all landed): greedy `{*name}`/`**` routing,
resolver metadata + precompressed variants, `StaticResourceHandler`
(conditional GET / Range / cache headers / directory modes / HEAD), and the
`StaticController` catch-all + demo gates. Kept below as the design record.
Closes the "Static files" row of
[Framework Gap Analysis](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md) §3
("No Range requests, ETag/conditional GET, cache headers, gzip/brotli, SPA
history-mode fallback, or directory-listing control") and §5 sequencing item 6
("static-file ETag/Range/compression").

---

## 1. Problem

Static serving exists but is transport-poor. `StaticResourceResolver`
(`packages/blue-platform-node/src/static-resource-resolver.ts:52`) does the
hard security work — canonical-base containment via `realpath` prefix checks
(`static-resource-resolver.ts:82-130`), MIME allowlist
(`static-resource-resolver.ts:28-50`), whole-file `Buffer` reads — and
`StaticController` (`static-controller.ts:13`) serves it at `/static/{file}`
with a fixed MIME/nosniff header pair. Everything the gap row lists is absent:

- **No ETag / Last-Modified / conditional GET** — every request re-reads the
  file and re-sends 200; cache revalidation is impossible.
- **No `Accept-Ranges`/Range** — no 206/416; media seeking (video/audio)
  sends the whole file or fails.
- **No cache headers** — only `X-Content-Type-Options: nosniff`
  (`static-controller.ts:34`).
- **No gzip/brotli** — text assets ship uncompressed.
- **No SPA history-mode fallback** — `/some/client/route` is a hard 404.
- **No directory-listing control** — directories are uniformly not-found
  (`static-resource-resolver.ts:147`, spec `denies directory listing attempts`).

Two structural defects compound the work:

1. **No greedy route segment.** The radix matcher supports per-segment
   `{name}`/`:name` params and a single-segment `*` wildcard
   (`packages/blue-core/src/radix-tree.ts:148-195`), but `**` currently
   classifies as a **literal static segment** (`_classifySegment`,
   `radix-tree.ts:193-200`). So `/static/{file}` matches one segment only —
   `/static/assets/logo.png` is unreachable today — and a SPA catch-all
   pattern (`/{*rest}`) cannot be expressed. (The dispatcher's
   `PathPatternComparator` already _counts_ `*`/`**` as wildcards
   (`path-pattern-comparator.ts:19-25`), a hint the routing layer intended
   them.)
2. **`ResponseEntityView` mangles 4xx statuses.** For any entity with
   `status.code >= 400` it replaces all headers and body with a problem+json
   document (`response-entity-view.ts:25-37`) — a `416 Range Not Satisfiable`
   would drop its mandatory `Content-Range` header. Range/304 responses need
   direct response control.

## 2. Current state (verified 2026-09-24)

- **Resolver security is solid and must not regress:** `resolve(requestPath)`
  strips the leading `/`, rejects filesystem-absolute paths, canonicalizes and
  verifies containment twice (`resolve(base, relative)` then `realpath`),
  requires `stats.isFile()`, gates MIME by allowlist, and classifies every
  failure (`forbidden`/`not-found`/`internal-error`) without throwing
  (`static-resource-resolver.ts:74-166`). Spec coverage:
  `test/static-resource-resolver.spec.ts` (traversal, encoded traversal,
  symlink escape/benign, binary byte round-trip, MIME denial).
- **Two serving paths, one active:**
    - `StaticController` (`static-controller.ts:13`, `@requestMapping('/static')`
        - `@getMapping('/{file}')` at `static-controller.ts:28`) returns
          `ResponseEntity(Buffer | problem, status, { 'Content-Type', nosniff })`;
          `NodeDispatcher.render` renders entities via `ResponseEntityView`
          (`node-dispatcher.ts:48`; binary-safe `Buffer` branch at
          `response-entity-view.ts:55-58`).
    - `StaticFileView` (`static-file-view.ts:17`) — writes problem docs for
      errors itself (`writeProblem`, `static-file-view.ts:39-48`) and commits
      file bytes through a `ViewTarget` (`static-file-view.ts:54`). Currently
      wired by no app (blue-island uses `StaticController`, `island.spec.ts`).
- **Transport facts:** `route.path` is the raw, percent-encoded request path
  (`node-http-server-adapter.ts:867`); parameters bind raw (no decoding
  anywhere) — encoded filenames (`a%20b.png`) already 404 and stay 404 in v1.
  `writeRenderResult` (`producer-writer.ts`) ends `Uint8Array` bodies via
  `res.end(Buffer)`; Node then sets `Content-Length` automatically for the
  single-chunk end. **No HEAD support exists** — no `HEAD` verb decorator
  (`http-method-mapping.ts`), and `HTTPMethodCondition` matches methods
  exactly (`http-method-condition.ts:76-80`), so `HEAD /static/x` is a 405/404
  today.
- **Radix tree:** insert/lookup are per-segment with a fixed probe order
  static → param → wildcard (`radix-tree.ts:219-240`); `params` are raw
  segments, `null` when nothing captured (`radix-tree.ts:16-18`).
  `Route.params` is assigned from the match in
  `RadixMetadataHandlerMapping._getHandler` (`radix-metadata-handler-mapping.ts:73-75`).

## 3. External research

- **Spring's answer (parity target).** `ResourceHttpRequestHandler`:
  strong ETag from content (or cached metadata), `Last-Modified`,
  `If-None-Match`/`If-Modified-Since` → 304, `HttpRange` single-range 206 with
  `Content-Range` and 416 for unsatisfiable, `Accept-Ranges: bytes` on 200s,
  precompressed `.gz`/`.br` variants via `EncodedResourceResolver` (files next
  to originals, matched by `Accept-Encoding`, `Vary: Accept-Encoding`) — _not_
  on-the-fly compression, and `PathResourceResolver` index/list view opt-ins.
- **RFC 7232 conditionals:** `If-None-Match` takes precedence over
  `If-Modified-Since` when both are present (§6). 304 must include the
  validators that would have been sent on 200.
- **RFC 7233 ranges:** a server MAY ignore `Range` entirely and answer 200
  (§3.1); a single-range subset with `Content-Range: bytes a-b/length` and
  206 is the norm; unsatisfiable → 416 with `Content-Range: bytes */length`
  (§4.4); multi-range is the main complexity -- ignoring it is compliant.
- **ETag strength:** strong ETags must change when bytes change — a
  `"<size>-<mtimeMs>"` pair (hex) is the cheapest correct strong validator for
  immutable files; add the encoding suffix (`-gzip`) so variant and original
  never collide under one ETag (else caches serve gzip for non-gzip clients).
- **SPA fallback practice:** serve `index.html` for GET/HEAD only, and only
  when the client accepts HTML (`Accept: text/html` or absent) — never for
  existing-but-forbidden paths, never for non-GET.
- **Directory listings:** names must be HTML-escaped; hrefs relative; opt-in
  (Spring's default is off; so is a public listing being a minor leak).

## 4. Decisions

### D-1 — Greedy route segments: `{*name}` captures the path remainder; `**` matches without capture

The radix matcher gains a fourth node kind, **greedy**, matching the _rest of
the path_ (zero or more segments). Syntax follows the existing `{name}` param
family: `{*name}` (capturing: `params.name` = raw remainder, no leading
slash, trailing slashes stripped) and a bare `**` segment (non-capturing).
Probe priority per segment stays additive: static → param → single wildcard
`*` → greedy. `StaticController` becomes `@getMapping('/static/{*file}')`;
a SPA catch-all is `/{*rest}`. Percent-encoding is **not** decoded in the
capture — consistent with today's raw params; `%2F` must never become `/`.

### D-2 — Strong ETag from stat + conditional GET (RFC 7232)

`ETag: "<hex(mtimeMs)>-<hex(size)>"` computed from the `stat` already taken;
`Last-Modified` (RFC 1123). `If-None-Match` (list, `*`) evaluated first; else
`If-Modified-Since`; match → `304` with `ETag` (+ `Cache-Control` when
configured) and no body. ETags are per-variant (D-3) — the encoding is
appended to the validator. Only GET/HEAD are conditional-checked.

### D-3 — Precompressed variants only (`Accept-Encoding` + `Vary`)

When `<file>.br` / `<file>.gz` exist next to the original, `Accept-Encoding`
matches (`br` preferred, then `gzip`, q-values respected), and the original's
MIME type is on the compressible allowlist (text-ish: html/htm/css/js/mjs/
json/svg/xml/txt — never png/jpg/gif/webp/woff/woff2/ttf/pdf/wasm/ico), serve
the variant with `Content-Encoding` + `Vary: Accept-Encoding`. No on-the-fly
compression: precompressed files are zero-CPU, deterministic, and keep the
whole resolver streaming-free. Variants participate in ETag (D-2), Range
(D-4) and cache headers like originals.

### D-4 — Single-range `bytes=` (RFC 7233 subset)

`Accept-Ranges: bytes` on 200/206. `Range: bytes=a-b`, `bytes=a-`, `bytes=-n`
(suffix) supported on files; satisfiable → `206` + `Content-Range:
bytes a-b/length` (+ `Content-Length: b-a+1` via the single-chunk end) +
sliced bytes. Unsatisfiable → `416` + `Content-Range: bytes */length`.
Malformed or multi-range → ignore and serve `200` (RFC-legal). `If-Range` is
**not** in v1 (documented).

### D-5 — `StaticResourceHandler`: one HTTP decision flow, direct response writes

A new node-platform class owns the per-request HTTP semantics (conditional →
variant → range → cache headers → body) and writes **directly** to the
`ServerResponse` (via `NODE_RESPONSE_ATTRIBUTE`), because `304`/`206`/`416`
need status+header+no-body combos `ResponseEntityView` cannot express (its
`>= 400` rule would replace the 416's mandatory `Content-Range` with
problem+json). Errors keep today's contract: `404`/`403`/`500` problem+json
documents via `writeProblem` (same as `StaticFileView` today).

### D-6 — Handler options

```ts
interface StaticHandlerOptions {
    /** Cache-Control value on successful responses; null/undefined = none. Default 'public, max-age=3600'. */
    cacheControl?: string | null;
    /** Directory index files, tried in order for a directory path. Default ['index.html']. */
    indexNames?: string[];
    /** Serve a generated HTML listing for directories with no index match. Default false. */
    listDirectories?: boolean;
    /** 404 file miss + HTML-accepting GET/HEAD → serve indexNames[0] at the base. Default false. */
    spaFallback?: boolean;
}
```

Defaults keep every current behavior intact (no `Cache-Control`, no listing,
no SPA fallback) — the gap row's features are _options_, and the existing
resolver spec stays green unchanged.

### D-7 — Resolver coherence

Metadata and variants live **in** `StaticResourceResolver` (it owns stat +
containment): `StaticResourceResult` gains `size`, `mtimeMs`, `etag`,
`encoding?` (`'br' | 'gzip'`), and a `variantOf?` marker. Handler options
(D-6) parameterize resolution (index/listing/SPA). `Accept-Encoding`
negotiation is a pure function on the request header + candidate files.

### D-8 — Dispatcher: HEAD falls back to GET

`HTTPMethodCondition.getMatchingCondition` treats `route.method === 'HEAD'`
as matching a `GET`-constrained mapping when no HEAD mapping exists (RFC 9110
§9.3.2 — HEAD is GET without the body). Node's `ServerResponse` suppresses the
body natively for HEAD while keeping headers/content-length. This is what
makes conditional-GET revalidation probes work.

### D-9 — Non-goals

No on-the-fly compression (zlib per request), no multi-range, no
`If-Range`/`Range` on directories or listings, no percent-decoding (incl.
`%2F`), no content-hash/immutable presets, no listing default-on, no
conditional requests on POST, no changes to MIME allowlist membership or
containment rules.

## 5. Surface

```ts
// blue-platform-node
new StaticResourceHandler(basePath, options?);          // D-5/D-6
handler.handle(route): Promise<void>;                    // writes the response directly

class StaticController {                                 // D-1
    constructor(baseDir?, options?: StaticHandlerOptions);
    // @getMapping('/{*file}') → handler.handle(route)
}

// blue-core radix (D-1)
radix.insert('/static/{*file}', v);                      // greedy capture
radix.lookup('/static/a/b.png');                         // { file: 'a/b.png' }
radix.insert('/**', v);                                  // non-capturing catch-all
```

Demo (blue-island): the `dist` mount serves nested bundle assets; an
`island.spec` smoke test asserts conditional GET (ETag/304) and a 206 Range.

## 6. Risks

- **Radix change is core-routing.** Mitigated: purely additive (new segment
  kinds; existing probe order untouched; `**` stops being a literal static
  segment — check no existing pattern uses `'**'` as a literal path — none
  found in repo patterns), full radix spec suite is the gate, and greedy is
  ordered last so every current match is unaffected.
- **`{*name}` capture value semantics** (leading/trailing slash, raw encoding)
  are easy to get subtly wrong — the spec pins: `/static/{*file}` vs
  `/static/`, `/static/a`, `/static/a/b/`.
- **304/206 correctness** — every validator response must carry the same
  validators/headers a 200 would (RFC 7232 §4.1); the handler spec asserts
  header parity.
- **SPA fallback shadowing real 404s** — gated to GET/HEAD + HTML-accept +
  only on _file-miss_ (never forbidden); API routes are unaffected because the
  fallback lives inside the static handler's mount, not the dispatcher.
- **Variant ETag collisions** — encoding suffix in the ETag (D-2/D-3) prevents
  caches pairing gzip bytes with the original validator.
- **`listDirectories` XSS** — listing HTML escapes names and uses relative
  hrefs; spec asserts escaping (filenames with `<`, `"`, `&`).

## 7. Sequencing

**Wave 1 — greedy routing.** `{*name}` + `**` segments in `RadixTree`
(classify/insert/lookup + terminal zero-segment capture), greedy-aware
`PathPatternComparator` ordering (greedy strictly less specific than
single-segment params), spec (nested capture, empty capture, static beats
param beats wildcard beats greedy at the same level, comparator order).
Gates: `@blue/core` + `@blue/dispatcher` vitest + `tsc -b`.

**Wave 2 — resolver metadata + variants.** `StaticResourceResult` gains
size/mtimeMs/etag/encoding; `Accept-Encoding` variant resolution
(compressible-types gate, `.br`/`.gz` lookup); directory index (D-6
`indexNames`) and listing result modes; SPA-index resolution. Default
behavior bit-identical (existing resolver spec must pass unmodified).
Gates: `@blue/platform-node` vitest.

**Wave 3 — handler + HEAD.** `StaticResourceHandler` (conditional GET →
variant → Range → cache headers → body; 304/206/416; listing HTML generator;
problem-doc errors); dispatcher HEAD→GET fallback (D-8); resolver+handler
specs incl. 304-header-parity, 416 `Content-Range`, suffix ranges, Vary,
HEAD-through-adapter e2e. Gates: node vitest + `tsc -b`.

**Wave 4 — wiring + demo + docs.** `StaticController` catch-all mount +
options; `StaticFileView` delegates to the handler; blue-island demo (nested
assets + conditional-GET/range smoke in `island.spec.ts`); AD-28; gap-analysis
§3 "Static files" row → IMPLEMENTED; feature-assessment status row; plan
header. Final: `pnpm lint`, `pnpm format:check`, changed-package `vitest run` +
`tsc -b`, `graft build`.

## 8. Verification

- A real request for a cached asset: 200 with `ETag` + `Last-Modified`
  (+ `Cache-Control` when configured); revalidation with the ETag → 304 with
  the validator echoed; `If-Modified-Since` alone → 304.
- `Range: bytes=0-3` → 206 with 4 bytes + `Content-Range: bytes 0-3/N`;
  `bytes=-4` → suffix; `bytes=999999-` → 416 + `Content-Range: bytes */N`;
  `Range: bytes=0-1,5-6` → plain 200.
- A precompressed `.gz`/`.br` pair: browser sending `Accept-Encoding: gzip`
  gets `Content-Encoding: gzip` + `Vary`; identity gets the original; a PNG
  never gets compressed.
- SPA fallback on: `GET /route/deep` with `Accept: text/html` → index.html
  200; without HTML accept → 404; existing file → the file.
- `listDirectories` renders an escaped, relative-href listing; default false
  keeps directories 404.
- HEAD on a static asset returns headers + `Content-Length` and no body.
- Repo gates: `pnpm lint` (`--deny-warnings`), `pnpm format:check`,
  changed-package `tsc -b`, changed-package `vitest run`.
