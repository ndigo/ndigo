# AD-26: Multipart / file upload — busboy streaming parser, `MultipartFile`, `fileValue()`

**Date:** 2026-09-22
**Status:** Accepted — decision recorded; implementation landed (see
[plan](../plans/2026-09-22_MULTIPART_FILE_UPLOAD.md)).

## Background

This is gap-analysis item #1 in the Tier 1 "must-have" row of
[`docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md`](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md) §2.1:

> Server cannot accept uploads — `MULTIPART_FORM_DATA` constant and client `FormData`
> transformer exist, but the Node body resolver has no multipart parser.

Ndigo could _emit_ a `multipart/form-data` request (client `FormDataTransformer`,
`@ndigo/http`) but not _receive_ one. A handler annotated for a file part had
nothing to bind against; any `<input type="file">` form silently dropped the
file. The reference answer is `MultipartFile` + a `MultipartHttpServletRequest`
resolved **before** argument binding — this ports that capability to Ndigo's
resolver/interceptor model.

The trigger questions shaped every decision: how to parse without re-introducing
the body-buffering gap (the Node adapter streams the whole request into one
`Buffer` subject to a 1 MiB `maxBodyBytes` cap before parsing), what the contract
should be, how binding is driven when parameter types are erased at runtime, and
where the security boundary for client-supplied filenames sits.

## Decisions

### D-1 — Own the contract, wrap busboy

ndigo owns the `MultipartFile` + request-access contract and wraps **busboy** as
the streaming parser (`packages/ndigo-platform-node/src/parse-multipart.ts` is the
only busboy touchpoint). This follows the repo's three prior "own the contract,
wrap the standard" settlements: `ndigo-signals` re-exports `@preact/signals-core`,
validation adopted Zod (AD-07), telemetry wraps OpenTelemetry. busboy is the
canonical **zero-dependency, fully streaming** primitive (multer and
`@fastify/multipart` both build on it); their framework-specific middleware shapes
(Express/Fastify) don't fit Ndigo's resolver/interceptor model, so the primitive is
wrapped directly and a Ndigo-shaped contract is built on top. One new runtime
dependency (`busboy`) plus its types — minimal and idiomatic.

### D-2 — Parse early in the adapter, streaming from `req` (never through `#readBody`)

Mirror the early `MultipartResolver`: detect `Content-Type: multipart/form-data`
at the top of `NodeHTTPServerAdapter.handleRequest` and, when present, stream `req`
directly through busboy (`parse-multipart.ts:832`), bypassing `#readBody` entirely.
The parsed result is stored on the request as `nodeRequest.multipart`; text fields
merge into `request.body` so they still bind via the existing body resolver; file
parts live in `request.multipart.files`. Because this path never buffers the whole
body, large files stream to disk instead of memory — the 1 MiB `maxBodyBytes` cap is
irrelevant to uploads and does not move. Each part is classified by RFC 7578
Content-Disposition: a `filename` attribute marks a file part (`busboy`'s `file()`
event); its absence marks a text field (`field()`).

### D-3 — Threshold-based streaming: buffer small parts, stream large ones to disk

Mirror the `file-size-threshold` / multer's storage split. Each file part at or
below a configurable `fileThreshold` (default **128 KiB**) is collected into an
in-memory `Buffer`; parts above it are piped straight to a temp file via
`fs.createWriteStream`. The `MultipartFile` handle records which backing it has and
serves both `bytes()`/`stream()` from the same interface. Temp files live under a
configurable `tmpDir` (default `os.tmpdir()`) and are cleaned up on read-completion
or request close/error; `transferTo(dest)` copies a part off temp to a caller-chosen
path (creating parent directories). This bounds peak memory while keeping the common
small upload allocation-free-of-disk — a deliberate efficiency choice over Tomcat's
default threshold of 0 (everything to disk).

### D-4 — Limits → 413, reusing the existing limits infra

Per-file `maxFileSize`, total `maxRequestSize`, file count `maxFiles`, and field
count/size live in a dedicated `MultipartLimits` (`parse-multipart.ts:27`), separate
from `HTTPRequestLimits` so the global body cap and the upload caps evolve
independently. On any overflow throw a `RequestLimitError(413, …)` — **the same class
the body-limit path already maps** — so oversized uploads return the identical
RFC-9457 problem+json shape as an over-large JSON body. Conservative v1 defaults are
bounded but generous: `maxFileSize` 10 MiB, `maxRequestSize` 10 MiB, `maxFiles` 100,
`maxFields` 100, `fileThreshold` 128 KiB. A malformed boundary rejects with a 400.

### D-5 — Bind via a dedicated resolver + zero-arg `fileValue()` inference

TypeScript parameter types are erased at runtime, so binding is driven by an explicit
marker, not the declared type — matching how `@RequestBody` drives `BODY`. The
`fileValue(partName?)` factory (`packages/ndigo-dispatcher/src/parameters.ts:430`)
produces a `ParameterExtractor` carrying `MethodParameterType.MULTIPART_FILE`; it is
declared on the handler via `@parameters({ file: fileValue() })`. The part name
defaults to the **parameter name** (`fileValue()` → client field "file"); pass an
explicit name only when the client form field differs from the JS variable
(`fileValue('avatar_url')`). `NodeMultipartFileMethodArgumentResolver` reads
`request.multipart.files.get(name)` and returns a single `MultipartFile` or a
`MultipartFile[]` for an array-typed param. Text fields keep binding through the body
resolver. Zero-arg inference removes the common boilerplate while keeping the
explicit, unambiguous marker — Ndigo's analogue of the reference framework's
`@RequestParam MultipartFile` / `@RequestPart`.

