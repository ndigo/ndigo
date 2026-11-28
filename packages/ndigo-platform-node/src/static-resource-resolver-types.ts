/**
 * Public contracts for static-resource resolution.
 */
/** Outcome kinds for a static-resource lookup. */
export type StaticResourceKind = 'forbidden' | 'not-found' | 'internal-error' | 'ok';

/** Content-Encoding of a precompressed variant. */
export type StaticEncoding = 'br' | 'gzip';

/** The result of resolving a static resource. */
export interface StaticResourceResult {
    /** The resolution outcome. */
    readonly kind: StaticResourceKind;
    /**
     * Absolute path of the payload file to open (only for `ok` file-backed
     * results). Callers stream from here — resolution never reads payload
     * bytes.
     */
    readonly path?: string;
    /**
     * Generated payload bytes (directory listings only; `ok` file-backed
     * results carry `path` instead).
     */
    readonly data?: Buffer;
    /** MIME type from the allowlist (only for `ok`). */
    readonly contentType?: string;
    /** Byte size of the served payload (only for `ok`; the variant's when encoded). */
    readonly size?: number;
    /** Last-modified time (ms epoch) of the served payload (only for `ok`). */
    readonly mtimeMs?: number;
    /**
     * Strong validator of the served payload: `"<hex size>-<hex mtime>"`
     * for originals, `"<hex size>-<hex mtime>-<encoding>"` for variants so the
     * two never collide under one URL. Absent for generated listings,
     * which are not cacheable validators.
     */
    readonly etag?: string;
    /** `Content-Encoding` of the served variant, when precompressed. */
    readonly encoding?: StaticEncoding;
    /** True when the payload could have been served encoded (compressible MIME) — handlers add `Vary: Accept-Encoding`. */
    readonly variantAware?: boolean;
}

/** Response header that forbids MIME sniffing. */
export const NOSNIFF_HEADER = 'X-Content-Type-Options: nosniff';

/** Options controlling resolution beyond the plain file (D-6/D-7). */
export interface StaticResolveOptions {
    /** Directory index files, tried in order for a directory path. */
    indexNames?: readonly string[];
    /** Generate an HTML listing for directories with no index match. */
    listDirectories?: boolean;
    /** Client `Accept-Encoding` header — drives precompressed variant selection. */
    acceptEncoding?: string;
    /**
     * Reject files larger than this many bytes, checked at stat time before
     * anything is opened or read. `0` (default) = unlimited.
     */
    maxFileSizeBytes?: number;
    /**
     * Whether dotfiles (any path segment beginning with `.`) may be served.
     * Default `false`: dotfile requests resolve `forbidden` (→ 403).
     * The standard `.well-known` namespace is the built-in opt-in exception —
     * it is served either way, so well-known URIs keep working without
     * exposing every hidden file.
     */
    serveDotfiles?: boolean;
}
