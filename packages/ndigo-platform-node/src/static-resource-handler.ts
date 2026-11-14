/**
 * Per-request HTTP semantics for static resources (D-5): conditional GET,
 * single-range, cache headers, precompressed variants, directory listing,
 * and SPA fallback — writing directly to the `ServerResponse`.
 *
 * Payloads are streamed from disk (`createReadStream`) with stat-derived
 * `Content-Length`s: nothing whole-file-buffers, and conditional GETs / HEAD
 * are answered from stat metadata alone without opening the file (SEC-8).
 * Header names come from the `@ndigo/http` `HTTPHeader` constants (RUS-2,
 * REUSE-1), except `X-Content-Type-Options: nosniff`, reused verbatim from the
 * resolver (SEC-2); request-header reads go through the constants' `get()`,
 * which case-folds over Node's lower-cased `IncomingMessage` records.
 */
import type { ServerResponse } from 'node:http';
import { createReadStream } from 'node:fs';
import { once } from 'node:events';
import { MediaType, MediaTypes } from '@ndigo/core';
import { Route } from '@ndigo/router';
import {
    ACCEPT,
    ACCEPT_ENCODING,
    ACCEPT_RANGES,
    CACHE_CONTROL,
    CONTENT_ENCODING,
    CONTENT_LENGTH,
    CONTENT_RANGE,
    CONTENT_TYPE,
    ETAG,
    IF_MODIFIED_SINCE,
    IF_NONE_MATCH,
    IF_RANGE,
    LAST_MODIFIED,
    RANGE,
    VARY,
} from '@ndigo/http';
import { getNodeRequest, NODE_RESPONSE_ATTRIBUTE } from './node-request';
import { NOSNIFF_HEADER, StaticResourceResolver, type StaticResourceResult } from './static-resource-resolver';
import { ProblemTypes, writeProblem } from './problem-details';

/** Handler options (D-6) — defaults preserve today's plain-file behavior. */
export interface StaticHandlerOptions {
    /** `Cache-Control` value on success; `null` omits the header. Default `'public, max-age=3600'`. */
    cacheControl?: string | null;
    /** Directory index files, tried in order for a directory path. Default `['index.html']`. */
    indexNames?: readonly string[];
    /** Serve a generated HTML listing for directories with no index match. Default `false`. */
    listDirectories?: boolean;
    /** 404 file miss + HTML-accepting GET/HEAD → serve the base index. Default `false`. */
    spaFallback?: boolean;
    /** Reject files larger than this many bytes, checked at stat time before the file is opened. `0` = unlimited. Default `0`. */
    maxFileSizeBytes?: number;
    /**
     * Serve dotfiles (any path segment beginning with `.`). Default `false`:
     * dotfile requests answer 403. The standard `.well-known` namespace is
     * always served as the built-in opt-in exception (PLN-F9).
     */
    serveDotfiles?: boolean;
}

/** Default `Cache-Control` for successful responses (D-6). */
const DEFAULT_CACHE_CONTROL = 'public, max-age=3600';
/** Default directory index names (D-6). */
const DEFAULT_INDEX_NAMES = ['index.html'] as const;

/** Converts epoch-ms to the RFC 1123 date used by `Last-Modified`/`If-Modified-Since`. */
function toHttpDate(ms: number): string {
    return new Date(ms).toUTCString();
}

/**
 * Waits for a saturated response to become writable again, or to close
 * (PLN-F2). A backpressured client that aborts emits `close` — never `drain`
 * — so awaiting `drain` alone would wedge the handler and leak the read
 * stream's fd.
 *
 * @param res - The response awaiting backpressure relief.
 * @returns `true` when the response drained, `false` when it closed (or
 *   errored) first.
 */
