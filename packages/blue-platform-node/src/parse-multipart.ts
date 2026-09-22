/**
 * Streaming `multipart/form-data` parser for {@link NodeHTTPServerAdapter}.
 *
 * Wraps busboy (the zero-dependency streaming primitive that multer and
 * @fastify/multipart build on). Parts below {@link MultipartLimits.fileThreshold}
 * are held in memory; larger parts spill to a temp file so peak memory stays
 * bounded regardless of upload size. Size limits reject with `413` through the
 * same {@link RequestLimitError} the body-limit path uses, so uploads fail
 * identically to an over-large JSON body.
 *
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import busboy from 'busboy';
import type { Readable } from 'node:stream';
import { createWriteStream } from 'node:fs';
import type { WriteStream } from 'node:fs';
import type { IncomingMessage } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { RequestLimitError } from './http-request-limits';
import { NodeMultipartContext, NodeMultipartFile, type Backing, type MultipartFile } from './multipart-file';

/** Per-upload bounds. Every field is optional; {@link DEFAULT_MPART_LIMITS} fills the rest. */
export interface MultipartLimits {
    /** Maximum size of a single file part, in bytes (default 10 MiB). */
    maxFileSize?: number;
    /** Maximum number of file parts (default 100). */
    maxFiles?: number;
    /** Maximum number of text-field parts (default 100). */
    maxFields?: number;
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
    limits?: MultipartLimits;
    /** Directory for spilled temp files (default `os.tmpdir()`). */
    tmpDir?: string;
}

/** Resolved, read-only limits with defaults applied. */
interface ResolvedMultipartLimits {
    readonly maxFileSize: number;
    readonly maxFiles: number;
    readonly maxFields: number;
    readonly maxRequestSize: number;
    readonly fileThreshold: number;
}

/** Conservative v1 defaults — bounded, but generous enough for avatar/document uploads. */
const DEFAULT_MPART_LIMITS: ResolvedMultipartLimits = {
    maxFileSize: 10 * 1024 * 1024,
    maxFiles: 100,
    maxFields: 100,
    maxRequestSize: 10 * 1024 * 1024,
    fileThreshold: 128 * 1024,
};

function pickLimit(value: number | undefined, fallback: number): number {
    if (value === undefined) {
        return fallback;
    }
    return typeof value !== 'number' || !Number.isFinite(value) || value <= 0 ? fallback : value;
}

function resolveMultipartLimits(limits?: MultipartLimits): ResolvedMultipartLimits {
    const d = DEFAULT_MPART_LIMITS;
    return {
        maxFileSize: pickLimit(limits?.maxFileSize, d.maxFileSize),
        maxFiles: pickLimit(limits?.maxFiles, d.maxFiles),
        maxFields: pickLimit(limits?.maxFields, d.maxFields),
        maxRequestSize: pickLimit(limits?.maxRequestSize, d.maxRequestSize),
        fileThreshold: pickLimit(limits?.fileThreshold, d.fileThreshold),
    };
}

/** Extract the multipart boundary from a `Content-Type` header, or `null`. */
function extractBoundary(contentType: string | undefined): string | null {
    if (!contentType) {
        return null;
    }
    const mime = contentType.split(';')[0]?.trim().toLowerCase() ?? '';
    if (mime !== 'multipart/form-data') {
        return null;
    }
    const match = /boundary=(?:"([^"]+)"|([^\s;]+))/.exec(contentType);
    return match ? (match[1] ?? match[2]) : null;
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
function sanitizeFilename(filename: string): string | null {
    if (/[/\\]/.test(filename)) {
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
 */
export async function parseMultipart(
    req: IncomingMessage,
    options: MultipartParseOptions = {}
): Promise<NodeMultipartContext> {
    if (!extractBoundary(req.headers['content-type'])) {
        throw new RequestLimitError(400, 'missing_boundary', 'Request is not a valid multipart/form-data body');
    }

    const limits = resolveMultipartLimits(options.limits);
    const tmpDir = options.tmpDir ?? tmpdir();
    const context = new NodeMultipartContext();

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
            parts: limits.maxFiles + limits.maxFields,
        },
    });

    let resolveParse: (context: NodeMultipartContext) => void = () => undefined;
    let rejectParse: (error: Error) => void = () => undefined;
    const settle = new Promise<NodeMultipartContext>((resolvePromise, rejectPromise) => {
        resolveParse = resolvePromise;
        rejectParse = rejectPromise;
    });

    const pending: Promise<void>[] = [];

    bb.on('field', (name, value) => {
        if (aborted) {
            return;
        }
        totalBytes += Buffer.byteLength(value);
        if (totalBytes > limits.maxRequestSize) {
            flagAbort('request_too_large', 'Total multipart request exceeds the maximum allowed size');
            return;
        }
        context.setField(name, value);
    });

    bb.on('file', (_name, stream, info) => {
        const safeName = sanitizeFilename(info.filename);
        if (safeName === null) {
            // Reject traversal / absolute / separator filenames before any filesystem touch.
            void stream.resume();
            return;
        }
        if (aborted) {
            // Still drain so busboy can reach 'close'.
            void stream.resume();
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
                (bytes) => {
                    totalBytes += bytes;
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
        // A parse error (e.g. a malformed boundary) is a client mistake, not an overload.
        rejectParse(
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
        if (aborted) {
            // Overflowed upload: discard temp parts so nothing leaks on disk.
            await context.cleanup();
            rejectParse(aborted);
            return;
        }
        // Hand off readable parts to the caller; temps survive until the request
        // is bound and cleanup() is called (D-3: cleaned up on read-completion).
        resolveParse(context);
    });

    req.pipe(bb);

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
    onByte: (bytes: number) => void,
    onOverLimit: () => void
): Promise<MultipartFile> {
    return new Promise<MultipartFile>((resolve, reject) => {
        let mode: 'buffer' | 'temp' = 'buffer';
        const chunks: Buffer[] = [];
        let size = 0;
        let ws: WriteStream | null = null;
        let tempPath: string | null = null;
        let settled = false;

        const done = (backing: Backing): void => {
            if (settled) {
                return;
            }
            settled = true;
            resolve(new NodeMultipartFile(name, info.filename, info.mimeType, backing));
        };

        stream.on('data', (chunk: Buffer) => {
            size += chunk.length;
            onByte(chunk.length);
            if (stream.truncated || size > limits.maxFileSize) {
                // Over the per-file cap: abort, keep draining, stop storing.
                onOverLimit();
                return;
            }
            if (mode === 'buffer') {
                chunks.push(chunk);
                if (limits.fileThreshold > 0 && size > limits.fileThreshold) {
                    tempPath = join(tmpDir, `blue-upload-${randomBytes(8).toString('hex')}`);
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
            if (!settled) {
                reject(error);
            }
        });
    });
}
