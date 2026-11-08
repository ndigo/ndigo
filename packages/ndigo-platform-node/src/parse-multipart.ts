/**
 * Streaming `multipart/form-data` parser for {@link NodeHTTPServerAdapter}.
 *
 * Wraps busboy (the zero-dependency streaming primitive that multer and
 * \@fastify/multipart build on). Parts below {@link MultipartLimits.fileThreshold}
 * are held in memory; larger parts spill to a temp file so peak memory stays
 * bounded regardless of upload size. Size limits reject with `413` through the
 * same {@link RequestLimitError} the body-limit path uses, so uploads fail
 * identically to an over-large JSON body. An over-cap `Content-Length` rejects
 * before any body byte is read; chunked uploads are capped by a counting gate
 * that stops the flow instead of draining to EOF. Rejected or post-abort
 * parts are drained with a real consumer so busboy always reaches `close`.
 */
import busboy from 'busboy';
import type { Readable } from 'node:stream';
import { PassThrough } from 'node:stream';
import { createWriteStream } from 'node:fs';
import type { WriteStream } from 'node:fs';
import type { IncomingMessage } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomHex } from '@ndigo/util';
import { RequestLimitError } from './http-request-limits';
import { multipartBoundary } from '@ndigo/http';
import { NodeMultipartContext, NodeMultipartFile, type Backing, type MultipartFile } from './multipart-file';
import { HTTPHeaders } from '@ndigo/http';

/**
 * Per-upload bounds. Every field is optional; {@link DEFAULT_MPART_LIMITS}
 * fills the rest. `0` is a valid bound; negative or non-finite values throw
 * a `RangeError` (fail-loud boot configuration).
 */
export interface MultipartLimits {
    /** Maximum size of a single file part, in bytes (default 10 MiB). */
    maxFileSize?: number;
    /** Maximum number of file parts (default 100). */
    maxFiles?: number;
    /** Maximum number of text-field parts (default 100). */
    maxFields?: number;
    /** Maximum total number of parts, fields + files (default `maxFiles + maxFields`). */
    maxParts?: number;
    /** Maximum size of a single text field, in bytes (default 1 MiB). Truncated fields reject with `413 field_too_large` — a silently truncated string is never bound. */
    maxFieldSize?: number;
    /** Maximum combined size of the whole request, in bytes (default 10 MiB). */
    maxRequestSize?: number;
    /**
     * Parts at or below this many bytes stay in memory; larger ones spill to a
     * temp file (default 128 KiB). Set to `0` to force disk for every part.
     */
    fileThreshold?: number;
}

/** Options accepted by {@link parseMultipart}. */
export interface MultipartParseOptions {
    /** Parsing limits. */
    limits?: MultipartLimits;
    /** Directory for spilled temp files (default `os.tmpdir()`). */
    tmpDir?: string;
}

/** Resolved, read-only limits with defaults applied. */
interface ResolvedMultipartLimits {
    readonly maxFileSize: number;
    readonly maxFiles: number;
    readonly maxFields: number;
    readonly maxParts: number;
    readonly maxFieldSize: number;
    readonly maxRequestSize: number;
    readonly fileThreshold: number;
}

/**
 * Conservative v1 defaults — bounded, but generous enough for avatar/document
 * uploads. NOTE: `maxRequestSize`/`maxFileSize` default to 10 MiB while the
 * adapter's whole-body cap (`HTTPRequestLimits.maxBodyBytes`) defaults to
 * 1 MiB — the multipart parser is deliberately configured independently
 * (surfaced via {@link NodeHTTPServerAdapterOptions.multipart}); deployments
 * that want one budget for every body shape should align the two explicitly.
 */
const DEFAULT_MPART_LIMITS: ResolvedMultipartLimits = {
    maxFileSize: 10 * 1024 * 1024,
    maxFiles: 100,
    maxFields: 100,
    maxParts: 200,
    maxFieldSize: 1024 * 1024,
    maxRequestSize: 10 * 1024 * 1024,
    fileThreshold: 128 * 1024,
};

/**
 * Apply the default when a limit is genuinely absent; reject values that
 * cannot mean anything (negative or non-finite) instead of silently swapping
 * in the default — misconfigured boot-time limits fail loud. `0` is a valid
 * bound for every limit (for {@link MultipartLimits.fileThreshold} it means
 * "force disk for every part").
 */
function pickLimit(field: keyof MultipartLimits, value: number | undefined, fallback: number): number {
    if (value === undefined) {
        return fallback;
    }
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
        throw new RangeError(
            `MultipartLimits.${field} must be a non-negative finite number, received ${String(value)}`
        );
    }
    return value;
}