function waitForDrainOrClose(res: ServerResponse): Promise<boolean> {
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
function isBodylessMethod(method: string | undefined): boolean {
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
function isNotModified(headers: Record<string, string | string[] | undefined>, result: StaticResourceResult): boolean {
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
interface ByteRange {
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
function parseSingleRange(rangeHeader: string, length: number): ByteRange | 'unsatisfiable' | null {
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
 * RFC 7233 §3.2 validator check for `If-Range` (COR-20). A range request is
 * honored only when the client's validator still matches the current
 * representation; a stale validator means the client holds an out-of-date
 * partial copy, so the server MUST send the full 200 instead of a misaligned
 * 206.
 *
 * @returns `null` when `If-Range` is absent (the range proceeds); `true`
 *   when the validator matches (206 allowed); `false` when it is stale
 *   (the range MUST be ignored → full 200).
 */
function ifRangeMatches(
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

/**
 * The HTTP half of static serving: one `handle(route, requestPath)` call
 * turns a path into a complete response (D-5).
 *
 * Flow: resolve (with variant negotiation) → conditional GET (D-2) → single
 * range (D-4) → cache headers → body. Handles GET and HEAD; errors are
 * problem+json documents; 404 file misses may fall back to the SPA index
 * (D-6). Writes directly, because status/header combinations like 206/304/416
 * cannot flow through `ResponseEntityView`.
 */
export class StaticResourceHandler {
    readonly #resolver: StaticResourceResolver;
    readonly #options: StaticHandlerOptions;

    /**
     * Creates a handler over a static root.
     *
     * @param basePath - The directory to serve files from.
     * @param options - Handler options (D-6).
     */
    constructor(basePath: string, options: StaticHandlerOptions = {}) {
        this.#resolver = new StaticResourceResolver(basePath);
        this.#options = options;
    }

    /**
     * Serves `requestPath` for the route's request, writing the response.
     *
     * @param route - The current route (carries the Node request/response).
     * @param requestPath - The request-relative path to serve (raw, undecoded).
     * @returns A promise that resolves once the response is written.
     */
    async handle(route: Route, requestPath: string): Promise<void> {
        // NOTE: bridging to ServerResponse | undefined — the source type is wider than this consumer's contract.
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as unknown as ServerResponse | undefined;
        if (!res || res.headersSent) {
            return;
        }
        const method = route.method;
        if (!isBodylessMethod(method)) {
            this.#sendProblem(res, route, 405, 'Method Not Allowed', ProblemTypes.methodNotAllowed);
            return;
        }
        const request = getNodeRequest(route);
        const headers: Record<string, string | string[] | undefined> = request?.headers ?? {};

        let result = await this.#resolver.resolve(requestPath, {
            indexNames: this.#options.indexNames ?? DEFAULT_INDEX_NAMES,
            listDirectories: this.#options.listDirectories,
            acceptEncoding: ACCEPT_ENCODING.get(headers) ?? undefined,
            maxFileSizeBytes: this.#options.maxFileSizeBytes,
            serveDotfiles: this.#options.serveDotfiles,
        });

        // COR-19: a shared cache must key an SPA fallback on `Accept` so it is
        // never replayed to clients that did not accept HTML.
        let spaFallbackServed = false;

        if (result.kind !== 'ok') {
            if (
                result.kind === 'not-found' &&
                this.#options.spaFallback &&
                acceptsHtml(ACCEPT.get(headers) ?? undefined)
            ) {
                const indexName = this.#options.indexNames?.[0] ?? DEFAULT_INDEX_NAMES[0];
                const index = await this.#resolver.resolve(indexName, {
                    acceptEncoding: undefined,
                    maxFileSizeBytes: this.#options.maxFileSizeBytes,
                    serveDotfiles: this.#options.serveDotfiles,
                });
                if (index.kind === 'ok') {
                    result = index;
                    spaFallbackServed = true;
                }
            }
            if (result.kind !== 'ok') {
                if (result.kind === 'forbidden') {
                    this.#sendProblem(res, route, 403, 'Forbidden', ProblemTypes.forbidden);
                } else if (result.kind === 'internal-error') {
                    this.#sendProblem(res, route, 500, 'Internal Server Error', ProblemTypes.internalError);
                } else {
                    this.#sendProblem(res, route, 404, 'Not Found', ProblemTypes.notFound);
                }
                return;
            }
        }

        const etag = result.etag;
        const fileBacked = etag !== undefined;

        // Common headers for every successful representation. Write-side names use
        // the @ndigo/http constants (RUS-2); reads stay lowercase literals.
        const successHeaders: Record<string, string> = {
            [CONTENT_TYPE.name]: result.contentType ?? String(MediaTypes.APPLICATION_OCTET_STREAM),
        };
        // SEC-2: never let a browser MIME-sniff a static payload. The
        // resolver's constant is the canonical `name: value` line; split it
        // once so the header key stays in lockstep with its value.
        const [nosniffName, nosniffValue] = NOSNIFF_HEADER.split(/:\s*/, 2) as [string, string];
        successHeaders[nosniffName] = nosniffValue;
        // `undefined` → default; `null` → opt out of the header entirely.
        const cacheControl =
            this.#options.cacheControl === undefined ? DEFAULT_CACHE_CONTROL : this.#options.cacheControl;
        if (cacheControl !== null) {
            successHeaders[CACHE_CONTROL.name] = cacheControl;
        }
        if (result.variantAware) {
            successHeaders[VARY.name] = 'Accept-Encoding';
        }
        if (spaFallbackServed) {
            // Extend (never overwrite) any existing Vary value so the shared
            // cache keys the fallback on both variant dimensions.
            successHeaders[VARY.name] =
                successHeaders[VARY.name] === undefined ? 'Accept' : `${successHeaders[VARY.name]}, Accept`;
        }
        if (etag) {
            successHeaders[ETAG.name] = etag;
        }
        if (result.mtimeMs !== undefined) {
            successHeaders[LAST_MODIFIED.name] = toHttpDate(result.mtimeMs);
        }
        if (result.encoding) {
            successHeaders[CONTENT_ENCODING.name] = result.encoding;
        }
        if (fileBacked) {
            successHeaders[ACCEPT_RANGES.name] = 'bytes';
        }

        // Conditional GET — answered from stat metadata only, the file is
        // never opened for a 304 (SEC-8).
        if (etag && isNotModified(headers, result)) {
            this.#send(res, 304, successHeaders, undefined);
            return;
        }

        const rangeHeader = RANGE.get(headers);
        // COR-20: a stale If-Range validator cancels the range entirely (full
        // 200), per RFC 7233 §3.2.
        if (fileBacked && rangeHeader !== null && ifRangeMatches(headers, result) !== false) {
            const range = parseSingleRange(rangeHeader, result.size ?? 0);
            if (range === 'unsatisfiable') {
                this.#send(
                    res,
                    416,
                    { ...successHeaders, [CONTENT_RANGE.name]: `bytes */${result.size ?? 0}` },
                    undefined
                );
                return;
            }
            if (range !== null && result.path !== undefined) {
                // Seeked stream over exactly the requested bytes (SEC-8).
                successHeaders[CONTENT_RANGE.name] = `bytes ${range.start}-${range.end}/${result.size ?? 0}`;
                const length = range.end - range.start + 1;
                await this.#sendFile(
                    res,
                    206,
                    { ...successHeaders, [CONTENT_LENGTH.name]: String(length) },
                    result.path,
                    { start: range.start, end: range.end },
                    method === 'HEAD'
                );
                return;
            }
        }

        if (fileBacked && result.path !== undefined) {
            // Full representation: stat-derived Content-Length, streamed body.
            await this.#sendFile(
                res,
                200,
                { ...successHeaders, [CONTENT_LENGTH.name]: String(result.size ?? 0) },
                result.path,
                undefined,
                method === 'HEAD'
            );
            return;
        }

        // Generated payload (directory listing): in-memory by construction.
        this.#send(
            res,
            200,
            { ...successHeaders, [CONTENT_LENGTH.name]: String(result.data?.length ?? 0) },
            method === 'HEAD' ? undefined : result.data
        );
    }

    /**
     * Streams a resolved file with a stat-derived `Content-Length`, or a
     * seeked byte range (SEC-8). HEAD never opens the file — same headers,
     * no body. Backpressure is honored; a stream failure after the headers
     * were sent (file vanished/chmod'ed between stat and open) aborts the
     * response.
     */
    async #sendFile(
        res: ServerResponse,
        status: number,
        headers: Record<string, string>,
        path: string,
        range: { start: number; end: number } | undefined,
        isHead: boolean
    ): Promise<void> {
        if (isHead) {
            this.#send(res, status, headers, undefined);
            return;
        }
        res.writeHead(status, headers);
        const stream = createReadStream(path, range);
        try {
            for await (const chunk of stream) {
                if (res.destroyed) {
                    return;
                }
                if (!res.write(chunk)) {
                    // The client is saturated — wait for it to drain, or for
                    // it to abort (PLN-F2), before pushing the next chunk.
                    const drained = await waitForDrainOrClose(res);
                    if (!drained || res.destroyed) {
                        return;
                    }
                }
            }
            res.end();
        } catch (error) {
            void error;
            res.destroy();
        } finally {
            // Always release the fd: the loop can exit early on abort, and the
            // response destroy path must never keep the read stream open.
            stream.destroy();
        }
    }

    #send(
        res: ServerResponse,
        status: number,
        headers: Record<string, string>,
        body: Buffer | string | undefined
    ): void {
        if (body instanceof Buffer) {
            res.writeHead(status, headers);
            res.end(body);
        } else if (typeof body === 'string' && body !== '') {
            res.writeHead(status, headers);
            res.end(body);
        } else {
            res.writeHead(status, headers);
            res.end();
        }
    }

    #sendProblem(res: ServerResponse, route: Route, status: number, title: string, type: string): void {
        writeProblem(res, { type, title, status, instance: route.path });
    }
}

/**
 * The representations the SPA fallback can serve.
 */
const SPA_FALLBACK_TYPES = [MediaTypes.TEXT_HTML, MediaTypes.APPLICATION_XHTML_XML];

/** True when the client accepts HTML (SPA fallback gate, D-6). */
function acceptsHtml(accept: string | string[] | undefined): boolean {
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
