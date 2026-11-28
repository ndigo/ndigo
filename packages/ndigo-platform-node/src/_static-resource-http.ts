/**
 * HTTP semantics helpers for static resources: conditional GET, ranges,
 * SPA fallback negotiation, and drain waiting.
 */
import type { ServerResponse } from 'node:http';
import { once } from 'node:events';
import { MediaType, MediaTypes } from '@ndigo/core';
import { IF_MODIFIED_SINCE, IF_NONE_MATCH, IF_RANGE } from '@ndigo/http';
import type { StaticResourceResult } from './static-resource-resolver.js';

/** Default `Cache-Control` for successful responses. */
export const DEFAULT_CACHE_CONTROL = 'public, max-age=3600';
/** Default directory index names. */
export const DEFAULT_INDEX_NAMES = ['index.html'] as const;

/** Converts epoch-ms to the RFC 1123 date used by `Last-Modified`/`If-Modified-Since`. */
export function toHttpDate(ms: number): string {
    return new Date(ms).toUTCString();
}

/**
 * Waits for a saturated response to become writable again, or to close.
 * A backpressured client that aborts emits `close` — never `drain`
 * — so awaiting `drain` alone would wedge the handler and leak the read
 * stream's fd.
 *
 * @param res - The response awaiting backpressure relief.
 * @returns `true` when the response drained, `false` when it closed (or
 *   errored) first.
 */
export function waitForDrainOrClose(res: ServerResponse): Promise<boolean> {
    return Promise.race([
        once(res, 'drain').then(
            () => true,
            () => false
        ),
        once(res, 'close').then(
            () => false,
            () => false
        ),
    ]);
}

/** True when the request method may receive a body (GET/HEAD only, D-8). */
export function isBodylessMethod(method: string | undefined): boolean {
    return method === 'GET' || method === 'HEAD';
}

/**
 * Whole-resource conditional check (RFC 7232 §3): `If-None-Match` takes
 * precedence over `If-Modified-Since`.
 *
 * @param headers - The request headers (lower-cased names).
 * @param result - The resolved payload with validators.
 * @returns `true` when the client's validators match → respond 304.
 */
export function isNotModified(
    headers: Record<string, string | string[] | undefined>,
    result: StaticResourceResult
): boolean {
    const ifNoneMatch = IF_NONE_MATCH.get(headers);
    if (ifNoneMatch !== null) {
        const etag = result.etag;
        if (!etag) {
            return false;
        }
        for (const candidate of ifNoneMatch.split(',')) {
            const tag = candidate.trim().replace(/^W\//, '');
            if (tag === '*' || tag === etag) {
                return true;
            }
        }
        return false;
    }
    const ifModifiedSince = IF_MODIFIED_SINCE.get(headers);
    if (ifModifiedSince !== null && result.mtimeMs !== undefined) {
        const since = Date.parse(ifModifiedSince);
        // HTTP-date granularity is seconds — an mtime within the same second
        // as the client's cached copy counts as not modified.
        if (Number.isFinite(since) && Math.floor(result.mtimeMs / 1000) <= Math.floor(since / 1000)) {
            return true;
        }
    }
    return false;
}

/** Parsed single-range (RFC 7233 §3.1). */
export interface ByteRange {
    /** Inclusive start (computed for suffix ranges). */
    readonly start: number;
    /** Inclusive end (clamped to the payload length - 1). */
    readonly end: number;
}

/**
 * Parses a single `bytes=` range spec against a payload length.
 *
 * @returns `null` to ignore the header (malformed or multi-range → full 200,
 *   RFC 7233 §3.1), `'unsatisfiable'` for valid-but-empty overlap (→ 416),
 *   or the computed range.
 */
export function parseSingleRange(rangeHeader: string, length: number): ByteRange | 'unsatisfiable' | null {
    const match = /^bytes=([^,]+)$/.exec(rangeHeader.trim());
    if (!match || match[1] === undefined) {
        return null;
    }
    const spec = match[1].trim();
    if (spec.startsWith('-')) {
        // Suffix range: last N bytes.
        const n = Number(spec.slice(1));
        if (!Number.isInteger(n) || n <= 0) {
            return 'unsatisfiable';
        }
        // An empty payload admits no overlapping suffix range (start>end is
        // never a valid 206) — any byte range on an empty file is 416.
        if (length <= 0) {
            return 'unsatisfiable';
        }
        return { start: Math.max(length - n, 0), end: length - 1 };
    }
    const dash = spec.indexOf('-');
    if (dash <= 0) {
        return null;
    }
    const start = Number(spec.slice(0, dash));
    if (!Number.isInteger(start) || start < 0) {
        return null;
    }
    if (start >= length) {
        return 'unsatisfiable';
    }
    const openEnd = spec.slice(dash + 1);
    const end = openEnd === '' ? length - 1 : Number(openEnd);
    if (!Number.isInteger(end) || end < start) {
        // Invalid byte-range-spec (last < first) — ignore the header.
        return null;
    }
    return { start, end: Math.min(end, length - 1) };
}

/**
 * RFC 7233 §3.2 validator check for `If-Range`. A range request is
 * honored only when the client's validator still matches the current
 * representation; a stale validator means the client holds an out-of-date
 * partial copy, so the server MUST send the full 200 instead of a misaligned
 * 206.
 *
 * @returns `null` when `If-Range` is absent (the range proceeds); `true`
 *   when the validator matches (206 allowed); `false` when it is stale
 *   (the range MUST be ignored → full 200).
 */
export function ifRangeMatches(
    headers: Record<string, string | string[] | undefined>,
    result: StaticResourceResult
): boolean | null {
    const ifRange = IF_RANGE.get(headers);
    if (ifRange === null) {
        return null;
    }
    const candidate = ifRange.trim();
    // An entity-tag validator (quoted or weak `W/"..."`): strong compare.
    if (candidate.startsWith('"') || candidate.startsWith('W/')) {
        const tag = candidate.replace(/^W\//, '').trim();
        return result.etag !== undefined && tag === result.etag;
    }
    // Otherwise it is an RFC 1123 HTTP-date: the range stands only when the
    // current representation is at least as new as the client's validator.
    if (result.mtimeMs !== undefined) {
        const since = Date.parse(candidate);
        return Number.isFinite(since) && Math.floor(result.mtimeMs / 1000) >= Math.floor(since / 1000);
    }
    return false;
}

/** Response context for one resolved representation. */
export interface RepresentationContext {
    readonly res: ServerResponse;
    readonly result: StaticResourceResult;
    readonly successHeaders: Record<string, string>;
    readonly headers: Record<string, string | string[] | undefined>;
    readonly method: string | undefined;
}

/**
 * The representations the SPA fallback can serve.
 */
const SPA_FALLBACK_TYPES = [MediaTypes.TEXT_HTML, MediaTypes.APPLICATION_XHTML_XML];

/** True when the client accepts HTML (SPA fallback gate, D-6). */
export function acceptsHtml(accept: string | string[] | undefined): boolean {
    // MediaType-based Accept evaluation (Wave 6): wildcard and suffix
    // matching via `matches()`, and `;q=0` means "never" (RFC 7231 §5.3.1 —
    // the pre-Wave-6 substring check reported `text/html;q=0` as
    // acceptable). No Accept header → HTML assumed (browser default).
    if (accept === undefined || accept.length === 0) {
        return true;
    }
    const value = Array.isArray(accept) ? accept.join(',') : accept;
    return MediaType.parseAccept(value).some(
        (accepted) => accepted.qualityFactor > 0 && SPA_FALLBACK_TYPES.some((offered) => accepted.matches(offered))
    );
}