### D-6 — Filename safety is framework-owned (busboy does not sanitize)

busboy passes the client-supplied `filename` through verbatim, so it is untrusted.
Uploading straight into a filesystem is a **path-traversal** risk (`../../etc/passwd`,
absolute paths, Windows backslashes). Ndigo sanitizes at the edge: any name containing
a path separator or a bare `.` / `..` segment (or a NUL byte) is rejected outright —
_before any temp file is created_ (`parse-multipart.ts:sanitizeFilename`) — so the
stored `MultipartFile.originalFilename` can never resolve against the working
directory. The demo controller persists under a random filename, never the
client-supplied one. Virus scanning, content allow-listing, and storage backend
(local vs. object store) are explicitly **out of scope** — the contract exposes
bytes/stream so a caller pipes to S3/GCS unchanged.

### D-7 — Non-goals

No client-side multipart building (already present), no `@RequestPart` JSON+file
structured binding in v1 (a file part binds as `MultipartFile`; JSON parts bind via
the body resolver), no distributed / object-store upload, no streaming-response
download endpoint (this is _accepting_ uploads), no on-disk auto-purge daemon (temp
files are cleaned per-request). All are post-1.0 candidates behind the `MultipartFile`
seam.

## Consequences

- New surface in `@ndigo/platform-node`: `MultipartFile` + `MultipartContext`
  contracts, `parseMultipart(req, { limits?, tmpDir? })`, and — via `@ndigo/dispatcher`
  — the `fileValue()` extractor factory. One runtime dependency (`busboy`).
- The adapter parses multipart before `#readBody`; `NodeRequest.multipart?` is a new
  optional field alongside `cookies`/`session`.
- Binding: declare file parts with `@parameters({ <field>: fileValue() })`.
- Demo gate: `apps/ndigo-api` `POST /api/upload` accepts `@file()` and returns
  `{ size, name }`; a spec round-trips an upload.
- The residual path-traversal risk is documented as the caller's responsibility when
  they bypass `transferTo` and write `originalFilename` themselves — out of contract.

## Sequencing

Implementation sequenced across four waves in
[`docs/plans/2026-09-22_MULTIPART_FILE_UPLOAD.md`](../plans/2026-09-22_MULTIPART_FILE_UPLOAD.md):
contract + parser (Wave 1), request wiring (Wave 2), binding via `fileValue()` +
resolver (Wave 3), demo gates + docs (Wave 4). All waves landed — see below.

## Implementation status (2026-09-22)

**All waves landed.**

- **Wave 1** — `multipart-file.ts` (`MultipartFile` interface + impl: buffer/temp
  handle, `bytes()`/`stream()`/`transferTo()`, `isEmpty()`); `parse-multipart.ts`
  (busboy wrapper with threshold-to-disk, limits → `RequestLimitError(413)`, filename
  safety). Backing is a `buffer` or `temp` handle served through one interface.
- **Wave 2** — `NodeRequest.multipart?` field; adapter detects multipart in
  `handleRequest` and streams via busboy before `#readBody`; text fields merge into
  `request.body`.
- **Wave 3** — `fileValue(partName?)` extractor factory + `MethodParameterType.MULTIPART_FILE`;
  `NodeMultipartFileMethodArgumentResolver` (single + array), registered in the
  `argumentResolvers()` `@entry` bean on `NodeAutoConfiguration`.
- **Wave 4** — `apps/ndigo-api` `POST /api/upload` demo gate (`UploadController`, persists
  to a temp dir under a random filename, returns `{ size, name }`); `upload.spec.ts`
  round-trip + empty-file-400 spec; guide [`docs/guides/08-multipart-and-file-upload.md`](../guides/08-multipart-and-file-upload.md);
  gap-analysis §2.1 multipart row → IMPLEMENTED; plan ratified here.

Repo gates (`pnpm lint`, `pnpm format:check`, changed-package `vitest run` + `tsc -b`,
`graft build`) pass.

## Revisit Trigger

- **Per-request temp cleanup / disk exhaustion** — a crash mid-upload can leave a temp
  file → a bounded-age purge daemon (post-1.0; currently cleaned on read-completion or
  request close).
- **Object-store upload demand** — S3/GCS/azure-blob backends behind the `MultipartFile`
  seam (`transferTo` / `stream()` already abstract the backing).
- **`filename*` (RFC 5987 UTF-8) handling** — busboy exposes both `filename` and
  `filename*`; prefer `filename*` when present once non-ASCII names surface in practice.
- **Virus / content scanning seam** — if a consumer needs server-side scanning, expose a
  hook the caller can install; bytes/stream are already available.
- **1.0 API freeze** — the `fileValue()` / `MultipartFile` naming is reviewed with the
  broader binding-extractor family before release.
