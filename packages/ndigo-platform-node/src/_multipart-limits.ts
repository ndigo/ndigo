/**
 * Resolved multipart limits and header/path sanitizers.
 */
import type { IncomingMessage } from 'node:http';
import { HTTPHeaders, multipartBoundary } from '@ndigo/http';
import type { MultipartLimits } from './parse-multipart-types.js';

/** Resolved, read-only limits with defaults applied. */
export interface ResolvedMultipartLimits {
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

export function resolveMultipartLimits(limits?: MultipartLimits): ResolvedMultipartLimits {
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
export function contentLengthOf(req: IncomingMessage): number | null {
    const raw = HTTPHeaders.CONTENT_LENGTH.get(req.headers);
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value === undefined || !/^\d+$/.test(value)) {
        return null;
    }
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : null;
}

/** Extract the multipart boundary from a `Content-Type` header, or `null`. */
export function extractBoundary(contentType: string | undefined): string | null {
    return multipartBoundary(contentType);
}

/**
 * Reject a client-supplied filename that could escape the upload directory.
 *
 * busboy passes the `filename` attribute through verbatim (RFC 7578), so it is
 * untrusted. Any path separator (`/` or `\`) or a bare `.` / `..` segment turns
 * a name into a traversal payload (`../../etc/passwd`, an absolute path, a
 * Windows backslash). Such names are rejected outright — before any temp file is
 * created — so the stored {@link MultipartFile.originalFilename} can never
 * resolve against the working directory. A plain basename passes through trimmed.
 */
export function sanitizeFilename(filename: string | undefined): string | null {
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