function resolveMultipartLimits(limits?: MultipartLimits): ResolvedMultipartLimits {
    const d = DEFAULT_MPART_LIMITS;
    const maxFiles = pickLimit('maxFiles', limits?.maxFiles, d.maxFiles);
    const maxFields = pickLimit('maxFields', limits?.maxFields, d.maxFields);
    return {
        maxFileSize: pickLimit('maxFileSize', limits?.maxFileSize, d.maxFileSize),
        maxFiles,
        maxFields,
        maxParts: pickLimit('maxParts', limits?.maxParts, maxFiles + maxFields),
        maxFieldSize: pickLimit('maxFieldSize', limits?.maxFieldSize, d.maxFieldSize),
        maxRequestSize: pickLimit('maxRequestSize', limits?.maxRequestSize, d.maxRequestSize),
        fileThreshold: pickLimit('fileThreshold', limits?.fileThreshold, d.fileThreshold),
    };
}

/**
 * Reads the request's declared `Content-Length` as a number, or `null` when
 * the header is absent or not a plain non-negative integer. The raw header
 * can be an array in degenerate cases (RFC 9110 folds); the first value wins.
 */
function contentLengthOf(req: IncomingMessage): number | null {
    const raw = HTTPHeaders.CONTENT_LENGTH.get(req.headers);
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value === undefined || !/^\d+$/.test(value)) {
        return null;
    }
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : null;
}

/** Extract the multipart boundary from a `Content-Type` header, or `null`. */
function extractBoundary(contentType: string | undefined): string | null {
    return multipartBoundary(contentType);
}

/**
 * Reject a client-supplied filename that could escape the upload directory.
 *
 * busboy passes the `filename` attribute through verbatim (RFC 7578), so it is
 * untrusted. Any path separator (`/` or `\`) or a bare `.` / `..` segment turns
 * a name into a traversal payload (`../../etc/passwd`, an absolute path, a
 * Windows backslash). Such names are rejected outright — before any temp file is
 * created (D-6) — so the stored {@link MultipartFile.originalFilename} can never
 * resolve against the working directory. A plain basename passes through trimmed.
 */
function sanitizeFilename(filename: string | undefined): string | null {
    // busboy's types widen `filename` to possibly-undefined; a file part with
    // no filename has nothing safe to write, so it is rejected like the other
    // invalid names.
    if (filename === undefined || /[/\\]/.test(filename)) {
        return null;
    }
    const base = filename.trim();
    if (base === '' || base === '.' || base === '..') {
        return null;
    }
    if (base.includes('\u0000')) {
        return null;
    }
    return base;
}

/**
 * Parse a `multipart/form-data` request body into fields + file parts.
 *
 * Streams the incoming request directly through busboy — it never buffers the
 * whole body first, so an oversized upload cannot exhaust memory. Rejects with
 * a `413` {@link RequestLimitError} when any configured limit is exceeded, and
 * with a `400` when the body is not valid multipart.
 *
 * @param req - The incoming request.
 * @param options - Parsing limits and temp directory.
 * @returns The parsed multipart context.
 */
