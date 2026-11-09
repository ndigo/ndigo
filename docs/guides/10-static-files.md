# Guide 10 — Static Files

`@ndigo/platform-node` serves filesystem resources with the HTTP semantics a
browser cache or CDN expects: ETag conditional GET, single-range requests,
cache headers, precompressed variants, SPA history fallback, and directory
control (AD-28). One class owns the whole decision flow — `StaticResourceHandler`
— and two thin entry points mount it: the ready-made `/static/{*file}`
controller, or a `StaticFileView` on any route you choose.

**Audience:** Node application developers · **Prerequisites:** Guide 01 · **Reference app:** `apps/05-ndigo-api`, `apps/12-ndigo-petclinic`

## What you'll learn

- Mount the static controller and choose a root.
- Serve ETag/conditional GET and single-range requests.
- Use precompressed variants and cache headers.
- Enable SPA history fallback and directory control.
- Apply the containment and method-safety rules.

## 1. Mount the controller

`StaticController` maps `GET`/`HEAD` on `/static/{*file}` — a greedy route
segment, so nested paths (`/static/assets/logo.png`) and every file beneath
the root are captured:

```ts
import { resolve } from 'node:path';
import { configuration, entry } from '@ndigo/context';
import { StaticController } from '@ndigo/platform-node';

@configuration
class AppConfiguration {
    @entry()
    staticController() {
        // Base dir: explicit path > STATIC_DIR env > `${process.cwd()}/public`
        return new StaticController(resolve('public'));
    }
}
```

`apps/05-ndigo-api` registers exactly this and serves `/static/assets/logo.png`
from `./public/assets/logo.png`.

Greedy capture is raw and **undecoded**: nothing percent-decodes request
paths, so `%2e%2e`, `%20`, or `%2F` are literal filename characters — encoded
traversal cannot leave the base directory, and encoded names are only served
when an on-disk file literally contains them.

## 2. What every response gets

| Concern        | Behavior                                                                                                                                                                                                                              |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Methods        | `GET` and `HEAD` (HEAD matches the GET mapping — Node suppresses the body). Any other method → `405` problem+json.                                                                                                                    |
| Content type   | MIME allowlist by extension (`.html`, `.htm`, `.css`, `.js`, `.mjs`, `.json`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.ico`, `.webp`, `.woff`, `.woff2`, `.ttf`, `.txt`, `.xml`, `.pdf`, `.wasm`); unknown extensions → `403`.      |
| Sniffing       | `X-Content-Type-Options: nosniff` on every response.                                                                                                                                                                                  |
| Cache          | `Cache-Control: public, max-age=3600` by default (`null` omits the header).                                                                                                                                                           |
| Validators     | Strong ETag `"<hex size>-<hex mtime>"` — per-variant (`…-br`/`…-gzip`) so encodings never collide — plus `Last-Modified`; `If-None-Match` beats `If-Modified-Since` → `304` echoing the validators.                                   |
| Ranges         | `Accept-Ranges: bytes`; single `bytes=a-b` / `bytes=a-` / `bytes=-n` → `206` + `Content-Range`; unsatisfiable → `416` + `Content-Range: bytes */N`; malformed or multi-range → plain `200`; a stale `If-Range` cancels the range.     |
| Precompressed  | `<file>.br` / `<file>.gz` twins served when `Accept-Encoding` negotiates (q-values, ties prefer `br`); text-ish types always send `Vary: Accept-Encoding`, even when the original is served. Image/font/binary types never negotiate. |
| Body streaming | Files stream from disk with stat-derived `Content-Length`; conditional GETs and HEAD are answered from metadata alone — the file is never opened.                                                                                     |

Failures keep the framework's problem+json contract: `403` (containment
escape, unknown extension, size cap), `404` (missing file), `405` (method),
`416` (unsatisfiable range), `500` (unexpected filesystem error — classified,
never leaked).

## 3. Options

```ts
new StaticController(resolve('dist'), {
    cacheControl: 'public, max-age=31536000, immutable',
    indexNames: ['index.html'],
    listDirectories: false,
    spaFallback: true,
    maxFileSizeBytes: 8 * 1024 * 1024,
});
```

| Option             | Default                  | Semantics                                                                                                     |
| :----------------- | :----------------------- | :------------------------------------------------------------------------------------------------------------ |
| `cacheControl`     | `'public, max-age=3600'` | `null` omits the header entirely.                                                                             |
| `indexNames`       | `['index.html']`         | Directory requests try each name in order; each candidate is re-verified by containment.                      |
| `listDirectories`  | `false`                  | No index match → generated HTML listing: names HTML-escaped, relative hrefs, parent link only below the root. |
| `spaFallback`      | `false`                  | A 404 file miss on an HTML-accepting `GET`/`HEAD` serves the base index and extends `Vary` with `Accept`.     |
| `maxFileSizeBytes` | `0` (unlimited)          | Rejected at stat time, before the file is opened; oversized → `403`.                                          |

## 4. The view variant

When the path is not under `/static/` — or file selection should take part in
view resolution — use `StaticFileView`: the file is `route.path` relative to
the base directory.

```ts
import { getMapping, ModelAndView } from '@ndigo/dispatcher';
import { resolve } from 'node:path';
import { StaticFileView } from '@ndigo/platform-node';

@getMapping('/assets/{*file}')
assets() {
    // GET /assets/logo.png → <base>/assets/logo.png
    return new ModelAndView(new StaticFileView(resolve('public')));
}
```

`StaticResourceResolver` is the same resolution without the HTTP half:
`resolve(requestPath, options)` returns a classified result
(`ok`/`forbidden`/`not-found`/`internal-error`) carrying MIME type, validators,
encoding, and the absolute file path, never throws for expected failures, and
never reads payload bytes. `negotiateEncoding()` and `statusForKind()` are
exported for tools that need the pieces separately.

## 5. Security model

- **Containment:** the base directory is canonicalized (`realpath`); every
  candidate and its resolved symlink target must stay under `base + separator`,
  otherwise `403`.
- **Undecoded paths:** request paths are never percent-decoded — `%2F` can
  never become `/`.
- **Allowlist:** only known extensions are served; unknown → `403`.
- **No sniffing:** `nosniff` on every response.
- **Streaming:** resolution never buffers payloads; responses stream, and
  conditional GETs/HEAD read `stat` metadata only.
- **Size cap:** optional and enforced before any open.

## See also

- Decision: [AD-28](../decisions/2026-09-24_AD28_STATIC_FILES.md) — ETag/Range,
  precompressed variants, SPA fallback, directory control (D-1..D-9).
- Package: `@ndigo/platform-node` README — `StaticController`,
  `StaticFileView`, `StaticResourceHandler`, `StaticResourceResolver`.
- Guides: [01 — Building a Node API](01-building-a-node-api.md) (the server
  that mounts it), [14 — Multipart & File Upload](14-multipart-and-file-upload.md)
  (the upload counterpart).
