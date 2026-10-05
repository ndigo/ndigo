# 2026-09-22 Multipart / File Upload

**Status:** Ratified as [AD-26](../decisions/2026-09-22_AD26_MULTIPART_FILE_UPLOAD.md) (2026-09-22); all four waves implemented and landed.
**Scope:** Server-side acceptance of `multipart/form-data` uploads in `@blue/platform-node`:
a streaming parser (busboy), a Blue-owned `MultipartFile` contract, an argument resolver +
`@file` marker, size limits → `413`, and demo gates. Client-side `FormData` already exists
(`blue-http`) and is untouched.
**Companion docs:**
[Framework Gap Analysis](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md) §2.1 ("Multipart / file
upload — the Node body resolver has no multipart parser", Tier 1 must-have),
[Feature Assessment](../reference/2026-09-01_FEATURE_ASSESSMENT.md) §3,
[AD-24 Caching](../decisions/2026-09-17_AD24_CACHING.md) (own-the-contract / wrap-the-standard
precedent), [AD-25 Security Headers](../plans/2026-09-18_SECURITY_HEADERS.md) (most recent
platform-node AD).

---

## 1. Problem

The gap analysis records this as a Tier 1 enterprise must-have that is **completely absent**:

> Server cannot accept uploads — `MULTIPART_FORM_DATA` constant and client `FormData` transformer
> exist, but the Node body resolver has no multipart parser.

Blue can _emit_ a `multipart/form-data` request (client `FormDataTransformer`, blue-http) but cannot
_receive_ one. A handler annotated for a file part has nothing to bind against. This is a hard gap:
any form with an `<input type="file">` silently drops the file. Spring's answer is
`MultipartFile` + `MultipartHttpServletRequest` resolved before argument binding; this plan ports
that capability to Blue's resolver/interceptor model.

## 2. Current state (verified 2026-09-22)

- **No server multipart parser.** Grep over `packages/*/src` finds only the `MULTIPART_FORM_DATA`
  media-type constant (`blue-core/src/media-types.ts:77`) and the client-side
  `FormDataTransformer` (`blue-http/src/transformers/form-data-transformer.ts`). Nothing parses an
  incoming multipart body.
- **The pipeline buffers the whole body before parsing.** In
  `NodeHTTPServerAdapter.handleRequest` (node-http-server-adapter.ts:822) the flow is
  `#readBody(req)` → `#parseBodyRecord(req, body)` → `nodeRequest.body`. `#readBody`
  (node-http-server-adapter.ts:1083) **streams the request into a single `Buffer`** subject to
  `maxBodyBytes` (**default 1 MiB**, node-http-server-adapter.ts:1112), then `parseBody`
  (`http-request-limits.ts:101`) dispatches on Content-Type to empty / JSON / raw text. A large file
  therefore cannot stream to disk — it would have to fit in memory first. **Multipart must intercept
  before `#readBody`.**
- **Argument resolvers read from `request.body`.** `NodeBodyValueMethodArgumentResolver`
  (`body-argument-resolver.ts`) supports `MethodParameterType.BODY` and returns
  `request.body` / `request.body?.[name]`. A new file resolver must read from a sibling surface.
- **The request object is minimal and middleware-populated.** `NodeRequest`
  (`node-request.ts:20`) is `{ headers, body, cookies, session }`; the adapter populates it before
  dispatch. An optional `multipart` field slots in alongside `cookies`/`session`.
- **Resolver registration + base class are stable seams.** Resolvers register in
  `configureNodeArgumentResolvers` (`configure-argument-resolvers.ts:22`) via
  `applicationContext.setValue('argumentResolvers', resolvers)`. Each extends
  `AbstractPlatformArgumentResolver` (`abstract-platform-resolver.ts`): implement `resolveName()` +
  `supportsParameter()`; the base runs the converter pipeline + Zod `convert` hook.
- **Limits infra exists and maps to status codes.** `HTTPRequestLimits` / `RequestLimitError`
  (`http-request-limits.ts`) already turn oversize bodies into `413`. Multipart overflow should
  reuse this so the response shape is consistent with the existing body-limit path.
- **The decorator-metadata convention is established.** `@transactional`, `@scheduled`,
  `@authenticated` all record metadata on method/parameter and a resolver reads it (the `validatedBy`
  hook installs `parameter.convert` the same way). A `@file` marker fits here.

## 3. External research

### Spring MVC (the contract to mirror)

- **Parsing model.** `StandardServletMultipartResolver` delegates to Tomcat's `Request.parsePart`,
  which splits the stream on the multipart boundary; `CommonsMultipartResolver` wraps Apache Commons
  FileUpload as an alternative. Resolution happens **early** — the request is wrapped in a
  `MultipartHttpServletRequest` _before_ argument resolution, so resolvers see parts directly. This
  is exactly why Blue must parse before `#readBody`.
- **`MultipartFile` interface.** `getName()` (form field name), `getOriginalFilename()`, `getSize()`,
  `isEmpty()`, `getBytes()`, `getInputStream()` / `getStream()`, `transferTo(File)` / `copyTo(Path)`,
  `getContentType()`, `headers`. A part is either in memory or a temp file — the interface hides which.
- **Request access.** `MultipartHttpServletRequest.getFileMap()` / `getFile(name)` /
  `getMultiFileMap()` for files; text fields via `getParameter()`.
- **Threshold + limits.** Tomcat writes parts to a temp file above `file-size-threshold` (default 4
  KB), keeping small parts in memory. `max-file-size` (per file, default 10 MB) and `max-request-size`
  (total, default 2 MB); overflow throws `MaxUploadSizeExceededException` → **HTTP 413**.

### Node parsers (the primitive to wrap)

- **busboy** is the canonical **zero-dependency, fully streaming** multipart parser — multer and
  `@fastify/multipart` both build on it. Event API: `file(readableStream, name, filename)`,
  `field(name, value, ...)`, and an iterator-style `parts()`; limits via config
  `{ fileSize, files, fields, fieldSize, headerValueLength, partLimit }`. It hands chunk streams and
  never buffers the whole body — the right low-level primitive. (Gotcha: `fileSize`/`partLimit` are
  honored only in the `parts()` streaming mode, not the legacy `file`-event path.)
- **multer** wraps busboy in an Express-middleware shape (`memoryStorage` / `diskStorage`) — useful
  glue but framework-specific; its storage abstraction (buffer vs. stream-to-disk) is the pattern to
  borrow, not its middleware entry point.
- **@fastify/multipart**, **formidable**, **parse-multipart** are other options; all either wrap
  busboy/dicer or re-solve the same streaming problem. busboy is the dependency-light canonical choice.

## 4. Decisions

### D-1 — Own the contract, wrap busboy

BlueJS owns the `MultipartFile` + request-access contract and wraps **busboy** as the streaming
parser. This follows the repo's three prior "own the contract, wrap the standard" settlements:
`blue-signals` re-exports `@preact/signals-core`, validation adopted Zod (AD-07), telemetry wraps
OpenTelemetry. busboy is the zero-dep canonical primitive; multer/fastify-multipart add framework
glue (Express/Fastify middleware shapes) that does not fit Blue's resolver/interceptor model, so we
wrap the primitive directly and build the Blue-shaped contract on top. One new runtime dependency,
justified as minimal and idiomatic.

### D-2 — Parse early in the adapter, streaming from `req` (never through `#readBody`)

Mirror Spring's early `MultipartResolver`: detect `Content-Type: multipart/form-data` at the top of
`handleRequest`, and when present **stream `req` directly through busboy**, bypassing `#readBody`
entirely. The parsed result is stored on the request as `nodeRequest.multipart`; text fields merge
into `request.body` so they still bind via the existing body resolver; file parts live in
`request.multipart.files`. Because this path never buffers the whole body, large files stream to disk
instead of memory — the current 1 MiB `maxBodyBytes` cap is irrelevant to uploads and does not need
to move. Each part is classified by RFC 7578 Content-Disposition: a `filename` attribute marks a
file part; its absence marks a text field (busboy's `file()` vs `field()` events).

### D-3 — Threshold-based streaming: buffer small parts, stream large ones to disk

Mirror Spring's `file-size-threshold` / multer's storage split. Each file part below a configurable
`fileThreshold` (default 128 KB) is collected into an in-memory `Buffer`; parts above it are piped
straight to a temp file via `fs.createWriteStream`. The `MultipartFile` handle records which and
serves both `bytes()`/`stream()` from the same interface. Temp files live under a configurable `tmpDir`
(default `os.tmpdir()`) and are cleaned up on read-completion or request error; `transferTo(dest)`
moves a part off temp to a caller-chosen path. This bounds peak memory while keeping the common small
upload allocation-free-of-disk.
upload allocation-free-of-disk. Tomcat's equivalent threshold defaults to 0 (everything to disk);
Blue keeps common small uploads in memory by default and only spills larger parts — a deliberate
efficiency choice over Spring's default.

### D-4 — Limits → 413, reusing the existing limits infra

Per-file `maxFileSize`, total `maxRequestSize`, file count `maxFiles`, and field count/size. On any
overflow throw a `RequestLimitError(413, ...)` — **the same class the body-limit path already maps**,
so oversized uploads return the identical RFC-9457 problem+json shape as an over-large JSON body.
Configured through a `MultipartConfig` (wired in node auto-config with sane defaults); it is
deliberately separate from `HTTPRequestLimits` so the global body cap and the upload caps evolve
independently. Defaults are generous-but-bounded (e.g. `maxRequestSize` in the low-tens-of-MB range)
so a single upload cannot exhaust disk or memory — the security posture of Spring's defaults without
their too-small-for-files 2 MB default.

### D-5 — Bind via a dedicated resolver + zero-arg `@file` name inference

TypeScript parameter types are erased at runtime, so binding is driven by an explicit marker, not the
declared type — matching how `@RequestBody` drives `BODY` and how `validatedBy` installs `convert`. A
new `NodeMultipartFileMethodArgumentResolver` (registered in `configureNodeArgumentResolvers`) supports
parameters carrying `@file` metadata. The part name defaults to the **parameter name** (`@file() avatar`
binds client field `avatar`); pass an explicit name only when the client form field differs from the JS
variable (`@file('avatar_url') avatar`). `resolveName()` reads
`request.multipart.files.get(name)` and returns a single `MultipartFile` or `MultipartFile[]` for an
array-typed param. Text fields keep binding through the body resolver. Zero-arg inference removes the
common boilerplate while keeping the explicit, unambiguous marker — Blue's analogue of Spring's
`@RequestParam MultipartFile` / `@RequestPart`.

### D-6 — Filename safety is framework-owned (busboy does not sanitize)

busboy passes the client-supplied `filename` through verbatim; Spring defers sanitization to the
caller. Uploading straight into a filesystem is a **path-traversal** risk (`../../etc/passwd`, drive
letters, absolute paths). Blue sanitizes at the edge: reject names containing path separators or
segments `.`/`..`, collapse to a safe basename, and never resolve the temp file against the working
directory. Virus scanning, content allow-listing, and storage backend (local vs. object store) are
explicitly **out of scope** — the contract exposes bytes/stream so a caller pipes to S3/GCS unchanged.

### D-7 — Non-goals

No client-side multipart building (already present), no `@RequestPart` JSON+file structured binding in
v1 (a file part is bound as `MultipartFile`; JSON parts bind via the body resolver), no distributed /
object-store upload, no streaming-response download endpoint (out of scope — this is _accepting_
uploads), no on-disk auto-purge daemon (temp files are cleaned per-request). All are post-1.0
candidates behind the `MultipartFile` seam.

## 5. Architecture

| Piece                                                                          | Home                                                                           | Notes                                                           |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `parseMultipart(req, config)` — busboy streaming wrapper → `{ fields, files }` | `blue-platform-node/src/parse-multipart.ts`                                    | New; the only busboy touchpoint                                 |
| `MultipartFile` interface + impl (buffer or temp-file handle)                  | `blue-platform-node/src/multipart-file.ts`                                     | Contract consumers import from `@blue/platform-node`            |
| `MultipartContext` (`{ fields, files: Map<string, MultipartFile[]> }`)         | `blue-platform-node/src/multipart-file.ts`                                     | Lives on `NodeRequest.multipart`                                |
| `@file(partName?)` marker + metadata reader                                    | `blue-platform-node/src/file-argument-resolver.ts`                             | Mirrors `validatedBy`'s parameter-metadata hook                 |
| `NodeMultipartFileMethodArgumentResolver`                                      | `blue-platform-node/src/multipart-file-argument-resolver.ts`                   | Reads `request.multipart.files.get(name)`                       |
| Adapter detection + wiring into `handleRequest`                                | `node-http-server-adapter.ts:822`                                              | Before `#readBody`; bypasses buffering                          |
| `NodeRequest.multipart?` field                                                 | `node-request.ts:20`                                                           | Optional, alongside `cookies`/`session`                         |
| `MultipartConfig` + defaults                                                   | `blue-platform-node/src/http-request-limits.ts` (or new `multipart-config.ts`) | Extends the limits pattern; overflow → `RequestLimitError(413)` |
| Auto-config wiring / defaults                                                  | `node-auto-configuration.ts`                                                   | AD-24/AD-25 platform-node precedent                             |

Package deps: `blue-platform-node` gains **busboy** (runtime) + its types; no other new runtime
dependencies. No browser globals (passes `@blue/no-browser-globals-in-isomorphic`).

### API sketch

```ts
import { File, MultipartFile } from '@blue/platform-node';

class ProfileController {
    // @file() infers the part name from the param name ("avatar"); pass a name only when the client
    // form field differs from the JS variable, e.g. an array bound under one repeated field name:
    async updateProfile(
        @file() avatar: MultipartFile, // client field "avatar"
        @file('photos') gallery: MultipartFile[], // client fields named "photos"
        @RequestBody() meta: { name: string }
    ) {
        if (avatar.isEmpty()) throw new BadRequestException('avatar_required');
        const size = avatar.size; // bytes
        const name = avatar.originalFilename; // client-supplied, sanitized on persist
        await avatar.transferTo(`/uploads/${safeName(name)}`); // or: avatar.stream() → S3
        return { ok: true, size, name, thumbnails: gallery.length };
    }
}

// The contract
interface MultipartFile {
    readonly name: string; // form field name (getName)
    readonly originalFilename: string;
    readonly contentType?: string;
    readonly size: number; // bytes (getSize)
    isEmpty(): boolean;
    bytes(): Uint8Array | Promise<Uint8Array>;
    stream(): NodeJS.ReadableStream | AsyncIterable<Buffer>;
    transferTo(dest: string): Promise<void>; // copy off temp file
}
```

## 6. Risks

- **Path traversal (security).** Sanitized at the edge (D-6); the residual risk is a caller who
  bypasses `transferTo` and writes `originalFilename` themselves — documented as out of contract.
- **Disk exhaustion / temp cleanup.** Bounded by `maxRequestSize`; temp files cleaned on read or
  request close/error. A crash mid-upload can leave a temp file — noted as post-1.0 (a bounded-age
  purge), not a v1 blocker.
- **Limits interaction with the global body cap.** Multipart bypasses `#readBody`, so its own
  `MultipartConfig` governs uploads; the 1 MiB `maxBodyBytes` default never applies to them. Documented
  so operators don't expect one knob to cover both.
- **Filename encoding.** RFC 5987 `filename*` (UTF-8) vs plain `filename`; busboy exposes both — plan
  to prefer `filename*` when present.
- **No scanning.** Blue accepts the bytes; virus/content scanning is the caller's contract, stated in
  docs.

## 7. Sequencing

**Wave 1 — contract + parser (no binding).** `multipart-file.ts` (`MultipartFile` interface + impl:
buffer/temp-file handle, `bytes()`/`stream()`/`transferTo()`, `isEmpty()`) and `parse-multipart.ts`
(busboy wrapper with threshold-to-disk, limits → `RequestLimitError(413)`, filename safety). Vitest
specs (threshold behavior, per-file/total overflow → 413, temp cleanup, path-traversal rejection).
Gates: package vitest + `tsc -b`.

**Wave 2 — request wiring.** `NodeRequest.multipart` field; adapter detects multipart in
`handleRequest` and streams via busboy before `#readBody`; text fields merge into `request.body`.
Spec asserts a real `multipart/form-data` body yields the expected fields + file parts. Gates:
platform-node vitest + `tsc -b`.

**Wave 3 — binding.** `@file` marker + metadata reader (zero-arg name inference, explicit-name
override); `NodeMultipartFileMethodArgumentResolver` (single + array), registered in
`configureNodeArgumentResolvers`. Spec asserts `@file()` binds by param name and `@file('x')` overrides.
Gates: vitest + `tsc -b`.

**Wave 4 — demo gates + docs.** blue-api `POST /api/upload` accepting `@file() file: MultipartFile`,
persists to temp, returns `{ size, name }`; spec round-trips an upload. AD-26; guide
`docs/guides/08-multipart-and-file-upload.md`; status refresh: gap-analysis §2.1 multipart row →
IMPLEMENTED, feature-assessment row updated, plan status header. Final: `pnpm lint`,
`pnpm format:check`, changed-package `vitest run` + `tsc -b`, `graft build`.

## 8. Verification

- Parser: small part buffered in memory, large part streamed to a temp file; per-file overflow and
  total overflow each return `413`; temp files removed after read/request close; `../` / absolute /
  backslash filenames rejected before any filesystem touch.
- Wiring: a real multipart request populates `request.multipart.files` and merges text fields into
  `request.body`; non-multipart bodies are unaffected (still go through `#readBody`).
- Binding: `@file() avatar: MultipartFile` infers client field "avatar"; `@file('avatar_url') avatar`
  overrides it; array param yields all parts under the (inferred or explicit) name; a missing part on a
  required param fails like any other missing value.
- Demo upload spec: file bytes round-trip to disk with the reported size and sanitized name.
- Repo gates: `pnpm lint` (`--deny-warnings`), `pnpm format:check`, package `tsc -b`, package
  `vitest run`.