export async function parseMultipart(
    req: IncomingMessage,
    options: MultipartParseOptions = {}
): Promise<NodeMultipartContext> {
    if (!extractBoundary(HTTPHeaders.CONTENT_TYPE.get(req.headers) ?? undefined)) {
        throw new RequestLimitError(400, 'missing_boundary', 'Request is not a valid multipart/form-data body');
    }

    const limits = resolveMultipartLimits(options.limits);
    const tmpDir = options.tmpDir ?? tmpdir();
    const context = new NodeMultipartContext();

    // SEC-5: when the client declares its size up front and it exceeds the
    // cap, reject before reading a byte — no body consumption, no
    // `100-continue` data transfer, no temp files.
    const declaredLength = contentLengthOf(req);
    if (declaredLength !== null && declaredLength > limits.maxRequestSize) {
        throw new RequestLimitError(
            413,
            'request_too_large',
            'Total multipart request exceeds the maximum allowed size'
        );
    }

    let totalBytes = 0;
    let aborted: RequestLimitError | null = null;
    const flagAbort = (code: string, message: string): void => {
        if (!aborted) {
            aborted = new RequestLimitError(413, code, message);
        }
    };

    const bb = busboy({
        headers: req.headers,
        limits: {
            fileSize: limits.maxFileSize,
            files: limits.maxFiles,
            fields: limits.maxFields,
            fieldSize: limits.maxFieldSize,
            parts: limits.maxParts,
        },
    });

    let resolveParse: (context: NodeMultipartContext) => void = () => undefined;
    let rejectParse: (error: Error) => void = () => undefined;
    const settle = new Promise<NodeMultipartContext>((resolvePromise, rejectPromise) => {
        resolveParse = resolvePromise;
        rejectParse = rejectPromise;
    });
    let settled = false;
    const settleError = (error: Error): void => {
        if (settled) {
            return;
        }
        settled = true;
        rejectParse(error);
    };
    const settleOk = (value: NodeMultipartContext): void => {
        if (settled) {
            return;
        }
        settled = true;
        resolveParse(value);
    };

    // SEC-5: a counting gate between the request stream and busboy. Without
    // a `Content-Length` (chunked uploads) the declared size is unknown, so
    // the cap must stop the flow while streaming — crossing it destroys the
    // gate stream with the same `RequestLimitError` busboy's own error path
    // already surfaces, rejecting 413 promptly instead of draining to EOF.
    const gate = new PassThrough();
    // The cap-error propagates to busboy directly (destroying the gate alone
    // would strand the piped parser without an error signal and it would
    // never emit 'close'); busboy's 'error' path settles the promise.
    gate.on('data', (chunk: Buffer) => {
        totalBytes += chunk.length;
        if (totalBytes > limits.maxRequestSize) {
            flagAbort('request_too_large', 'Total multipart request exceeds the maximum allowed size');
            gate.destroy();
            bb.destroy(
                new RequestLimitError(
                    413,
                    'request_too_large',
                    'Total multipart request exceeds the maximum allowed size'
                )
            );
        }
    });

    const pending: Promise<void>[] = [];

    bb.on('field', (name, value, info) => {
        if (aborted) {
            return;
        }
        // COR-15: the counting gate above already saw every body byte — field
        // values must NOT be added again (that would double count and reject
        // uploads at ~half the configured cap). Only re-check the totals.
        if (info.valueTruncated) {
            // SEC-9: busboy truncated this field at the field-size limit —
            // bind nothing; the abort rejects with 413 field_too_large.
            flagAbort('field_too_large', 'A text field exceeds the maximum allowed size');
            return;
        }
        if (totalBytes > limits.maxRequestSize) {
            flagAbort('request_too_large', 'Total multipart request exceeds the maximum allowed size');
            return;
        }
        context.setField(name, value);
    });

    bb.on('file', (_name, stream, info) => {
        const safeName = sanitizeFilename(info.filename);
        if (safeName === null || aborted) {
            // Reject traversal / absolute / separator filenames before any
            // filesystem touch; still drain rejected or post-abort parts with
            // a real consumer so busboy reaches 'close' promptly (SEC-7).
            stream
                .on('data', () => undefined)
                .on('end', () => undefined)
                .on('error', () => undefined);
            return;
        }
        pending.push(
            collectFile(
                context,
                _name,
                tmpDir,
                stream,
                { ...info, filename: safeName },
                limits,
                () => {
                    // COR-15: the counting gate is the single byte counter;
                    // this only re-checks the accumulated total (adding here
                    // would double-count file chunks against the cap).
                    if (totalBytes > limits.maxRequestSize) {
                        flagAbort('request_too_large', 'Total multipart request exceeds the maximum allowed size');
                    }
                },
                () => flagAbort('file_too_large', 'A file part exceeds the maximum allowed size')
            ).then(
                (part) => context.addFile(_name, part),
                () => {}
            )
        );
    });

    bb.on('filesLimit', () => flagAbort('too_many_files', 'Too many file parts were uploaded'));
    bb.on('fieldsLimit', () => flagAbort('too_many_fields', 'Too many text fields were uploaded'));
    bb.on('partsLimit', () => flagAbort('too_many_parts', 'Too many parts were uploaded'));
    bb.on('error', (error) => {
        // A parse error (e.g. a malformed boundary) is a client mistake, not
        // an overload. The streaming gate's own cap error passes through with
        // its 413 status; everything else is a malformed body.
        if (error instanceof RequestLimitError) {
            settleError(error);
            return;
        }
        settleError(
            new RequestLimitError(
                400,
                'malformed_multipart',
                `Failed to parse multipart body: ${(error as Error).message}`
            )
        );
    });

    bb.once('close', async () => {
        // Register every part before resolving so a caller that awaits the
        // parser sees the complete field + file map.
        await Promise.all(pending);
        if (settled) {
            // Abort-settled (client abort, socket loss; COR-16): the error is
            // already recorded — discard temp parts so nothing leaks on disk.
            await context.cleanup();
            return;
        }
        if (aborted) {
            // Overflowed upload: discard temp parts so nothing leaks on disk.
            await context.cleanup();
            settleError(aborted);
            return;
        }
        // Hand off readable parts to the caller. Temp files survive until the
        // request dispatch completes; the framework request lifecycle then
        // calls cleanup() (SEC-6) — the parser's own abort path above is the
        // only other release.
        settleOk(context);
    });

    req.pipe(gate).pipe(bb);

    // COR-16: mirror #readBody's abort wiring. A client abort mid-upload must
    // settle the parser and destroy the gate/busboy pipeline so busboy's
    // 'close' handler above runs the temp cleanup — otherwise `parseMultipart`
    // would hang forever with spilled `ndigo-upload-*` files and open fds
    // behind it.
    const onAbort = (): void => {
        settleError(new RequestLimitError(400, 'request_aborted', 'Request aborted before completion'));
        gate.destroy();
        bb.destroy();
    };
    req.once('aborted', onAbort);
    req.once('close', () => {
        if (!settled && req.errored) {
            onAbort();
        }
    });

    return settle;
}

