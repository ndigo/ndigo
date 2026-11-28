/**
 * Public multipart parsing contracts.
 */
/**
 * Per-upload bounds. Every field is optional; `DEFAULT_MPART_LIMITS`
 * fills the rest. `0` is a valid bound; negative or non-finite values throw
 * a `RangeError` (fail-loud boot configuration).
 *
 * @example
 * ```ts
 * const value = {} as MultipartLimits;
 * ```
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

/** Options accepted by `parseMultipart`. */
export interface MultipartParseOptions {
    /** Parsing limits. */
    limits?: MultipartLimits;
    /** Directory for spilled temp files (default `os.tmpdir()`). */
    tmpDir?: string;
}
