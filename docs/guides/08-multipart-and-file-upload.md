# Guide 08 — Multipart & File Upload

Multipart in BlueJS is **server-side acceptance** of `multipart/form-data` uploads: the
adapter streams an incoming upload straight through [busboy](https://github.com/mscdex/busboy),
and a handler binds each file part to a `MultipartFile`. The client half — building a
`multipart/form-data` body with `blue-http`'s `FormData` — already exists and is untouched;
this guide covers the receiving side.

The design mirrors Spring MVC's `MultipartFile` + early `MultipartResolver`, adapted to
Blue's resolver/interceptor model: parsing happens **before** argument binding, so resolvers
see parts directly rather than a buffered body. The one new runtime dependency is busboy —
the canonical zero-dependency streaming parser; Blue owns the contract and wraps it.

## 1. The contract

A `MultipartFile` (`@blue/platform-node`) is one part of the request. It is backed either by
an in-memory `Buffer` (small uploads) or a temp file on disk (large uploads streamed above a
threshold); both are served through the same interface, so callers never care which.

```ts
import type { MultipartFile } from '@blue/platform-node';

async function handle(file: MultipartFile) {
    file.name; // form field name ("avatar")
    file.originalFilename; // client-supplied filename — untrusted, never written to disk as-is
    file.contentType; // declared Content-Type, when present
    file.size; // bytes
    file.isEmpty(); // true when no bytes were received

    const bytes: Uint8Array = await file.bytes(); // buffers a temp part into memory
    const stream = file.stream(); // streaming read (Node Readable)
    await file.transferTo('/srv/uploads/avatar.png'); // copy off temp; creates parent dirs
}
```

The parsed request lives on `request.multipart` as a `MultipartContext`: `{ fields }` for text
parts and `files`, a `Map<string, MultipartFile[]>` keyed by form field name. The adapter
populates this before dispatch — you never construct it.

## 2. Accepting an upload

Binding is driven by an explicit marker, not the declared type (parameter types are erased at
runtime). Declare file parts with the `fileValue()` extractor inside `@parameters`, exactly as
you would for a validated body:

```ts
import { fileValue, postMapping, parameters, requestMapping } from '@blue/dispatcher';
import { ResponseEntity } from '@blue/platform-node';
import type { MultipartFile } from '@blue/platform-node';

@requestMapping('/api')
export class ProfileController {
    @postMapping('/upload')
    @parameters({ file: fileValue() })
    async upload(file: MultipartFile) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest({ error: 'no_file_uploaded' });
        }
        const dest = `/uploads/${randomBytes(8).toString('hex')}`; // never originalFilename
        await file.transferTo(dest);
        return { size: file.size, name: file.originalFilename };
    }
}
```

The part name defaults to the **parameter name** — `fileValue()` binds client field `file` here.
Pass an explicit name only when the client form field differs from the JS variable:

```ts
@parameters({ avatar: fileValue('avatar_url') }) // client field "avatar_url" → JS `avatar`
async uploadProfile(avatar: MultipartFile) { … }
```

## 3. Multiple files and text fields

A repeated client field name binds to an array — declare the parameter as `MultipartFile[]`:

```ts
@parameters({ photos: fileValue('photos') })
async uploadGallery(photos: MultipartFile[]) {
    // One client field "photos" sent three times → three parts.
    const sizes = await Promise.all(photos.map(async (p) => p.size));
    return { count: photos.length, sizes };
}
```

Text fields are not files — they keep binding through the existing body resolver (`request.body`),
so a mixed form mixes `@parameters` extractors and plain body binding. There is no `@RequestPart`
JSON+file structured binding in v1; JSON parts bind via the body resolver, file parts as
`MultipartFile`.

## 4. Reading bytes: buffer vs. temp

The parser thresholds each part (`fileThreshold`, default **128 KiB**): at or below it stays in
memory; above it the remainder streams to a temp file under `tmpDir` (default `os.tmpdir()`). The
handle records which and serves both access styles:

- `bytes()` — read everything into memory (materializes a temp part); simplest for small uploads.
- `stream()` — a Node `Readable`; use for large parts or when piping straight to an object store.
- `transferTo(dest)` — copy the part off its temp location to a caller-chosen path (creating parent
  directories). This is the recommended way to persist: it never writes `originalFilename` to disk,
  so a traversal payload can't escape the upload dir.

Temp files are cleaned up on read-completion or request close/error; there is no daemon — cleanup is
per-request.

## 5. Limits and errors

Uploads carry their own bounds (`MultipartLimits`), separate from the global body cap, so a single
upload can't exhaust memory or disk. Defaults are bounded but generous:

| Limit            | Default | Meaning                                                        |
| ---------------- | ------- | -------------------------------------------------------------- |
| `maxFileSize`    | 10 MiB  | bytes per file part                                            |
| `maxRequestSize` | 10 MiB  | combined bytes for the whole request                           |
| `maxFiles`       | 100     | number of file parts                                           |
| `maxFields`      | 100     | number of text-field parts                                     |
| `fileThreshold`  | 128 KiB | at/below this, a part stays in memory; above it spills to disk |

Exceeding any limit throws a `RequestLimitError(413, …)` — the same class the body-limit path maps,
so an oversized upload returns the identical RFC-9457 problem+json shape as an over-large JSON body.
A malformed boundary (or a non-multipart body reaching the parser) rejects with 400. The adapter
bypasses `#readBody` for multipart, so the global `maxBodyBytes` cap never applies to uploads — tune
the upload caps independently via the framework's configuration-properties mechanism.

## 6. Filename safety

busboy passes the client-supplied `filename` through verbatim, so treat it as untrusted. Blue
sanitizes at the edge: any name containing a path separator (`/` or `\`), a bare `.` / `..` segment,
or a NUL byte is rejected **before any temp file is created**. The demo controller persists under a
random filename and echoes only the reported `originalFilename` — never resolving it to disk.

Virus scanning, content allow-listing, and storage backend (local vs. S3/GCS) are out of contract:
the contract exposes bytes/stream so a caller pipes to their store unchanged. Writing
`originalFilename` yourself is the documented residual risk.

## 7. Pitfalls

- **Don't write `originalFilename` to disk.** It's untrusted; use `transferTo` to a path you control,
  or rename under a random name (as the demo does). Path traversal lives in the filename.
- **`bytes()` materializes temp parts into memory.** For large uploads prefer `stream()` /
  `transferTo`; reserve `bytes()` for small parts already in memory.
- **A missing part on a required parameter fails like any other missing value** — no special-casing;
  guard with `isEmpty()` when an empty (but present) part should be rejected explicitly.
- **The global body cap doesn't govern uploads.** Multipart parses before `#readBody`; tune the upload
  caps (`maxFileSize` / `maxRequestSize`) separately so one knob doesn't masquerade as both.

Reference: `apps/04-blue-api` (`POST /api/upload` demo gate in `upload-controller.ts`, round-trip +
empty-file spec in `upload.spec.ts`). Design rationale: [AD-26](../decisions/2026-09-22_AD26_MULTIPART_FILE_UPLOAD.md).