/**
 * Consume one file part, buffering it in memory until it exceeds the spill
 * threshold, then streaming the remainder to a temp file. Resolves with the
 * finished {@link MultipartFile}; the parser discards it if an abort fired.
 */
function collectFile(
    context: NodeMultipartContext,
    name: string,
    tmpDir: string,
    stream: Readable & { truncated?: boolean },
    info: { filename: string; mimeType: string },
    limits: ResolvedMultipartLimits,
    onData: () => void,
    onOverLimit: () => void
): Promise<MultipartFile> {
    return new Promise<MultipartFile>((resolve, reject) => {
        let mode: 'buffer' | 'temp' = 'buffer';
        const chunks: Buffer[] = [];
        let size = 0;
        let ws: WriteStream | null = null;
        let tempPath: string | null = null;
        let settled = false;
        let ended = false;

        const done = (backing: Backing): void => {
            if (settled) {
                return;
            }
            settled = true;
            resolve(new NodeMultipartFile(name, info.filename, info.mimeType, backing));
        };
        // COR-16: a part stream destroyed mid-upload (client abort, parser
        // teardown, overflow) never emits 'end' — release the spill target's
        // file descriptor immediately so it cannot leak.
        const closeSpill = (): void => {
            if (ws) {
                ws.destroy();
                ws = null;
            }
        };

        stream.on('data', (chunk: Buffer) => {
            size += chunk.length;
            onData();
            if (stream.truncated || size > limits.maxFileSize) {
                // Over the per-file cap: abort, keep draining, stop storing.
                onOverLimit();
                return;
            }
            if (mode === 'buffer') {
                chunks.push(chunk);
                // PL-2: a threshold of 0 means "force disk for every part" —
                // `size > 0` spills on the first byte.
                if (size > limits.fileThreshold) {
                    tempPath = join(tmpDir, `ndigo-upload-${randomHex(8)}`);
                    context.trackTemp(tempPath);
                    ws = createWriteStream(tempPath);
                    for (const buffered of chunks) {
                        ws.write(buffered);
                    }
                    chunks.length = 0;
                    mode = 'temp';
                }
            } else if (ws) {
                ws.write(chunk);
            }
        });
        stream.on('end', () => {
            ended = true;
            if (mode === 'buffer') {
                done({ kind: 'buffer', data: Buffer.concat(chunks) });
            } else if (ws) {
                ws.once('finish', () => done({ kind: 'temp', path: tempPath as string, size }));
                ws.end();
            } else {
                done({ kind: 'temp', path: tempPath as string, size });
            }
        });
        stream.on('error', (error) => {
            closeSpill();
            if (!settled) {
                reject(error);
            }
        });
        stream.on('close', () => {
            if (settled || ended) {
                // 'end' already ran — normal completion (the temp file's
                // async 'finish' may still be landing); nothing to abort.
                return;
            }
            // Destroyed before 'end' (abort/teardown): settle the part as an
            // abort so the pending bookkeeping clears; the parser-level
            // cleanup unlinks the temp file (COR-16).
            closeSpill();
            reject(new RequestLimitError(400, 'request_aborted', 'Request aborted before completion'));
        });
    });
}
